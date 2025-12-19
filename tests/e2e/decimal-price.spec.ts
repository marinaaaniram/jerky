import { test, expect } from '@playwright/test';
import {
  login,
  goToOrders,
  goToOrderDetails,
  expectOrderItemsTable,
  expectValidPrices,
  getItemPrices,
  getOrderTotal,
  expectNoConsoleErrors,
  waitForPageReady,
} from './helpers/common';

test.describe('Decimal Price Bug Fix - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Логинимся перед каждым тестом
    await login(page);
    await waitForPageReady(page);
  });

  test('should display order items table without errors', async ({ page }) => {
    // Идём на страницу заказов
    await goToOrders(page);
    await waitForPageReady(page);

    // Ищем первый заказ и открываем подробности
    const firstOrderLink = page.locator('a:has-text("1")').first();
    await firstOrderLink.click();

    // Ждём загрузки страницы
    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем что таблица видна и без ошибок
    await expectOrderItemsTable(page);

    // Проверяем что нет ошибок в консоли
    await expectNoConsoleErrors(page);
  });

  test('should display all prices as valid numbers', async ({ page }) => {
    // Открываем заказ #2 (тот, что был с ошибкой)
    await goToOrders(page);
    await waitForPageReady(page);

    // Ищем заказ #2
    const order2 = page.locator('tr').filter({ hasText: '2' }).first();
    const detailsButton = order2.locator('button:has-text("Подробнее")');
    await detailsButton.click();

    await page.waitForURL('/orders/2', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем таблицу товаров
    await expectOrderItemsTable(page);

    // Получаем цены
    const prices = await getItemPrices(page);
    console.log('Prices found:', prices);

    // Проверяем что есть хотя бы одна цена
    expect(prices.length).toBeGreaterThan(0);

    // Проверяем что все цены - валидные числа
    await expectValidPrices(page);
  });

  test('should calculate and display order total correctly', async ({ page }) => {
    // Открываем заказ
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a:has-text("1")').first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Получаем итого
    const total = await getOrderTotal(page);
    console.log('Order total:', total);

    // Проверяем что итого не пусто и содержит число
    expect(total).toBeTruthy();
    expect(total).toContain('₽');

    // Извлекаем число из итого
    const totalMatch = total.match(/[\d.]+/);
    expect(totalMatch).toBeTruthy();

    const totalNumber = parseFloat(totalMatch![0]);
    expect(totalNumber).toBeGreaterThan(0);
    expect(Number.isNaN(totalNumber)).toBe(false);
  });

  test('should NOT show "toFixed is not a function" error', async ({ page }) => {
    let hasToFixedError = false;

    // Ловим ошибки в консоли
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('toFixed')) {
        hasToFixedError = true;
        console.error('❌ CRITICAL: toFixed error detected!', msg.text());
      }
    });

    // Ловим ошибки от браузера
    page.on('pageerror', (error) => {
      if (error.message.includes('toFixed')) {
        hasToFixedError = true;
        console.error('❌ CRITICAL: toFixed error detected!', error.message);
      }
    });

    // Открываем заказ
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a:has-text("1")').first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем таблицу товаров
    await expectOrderItemsTable(page);
    await waitForPageReady(page);

    // Проверяем что ошибки не было
    expect(hasToFixedError).toBe(false);
  });

  test('should work with order that previously had the bug', async ({ page }) => {
    // Этот тест проверяет конкретно заказ #2, который был с ошибкой
    await goToOrders(page);
    await waitForPageReady(page);

    // Ищем и открываем заказ #2
    const orderRows = page.locator('tbody tr');
    let found = false;

    for (let i = 0; i < (await orderRows.count()); i++) {
      const row = orderRows.nth(i);
      const text = await row.textContent();

      if (text && text.includes('2')) {
        const detailsButton = row.locator('button:has-text("Подробнее")');
        await detailsButton.click();
        found = true;
        break;
      }
    }

    if (!found) {
      test.skip();
      return;
    }

    await page.waitForURL('/orders/2', { timeout: 10000 });
    await waitForPageReady(page);

    // Главная проверка: таблица должна загрузиться без ошибок
    await expectOrderItemsTable(page);

    // Проверяем что цены видны и валидны
    const prices = await getItemPrices(page);
    expect(prices.length).toBeGreaterThan(0);

    for (const price of prices) {
      expect(price).toMatch(/\d/);
      expect(price).not.toContain('undefined');
      expect(price).not.toContain('NaN');
    }

    // Проверяем консоль на ошибки
    await expectNoConsoleErrors(page);
  });

  test('should display prices in correct format with currency', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a:has-text("1")').first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем что цены имеют правильный формат
    const priceElements = page.locator('table tbody tr td:nth-child(2)');
    const count = await priceElements.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count - 1; i++) { // -1 чтобы пропустить итого
      const text = await priceElements.nth(i).textContent();
      expect(text).toContain('₽');
      // Должно быть число перед ₽
      expect(text).toMatch(/^\d+(\.\d+)?\s*₽$/);
    }
  });
});
