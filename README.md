# PostgreSQL Tuning Dashboard

[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/MUI-5.x-blue)](https://mui.com/)

Интерактивная панель управления для мониторинга и оптимизации производительности PostgreSQL. Визуализирует ключевые метрики производительности и предоставляет рекомендации по настройке в режиме реального времени.

## 🚀 Возможности

- **Мониторинг метрик в реальном времени:**
  - Throughput (запросов/сек)
  - Latency (задержка)
  - Cache Hit Ratio
  - WAL Generation Rate
  - IOPS
  - Checkpoint Statistics
  - Replication Lag

- **Интеллектуальные рекомендации:**
  - Автоматический анализ конфигурации
  - Предложения по оптимизации
  - Приоритизация рекомендаций

- **Интерактивная настройка параметров:**
  - Системные ресурсы
  - Профиль нагрузки
  - WAL конфигурация

## 🛠 Технологии

- React
- TypeScript
- Material-UI
- Recharts
- PostgreSQL

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/axbuild/postgresql-tuning-dashboard.git

# Переход в директорию проекта
cd postgresql-tuning-dashboard

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

## 🔧 Использование

1. Укажите характеристики вашего сервера (RAM, CPU, диски)
2. Настройте профиль нагрузки
3. Получите рекомендации по оптимизации
4. Мониторьте метрики производительности

## 📊 Метрики и их значение

### Throughput
- Измеряет количество запросов в секунду
- Оптимальное значение: > 1000 запросов/сек
- Влияет на общую производительность системы

### Cache Hit Ratio
- Процент данных, найденных в кэше
- Оптимальное значение: > 90%
- Ключевой показатель эффективности кэширования

### WAL Generation Rate
- Скорость генерации журнала предзаписи
- Оптимальное значение: < 100 МБ/сек
- Влияет на производительность записи

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста, ознакомьтесь с нашим руководством по внесению изменений.

## 📝 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для подробностей.

## 👥 Авторы

- [Ваше имя](https://github.com/axbuild)

## 🙏 Благодарности

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Community](https://reactjs.org/)
- [Material-UI Team](https://mui.com/)
