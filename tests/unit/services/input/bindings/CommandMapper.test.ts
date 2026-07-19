import { describe, expect, it } from 'vitest';
import { CommandMapper } from '../../../../../src/services/input/bindings/CommandMapper';
import { KeyboardService } from '../../../../../src/services/input/keyboard/KeyboardService';
import { DEFAULT_PRESET } from '../../../../../src/services/input/bindings/presets';

function mapperWith(preset = DEFAULT_PRESET): { mapper: CommandMapper; keyboard: KeyboardService } {
  const keyboard = new KeyboardService();
  const mapper = new CommandMapper(keyboard);
  mapper.setPreset(preset);
  return { mapper, keyboard };
}

describe('CommandMapper', () => {
  it('returns empty commands when nothing is held', () => {
    const { mapper } = mapperWith();
    expect(mapper.map()).toEqual({
      p1: { accelerate: false, brake: false, steer: 0, attackPressed: false },
      p2: { accelerate: false, brake: false, steer: 0, attackPressed: false },
    });
  });

  it('maps accelerate and brake for both players', () => {
    const { mapper, keyboard } = mapperWith();
    keyboard.onKeyDown('KeyW');
    keyboard.onKeyDown('ArrowDown');
    const cmd = mapper.map();
    expect(cmd.p1.accelerate).toBe(true);
    expect(cmd.p1.brake).toBe(false);
    expect(cmd.p2.brake).toBe(true);
    expect(cmd.p2.accelerate).toBe(false);
  });

  it('maps steer left and right independently', () => {
    const { mapper, keyboard } = mapperWith();
    keyboard.onKeyDown('KeyA');
    keyboard.onKeyDown('ArrowRight');
    const cmd = mapper.map();
    expect(cmd.p1.steer).toBe(-1);
    expect(cmd.p2.steer).toBe(1);
  });

  it('cancels opposite steer keys to zero', () => {
    const { mapper, keyboard } = mapperWith();
    keyboard.onKeyDown('KeyA');
    keyboard.onKeyDown('KeyD');
    const cmd = mapper.map();
    expect(cmd.p1.steer).toBe(0);
  });

  it('attack is edge-only: pressed on keydown, not on held auto-repeat', () => {
    const { mapper, keyboard } = mapperWith();
    keyboard.onKeyDown('KeyF');
    let cmd = mapper.map();
    expect(cmd.p1.attackPressed).toBe(true);

    keyboard.afterFrame();
    keyboard.onKeyDown('KeyF');
    cmd = mapper.map();
    expect(cmd.p1.attackPressed).toBe(false);
  });

  it('different players accelerate simultaneously', () => {
    const { mapper, keyboard } = mapperWith();
    keyboard.onKeyDown('KeyW');
    keyboard.onKeyDown('ArrowUp');
    const cmd = mapper.map();
    expect(cmd.p1.accelerate).toBe(true);
    expect(cmd.p2.accelerate).toBe(true);
  });
});