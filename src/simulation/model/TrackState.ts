import type { TrackDefinition } from '../../content/schemas/TrackDefinition';

export interface TrackState {
  readonly definition: TrackDefinition;
  readonly totalLengthM: number;
  readonly segmentStartM: readonly number[];
}

export function createTrackState(definition: TrackDefinition): TrackState {
  const starts: number[] = [];
  let accumulated = 0;
  for (const segment of definition.segments) {
    starts.push(accumulated);
    accumulated += segment.lengthM;
  }

  if (Math.abs(accumulated - definition.lengthM) > 1e-6) {
    throw new Error(
      `TrackState length mismatch: definition.lengthM=${definition.lengthM}, sum=${accumulated}`,
    );
  }

  return {
    definition,
    totalLengthM: accumulated,
    segmentStartM: Object.freeze(starts),
  };
}
