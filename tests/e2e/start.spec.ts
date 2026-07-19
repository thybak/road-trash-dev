import { expect, test } from '@playwright/test';

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('start gesture', () => {
  test('Start unlocks the audio context inside a trusted user gesture', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    expect(await page.evaluate(() => window.roadTrashDebug?.snapshot()?.audioState)).toBe(
      'locked',
    );

    // Use a real, trusted pointer click — not dispatchEvent — so the AudioContext resume
    // counts as a user-gesture-initiated action.
    const canvasBox = await page.locator('canvas').first().boundingBox();
    expect(canvasBox).not.toBeNull();
    const cb = canvasBox!;
    // The Start button is at roughly x: width/2, y: 140. Click inside the canvas at that
    // screen coordinate. Falling back to a synthetic pointer event if the box is null.
    const targetX = cb.x + cb.width / 2;
    const targetY = cb.y + 140 + 20;
    await page.mouse.move(targetX, targetY);
    await page.mouse.click(targetX, targetY);

    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.audioState === 'unlocked',
      undefined,
      { timeout: 3_000 },
    );
    const audioState = await page.evaluate(() => window.roadTrashDebug?.snapshot()?.audioState);
    expect(audioState).toBe('unlocked');
    expect(await page.evaluate(() => window.roadTrashDebug?.snapshot()?.started)).toBe(true);
  });

  test('Escape pauses (suspends) the audio context', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    const canvasBox = await page.locator('canvas').first().boundingBox();
    const cb = canvasBox!;
    await page.mouse.click(cb.x + cb.width / 2, cb.y + 160);

    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.audioState === 'unlocked',
      undefined,
      { timeout: 3_000 },
    );

    await page.keyboard.down('Escape');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.audioState === 'suspended',
      undefined,
      { timeout: 3_000 },
    );
    await page.keyboard.up('Escape');
  });
});