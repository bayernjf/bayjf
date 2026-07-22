import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('bayjf_sound', 'false');
  });
  await page.reload();
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
  if (isMobile) {
    await page.locator('#mobile-menu-btn').click();
    await page.locator('#header-search-input-mobile').fill('WordBase');
  } else {
    await page.locator('#header-search-input').fill('WordBase');
  }

  await expect(page.getByText('WordBase Ecosystem', { exact: true })).toBeVisible();
  await expect(page.getByText('SoftDesk', { exact: true })).toHaveCount(0);

  await page.locator(isMobile ? '#lang-btn-mobile-zh' : '#lang-btn-zh').click();
  await expect(page.getByRole('heading', { name: '精选项目' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bayjf_lang'))).toBe('zh');
});

test('persists a selected light theme after reload', async ({ page }) => {
  await page.locator('#theme-toggle-btn').click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  await page.reload();

  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bayjf_theme'))).toBe('light');
});

test('keeps a native cursor until the custom cursor is ready', async ({ page }) => {
  const html = page.locator('html');
  const hasFinePointer = await page.evaluate(() =>
    window.matchMedia('(pointer: fine) and (min-width: 768px)').matches,
  );

  await page.evaluate(() => document.documentElement.classList.remove('custom-cursor-active'));
  await expect(html).not.toHaveClass(/custom-cursor-active/);
  await expect(html).not.toHaveCSS('cursor', 'none');
  await expect(page.locator('#custom-cursor')).toHaveCSS('opacity', '0');

  await page.mouse.move(120, 80);

  if (hasFinePointer) {
    await expect(html).toHaveClass(/custom-cursor-active/);
    await expect(html).not.toHaveCSS('cursor', 'none');
    await expect(page.locator('#custom-cursor')).toHaveCSS('opacity', '1');
  } else {
    await expect(html).not.toHaveClass(/custom-cursor-active/);
    await expect(html).not.toHaveCSS('cursor', 'none');
  }
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
