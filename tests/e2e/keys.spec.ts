import { expect, test } from '@playwright/test';

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

async function snapshot(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.roadTrashDebug?.snapshot());
}

async function consumeAttacks(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.roadTrashDebug?.consumeAttackEdges() ?? null);
}

test.describe('two-player keys', () => {
  test('both players accelerating simultaneously', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    await page.keyboard.down('KeyW');
    await page.keyboard.down('ArrowUp');
    await page.waitForFunction(
      () => {
        const s = window.roadTrashDebug?.snapshot();
        return !!s && s.commands.p1.accelerate && s.commands.p2.accelerate;
      },
      undefined,
      { timeout: 2_000 },
    );

    const snap = await snapshot(page);
    expect(snap?.commands.p1.accelerate).toBe(true);
    expect(snap?.commands.p2.accelerate).toBe(true);

    await page.keyboard.up('KeyW');
    await page.keyboard.up('ArrowUp');
  });

  test('P1 attack is edge-only; a fresh re-press triggers again', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    await consumeAttacks(page);

    await page.keyboard.down('KeyF');
    await page.waitForFunction(
      () => window.roadTrashDebug?.consumeAttackEdges()?.p1 === true,
      undefined,
      { timeout: 2_000 },
    );
    await page.keyboard.up('KeyF');

    // Make sure no phantom edge is latched while the key is up.
    await page.waitForTimeout(60);
    expect(await consumeAttacks(page)).toEqual({ p1: false, p2: false });

    await page.keyboard.down('KeyF');
    await page.waitForFunction(
      () => window.roadTrashDebug?.consumeAttackEdges()?.p1 === true,
      undefined,
      { timeout: 2_000 },
    );
    await page.keyboard.up('KeyF');
  });

  test('P2 attack does not affect P1', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    await consumeAttacks(page);

    await page.keyboard.down('ShiftRight');
    await page.waitForFunction(
      () => {
        const edge = window.roadTrashDebug?.consumeAttackEdges();
        return !!edge && edge.p2 === true && edge.p1 === false;
      },
      undefined,
      { timeout: 2_000 },
    );
    await page.keyboard.up('ShiftRight');
  });

  test('opposite steer keys cancel to zero', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    await page.keyboard.down('KeyA');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.steer === -1,
      undefined,
      { timeout: 2_000 },
    );

    await page.keyboard.down('KeyD');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.steer === 0,
      undefined,
      { timeout: 2_000 },
    );

    await page.keyboard.up('KeyA');
    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.steer === 1,
      undefined,
      { timeout: 2_000 },
    );
    await page.keyboard.up('KeyD');

    await page.waitForFunction(
      () => window.roadTrashDebug?.snapshot()?.commands.p1.steer === 0,
      undefined,
      { timeout: 2_000 },
    );
  });

  test('P1 inputs do not affect P2 and vice versa', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(
      () => {
        const s = window.roadTrashDebug?.snapshot();
        return !!s && s.commands.p2.steer === 1 && s.commands.p1.steer === 0;
      },
      undefined,
      { timeout: 2_000 },
    );
    await page.keyboard.up('ArrowRight');
  });
});