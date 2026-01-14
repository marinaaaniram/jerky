# Jerky v2 - Delivery Management System

Современная система управления доставками на стеке NestJS + React + PostgreSQL.

## Технологический стек

### Backend
- NestJS 10
- TypeORM 0.3
- PostgreSQL 15
- Passport + JWT (authentication)
- bcrypt (password hashing)

### Frontend
- React 18
- Vite 5
- TypeScript 5
- Mantine v7 (UI library)
- TanStack Query (server state)
- Zustand (client state)
- React Router 6

## Структура проекта

```
jerky-v2/
├── backend/          # NestJS backend
├── frontend/         # React + Vite frontend
└── docker-compose.yml
```

## Быстрый старт

### Локальная разработка (Docker)

Используйте **docker-compose.yml** для разработки с горячей перезагрузкой (hot reload):

```bash
# Запустить контейнеры
docker-compose up --build

# Доступ:
# Frontend:     http://localhost:5173
# Backend API:  http://localhost:3000
# PostgreSQL:   localhost:5432
```

✅ При изменении кода в `src/` папках контейнеры автоматически перезагружаются

### Production сервер

Используйте **docker-compose.prod.yml** для оптимизированной production сборки:

```bash
# На сервере
docker compose -f /opt/jerky/docker-compose.prod.yml up --build -d

# Доступ:
# Frontend:     http://95.81.102.27 (или ваш IP)
# Backend API:  http://95.81.102.27:3000
```

### Локальная разработка (без Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env  # Настройте переменные окружения

# Запустить PostgreSQL (если не используете Docker)
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_DB=jerky \
  -e POSTGRES_USER=jerky_user \
  -e POSTGRES_PASSWORD=jerky_password \
  postgres:15-alpine

# Запустить миграции
npm run migration:run

# Запустить seeders
npm run seed:run

# Запустить в режиме разработки
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install

# Запустить в режиме разработки
npm run dev
```

---

## Развертывание

**Полная инструкция** в файле [DEPLOYMENT.md](./DEPLOYMENT.md):
- Пошаговые команды для dev и prod
- Как обновлять код на сервере
- Решение проблем (troubleshooting)
- Backup база данных

## Работа с базой данных (TypeORM)

```bash
cd backend

# Создать новую миграцию
npm run migration:create --name=MigrationName

# Запустить миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert

# Создать seeder
npm run seed:create --name=SeederName

# Запустить все seeders
npm run seed:run
```

## MVP Scope

Первая версия включает критическую функциональность:

### Backend MVP
- Auth module (регистрация, логин, JWT)
- Users & Roles modules
- **Orders module** (полная функциональность с транзакциями)
- **Delivery Surveys module** (с фото в base64)
- Products module (минимум для заказов)
- Customers module (минимум для заказов)
- Stock Movements (автоматически при доставке)
- Payments (обновление долга)

### Frontend MVP
- LoginPage (email + password)
- **OrdersPage** (список заказов)
- **OrderDetailsPage** (управление заказом, добавление товаров, смена статуса, анкета курьера)
- Базовая навигация по ролям

## Ключевые бизнес-правила

1. **Расчет долга**: при доставке с payment_type='реализация' → debt += order_total
2. **Управление складом**: при доставке → stock_quantity -= quantity + StockMovement
3. **Специальные цены**: проверка price_rule при добавлении товара в заказ
4. **Статусы заказов**: Новый → В сборке → Передан курьеру → Доставлен
5. **Анкета курьера**: ОБЯЗАТЕЛЬНА при переходе в статус "Доставлен"

## Роли и права доступа

- **Руководитель**: полный доступ
- **Менеджер по продажам**: клиенты, заказы, отчеты
- **Кладовщик**: заказы, товары, управление складом
- **Курьер**: заказы (смена статуса, анкеты)
- **Наблюдатель**: read-only

## Разработка

### Backend

```bash
# Запуск в dev режиме с hot-reload
npm run start:dev

# Сборка для production
npm run build

# Запуск тестов
npm run test

# Линтинг
npm run lint
```

### Frontend

```bash
# Dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## API Documentation

После запуска backend, Swagger доступен по адресу: http://localhost:3000/api

## Environment Variables

### Backend (.env)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=jerky
DATABASE_USER=jerky_user
DATABASE_PASSWORD=jerky_password
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
```

## Следующие этапы (после MVP)

Phase 2:
- CustomersPage (детальное управление клиентами)
- ProductsPage (ручное управление складом)
- ReportsPage (отчеты по продажам)
- Price Rules UI
- Offline support для критических данных

## License

MIT
