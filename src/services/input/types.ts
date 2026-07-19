import type { PlayerId } from '../../simulation/commands/PlayerCommand';

export type ActionId =
  | 'accelerate'
  | 'brake'
  | 'steerLeft'
  | 'steerRight'
  | 'attack'
  | 'pause';

export type DeviceKind = 'keyboard' | 'gamepad';

export type PlayerRef = PlayerId | 'shared';

export interface Binding {
  readonly playerId: PlayerRef;
  readonly action: ActionId;
  readonly code: string;
}

export interface BindingPreset {
  readonly id: string;
  readonly label: string;
  readonly deviceKind: DeviceKind;
  readonly bindings: readonly Binding[];
}

export type ActionEdge = 'pressed' | 'held' | 'released';

export interface ActionState {
  readonly edge: ActionEdge;
  readonly isDown: boolean;
}