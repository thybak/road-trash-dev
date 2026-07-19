import type { RoadSegmentDefinition } from './RoadSegmentDefinition';

export interface TrackDefinition {
  readonly id: string;
  readonly label: string;
  readonly lengthM: number;
  readonly segments: readonly RoadSegmentDefinition[];
}
