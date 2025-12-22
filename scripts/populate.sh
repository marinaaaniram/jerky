#!/bin/bash

##############################################################################
# Main Database Population Script - выбор способа заполнения
##############################################################################

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
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

# Главное меню
show_menu() {
    print_header "📊 ВЫБОР СПОСОБА ЗАПОЛНЕНИЯ БД"

    echo ""
    echo -e "${CYAN}1)${NC} ⚡ БЫСТРЫЙ способ (SQL - рекомендуется)"
    echo "   Время: ~30 сек"
    echo "   Плюсы: Очень быстро, напрямую в БД"
    echo "   Минусы: Требует доступа к PostgreSQL"
    echo ""

    echo -e "${CYAN}2)${NC} 🚀 ОБЫЧНЫЙ способ (API)"
    echo "   Время: ~20-25 минут"
    echo "   Плюсы: Протестирует все API endpoints"
    echo "   Минусы: Медленнее"
    echo ""

    echo -e "${CYAN}3)${NC} 📖 Показать справку"
    echo "   Открыть подробную документацию"
    echo ""

    echo -e "${CYAN}0)${NC} ❌ Выход"
    echo ""
}

# Проверка зависимостей
check_dependencies() {
    local missing=0

    if ! command -v curl &> /dev/null; then
        log_error "curl не установлен"
        missing=1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq не установлен"
        missing=1
    fi

    if ! command -v psql &> /dev/null; then
        log_error "psql не установлен"
        missing=1
    fi

    if [ $missing -eq 1 ]; then
        log_error "Установите недостающие зависимости"
        exit 1
    fi

    log_success "Все зависимости установлены"
}

# Проверка Docker
check_docker() {
    log_info "Проверка Docker контейнеров..."

    if ! docker ps > /dev/null 2>&1; then
        log_error "Docker не запущен"
        exit 1
    fi

    if ! docker exec jerky-postgres psql -U jerky_user -d jerky -c "SELECT 1" > /dev/null 2>&1; then
        log_error "PostgreSQL контейнер не запущен"
        log_info "Запустите: docker-compose up -d"
        exit 1
    fi

    log_success "Docker контейнеры готовы"
}

# Быстрое заполнение (SQL)
run_fast_populate() {
    print_header "⚡ БЫСТРОЕ ЗАПОЛНЕНИЕ БД (SQL)"

    local records=${1:-1000}
    log_info "Создание $records записей в каждую таблицу..."

    check_docker

    local db_host="127.0.0.1"
    local db_port="5432"
    local db_name="jerky"
    local db_user="jerky_user"
    local db_password="jerky_password"

    # Создаем SQL скрипт
    local temp_sql="/tmp/populate_$$.sql"

    cat > "$temp_sql" << EOF
-- Отключаем триггеры
SET session_replication_role = 'replica';

-- Очищаем таблицы
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE price_rules CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE users CASCADE;

-- Сбрасываем последовательности
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE price_rules_id_seq RESTART WITH 1;

-- ================================================================
-- 1. ПОЛЬЗОВАТЕЛИ
-- ================================================================

INSERT INTO users (email, password, "firstName", "lastName", "roleId", "createdAt", "updatedAt")
SELECT
    'user' || i || '@jerky.local',
    '\$2b\$10\$N9qo8uLOickgx2ZMRZoHyeIVfH6iRnmvxVaHMn0CKvU0L8XPrX.8K',
    'Пользователь' || i,
    'Тест' || i,
    ((i - 1) % 5) + 1,
    NOW(),
    NOW()
FROM generate_series(1, $records) AS i;

-- ================================================================
-- 2. КЛИЕНТЫ
-- ================================================================

INSERT INTO customers (name, phone, email, address, "paymentType", debt, "createdAt", "updatedAt")
SELECT
    'Клиент №' || i || ' - ООО Компания',
    '+7' || (900000000 + i),
    'client' || i || '@example.com',
    'ул. Примерная, д. ' || ((i % 200) + 1) || ', г. Москва',
    CASE WHEN i % 2 = 0 THEN 'DIRECT' ELSE 'CONSIGNMENT' END,
    0,
    NOW(),
    NOW()
FROM generate_series(1, $records) AS i;

-- ================================================================
-- 3. ТОВАРЫ
-- ================================================================

INSERT INTO products (sku, name, description, price, quantity, "createdAt", "updatedAt")
SELECT
    'SKU-' || LPAD(i::text, 6, '0'),
    'Товар №' || i,
    'Описание товара ' || i || ' с техническими характеристиками',
    ((100 + ((i * 137) % 50000))::numeric(10, 2)),
    10 + ((i * 271) % 1000),
    NOW(),
    NOW()
FROM generate_series(1, $records) AS i;

-- ================================================================
-- 4. ЗАКАЗЫ (с товарами)
-- ================================================================

INSERT INTO orders ("customerId", status, "deliveryAddress", "deliveryPhone", "totalAmount", "createdAt", "updatedAt")
SELECT
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
    'Новый',
    'ул. Доставки, д. ' || ((i % 200) + 1),
    '+7' || (900000000 + i),
    ((i * 321) % 500000)::numeric(10, 2),
    NOW() - (i::int % 365)::interval day,
    NOW() - (i::int % 365)::interval day
FROM generate_series(1, $records) AS i;

-- Добавляем товары к заказам (3-5 товаров за заказ)
INSERT INTO order_items ("orderId", "productId", quantity, price, "createdAt", "updatedAt")
SELECT
    o.id,
    (SELECT id FROM products ORDER BY RANDOM() LIMIT 1),
    1 + (random() * 5)::int,
    ((random() * 50000)::numeric(10, 2)),
    NOW(),
    NOW()
FROM orders o
CROSS JOIN generate_series(1, 3) AS j;

-- ================================================================
-- 5. ПЛАТЕЖИ
-- ================================================================

INSERT INTO payments ("orderId", amount, "paymentDate", status, "createdAt", "updatedAt")
SELECT
    (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1),
    ((i * 431) % 500000)::numeric(10, 2),
    NOW()::date - (i % 365)::int,
    'COMPLETED',
    NOW(),
    NOW()
FROM generate_series(1, $records) AS i;

-- ================================================================
-- 6. ПРАВИЛА ЦЕН
-- ================================================================

INSERT INTO price_rules ("customerId", "productId", "specialPrice", "createdAt", "updatedAt")
SELECT
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM products ORDER BY RANDOM() LIMIT 1),
    ((i * 523) % 40000)::numeric(10, 2),
    NOW(),
    NOW()
FROM generate_series(1, $records) AS i;

-- Включаем триггеры
SET session_replication_role = 'default';

-- Статистика
SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM orders) as orders_count,
    (SELECT COUNT(*) FROM order_items) as order_items_count,
    (SELECT COUNT(*) FROM payments) as payments_count,
    (SELECT COUNT(*) FROM price_rules) as price_rules_count;
EOF

    log_info "Выполняю SQL запросы..."

    # Выполняем SQL
    if PGPASSWORD="$db_password" psql -h "$db_host" -U "$db_user" -d "$db_name" -f "$temp_sql" 2>&1 | tail -20; then
        log_success "База данных успешно заполнена!"
        rm "$temp_sql"
        return 0
    else
        log_error "Ошибка при заполнении БД"
        rm "$temp_sql"
        return 1
    fi
}

# Обычное заполнение (API)
run_normal_populate() {
    print_header "🚀 ЗАПОЛНЕНИЕ БД ЧЕРЕЗ API"

    local api_url="${1:-http://localhost:3000}"
    local records="${2:-1000}"

    log_info "API URL: $api_url"
    log_info "Записей на таблицу: $records"

    # Проверяем доступность API
    if ! curl -s "$api_url/api/auth/login" -o /dev/null 2>&1; then
        log_error "API недоступна по адресу: $api_url"
        exit 1
    fi

    log_success "API доступна"

    # Запускаем основной скрипт
    bash "$(dirname "$0")/populate-db.sh" "$api_url"
}

# Показать справку
show_help() {
    print_header "📖 СПРАВКА"

    less "$(dirname "$0")/POPULATE_README.md"
}

# Главная функция
main() {
    clear
    print_header "🎯 ЗАПОЛНЕНИЕ БД ТЕСТОВЫМИ ДАННЫМИ"

    log_info "Проверка зависимостей..."
    check_dependencies

    while true; do
        show_menu

        read -p "Выберите опцию (0-3): " choice

        case $choice in
            1)
                clear
                run_fast_populate 1000
                log_success "Готово! Откройте http://localhost:5173"
                break
                ;;
            2)
                clear
                run_normal_populate "http://localhost:3000" 1000
                log_success "Готово! Откройте http://localhost:5173"
                break
                ;;
            3)
                clear
                show_help
                ;;
            0)
                log_info "До встречи! 👋"
                exit 0
                ;;
            *)
                log_error "Неверный выбор"
                ;;
        esac

        echo ""
        read -p "Нажмите Enter для продолжения..."
    done
}

# Запуск
main "$@"
