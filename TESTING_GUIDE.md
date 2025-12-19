# 🧪 Testing Guide - Jerky v2

Быстрая справка для тестирования приложения через Docker.

## 📦 Что создано

Полная инфраструктура для удобного тестирования багов и новых функций:

```
tests/
├── README.md                      # Полный гайд (100+ строк)
├── utils/
│   ├── auth.sh                    # Аутентификация
│   ├── helpers.sh                 # Вспомогательные функции
│   └── setup.sh                   # Инициализация
├── bugs/
│   └── decimal-price-bug.sh      # Тест для найденного бага ✓
├── features/
│   └── order-management.sh       # Пример теста функции
└── data/
    └── api-examples.sh           # 20+ примеров API запросов
```

## 🚀 Быстрый старт

### Проверить что бага с decimal price ИСПРАВЛЕН:

```bash
# Тест автоматически:
# ✓ Проверит что Docker запущен
# ✓ Дождётся когда backend будет готов
# ✓ Создаст заказ с товарами
# ✓ Проверит что все цены - это числа, а не строки
# ✓ Вычислит итого и проверит его тип

bash tests/bugs/decimal-price-bug.sh
```

**Ожидаемый результат:**
```
✅ All checks passed! Bug is FIXED ✅
Passed: 3 | Failed: 0
```

### Тестировать новую функцию:

```bash
bash tests/features/order-management.sh
```

## 💡 Используемые функции

### Аутентификация

```bash
source tests/utils/auth.sh

# Получить токен
TOKEN=$(get_token "ivan@jerky.com" "password123")

# Сохранить токен
save_token "$TOKEN" /tmp/my_token.txt

# Проверить токен
verify_token "$TOKEN"
```

### Красивый вывод

```bash
source tests/utils/helpers.sh

print_heading "My Test"        # Заголовок
print_info "Information"       # Информация
print_success "All good!"      # Успех
print_error "Something wrong"  # Ошибка
print_warning "Be careful"     # Предупреждение
```

### API запросы

```bash
# GET
API_GET "http://localhost:3000/api/orders" "$TOKEN"

# POST
API_POST "http://localhost:3000/api/orders" "$TOKEN" '{"customerId": 1}'

# Проверка
assert_equal "$value" "expected_value" "my_value"
assert_is_number "$price" "product_price"
```

## 📝 Примеры

### Проверить что цены - числа

```bash
curl -s http://localhost:3000/api/orders/2 \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.orderItems[] | {
    productName: .product.name,
    price,
    type: (.price | type),
    isNumber: (.price | type == "number")
  }'
```

### Создать заказ и добавить товары

```bash
source tests/utils/auth.sh
TOKEN=$(get_token)

# Создать
ORDER=$(curl -s -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1}')

ORDER_ID=$(echo "$ORDER" | jq '.id')

# Добавить товар
curl -s -X POST http://localhost:3000/api/orders/$ORDER_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

## 📋 Чек-лист перед коммитом

- [ ] Запустить тест бага: `bash tests/bugs/decimal-price-bug.sh`
- [ ] Запустить тест функции: `bash tests/features/order-management.sh`
- [ ] Проверить фронтенд: http://localhost:5173
- [ ] Все тесты ✅ PASSED?
- [ ] UI работает без ошибок?
- [ ] Готово к коммиту!

## 🔧 Отладка

```bash
# Логи backend'а
docker-compose logs backend -f

# Состояние контейнеров
docker-compose ps

# Перезагрузить всё
docker-compose down -v && docker-compose up --build -d && sleep 20

# Войти в контейнер
docker exec -it jerky-backend sh

# Запрос к БД
docker exec jerky-postgres psql -U jerky_user -d jerky -c "SELECT * FROM orders LIMIT 5;"
```

## 📚 Полная документация

Для полной информации см. `/tests/README.md` (100+ строк):
- Подробные примеры
- Создание собственных тестов
- Все доступные функции
- Сценарии тестирования
- Лучшие практики

## ✅ Статус

- ✅ Бог с decimal price - ИСПРАВЛЕН
- ✅ Тест для бага - РАБОТАЕТ
- ✅ Инфраструктура тестирования - ГОТОВА
- ✅ Документация - ПОЛНАЯ

---

**Версия:** 1.0
**Дата:** 2025-12-19
**Автор:** Claude Code
