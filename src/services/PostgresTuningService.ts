import {
  SystemResources,
  DatabaseLoad,
  PostgresConfig,
  PerformanceMetrics,
  Recommendation
} from '../types/postgresql.types';

export class PostgresTuningService {
  private calculateSharedBuffers(ram: number): number {
    // PostgreSQL recommendation: 25% of RAM for dedicated database servers
    return Math.floor(ram * 1024 * 0.25); // Convert GB to MB and take 25%
  }

  private calculateEffectiveCacheSize(ram: number): number {
    // PostgreSQL recommendation: 50-75% of RAM
    return Math.floor(ram * 1024 * 0.75); // Convert GB to MB and take 75%
  }

  private calculateWorkMem(ram: number, maxConnections: number): number {
    // Available RAM after shared buffers divided by max connections
    const availableRam = ram * 1024 * 0.75; // 75% of RAM in MB
    return Math.floor(availableRam / maxConnections);
  }

  private calculateWalBuffers(shared_buffers: number): number {
    // WAL buffers should be about 3% of shared_buffers
    return Math.min(Math.floor(shared_buffers * 0.03), 16); // Max 16MB is typically enough
  }

  private calculateWalSettings(load: DatabaseLoad, resources: SystemResources): Partial<PostgresConfig> {
    const writeIntensiveWorkload = load.writePercentage > 60;
    const highThroughput = load.queriesPerSecond > 1000;
    
    return {
      wal_level: load.queriesPerSecond > 5000 ? 'logical' : 'replica',
      wal_compression: writeIntensiveWorkload || resources.walDrive.type === 'HDD',
      wal_writer_delay: writeIntensiveWorkload ? 2000 : 10000, // Lower for write-heavy workloads
      synchronous_commit: load.queriesPerSecond > 10000 ? 'off' : 'on',
      max_wal_size: Math.floor(resources.walDrive.capacity * 0.1 * 1024), // 10% of WAL drive
      min_wal_size: Math.floor(resources.walDrive.capacity * 0.02 * 1024), // 2% of WAL drive
    };
  }

  private calculateCheckpointSettings(load: DatabaseLoad): Partial<PostgresConfig> {
    const writeIntensiveWorkload = load.writePercentage > 60;
    
    return {
      checkpoint_timeout: writeIntensiveWorkload ? 900 : 300, // 15 min for write-heavy, 5 min default
      checkpoint_completion_target: writeIntensiveWorkload ? 0.9 : 0.7,
    };
  }

  public calculatePostgresConfig(
    resources: SystemResources,
    load: DatabaseLoad
  ): PostgresConfig {
    const shared_buffers = this.calculateSharedBuffers(resources.ram);
    const max_connections = Math.min(200, Math.ceil(load.queriesPerSecond / 2));
    const walSettings = this.calculateWalSettings(load, resources);
    const checkpointSettings = this.calculateCheckpointSettings(load);

    return {
      // Memory Configuration
      shared_buffers,
      effective_cache_size: this.calculateEffectiveCacheSize(resources.ram),
      maintenance_work_mem: Math.min(resources.ram * 1024 * 0.05, 2048), // 5% of RAM, max 2GB
      work_mem: this.calculateWorkMem(resources.ram, max_connections),
      
      // Connection Settings
      max_connections,
      
      // WAL Configuration
      wal_buffers: this.calculateWalBuffers(shared_buffers),
      ...walSettings,
      
      // Checkpoint Settings
      ...checkpointSettings,
      
      // Replication Settings
      max_wal_senders: Math.ceil(max_connections * 0.1), // 10% of max_connections
      max_replication_slots: 10,
      hot_standby: true,
      hot_standby_feedback: load.queriesPerSecond > 5000,
      
      // Archive Settings
      archive_mode: resources.archiveDrive.capacity > 0,
      
      // Connection Pooling
      pgbouncerEnabled: load.queriesPerSecond > 1000
    } as PostgresConfig;
  }

  public getRecommendations(
    resources: SystemResources,
    load: DatabaseLoad,
    currentConfig: PostgresConfig
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const optimalConfig = this.calculatePostgresConfig(resources, load);

    // Memory recommendations
    if (currentConfig.shared_buffers < optimalConfig.shared_buffers) {
      recommendations.push({
        parameter: 'shared_buffers',
        currentValue: `${currentConfig.shared_buffers}MB`,
        recommendedValue: `${optimalConfig.shared_buffers}MB`,
        explanation: 'Увеличение shared_buffers улучшит производительность за счет кэширования часто используемых данных в памяти.',
        impact: 'high',
        category: 'memory'
      });
    }

    // WAL recommendations
    if (load.writePercentage > 70 && !currentConfig.wal_compression) {
      recommendations.push({
        parameter: 'wal_compression',
        currentValue: 'off',
        recommendedValue: 'on',
        explanation: 'Включение сжатия WAL уменьшит нагрузку на диск при большом количестве операций записи.',
        impact: 'medium',
        category: 'wal'
      });
    }

    if (load.queriesPerSecond > 5000 && currentConfig.synchronous_commit === 'on') {
      recommendations.push({
        parameter: 'synchronous_commit',
        currentValue: 'on',
        recommendedValue: 'off',
        explanation: 'При высокой нагрузке отключение synchronous_commit может значительно увеличить производительность, но с риском потери последних транзакций при сбое.',
        impact: 'high',
        category: 'wal'
      });
    }

    // Checkpoint recommendations
    if (load.writePercentage > 60 && currentConfig.checkpoint_completion_target < 0.9) {
      recommendations.push({
        parameter: 'checkpoint_completion_target',
        currentValue: currentConfig.checkpoint_completion_target,
        recommendedValue: 0.9,
        explanation: 'Увеличение времени на выполнение checkpoint уменьшит пиковую нагрузку на диск.',
        impact: 'medium',
        category: 'checkpoints'
      });
    }

    // Connection pooling recommendations
    if (load.queriesPerSecond > 1000 && !currentConfig.pgbouncerEnabled) {
      recommendations.push({
        parameter: 'pgbouncer',
        currentValue: 'disabled',
        recommendedValue: 'enabled',
        explanation: 'При большом количестве подключений PgBouncer поможет эффективно управлять пулом соединений.',
        impact: 'high',
        category: 'connections'
      });
    }

    return recommendations;
  }

  public calculatePerformanceMetrics(
    resources: SystemResources,
    load: DatabaseLoad,
    config: PostgresConfig
  ): PerformanceMetrics {
    const cacheHitRatio = Math.min(
      95,
      (config.shared_buffers / (resources.ram * 1024)) * 100 + 
      (config.effective_cache_size / (resources.ram * 1024)) * 100
    );

    const throughput = Math.min(
      load.queriesPerSecond,
      config.max_connections * 10 * (resources.cpu.cores / 2)
    );

    const checkpointWrittenBytes = (load.writePercentage / 100) * load.queriesPerSecond * 
      load.avgTransactionSize * (config.checkpoint_timeout / 60);

    return {
      throughput,
      latency: Math.max(1, (load.queriesPerSecond / throughput) * 10),
      iops: Math.min(resources.ssd.iops, load.queriesPerSecond * (load.writePercentage / 100)),
      cacheHitRatio,
      walGenerationRate: (load.queriesPerSecond * load.writePercentage / 100) * 0.1,
      checkpointStats: {
        frequency: config.checkpoint_timeout,
        duration: config.checkpoint_timeout * config.checkpoint_completion_target,
        writtenBytes: checkpointWrittenBytes
      },
      replicationLag: config.synchronous_commit === 'on' ? 0 : Math.random() * 100
    };
  }
} 