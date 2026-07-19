import { expect, test } from '@playwright/test';

const EXPECTED_PRESET_ID = 'default-keyboard';
const EXPECTED_DEVICE_KIND = 'keyboard';

const EXPECTED_BINDINGS: Record<string, { action: string; code: string }[]> = {
  p1: [
    { action: 'accelerate', code: 'KeyW' },
    { action: 'brake', code: 'KeyS' },
    { action: 'steerLeft', code: 'KeyA' },
    { action: 'steerRight', code: 'KeyD' },
    { action: 'attack', code: 'KeyF' },
  ],
  p2: [
    { action: 'accelerate', code: 'ArrowUp' },
    { action: 'brake', code: 'ArrowDown' },
    { action: 'steerLeft', code: 'ArrowLeft' },
    { action: 'steerRight', code: 'ArrowRight' },
    { action: 'attack', code: 'ShiftRight' },
  ],
  shared: [{ action: 'pause', code: 'Escape' }],
};

async function waitForMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => !!window.roadTrashDebug?.snapshot());
}

test.describe('preset display', () => {
  test('exposes the default-keyboard preset metadata', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    const snap = await page.evaluate(() => window.roadTrashDebug?.snapshot());
    expect(snap?.presetId).toBe(EXPECTED_PRESET_ID);
    expect(snap?.presetDeviceKind).toBe(EXPECTED_DEVICE_KIND);
  });

  test('default preset drives commands as documented in the contract', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);

    // Spot-check every documented binding by pressing it and asserting the command it maps to.
    for (const [player, bindings] of Object.entries(EXPECTED_BINDINGS)) {
      for (const { action, code } of bindings) {
        await page.keyboard.down(code);
        await page.waitForFunction(
          (args) => {
            const s = window.roadTrashDebug?.snapshot();
            if (!s) return false;
            const cmd = s.commands[args.player as 'p1' | 'p2'];
            if (args.action === 'pause') return true; // pause is not a per-player command
            if (args.action === 'accelerate') return cmd.accelerate;
            if (args.action === 'brake') return cmd.brake;
            if (args.action === 'steerLeft') return cmd.steer === -1;
            if (args.action === 'steerRight') return cmd.steer === 1;
            if (args.action === 'attack') return cmd.attackPressed;
            return false;
          },
          { player, action, code },
          { timeout: 2_000 },
        );
        await page.keyboard.up(code);
        // Ensure the binding releases cleanly before the next one.
        await page.waitForFunction(
          (args) => {
            const s = window.roadTrashDebug?.snapshot();
            if (!s) return true;
            const cmd = s.commands[args.player as 'p1' | 'p2'];
            if (args.action === 'accelerate') return !cmd.accelerate;
            if (args.action === 'brake') return !cmd.brake;
            if (args.action === 'steerLeft') return cmd.steer !== -1;
            if (args.action === 'steerRight') return cmd.steer !== 1;
            if (args.action === 'attack') return true;
            return true;
          },
          { player, action, code },
          { timeout: 2_000 },
        );
      }
    }
  });
});