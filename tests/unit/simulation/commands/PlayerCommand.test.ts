import { describe, expect, it } from 'vitest';
import { emptyCommand } from '../../../../src/simulation/commands/PlayerCommand';

describe('PlayerCommand', () => {
  it('emptyCommand returns a neutral command', () => {
    expect(emptyCommand()).toEqual({
      accelerate: false,
      brake: false,
      steer: 0,
      attackPressed: false,
    });
  });
});