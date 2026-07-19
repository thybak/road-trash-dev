import { expect, test } from '@playwright/test';

test.describe('boot smoke', () => {
  test('mounts a visible WebGL canvas', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width', /.+/);
  });

  test('does not page-scroll on keydown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.down('ArrowDown');
    await page.keyboard.up('ArrowDown');
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBe(before);
  });
});