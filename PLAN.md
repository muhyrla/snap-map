# SnapMap — доделываем всё: план реализации

Цель: замкнуть весь конвейер **квест → снимок → загрузка → верификация CLIP → зачёт квеста → баланс/стрик/статистика → лента**, плюс подчистить мёртвый код. Все 3 архитектурных решения выбраны рекомендованные: Redis pub/sub listener, нативный `<input capture>`, английский лейбл в `Quest.metadata`.

---

## Этап 1 — Backend: consumer результата верификации (ядро)

**1.1 `RedisConfig.kt`** — добавить bean `RedisMessageListenerContainer`, подписанный на канал `moderation:events` (значение из `redis.events-topic`).

**1.2 Новый `VerificationEventListener.kt`** (service/listener) — `MessageListener`:
- Парсит событие `{type, taskId, status, userId}`.
- Игнорирует всё, кроме `type == VERIFICATION_COMPLETED`.
- Идемпотентность: перед обработкой ставит в Redis флаг `moderation:processed:<taskId>` (SETNX + TTL); если уже стоял — выходит (защита от повторной доставки/двойного зачёта).
- Читает полный результат через `verificationQueueService.getResult(taskId)` (там `questId`, `objectKey`, `allowFeedPhotos`, `decision`, `score`).
- Делегирует в новый `QuestCompletionService`.

**1.3 Новый `QuestCompletionService.kt`** (`@Transactional`) — метод `completeFromResult(result)`:
- Только при `decision == APPROVED`.
- Если `questId != null`: upsert `UserQuest` → `COMPLETED` (переиспользуя логику как в `skipQuest`).
- Создать `CompletedQuest(userId, questId, photo = objectKey, description, allowFeedPhotos, completedAt = today)` — **первое реальное использование этой сущности**.
- Начислить `user.balance += quest.reward` (BigDecimal).
- Вызвать `statsService.recordActivity(userId, user)` — **оживляем мёртвый метод стрика**.
- Сохранить `user`.
- REJECTED/FAILED — ничего не начисляем (статус уже в Redis, фронт его увидит при поллинге).

**1.4 `CompletedQuestRepository.kt`** — добавить:
- `existsByUserIdAndQuestId(...)` — доп. защита от дубля зачёта одного квеста.
- Запрос для ленты (см. Этап 4).

---

## Этап 2 — Backend: expectedLabel через Quest.metadata

**2.1 `UserQuestService.QuestDto`** — добавить поле `expectedLabel: String?` = `quest.metadata`. Прокинуть во всех местах, где строится DTO (`getQuestsByType`, `getQuestById`, `rerollQuest`).

Так фронт получит английский лейбл вместе с квестом и отправит его в `/verify`. `AdminQuestController` уже умеет писать `metadata` — отдельная миграция не нужна.

---

## Этап 3 — Frontend: камера + конвейер загрузки/верификации

**3.1 Новый `services/uploadService.ts`**:
- `presign(initData, objectToFind)` → `POST /api/uploads/presign` → `{url, objectKey}`.
- `uploadToS3(url, file)` → `PUT` файла в presigned URL (с `Content-Type`).
- `requestVerification(initData, {objectKey, expectedLabel, questId, allowFeedPhotos})` → `POST /api/uploads/verify` → `{taskId}`.
- `getVerificationStatus(initData, taskId)` → `GET /api/uploads/verify/status`.

**3.2 `questsService.ts`** — добавить `expectedLabel: string | null` в интерфейс `QuestDto`.

**3.3 Новый компонент `pages/SnapFlow.tsx`** (bottom sheet поверх экрана квеста):
- Скрытый `<input type="file" accept="image/*" capture="environment">`; клик по «Сделать снимок» открывает камеру.
- Превью снимка + чекбокс «Показывать фото в ленте» (→ `allowFeedPhotos`) + кнопка «Отправить».
- Пошаговый статус: `Загрузка → На проверке → ✅ Зачтено / ❌ Не распознано`.
- Поллинг `getVerificationStatus` каждые ~2 c до `APPROVED/REJECTED/FAILED` (таймаут ~60 c).
- При `APPROVED`: тост «+N снэпов», обновить баланс/статы/список квестов, закрыть sheet.
- Офлайн-мок (нет `initData`): имитировать успех, как в `MarketScreen`.

**3.4 `App.tsx`** — завести состояние активного снимка; `onShoot(q)` открывает `SnapFlow` вместо тоста-заглушки (и для `QuestDetailScreen`, и для центральной кнопки таба `snap`). После успеха — рефетч `getStats` + инвалидация списка квестов.

---

## Этап 4 — Feed: реальная лента из подтверждённых снимков

**4.1 Backend `FeedController` + `FeedService`** — `GET /api/feed`:
- Берёт `CompletedQuest` где `allowFeedPhotos = true`, сортировка по `completedAt` desc, лимит.
- Джойн с `User` (имя/город) и `Quest` (название/эмодзи/цвет по типу).
- `photo` (objectKey) → публичный URL через `StorageService` (добавить `publicUrl(objectKey)`; для MinIO — `endpoint/bucket/key`).
- Отдаёт DTO под существующий фронтовый `FeedPost` (name, city, time, quest, questColor, image, caption, likes=0).

**4.2 `feedService.ts`** — заменить мок на реальный `GET /api/feed` (с фолбэком на мок при ошибке/без initData).

**4.3 `App.tsx` / `FeedScreen.tsx`** — грузить ленту с бэка; pull-to-refresh реально рефетчит.

---

## Этап 5 — Чистка мёртвого кода

- Удалить осиротевшие `pages/Home.tsx`, `components/Post.tsx`, `pages/QuestsPage.tsx` (подтверждено: нигде не роутятся).
- Заменить `RankPlaceholder` — он не используется (таб `rank` уже рендерит `LeaderboardScreen`), удалить.

---

## Вне scope (следующая итерация, только помечаю)

- **Уведомления** и **достижения** — на бэке нет сущностей/контроллеров; сейчас только фронт-моки. Требуют отдельного дизайна (таблицы + генерация событий). Кнопка колокольчика останется заглушкой.
- Рефактор дублирующегося `extractInitData/unauthorized/serverError` по контроллерам в общий базовый класс/хелпер — косметика, не блокирует.

---

## Порядок и проверка

1 → 2 → 3 → 4 → 5. После каждого backend-этапа: `./gradlew build`. После frontend: `npm run build` в `frontend/snap`. Воркер и RabbitConfig НЕ трогаем (Redis pub/sub уже публикуется воркером).
