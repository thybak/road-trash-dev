export interface RiderState {
  readonly id: string;
  readonly progressM: number;
  readonly lateral: number;
  readonly speedMps: number;
  readonly heightM: number;
  readonly health: number;
  readonly stunRemainingS: number;
  readonly attackCooldownRemainingS: number;
}

export function createRiderState(id: string, progressM = 0): RiderState {
  return {
    id,
    progressM,
    lateral: 0,
    speedMps: 0,
    heightM: 0,
    health: 100,
    stunRemainingS: 0,
    attackCooldownRemainingS: 0,
  };
}
