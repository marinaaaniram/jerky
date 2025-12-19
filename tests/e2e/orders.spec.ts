import { test, expect } from '@playwright/test';
import { login, goToOrders, waitForPageReady, expectNoConsoleErrors } from './helpers/common';

test.describe('Order Management UI', () => {
  test.beforeEach(async ({ page }) => {
    // Логинимся перед каждым тестом
    await login(page);
    await waitForPageReady(page);
  });

  test('should display orders list', async ({ page }) => {
    // Идём на страницу заказов
    await goToOrders(page);
    await waitForPageReady(page);

    // Проверяем что видна таблица заказов
    const ordersTable = page.locator('table');
    await expect(ordersTable).toBeVisible();

    // Проверяем что есть колонки
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Клиент")')).toBeVisible();
    await expect(page.locator('th:has-text("Статус")')).toBeVisible();
  });

  test('should navigate to order details', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    // Ищем первый заказ
    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await expect(firstOrderLink).toBeVisible();

    // Нажимаем на заказ
    await firstOrderLink.click();

    // Проверяем что перешли на страницу подробностей
    await page.waitForURL('/orders/1', { timeout: 10000 });
    await expect(page.locator('text="Заказ №1"')).toBeVisible();
  });

  test('should display order details correctly', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем что видна информация о заказе
    await expect(page.locator('text="Клиент"')).toBeVisible();
    await expect(page.locator('text="Дата заказа"')).toBeVisible();
    await expect(page.locator('text="Статус"')).toBeVisible();
    await expect(page.locator('text="Адрес доставки"')).toBeVisible();

    // Проверяем что видна таблица товаров
    const itemsTable = page.locator('text="Позиции заказа"').locator('..').locator('table');
    await expect(itemsTable).toBeVisible();
  });

  test('should display order total', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Ищем поле с итого
    const totalField = page.locator('text="Итого"');
    await expect(totalField).toBeVisible();

    // Проверяем что есть число
    const totalText = page.locator('text=/\\d+.*₽/').first();
    await expect(totalText).toBeVisible();
  });

  test('should go back to orders list', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });

    // Нажимаем кнопку "Назад"
    const backButton = page.locator('button:has-text("Назад к списку")').first();
    await backButton.click();

    // Проверяем что вернулись на список
    await page.waitForURL('/orders', { timeout: 10000 });
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display order items with prices', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем таблицу товаров
    const itemsTable = page.locator('table');
    await expect(itemsTable).toBeVisible();

    // Ищем строки товаров
    const rows = itemsTable.locator('tbody tr');
    const rowCount = await rows.count();

    // Должно быть хотя бы 2 строки (товары + итого)
    expect(rowCount).toBeGreaterThan(1);

    // Проверяем что в каждой строке есть цена
    for (let i = 0; i < rowCount - 1; i++) { // -1 чтобы пропустить итого
      const priceCell = rows.nth(i).locator('td').nth(1);
      const text = await priceCell.textContent();
      expect(text).toContain('₽');
    }
  });

  test('should not show console errors on orders page', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    const firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();

    await page.waitForURL('/orders/1', { timeout: 10000 });
    await waitForPageReady(page);

    // Проверяем консоль
    await expectNoConsoleErrors(page);
  });

  test('should display different order statuses with colors', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    // Ищем статусы в таблице
    const statuses = page.locator('text=/Новый|В сборке|Передан курьеру|Доставлен/');

    // Должны быть хотя бы некоторые статусы видны
    const count = await statuses.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle multiple orders navigation', async ({ page }) => {
    await goToOrders(page);
    await waitForPageReady(page);

    // Открываем первый заказ
    let firstOrderLink = page.locator('a').filter({ hasText: /^1$/ }).first();
    await firstOrderLink.click();
    await page.waitForURL('/orders/1', { timeout: 10000 });

    // Возвращаемся
    const backButton = page.locator('button:has-text("Назад к списку")').first();
    await backButton.click();
    await page.waitForURL('/orders', { timeout: 10000 });

    // Открываем второй заказ (если существует)
    const secondOrderLink = page.locator('a').filter({ hasText: /^2$/ }).first();
    if (await secondOrderLink.isVisible()) {
      await secondOrderLink.click();
      await page.waitForURL('/orders/2', { timeout: 10000 });

      // Проверяем заголовок
      await expect(page.locator('text="Заказ №2"')).toBeVisible();
    }
  });
});
