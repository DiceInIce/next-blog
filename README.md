## Быстрый старт

Простой гайд, чтобы запустить проект локально после клонирования из Git.

### Требования
- Node.js 18+ (рекомендуется 20+)
- npm 9+ (или совместимый пакетный менеджер)
- Доступная база данных PostgreSQL

### 1) Клонирование и установка
```bash
git clone https://github.com/DiceInIce/next-blog
cd nextjs-blog
npm install
```

### 2) Настройка переменных окружения
Создайте файл `.env` в корне проекта со значениями для вашей среды:
```env
# Подключение к PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# Секрет для подписи JWT (замените на надёжный)
JWT_SECRET="change-me-please"
```

### 3) Инициализация Prisma
Сгенерируйте клиент и примените схему к базе данных:
```bash
npm run db:generate
npm run db:push
```

> Примечание: В проекте есть скрипт сидирования `npm run db:seed`, но он может требовать корректировок под актуальную схему. Запускайте его только если вы проверили совместимость данных с `prisma/schema.prisma`.

### 4) Запуск в режиме разработки
```bash
npm run dev
```
Откройте `http://localhost:3000`.

### Продакшен-сборка
```bash
npm run build
npm start
```

### Полезные скрипты
- `npm run dev` — запуск дев-сервера
- `npm run build` — сборка приложения
- `npm start` — запуск собранного приложения
- `npm run lint` — проверка линтером
- `npm run db:generate` — генерация Prisma Client
- `npm run db:push` — применение схемы к БД
- `npm run db:seed` — заполнение БД тестовыми данными (проверьте совместимость)


