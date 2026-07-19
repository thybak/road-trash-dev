import { describe, expect, it } from 'vitest';
import { KeyboardService } from '../../../../../src/services/input/keyboard/KeyboardService';

describe('KeyboardService', () => {
  it('reports pressed and held after keydown, released after keyup', () => {
    const s = new KeyboardService();
    s.onKeyDown('KeyW');
    expect(s.pressed('KeyW')).toBe(true);
    expect(s.isDown('KeyW')).toBe(true);
    expect(s.released('KeyW')).toBe(false);

    s.afterFrame();
    expect(s.pressed('KeyW')).toBe(false);
    expect(s.isDown('KeyW')).toBe(true);

    s.onKeyUp('KeyW');
    expect(s.released('KeyW')).toBe(true);
    expect(s.isDown('KeyW')).toBe(false);

    s.afterFrame();
    expect(s.released('KeyW')).toBe(false);
  });

  it('does not reemit pressed on auto-repeat keydown', () => {
    const s = new KeyboardService();
    s.onKeyDown('KeyW');
    s.afterFrame();
    s.onKeyDown('KeyW'); // simulated auto-repeat
    expect(s.pressed('KeyW')).toBe(false);
    expect(s.isDown('KeyW')).toBe(true);
  });

  it('clearAll zeroes all state', () => {
    const s = new KeyboardService();
    s.onKeyDown('KeyW');
    s.onKeyDown('KeyA');
    s.clearAll();
    expect(s.isDown('KeyW')).toBe(false);
    expect(s.isDown('KeyA')).toBe(false);
    expect(s.pressed('KeyW')).toBe(false);
    expect(s.downCodes()).toEqual([]);
  });

  it('exposes pressed and released code lists per frame', () => {
    const s = new KeyboardService();
    s.onKeyDown('KeyW');
    s.onKeyDown('KeyA');
    s.onKeyUp('KeyD'); // never pressed — still emits a release edge
    expect(s.pressedCodes()).toEqual(expect.arrayContaining(['KeyW', 'KeyA']));
    expect(s.releasedCodes()).toEqual(['KeyD']);
    s.afterFrame();
    expect(s.pressedCodes()).toEqual([]);
    expect(s.releasedCodes()).toEqual([]);
  });

  it('preventDefault allowlist toggles when bindings change', () => {
    const s = new KeyboardService();
    expect(s.shouldPreventDefault('KeyW')).toBe(false);
    s.setPreventDefaultCodes(['KeyW', 'KeyA']);
    expect(s.shouldPreventDefault('KeyW')).toBe(true);
    expect(s.shouldPreventDefault('KeyA')).toBe(true);
    expect(s.shouldPreventDefault('KeyS')).toBe(false);
    s.setPreventDefaultCodes(['KeyS']);
    expect(s.shouldPreventDefault('KeyW')).toBe(false);
    expect(s.shouldPreventDefault('KeyS')).toBe(true);
  });
});