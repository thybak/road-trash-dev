import { expect, test } from '@playwright/test';

// This file is the only one matched by playwright.preview.config.ts (testMatch:
// preview-smoke\.spec\.ts$). It runs against the production `vite preview` build
// serving `dist/`, while the other *.spec.ts files run against `pnpm dev`.

test.describe('production preview smoke', () => {
  test('boot reaches the menu from the production bundle', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot(), undefined, {
      timeout: 10_000,
    });
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const snap = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snap?.presetId).toBe('default-keyboard');
  });

  test('audio unlocks from the production bundle as well', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot(), undefined, {
      timeout: 10_000,
    });
    const cb = (await page.locator('canvas').first().boundingBox())!;
    await page.mouse.click(cb.x + cb.width / 2, cb.y + 160);
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.audioState === 'unlocked',
      undefined,
      { timeout: 5_000 },
    );
    const snap = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snap?.audioState).toBe('unlocked');
  });
});