import { describe, expect, it } from 'vitest';
import { createTrackState } from '../../../../src/simulation/model/TrackState';
import { createRiderState } from '../../../../src/simulation/model/RiderState';
import { emptyCommand } from '../../../../src/simulation/commands/PlayerCommand';
import { stepVehicle } from '../../../../src/simulation/systems/VehicleSystem';
import {
  ACCEL_MPS2,
  BRAKE_DECEL_MPS2,
  MAX_SPEED_MPS,
  OFF_ROAD_SPEED_FACTOR,
  STEER_LATERAL_MPS,
} from '../../../../src/simulation/tuning';

describe('VehicleSystem', () => {
  const flatTrack = createTrackState({
    id: 'flat',
    label: 'Flat',
    lengthM: 10_000,
    segments: [
      { lengthM: 10_000, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
    ],
  });

  const dtS = 1 / 60;

  it('accelerates from rest', () => {
    const rider = createRiderState('p1');
    const next = stepVehicle(rider, { ...emptyCommand(), accelerate: true }, flatTrack, dtS);
    expect(next.speedMps).toBeCloseTo(ACCEL_MPS2 * dtS, 6);
  });

  it('never exceeds MAX_SPEED_MPS', () => {
    let rider = createRiderState('p1');
    for (let i = 0; i < 10_000; i++) {
      rider = stepVehicle(rider, { ...emptyCommand(), accelerate: true }, flatTrack, dtS);
    }
    expect(rider.speedMps).toBeLessThanOrEqual(MAX_SPEED_MPS + 1e-6);
    expect(rider.speedMps).toBeGreaterThan(MAX_SPEED_MPS * 0.9);
  });

  it('brakes harder than coasting', () => {
    const fast = { ...createRiderState('p1'), speedMps: MAX_SPEED_MPS };
    const braked = stepVehicle(fast, { ...emptyCommand(), brake: true }, flatTrack, dtS);
    const coasted = stepVehicle(fast, emptyCommand(), flatTrack, dtS);
    expect(braked.speedMps).toBeLessThan(coasted.speedMps);
    expect(braked.speedMps).toBeCloseTo(Math.max(0, MAX_SPEED_MPS - BRAKE_DECEL_MPS2 * dtS), 6);
  });

  it('does not allow negative speed', () => {
    const stopped = createRiderState('p1');
    const next = stepVehicle(stopped, { ...emptyCommand(), brake: true }, flatTrack, dtS);
    expect(next.speedMps).toBe(0);
  });

  it('steers laterally', () => {
    const rider = createRiderState('p1');
    const next = stepVehicle(rider, { ...emptyCommand(), steer: 1 }, flatTrack, dtS);
    expect(next.lateral).toBeCloseTo(STEER_LATERAL_MPS * dtS, 6);
  });

  it('applies progressive off-road speed penalty', () => {
    const fast = { ...createRiderState('p1'), speedMps: MAX_SPEED_MPS, lateral: 8 };
    const next = stepVehicle(fast, { ...emptyCommand(), accelerate: true }, flatTrack, dtS);
    expect(next.lateral).toBeGreaterThan(6); // off-road
    expect(next.speedMps).toBeLessThan(MAX_SPEED_MPS);
    expect(next.speedMps).toBeGreaterThan(MAX_SPEED_MPS * OFF_ROAD_SPEED_FACTOR);
  });

  it('progresses forward with speed', () => {
    const rider = { ...createRiderState('p1'), speedMps: 30 };
    const next = stepVehicle(rider, emptyCommand(), flatTrack, dtS);
    // Coasting deceleration slightly reduces speed before progress is integrated.
    expect(next.progressM).toBeGreaterThan(0);
    expect(next.progressM).toBeLessThanOrEqual(30 * dtS);
  });

  it('updates height with elevation', () => {
    const hillTrack = createTrackState({
      id: 'hill',
      label: 'Hill',
      lengthM: 100,
      segments: [
        { lengthM: 100, curvature: 0, elevationDeltaM: 10, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    });
    const rider = { ...createRiderState('p1'), speedMps: 30 };
    const next = stepVehicle(rider, emptyCommand(), hillTrack, dtS);
    expect(next.heightM).toBeGreaterThan(0);
  });
});
