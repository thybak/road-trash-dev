import type { TrackState } from '../model/TrackState';
import { centerlinePointAt } from '../math/roadGeometry';

export function segmentIndexAt(trackState: TrackState, progressM: number): number {
  const clamped = Math.max(0, Math.min(progressM, trackState.totalLengthM));
  const { segmentStartM, definition } = trackState;

  for (let i = definition.segments.length - 1; i >= 0; i--) {
    const startM = segmentStartM[i] as number;
    if (clamped >= startM) return i;
  }

  return 0;
}

export function segmentAt(trackState: TrackState, progressM: number): typeof trackState.definition.segments[0] {
  const index = segmentIndexAt(trackState, progressM);
  return trackState.definition.segments[index] as typeof trackState.definition.segments[0];
}

export function halfWidthAt(trackState: TrackState, progressM: number): number {
  return segmentAt(trackState, progressM).halfWidthM;
}

export function curvatureAt(trackState: TrackState, progressM: number): number {
  return segmentAt(trackState, progressM).curvature;
}

export function surfaceIdAt(trackState: TrackState, progressM: number): string {
  return segmentAt(trackState, progressM).surfaceId;
}

export function elevationAt(trackState: TrackState, progressM: number): number {
  return centerlinePointAt(trackState, progressM).y;
}

export function propertiesAt(
  trackState: TrackState,
  progressM: number,
): {
  halfWidthM: number;
  curvature: number;
  surfaceId: string;
  elevationM: number;
} {
  const segment = segmentAt(trackState, progressM);
  return {
    halfWidthM: segment.halfWidthM,
    curvature: segment.curvature,
    surfaceId: segment.surfaceId,
    elevationM: elevationAt(trackState, progressM),
  };
}

export function centerlinePoint(trackState: TrackState, progressM: number): ReturnType<typeof centerlinePointAt> {
  return centerlinePointAt(trackState, progressM);
}
