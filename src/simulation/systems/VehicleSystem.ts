import type { RiderState } from '../model/RiderState';
import type { TrackState } from '../model/TrackState';
import { propertiesAt, elevationAt } from '../systems/TrackSystem';
import {
  ACCEL_MPS2,
  BRAKE_DECEL_MPS2,
  COAST_DECEL_MPS2,
  MAX_SPEED_MPS,
  STEER_LATERAL_MPS,
  CURVATURE_LATERAL_PULL_FACTOR,
  OFF_ROAD_FULL_PENALTY_WIDTH_M,
  OFF_ROAD_SPEED_FACTOR,
} from '../tuning';
import type { PlayerCommand } from '../commands/PlayerCommand';

const RIDER_CLEARANCE_M = 0.8;
const MAX_LATERAL_MARGIN_M = 12;

export function stepVehicle(
  rider: RiderState,
  command: PlayerCommand,
  trackState: TrackState,
  dtS: number,
): RiderState {
  const { curvature, halfWidthM } = propertiesAt(trackState, rider.progressM);

  let speedMps = rider.speedMps;

  if (command.accelerate) {
    speedMps += ACCEL_MPS2 * dtS;
  } else if (command.brake) {
    speedMps -= BRAKE_DECEL_MPS2 * dtS;
  } else {
    speedMps -= COAST_DECEL_MPS2 * dtS;
  }

  speedMps = Math.max(0, speedMps);

  const offRoadPenetrationM = Math.max(0, Math.abs(rider.lateral) - halfWidthM);
  const penaltyT = Math.min(1, offRoadPenetrationM / OFF_ROAD_FULL_PENALTY_WIDTH_M);
  const maxSpeedMps = MAX_SPEED_MPS * (1 - penaltyT * (1 - OFF_ROAD_SPEED_FACTOR));
  speedMps = Math.min(speedMps, maxSpeedMps);

  const lateralSpeedMps = command.steer * STEER_LATERAL_MPS;
  const curvaturePullMps = curvature * speedMps * speedMps * CURVATURE_LATERAL_PULL_FACTOR;

  let lateral = rider.lateral + (lateralSpeedMps + curvaturePullMps) * dtS;
  const lateralLimit = halfWidthM + MAX_LATERAL_MARGIN_M;
  lateral = Math.max(-lateralLimit, Math.min(lateralLimit, lateral));

  const progressM = rider.progressM + speedMps * dtS;
  const heightM = elevationAt(trackState, progressM) + RIDER_CLEARANCE_M;

  return {
    ...rider,
    speedMps,
    lateral,
    progressM,
    heightM,
  };
}
