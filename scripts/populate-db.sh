#!/bin/bash

##############################################################################
# Database Population Script - Заполнение БД тестовыми данными (1000+ записей)
# Использует существующие API endpoints без изменения кода
##############################################################################

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Конфигурация
API_URL="${1:-http://localhost:3000}"
PARALLEL_REQUESTS=10
RECORDS_PER_TABLE=1000

# Счетчики
TOTAL_CREATED=0
TOTAL_FAILED=0

##############################################################################
# UTILITY FUNCTIONS
##############################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo -e "${BLUE}$1${NC}"
    echo "════════════════════════════════════════════════════════"
}

# Функция для подсчета прогресса
progress() {
    local current=$1
    local total=$2
    local width=30
    local percent=$((current * 100 / total))
    local filled=$((percent * width / 100))

    printf "\r["
    printf "%${filled}s" | tr ' ' '='
    printf "%$((width - filled))s" | tr ' ' '-'
    printf "] %d%% (%d/%d)" "$percent" "$current" "$total"
}

##############################################################################
# AUTHENTICATION
##############################################################################

get_token() {
    log_info "Получение токена аутентификации..."

    local response=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "ivan@jerky.com",
            "password": "password123"
        }')

    local token=$(echo "$response" | jq -r '.access_token' 2>/dev/null)

    if [ -z "$token" ] || [ "$token" == "null" ]; then
        log_error "Не удалось получить токен. Ответ: $response"
        return 1
    fi

    log_success "Токен получен: ${token:0:20}..."
    echo "$token"
}

##############################################################################
# CREATE USERS (1000 records)
##############################################################################

create_users() {
    print_header "СОЗДАНИЕ ПОЛЬЗОВАТЕЛЕЙ (1000 шт)"

    local token=$1
    local count=0
    local failed=0

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        local email="user$i@jerky.local"
        local firstName="Пользователь$i"
        local lastName="Тест$i"

        # Определяем роль (циклично через все роли)
        local role_id=$(( (i % 5) + 1 ))

        # Создаем пользователя
        local response=$(curl -s -X POST "$API_URL/api/users" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"email\": \"$email\",
                \"password\": \"Pass123!@#\",
                \"firstName\": \"$firstName\",
                \"lastName\": \"$lastName\",
                \"roleId\": $role_id
            }" 2>&1)

        local user_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано пользователей: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# CREATE CUSTOMERS (1000 records)
##############################################################################

create_customers() {
    print_header "СОЗДАНИЕ КЛИЕНТОВ (1000 шт)"

    local token=$1
    local count=0
    local failed=0

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        local name="Клиент №$i - ООО Компания"
        local phone="+7$((90000 + RANDOM % 9000000))$((10000 + RANDOM % 90000))"
        local email="client$i@example.com"
        local address="ул. Примерная, д. $(($i % 200 + 1)), г. Москва"
        local payment_type=$([ $((i % 2)) -eq 0 ] && echo "DIRECT" || echo "CONSIGNMENT")

        local response=$(curl -s -X POST "$API_URL/api/customers" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"name\": \"$name\",
                \"phone\": \"$phone\",
                \"email\": \"$email\",
                \"address\": \"$address\",
                \"paymentType\": \"$payment_type\"
            }" 2>&1)

        local customer_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$customer_id" ] && [ "$customer_id" != "null" ]; then
            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано клиентов: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# CREATE PRODUCTS (1000 records)
##############################################################################

create_products() {
    print_header "СОЗДАНИЕ ТОВАРОВ (1000 шт)"

    local token=$1
    local count=0
    local failed=0

    # Категории товаров
    local categories=("Электроника" "Бытовая техника" "Мебель" "Одежда" "Продукты" "Книги" "Игрушки" "Спорт")

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        local category="${categories[$((i % ${#categories[@]}))]}"
        local sku="SKU-$(printf "%06d" $i)"
        local name="Товар '$category' №$i"
        local description="Описание товара $i из категории $category с техническими характеристиками"
        local price=$((100 + RANDOM % 50000))
        local quantity=$((10 + RANDOM % 1000))

        local response=$(curl -s -X POST "$API_URL/api/products" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"sku\": \"$sku\",
                \"name\": \"$name\",
                \"description\": \"$description\",
                \"price\": $price,
                \"quantity\": $quantity
            }" 2>&1)

        local product_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$product_id" ] && [ "$product_id" != "null" ]; then
            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано товаров: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# CREATE ORDERS (1000 records) WITH ITEMS
##############################################################################

create_orders() {
    print_header "СОЗДАНИЕ ЗАКАЗОВ (1000 шт) С ТОВАРАМИ"

    local token=$1
    local count=0
    local failed=0

    # Получаем ID клиентов и товаров для случайного выбора
    local customer_ids=$(curl -s "$API_URL/api/customers?limit=1000" \
        -H "Authorization: Bearer $token" | jq -r '.[].id' 2>/dev/null | head -100)

    local product_ids=$(curl -s "$API_URL/api/products?limit=1000" \
        -H "Authorization: Bearer $token" | jq -r '.[].id' 2>/dev/null | head -100)

    if [ -z "$customer_ids" ] || [ -z "$product_ids" ]; then
        log_error "Не удалось получить ID клиентов или товаров"
        return 1
    fi

    local customers=($customer_ids)
    local products=($product_ids)

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        # Выбираем случайного клиента и товар
        local customer_id=${customers[$((RANDOM % ${#customers[@]}))]

        # Создаем заказ
        local response=$(curl -s -X POST "$API_URL/api/orders" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"customerId\": $customer_id
            }" 2>&1)

        local order_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$order_id" ] && [ "$order_id" != "null" ]; then
            # Добавляем 2-5 товаров к заказу
            local items_count=$((2 + RANDOM % 4))

            for j in $(seq 1 $items_count); do
                local product_id=${products[$((RANDOM % ${#products[@]}))]
                local quantity=$((1 + RANDOM % 10))
                local price=$((100 + RANDOM % 50000))

                curl -s -X POST "$API_URL/api/orders/$order_id/items" \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer $token" \
                    -d "{
                        \"productId\": $product_id,
                        \"quantity\": $quantity,
                        \"price\": $price
                    }" > /dev/null 2>&1
            done

            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано заказов: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# CREATE PAYMENTS (1000 records)
##############################################################################

create_payments() {
    print_header "СОЗДАНИЕ ПЛАТЕЖЕЙ (1000 шт)"

    local token=$1
    local count=0
    local failed=0

    # Получаем ID заказов
    local order_ids=$(curl -s "$API_URL/api/orders?limit=1000" \
        -H "Authorization: Bearer $token" | jq -r '.[].id' 2>/dev/null | head -500)

    if [ -z "$order_ids" ]; then
        log_error "Не удалось получить ID заказов"
        return 1
    fi

    local orders=($order_ids)
    local count_orders=${#orders[@]}

    if [ $count_orders -eq 0 ]; then
        log_error "Нет заказов для создания платежей"
        return 1
    fi

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        local order_id=${orders[$((RANDOM % count_orders))]}
        local amount=$((100 + RANDOM % 500000))
        local payment_date=$(date -d "-$((RANDOM % 365)) days" +%Y-%m-%d)

        local response=$(curl -s -X POST "$API_URL/api/payments" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"orderId\": $order_id,
                \"amount\": $amount,
                \"paymentDate\": \"$payment_date\"
            }" 2>&1)

        local payment_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$payment_id" ] && [ "$payment_id" != "null" ]; then
            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано платежей: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# CREATE PRICE RULES (1000 records)
##############################################################################

create_price_rules() {
    print_header "СОЗДАНИЕ ПРАВИЛ ЦЕН (1000 шт)"

    local token=$1
    local count=0
    local failed=0

    # Получаем ID клиентов и товаров
    local customer_ids=$(curl -s "$API_URL/api/customers?limit=1000" \
        -H "Authorization: Bearer $token" | jq -r '.[].id' 2>/dev/null | head -100)

    local product_ids=$(curl -s "$API_URL/api/products?limit=1000" \
        -H "Authorization: Bearer $token" | jq -r '.[].id' 2>/dev/null | head -100)

    if [ -z "$customer_ids" ] || [ -z "$product_ids" ]; then
        log_error "Не удалось получить ID клиентов или товаров"
        return 1
    fi

    local customers=($customer_ids)
    local products=($product_ids)

    for i in $(seq 1 $RECORDS_PER_TABLE); do
        progress $i $RECORDS_PER_TABLE

        local customer_id=${customers[$((RANDOM % ${#customers[@]}))]
        local product_id=${products[$((RANDOM % ${#products[@]}))]
        local special_price=$((50 + RANDOM % 40000))

        local response=$(curl -s -X POST "$API_URL/api/price-rules" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"customerId\": $customer_id,
                \"productId\": $product_id,
                \"specialPrice\": $special_price
            }" 2>&1)

        local rule_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ ! -z "$rule_id" ] && [ "$rule_id" != "null" ]; then
            ((count++))
            ((TOTAL_CREATED++))
        else
            ((failed++))
            ((TOTAL_FAILED++))
        fi
    done

    echo ""
    log_success "Создано правил цен: $count"
    if [ $failed -gt 0 ]; then
        log_warning "Ошибок: $failed"
    fi
}

##############################################################################
# MAIN
##############################################################################

main() {
    print_header "🚀 ЗАПОЛНЕНИЕ БД ТЕСТОВЫМИ ДАННЫМИ"

    log_info "API URL: $API_URL"
    log_info "Количество записей на таблицу: $RECORDS_PER_TABLE"

    # Проверяем доступность API
    if ! curl -s "$API_URL/api/auth/login" -o /dev/null 2>&1; then
        log_error "API недоступна по адресу: $API_URL"
        log_info "Убедитесь, что backend запущен: docker-compose up"
        exit 1
    fi

    # Получаем токен
    TOKEN=$(get_token) || exit 1

    # Создаем данные
    create_users "$TOKEN" || log_warning "Ошибка при создании пользователей"
    create_customers "$TOKEN" || log_warning "Ошибка при создании клиентов"
    create_products "$TOKEN" || log_warning "Ошибка при создании товаров"
    create_orders "$TOKEN" || log_warning "Ошибка при создании заказов"
    create_payments "$TOKEN" || log_warning "Ошибка при создании платежей"
    create_price_rules "$TOKEN" || log_warning "Ошибка при создании правил цен"

    # Итоговый отчет
    print_header "📊 ИТОГОВЫЙ ОТЧЕТ"

    echo ""
    echo "✅ Всего создано: $TOTAL_CREATED записей"
    echo "❌ Всего ошибок: $TOTAL_FAILED"
    echo ""

    if [ $TOTAL_CREATED -gt 0 ]; then
        log_success "База данных успешно заполнена!"
        log_info "Приложение готово к работе: $API_URL"
    else
        log_error "Не удалось создать данные. Проверьте логи."
        exit 1
    fi
}

# Запуск
main "$@"
