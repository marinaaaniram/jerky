#!/bin/bash

# helpers.sh - Вспомогательные функции для тестирования

API_URL="${API_URL:-http://localhost:3000/api}"

# ===== ВЫВОД =====

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Вывод заголовка
print_heading() {
  echo ""
  echo -e "${CYAN}════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}════════════════════════════════════════${NC}"
  echo ""
}

# Информационное сообщение
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Успешное сообщение
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Предупреждение
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Ошибка
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Разделитель
print_divider() {
  echo -e "${CYAN}─────────────────────────────────────${NC}"
}

# ===== API ЗАПРОСЫ =====

# GET запрос
API_GET() {
  local url="$1"
  local token="$2"
  local quiet="${3:-false}"

  if [ "$quiet" = "true" ]; then
    curl -s "$url" -H "Authorization: Bearer $token"
  else
    print_info "GET $url"
    curl -s "$url" \
      -H "Authorization: Bearer $token" | jq '.'
  fi
}

# POST запрос
API_POST() {
  local url="$1"
  local token="$2"
  local data="$3"
  local quiet="${4:-false}"

  if [ "$quiet" = "true" ]; then
    curl -s -X POST "$url" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    print_info "POST $url"
    print_info "Data: $data"
    curl -s -X POST "$url" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data" | jq '.'
  fi
}

# PATCH запрос
API_PATCH() {
  local url="$1"
  local token="$2"
  local data="$3"
  local quiet="${4:-false}"

  if [ "$quiet" = "true" ]; then
    curl -s -X PATCH "$url" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    print_info "PATCH $url"
    print_info "Data: $data"
    curl -s -X PATCH "$url" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data" | jq '.'
  fi
}

# DELETE запрос
API_DELETE() {
  local url="$1"
  local token="$2"
  local quiet="${3:-false}"

  if [ "$quiet" = "true" ]; then
    curl -s -X DELETE "$url" \
      -H "Authorization: Bearer $token"
  else
    print_info "DELETE $url"
    curl -s -X DELETE "$url" \
      -H "Authorization: Bearer $token" | jq '.'
  fi
}

# ===== ПРОВЕРКИ =====

# Проверить что значение - число
assert_is_number() {
  local value="$1"
  local name="${2:-value}"

  if [[ "$value" =~ ^-?[0-9]+\.?[0-9]*$ ]]; then
    print_success "$name is a number"
    return 0
  else
    print_error "$name is NOT a number: $value"
    return 1
  fi
}

# Проверить что значение - строка
assert_is_string() {
  local value="$1"
  local name="${2:-value}"

  if [[ "$value" == "\""* ]]; then
    print_success "$name is a string"
    return 0
  else
    print_error "$name is NOT a string: $value"
    return 1
  fi
}

# Проверить что ключ существует в JSON
assert_key_exists() {
  local json="$1"
  local key="$2"

  if echo "$json" | jq -e ".$key" > /dev/null 2>&1; then
    print_success "Key exists: $key"
    return 0
  else
    print_error "Key not found: $key"
    return 1
  fi
}

# Проверить равенство
assert_equal() {
  local actual="$1"
  local expected="$2"
  local name="${3:-value}"

  if [ "$actual" = "$expected" ]; then
    print_success "$name: $actual == $expected"
    return 0
  else
    print_error "$name: $actual != $expected"
    return 1
  fi
}

# ===== УТИЛИТЫ =====

# Извлечь значение из JSON
extract_json_value() {
  local json="$1"
  local path="$2"

  echo "$json" | jq -r "$path // empty"
}

# Проверить что Docker контейнеры запущены
check_docker_running() {
  if docker-compose ps | grep -q "Up"; then
    print_success "Docker containers are running"
    return 0
  else
    print_error "Docker containers are not running"
    print_info "Start containers: docker-compose up --build -d"
    return 1
  fi
}

# Дождаться пока backend будет готов
wait_for_backend() {
  local max_attempts=30
  local attempt=1

  print_info "Waiting for backend to be ready..."

  while [ $attempt -le $max_attempts ]; do
    if curl -s "http://localhost:3000/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}' > /dev/null 2>&1; then
      print_success "Backend is ready!"
      return 0
    fi

    echo -n "."
    sleep 1
    ((attempt++))
  done

  print_error "Backend is not responding after $max_attempts attempts"
  return 1
}

# Очистить тестовые данные
cleanup_test_data() {
  print_info "Cleaning up test data..."

  # Здесь можно добавить очистку БД если нужно
  # Например: DELETE FROM orders WHERE notes LIKE '%test%'

  print_success "Cleanup completed"
}

# ===== JSON ГЕНЕРАТОРЫ =====

# Создать JSON для заказа
create_order_json() {
  local customer_id="$1"
  local notes="${2:-Test order}"

  echo "{\"customerId\": $customer_id, \"notes\": \"$notes\"}"
}

# Создать JSON для добавления товара в заказ
create_order_item_json() {
  local product_id="$1"
  local quantity="${2:-1}"

  echo "{\"productId\": $product_id, \"quantity\": $quantity}"
}

# Создать JSON для обновления статуса
create_status_update_json() {
  local status="$1"

  echo "{\"status\": \"$status\"}"
}

# Экспортировать функции
export -f print_heading print_info print_success print_warning print_error print_divider
export -f API_GET API_POST API_PATCH API_DELETE
export -f assert_is_number assert_is_string assert_key_exists assert_equal
export -f extract_json_value check_docker_running wait_for_backend cleanup_test_data
export -f create_order_json create_order_item_json create_status_update_json
