/**
 * Характеристики вашего сервера
 * Эти параметры помогут рассчитать оптимальные настройки PostgreSQL для вашего оборудования
 */
export interface SystemResources {
  /** Объем оперативной памяти сервера в ГБ. Влияет на скорость работы с данными и кэширование */
  ram: number; // in GB
  cpu: {
    /** Количество ядер процессора. Больше ядер = больше параллельных запросов */
    cores: number;
    /** Частота процессора в ГГц. Влияет на скорость обработки запросов */
    speed: number; // in GHz
  };
  ssd: {
    /** Размер накопителя в ГБ. Важно для расчета места под данные и WAL */
    capacity: number; // in GB
    /** Количество операций ввода-вывода в секунду. Важно для оценки производительности диска */
    iops: number;
  };
  walDrive: {
    /** Тип накопителя для журнала WAL. NVMe самый быстрый, SSD средний, HDD медленный */
    type: 'SSD' | 'NVMe' | 'HDD';
    /** Размер накопителя для WAL в ГБ. Влияет на объем журналов и скорость восстановления */
    capacity: number; // in GB
  };
  archiveDrive: {
    /** Тип накопителя для архивов WAL */
    type: 'SSD' | 'NVMe' | 'HDD';
    /** Размер накопителя для архивов в ГБ. Важно для долгосрочного хранения и восстановления */
    capacity: number; // in GB
  };
}

/**
 * Характеристики нагрузки на базу данных
 * Эти метрики помогают настроить PostgreSQL под ваши задачи
 */
export interface DatabaseLoad {
  /** Количество запросов в секунду. Показывает реальную нагрузку на базу */
  queriesPerSecond: number;
  /** Количество одновременных подключений. Влияет на потребление памяти */
  activeConnections: number;
  /** Процент операций записи (0-100). Высокие значения требуют оптимизации WAL */
  writePercentage: number;
  /** Процент операций чтения (0-100). Высокие значения требуют оптимизации кэширования */
  readPercentage: number;
  /** Средний размер транзакции в КБ. Влияет на настройки WAL и контрольных точек */
  avgTransactionSize: number;
}

/**
 * Параметры конфигурации PostgreSQL
 * Каждый раздел содержит связанные настройки для оптимизации производительности
 */
export interface PostgresConfig {
  // Настройки памяти
  /** 
   * Размер общего буфера в МБ
   * Рекомендация: 25% от RAM
   * Пример: shared_buffers = 4GB
   * Влияние: Скорость доступа к часто используемым данным
   */
  shared_buffers: number;
  
  /** 
   * Оценка размера кэша ОС в МБ
   * Рекомендация: 50-75% от RAM
   * Пример: effective_cache_size = 12GB
   * Влияние: Помогает планировщику выбирать эффективные планы запросов
   */
  effective_cache_size: number;
  
  /** 
   * Память для обслуживания БД в МБ
   * Рекомендация: 5% от RAM
   * Пример: maintenance_work_mem = 1GB
   * Влияние: Скорость VACUUM и создания индексов
   */
  maintenance_work_mem: number;
  
  /** 
   * Память для обработки запросов в МБ
   * Рекомендация: (RAM * 0.25) / max_connections
   * Пример: work_mem = 64MB
   * Влияние: Скорость сортировки и хэширования
   */
  work_mem: number;
  
  // Настройки подключений
  /** 
   * Максимум одновременных подключений
   * Рекомендация: Используйте пулер при значениях >100
   * Пример: max_connections = 100
   * Влияние: Потребление памяти и стабильность
   */
  max_connections: number;
  
  // Настройки WAL (журнала предзаписи)
  /** 
   * Уровень детализации WAL
   * minimal - минимум данных
   * replica - для репликации
   * logical - для логической репликации
   */
  wal_level: 'minimal' | 'replica' | 'logical';
  
  /** 
   * Размер буфера WAL в МБ
   * Рекомендация: 16MB или 3% от shared_buffers
   * Пример: wal_buffers = 16MB
   * Влияние: Скорость записи в WAL
   */
  wal_buffers: number;
  
  /** 
   * Режим подтверждения транзакций
   * on - максимальная надежность
   * off - максимальная производительность
   * Влияние: Баланс между скоростью и надежностью
   */
  synchronous_commit: 'on' | 'remote_apply' | 'remote_write' | 'local' | 'off';
  
  /** 
   * Сжатие WAL файлов
   * Рекомендация: включить при большом объеме записи
   * Влияние: Экономия места за счет процессора
   */
  wal_compression: boolean;
  
  /** 
   * Задержка записи WAL в миллисекундах
   * Пример: wal_writer_delay = 200ms
   * Влияние: Группировка записей в WAL
   */
  wal_writer_delay: number;
  
  /** 
   * Максимальный размер WAL в МБ
   * Рекомендация: 1GB или больше
   * Влияние: Частота контрольных точек
   */
  max_wal_size: number;
  
  /** 
   * Минимальный размер WAL в МБ
   * Рекомендация: 80MB или больше
   * Влияние: Повторное использование WAL файлов
   */
  min_wal_size: number;
  
  // Настройки контрольных точек
  /** 
   * Максимальное время между контрольными точками в секундах
   * Рекомендация: 5 минут (300 секунд)
   * Влияние: Время восстановления и нагрузка на диск
   */
  checkpoint_timeout: number;
  
  /** 
   * Растягивание контрольной точки
   * Рекомендация: 0.9 для равномерной нагрузки
   * Влияние: Распределение нагрузки на диск
   */
  checkpoint_completion_target: number;
  
  // Настройки репликации
  /** 
   * Максимум процессов отправки WAL
   * Рекомендация: число реплик + запас
   * Влияние: Поддержка репликации
   */
  max_wal_senders: number;
  
  /** 
   * Максимум слотов репликации
   * Рекомендация: число реплик + запас
   * Влияние: Управление репликацией
   */
  max_replication_slots: number;
  
  /** 
   * Разрешить запросы на реплике
   * Рекомендация: включить для чтения с реплик
   * Влияние: Возможность чтения с реплик
   */
  hot_standby: boolean;
  
  /** 
   * Обратная связь от реплик
   * Рекомендация: включить при активном чтении с реплик
   * Влияние: Уменьшение конфликтов на репликах
   */
  hot_standby_feedback: boolean;
  
  // Настройки архивирования
  /** 
   * Режим архивирования WAL
   * Рекомендация: включить для точечного восстановления
   * Влияние: Возможности восстановления
   */
  archive_mode: boolean;
  
  /** 
   * Использование пула соединений PgBouncer
   * Рекомендация: включить при большом числе подключений
   * Влияние: Эффективность работы с соединениями
   */
  pgbouncerEnabled: boolean;
}

/**
 * Настройки репликации
 * Управление репликацией и высокой доступностью
 */
export interface ReplicationConfig {
  /** Включена ли репликация */
  enabled: boolean;
  /** Количество реплик */
  numberOfReplicas: number;
  /** Режим репликации: синхронный (надежнее) или асинхронный (быстрее) */
  replicationMode: 'synchronous' | 'asynchronous';
  /** Включено ли архивирование WAL */
  archiveMode: boolean;
  /** Используется ли отдельный диск для WAL */
  separateWalDrive: boolean;
}

/**
 * Метрики производительности PostgreSQL
 * Эти показатели помогают понять, насколько эффективно работает база данных
 */
export interface PerformanceMetrics {
  /** 
   * Количество обработанных запросов в секунду
   * Чем больше, тем лучше производительность
   * График: "Пропускная способность (запросов/сек)"
   */
  throughput: number;
  
  /** 
   * Среднее время ответа в миллисекундах
   * Чем меньше, тем быстрее работает база
   * График: "Задержка (мс)"
   */
  latency: number;
  
  /** 
   * Операций ввода-вывода в секунду
   * Показывает нагрузку на диски
   * График: "Операций ввода-вывода/сек"
   */
  iops: number;
  
  /** 
   * Процент попаданий в кэш
   * >95% - отлично, <80% - нужна оптимизация
   * График: "Попадания в кэш (%)"
   */
  cacheHitRatio: number;
  
  /** 
   * Скорость генерации WAL в МБ/с
   * Показывает интенсивность записи
   * График: "Генерация WAL (МБ/с)"
   */
  walGenerationRate: number;
  
  /** Статистика контрольных точек */
  checkpointStats: {
    /** Время между контрольными точками в секундах */
    frequency: number;
    /** Длительность контрольной точки в секундах */
    duration: number;
    /** Объем записанных данных в МБ */
    writtenBytes: number;
  };
  
  /** 
   * Отставание репликации в секундах
   * Чем меньше, тем актуальнее данные на репликах
   * График: "Отставание репликации (сек)"
   */
  replicationLag: number;
}

/**
 * Рекомендации по настройке
 * Советы по улучшению производительности базы данных
 */
export interface Recommendation {
  /** Параметр, который нужно изменить */
  parameter: string;
  /** Текущее значение */
  currentValue: string | number;
  /** Рекомендуемое значение */
  recommendedValue: string | number;
  /** Почему нужно изменить */
  explanation: string;
  /** Важность изменения: high - критично, medium - важно, low - желательно */
  impact: 'high' | 'medium' | 'low';
  /** Категория настройки */
  category: 'memory' | 'wal' | 'replication' | 'connections' | 'checkpoints';
}

/**
 * Описания и подсказки для элементов интерфейса
 */
export interface UIHelpers {
  resourcesSection: {
    title: string;
    description: string;
    ram: {
      label: string;
      tooltip: string;
      hint: string;
    };
    cpu: {
      label: string;
      tooltip: string;
      coresHint: string;
      speedHint: string;
    };
    storage: {
      label: string;
      tooltip: string;
      capacityHint: string;
      iopsHint: string;
      typeHint: string;
    };
  };

  loadSection: {
    title: string;
    description: string;
    qps: {
      label: string;
      tooltip: string;
      hint: string;
    };
    connections: {
      label: string;
      tooltip: string;
      hint: string;
    };
    writeRead: {
      label: string;
      tooltip: string;
      hint: string;
    };
  };

  configSection: {
    title: string;
    description: string;
    memory: {
      label: string;
      tooltip: string;
      sharedBuffersHint: string;
      effectiveCacheHint: string;
      workMemHint: string;
      maintenanceMemHint: string;
    };
    wal: {
      label: string;
      tooltip: string;
      levelHint: string;
      compressionHint: string;
      syncCommitHint: string;
    };
    checkpoints: {
      label: string;
      tooltip: string;
      timeoutHint: string;
      completionTargetHint: string;
    };
    replication: {
      label: string;
      tooltip: string;
      sendersHint: string;
      slotsHint: string;
      standbyHint: string;
    };
  };

  metricsSection: {
    title: string;
    description: string;
    graphs: {
      throughput: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
      latency: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
      cacheHit: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
      walGeneration: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
      iops: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
      replicationLag: {
        title: string;
        description: string;
        yAxisLabel: string;
        tooltip: string;
        goodValue: string;
        warningValue: string;
      };
    };
  };

  recommendationsSection: {
    title: string;
    description: string;
    impactLevels: {
      high: string;
      medium: string;
      low: string;
    };
    categories: {
      memory: string;
      wal: string;
      replication: string;
      connections: string;
      checkpoints: string;
    };
  };
}

export const uiHelpers: UIHelpers = {
  resourcesSection: {
    title: "Ресурсы сервера",
    description: "Укажите характеристики вашего сервера для расчета оптимальных настроек",
    ram: {
      label: "Оперативная память (ГБ)",
      tooltip: "Общий объем оперативной памяти сервера",
      hint: "Больше памяти позволяет кэшировать больше данных и ускорить запросы"
    },
    cpu: {
      label: "Процессор",
      tooltip: "Характеристики процессора влияют на скорость обработки запросов",
      coresHint: "Больше ядер = больше параллельных запросов",
      speedHint: "Высокая частота ускоряет сложные вычисления"
    },
    storage: {
      label: "Хранилище",
      tooltip: "Характеристики дисковой подсистемы",
      capacityHint: "Объем должен учитывать рост данных и WAL",
      iopsHint: "Больше IOPS = быстрее операции с диском",
      typeHint: "NVMe > SSD > HDD по производительности"
    }
  },

  loadSection: {
    title: "Профиль нагрузки",
    description: "Опишите типичную нагрузку на базу данных",
    qps: {
      label: "Запросов в секунду",
      tooltip: "Среднее количество запросов к базе в секунду",
      hint: "Влияет на требования к CPU и памяти"
    },
    connections: {
      label: "Подключения",
      tooltip: "Количество одновременных подключений к базе",
      hint: "При большом количестве рекомендуется использовать пул соединений"
    },
    writeRead: {
      label: "Соотношение запись/чтение",
      tooltip: "Распределение операций записи и чтения",
      hint: "Влияет на настройки WAL и кэширования"
    }
  },

  configSection: {
    title: "Настройки PostgreSQL",
    description: "Параметры конфигурации для оптимальной производительности",
    memory: {
      label: "Память",
      tooltip: "Настройки использования оперативной памяти",
      sharedBuffersHint: "Рекомендуется 25% от RAM для кэширования данных",
      effectiveCacheHint: "50-75% RAM для оценки доступной памяти",
      workMemHint: "Память для сортировки и хэширования",
      maintenanceMemHint: "Память для обслуживания (VACUUM, индексы)"
    },
    wal: {
      label: "Журнал WAL",
      tooltip: "Настройки журнала предзаписи",
      levelHint: "Уровень детализации журнала",
      compressionHint: "Сжатие экономит место, но нагружает CPU",
      syncCommitHint: "Баланс между надежностью и скоростью"
    },
    checkpoints: {
      label: "Контрольные точки",
      tooltip: "Настройки записи изменений на диск",
      timeoutHint: "Частота записи изменений на диск",
      completionTargetHint: "Распределение нагрузки на диск"
    },
    replication: {
      label: "Репликация",
      tooltip: "Настройки репликации данных",
      sendersHint: "Количество процессов отправки WAL",
      slotsHint: "Слоты для подключения реплик",
      standbyHint: "Чтение с реплик во время восстановления"
    }
  },

  metricsSection: {
    title: "Метрики производительности",
    description: "Показатели работы базы данных в реальном времени",
    graphs: {
      throughput: {
        title: "Пропускная способность",
        description: "Количество обработанных запросов в секунду",
        yAxisLabel: "Запросов/сек",
        tooltip: "Больше значение = выше производительность",
        goodValue: "Стабильное значение без резких падений",
        warningValue: "Резкие падения или постоянный рост очереди"
      },
      latency: {
        title: "Задержка",
        description: "Среднее время выполнения запросов",
        yAxisLabel: "Миллисекунды",
        tooltip: "Меньше значение = быстрее ответы",
        goodValue: "< 100мс для OLTP, < 1с для OLAP",
        warningValue: "Рост задержки или большой разброс значений"
      },
      cacheHit: {
        title: "Попадания в кэш",
        description: "Процент данных, найденных в памяти",
        yAxisLabel: "Процент",
        tooltip: "Выше значение = меньше чтений с диска",
        goodValue: "> 95% для OLTP баз",
        warningValue: "< 80% требует увеличения shared_buffers"
      },
      walGeneration: {
        title: "Генерация WAL",
        description: "Скорость записи в журнал WAL",
        yAxisLabel: "МБ/сек",
        tooltip: "Показывает нагрузку на подсистему WAL",
        goodValue: "Стабильное значение без резких скачков",
        warningValue: "Постоянный рост или резкие скачки"
      },
      iops: {
        title: "Операции ввода-вывода",
        description: "Количество операций с диском",
        yAxisLabel: "IOPS",
        tooltip: "Показывает нагрузку на диски",
        goodValue: "В пределах возможностей вашего хранилища",
        warningValue: "Близко к максимуму IOPS дисков"
      },
      replicationLag: {
        title: "Отставание репликации",
        description: "Задержка применения изменений на репликах",
        yAxisLabel: "Секунды",
        tooltip: "Меньше значение = актуальнее данные на репликах",
        goodValue: "< 1 секунды для синхронной репликации",
        warningValue: "> 10 секунд или постоянный рост"
      }
    }
  },

  recommendationsSection: {
    title: "Рекомендации по оптимизации",
    description: "Советы по улучшению производительности базы данных",
    impactLevels: {
      high: "Критичные изменения, требуют немедленного внимания",
      medium: "Важные изменения для оптимизации производительности",
      low: "Рекомендации по тонкой настройке"
    },
    categories: {
      memory: "Настройки памяти",
      wal: "Настройки WAL",
      replication: "Настройки репликации",
      connections: "Управление подключениями",
      checkpoints: "Контрольные точки"
    }
  }
};

/**
 * Описание метрик производительности и их взаимосвязей
 */
export interface MetricsGuide {
  metrics: {
    throughput: {
      name: string;
      description: string;
      unit: string;
      axis: {
        x: string;
        y: string;
        min: number;
        max: number | 'dynamic';
      };
      targets: {
        optimal: string;
        acceptable: string;
        warning: string;
        critical: string;
      };
      impactedBy: string[];
      impacts: string[];
    };
    latency: {
      name: string;
      description: string;
      unit: string;
      axis: {
        x: string;
        y: string;
        min: number;
        max: number | 'dynamic';
      };
      targets: {
        optimal: string;
        acceptable: string;
        warning: string;
        critical: string;
      };
      impactedBy: string[];
      impacts: string[];
    };
    cacheHitRatio: {
      name: string;
      description: string;
      unit: string;
      axis: {
        x: string;
        y: string;
        min: number;
        max: number;
      };
      targets: {
        optimal: string;
        acceptable: string;
        warning: string;
        critical: string;
      };
      impactedBy: string[];
      impacts: string[];
    };
    walGenerationRate: {
      name: string;
      description: string;
      unit: string;
      axis: {
        x: string;
        y: string;
        min: number;
        max: number | 'dynamic';
      };
      targets: {
        optimal: string;
        acceptable: string;
        warning: string;
        critical: string;
      };
      impactedBy: string[];
      impacts: string[];
    };
  };
  relationships: {
    throughputLatency: string;
    throughputWAL: string;
    cacheLatency: string;
    walLatency: string;
  };
}

export const metricsGuide: MetricsGuide = {
  metrics: {
    throughput: {
      name: "Пропускная способность",
      description: "Количество запросов, которое база данных может обработать в секунду. Это ключевой показатель производительности системы.",
      unit: "запросов/сек",
      axis: {
        x: "Время",
        y: "Запросов в секунду (QPS)",
        min: 0,
        max: 'dynamic'
      },
      targets: {
        optimal: "> 1000 QPS для OLTP с быстрым откликом",
        acceptable: "500-1000 QPS для смешанной нагрузки",
        warning: "< 500 QPS при высокой нагрузке",
        critical: "Падение QPS более чем на 50% от нормы"
      },
      impactedBy: [
        "Количество подключений",
        "Размер shared_buffers",
        "work_mem",
        "effective_cache_size",
        "Мощность CPU"
      ],
      impacts: [
        "Общая производительность системы",
        "Время отклика",
        "Нагрузка на CPU"
      ]
    },
    latency: {
      name: "Задержка",
      description: "Время выполнения запросов. Низкая задержка критична для интерактивных приложений.",
      unit: "миллисекунды",
      axis: {
        x: "Время",
        y: "Задержка (мс)",
        min: 0,
        max: 'dynamic'
      },
      targets: {
        optimal: "< 10мс для простых OLTP запросов",
        acceptable: "10-100мс для сложных OLTP запросов",
        warning: "100-1000мс требует внимания",
        critical: "> 1000мс требует немедленных действий"
      },
      impactedBy: [
        "Cache Hit Ratio",
        "WAL Generation Rate",
        "IOPS дисков",
        "Размер shared_buffers",
        "work_mem"
      ],
      impacts: [
        "Отзывчивость приложения",
        "Пропускная способность",
        "Количество одновременных запросов"
      ]
    },
    cacheHitRatio: {
      name: "Попадания в кэш",
      description: "Процент данных, найденных в памяти (shared_buffers + OS cache) вместо чтения с диска.",
      unit: "процент",
      axis: {
        x: "Время",
        y: "Процент попаданий",
        min: 0,
        max: 100
      },
      targets: {
        optimal: "> 99% для OLTP баз",
        acceptable: "95-99% для смешанных нагрузок",
        warning: "90-95% требует оптимизации",
        critical: "< 90% требует немедленного увеличения памяти"
      },
      impactedBy: [
        "shared_buffers",
        "effective_cache_size",
        "Объем RAM",
        "Паттерны запросов"
      ],
      impacts: [
        "Задержка запросов",
        "Нагрузка на диски",
        "Общая производительность"
      ]
    },
    walGenerationRate: {
      name: "Генерация WAL",
      description: "Скорость записи в журнал предзаписи. Показывает интенсивность изменений в базе.",
      unit: "МБ/сек",
      axis: {
        x: "Время",
        y: "МБ в секунду",
        min: 0,
        max: 'dynamic'
      },
      targets: {
        optimal: "< 10 МБ/с для типичной OLTP",
        acceptable: "10-50 МБ/с для активной записи",
        warning: "50-100 МБ/с требует мониторинга",
        critical: "> 100 МБ/с требует оптимизации"
      },
      impactedBy: [
        "Интенсивность INSERT/UPDATE",
        "wal_compression",
        "synchronous_commit",
        "Размер транзакций"
      ],
      impacts: [
        "Нагрузка на диск WAL",
        "Задержка записи",
        "Время восстановления"
      ]
    }
  },
  relationships: {
    throughputLatency: "При росте throughput обычно растет latency. Цель - найти оптимальный баланс между высокой пропускной способностью и приемлемой задержкой. Увеличение shared_buffers и effective_cache_size может помочь удерживать latency низкой при высоком throughput.",
    
    throughputWAL: "Рост throughput часто ведет к увеличению WAL generation rate. Если WAL становится узким местом, рассмотрите включение wal_compression или настройку synchronous_commit.",
    
    cacheLatency: "Высокий cache hit ratio критичен для низкой latency. При cache hit ratio < 95%, latency обычно растет экспоненциально из-за операций чтения с диска. Увеличение shared_buffers может улучшить оба показателя.",
    
    walLatency: "Высокий WAL generation rate может увеличивать latency, особенно при synchronous_commit = on. Баланс между надежностью (synchronous_commit) и производительностью (latency) зависит от требований приложения."
  }
};

/**
 * Расширенные метрики для опытных DBA
 */
export interface AdvancedMetrics {
  deadTuples: {
    name: string;
    description: string;
    unit: string;
    axis: {
      x: string;
      y: string;
      min: number;
      max: number | 'dynamic';
    };
    targets: {
      optimal: string;
      warning: string;
    };
    relatedQueries: string[];
    recommendations: string[];
  };
  
  indexBloat: {
    name: string;
    description: string;
    unit: string;
    axis: {
      x: string;
      y: string;
      min: number;
      max: number;
    };
    targets: {
      optimal: string;
      warning: string;
    };
    relatedQueries: string[];
    recommendations: string[];
  };
  
  bufferUsage: {
    name: string;
    description: string;
    components: {
      dirty: {
        description: string;
        optimal: string;
      };
      clean: {
        description: string;
        optimal: string;
      };
      free: {
        description: string;
        optimal: string;
      };
    };
    relatedQueries: string[];
    recommendations: string[];
  };
  
  transactionWraparound: {
    name: string;
    description: string;
    warning: string;
    critical: string;
    recommendations: string[];
  };

  connectionStates: {
    name: string;
    states: {
      active: string;
      idle: string;
      idleInTransaction: string;
      idleInTransactionAborted: string;
    };
    warnings: {
      idleInTransaction: string;
      tooManyConnections: string;
    };
  };

  vacuumProgress: {
    name: string;
    description: string;
    metrics: {
      lastAutoVacuum: string;
      tablesNeedingVacuum: string;
      deadTupleRatio: string;
    };
    recommendations: string[];
  };

  replicationMetrics: {
    name: string;
    metrics: {
      replicationDelay: string;
      walSenderState: string;
      walReceiverState: string;
      replicationSlots: string;
    };
    warnings: {
      slotLag: string;
      walDelay: string;
    };
  };
}

export const advancedMetrics: AdvancedMetrics = {
  deadTuples: {
    name: "Мёртвые строки",
    description: "Процент неактуальных версий строк в таблицах. Влияет на производительность и размер БД.",
    unit: "процент",
    axis: {
      x: "Время",
      y: "% мёртвых строк",
      min: 0,
      max: 100
    },
    targets: {
      optimal: "< 10% для активных таблиц",
      warning: "> 20% требует внимания"
    },
    relatedQueries: [
      "SELECT schemaname, relname, n_dead_tup, n_live_tup, (n_dead_tup::float / (n_live_tup + n_dead_tup)::float) * 100 as dead_tup_ratio FROM pg_stat_user_tables ORDER BY n_dead_tup DESC;",
      "SELECT schemaname, relname, last_vacuum, last_autovacuum FROM pg_stat_user_tables;"
    ],
    recommendations: [
      "Настройте autovacuum_vacuum_scale_factor для частоты очистки",
      "Увеличьте maintenance_work_mem для ускорения VACUUM",
      "Мониторьте таблицы с высоким процентом мёртвых строк"
    ]
  },

  indexBloat: {
    name: "Раздутие индексов",
    description: "Процент неиспользуемого пространства в индексах. Влияет на производительность и размер.",
    unit: "процент",
    axis: {
      x: "Время",
      y: "% bloat",
      min: 0,
      max: 100
    },
    targets: {
      optimal: "< 15% для активных индексов",
      warning: "> 30% требует REINDEX"
    },
    relatedQueries: [
      "SELECT schemaname, tablename, indexname, pg_size_pretty(bloat_size) as bloat_size, bloat_ratio FROM pg_stat_user_indexes JOIN pg_index_bloat_info() USING (indexname);",
      "SELECT schemaname, indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
    ],
    recommendations: [
      "Регулярно проводите REINDEX для проблемных индексов",
      "Удаляйте неиспользуемые индексы",
      "Мониторьте индексы с высоким bloat"
    ]
  },

  bufferUsage: {
    name: "Использование буферов",
    description: "Распределение и эффективность использования shared_buffers",
    components: {
      dirty: {
        description: "Буферы с незаписанными изменениями",
        optimal: "< 30% от shared_buffers"
      },
      clean: {
        description: "Буферы с актуальными данными",
        optimal: "~60-70% от shared_buffers"
      },
      free: {
        description: "Свободные буферы",
        optimal: "5-10% от shared_buffers"
      }
    },
    relatedQueries: [
      "SELECT buffers_clean, buffers_backend, buffers_backend_fsync FROM pg_stat_bgwriter;",
      "SELECT pg_size_pretty(pg_current_wal_insert_lsn() - '0/0'::pg_lsn) as total_wal_size;"
    ],
    recommendations: [
      "Настройте bgwriter_delay и bgwriter_lru_maxpages",
      "Мониторьте checkpoint_write_time",
      "Следите за соотношением dirty/clean буферов"
    ]
  },

  transactionWraparound: {
    name: "Wraparound транзакций",
    description: "Мониторинг ID транзакций для предотвращения wraparound",
    warning: "Таблицы с возрастом > 1 миллиард транзакций требуют vacuum",
    critical: "Возраст > 1.5 миллиарда может привести к остановке БД",
    recommendations: [
      "Регулярно мониторьте возраст транзакций",
      "Настройте autovacuum_freeze_max_age",
      "Планируйте vacuum freeze для старых таблиц"
    ]
  },

  connectionStates: {
    name: "Состояния подключений",
    states: {
      active: "Активно выполняет запрос",
      idle: "Ожидает запроса от приложения",
      idleInTransaction: "Транзакция открыта, но запросов нет",
      idleInTransactionAborted: "Транзакция в состоянии ошибки"
    },
    warnings: {
      idleInTransaction: "Долгие idle in transaction блокируют vacuum и потребляют ресурсы",
      tooManyConnections: "Большое количество подключений увеличивает накладные расходы"
    }
  },

  vacuumProgress: {
    name: "Прогресс VACUUM",
    description: "Мониторинг процессов очистки и их эффективности",
    metrics: {
      lastAutoVacuum: "Время последней автоочистки",
      tablesNeedingVacuum: "Таблицы, требующие vacuum",
      deadTupleRatio: "Процент мёртвых строк"
    },
    recommendations: [
      "Настройте autovacuum_vacuum_threshold",
      "Увеличьте autovacuum_max_workers при необходимости",
      "Мониторьте таблицы с отложенной очисткой"
    ]
  },

  replicationMetrics: {
    name: "Метрики репликации",
    metrics: {
      replicationDelay: "Отставание реплики (байты/время)",
      walSenderState: "Состояние процесса отправки WAL",
      walReceiverState: "Состояние получения WAL",
      replicationSlots: "Использование слотов репликации"
    },
    warnings: {
      slotLag: "Большое отставание слота может привести к росту WAL",
      walDelay: "Задержка репликации > 1 минуты требует внимания"
    }
  }
};

/**
 * Подсказки для интерфейса дашборда
 */
export interface DashboardTooltips {
  graphs: {
    [key: string]: {
      title: string;
      description: string;
      interpretation: string;
      troubleshooting: string[];
    };
  };
  settings: {
    [key: string]: {
      title: string;
      description: string;
      bestPractices: string[];
      warnings: string[];
    };
  };
}

export const dashboardTooltips: DashboardTooltips = {
  graphs: {
    performanceOverview: {
      title: "Обзор производительности",
      description: "Комплексный взгляд на ключевые метрики производительности",
      interpretation: "Анализируйте корреляции между метриками для выявления узких мест",
      troubleshooting: [
        "Высокая latency + низкий cache hit → Проблемы с памятью",
        "Высокий WAL rate + высокая latency → Проблемы с диском",
        "Падение throughput + высокая latency → Проблемы с CPU или блокировками"
      ]
    },
    resourceUtilization: {
      title: "Использование ресурсов",
      description: "Мониторинг использования системных ресурсов",
      interpretation: "Помогает выявить ресурсные ограничения",
      troubleshooting: [
        "Высокая утилизация CPU → Проверьте сложные запросы",
        "Высокая утилизация IO → Проверьте настройки WAL и checkpoints",
        "Высокое использование памяти → Проверьте shared_buffers и work_mem"
      ]
    },
    queryPerformance: {
      title: "Производительность запросов",
      description: "Анализ времени выполнения и ресурсоемкости запросов",
      interpretation: "Выявляет проблемные паттерны запросов",
      troubleshooting: [
        "Долгие запросы → Проверьте планы выполнения",
        "Частые запросы → Оптимизируйте индексы",
        "Блокирующие запросы → Проверьте deadlocks и блокировки"
      ]
    }
  },
  settings: {
    memory: {
      title: "Настройки памяти",
      description: "Конфигурация использования оперативной памяти",
      bestPractices: [
        "shared_buffers: 25% RAM для выделенных серверов",
        "effective_cache_size: 50-75% RAM",
        "work_mem: (RAM * 0.25) / max_connections",
        "maintenance_work_mem: 5% RAM до 2GB"
      ],
      warnings: [
        "Слишком большой shared_buffers может замедлить checkpoint",
        "Маленький work_mem приведет к disk sorts",
        "Большой work_mem может вызвать OOM при параллельных запросах"
      ]
    },
    wal: {
      title: "Настройки WAL",
      description: "Конфигурация журнала предзаписи",
      bestPractices: [
        "wal_level: replica для репликации",
        "synchronous_commit: off для максимальной производительности",
        "wal_buffers: 16MB или 3% от shared_buffers",
        "min_wal_size: достаточный для предотвращения частой переработки WAL"
      ],
      warnings: [
        "synchronous_commit=off может привести к потере транзакций при сбое",
        "Большой max_wal_size увеличивает время восстановления",
        "Маленький wal_buffers может влиять на производительность записи"
      ]
    }
  }
};

/**
 * Подробные описания графиков и их показателей
 */
export interface GraphDescriptions {
  graphs: {
    [key: string]: {
      title: string;
      mainDescription: string;
      xAxis: {
        label: string;
        description: string;
        units: string;
      };
      yAxis: {
        label: string;
        description: string;
        units: string;
      };
      metrics: {
        name: string;
        description: string;
        calculation: string;
        normalRanges: {
          optimal: string;
          acceptable: string;
          warning: string;
          critical: string;
        };
        examples: {
          good: string;
          bad: string;
        };
        troubleshooting: string[];
      }[];
      correlations: {
        metric1: string;
        metric2: string;
        relationship: string;
        whatItMeans: string;
      }[];
    };
  };
}

export const graphDescriptions: GraphDescriptions = {
  graphs: {
    throughputAndLatency: {
      title: "Пропускная способность и задержка",
      mainDescription: "График показывает соотношение между количеством обрабатываемых запросов и временем их выполнения. Помогает найти оптимальный баланс производительности.",
      xAxis: {
        label: "Время",
        description: "Временная шкала с интервалом обновления 1 секунда",
        units: "чч:мм:сс"
      },
      yAxis: {
        label: "Запросов в секунду / Миллисекунды",
        description: "Двойная шкала: пропускная способность (QPS) и задержка (мс)",
        units: "QPS / мс"
      },
      metrics: [
        {
          name: "Пропускная способность (throughput)",
          description: "Количество запросов, обрабатываемых базой данных в секунду",
          calculation: "Количество успешных запросов / интервал времени",
          normalRanges: {
            optimal: "> 1000 QPS при latency < 10мс",
            acceptable: "500-1000 QPS при latency < 50мс",
            warning: "< 500 QPS или latency > 100мс",
            critical: "Резкое падение QPS или latency > 1000мс"
          },
          examples: {
            good: "Стабильные 2000 QPS при latency 5мс",
            bad: "Падение с 1000 QPS до 200 QPS при росте latency"
          },
          troubleshooting: [
            "Проверьте CPU utilization",
            "Мониторьте количество активных сессий",
            "Проверьте размер shared_buffers и work_mem"
          ]
        },
        {
          name: "Задержка (latency)",
          description: "Среднее время выполнения запроса",
          calculation: "Сумма времени выполнения / количество запросов",
          normalRanges: {
            optimal: "< 10мс для OLTP",
            acceptable: "10-100мс для смешанной нагрузки",
            warning: "100-1000мс требует внимания",
            critical: "> 1000мс критическая ситуация"
          },
          examples: {
            good: "Стабильная latency 5мс при высоком QPS",
            bad: "Скачки latency до 500мс при нормальном QPS"
          },
          troubleshooting: [
            "Проверьте медленные запросы в pg_stat_activity",
            "Проанализируйте планы выполнения",
            "Проверьте блокировки и deadlocks"
          ]
        }
      ],
      correlations: [
        {
          metric1: "throughput",
          metric2: "latency",
          relationship: "Обратная корреляция",
          whatItMeans: "Рост throughput обычно ведет к увеличению latency. Цель - найти оптимальный баланс."
        }
      ]
    },

    cacheAndBuffers: {
      title: "Кэширование и буферы",
      mainDescription: "График показывает эффективность использования памяти и кэширования данных. Помогает оптимизировать настройки памяти.",
      xAxis: {
        label: "Время",
        description: "Временная шкала с интервалом обновления 1 секунда",
        units: "чч:мм:сс"
      },
      yAxis: {
        label: "Процент / Количество",
        description: "Процент попаданий в кэш и количество буферов",
        units: "% / шт"
      },
      metrics: [
        {
          name: "Cache Hit Ratio",
          description: "Процент данных, найденных в памяти (shared_buffers + OS cache)",
          calculation: "heap_blks_hit / (heap_blks_hit + heap_blks_read) * 100",
          normalRanges: {
            optimal: "> 99% для OLTP",
            acceptable: "95-99% для смешанных нагрузок",
            warning: "90-95% требует внимания",
            critical: "< 90% критическая ситуация"
          },
          examples: {
            good: "Стабильный cache hit ratio 99.5%",
            bad: "Cache hit ratio падает до 85% при высокой нагрузке"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Проверьте размер рабочего набора данных",
            "Оптимизируйте запросы для уменьшения чтений"
          ]
        },
        {
          name: "Buffer Usage",
          description: "Распределение и использование буферов в памяти",
          calculation: "Количество чистых и грязных буферов",
          normalRanges: {
            optimal: "< 30% dirty буферов",
            acceptable: "30-50% dirty буферов",
            warning: "50-70% dirty буферов",
            critical: "> 70% dirty буферов"
          },
          examples: {
            good: "20% dirty, 70% clean, 10% free буферов",
            bad: "80% dirty буферов, частые checkpoints"
          },
          troubleshooting: [
            "Настройте bgwriter_delay",
            "Оптимизируйте checkpoint_timeout",
            "Проверьте I/O нагрузку"
          ]
        }
      ],
      correlations: [
        {
          metric1: "cache_hit_ratio",
          metric2: "latency",
          relationship: "Обратная корреляция",
          whatItMeans: "Низкий cache hit ratio ведет к высокой latency из-за чтения с диска"
        }
      ]
    },

    walAndCheckpoints: {
      title: "WAL и контрольные точки",
      mainDescription: "График показывает активность записи WAL и выполнения контрольных точек. Помогает оптимизировать настройки записи и восстановления.",
      xAxis: {
        label: "Время",
        description: "Временная шкала с интервалом обновления 1 секунда",
        units: "чч:мм:сс"
      },
      yAxis: {
        label: "МБ/сек / Секунды",
        description: "Скорость генерации WAL и интервалы между контрольными точками",
        units: "МБ/с / сек"
      },
      metrics: [
        {
          name: "WAL Generation Rate",
          description: "Скорость создания журнальных записей",
          calculation: "Объем WAL / интервал времени",
          normalRanges: {
            optimal: "< 10 МБ/с для OLTP",
            acceptable: "10-50 МБ/с при высокой записи",
            warning: "50-100 МБ/с требует внимания",
            critical: "> 100 МБ/с критическая ситуация"
          },
          examples: {
            good: "Стабильная генерация 5 МБ/с",
            bad: "Скачки до 200 МБ/с при пакетных операциях"
          },
          troubleshooting: [
            "Проверьте частоту COMMIT",
            "Оптимизируйте размер транзакций",
            "Настройте wal_compression"
          ]
        },
        {
          name: "Checkpoint Activity",
          description: "Частота и продолжительность контрольных точек",
          calculation: "Интервал между checkpoints и время их выполнения",
          normalRanges: {
            optimal: "Checkpoint каждые 5 минут, выполнение < 30 сек",
            acceptable: "Checkpoint каждые 2-5 минут, выполнение < 1 мин",
            warning: "Частые checkpoints или долгое выполнение",
            critical: "Checkpoints чаще раза в минуту"
          },
          examples: {
            good: "Равномерные checkpoints каждые 5 минут",
            bad: "Частые checkpoints из-за max_wal_size"
          },
          troubleshooting: [
            "Увеличьте max_wal_size",
            "Настройте checkpoint_timeout",
            "Оптимизируйте checkpoint_completion_target"
          ]
        }
      ],
      correlations: [
        {
          metric1: "wal_generation",
          metric2: "checkpoint_frequency",
          relationship: "Прямая корреляция",
          whatItMeans: "Высокая генерация WAL приводит к более частым контрольным точкам"
        }
      ]
    }
  }
}; 