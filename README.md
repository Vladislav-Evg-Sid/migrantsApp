# migrantsApp

Приложение для загрузки и обработки результатов тестирования знаний русского языка у мигрантов.

## Локальный запуск

Требования: Node.js 22+, npm и Docker.

1. Из корня проекта выполнить:

   ```bash
   docker compose up -d
   ```

2. Настроить окружение из .env.example:

3. Запустить бэкенд:

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. Проверьте подключение к базе данных: `GET http://localhost:3000/api/health`.

## Структура

- `client/` — React/Vite-клиент.
- `server/` — Express/TypeScript API.
- `database/` — SQL-схема и скрипт отката.
