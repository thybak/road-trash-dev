import type { PlayerId, PlayerCommand } from '../../../simulation/commands/PlayerCommand';
import { emptyCommand } from '../../../simulation/commands/PlayerCommand';
import type { ActionId, BindingPreset } from '../types';
import type { KeyboardService } from '../keyboard/KeyboardService';

interface ResolvedBinding {
  readonly playerId: PlayerId;
  readonly action: ActionId;
  readonly code: string;
}

export class CommandMapper {
  private bindings: readonly ResolvedBinding[] = [];

  constructor(private readonly keyboard: KeyboardService) {}

  setPreset(preset: BindingPreset): void {
    this.bindings = preset.bindings.filter(
      (b): b is ResolvedBinding => b.playerId !== 'shared',
    );
  }

  map(): Record<PlayerId, PlayerCommand> {
    const result: Record<PlayerId, PlayerCommand> = {
      p1: emptyCommand(),
      p2: emptyCommand(),
    };

    const steerLeft = new Set<PlayerId>();
    const steerRight = new Set<PlayerId>();

    for (const b of this.bindings) {
      const isDown = this.keyboard.isDown(b.code);
      if (!isDown) continue;
      if (b.action === 'steerLeft') {
        steerLeft.add(b.playerId);
      } else if (b.action === 'steerRight') {
        steerRight.add(b.playerId);
      }
    }

    for (const b of this.bindings) {
      const isDown = this.keyboard.isDown(b.code);
      const pressed = this.keyboard.pressed(b.code);
      switch (b.action) {
        case 'accelerate':
          if (isDown) result[b.playerId] = { ...result[b.playerId], accelerate: true };
          break;
        case 'brake':
          if (isDown) result[b.playerId] = { ...result[b.playerId], brake: true };
          break;
        case 'steerLeft':
        case 'steerRight':
          break;
        case 'attack':
          if (pressed) result[b.playerId] = { ...result[b.playerId], attackPressed: true };
          break;
      }
    }

    for (const id of ['p1', 'p2'] as const) {
      const left = steerLeft.has(id);
      const right = steerRight.has(id);
      const steer: -1 | 0 | 1 = left && right ? 0 : left ? -1 : right ? 1 : 0;
      if (steer !== 0) result[id] = { ...result[id], steer };
    }

    return result;
  }
}