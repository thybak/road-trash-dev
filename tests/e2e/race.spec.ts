import { expect, test } from '@playwright/test';

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('single-rider race', () => {
  test.setTimeout(90_000);

  test('starts a race and reaches the finish', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    const canvasBox = await page.locator('canvas').first().boundingBox();
    expect(canvasBox).not.toBeNull();
    const cb = canvasBox!;
    // The "Start Race" button is at roughly x: width/2, y: height - 70.
    await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height - 70 + 20);

    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.phase === 'racing',
      undefined,
      { timeout: 3_000 },
    );

    await page.keyboard.down('KeyW');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.phase === 'finished',
      undefined,
      { timeout: 70_000 },
    );
    await page.keyboard.up('KeyW');

    const snapshot = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snapshot?.phase).toBe('finished');
    expect(snapshot?.finishTimeS).toBeGreaterThan(0);
  });
});
