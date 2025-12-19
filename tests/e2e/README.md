# E2E Tests with Playwright

Тесты для проверки фронтенда через браузер Chromium.

## 📋 Структура

```
tests/e2e/
├── auth.spec.ts            # Тесты аутентификации
├── decimal-price.spec.ts   # Тесты бага с decimal price
├── orders.spec.ts          # Тесты управления заказами
├── helpers/
│   └── common.ts           # Общие вспомогательные функции
└── README.md              # Этот файл
```

## 🚀 Быстрый старт

### Предварительно

```bash
# Docker должен быть запущен
docker-compose ps

# Backend должен быть готов
curl http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Запустить все E2E тесты

```bash
npx playwright test
```

### Запустить конкретный тест

```bash
# Только тесты аутентификации
npx playwright test tests/e2e/auth.spec.ts

# Только тесты decimal price bug
npx playwright test tests/e2e/decimal-price.spec.ts

# Только тесты заказов
npx playwright test tests/e2e/orders.spec.ts
```

### Запустить с UI режимом

```bash
npx playwright test --ui
```

### Запустить с выводом браузера

```bash
npx playwright test --headed
```

### Отладка

```bash
# Запустить конкретный тест в режиме отладки
npx playwright test tests/e2e/decimal-price.spec.ts --debug

# С полным выводом
npx playwright test --verbose
```

## 🧪 Что тестируется

### auth.spec.ts (6 тестов)

- ✅ Логин с правильными учетными данными
- ✅ Ошибка при неправильных учетных данных
- ✅ Логаут работает правильно
- ✅ Редирект неавторизованных пользователей
- ✅ Сохранение логина после обновления страницы
- ✅ Отображение имени пользователя в хедере

### decimal-price.spec.ts (6 тестов) - КРИТИЧНЫЕ

**Главное: проверяют что баг ИСПРАВЛЕН на UI!**

- ✅ Таблица товаров отображается без ошибок
- ✅ Все цены отображаются как валидные числа
- ✅ Итого рассчитывается и отображается правильно
- ✅ **НЕ показывается ошибка "toFixed is not a function"**
- ✅ Работает с заказом #2 (тем, что был с ошибкой)
- ✅ Цены в правильном формате с валютой

### orders.spec.ts (9 тестов)

- ✅ Отображение списка заказов
- ✅ Навигация к подробностям заказа
- ✅ Отображение информации о заказе
- ✅ Отображение итого заказа
- ✅ Возврат к списку заказов
- ✅ Отображение товаров с ценами
- ✅ Нет ошибок в консоли
- ✅ Отображение статусов с цветами
- ✅ Навигация между несколькими заказами

## 🛠️ Вспомогательные функции

### Из `helpers/common.ts`

```typescript
// Логин
await login(page, 'email@example.com', 'password');

// Логаут
await logout(page);

// Проверка статусов
await expectLoggedIn(page);
await expectNotLoggedIn(page);

// Навигация
await goToOrders(page);
await goToOrderDetails(page, 2);

// Проверки таблицы товаров
await expectOrderItemsTable(page);
await expectValidPrices(page);
const prices = await getItemPrices(page);
const total = await getOrderTotal(page);

// Ожидание
await waitForPageReady(page);
await expectNoConsoleErrors(page);
```

## 📊 Результаты тестов

Отчеты сохраняются в `test-results/`

```bash
# Открыть HTML отчет
npx playwright show-report
```

## 🐛 Если тесты падают

### Проверить что Docker запущен

```bash
docker-compose ps

# Или перезагрузить
docker-compose down -v && docker-compose up --build -d && sleep 20
```

### Проверить логи backend'а

```bash
docker-compose logs backend -f
```

### Пересоздать тестовые данные

```bash
# Выполнить seeder в контейнере
docker exec jerky-backend npm run seed:run
```

### Запустить конкретный тест с выводом

```bash
npx playwright test tests/e2e/decimal-price.spec.ts --headed --verbose
```

## 💡 Примеры использования

### Создать новый E2E тест

```typescript
import { test, expect } from '@playwright/test';
import { login, waitForPageReady } from './helpers/common';

test('should test my feature', async ({ page }) => {
  // Логинимся
  await login(page);
  await waitForPageReady(page);

  // Идём на нужную страницу
  await page.goto('/my-page');

  // Проверяем элемент
  await expect(page.locator('h1')).toContainText('My Title');

  // Взаимодействуем
  await page.click('button:has-text("Click me")');

  // Проверяем результат
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Получить элемент и проверить значение

```typescript
const input = page.locator('input[name="email"]');
await input.fill('test@example.com');

const value = await input.inputValue();
expect(value).toBe('test@example.com');
```

### Проверить что элемент исчез

```typescript
const loader = page.locator('[role="progressbar"]');
await loader.waitFor({ state: 'hidden' });
```

## 📝 Конфиг Playwright

`playwright.config.ts`:
- Browser: Chromium
- Base URL: http://localhost:5173
- Retries: 0 (локально), 2 (в CI)
- Screenshots: only-on-failure
- Videos: retain-on-failure
- Trace: on-first-retry

## 🔗 Полезные ссылки

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test Assertions](https://playwright.dev/docs/test-assertions)
- [Selectors](https://playwright.dev/docs/selectors)

---

**Версия:** 1.0
**Последнее обновление:** 2025-12-19
**Автор:** Claude Code with Playwright MCP
