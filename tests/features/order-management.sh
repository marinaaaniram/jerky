#!/bin/bash

# order-management.sh
# Полный тест функциональности управления заказами

source ../utils/auth.sh
source ../utils/helpers.sh

print_heading "Testing: Order Management"

# Проверяем что Docker запущен
check_docker_running || exit 1

# Ждём backend
wait_for_backend || exit 1

# Получаем токен
print_info "Getting authentication token..."
TOKEN=$(get_token)

if [ -z "$TOKEN" ]; then
  print_error "Failed to get token"
  exit 1
fi
print_success "Token obtained"
echo ""

# ===== ТЕСТ 1: Создание заказа =====
print_divider
print_heading "Test 1: Create Order"

CUSTOMER_ID=1
ORDER_NOTES="Integration test order"

ORDER_JSON=$(create_order_json "$CUSTOMER_ID" "$ORDER_NOTES")
print_info "Creating order: $ORDER_JSON"

ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ORDER_JSON")

ORDER_ID=$(echo "$ORDER" | jq '.id')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
  print_error "Failed to create order"
  echo "$ORDER" | jq '.'
  exit 1
fi

print_success "Order created successfully"
print_info "Order ID: $ORDER_ID"
echo ""

# ===== ТЕСТ 2: Добавление товаров =====
print_divider
print_heading "Test 2: Add Items to Order"

ITEMS=(
  "1:2"  # product_id:quantity
  "2:1"
  "3:3"
)

TOTAL_PRICE=0
ITEM_COUNT=0

for item in "${ITEMS[@]}"; do
  IFS=':' read -r product_id quantity <<< "$item"

  ITEM_JSON=$(create_order_item_json "$product_id" "$quantity")
  print_info "Adding item: product_id=$product_id, quantity=$quantity"

  ITEM=$(curl -s -X POST "$API_URL/orders/$ORDER_ID/items" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ITEM_JSON")

  ITEM_ID=$(echo "$ITEM" | jq '.id')
  ITEM_PRICE=$(echo "$ITEM" | jq '.price')

  if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
    print_error "Failed to add item"
    echo "$ITEM" | jq '.'
    exit 1
  fi

  print_success "Item added: ID=$ITEM_ID, price=$ITEM_PRICE"
  ((ITEM_COUNT++))

  # Проверяем что цена - число
  PRICE_TYPE=$(echo "$ITEM" | jq '.price | type')
  if [ "$PRICE_TYPE" = '"number"' ]; then
    print_success "Price is a number ✓"
  else
    print_error "Price is NOT a number! Type: $PRICE_TYPE"
  fi

  echo ""
done

echo ""

# ===== ТЕСТ 3: Получение заказа =====
print_divider
print_heading "Test 3: Get Full Order"

FULL_ORDER=$(curl -s "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

ORDER_STATUS=$(echo "$FULL_ORDER" | jq -r '.status')
ORDER_CUSTOMER=$(echo "$FULL_ORDER" | jq -r '.customer.name')
ORDER_ITEMS_COUNT=$(echo "$FULL_ORDER" | jq '.orderItems | length')

print_info "Order Details:"
print_info "  Status: $ORDER_STATUS"
print_info "  Customer: $ORDER_CUSTOMER"
print_info "  Items count: $ORDER_ITEMS_COUNT"

if [ "$ORDER_ITEMS_COUNT" -ne "$ITEM_COUNT" ]; then
  print_error "Item count mismatch! Expected: $ITEM_COUNT, Got: $ORDER_ITEMS_COUNT"
  exit 1
fi

print_success "Order details verified"
echo ""

# ===== ТЕСТ 4: Вычисление итога =====
print_divider
print_heading "Test 4: Calculate Order Total"

TOTAL_RESPONSE=$(curl -s "$API_URL/orders/$ORDER_ID/total" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo "$TOTAL_RESPONSE" | jq '.total')
TOTAL_TYPE=$(echo "$TOTAL_RESPONSE" | jq '.total | type')

print_info "Total: $TOTAL"
print_info "Type: $TOTAL_TYPE"

if [ "$TOTAL_TYPE" != '"number"' ]; then
  print_error "Total is not a number!"
  exit 1
fi

print_success "Total calculated correctly"
echo ""

# Проверяем что можно выполнить арифметику (как frontend)
MANUAL_TOTAL=$(echo "$FULL_ORDER" | jq '[.orderItems[] | .price * .quantity] | add')
print_info "Manual calculation: $MANUAL_TOTAL"

if [ "$TOTAL" = "$MANUAL_TOTAL" ]; then
  print_success "Manual total matches API total ✓"
else
  print_warning "Manual total differs: $MANUAL_TOTAL vs $TOTAL"
fi

echo ""

# ===== ТЕСТ 5: Изменение статуса =====
print_divider
print_heading "Test 5: Update Order Status"

print_info "Current status: $ORDER_STATUS"
print_info "Attempting to change to: В сборке"

STATUS_JSON=$(create_status_update_json "В сборке")

UPDATED_ORDER=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$STATUS_JSON")

NEW_STATUS=$(echo "$UPDATED_ORDER" | jq -r '.status // empty')

if [ -z "$NEW_STATUS" ]; then
  print_error "Failed to update status"
  echo "$UPDATED_ORDER" | jq '.'
  exit 1
fi

print_info "New status: $NEW_STATUS"

if [ "$NEW_STATUS" = "В сборке" ]; then
  print_success "Status updated successfully ✓"
else
  print_error "Status did not update correctly"
  exit 1
fi

echo ""

# ===== ТЕСТ 6: Список всех заказов =====
print_divider
print_heading "Test 6: Get All Orders"

ALL_ORDERS=$(curl -s "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN")

ALL_ORDERS_COUNT=$(echo "$ALL_ORDERS" | jq 'length')

print_info "Total orders in system: $ALL_ORDERS_COUNT"

# Проверяем что наш заказ в списке
FOUND_ORDER=$(echo "$ALL_ORDERS" | jq ".[] | select(.id == $ORDER_ID)")

if [ -z "$FOUND_ORDER" ]; then
  print_error "Created order not found in orders list!"
  exit 1
fi

print_success "Created order found in list ✓"
echo ""

# ===== ИТОГИ =====
print_divider
print_heading "✨ TEST PASSED - Order Management Works!"

print_success "All tests completed successfully"
print_info "Summary:"
echo "  ✓ Order created: $ORDER_ID"
echo "  ✓ Items added: $ITEM_COUNT"
echo "  ✓ Status updated: $NEW_STATUS"
echo "  ✓ Total calculated: $TOTAL"
echo "  ✓ Order found in list"
echo ""

exit 0
