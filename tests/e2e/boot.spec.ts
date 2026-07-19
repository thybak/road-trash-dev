import { expect, test } from '@playwright/test';

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('boot smoke', () => {
  test('mounts a visible WebGL canvas', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width', /.+/);
  });

  test('reaches the menu and installs the debug probe', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    const snapshot = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snapshot).not.toBeNull();
    expect(snapshot?.audioState).toBe('locked');
  });

  test('does not page-scroll on bound keys', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    const before = await page.evaluate(() => window.scrollY);
    for (const code of [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ShiftRight',
      'KeyW',
      'KeyS',
      'KeyA',
      'KeyD',
      'KeyF',
      'Escape',
    ]) {
      await page.keyboard.down(code);
      await page.keyboard.up(code);
    }
    await page.waitForTimeout(60);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBe(before);
  });

  test('boot-failure banner stays hidden on a successful boot', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    const failure = page.locator('#boot-failure');
    await expect(failure).toBeHidden();
  });
});