#!/bin/bash

# auth.sh - Аутентификация и управление токенами

API_URL="${API_URL:-http://localhost:3000/api}"
USER_EMAIL="${USER_EMAIL:-ivan@jerky.com}"
USER_PASSWORD="${USER_PASSWORD:-password123}"

# Получить JWT токен
get_token() {
  local email="${1:-$USER_EMAIL}"
  local password="${2:-$USER_PASSWORD}"

  local response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  echo "$response" | jq -r '.access_token // empty'
}

# Получить информацию о текущем пользователе
get_current_user() {
  local token="$1"
  curl -s "$API_URL/auth/me" \
    -H "Authorization: Bearer $token" | jq '.'
}

# Сохранить токен в файл
save_token() {
  local token="$1"
  local file="${2:-/tmp/jerky_token.txt}"
  echo "$token" > "$file"
  echo "Token saved to $file"
}

# Загрузить токен из файла
load_token() {
  local file="${1:-/tmp/jerky_token.txt}"
  if [ -f "$file" ]; then
    cat "$file"
  else
    echo "Token file not found: $file" >&2
    return 1
  fi
}

# Проверить валидность токена
verify_token() {
  local token="$1"
  local response=$(curl -s "$API_URL/auth/verify" \
    -H "Authorization: Bearer $token")

  if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
    echo "✅ Token is valid"
    echo "$response" | jq '.email'
    return 0
  else
    echo "❌ Token is invalid"
    return 1
  fi
}

# Регистрация нового пользователя
register_user() {
  local first_name="$1"
  local last_name="$2"
  local email="$3"
  local password="$4"
  local role_id="${5:-2}"  # Менеджер по умолчанию

  curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"$first_name\",
      \"lastName\": \"$last_name\",
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"roleId\": $role_id
    }" | jq '.'
}

# Экспортировать функции
export -f get_token
export -f get_current_user
export -f save_token
export -f load_token
export -f verify_token
export -f register_user
