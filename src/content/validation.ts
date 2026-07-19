import type { TrackDefinition } from './schemas/TrackDefinition';
import type { RoadSegmentDefinition } from './schemas/RoadSegmentDefinition';
import type { SceneryPlacement } from './schemas/SceneryPlacement';
import { isKnownSceneryKind, isKnownSurfaceId } from './schemas/knownIds';

export interface TrackValidationError {
  readonly message: string;
}

export function validateTrackDefinition(track: TrackDefinition): readonly TrackValidationError[] {
  const errors: TrackValidationError[] = [];

  if (track.segments.length === 0) {
    errors.push({ message: `Track ${track.id} has no segments.` });
  }

  let computedLengthM = 0;
  for (let i = 0; i < track.segments.length; i++) {
    const segment = track.segments[i] as RoadSegmentDefinition;
    const prefix = `Segment ${i}`;

    if (!Number.isFinite(segment.lengthM) || segment.lengthM <= 0) {
      errors.push({ message: `${prefix}: lengthM must be positive and finite.` });
    }
    if (!Number.isFinite(segment.halfWidthM) || segment.halfWidthM <= 0) {
      errors.push({ message: `${prefix}: halfWidthM must be positive and finite.` });
    }
    if (!Number.isFinite(segment.curvature)) {
      errors.push({ message: `${prefix}: curvature must be finite.` });
    }
    if (!Number.isFinite(segment.elevationDeltaM)) {
      errors.push({ message: `${prefix}: elevationDeltaM must be finite.` });
    }
    if (!isKnownSurfaceId(segment.surfaceId)) {
      errors.push({ message: `${prefix}: unknown surfaceId "${segment.surfaceId}".` });
    }

    for (let j = 0; j < segment.scenery.length; j++) {
      const item = segment.scenery[j] as SceneryPlacement;
      const itemPrefix = `${prefix} scenery ${j}`;
      if (!isKnownSceneryKind(item.kind)) {
        errors.push({ message: `${itemPrefix}: unknown scenery kind "${item.kind}".` });
      }
      if (!Number.isFinite(item.offsetM) || item.offsetM < 0 || item.offsetM >= segment.lengthM) {
        errors.push({
          message: `${itemPrefix}: offsetM must be within [0, segment.lengthM).`,
        });
      }
      if (item.side !== 'left' && item.side !== 'right') {
        errors.push({ message: `${itemPrefix}: side must be "left" or "right".` });
      }
    }

    if (segment.hazards.length !== 0) {
      errors.push({ message: `${prefix}: hazards are not supported in Phase 2.` });
    }

    computedLengthM += segment.lengthM;
  }

  if (
    track.segments.length > 0 &&
    (!Number.isFinite(track.lengthM) || Math.abs(track.lengthM - computedLengthM) > 1e-6)
  ) {
    errors.push({
      message: `Track lengthM (${track.lengthM}) does not match computed sum of segment lengths (${computedLengthM}).`,
    });
  }

  return errors;
}

export function assertValidTrack(track: TrackDefinition): void {
  const errors = validateTrackDefinition(track);
  if (errors.length > 0) {
    throw new Error(`Invalid track "${track.id}":\n${errors.map((e) => e.message).join('\n')}`);
  }
}
