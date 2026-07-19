export type PlayerId = 'p1' | 'p2';

export interface PlayerCommand {
  readonly accelerate: boolean;
  readonly brake: boolean;
  readonly steer: -1 | 0 | 1;
  readonly attackPressed: boolean;
}

export function emptyCommand(): PlayerCommand {
  return { accelerate: false, brake: false, steer: 0, attackPressed: false };
}