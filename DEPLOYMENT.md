# Deployment Guide

## Overview

Проект использует два docker-compose конфига для разных окружений:
- **docker-compose.yml** - локальная разработка (Vite hot reload)
- **docker-compose.prod.yml** - production сервер (nginx)

---

## Локальная разработка

### Первый запуск

```bash
# Перейти в корень проекта
cd jerky

# Поднять контейнеры с dev конфигом
docker-compose up --build

# Или если нужно в фоне
docker-compose up -d --build
```

### Доступ

- **Frontend (Vite dev server)**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

### Hot Reload

При изменении файлов в `frontend/src/` или `backend/src/` контейнеры **автоматически перезагружаются**.

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f frontend    # Только frontend
docker-compose logs -f backend     # Только backend
docker-compose logs -f             # Все сервисы

# Остановка контейнеров
docker-compose down

# Пересборка (если обновились зависимости)
docker-compose up --build

# Очистка всего (включая БД)
docker-compose down -v
```

---

## Production (Сервер)

### Подготовка

```bash
# Перейти в корень проекта на сервере
cd jerky

# Git pull обновлений (если нужны)
git pull
```

### Первый запуск на сервере

```bash
# Поднять контейнеры с production конфигом
docker-compose -f docker-compose.prod.yml up --build -d
```

### Доступ

- **Frontend (Nginx)**: http://95.81.102.27 (порт 80)
- **Backend API**: http://95.81.102.27:3000
- **Database**: localhost:5432 (доступна только внутри контейнеров)

### Команды на сервере

```bash
# Просмотр статуса контейнеров
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Остановка
docker-compose -f docker-compose.prod.yml down

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml up --build -d

# Очистка данных БД (осторожно!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## Ключевые различия dev vs prod

| Параметр | Dev | Prod |
|----------|-----|------|
| **Frontend** | Vite dev server (5173) | Nginx (80) |
| **Hot Reload** | Да ✅ | Нет |
| **Build Time** | Медленнее | Быстрее |
| **Performance** | Для разработки | Оптимизирована |
| **NODE_ENV** | development | production |
| **Ports** | 5173, 3000, 5432 | 80, 443, 3000, 5432 |

---

## Переменные окружения

### Backend (.env в контейнере)

- `DATABASE_HOST` - хост БД (postgres в контейнере)
- `DATABASE_PORT` - порт БД (5432)
- `DATABASE_NAME` - имя БД (jerky)
- `DATABASE_USER` - пользователь БД
- `DATABASE_PASSWORD` - пароль БД
- `JWT_SECRET` - секретный ключ JWT
- `NODE_ENV` - development/production

### Frontend (VITE_API_URL)

- **Dev**: `http://backend:3000` (имя контейнера в Docker сети)
- **Prod**: Не требуется (nginx проксирует `/api` на backend)

---

## Troubleshooting

### Сайт не доступен на сервере

```bash
# Проверить статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Если какой-то контейнер не запущен, посмотреть логи
docker-compose -f docker-compose.prod.yml logs frontend
```

### Frontend подключается к localhost:3000 вместо backend

**Dev**: Это ок, VITE_API_URL = http://backend:3000 (имя хоста в Docker сети)

**Prod**: Frontend использует относительный путь `/api`, который nginx проксирует на backend

### Port already in use

```bash
# Найти процесс на порту 5173
lsof -i :5173

# Или убить все контейнеры и пересоздать
docker-compose down
docker-compose up -d
```

### Git pull не работает в контейнере

Вам нужно делать `git pull` на хосте (сервере), затем пересоздавать контейнеры:

```bash
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## Развертывание обновлений

### На локальной машине

```bash
# Убедитесь, что изменения закоммичены
git add .
git commit -m "Your message"
git push

# Перестартуйте контейнеры
docker-compose down
docker-compose up --build -d
```

### На сервере

```bash
# Скачать обновления
git pull

# Пересоздать контейнеры с новым кодом
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Проверить статус
docker-compose -f docker-compose.prod.yml ps
```

---

## Дополнительно

### Если нужно изменить переменные окружения

Отредактируйте соответствующий `docker-compose.yml` в блоке `environment:` и пересоздайте контейнеры:

```bash
# Dev
docker-compose up --build -d

# Prod
docker-compose -f docker-compose.prod.yml up --build -d
```

### Backup БД

```bash
# Сделать dump БД
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U jerky_user jerky > backup.sql

# Восстановить
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U jerky_user jerky < backup.sql
```
