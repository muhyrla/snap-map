# Деплой SnapMap на свой VPS (домен + HTTPS)

Весь стек поднимается одной командой через `docker-compose.yml`. Caddy сам
получает и продлевает HTTPS-сертификаты (Let's Encrypt), MinIO-init сам создаёт
бакет. Никаких внешних сервисов и подписок.

## Что поднимется

| Контейнер | Роль | Наружу |
|---|---|---|
| caddy | reverse-proxy + авто-HTTPS | :80, :443 |
| backend | Spring Boot API | через caddy: `https://<домен>/api/*` |
| frontend | React (nginx) | через caddy: `https://<домен>/*` |
| worker | ИИ-проверка фото (OpenRouter) | — |
| postgres / redis / rabbitmq | инфра | — |
| minio | S3-хранилище фото | через caddy: `https://s3.<домен>` |
| minio-init | создаёт бакет `snapmap` (public-read) | — |

---

## Шаг 0. DNS — сделать ПЕРВЫМ

Let's Encrypt проверяет владение доменом по DNS, поэтому записи должны
резолвиться **до** запуска. У регистратора `snapmap.ru` добавь две A-записи на IP сервера:

```
snapmap.ru       A   <IP_сервера>
s3.snapmap.ru    A   <IP_сервера>
```

Поддомен `s3.` обязателен — через него браузер заливает и грузит фото по HTTPS.

Проверь, что распространилось (с любой машины):
```bash
dig +short snapmap.ru
dig +short s3.snapmap.ru
```
Оба должны вернуть IP сервера. Если пусто — подожди (до часа) и не запускай Caddy раньше, иначе он не выдаст сертификат.

Открой порты на файрволе сервера: **80** и **443** (Let's Encrypt использует 80 для проверки).

---

## Шаг 1. Docker на сервере

Если Docker ещё не стоит (Ubuntu/Debian):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # перелогинься после этого
```
Проверка: `docker --version` и `docker compose version`.

---

## Шаг 2. Забрать репозиторий

```bash
git clone https://github.com/muhyrla/snap-map.git
cd snap-map
```

## Шаг 3. Создать `.env`

Скопируй пример и заполни своими значениями:
```bash
cp .env.example .env
nano .env
```
Обязательно поменяй:
- `DOMAIN=snapmap.ru`, `ACME_EMAIL=твой@email`
- все `*_PASSWORD` / `*_SECRET` / `RABBIT_PASS` — на сильные пароли
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
- `SNAP_MAP_BOT_TOKEN` — токен от @BotFather
- `OPENROUTER_API_KEY` — ключ OpenRouter (для ИИ-проверки)

`.env` в git не попадёт (он в `.gitignore`) — это правильно, там секреты.

## Шаг 4. Запуск

```bash
docker compose up -d --build
```
Первый билд ~5–10 мин (Gradle тянет зависимости, собирается фронт).

Смотреть, как поднимается:
```bash
docker compose ps
docker compose logs -f caddy      # выдача сертификатов
docker compose logs -f backend    # старт Spring Boot
```

---

## Шаг 5. Проверка

- API: `https://snapmap.ru/api/health` → `{"status":"UP",...}`
- Фронт: открой `https://snapmap.ru` — грузится, в DevTools→Network запросы на `/api/*` идут по 200, без CORS-ошибок.
- S3: `https://s3.snapmap.ru/snapmap/` → ответ от MinIO (403/ListBucket — это норм, значит хост живой и HTTPS выдан).
- Воркер: `docker compose logs worker` → `Worker started. Waiting for tasks on moderation.tasks`.

## Шаг 6. Привязать к Telegram

В @BotFather: `/setmenubutton` → выбери бота → URL `https://snapmap.ru`.
Открой мини-апп из Telegram — авторизация пройдёт (для неё и нужен `SNAP_MAP_BOT_TOKEN`).

---

## Обновление после изменений в коде

```bash
git pull
docker compose up -d --build
```
Только один сервис, напр. бэкенд:
```bash
docker compose up -d --build backend
```

## Полезное

```bash
docker compose logs -f <сервис>      # логи
docker compose restart <сервис>      # рестарт
docker compose down                  # остановить всё (данные в volume сохранятся)
docker compose down -v               # ОСТОРОЖНО: снести и данные (БД, фото, очереди)
```

## Частые грабли

- **Caddy не даёт сертификат** — DNS ещё не резолвится, или закрыт порт 80/443. Проверь `dig` и файрвол, потом `docker compose restart caddy`.
- **Фото не заливаются / presigned падает** — не резолвится `s3.snapmap.ru` или его сертификат не выдан. Проверь вторую A-запись и логи caddy.
- **Фото не показываются в ленте** — не отработал `minio-init` (бакет/public-read). Логи: `docker compose logs minio-init`; при надобности перезапусти: `docker compose up -d minio-init`.
- **CORS-ошибка** — `DOMAIN` в `.env` не совпадает с реальным доменом; бэкенд разрешает ровно `https://${DOMAIN}`.
- **ИИ-проверка всегда FAILED** — не задан/невалиден `OPENROUTER_API_KEY`, смотри `docker compose logs worker`.
