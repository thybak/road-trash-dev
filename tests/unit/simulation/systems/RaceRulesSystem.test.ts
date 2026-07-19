import { describe, expect, it } from 'vitest';
import { createTrackState } from '../../../../src/simulation/model/TrackState';
import { createRiderState } from '../../../../src/simulation/model/RiderState';
import { createRaceRulesState, stepRaceRules } from '../../../../src/simulation/systems/RaceRulesSystem';
import { FrameEventBus } from '../../../../src/simulation/events/EventBus';

describe('RaceRulesSystem', () => {
  const shortTrack = createTrackState({
    id: 'short',
    label: 'Short',
    lengthM: 100,
    segments: [
      { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
    ],
  });

  const dtS = 1 / 60;

  it('stays in racing phase before the finish', () => {
    const rules = createRaceRulesState();
    const rider = { ...createRiderState('p1'), progressM: 50 };
    const events = new FrameEventBus();
    const next = stepRaceRules(rules, rider, shortTrack, events, dtS);
    expect(next.phase).toBe('racing');
    expect(events.events.length).toBe(0);
  });

  it('emits RaceFinished exactly once when crossing the finish', () => {
    const rules = createRaceRulesState();
    const rider = { ...createRiderState('p1'), progressM: 100 };
    const events = new FrameEventBus();
    const next = stepRaceRules(rules, rider, shortTrack, events, dtS);
    expect(next.phase).toBe('finished');
    expect(events.events.length).toBe(1);
    expect(events.events[0]?.kind).toBe('RaceFinished');
    expect((events.events[0] as { finishTimeS: number }).finishTimeS).toBeGreaterThan(0);
  });

  it('does not emit further events after finished', () => {
    const rules = { ...createRaceRulesState(), phase: 'finished' as const, elapsedTimeS: 5 };
    const rider = { ...createRiderState('p1'), progressM: 150 };
    const events = new FrameEventBus();
    const next = stepRaceRules(rules, rider, shortTrack, events, dtS);
    expect(next.phase).toBe('finished');
    expect(next.elapsedTimeS).toBe(5);
    expect(events.events.length).toBe(0);
  });

  it('accumulates elapsed time while racing', () => {
    const rules = createRaceRulesState();
    const rider = { ...createRiderState('p1'), progressM: 10 };
    const events = new FrameEventBus();
    const next = stepRaceRules(rules, rider, shortTrack, events, dtS);
    expect(next.elapsedTimeS).toBeCloseTo(dtS, 6);
  });
});
