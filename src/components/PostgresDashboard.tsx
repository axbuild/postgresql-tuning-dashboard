import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Slider,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Chip,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts';
import { PostgresTuningService } from '../services/PostgresTuningService';
import {
  SystemResources,
  DatabaseLoad,
  PostgresConfig,
  PerformanceMetrics,
  Recommendation,
} from '../types/postgresql.types';
import { styled } from '@mui/material/styles';
import { CheckCircle as CheckCircleIcon, Warning as WarningIcon, Build as BuildIcon } from '@mui/icons-material';
import { Chart } from './Chart';
import { StyledPaper } from './StyledComponents';

const tuningService = new PostgresTuningService();

const ParameterTooltip = styled(({ title, children }: { title: string, children: React.ReactNode }) => (
  <Tooltip title={title}>
    <Box>{children}</Box>
  </Tooltip>
))(({ theme }) => ({
  cursor: 'help',
}));

const graphDescriptions = {
  graphs: {
    throughput: {
      title: "Throughput",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "Throughput",
        description: "Запросов в секунду",
        units: "queries/second"
      },
      mainDescription: "Throughput измеряет количество обрабатываемых запросов в секунду. Высокий throughput указывает на эффективную обработку запросов.",
      metrics: [
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых базой данных за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокий throughput указывает на эффективную обработку запросов",
            bad: "Низкий throughput может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов", 
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        },
        {
          name: "WAL Generation Rate",
          description: "Скорость генерации журнала предзаписи (WAL)",
          calculation: "WAL Generation Rate = Total WAL Generated / Time",
          normalRanges: {
            optimal: "Ниже 100 МБ/сек",
            warning: "Выше 100 МБ/сек"
          },
          examples: {
            good: "Низкая скорость генерации WAL указывает на эффективное использование журнала",
            bad: "Высокая скорость генерации WAL может указывать на неэффективное использование журнала"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте запросы записи"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение throughput обычно приводит к увеличению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Более высокий cache hit ratio обычно приводит к снижению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Более высокая скорость генерации WAL обычно приводит к увеличению latency"
        }
      ]
    },
    latency: {
      title: "Latency",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "Latency",
        description: "Миллисекунды",
        units: "ms"
      },
      mainDescription: "Latency измеряет время выполнения запроса. Низкая latency указывает на эффективную обработку запросов.",
      metrics: [
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокая пропускная способность указывает на эффективную обработку запросов",
            bad: "Низкая пропускная способность может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов",
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        },
        {
          name: "WAL Generation Rate",
          description: "Скорость генерации журнала предзаписи",
          calculation: "WAL Generation Rate = Total WAL Generated / Time",
          normalRanges: {
            optimal: "Ниже 100 МБ/сек",
            warning: "Выше 100 МБ/сек"
          },
          examples: {
            good: "Низкая скорость генерации WAL указывает на эффективное использование журнала",
            bad: "Высокая скорость генерации WAL может указывать на неэффективное использование журнала"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте запросы записи"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение latency обычно приводит к снижению throughput"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Более высокий cache hit ratio обычно приводит к снижению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Более высокая скорость генерации WAL обычно приводит к увеличению latency"
        }
      ]
    },
    iops: {
      title: "IOPS",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "IOPS",
        description: "Операций в секунду",
        units: "ops/second"
      },
      mainDescription: "IOPS измеряет количество операций ввода-вывода в секунду. Высокий IOPS указывает на эффективный доступ к диску.",
      metrics: [
        {
          name: "IOPS",
          description: "Количество операций ввода-вывода в секунду",
          calculation: "IOPS = Total Operations / Time",
          normalRanges: {
            optimal: "Выше 10000 операций/сек",
            warning: "Ниже 1000 операций/сек"
          },
          examples: {
            good: "Высокий IOPS указывает на эффективный доступ к диску",
            bad: "Низкий IOPS может указывать на неэффективный доступ к диску"
          },
          troubleshooting: [
            "Проверьте производительность диска",
            "Увеличьте емкость SSD"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        },
        {
          name: "WAL Generation Rate",
          description: "Скорость генерации журнала предзаписи",
          calculation: "WAL Generation Rate = Total WAL Generated / Time",
          normalRanges: {
            optimal: "Ниже 100 МБ/сек",
            warning: "Выше 100 МБ/сек"
          },
          examples: {
            good: "Низкая скорость генерации WAL указывает на эффективное использование журнала",
            bad: "Высокая скорость генерации WAL может указывать на неэффективное использование журнала"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте запросы записи"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение IOPS обычно приводит к увеличению throughput"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение IOPS обычно приводит к увеличению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение IOPS обычно приводит к увеличению cache hit ratio"
        }
      ]
    },
    cacheHitRatio: {
      title: "Cache Hit Ratio",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "Cache Hit Ratio",
        description: "Процент",
        units: "%"
      },
      mainDescription: "Cache Hit Ratio измеряет процент запросов, обслуживаемых из кэша. Высокий процент указывает на эффективное использование кэша.",
      metrics: [
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        },
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокая пропускная способность указывает на эффективную обработку запросов",
            bad: "Низкая пропускная способность может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов",
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "WAL Generation Rate",
          description: "Скорость генерации журнала предзаписи",
          calculation: "WAL Generation Rate = Total WAL Generated / Time",
          normalRanges: {
            optimal: "Ниже 100 МБ/сек",
            warning: "Выше 100 МБ/сек"
          },
          examples: {
            good: "Низкая скорость генерации WAL указывает на эффективное использование журнала",
            bad: "Высокая скорость генерации WAL может указывать на неэффективное использование журнала"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте запросы записи"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение cache hit ratio обычно приводит к увеличению throughput"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение cache hit ratio обычно приводит к увеличению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение cache hit ratio обычно приводит к увеличению IOPS"
        }
      ]
    },
    walGenerationRate: {
      title: "WAL Generation Rate",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "WAL Generation Rate",
        description: "МБ в секунду",
        units: "MB/second"
      },
      mainDescription: "WAL Generation Rate измеряет скорость генерации журнала предзаписи. Высокая скорость может указывать на неэффективное использование WAL.",
      metrics: [
        {
          name: "WAL Generation Rate",
          description: "Скорость генерации журнала предзаписи",
          calculation: "WAL Generation Rate = Total WAL Generated / Time",
          normalRanges: {
            optimal: "Ниже 100 МБ/сек",
            warning: "Выше 100 МБ/сек"
          },
          examples: {
            good: "Низкая скорость генерации WAL указывает на эффективное использование журнала",
            bad: "Высокая скорость генерации WAL может указывать на неэффективное использование журнала"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте запросы записи"
          ]
        },
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокая пропускная способность указывает на эффективную обработку запросов",
            bad: "Низкая пропускная способность может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов",
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение скорости генерации WAL обычно приводит к увеличению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение скорости генерации WAL обычно приводит к увеличению IOPS"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение скорости генерации WAL обычно приводит к снижению cache hit ratio"
        }
      ]
    },
    checkpointStats: {
      title: "Checkpoint Stats",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "Checkpoint Stats",
        description: "Байт в секунду",
        units: "bytes/second"
      },
      mainDescription: "Checkpoint Stats измеряет скорость записи данных в WAL во время контрольных точек. Высокие значения указывают на эффективное использование WAL.",
      metrics: [
        {
          name: "Checkpoint Stats",
          description: "Скорость записи данных в WAL во время контрольных точек",
          calculation: "Checkpoint Stats = Total Bytes Written / Time",
          normalRanges: {
            optimal: "Выше 100 МБ/сек",
            warning: "Ниже 10 МБ/сек"
          },
          examples: {
            good: "Высокая скорость записи указывает на эффективное использование WAL",
            bad: "Низкая скорость записи может указывать на неэффективное использование WAL"
          },
          troubleshooting: [
            "Проверьте производительность диска",
            "Увеличьте емкость SSD"
          ]
        },
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокая пропускная способность указывает на эффективную обработку запросов",
            bad: "Низкая пропускная способность может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов",
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение скорости checkpoint обычно приводит к увеличению throughput"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение скорости checkpoint обычно приводит к увеличению latency"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение скорости checkpoint обычно приводит к увеличению IOPS"
        }
      ]
    },
    replicationLag: {
      title: "Replication Lag",
      xAxis: {
        label: "Time",
        description: "Время",
        units: "seconds"
      },
      yAxis: {
        label: "Replication Lag",
        description: "Миллисекунды",
        units: "ms"
      },
      mainDescription: "Replication Lag измеряет время задержки репликации данных от основного сервера к реплике. Низкая задержка указывает на эффективную репликацию.",
      metrics: [
        {
          name: "Replication Lag",
          description: "Время задержки репликации данных",
          calculation: "Replication Lag = Time Taken / Time",
          normalRanges: {
            optimal: "Ниже 100 мс",
            warning: "Выше 1000 мс"
          },
          examples: {
            good: "Низкая задержка репликации указывает на эффективную репликацию",
            bad: "Высокая задержка репликации может указывать на проблемы с репликацией"
          },
          troubleshooting: [
            "Проверьте производительность сети",
            "Увеличьте пропускную способность соединения с репликой"
          ]
        },
        {
          name: "Queries per Second",
          description: "Количество запросов, обрабатываемых за секунду",
          calculation: "Queries per Second = Total Queries / Time",
          normalRanges: {
            optimal: "Выше 1000 запросов/сек",
            warning: "Ниже 100 запросов/сек"
          },
          examples: {
            good: "Высокая пропускная способность указывает на эффективную обработку запросов",
            bad: "Низкая пропускная способность может указывать на проблемы с производительностью"
          },
          troubleshooting: [
            "Проверьте производительность запросов",
            "Увеличьте shared_buffers"
          ]
        },
        {
          name: "Cache Hit Ratio",
          description: "Процент запросов, обслуживаемых из кэша",
          calculation: "Cache Hit Ratio = (Total Queries - Cache Misses) / Total Queries",
          normalRanges: {
            optimal: "Выше 90%",
            warning: "Ниже 70%"
          },
          examples: {
            good: "Высокий процент попаданий в кэш указывает на эффективное использование кэша",
            bad: "Низкий процент попаданий в кэш может указывать на неэффективное использование кэша"
          },
          troubleshooting: [
            "Увеличьте shared_buffers",
            "Оптимизируйте выполнение запросов"
          ]
        }
      ],
      correlations: [
        {
          relationship: "Positive correlation",
          whatItMeans: "Повышение задержки репликации обычно приводит к снижению throughput"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение задержки репликации обычно приводит к снижению cache hit ratio"
        },
        {
          relationship: "Negative correlation",
          whatItMeans: "Повышение задержки репликации обычно приводит к увеличению latency"
        }
      ]
    }
  }
};

interface Metric {
  name: string;
  description: string;
  calculation: string;
  normalRanges: {
    optimal: string;
    warning: string;
  };
  examples: {
    good: string;
    bad: string;
  };
  troubleshooting: string[];
}

interface Correlation {
  relationship: string;
  whatItMeans: string;
}

interface GraphInfo {
  title: string;
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
  mainDescription: string;
  metrics: Metric[];
  correlations: Correlation[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metric-tabpanel-${index}`}
      aria-labelledby={`metric-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `metric-tab-${index}`,
    'aria-controls': `metric-tabpanel-${index}`,
  };
}

export const PostgresDashboard: React.FC = () => {
  const [resources, setResources] = useState<SystemResources>({
    ram: 16,
    cpu: { cores: 4, speed: 2.5 },
    ssd: { capacity: 500, iops: 10000 },
    walDrive: { type: 'NVMe', capacity: 100 },
    archiveDrive: { type: 'HDD', capacity: 1000 },
  });

  const [load, setLoad] = useState<DatabaseLoad>({
    queriesPerSecond: 100,
    activeConnections: 50,
    writePercentage: 30,
    readPercentage: 70,
    avgTransactionSize: 10,
  });

  const [config, setConfig] = useState<PostgresConfig>({
    shared_buffers: 4096,
    effective_cache_size: 12288,
    maintenance_work_mem: 1024,
    work_mem: 64,
    max_connections: 100,
    wal_level: 'replica',
    wal_buffers: 16,
    synchronous_commit: 'on',
    wal_compression: false,
    wal_writer_delay: 10000,
    max_wal_size: 1024,
    min_wal_size: 512,
    checkpoint_timeout: 300,
    checkpoint_completion_target: 0.7,
    max_wal_senders: 10,
    max_replication_slots: 10,
    hot_standby: true,
    hot_standby_feedback: false,
    archive_mode: false,
    pgbouncerEnabled: false,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    throughput: 0,
    latency: 0,
    iops: 0,
    cacheHitRatio: 0,
    walGenerationRate: 0,
    checkpointStats: {
      frequency: 300,
      duration: 210,
      writtenBytes: 0,
    },
    replicationLag: 0,
  });

  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    const newConfig = tuningService.calculatePostgresConfig(resources, load);
    const newMetrics = tuningService.calculatePerformanceMetrics(resources, load, config);
    const newRecommendations = tuningService.getRecommendations(resources, load, config);

    setConfig(newConfig);
    setMetrics(newMetrics);
    setMetricsHistory(prev => [...prev.slice(-20), newMetrics]);
    setRecommendations(newRecommendations);
  }, [resources, load]);

  const renderParameterSection = (
    title: string,
    description: string,
    children: React.ReactNode
  ) => (
    <Box sx={{ mb: 2 }}>
      <ParameterTooltip title={description}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
      </ParameterTooltip>
      {children}
    </Box>
  );

  const GraphWithDescription: React.FC<{ graphKey: keyof typeof graphDescriptions.graphs }> = ({ graphKey }) => {
    const graphInfo = graphDescriptions.graphs[graphKey] as GraphInfo;
    
    return (
      <Box>
        <Chart
          title={graphInfo.title}
          xAxis={{
            title: graphInfo.xAxis.label,
            tooltip: `${graphInfo.xAxis.description} (${graphInfo.xAxis.units})`
          }}
          yAxis={{
            title: graphInfo.yAxis.label,
            tooltip: `${graphInfo.yAxis.description} (${graphInfo.yAxis.units})`
          }}
          description={graphInfo.mainDescription}
          metrics={graphInfo.metrics}
          correlations={graphInfo.correlations}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        PostgreSQL Tuning Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* System Resources */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Системные ресурсы
          </Typography>
          
          {renderParameterSection(
            "RAM (GB)",
            "Влияет на shared_buffers и effective_cache_size",
            <Slider
              value={resources.ram}
              onChange={(_, value) => setResources(prev => ({ ...prev, ram: value as number }))}
              min={4}
              max={128}
              valueLabelDisplay="auto"
            />
          )}

          {renderParameterSection(
            "CPU Cores",
            "Влияет на параллельные запросы и max_connections",
            <Slider
              value={resources.cpu.cores}
              onChange={(_, value) => setResources(prev => ({
                ...prev,
                cpu: { ...prev.cpu, cores: value as number }
              }))}
              min={1}
              max={32}
              valueLabelDisplay="auto"
            />
          )}

          {renderParameterSection(
            "WAL Drive Type",
            "Тип диска для WAL влияет на производительность записи",
            <FormControl fullWidth size="small">
              <Select
                value={resources.walDrive.type}
                onChange={(e) => setResources(prev => ({
                  ...prev,
                  walDrive: { ...prev.walDrive, type: e.target.value as 'SSD' | 'NVMe' | 'HDD' }
                }))}
              >
                <MenuItem value="HDD">HDD</MenuItem>
                <MenuItem value="SSD">SSD</MenuItem>
                <MenuItem value="NVMe">NVMe</MenuItem>
              </Select>
            </FormControl>
          )}
        </StyledPaper>

        {/* Database Load */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Нагрузка
          </Typography>
          
          {renderParameterSection(
            "Queries per Second",
            "Количество запросов в секунду влияет на многие параметры",
            <Slider
              value={load.queriesPerSecond}
              onChange={(_, value) => setLoad(prev => ({ ...prev, queriesPerSecond: value as number }))}
              min={10}
              max={10000}
              valueLabelDisplay="auto"
            />
          )}

          {renderParameterSection(
            "Write Percentage",
            "Процент операций записи влияет на WAL и checkpoint настройки",
            <Slider
              value={load.writePercentage}
              onChange={(_, value) => setLoad(prev => ({
                ...prev,
                writePercentage: value as number,
                readPercentage: 100 - (value as number)
              }))}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          )}

          {renderParameterSection(
            "Avg Transaction Size (KB)",
            "Средний размер транзакции влияет на WAL и checkpoint",
            <Slider
              value={load.avgTransactionSize}
              onChange={(_, value) => setLoad(prev => ({ ...prev, avgTransactionSize: value as number }))}
              min={1}
              max={1000}
              valueLabelDisplay="auto"
            />
          )}
        </StyledPaper>

        {/* WAL Configuration */}
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            WAL Настройки
          </Typography>
          
          {renderParameterSection(
            "WAL Level",
            "Уровень детализации WAL логов",
            <FormControl fullWidth size="small">
              <Select
                value={config.wal_level}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  wal_level: e.target.value as 'minimal' | 'replica' | 'logical'
                }))}
              >
                <MenuItem value="minimal">Minimal</MenuItem>
                <MenuItem value="replica">Replica</MenuItem>
                <MenuItem value="logical">Logical</MenuItem>
              </Select>
            </FormControl>
          )}

          {renderParameterSection(
            "Synchronous Commit",
            "Влияет на надежность и производительность",
            <FormControl fullWidth size="small">
              <Select
                value={config.synchronous_commit}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  synchronous_commit: e.target.value as 'on' | 'off' | 'local' | 'remote_write' | 'remote_apply'
                }))}
              >
                <MenuItem value="on">On</MenuItem>
                <MenuItem value="off">Off</MenuItem>
                <MenuItem value="local">Local</MenuItem>
                <MenuItem value="remote_write">Remote Write</MenuItem>
                <MenuItem value="remote_apply">Remote Apply</MenuItem>
              </Select>
            </FormControl>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={config.wal_compression}
                onChange={(e) => setConfig(prev => ({ ...prev, wal_compression: e.target.checked }))}
              />
            }
            label="WAL Compression"
          />
        </StyledPaper>

        {/* Performance Metrics */}
        <StyledPaper sx={{ gridColumn: 'span 2' }}>
          <Typography variant="h6" gutterBottom>
            Метрики производительности
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metricsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="throughput" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="latency" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              <Area type="monotone" dataKey="cacheHitRatio" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
              <Area type="monotone" dataKey="walGenerationRate" stackId="4" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </StyledPaper>

        {/* Recommendations and Metrics Description Container */}
        <Box sx={{ 
          gridColumn: 'span 2',
          width: '100%',
          display: 'flex',
          gap: 2
        }}>
          {/* Recommendations */}
          <StyledPaper sx={{ 
            flex: 1,
            maxHeight: '600px', 
            overflow: 'auto'
          }}>
            <Typography variant="h6" gutterBottom>
              Рекомендации
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2, 
              gridTemplateColumns: '1fr',
              width: '100%'
            }}>
              {recommendations.map((rec, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {rec.parameter}
                      </Typography>
                      <Chip
                        size="small"
                        label={rec.impact}
                        color={rec.impact === 'high' ? 'error' : rec.impact === 'medium' ? 'warning' : 'info'}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Текущее: {rec.currentValue}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom>
                      Рекомендуется: {rec.recommendedValue}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {rec.explanation}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </StyledPaper>

          {/* Metrics Description with Tabs */}
          <StyledPaper sx={{ 
            flex: 1,
            maxHeight: '600px', 
            overflow: 'auto'
          }}>
            <Typography variant="h6" gutterBottom>
              Описание метрик
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                aria-label="metrics tabs"
                sx={{ width: '100%' }}
              >
                {Object.entries(graphDescriptions.graphs).map(([key, graph], index) => (
                  <Tab 
                    key={key} 
                    label={graph.title} 
                    {...a11yProps(index)}
                  />
                ))}
              </Tabs>
            </Box>
            {Object.entries(graphDescriptions.graphs).map(([key, graph], index) => (
              <TabPanel key={key} value={selectedTab} index={index}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body1" paragraph>
                    {graph.mainDescription}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Ключевые показатели:
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 2, 
                    gridTemplateColumns: '1fr',
                    width: '100%'
                  }}>
                    {graph.metrics.map((metric, metricIndex) => (
                      <Card key={metricIndex} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" color="primary">
                              {metric.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {metric.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircleIcon color="success" sx={{ mr: 0.5, fontSize: 'small' }} />
                              <Typography variant="body2">
                                {metric.normalRanges.optimal}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WarningIcon color="warning" sx={{ mr: 0.5, fontSize: 'small' }} />
                              <Typography variant="body2">
                                {metric.normalRanges.warning}
                              </Typography>
                            </Box>
                          </Box>
                          <List dense>
                            {metric.troubleshooting.map((tip, tipIndex) => (
                              <ListItem key={tipIndex} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <BuildIcon color="action" sx={{ fontSize: 'small' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={tip}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Взаимосвязи:
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 2, 
                    gridTemplateColumns: '1fr',
                    width: '100%'
                  }}>
                    {graph.correlations.map((correlation, corrIndex) => (
                      <Card key={corrIndex} variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="primary">
                            {correlation.relationship}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {correlation.whatItMeans}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </TabPanel>
            ))}
          </StyledPaper>
        </Box>
      </Box>
    </Box>
  );
};