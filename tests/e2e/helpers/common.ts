import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'ivan@jerky.com',
  password: 'password123',
};

/**
 * Логин в приложение
 */
export async function login(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('/');

  // Ждём если форма ещё загружается
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Вводим учетные данные
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Нажимаем кнопку логина
  await page.click('button:has-text("Вход")');

  // Ждём редиректа на главную страницу
  await page.waitForURL('/dashboard', { timeout: 10000 });
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
  // Ищем ссылку на заказы в меню
  await page.click('a:has-text("Заказы")');
  await page.waitForURL('/orders', { timeout: 10000 });
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
    expect(numberMatch).toBeTruthy(`Price should contain a number: ${price}`);

    const number = parseFloat(numberMatch![0]);
    expect(number).toBeGreaterThan(0);
    expect(Number.isNaN(number)).toBe(false);
  }
}

/**
 * Ждать пока страница полностью загрузится
 */
export async function waitForPageReady(page: Page, timeout: number = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
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
