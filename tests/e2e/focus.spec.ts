import { expect, test } from '@playwright/test';

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('focus and visibility cleanup', () => {
  test('window blur zeroes held keys', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    await page.keyboard.down('KeyW');
    await page.waitForFunction(
      () => {
        const s = window.roadTrashDebug?.snapshot();
        return !!s && s.commands.p1.accelerate === true && s.downCodes.includes('KeyW');
      },
      undefined,
      { timeout: 2_000 },
    );

    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForFunction(
      () => {
        const s = window.roadTrashDebug?.snapshot();
        return !!s && s.commands.p1.accelerate === false && !s.downCodes.includes('KeyW');
      },
      undefined,
      { timeout: 2_000 },
    );
  });

  test('visibilitychange to hidden zeroes held keys', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    await page.keyboard.down('KeyW');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.accelerate === true,
      undefined,
      { timeout: 2_000 },
    );

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForFunction(
      () => {
        const s = window.roadTrashDebug?.snapshot();
        return !!s && s.commands.p1.accelerate === false && !s.downCodes.includes('KeyW');
      },
      undefined,
      { timeout: 2_000 },
    );
  });

  test('no phantom held keys return after focus is restored', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    // Press, then blur without releasing, then "restore" focus.
    await page.keyboard.down('KeyW');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.accelerate === false,
      undefined,
      { timeout: 2_000 },
    );

    // Simulate focus return — should not bring W back as held.
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(80);
    const snap = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snap?.commands.p1.accelerate).toBe(false);
    expect(snap?.downCodes).not.toContain('KeyW');

    // Release the still-pressed key so later tests aren't polluted.
    await page.keyboard.up('KeyW');
  });
});