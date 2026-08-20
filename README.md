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

## База данных

При первом создании Docker volume PostgreSQL автоматически выполняет:

1. `database/schema.sql` — создание таблиц.
2. `database/reference_data.sql` — первоначальное заполнение справочников.

При последующих запусках контейнера эти скрипты повторно не выполняются, поэтому изменения справочников, сделанные через приложение, сохраняются.

Если база уже была создана до добавления файла со справочниками, применить его однократно после `docker compose up -d` можно так:

```bash
docker compose exec postgres psql -U migrants -d migrants_db -f /docker-entrypoint-initdb.d/02-reference-data.sql
```

## Структура

- `client/` — React/Vite-клиент.
- `server/` — Express/TypeScript API.
- `database/` — SQL-схема и скрипт отката.
