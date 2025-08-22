import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the main page correctly', async ({ page }) => {
    await page.goto('/');

    // 檢查頁面標題
    await expect(page).toHaveTitle(/健康餐點推薦/);

    // 檢查主要元素是否存在
    await expect(page.locator('h1')).toContainText('基於健檢報告的');
    await expect(page.locator('h1')).toContainText('智能餐點推薦');

    // 檢查導航欄
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/auth/login"]')).toContainText('登入');
    await expect(page.locator('a[href="/auth/register"]')).toContainText('註冊');

    // 檢查 CTA 按鈕
    await expect(page.locator('a[href="/upload"]')).toContainText('開始上傳健檢報告');
    await expect(page.locator('a[href="/auth/register"]')).toContainText('免費註冊');
  });

  test('should navigate to upload page', async ({ page }) => {
    await page.goto('/');

    // 點擊上傳按鈕
    await page.click('a[href="/upload"]');

    // 檢查是否導向到上傳頁面
    await expect(page).toHaveURL(/.*upload/);
    await expect(page.locator('h1')).toContainText('上傳健檢報告');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');

    // 點擊註冊按鈕
    await page.click('a[href="/auth/register"]');

    // 檢查是否導向到註冊頁面
    await expect(page).toHaveURL(/.*auth\/register/);
    await expect(page.locator('h2')).toContainText('建立帳戶');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // 點擊登入按鈕
    await page.click('a[href="/auth/login"]');

    // 檢查是否導向到登入頁面
    await expect(page).toHaveURL(/.*auth\/login/);
    await expect(page.locator('h2')).toContainText('歡迎回來');
  });

  test('should display feature sections', async ({ page }) => {
    await page.goto('/');

    // 檢查功能特色區塊
    await expect(page.locator('h2')).toContainText('為什麼選擇我們的服務？');
    
    // 檢查功能卡片
    const featureCards = page.locator('.grid > div');
    await expect(featureCards).toHaveCount(6);
  });

  test('should display usage flow', async ({ page }) => {
    await page.goto('/');

    // 檢查使用流程區塊
    await expect(page.locator('h2')).toContainText('使用流程');
    
    // 檢查流程步驟
    await expect(page.locator('h3')).toContainText('上傳健檢報告');
    await expect(page.locator('h3')).toContainText('AI 分析健康狀況');
    await expect(page.locator('h3')).toContainText('獲得餐廳推薦');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');

    // 檢查桌面版佈局
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // 切換到手機版佈局
    await page.setViewportSize({ width: 375, height: 667 });

    // 檢查手機版佈局是否正常
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
