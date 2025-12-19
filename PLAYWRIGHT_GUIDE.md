# 🎭 Playwright E2E Testing Guide

Полное тестирование фронтенда через браузер Chromium, запущенный в Docker.

## 🚀 Быстрый старт

### 1. Запустить Docker

```bash
# Убедитесь что контейнеры запущены
docker-compose up --build -d
sleep 20
```

### 2. Запустить E2E тесты

```bash
# Все тесты
npx playwright test

# Или только критичные тесты decimal price
npx playwright test tests/e2e/decimal-price.spec.ts --headed
```

### 3. Посмотреть результаты

```bash
npx playwright show-report
```

## 📦 Что тестируется

### ✅ Аутентификация (6 тестов)
- Логин с правильными учетными данными
- Ошибки при неправильных данных
- Логаут
- Редирект неавторизованных пользователей
- Сохранение сессии
- Отображение имени пользователя

### ✅ Decimal Price Bug - UI TESTS (6 критичных тестов)
**Самые важные - проверяют что баг ИСПРАВЛЕН на фронтенде:**

- ✅ Таблица товаров отображается БЕЗ ОШИБОК
- ✅ Все цены - валидные числа
- ✅ Итого рассчитывается правильно
- ✅ **НЕ показывается `toFixed is not a function`**
- ✅ Работает с заказом #2 (тем, что был с ошибкой)
- ✅ Цены в правильном формате: "500.00 ₽"

### ✅ Управление заказами (9 тестов)
- Список заказов отображается
- Навигация в подробности
- Отображение информации
- Расчет итого
- Возврат к списку
- Товары с ценами видны
- Нет консоль ошибок
- Статусы с цветами
- Навигация между заказами

## 🛠️ Команды

```bash
# Запустить ВСЕ E2E тесты
npx playwright test

# Запустить с браузером (видимым)
npx playwright test --headed

# Запустить UI режим (интерактивный)
npx playwright test --ui

# Только decimal price тесты
npx playwright test decimal-price

# Только auth тесты
npx playwright test auth

# Только orders тесты
npx playwright test orders

# Конкретный тест
npx playwright test -g "should display order items with prices"

# В режиме отладки
npx playwright test --debug

# С полным выводом
npx playwright test --verbose

# Сохранить видео всех тестов
npx playwright test --video=on

# Открыть отчет
npx playwright show-report
```

## 📊 Структура файлов

```
tests/
├── e2e/
│   ├── auth.spec.ts              (6 тестов)
│   ├── decimal-price.spec.ts     (6 критичных тестов)
│   ├── orders.spec.ts            (9 тестов)
│   ├── helpers/
│   │   └── common.ts             (вспомогательные функции)
│   └── README.md
│
└── (остальные тесты API, bash скрипты)

playwright.config.ts              (конфиг Playwright)
```

## 💡 Примеры использования

### Базовый тест

```typescript
import { test, expect } from '@playwright/test';
import { login } from './helpers/common';

test('my feature works', async ({ page }) => {
  await login(page);

  // Навигация
  await page.goto('/orders');

  // Проверка элемента
  await expect(page.locator('h1')).toContainText('Заказы');

  // Взаимодействие
  await page.click('button:has-text("Создать")');

  // Ожидание
  await page.waitForURL('/orders/new');
});
```

### Проверить что цена - число (как в наших тестах)

```typescript
const price = await page.locator('td').nth(1).textContent();
expect(price).toMatch(/\d+(\.\d+)?\s*₽/);

// Или с помощью helper
const prices = await getItemPrices(page);
await expectValidPrices(page);
```

### Заполнить форму

```typescript
await page.fill('input[type="email"]', 'test@example.com');
await page.fill('input[type="password"]', 'password123');
await page.click('button:has-text("Вход")');
```

### Проверить что ошибки нет в консоли

```typescript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Error:', msg.text());
  }
});
await page.waitForTimeout(500);
```

## 🔧 Отладка

### Если тесты падают

1. **Проверить что Docker работает:**
```bash
docker-compose ps
curl http://localhost:3000/api/auth/login
```

2. **Перезагрузить Docker:**
```bash
docker-compose down -v
docker-compose up --build -d
sleep 20
```

3. **Запустить с браузером:**
```bash
npx playwright test decimal-price --headed
```

4. **Запустить в debug режиме:**
```bash
npx playwright test decimal-price --debug
```

5. **Проверить логи:**
```bash
docker-compose logs backend -f
docker-compose logs frontend -f
```

### Сохранить скриншоты/видео ошибок

Автоматически сохраняются в `test-results/`:
- Screenshots ошибок: `test-results/[test-name]-failed-1.png`
- Видео ошибок: `test-results/[test-name]-failed-1.webm`
- Traces: `test-results/trace.zip`

## 📈 CI/CD интеграция

Для GitHub Actions:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm install -g @playwright/test
      - run: npm ci

      - run: docker-compose up --build -d
      - run: sleep 30

      - run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 Сценарии тестирования

### Сценарий 1: Проверить что баг ИСПРАВЛЕН

```bash
# Запустить критичные тесты
npx playwright test decimal-price --headed

# Ожидается:
# ✓ 6 passed
```

### Сценарий 2: Полная проверка перед коммитом

```bash
# Запустить все E2E тесты
npx playwright test

# Запустить API тесты
bash tests/QUICK_TEST.sh

# Если оба PASSED → коммит безопасен
```

### Сценарий 3: Отладить конкретный баг

```bash
# Запустить с UI (может кликать элементы)
npx playwright test --ui

# Или с браузером
npx playwright test decimal-price --headed --debug
```

## 📚 Полезные ссылки

- [Playwright Docs](https://playwright.dev)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [Selectors](https://playwright.dev/docs/selectors)
- [Locators](https://playwright.dev/docs/locators)

## 🚀 Workflow рекомендация

1. **Написать E2E тест** для новой функции
   ```bash
   vim tests/e2e/my-feature.spec.ts
   ```

2. **Запустить тест** (должен упасть):
   ```bash
   npx playwright test my-feature --headed
   ```

3. **Реализовать функцию** в коде

4. **Запустить тест** снова (должен пройти)
   ```bash
   npx playwright test my-feature
   ```

5. **Запустить все E2E**:
   ```bash
   npx playwright test
   ```

6. **Запустить API тесты**:
   ```bash
   bash tests/QUICK_TEST.sh
   ```

7. **Если ОВЫ PASSED → коммит**

---

**Версия:** 1.0
**Дата:** 2025-12-19
**MCP:** Playwright MCP Integration
**Автор:** Claude Code
