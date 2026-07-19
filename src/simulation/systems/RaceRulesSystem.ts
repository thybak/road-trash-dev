import type { EventBus } from '../events/EventBus';
import type { RiderState } from '../model/RiderState';
import type { TrackState } from '../model/TrackState';

export type RacePhase = 'racing' | 'finished';

export interface RaceRulesState {
  readonly phase: RacePhase;
  readonly elapsedTimeS: number;
  readonly finishedRiderId: string | null;
}

export function createRaceRulesState(): RaceRulesState {
  return {
    phase: 'racing',
    elapsedTimeS: 0,
    finishedRiderId: null,
  };
}

export function stepRaceRules(
  rules: RaceRulesState,
  rider: RiderState,
  trackState: TrackState,
  events: EventBus,
  dtS: number,
): RaceRulesState {
  if (rules.phase === 'finished') {
    return rules;
  }

  const elapsedTimeS = rules.elapsedTimeS + dtS;

  if (rider.progressM >= trackState.totalLengthM) {
    events.emit({
      kind: 'RaceFinished',
      riderId: rider.id,
      finishTimeS: elapsedTimeS,
    });
    return {
      phase: 'finished',
      elapsedTimeS,
      finishedRiderId: rider.id,
    };
  }

  return {
    ...rules,
    elapsedTimeS,
  };
}
