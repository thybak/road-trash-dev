import type { SceneryPlacement } from './SceneryPlacement';

export interface RoadSegmentDefinition {
  readonly lengthM: number;
  readonly curvature: number;
  readonly elevationDeltaM: number;
  readonly halfWidthM: number;
  readonly surfaceId: string;
  readonly scenery: readonly SceneryPlacement[];
  readonly hazards: readonly never[];
}
