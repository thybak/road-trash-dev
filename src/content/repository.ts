import type { TrackDefinition } from './schemas/TrackDefinition';
import { TEST_TRACK_01 } from './tracks/test-track-01';
import { assertValidTrack } from './validation';

export interface TrackRepository {
  readonly getTrackById: (id: string) => TrackDefinition;
  readonly listTrackIds: () => readonly string[];
}

export function createTrackRepository(tracks: readonly TrackDefinition[]): TrackRepository {
  for (const track of tracks) {
    assertValidTrack(track);
  }

  const byId = new Map<string, TrackDefinition>();
  for (const track of tracks) {
    if (byId.has(track.id)) {
      throw new Error(`Duplicate track id "${track.id}".`);
    }
    byId.set(track.id, track);
  }

  return {
    getTrackById: (id: string): TrackDefinition => {
      const track = byId.get(id);
      if (!track) throw new Error(`Unknown track id "${id}".`);
      return track;
    },
    listTrackIds: (): readonly string[] => Object.freeze(Array.from(byId.keys())),
  };
}

export const defaultTrackRepository = createTrackRepository([TEST_TRACK_01]);
