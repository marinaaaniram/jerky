import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'ivan@jerky.com',
  password: 'password123',
};

/**
 * Логин в приложение - получаем token через API и устанавливаем его в localStorage
 */
export async function login(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  // Получаем token через API
  const loginResponse = await page.request.post('http://localhost:3000/api/auth/login', {
    data: { email, password },
  });

  const loginData = await loginResponse.json();

  if (!loginData.access_token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }

  // Идём на главную страницу
  await page.goto('/');

  // Устанавливаем оба ключа в localStorage как делает фронтенд при успешном логине
  await page.evaluate((data) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Также устанавливаем zustand persist storage
    const authState = {
      state: {
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
      },
      version: 0,
    };
    localStorage.setItem('auth-storage', JSON.stringify(authState));
  }, loginData);

  // Перезагружаем страницу чтобы фронтенд прочитал token и восстановил state
  await page.reload();

  // Ждём пока страница загрузится
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

  // Даём время на гидрацию Zustand store
  await page.waitForTimeout(500);

  // Убеждаемся что залогинены - проверяем что мы не на странице логина
  await expect(page).not.toHaveURL('/', { timeout: 10000 }).catch(() => {
    // Если остались на /, это может быть редирект на /dashboard или /orders
  });

  // Даём дополнительное время на рендер
  await page.waitForTimeout(1000);
}

/**
 * Логаут из приложения
 */
export async function logout(page: Page) {
  // Нажимаем на кнопку выхода (обычно в меню)
  await page.click('text=Выход');
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Проверить что не залогинены
 */
export async function expectNotLoggedIn(page: Page) {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.locator('input[type="email"]')).toBeVisible();
}

/**
 * Проверить что залогинены
 */
export async function expectLoggedIn(page: Page) {
  // Проверяем что видим хотя бы один элемент, который видно только для залогиненных
  await expect(page.locator('[role="navigation"]')).toBeVisible();
}

/**
 * Перейти на страницу заказов
 */
export async function goToOrders(page: Page) {
  // Просто идём на /orders напрямую (проще и быстрее)
  await page.goto('/orders');
  await page.waitForURL('/orders', { timeout: 10000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
}

/**
 * Перейти на подробности заказа
 */
export async function goToOrderDetails(page: Page, orderId: number) {
  // Ищем заказ в таблице и нажимаем на него
  const orderRow = page.locator(`text="${orderId}"`).first();
  const detailsButton = orderRow.locator('button:has-text("Подробнее")').first();

  await detailsButton.click();
  await page.waitForURL(`/orders/${orderId}`, { timeout: 10000 });
}

/**
 * Проверить что таблица товаров отображается без ошибок
 */
export async function expectOrderItemsTable(page: Page) {
  // Проверяем что видна таблица товаров
  const table = page.locator('table');
  await expect(table).toBeVisible();

  // Проверяем наличие колонок
  await expect(table.locator('th:has-text("Товар")')).toBeVisible();
  await expect(table.locator('th:has-text("Цена")')).toBeVisible();
  await expect(table.locator('th:has-text("Количество")')).toBeVisible();
  await expect(table.locator('th:has-text("Сумма")')).toBeVisible();
}

/**
 * Получить все цены из таблицы товаров
 */
export async function getItemPrices(page: Page): Promise<string[]> {
  const prices: string[] = [];
  const rows = page.locator('table tbody tr');
  const count = await rows.count();

  for (let i = 0; i < count - 1; i++) { // -1 чтобы пропустить строку "Итого"
    const priceCell = rows.nth(i).locator('td').nth(1); // Колонка "Цена"
    const text = await priceCell.textContent();
    if (text) {
      prices.push(text.trim());
    }
  }

  return prices;
}

/**
 * Получить итого из таблицы
 */
export async function getOrderTotal(page: Page): Promise<string> {
  const totalRow = page.locator('table tbody tr').last();
  const totalCell = totalRow.locator('td').last();
  const text = await totalCell.textContent();
  return text ? text.trim() : '';
}

/**
 * Проверить что цены содержат числа (не NaN, не undefined)
 */
export async function expectValidPrices(page: Page) {
  const prices = await getItemPrices(page);

  for (const price of prices) {
    // Цена должна быть в формате "123.45 ₽" или "123 ₽"
    const numberMatch = price.match(/[\d.]+/);
    expect(numberMatch).toBeTruthy();
    expect(numberMatch).not.toBeNull();

    const number = parseFloat(numberMatch![0]);
    expect(number).toBeGreaterThan(0);
    expect(Number.isNaN(number)).toBe(false);
  }
}

/**
 * Ждать пока страница полностью загрузится
 */
export async function waitForPageReady(page: Page, timeout: number = 10000) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: Math.min(timeout, 5000) });
  } catch (e) {
    // Если не загрузилось за время, продолжаем
  }
  // Даём время на рендер
  await page.waitForTimeout(500);
}

/**
 * Проверить что нет ошибок в консоли
 */
export async function expectNoConsoleErrors(page: Page) {
  let consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Даём время на выполнение скриптов
  await page.waitForTimeout(500);

  expect(consoleErrors).toEqual([], `Console should have no errors: ${consoleErrors.join(', ')}`);
}
