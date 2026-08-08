import { expect, test, type Page } from '@playwright/test';

// Astro 以 client:load 做 SSR，按钮在 hydrate 前就已存在于 DOM。
// 点击需在 React 挂载事件处理器之后进行，否则点击会是空操作。
// 应用会在 hydrate 完成后在 <html> 上写入 data-app-hydrated 作为信号。
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.appHydrated === 'true',
    undefined,
    { timeout: 15000 },
  );
}

test.beforeEach(async ({ page }) => {
  // 中止非本地请求（外部字体/图片 CDN），避免在无法访问这些 CDN 的环境里
  // load 事件一直挂起导致超时。同源 /api 请求不受影响（测试 5 仍会拦截）。
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort());

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('bayjf_sound', 'false');
  });
  await page.reload();
  await waitForHydration(page);
});

test('navigates between the primary bayjf screens', async ({ page, isMobile }) => {
  if (isMobile) {
    await page.locator('#mobile-menu-btn').click();
    await page.locator('#nav-mobile-bayjf').click();
  } else {
    await page.locator('#nav-bayjf').click();
  }

  await expect(page.getByRole('heading', { name: 'Selected Projects' })).toBeVisible();

  await page.keyboard.press('e');
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible();
});

test('searches projects and can switch to Chinese', async ({ page, isMobile }) => {
  // Language is URL-routed (MPA): start from the projects route so the
  // Chinese locale lands on /zh/projects with the projects screen visible.
  await page.goto('/projects');
  await waitForHydration(page);

  if (isMobile) {
    await page.locator('#mobile-menu-btn').click();
    await page.locator('#header-search-input-mobile').fill('WordBase');
  } else {
    await page.locator('#header-search-input').fill('WordBase');
  }

  await expect(page.getByText('WordBase Ecosystem', { exact: true })).toBeVisible();
  await expect(page.getByText('SoftDesk', { exact: true })).toHaveCount(0);

  await page.locator(isMobile ? '#lang-btn-mobile-zh' : '#lang-btn-zh').click();
  await expect(page).toHaveURL(/\/zh\/projects$/);
  await waitForHydration(page);
  await expect(page.getByRole('heading', { name: '精选项目' })).toBeVisible();
});

test('persists a selected light theme after reload', async ({ page }) => {
  await page.locator('#theme-toggle-btn').click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  await page.reload();
  await waitForHydration(page);

  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bayjf_theme'))).toBe('light');
});

test('sends contact API requests through the same-origin path', async ({ page }) => {
  let interceptedUrl = '';
  await page.route('**/api/contact', async (route) => {
    interceptedUrl = route.request().url();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: '{"ok":true}',
    });
  });

  const status = await page.evaluate(async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return response.status;
  });

  expect(status).toBe(201);
  expect(interceptedUrl).toMatch(/^http:\/\/127\.0\.0\.1:4173\/api\/contact$/);
});
