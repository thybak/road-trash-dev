import { describe, expect, it } from 'vitest';
import { createTrackState } from '../../../../src/simulation/model/TrackState';
import { centerlinePointAt } from '../../../../src/simulation/math/roadGeometry';
import {
  segmentIndexAt,
  elevationAt,
  halfWidthAt,
  curvatureAt,
} from '../../../../src/simulation/systems/TrackSystem';

describe('TrackSystem', () => {
  const definition = {
    id: 'linear',
    label: 'Linear',
    lengthM: 30,
    segments: [
      { lengthM: 10, curvature: 0, elevationDeltaM: 1, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      { lengthM: 10, curvature: 0.1, elevationDeltaM: 2, halfWidthM: 8, surfaceId: 'asphalt', scenery: [], hazards: [] },
      { lengthM: 10, curvature: 0, elevationDeltaM: -1, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
    ],
  };

  const trackState = createTrackState(definition);

  it('computes total length from segments', () => {
    expect(trackState.totalLengthM).toBe(30);
  });

  it('looks up the correct segment by progress', () => {
    expect(segmentIndexAt(trackState, 0)).toBe(0);
    expect(segmentIndexAt(trackState, 9.9)).toBe(0);
    expect(segmentIndexAt(trackState, 10)).toBe(1);
    expect(segmentIndexAt(trackState, 25)).toBe(2);
    expect(segmentIndexAt(trackState, 30)).toBe(2);
  });

  it('returns segment properties at progress', () => {
    expect(halfWidthAt(trackState, 0)).toBe(6);
    expect(halfWidthAt(trackState, 15)).toBe(8);
    expect(curvatureAt(trackState, 5)).toBe(0);
    expect(curvatureAt(trackState, 15)).toBe(0.1);
  });

  it('accumulates elevation along the centerline', () => {
    expect(elevationAt(trackState, 0)).toBeCloseTo(0, 6);
    expect(elevationAt(trackState, 10)).toBeCloseTo(1, 6);
    expect(elevationAt(trackState, 20)).toBeCloseTo(3, 6);
    expect(elevationAt(trackState, 30)).toBeCloseTo(2, 6);
  });

  it('interpolates elevation within a segment', () => {
    expect(elevationAt(trackState, 5)).toBeCloseTo(0.5, 6);
    expect(elevationAt(trackState, 15)).toBeCloseTo(1 + 2 * 0.5, 6);
  });

  it('clamps progress to track bounds', () => {
    expect(segmentIndexAt(trackState, -5)).toBe(0);
    expect(segmentIndexAt(trackState, 100)).toBe(2);
    expect(elevationAt(trackState, -5)).toBeCloseTo(0, 6);
    expect(elevationAt(trackState, 100)).toBeCloseTo(2, 6);
  });
});

describe('roadGeometry', () => {
  it('keeps a straight road aligned with the Z axis', () => {
    const definition = {
      id: 'straight',
      label: 'Straight',
      lengthM: 100,
      segments: [
        { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    };
    const trackState = createTrackState(definition);
    const start = centerlinePointAt(trackState, 0);
    const end = centerlinePointAt(trackState, 100);

    expect(start.x).toBeCloseTo(0, 6);
    expect(start.z).toBeCloseTo(0, 6);
    expect(start.angle).toBeCloseTo(0, 6);
    expect(end.x).toBeCloseTo(0, 6);
    expect(end.z).toBeCloseTo(100, 6);
    expect(end.angle).toBeCloseTo(0, 6);
  });

  it('curves a right-hand segment', () => {
    const definition = {
      id: 'curve',
      label: 'Curve',
      lengthM: 100,
      segments: [
        { lengthM: 100, curvature: 0.01, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    };
    const trackState = createTrackState(definition);
    const point = centerlinePointAt(trackState, 50);

    // Curvature positive => right turn => x should be positive.
    expect(point.x).toBeGreaterThan(0);
    expect(point.angle).toBeCloseTo(0.5, 6);
  });

  it('curves a left-hand segment', () => {
    const definition = {
      id: 'left',
      label: 'Left',
      lengthM: 100,
      segments: [
        { lengthM: 100, curvature: -0.01, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    };
    const trackState = createTrackState(definition);
    const point = centerlinePointAt(trackState, 50);

    expect(point.x).toBeLessThan(0);
    expect(point.angle).toBeCloseTo(-0.5, 6);
  });
});
