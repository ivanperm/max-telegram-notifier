# MAX Web -> Telegram notifier

Личный read-only сервис уведомлений: открывает MAX Web через Playwright, читает непрочитанные сообщения из браузерного интерфейса и отправляет уведомления в Telegram.

Сервис не использует неофициальный API MAX, ничего не отправляет в MAX и не пишет сообщения от имени пользователя. Важно: чтобы прочитать полный текст сообщения, Playwright открывает чат в интерфейсе. Если MAX Web помечает чат прочитанным при открытии, это будет обычным побочным эффектом чтения через браузер.

## Что внутри

- Node.js 22
- Playwright `chromium.launchPersistentContext(...)`
- Telegram Bot API через встроенный `fetch`
- `dotenv`
- Railway Docker deploy
- Persistent profile: `/data/playwright-profile`
- Persistent state: `/data/state.json`
- Селекторы MAX Web вынесены в [`selectors.js`](./selectors.js)

## Переменные окружения

Скопируйте `.env.example` в `.env` для локального запуска:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
CHECK_INTERVAL_SECONDS=15
MAX_URL=https://web.max.ru
PLAYWRIGHT_PROFILE_DIR=/data/playwright-profile
STATE_FILE=/data/state.json
LOCAL_PLAYWRIGHT_PROFILE_DIR=./playwright-profile
```

На Railway обязательно задайте:

```env
TELEGRAM_BOT_TOKEN=123456:...
TELEGRAM_CHAT_ID=123456789
CHECK_INTERVAL_SECONDS=15
MAX_URL=https://web.max.ru
PLAYWRIGHT_PROFILE_DIR=/data/playwright-profile
STATE_FILE=/data/state.json
```

## Локальная первичная авторизация

Первичный вход через QR-код или SMS удобнее сделать локально:

```bash
npm install
npm run auth
```

Откроется обычное окно браузера. Войдите в MAX Web вручную. После успешной авторизации профиль сохранится в папку:

```text
./playwright-profile
```

Затем загрузите содержимое этой папки в Railway Volume по пути:

```text
/data/playwright-profile
```

После этого контейнер Railway сможет использовать уже авторизованную сессию.

## Railway

1. Создайте Railway project.
2. Подключите репозиторий.
3. Добавьте Persistent Volume и примонтируйте его к:

```text
/data
```

4. Задайте переменные окружения из `.env.example`.
5. Загрузите локально созданный Playwright profile в:

```text
/data/playwright-profile
```

6. Задеплойте сервис.

Проект использует `Dockerfile` на базе официального образа Playwright, поэтому браузеры и системные зависимости уже есть в контейнере.

## Запуск

Основной режим:

```bash
npm start
```

Каждые `CHECK_INTERVAL_SECONDS` секунд сервис:

1. Проверяет авторизацию в MAX Web.
2. Получает список чатов.
3. Находит чаты с непрочитанными сообщениями.
4. Открывает такие чаты и читает последние входящие сообщения.
5. Отправляет новые уведомления в Telegram.
6. Запоминает отправленные уведомления в `/data/state.json`.

## Диагностика селекторов

MAX Web может менять DOM и CSS-классы. Для диагностики есть команда:

```bash
npm run inspect
```

Она выводит:

- найденные чаты;
- количество непрочитанных сообщений;
- найденные селекторы;
- статус авторизации.

Чтобы оставить браузер открытым после диагностики:

```bash
KEEP_BROWSER_OPEN=true npm run inspect
```

Если селекторы перестали работать, правьте только [`selectors.js`](./selectors.js).

## Формат уведомления

Для текстового сообщения:

```text
📩 Новое сообщение

Чат: <название>

От: <автор>

Текст:
<текст сообщения>

Время: <время>
```

Если текст не найден:

```text
📩 Новое сообщение (вложение)
```

## Ограничения

- Это browser automation, а не официальный API.
- Точные селекторы MAX Web нужно проверить через `npm run inspect`.
- Если MAX Web меняет интерфейс, обновите `selectors.js`.
- Если Railway запускается без готового профиля, сервис будет ждать авторизации, но пройти QR/SMS внутри headless-контейнера обычно неудобно. Используйте `npm run auth` локально.
