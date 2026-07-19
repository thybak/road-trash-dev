import type { BindingPreset } from '../types';

export const DEFAULT_PRESET: BindingPreset = {
  id: 'default-keyboard',
  label: 'Default Keyboard',
  deviceKind: 'keyboard',
  bindings: [
    { playerId: 'p1', action: 'accelerate', code: 'KeyW' },
    { playerId: 'p1', action: 'brake', code: 'KeyS' },
    { playerId: 'p1', action: 'steerLeft', code: 'KeyA' },
    { playerId: 'p1', action: 'steerRight', code: 'KeyD' },
    { playerId: 'p1', action: 'attack', code: 'KeyF' },
    { playerId: 'p2', action: 'accelerate', code: 'ArrowUp' },
    { playerId: 'p2', action: 'brake', code: 'ArrowDown' },
    { playerId: 'p2', action: 'steerLeft', code: 'ArrowLeft' },
    { playerId: 'p2', action: 'steerRight', code: 'ArrowRight' },
    { playerId: 'p2', action: 'attack', code: 'ShiftRight' },
    { playerId: 'shared', action: 'pause', code: 'Escape' },
  ],
};

export const AVAILABLE_PRESETS: readonly BindingPreset[] = [DEFAULT_PRESET];