#!/bin/bash

# decimal-price-bug.sh
# Тест на бог: цены приходят как строки вместо чисел
# BUG: TypeError: r.price.toFixed is not a function
# FIX: Добавлены трансформеры в backend entities

source ../utils/auth.sh
source ../utils/helpers.sh

print_heading "Testing: Decimal Price Bug Fix"

# Проверяем что Docker запущен
check_docker_running || exit 1

# Ждём backend
wait_for_backend || exit 1

print_info "Bug description: Order items prices came as strings, not numbers"
print_info "Error: TypeError: r.price.toFixed is not a function"
print_info "Expected: All prices should be numbers in API response"
echo ""

# Получаем токен
print_info "Getting authentication token..."
TOKEN=$(get_token)

if [ -z "$TOKEN" ]; then
  print_error "Failed to get token"
  exit 1
fi
print_success "Token obtained"
echo ""

# Создаём заказ с товарами
print_info "Creating test order with items..."
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "notes": "Decimal price bug test"}' | jq '.')

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq '.id')
print_success "Order created: ID $ORDER_ID"
echo ""

# Добавляем товары к заказу
print_info "Adding items to order..."

# Товар 1
ITEM1=$(curl -s -X POST "$API_URL/orders/$ORDER_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}' | jq '.id')
print_success "Added item 1: $ITEM1"

# Товар 2
ITEM2=$(curl -s -X POST "$API_URL/orders/$ORDER_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 2, "quantity": 1}' | jq '.id')
print_success "Added item 2: $ITEM2"
echo ""

# Получаем заказ и проверяем цены
print_divider
print_info "Testing price types in API response..."
echo ""

FULL_ORDER=$(curl -s "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

print_info "Checking OrderItem prices..."
echo ""

# Проверяем тип каждой цены
ITEM_COUNT=$(echo "$FULL_ORDER" | jq '.orderItems | length')

for i in $(seq 0 $((ITEM_COUNT - 1))); do
  PRICE=$(echo "$FULL_ORDER" | jq ".orderItems[$i].price")
  PRICE_TYPE=$(echo "$FULL_ORDER" | jq ".orderItems[$i].price | type")
  PRODUCT_NAME=$(echo "$FULL_ORDER" | jq -r ".orderItems[$i].product.name")

  echo -n "  Item $((i+1)) ($PRODUCT_NAME): price=$PRICE, type=$PRICE_TYPE "

  if [ "$PRICE_TYPE" = '"number"' ]; then
    print_success "✓"
  else
    print_error "✗"
  fi
done

echo ""
print_divider
echo ""

# Проверяем все цены
PRICES=$(echo "$FULL_ORDER" | jq '.orderItems[].price')
PRICE_TYPES=$(echo "$FULL_ORDER" | jq '[.orderItems[] | .price | type] | unique')

print_info "All price types in response: $PRICE_TYPES"
echo ""

# Проверяем что можно посчитать total (как это делает frontend)
print_info "Testing frontend calculation: total = sum(price * quantity)..."

TOTAL_JSON=$(curl -s "$API_URL/orders/$ORDER_ID/total" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo "$TOTAL_JSON" | jq '.total')
TOTAL_TYPE=$(echo "$TOTAL_JSON" | jq '.total | type')

echo "  Total: $TOTAL"
echo "  Type: $TOTAL_TYPE"

if [ "$TOTAL_TYPE" = '"number"' ]; then
  print_success "Total is a number ✓"
else
  print_error "Total is NOT a number ✗"
fi

echo ""
print_divider
echo ""

# Итоги
PASS_COUNT=0
FAIL_COUNT=0

# Проверяем каждый item
for i in $(seq 0 $((ITEM_COUNT - 1))); do
  PRICE_TYPE=$(echo "$FULL_ORDER" | jq ".orderItems[$i].price | type")
  if [ "$PRICE_TYPE" = '"number"' ]; then
    ((PASS_COUNT++))
  else
    ((FAIL_COUNT++))
  fi
done

# Проверяем total
if [ "$TOTAL_TYPE" = '"number"' ]; then
  ((PASS_COUNT++))
else
  ((FAIL_COUNT++))
fi

echo ""
if [ $FAIL_COUNT -eq 0 ]; then
  print_success "All checks passed! Bug is FIXED ✅"
  print_info "Passed: $PASS_COUNT | Failed: $FAIL_COUNT"
  echo ""
  print_heading "✨ TEST PASSED - Bug fix verified!"
  exit 0
else
  print_error "Some checks failed! Bug still exists ❌"
  print_info "Passed: $PASS_COUNT | Failed: $FAIL_COUNT"
  echo ""
  print_heading "❌ TEST FAILED - Bug NOT fixed!"
  exit 1
fi
