import { test, expect } from '@playwright/test';
import { login, logout, TEST_USER, expectLoggedIn, expectNotLoggedIn } from './helpers/common';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Идём на главную страницу
    await page.goto('/');

    // Проверяем что форма логина видна
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Логинимся
    await login(page);

    // Проверяем что залогинены
    await expectLoggedIn(page);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/');

    // Вводим неправильные учетные данные
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Вход")');

    // Проверяем что видим ошибку
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/ошибка|неверно|invalid/i);
  });

  test('should logout successfully', async ({ page }) => {
    // Логинимся
    await login(page);
    await expectLoggedIn(page);

    // Логаутимся (нажимаем на кнопку выхода)
    // Ищем кнопку выхода в меню
    const userMenu = page.locator('[role="button"]:has-text("Иван")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.click('text=Выход');
    }

    // Проверяем что вернулись на страницу логина
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Пытаемся зайти на защищенную страницу
    await page.goto('/orders');

    // Должны быть редиректены на логин
    await expect(page).toHaveURL('/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should preserve login after page refresh', async ({ page }) => {
    // Логинимся
    await login(page);
    await expectLoggedIn(page);

    // Обновляем страницу
    await page.reload();

    // Проверяем что остались залогинены
    await expectLoggedIn(page);
  });

  test('should show user name in header when logged in', async ({ page }) => {
    await login(page);

    // Проверяем что видим имя пользователя
    const userName = page.locator('text="Иван"');
    await expect(userName).toBeVisible();
  });
});
