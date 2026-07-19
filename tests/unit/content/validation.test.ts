import { describe, expect, it } from 'vitest';
import type { TrackDefinition } from '../../../src/content/schemas/TrackDefinition';
import { validateTrackDefinition, assertValidTrack } from '../../../src/content/validation';

describe('validateTrackDefinition', () => {
  const baseSegment = {
    lengthM: 10,
    curvature: 0,
    elevationDeltaM: 0,
    halfWidthM: 6,
    surfaceId: 'asphalt',
    scenery: [],
    hazards: [],
  };

  function makeTrack(patches: Partial<TrackDefinition> = {}): TrackDefinition {
    return {
      id: 'test',
      label: 'Test',
      lengthM: 20,
      segments: [baseSegment, { ...baseSegment }],
      ...patches,
    };
  }

  it('accepts a valid track', () => {
    expect(validateTrackDefinition(makeTrack())).toEqual([]);
  });

  it('rejects zero segments', () => {
    const errors = validateTrackDefinition(makeTrack({ segments: [], lengthM: 0 }));
    expect(errors.map((e) => e.message)).toContain('Track test has no segments.');
  });

  it('rejects non-positive lengthM', () => {
    const track = makeTrack({
      segments: [{ ...baseSegment, lengthM: -5 }, { ...baseSegment }],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('lengthM'))).toBe(true);
  });

  it('rejects non-positive halfWidthM', () => {
    const track = makeTrack({
      segments: [{ ...baseSegment, halfWidthM: 0 }, { ...baseSegment }],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('halfWidthM'))).toBe(true);
  });

  it('rejects an unknown surfaceId', () => {
    const track = makeTrack({
      segments: [{ ...baseSegment, surfaceId: 'marshmallow' }, { ...baseSegment }],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('surfaceId'))).toBe(true);
  });

  it('rejects an unknown scenery kind', () => {
    const track = makeTrack({
      segments: [
        {
          ...baseSegment,
          scenery: [{ kind: 'tree' as unknown as 'post', offsetM: 0, side: 'left' }],
        },
        { ...baseSegment },
      ],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('scenery kind'))).toBe(true);
  });

  it('rejects scenery offset outside the segment', () => {
    const track = makeTrack({
      segments: [
        {
          ...baseSegment,
          scenery: [{ kind: 'post', offsetM: 10, side: 'left' }],
        },
        { ...baseSegment },
      ],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('offsetM'))).toBe(true);
  });

  it('rejects hazards in Phase 2', () => {
    const track = makeTrack({
      segments: [{ ...baseSegment, hazards: [{} as never] }, { ...baseSegment }],
    });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('hazards'))).toBe(true);
  });

  it('rejects a lengthM that does not match the segment sum', () => {
    const track = makeTrack({ lengthM: 999 });
    expect(validateTrackDefinition(track).some((e) => e.message.includes('lengthM'))).toBe(true);
  });

  it('throws on assertValidTrack when invalid', () => {
    expect(() => assertValidTrack(makeTrack({ segments: [], lengthM: 0 }))).toThrow();
  });

  it('does not throw on assertValidTrack when valid', () => {
    expect(() => assertValidTrack(makeTrack())).not.toThrow();
  });
});
