import type { TrackDefinition } from '../schemas/TrackDefinition';
import type { RoadSegmentDefinition } from '../schemas/RoadSegmentDefinition';
import type { SceneryPlacement } from '../schemas/SceneryPlacement';
import { assertValidTrack } from '../validation';

const SEGMENT_LENGTH_M = 10;
const HALF_WIDTH_M = 6;
const POST_INTERVAL_M = 40;

interface TrackSection {
  readonly segmentCount: number;
  readonly curvature: number;
  readonly elevationDeltaM: number;
}

function createScenery(segmentLengthM: number, segmentIndex: number): readonly SceneryPlacement[] {
  const progressAlongSectionM = segmentIndex * segmentLengthM;
  if (progressAlongSectionM % POST_INTERVAL_M !== 0) return [];
  return [
    { kind: 'post', offsetM: 0, side: 'left' },
    { kind: 'post', offsetM: 0, side: 'right' },
  ];
}

function buildSections(sections: readonly TrackSection[]): readonly RoadSegmentDefinition[] {
  const segments: RoadSegmentDefinition[] = [];
  for (const section of sections) {
    for (let i = 0; i < section.segmentCount; i++) {
      segments.push({
        lengthM: SEGMENT_LENGTH_M,
        curvature: section.curvature,
        elevationDeltaM: section.elevationDeltaM,
        halfWidthM: HALF_WIDTH_M,
        surfaceId: 'asphalt',
        scenery: createScenery(SEGMENT_LENGTH_M, i),
        hazards: [],
      });
    }
  }
  return segments;
}

function buildTestTrackDefinition(): TrackDefinition {
  const sections: TrackSection[] = [
    { segmentCount: 20, curvature: 0, elevationDeltaM: 0 },          // 200m straight
    { segmentCount: 15, curvature: 0.004, elevationDeltaM: 0.2 },    // 150m gentle right + climb
    { segmentCount: 10, curvature: 0, elevationDeltaM: 0.3 },        // 100m crest
    { segmentCount: 15, curvature: -0.005, elevationDeltaM: -0.4 },  // 150m gentle left + drop
    { segmentCount: 20, curvature: 0, elevationDeltaM: 0 },          // 200m straight
    { segmentCount: 12, curvature: 0.006, elevationDeltaM: -0.1 },   // 120m gentle right
    { segmentCount: 15, curvature: -0.004, elevationDeltaM: 0 },     // 150m gentle left
    { segmentCount: 38, curvature: 0, elevationDeltaM: 0 },          // 380m final straight
  ];

  const segments = buildSections(sections);
  const lengthM = segments.reduce((sum, s) => sum + s.lengthM, 0);

  return {
    id: 'test-track-01',
    label: 'Sunset Straight',
    lengthM,
    segments,
  };
}

export const TEST_TRACK_01 = buildTestTrackDefinition();

assertValidTrack(TEST_TRACK_01);
