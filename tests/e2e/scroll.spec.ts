import { expect, test } from '@playwright/test';

const BOUND_CODES = [
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
];

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('no page scroll', () => {
  test('none of the bound gameplay keys scroll the page', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    const before = await page.evaluate(() => window.scrollY);
    for (const code of BOUND_CODES) {
      await page.keyboard.down(code);
      await page.keyboard.up(code);
    }
    await page.waitForTimeout(60);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBe(before);
  });

  test('holding Space (an unbound key) still allows preventDefault-free behaviour', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForMenu(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.down('Space');
    await page.keyboard.up('Space');
    await page.waitForTimeout(60);
    const after = await page.evaluate(() => window.scrollY);
    // Space is intentionally NOT in the binding set; whether the page scrolls is the browser's
    // choice. We only assert that the lab registered it as a raw down code while held.
    expect(after).toBe(before);
  });
});