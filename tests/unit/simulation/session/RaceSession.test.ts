import { describe, expect, it } from 'vitest';
import { createRiderState } from '../../../../src/simulation/model/RiderState';
import { emptyCommand } from '../../../../src/simulation/commands/PlayerCommand';
import { RaceSession } from '../../../../src/simulation/session/RaceSession';
import { STEP_S } from '../../../../src/simulation/tuning';

describe('RaceSession', () => {
  const trackDefinition = {
    id: 'short',
    label: 'Short',
    lengthM: 100,
    segments: [
      { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
    ],
  };

  it('starts with a fresh rider at the track start', () => {
    const session = new RaceSession(trackDefinition, 'p1');
    const snapshot = session.snapshot();
    expect(snapshot.rider.id).toBe('p1');
    expect(snapshot.rider.progressM).toBe(0);
    expect(snapshot.phase).toBe('racing');
  });

  it('advances progress while accelerating', () => {
    const session = new RaceSession(trackDefinition, 'p1');
    const start = session.snapshot().rider.progressM;
    for (let i = 0; i < 60; i++) {
      session.step({ ...emptyCommand(), accelerate: true });
    }
    expect(session.snapshot().rider.progressM).toBeGreaterThan(start);
  });

  it('finishes the race and freezes the rider', () => {
    const session = new RaceSession(trackDefinition, 'p1');
    const fast = { ...createRiderState('p1'), speedMps: 50 };
    (session as unknown as { rider: typeof fast }).rider = fast;

    let snapshot = session.snapshot();
    while (snapshot.phase !== 'finished') {
      snapshot = session.step({ ...emptyCommand(), accelerate: true });
    }

    expect(snapshot.phase).toBe('finished');
    expect(snapshot.finishTimeS).not.toBeNull();
    expect(snapshot.rider.speedMps).toBe(0);
    expect(snapshot.rider.progressM).toBeGreaterThanOrEqual(trackDefinition.lengthM);
    expect(snapshot.events.some((e: { kind: string }) => e.kind === 'RaceFinished')).toBe(true);
  });

  it('uses the default step when dt is not provided', () => {
    const session = new RaceSession(trackDefinition, 'p1');
    const before = session.snapshot().rider.progressM;
    session.step({ ...emptyCommand(), accelerate: true });
    expect(session.snapshot().rider.progressM).toBeGreaterThan(before);
    expect(session.snapshot().elapsedTimeS).toBe(STEP_S);
  });
});
