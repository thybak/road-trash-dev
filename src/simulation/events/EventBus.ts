export interface RaceFinishedEvent {
  readonly kind: 'RaceFinished';
  readonly riderId: string;
  readonly finishTimeS: number;
}

export type GameplayEvent = RaceFinishedEvent;

export interface EventBus {
  readonly events: readonly GameplayEvent[];
  emit(event: GameplayEvent): void;
  clear(): void;
}

export class FrameEventBus implements EventBus {
  private readonly buffer: GameplayEvent[] = [];

  get events(): readonly GameplayEvent[] {
    return this.buffer;
  }

  emit(event: GameplayEvent): void {
    this.buffer.push(event);
  }

  clear(): void {
    this.buffer.length = 0;
  }
}
