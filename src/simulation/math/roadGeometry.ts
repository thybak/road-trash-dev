import type { TrackState } from '../model/TrackState';

export interface CenterlinePoint {
  /** Horizontal offset of the centerline from the straight-ahead axis, in metres. */
  readonly x: number;
  /** World elevation at this progress, in metres. */
  readonly y: number;
  /** Distance along the straight-ahead axis, in metres. */
  readonly z: number;
  /** Tangent angle of the centerline in radians. */
  readonly angle: number;
}

export function centerlinePointAt(trackState: TrackState, progressM: number): CenterlinePoint {
  const { definition, segmentStartM } = trackState;
  const clamped = Math.max(0, Math.min(progressM, trackState.totalLengthM));

  let cumulativeAngle = 0;
  let x = 0;
  let y = 0;
  let z = 0;

  for (let i = 0; i < definition.segments.length; i++) {
    const segment = definition.segments[i] as typeof definition.segments[0];
    const startM = segmentStartM[i] as number;
    const endM = startM + segment.lengthM;

    if (clamped >= endM) {
      // Consume the whole segment.
      const segmentAngle = segment.curvature * segment.lengthM;
      cumulativeAngle += segmentAngle;
      if (segment.curvature === 0) {
        x += segment.lengthM * Math.sin(cumulativeAngle - segmentAngle);
        z += segment.lengthM * Math.cos(cumulativeAngle - segmentAngle);
      } else {
        const startAngle = cumulativeAngle - segmentAngle;
        x += (Math.cos(startAngle) - Math.cos(cumulativeAngle)) / segment.curvature;
        z += (Math.sin(cumulativeAngle) - Math.sin(startAngle)) / segment.curvature;
      }
      y += segment.elevationDeltaM;
      continue;
    }

    // Partial segment.
    const t = (clamped - startM) / segment.lengthM;
    const partialLengthM = segment.lengthM * t;
    const partialAngle = segment.curvature * partialLengthM;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + partialAngle;

    if (segment.curvature === 0) {
      x += partialLengthM * Math.sin(startAngle);
      z += partialLengthM * Math.cos(startAngle);
    } else {
      x += (Math.cos(startAngle) - Math.cos(endAngle)) / segment.curvature;
      z += (Math.sin(endAngle) - Math.sin(startAngle)) / segment.curvature;
    }
    y += segment.elevationDeltaM * t;
    cumulativeAngle = endAngle;
    break;
  }

  return { x, y, z, angle: cumulativeAngle };
}

export function centerlinePointAtIndex(trackState: TrackState, segmentIndex: number): CenterlinePoint {
  const startM = trackState.segmentStartM[segmentIndex] as number;
  return centerlinePointAt(trackState, startM);
}
