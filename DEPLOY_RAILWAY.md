# Деплой SnapMap на Railway

SnapMap — это монорепа из 4 компонентов, а не одно приложение. Поэтому на
Railway создаётся **отдельный сервис на каждый компонент** + управляемые БД.
Именно из-за этого падал первый билд: Railway видел корневой `package.json`,
считал репу npm-приложением и не находил `start`-скрипт. Корневой `package.json`
удалён, у каждого сервиса своя **Root Directory** и свой Dockerfile.

## Итоговая топология проекта (7 сервисов)

| Сервис      | Источник                        | Root Directory | Публичный домен |
|-------------|---------------------------------|----------------|-----------------|
| Postgres    | Railway plugin (Add → Database) | —              | нет             |
| Redis       | Railway plugin (Add → Database) | —              | нет             |
| RabbitMQ    | Docker image `rabbitmq:3-management` | —         | нет (только приватка) |
| MinIO       | Docker image `minio/minio`      | —              | **да** (порт 9000) |
| backend     | этот репозиторий                | `backend`      | **да**          |
| frontend    | этот репозиторий                | `frontend/snap`| **да**          |
| workers     | этот репозиторий                | `/` (корень)   | нет             |

> Синтаксис ссылок на переменные другого сервиса в Railway: `${{ИмяСервиса.ПЕРЕМЕННАЯ}}`.
> Имя сервиса — как он назван в дашборде (переименуй сервисы в точности как в таблице,
> иначе ссылки не совпадут).

---

## Порядок деплоя

Есть зависимость по порядку: домен бэкенда вшивается в фронт **на этапе сборки**,
а бэкенду нужен домен фронта для CORS. Поэтому:

1. Postgres, Redis (плагины)
2. RabbitMQ, MinIO (Docker-образы)
3. **backend** → сгенерировать публичный домен
4. **frontend** (в переменные вписать домен бэкенда) → сгенерировать домен
5. дописать в backend `CORS_ALLOWED_ORIGINS` = домен фронта → redeploy backend
6. **workers**
7. создать бакет `snapmap` в MinIO с public-read

---

## 1. Postgres и Redis

В проекте: **New → Database → Add PostgreSQL**, затем **Add Redis**.
Ничего настраивать не нужно — они сами публикуют переменные
(`PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`, `REDISHOST/REDISPORT/REDISPASSWORD`),
на которые мы сошлёмся из других сервисов.

## 2. RabbitMQ

**New → Empty Service** (или Docker Image) → образ `rabbitmq:3-management`.
Переменные сервиса:

```
RABBITMQ_DEFAULT_USER=snapmap
RABBITMQ_DEFAULT_PASS=<придумай_сильный_пароль>
```

Порты: `5672` (AMQP, внутренний), `15672` (веб-UI). Публичный домен не нужен —
общение идёт по приватной сети. Добавь **Volume** на `/var/lib/rabbitmq`, чтобы
очереди переживали рестарт.

## 3. MinIO (S3)

**New → Empty Service** (или Docker Image) → образ `minio/minio`.

- **Start / Custom Command:** `server /data --console-address ":9001"`
- Переменные:
  ```
  MINIO_ROOT_USER=snapmap_minio
  MINIO_ROOT_PASSWORD=<придумай_сильный_секрет>
  ```
- **Volume** на `/data`.
- **Networking → Generate Domain**, target port **9000** (S3 API).
  Запиши получившийся адрес, напр. `https://minio-production-xxxx.up.railway.app`.
  Он нужен и бэкенду, и фронту (пресайн-URL загрузки и показ фото в ленте идут
  напрямую из браузера, поэтому endpoint обязан быть публичным).

Бакет создадим в шаге 7 (сервис должен сначала подняться).

---

## 4. backend

**New → GitHub Repo → этот репозиторий.**
В **Settings** сервиса:

- **Root Directory:** `backend`
- Билдер подхватится из `backend/railway.json` (Dockerfile). Healthcheck: `/api/health`.
- **Networking → Generate Domain** (target port оставь пустым — приложение слушает `$PORT`).

Переменные (`PORT` Railway задаёт сам — **не** трогай):

```
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}

REDISHOST=${{Redis.REDISHOST}}
REDISPORT=${{Redis.REDISPORT}}
REDISPASSWORD=${{Redis.REDISPASSWORD}}

RABBITMQ_HOST=${{RabbitMQ.RAILWAY_PRIVATE_DOMAIN}}
RABBITMQ_PORT=5672
RABBIT_USER=${{RabbitMQ.RABBITMQ_DEFAULT_USER}}
RABBIT_PASS=${{RabbitMQ.RABBITMQ_DEFAULT_PASS}}

S3_ENDPOINT=https://<домен-MinIO>
S3_PUBLIC_ENDPOINT=https://<домен-MinIO>
S3_ACCESS_KEY=${{MinIO.MINIO_ROOT_USER}}
S3_SECRET_KEY=${{MinIO.MINIO_ROOT_PASSWORD}}
S3_BUCKET=snapmap
S3_REGION=us-east-1

SNAP_MAP_BOT_TOKEN=<токен_от_BotFather>

# заполнишь на шаге 5, когда появится домен фронта:
CORS_ALLOWED_ORIGINS=https://<домен-frontend>
```

> Хард-зависимость на старте — только Postgres (Hibernate `ddl-auto=update`
> создаёт схему при запуске). Redis и RabbitMQ подключаются лениво и переживут,
> если поднимутся чуть позже.

## 5. frontend

**New → GitHub Repo → тот же репозиторий** (второй сервис из той же репы).
В **Settings**:

- **Root Directory:** `frontend/snap`
- Билдер — из `frontend/snap/railway.json` (Dockerfile).
- **Networking → Generate Domain** (target port пустой — nginx слушает `$PORT`).

Переменная (она же build-arg, CRA вшивает её в бандл **на сборке**):

```
REACT_APP_API_URL=https://<домен-backend>
```

> Если поменяешь домен бэкенда — фронт надо **пересобрать** (Redeploy), иначе
> в бандле останется старый URL.

После получения домена фронта — вернись в backend, впиши его в
`CORS_ALLOWED_ORIGINS` и сделай Redeploy бэкенда.

## 6. workers

**New → GitHub Repo → тот же репозиторий** (третий сервис).
Особенность: Dockerfile воркера собирает контекст из **корня** репы (нужны и
`llm/`, и `workers/`).

- **Root Directory:** `/` (корень репозитория)
- **Settings → Config-as-code / Railway Config File:** `workers/railway.json`
  (там `dockerfilePath: workers/Dockerfile` и контекст = корень)
- Публичный домен не нужен (фоновый consumer RabbitMQ).

Переменные (обрати внимание: воркер читает Redis через `REDIS_HOST/REDIS_PORT/REDIS_PASSWORD`
с подчёркиваниями — не как бэкенд):

```
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

RABBITMQ_HOST=${{RabbitMQ.RAILWAY_PRIVATE_DOMAIN}}
RABBITMQ_PORT=5672
RABBIT_USER=${{RabbitMQ.RABBITMQ_DEFAULT_USER}}
RABBIT_PASS=${{RabbitMQ.RABBITMQ_DEFAULT_PASS}}

# воркер ходит в S3 со стороны сервера — можно приватным адресом:
S3_ENDPOINT=http://${{MinIO.RAILWAY_PRIVATE_DOMAIN}}:9000
S3_ACCESS_KEY=${{MinIO.MINIO_ROOT_USER}}
S3_SECRET_KEY=${{MinIO.MINIO_ROOT_PASSWORD}}
S3_REGION=us-east-1

VERIFIER_BACKEND=openrouter
OPENROUTER_API_KEY=<ключ_openrouter>
# опционально:
# OPENROUTER_MODEL=openai/gpt-4o-mini
# VERIFICATION_THRESHOLD=0.55
```

> `VERIFIER_BACKEND=openrouter` — лёгкий режим (внешнее vision-API, без torch),
> ровно как в `workers/Dockerfile`. Режим `clip` потребовал бы тяжёлый образ с
> моделью и здесь не собирается.

## 7. Бакет MinIO + публичный доступ на чтение

MinIO стартует пустым. Бакет `snapmap` надо создать и открыть на чтение
(лента показывает фото по прямым path-style URL).

Проще всего через веб-консоль MinIO: временно **Generate Domain** на target port
**9001**, зайди под `MINIO_ROOT_USER/PASSWORD`, создай бакет `snapmap`,
в Anonymous / Access Policy поставь **readonly** (public read) на бакет.

Либо через `mc` с любой машины (подставь публичный S3-домен и ключи):

```bash
mc alias set snap https://<домен-MinIO> <MINIO_ROOT_USER> <MINIO_ROOT_PASSWORD>
mc mb snap/snapmap
mc anonymous set download snap/snapmap
```

---

## Проверка

- `https://<домен-backend>/api/health` → `{"status":"UP", ...}`
- Открой `https://<домен-frontend>` — фронт грузится, запросы уходят на бэкенд без CORS-ошибок (DevTools → Network).
- Логи workers: `Worker started. Waiting for tasks on moderation.tasks`.
- В BotFather пропиши домен фронта: `/setmenubutton` → бот → `https://<домен-frontend>`.

## Частые грабли

- **CORS-ошибки в браузере** — `CORS_ALLOWED_ORIGINS` бэкенда не совпадает с доменом фронта (нужен `https://`, без слэша в конце) → поправь и Redeploy backend.
- **Фронт стучится на localhost** — `REACT_APP_API_URL` был не задан на сборке; задай и Redeploy frontend.
- **Не грузятся/не показываются фото** — не создан бакет `snapmap` или не выставлен public-read; `S3_PUBLIC_ENDPOINT` должен быть публичным HTTPS-адресом MinIO.
- **workers не может скачать из S3** — проверь, что endpoint резолвится; path-style адресация уже включена в коде.
