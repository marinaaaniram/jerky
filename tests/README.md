# Testing Guide - Jerky v2

Здесь находятся скрипты для удобного тестирования приложения через Docker.

## 📋 Структура

```
tests/
├── README.md                 # Этот файл
├── utils/                    # Вспомогательные скрипты
│   ├── auth.sh              # Аутентификация и получение токена
│   ├── helpers.sh           # Общие функции
│   └── setup.sh             # Инициализация тестов
├── bugs/                     # Тесты для найденных багов
│   ├── decimal-price-bug.sh # Тест на проблему с decimal price
│   └── [other-bugs].sh
├── features/                 # Тесты для новых функций
│   ├── order-management.sh  # Тестирование заказов
│   ├── delivery-surveys.sh  # Тестирование анкет доставки
│   └── [other-features].sh
└── data/                     # Данные для тестов
    └── sample-requests.json  # Примеры API запросов
```

## 🚀 Быстрый старт

### 1. Убедитесь что Docker запущен

```bash
docker-compose up --build -d
sleep 20  # Ждём инициализации БД
```

### 2. Запустите тест

```bash
# Тест бага с decimal price
bash tests/bugs/decimal-price-bug.sh

# Тест функции управления заказами
bash tests/features/order-management.sh
```

## 📝 Как использовать вспомогательные функции

### Получение токена

```bash
# В вашем скрипте:
source tests/utils/auth.sh

TOKEN=$(get_token "ivan@jerky.com" "password123")
echo "Token: $TOKEN"
```

### Использование helpers

```bash
source tests/utils/helpers.sh

# Красивый вывод
print_heading "Testing Orders API"
print_success "Order created successfully"
print_error "Failed to create order"

# JSON запросы
API_GET "http://localhost:3000/api/orders/1" "$TOKEN"
API_POST "http://localhost:3000/api/orders" "$TOKEN" '{"customerId": 1}'
```

## 🐛 Как добавить новый тест бага

1. Создайте файл в `tests/bugs/`:

```bash
# tests/bugs/new-bug.sh
#!/bin/bash

source ../utils/auth.sh
source ../utils/helpers.sh

TOKEN=$(get_token "ivan@jerky.com" "password123")

print_heading "Testing: New Bug"
print_info "Описание бага..."

# Тест
API_POST "http://localhost:3000/api/orders" "$TOKEN" '{"customerId": 1}' | jq '.'

print_success "Bug fixed! ✅"
```

2. Сделайте его исполняемым:

```bash
chmod +x tests/bugs/new-bug.sh
```

3. Запустите:

```bash
bash tests/bugs/new-bug.sh
```

## ✨ Как добавить тест новой функции

1. Создайте файл в `tests/features/`:

```bash
# tests/features/new-feature.sh
#!/bin/bash

source ../utils/auth.sh
source ../utils/helpers.sh

TOKEN=$(get_token "ivan@jerky.com" "password123")

print_heading "Testing: New Feature"

# Подготовка данных
print_info "Creating test data..."

# Основной тест
print_info "Testing functionality..."

# Проверка результатов
print_success "Feature works correctly! ✅"
```

2. Запустите:

```bash
bash tests/features/new-feature.sh
```

## 🔍 Примеры скриптов

### Простой GET запрос

```bash
curl -s "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### POST с данными

```bash
curl -s -X POST "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "notes": "Test order"}' | jq '.'
```

### Проверка типа значения

```bash
# Проверить что price - это число, а не строка
curl -s "http://localhost:3000/api/orders/2" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.orderItems[0].price | {value: ., type: (. | type)}'
```

## 📊 Полезные jq фильтры

```bash
# Только ID и статус
jq '.[] | {id, status}'

# Все цены
jq '.orderItems[].price'

# Проверить все цены - числа ли это
jq '.orderItems[] | {id, price, isNumber: (.price | type == "number")}'

# Сложение (для проверки итога)
jq '[.orderItems[] | .price * .quantity] | add'
```

## ⚙️ Переменные окружения

Все скрипты используют локальные переменные по умолчанию:

- `API_URL=http://localhost:3000/api`
- `USER_EMAIL=ivan@jerky.com`
- `USER_PASSWORD=password123`

Можно переопределить:

```bash
API_URL=http://api.example.com \
USER_EMAIL=admin@example.com \
bash tests/features/order-management.sh
```

## 🎯 Сценарии тестирования

### Сценарий 1: Проверка бага с decimal price

```bash
# 1. Запустите Docker
docker-compose up --build -d && sleep 20

# 2. Создайте заказ
bash tests/features/order-management.sh

# 3. Проверьте что цены - числа
bash tests/bugs/decimal-price-bug.sh

# 4. Откройте фронтенд
# http://localhost:5173 → Заказы → Подробнее для заказа #2
```

### Сценарий 2: Тестирование новой функции

```bash
# 1. Создайте скрипт теста в tests/features/
vim tests/features/my-feature.sh

# 2. Добавьте тесты
# 3. Запустите
bash tests/features/my-feature.sh

# 4. Если всё ОК - обновите фронтенд и проверьте UI
# http://localhost:5173
```

## 🔧 Отладка

### Проверить логи backend'а

```bash
docker-compose logs backend -f
```

### Проверить состояние БД

```bash
docker exec jerky-postgres psql -U jerky_user -d jerky -c "SELECT * FROM orders LIMIT 5;"
```

### Перезагрузить контейнеры

```bash
docker-compose down -v
docker-compose up --build -d
sleep 20
```

## 📚 Полезные команды

```bash
# Получить все заказы
bash tests/utils/auth.sh && curl -s http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Создать заказ
bash tests/features/order-management.sh

# Проверить БД
docker exec jerky-postgres psql -U jerky_user -d jerky -c "\dt"

# Посмотреть последние 50 логов
docker-compose logs backend | tail -50
```

## 💡 Лучшие практики

1. **Всегда источите utils** перед использованием функций:
   ```bash
   source tests/utils/auth.sh
   source tests/utils/helpers.sh
   ```

2. **Используйте красивый вывод** для читаемости:
   ```bash
   print_heading "Test Name"
   print_info "Information"
   print_success "Success message"
   print_error "Error message"
   ```

3. **Сохраняйте токены в переменные**:
   ```bash
   TOKEN=$(get_token "user@email.com" "password")
   ```

4. **Используйте jq для красивого вывода JSON**:
   ```bash
   curl -s ... | jq '.'
   ```

5. **Проверяйте типы данных при работе с numbers**:
   ```bash
   jq '.price | {value: ., type: (. | type)}'
   ```

---

**Версия:** 1.0
**Последнее обновление:** 2025-12-19
**Автор:** Claude Code
