# SnapMap — локальный деплой

## Требования

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- Токен Telegram бота (получить у [@BotFather](https://t.me/BotFather))

---

## Быстрый старт

**1. Клонируй репо**
```bash
git clone https://github.com/muhyrla/snap-map.git
cd snap-map
```

**2. Создай `.env`**
```bash
echo "SNAP_MAP_BOT_TOKEN=твой_токен" > .env
```

**3. Запускай**
```bash
docker compose -f docker-compose.local.yml up -d --build
```

Первый билд занимает ~5 минут (Gradle качает зависимости). Последующие — быстрее.

---

## Что поднимается

| Сервис | URL | Логин |
|---|---|---|
| Фронтенд | http://localhost:3000 | — |
| Бэкенд API | http://localhost:8080 | — |
| RabbitMQ UI | http://localhost:15672 | guest / guest |
| MinIO UI | http://localhost:9001 | minioadmin / minioadmin |
| PostgreSQL | localhost:5432 | snapmap / snapmap |

---

## Вывод в интернет через Tuna

Чтобы протестировать в Telegram нужен HTTPS-адрес.

**1. Запусти туну на бэкенд и запомни URL**
```bash
tuna http 8080
# → https://abc123.tuna.am
```

**2. Пересобери фронт с этим URL и запусти туну на фронт**
```bash
REACT_APP_API_URL=https://abc123.tuna.am \
  docker compose -f docker-compose.local.yml up -d --build frontend

tuna http 3000
# → https://xyz456.tuna.am
```

**3. Вставь URL фронта в BotFather**
```
/setmenubutton → выбери бота → https://xyz456.tuna.am
```

---

## Полезные команды

```bash
# Статус сервисов
docker compose -f docker-compose.local.yml ps

# Логи бэкенда
docker compose -f docker-compose.local.yml logs -f backend

# Остановить всё
docker compose -f docker-compose.local.yml down

# Остановить и удалить данные БД
docker compose -f docker-compose.local.yml down -v

# Пересобрать один сервис
docker compose -f docker-compose.local.yml up -d --build backend
```

---

## Структура проекта

```
snap-map/
├── backend/          # Spring Boot (Kotlin)
├── frontend/snap/    # React + TypeScript
├── workers/          # Python воркеры (AI верификация)
├── llm/              # CLIP модель для проверки фото
├── docker-compose.yml          # прод
├── docker-compose.local.yml    # локалка
└── .env                        # секреты (не пушить!)
```
