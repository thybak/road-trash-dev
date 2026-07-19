import { describe, expect, it } from 'vitest';
import { createTrackState } from '../../../../src/simulation/model/TrackState';
import {
  buildChaseCamera,
  curveOffsetM,
  projectRoadBoundary,
  projectSegment,
} from '../../../../src/simulation/math/projection';

describe('projection', () => {
  const straightTrack = createTrackState({
    id: 'straight',
    label: 'Straight',
    lengthM: 500,
    segments: Array.from({ length: 50 }, () => ({
      lengthM: 10,
      curvature: 0,
      elevationDeltaM: 0,
      halfWidthM: 6,
      surfaceId: 'asphalt',
      scenery: [],
      hazards: [],
    })),
  });

  const screenW = 800;
  const screenH = 450;

  it('projects a straight segment as a smaller trapezoid at the far end', () => {
    const camera = buildChaseCamera(straightTrack, 50, 0, 0.8, screenW, screenH);
    const segment = projectSegment(camera, straightTrack, 5);
    expect(segment).not.toBeNull();
    if (!segment) return;

    expect(segment.farScale).toBeLessThan(segment.nearScale);
    expect(segment.nearLeft.screenX + segment.nearRight.screenX).toBeCloseTo(screenW, 1);
    expect(segment.farLeft.screenX + segment.farRight.screenX).toBeCloseTo(screenW, 1);
  });

  it('projects the rider in the lower half of the screen', () => {
    const camera = buildChaseCamera(straightTrack, 50, 0, 0.8, screenW, screenH);
    const projected = projectRoadBoundary(camera, straightTrack, 50, 0, 0.8);
    expect(projected).not.toBeNull();
    if (!projected) return;

    expect(projected.screenY).toBeGreaterThan(screenH / 2);
    expect(Math.abs(projected.screenX - screenW / 2)).toBeLessThan(20);
  });

  it('rejects points behind the camera', () => {
    const camera = buildChaseCamera(straightTrack, 50, 0, 0.8, screenW, screenH);
    const projected = projectRoadBoundary(camera, straightTrack, 20, 0, 0);
    expect(projected).toBeNull();
  });

  it('curves shift the road centerline to the right on a right curve', () => {
    const rightCurve = createTrackState({
      id: 'right',
      label: 'Right',
      lengthM: 200,
      segments: Array.from({ length: 20 }, () => ({
        lengthM: 10,
        curvature: 0.005,
        elevationDeltaM: 0,
        halfWidthM: 6,
        surfaceId: 'asphalt',
        scenery: [],
        hazards: [],
      })),
    });
    const camera = buildChaseCamera(rightCurve, 100, 0, 0.8, screenW, screenH);
    const segment = projectSegment(camera, rightCurve, 10);
    expect(segment).not.toBeNull();
    if (!segment) return;

    const nearMidX = (segment.nearLeft.screenX + segment.nearRight.screenX) / 2;
    expect(nearMidX).toBeGreaterThan(screenW / 2);
  });

  it('elevation changes move the road horizon relative to flat', () => {
    const hillTrack = createTrackState({
      id: 'hill',
      label: 'Hill',
      lengthM: 200,
      segments: [
        { lengthM: 100, curvature: 0, elevationDeltaM: 5, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
        { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    });

    const camera = buildChaseCamera(hillTrack, 50, 0, 0.8, screenW, screenH);
    const hillSeg = projectSegment(camera, hillTrack, 1);
    const flatTrack = createTrackState({
      id: 'flat',
      label: 'Flat',
      lengthM: 200,
      segments: [
        { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
        { lengthM: 100, curvature: 0, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] },
      ],
    });
    const flatCamera = buildChaseCamera(flatTrack, 50, 0, 0.8, screenW, screenH);
    const flatSeg = projectSegment(flatCamera, flatTrack, 1);

    expect(hillSeg).not.toBeNull();
    expect(flatSeg).not.toBeNull();
    if (!hillSeg || !flatSeg) return;

    const hillMidY = (hillSeg.nearLeft.screenY + hillSeg.nearRight.screenY) / 2;
    const flatMidY = (flatSeg.nearLeft.screenY + flatSeg.nearRight.screenY) / 2;
    expect(hillMidY).not.toBeCloseTo(flatMidY, 0);
  });

  it('lateral offsets shift the projection horizontally', () => {
    const camera = buildChaseCamera(straightTrack, 50, 0, 0.8, screenW, screenH);
    const left = projectRoadBoundary(camera, straightTrack, 50, -6, 0.8);
    const right = projectRoadBoundary(camera, straightTrack, 50, 6, 0.8);
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    if (!left || !right) return;

    expect(left.screenX).toBeLessThan(right.screenX);
  });

  it('curveOffsetM accumulates with the square of distance for constant curvature', () => {
    const curve = createTrackState({
      id: 'quad',
      label: 'Quadratic',
      lengthM: 100,
      segments: [{ lengthM: 100, curvature: 0.01, elevationDeltaM: 0, halfWidthM: 6, surfaceId: 'asphalt', scenery: [], hazards: [] }],
    });
    const offset10 = curveOffsetM(curve, 0, 10);
    const offset20 = curveOffsetM(curve, 0, 20);
    expect(offset20).toBeCloseTo(offset10 * 4, 1);
    expect(offset10).toBeGreaterThan(0);
  });
});
