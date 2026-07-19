import type { TrackState } from '../model/TrackState';
import {
  CAMERA_DISTANCE_BEHIND_M,
  CAMERA_HEIGHT_M,
  CAMERA_LOOK_VERTICAL_OFFSET_M,
} from '../tuning';
import { elevationAt, propertiesAt } from '../systems/TrackSystem';

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CameraFrame {
  readonly position: Vec3;
  readonly forward: Vec3;
  readonly up: Vec3;
  readonly right: Vec3;
  readonly focalLength: number;
  readonly screenCenterX: number;
  readonly screenCenterY: number;
}

export interface ProjectedPoint {
  readonly screenX: number;
  readonly screenY: number;
  readonly scale: number;
  readonly zCam: number;
}

export interface ScreenSegment {
  readonly nearLeft: ProjectedPoint;
  readonly nearRight: ProjectedPoint;
  readonly farLeft: ProjectedPoint;
  readonly farRight: ProjectedPoint;
  readonly nearScale: number;
  readonly farScale: number;
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len === 0) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function computeCameraUp(forward: Vec3): Vec3 {
  const worldUp: Vec3 = { x: 0, y: 1, z: 0 };
  const fy = dot(worldUp, forward);
  const raw = sub(worldUp, scale(forward, fy));
  return normalize(raw);
}

/**
 * Lateral offset of the road centerline at `toProgressM` caused by curvature
 * between `fromProgressM` and `toProgressM`. This is the classic pseudo-3D
 * approximation: the road is drawn relative to a straight-ahead axis from the
 * camera, and curvature bends it sideways.
 */
export function curveOffsetM(trackState: TrackState, fromProgressM: number, toProgressM: number): number {
  if (toProgressM <= fromProgressM) return 0;

  const { definition, segmentStartM } = trackState;
  let offset = 0;
  const start = Math.max(0, fromProgressM);
  const end = Math.min(toProgressM, trackState.totalLengthM);

  for (let i = 0; i < definition.segments.length; i++) {
    const segment = definition.segments[i] as typeof definition.segments[0];
    const segStartM = segmentStartM[i] as number;
    const segEndM = segStartM + segment.lengthM;

    if (end <= segStartM) break;
    if (start >= segEndM) continue;

    const partialStartM = Math.max(start, segStartM);
    const partialEndM = Math.min(end, segEndM);
    const partialLengthM = partialEndM - partialStartM;
    const midM = (partialStartM + partialEndM) / 2;

    // Contribution of constant curvature over a partial segment.
    offset += segment.curvature * partialLengthM * (toProgressM - midM);
  }

  return offset;
}

export function buildChaseCamera(
  trackState: TrackState,
  riderProgressM: number,
  riderLateral: number,
  riderHeightM: number,
  screenWidth: number,
  screenHeight: number,
): CameraFrame {
  const camProgressM = Math.max(0, riderProgressM - CAMERA_DISTANCE_BEHIND_M);
  const position: Vec3 = {
    x: 0,
    y: elevationAt(trackState, camProgressM) + CAMERA_HEIGHT_M,
    z: camProgressM,
  };

  const lookAt: Vec3 = {
    x: riderLateral,
    y: elevationAt(trackState, riderProgressM) + riderHeightM + CAMERA_LOOK_VERTICAL_OFFSET_M,
    z: riderProgressM,
  };

  const forward = normalize(sub(lookAt, position));
  const up = computeCameraUp(forward);
  const right: Vec3 = { x: 1, y: 0, z: 0 };

  return {
    position,
    forward,
    up,
    right,
    focalLength: screenHeight * 0.8,
    screenCenterX: screenWidth / 2,
    screenCenterY: screenHeight / 2,
  };
}

export function projectPoint(camera: CameraFrame, point: Vec3): ProjectedPoint | null {
  const relative = sub(point, camera.position);
  const xCam = dot(relative, camera.right);
  const yCam = dot(relative, camera.up);
  const zCam = dot(relative, camera.forward);

  if (zCam <= 0.01) return null;

  const s = camera.focalLength / zCam;
  return {
    screenX: camera.screenCenterX + xCam * s,
    screenY: camera.screenCenterY - yCam * s,
    scale: s,
    zCam,
  };
}

function worldPoint(
  trackState: TrackState,
  cameraProgressM: number,
  progressM: number,
  lateral: number,
  heightAboveRoad: number,
): Vec3 {
  return {
    x: lateral + curveOffsetM(trackState, cameraProgressM, progressM),
    y: elevationAt(trackState, progressM) + heightAboveRoad,
    z: progressM,
  };
}

export function projectRoadBoundary(
  camera: CameraFrame,
  trackState: TrackState,
  progressM: number,
  lateral: number,
  heightAboveRoad: number,
): ProjectedPoint | null {
  return projectPoint(camera, worldPoint(trackState, camera.position.z, progressM, lateral, heightAboveRoad));
}

export function projectSegment(
  camera: CameraFrame,
  trackState: TrackState,
  segmentIndex: number,
): ScreenSegment | null {
  const segment = trackState.definition.segments[segmentIndex];
  if (!segment) return null;

  const nearStartM = trackState.segmentStartM[segmentIndex] as number;
  const farStartM = nearStartM + segment.lengthM;

  const nearLeft = projectRoadBoundary(camera, trackState, nearStartM, -segment.halfWidthM, 0);
  const nearRight = projectRoadBoundary(camera, trackState, nearStartM, segment.halfWidthM, 0);
  const farLeft = projectRoadBoundary(camera, trackState, farStartM, -segment.halfWidthM, 0);
  const farRight = projectRoadBoundary(camera, trackState, farStartM, segment.halfWidthM, 0);

  if (!nearLeft || !nearRight || !farLeft || !farRight) return null;

  return {
    nearLeft,
    nearRight,
    farLeft,
    farRight,
    nearScale: nearLeft.scale,
    farScale: farLeft.scale,
  };
}

export function projectRider(
  camera: CameraFrame,
  trackState: TrackState,
  progressM: number,
  lateral: number,
  heightAboveRoad: number,
): ProjectedPoint | null {
  return projectRoadBoundary(camera, trackState, progressM, lateral, heightAboveRoad);
}

export function isOnRoad(trackState: TrackState, progressM: number, lateral: number): boolean {
  const { halfWidthM } = propertiesAt(trackState, progressM);
  return Math.abs(lateral) <= halfWidthM;
}
