#!/bin/bash

# api-examples.sh
# Примеры частых API запросов для тестирования

API_URL="http://localhost:3000/api"

# ===== АУТЕНТИФИКАЦИЯ =====

# Получить токен
get_token() {
  echo "GET /auth/login"
  curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"ivan@jerky.com","password":"password123"}' | jq '.'
}

# ===== ЗАКАЗЫ =====

# Список всех заказов
get_all_orders() {
  local token="$1"
  echo "GET /orders"
  curl -s "$API_URL/orders" \
    -H "Authorization: Bearer $token" | jq '.'
}

# Получить один заказ
get_order() {
  local order_id="$1"
  local token="$2"
  echo "GET /orders/$order_id"
  curl -s "$API_URL/orders/$order_id" \
    -H "Authorization: Bearer $token" | jq '.'
}

# Создать заказ
create_order() {
  local customer_id="$1"
  local token="$2"
  local notes="${3:-Test order}"
  echo "POST /orders"
  curl -s -X POST "$API_URL/orders" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"customerId\": $customer_id, \"notes\": \"$notes\"}" | jq '.'
}

# Добавить товар к заказу
add_item_to_order() {
  local order_id="$1"
  local product_id="$2"
  local quantity="$3"
  local token="$4"
  echo "POST /orders/$order_id/items"
  curl -s -X POST "$API_URL/orders/$order_id/items" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"productId\": $product_id, \"quantity\": $quantity}" | jq '.'
}

# Обновить статус заказа
update_order_status() {
  local order_id="$1"
  local status="$2"
  local token="$3"
  echo "PATCH /orders/$order_id/status"
  curl -s -X PATCH "$API_URL/orders/$order_id/status" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"status\": \"$status\"}" | jq '.'
}

# Получить итого заказа
get_order_total() {
  local order_id="$1"
  local token="$2"
  echo "GET /orders/$order_id/total"
  curl -s "$API_URL/orders/$order_id/total" \
    -H "Authorization: Bearer $token" | jq '.'
}

# ===== ТОВАРЫ =====

# Список всех товаров
get_all_products() {
  local token="$1"
  echo "GET /products"
  curl -s "$API_URL/products" \
    -H "Authorization: Bearer $token" | jq '.'
}

# Создать товар
create_product() {
  local name="$1"
  local price="$2"
  local stock="$3"
  local token="$4"
  echo "POST /products"
  curl -s -X POST "$API_URL/products" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$name\", \"price\": $price, \"stockQuantity\": $stock}" | jq '.'
}

# ===== КЛИЕНТЫ =====

# Список всех клиентов
get_all_customers() {
  local token="$1"
  echo "GET /customers"
  curl -s "$API_URL/customers" \
    -H "Authorization: Bearer $token" | jq '.'
}

# Создать клиента
create_customer() {
  local name="$1"
  local payment_type="$2"  # прямые или реализация
  local token="$3"
  echo "POST /customers"
  curl -s -X POST "$API_URL/customers" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$name\", \"paymentType\": \"$payment_type\"}" | jq '.'
}

# ===== ПРОВЕРКА ТИПОВ ДАННЫХ =====

# Проверить что цены - числа
check_prices_are_numbers() {
  local order_id="$1"
  local token="$2"
  echo "Checking price types in order $order_id"
  curl -s "$API_URL/orders/$order_id" \
    -H "Authorization: Bearer $token" | \
    jq '.orderItems[] | {
      id,
      productName: .product.name,
      price,
      priceType: (.price | type),
      isNumber: (.price | type == "number")
    }'
}

# Проверить что все значения decimal преобразованы в числа
check_decimal_fields() {
  local order_id="$1"
  local token="$2"
  echo "Checking all decimal fields in order $order_id"
  curl -s "$API_URL/orders/$order_id" \
    -H "Authorization: Bearer $token" | \
    jq '{
      order: {
        id,
        status,
        items: (.orderItems | length)
      },
      prices: {
        first: (.orderItems[0].price | {value: ., type: (. | type)}),
        types: [.orderItems[] | .price | type] | unique
      }
    }'
}

# ===== ПРИМЕРЫ ВЫЗОВОВ =====

if [ "$1" = "demo" ]; then
  echo "=== API Examples Demo ==="
  echo ""

  TOKEN=$(get_token | jq -r '.access_token')
  echo "Token: $TOKEN"
  echo ""

  echo "=== Getting all orders ==="
  get_all_orders "$TOKEN"
  echo ""

  echo "=== Creating new order ==="
  NEW_ORDER=$(create_order 1 "$TOKEN" "Demo order")
  ORDER_ID=$(echo "$NEW_ORDER" | jq '.id')
  echo ""

  echo "=== Adding items to order ==="
  add_item_to_order "$ORDER_ID" 1 2 "$TOKEN"
  echo ""

  echo "=== Getting order total ==="
  get_order_total "$ORDER_ID" "$TOKEN"
  echo ""

  echo "=== Checking price types ==="
  check_prices_are_numbers "$ORDER_ID" "$TOKEN"
fi

# Экспортировать функции
export -f get_token get_all_orders get_order create_order add_item_to_order
export -f update_order_status get_order_total get_all_products create_product
export -f get_all_customers create_customer check_prices_are_numbers check_decimal_fields
