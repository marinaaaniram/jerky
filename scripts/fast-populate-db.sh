#!/bin/bash

##############################################################################
# Fast Database Population - Быстрое заполнение БД через прямое взаимодействие
# Работает напрямую с PostgreSQL, минуя API (в 10x раз быстрее)
##############################################################################

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo -e "${BLUE}$1${NC}"
    echo "════════════════════════════════════════════════════════"
}

# Параметры
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-jerky}"
DB_USER="${DB_USER:-jerky_user}"
DB_PASSWORD="${DB_PASSWORD:-jerky_password}"
RECORDS_PER_TABLE="${1:-1000}"

print_header "⚡ БЫСТРОЕ ЗАПОЛНЕНИЕ БД (SQL способ)"

log_info "Параметры подключения:"
log_info "  Host: $DB_HOST:$DB_PORT"
log_info "  Database: $DB_NAME"
log_info "  Записей на таблицу: $RECORDS_PER_TABLE"

# Проверяем подключение
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    log_error "Не удалось подключиться к БД"
    log_info "Попробуйте: docker exec jerky-postgres psql -U jerky_user -d jerky"
    exit 1
fi

log_success "Подключение к БД успешно"

# Создаем временный SQL файл
TEMP_SQL="/tmp/populate_db_$$.sql"

cat > "$TEMP_SQL" << 'EOF'
-- ================================================================
-- БЫСТРОЕ ЗАПОЛНЕНИЕ БД ТЕСТОВЫМИ ДАННЫМИ
-- ================================================================

-- Отключаем проверки уникальности и foreign keys для скорости
ALTER TABLE users DISABLE TRIGGER ALL;
ALTER TABLE customers DISABLE TRIGGER ALL;
ALTER TABLE products DISABLE TRIGGER ALL;
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE payments DISABLE TRIGGER ALL;
ALTER TABLE price_rules DISABLE TRIGGER ALL;

-- ================================================================
-- 1. ПОЛЬЗОВАТЕЛИ (1000)
-- ================================================================

INSERT INTO users (email, password, "firstName", "lastName", "roleId", "createdAt", "updatedAt")
SELECT
    'user' || generate_series(1, $1) || '@jerky.local' as email,
    '$2b$10$N9qo8uLOickgx2ZMRZoHyeIVfH6iRnmvxVaHMn0CKvU0L8XPrX.8K' as password, -- "password"
    'Пользователь' || generate_series(1, $1) as "firstName",
    'Тест' || generate_series(1, $1) as "lastName",
    ((generate_series(1, $1) - 1) % 5) + 1 as "roleId",
    NOW() as "createdAt",
    NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email LIKE 'user%@jerky.local');

-- ================================================================
-- 2. КЛИЕНТЫ (1000)
-- ================================================================

INSERT INTO customers (name, phone, email, address, "paymentType", debt, "createdAt", "updatedAt")
SELECT
    'Клиент №' || generate_series(1, $1) || ' - ООО Компания' as name,
    '+7' || (900000000 + generate_series(1, $1)) as phone,
    'client' || generate_series(1, $1) || '@example.com' as email,
    'ул. Примерная, д. ' || ((generate_series(1, $1) % 200) + 1) || ', г. Москва' as address,
    CASE WHEN generate_series(1, $1) % 2 = 0 THEN 'DIRECT' ELSE 'CONSIGNMENT' END as "paymentType",
    0 as debt,
    NOW() as "createdAt",
    NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name LIKE 'Клиент №%');

-- ================================================================
-- 3. ТОВАРЫ (1000)
-- ================================================================

INSERT INTO products (sku, name, description, price, quantity, "createdAt", "updatedAt")
SELECT
    'SKU-' || LPAD(generate_series(1, $1)::text, 6, '0') as sku,
    'Товар №' || generate_series(1, $1) as name,
    'Описание товара ' || generate_series(1, $1) || ' с техническими характеристиками' as description,
    (100 + ((generate_series(1, $1) * 137) % 50000))::numeric(10, 2) as price,
    10 + ((generate_series(1, $1) * 271) % 1000) as quantity,
    NOW() as "createdAt",
    NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku LIKE 'SKU-%');

-- ================================================================
-- 4. ЗАКАЗЫ (1000) С ТОВАРАМИ
-- ================================================================

INSERT INTO orders (
    "customerId", status, "deliveryAddress", "deliveryPhone",
    "totalAmount", "createdAt", "updatedAt"
)
SELECT
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1) as "customerId",
    'Новый' as status,
    'ул. Доставки, д. ' || ((generate_series(1, $1) % 200) + 1) as "deliveryAddress",
    '+7' || (900000000 + generate_series(1, $1)) as "deliveryPhone",
    ((generate_series(1, $1) * 321) % 500000)::numeric(10, 2) as "totalAmount",
    NOW() - (random() * '365 days'::interval) as "createdAt",
    NOW() - (random() * '365 days'::interval) as "updatedAt"
WHERE NOT EXISTS (
    SELECT 1 FROM orders WHERE "totalAmount" > 0 LIMIT 1
);

-- Добавляем товары к заказам (2-5 товаров за заказ)
INSERT INTO order_items (
    "orderId", "productId", quantity, price, "createdAt", "updatedAt"
)
SELECT
    o.id as "orderId",
    (SELECT id FROM products ORDER BY RANDOM() LIMIT 1) as "productId",
    1 + ((random() * 10)::int) as quantity,
    ((random() * 50000)::numeric(10, 2)) as price,
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM orders o,
     generate_series(1, $1 * 3) as i
WHERE NOT EXISTS (
    SELECT 1 FROM order_items LIMIT 1
);

-- ================================================================
-- 5. ПЛАТЕЖИ (1000)
-- ================================================================

INSERT INTO payments (
    "orderId", amount, "paymentDate", status, "createdAt", "updatedAt"
)
SELECT
    (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1) as "orderId",
    ((generate_series(1, $1) * 431) % 500000)::numeric(10, 2) as amount,
    NOW()::date - (random() * 365)::int as "paymentDate",
    'COMPLETED' as status,
    NOW() as "createdAt",
    NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM payments LIMIT 1);

-- ================================================================
-- 6. ПРАВИЛА ЦЕН (1000)
-- ================================================================

INSERT INTO price_rules (
    "customerId", "productId", "specialPrice", "createdAt", "updatedAt"
)
SELECT
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1) as "customerId",
    (SELECT id FROM products ORDER BY RANDOM() LIMIT 1) as "productId",
    ((generate_series(1, $1) * 523) % 40000)::numeric(10, 2) as "specialPrice",
    NOW() as "createdAt",
    NOW() as "updatedAt"
WHERE NOT EXISTS (SELECT 1 FROM price_rules LIMIT 1);

-- ================================================================
-- Включаем триггеры
-- ================================================================

ALTER TABLE users ENABLE TRIGGER ALL;
ALTER TABLE customers ENABLE TRIGGER ALL;
ALTER TABLE products ENABLE TRIGGER ALL;
ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE payments ENABLE TRIGGER ALL;
ALTER TABLE price_rules ENABLE TRIGGER ALL;

-- ================================================================
-- СТАТИСТИКА
-- ================================================================

SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM orders) as orders_count,
    (SELECT COUNT(*) FROM order_items) as order_items_count,
    (SELECT COUNT(*) FROM payments) as payments_count,
    (SELECT COUNT(*) FROM price_rules) as price_rules_count;
EOF

# Подставляем количество записей в SQL
sed -i "s/\$1/$RECORDS_PER_TABLE/g" "$TEMP_SQL"

log_info "Выполняем SQL запросы..."

# Выполняем SQL
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$TEMP_SQL"; then
    log_success "SQL запросы выполнены успешно!"

    # Получаем статистику
    print_header "📊 ИТОГОВАЯ СТАТИСТИКА"

    STATS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t << 'SQLSTATS'
SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM orders) as orders_count,
    (SELECT COUNT(*) FROM order_items) as order_items_count,
    (SELECT COUNT(*) FROM payments) as payments_count,
    (SELECT COUNT(*) FROM price_rules) as price_rules_count;
SQLSTATS
)

    echo "$STATS" | while read users customers products orders order_items payments price_rules; do
        echo ""
        echo "📊 Количество записей в каждой таблице:"
        echo "  👥 Users:       $users"
        echo "  🏢 Customers:   $customers"
        echo "  📦 Products:    $products"
        echo "  📋 Orders:      $orders"
        echo "  🛒 OrderItems:  $order_items"
        echo "  💳 Payments:    $payments"
        echo "  💰 PriceRules:  $price_rules"
        echo ""

        TOTAL=$((users + customers + products + orders + order_items + payments + price_rules))
        log_success "Всего создано записей: $TOTAL"
    done

    log_success "База данных успешно заполнена!"
else
    log_error "Ошибка при выполнении SQL запросов"
    rm "$TEMP_SQL"
    exit 1
fi

# Удаляем временный файл
rm "$TEMP_SQL"

echo ""
log_info "Приложение готово к работе!"
log_info "Откройте http://localhost:5173 для тестирования"
