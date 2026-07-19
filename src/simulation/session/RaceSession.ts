import type { PlayerCommand } from '../commands/PlayerCommand';
import type { RiderState } from '../model/RiderState';
import type { TrackState } from '../model/TrackState';
import type { GameplayEvent } from '../events/EventBus';
import { FrameEventBus } from '../events/EventBus';
import { createTrackState } from '../model/TrackState';
import { createRiderState } from '../model/RiderState';
import { stepVehicle } from '../systems/VehicleSystem';
import { createRaceRulesState, stepRaceRules, type RacePhase } from '../systems/RaceRulesSystem';
import type { TrackDefinition } from '../../content/schemas/TrackDefinition';
import { STEP_S } from '../tuning';

export interface RaceSnapshot {
  readonly rider: RiderState;
  readonly trackState: TrackState;
  readonly phase: RacePhase;
  readonly elapsedTimeS: number;
  readonly finishTimeS: number | null;
  readonly events: readonly GameplayEvent[];
}

export class RaceSession {
  readonly trackState: TrackState;
  private rider: RiderState;
  private readonly events: FrameEventBus;
  private rules = createRaceRulesState();

  constructor(trackDefinition: TrackDefinition, riderId: string) {
    this.trackState = createTrackState(trackDefinition);
    this.rider = createRiderState(riderId);
    this.events = new FrameEventBus();
  }

  step(command: PlayerCommand, dtS = STEP_S): RaceSnapshot {
    this.events.clear();

    if (this.rules.phase === 'racing') {
      this.rider = stepVehicle(this.rider, command, this.trackState, dtS);
    }

    this.rules = stepRaceRules(this.rules, this.rider, this.trackState, this.events, dtS);

    if (this.rules.phase === 'finished') {
      this.rider = { ...this.rider, speedMps: 0 };
    }

    return this.snapshot();
  }

  snapshot(): RaceSnapshot {
    return {
      rider: this.rider,
      trackState: this.trackState,
      phase: this.rules.phase,
      elapsedTimeS: this.rules.elapsedTimeS,
      finishTimeS: this.rules.phase === 'finished' ? this.rules.elapsedTimeS : null,
      events: this.events.events,
    };
  }
}
