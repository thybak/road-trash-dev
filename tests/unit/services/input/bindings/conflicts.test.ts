import { describe, expect, it } from 'vitest';
import { detectConflicts } from '../../../../../src/services/input/bindings/conflicts';
import { DEFAULT_PRESET } from '../../../../../src/services/input/bindings/presets';
import type { Binding } from '../../../../../src/services/input/types';

describe('detectConflicts', () => {
  it('returns no conflicts for the default preset', () => {
    expect(detectConflicts(DEFAULT_PRESET.bindings)).toEqual([]);
  });

  it('flags the same code bound to two actions', () => {
    const bindings: Binding[] = [
      { playerId: 'p1', action: 'accelerate', code: 'KeyW' },
      { playerId: 'p2', action: 'brake', code: 'KeyW' },
    ];
    const conflicts = detectConflicts(bindings);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe('duplicate-code');
    expect(conflicts[0].codes).toEqual(['KeyW']);
  });

  it('flags the same action bound to multiple codes', () => {
    const bindings: Binding[] = [
      { playerId: 'p1', action: 'accelerate', code: 'KeyW' },
      { playerId: 'p1', action: 'accelerate', code: 'KeyE' },
    ];
    const conflicts = detectConflicts(bindings);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe('duplicate-binding');
    expect(conflicts[0].codes).toEqual(expect.arrayContaining(['KeyW', 'KeyE']));
  });

  it('distinguishes shared-pause collision as a duplicate-code variant', () => {
    const bindings: Binding[] = [
      { playerId: 'p1', action: 'accelerate', code: 'Escape' },
      { playerId: 'shared', action: 'pause', code: 'Escape' },
    ];
    const conflicts = detectConflicts(bindings);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe('shared-pause-collision');
  });

  it('does not flag the same code bound twice when one is shared pause and the other is shared pause', () => {
    const bindings: Binding[] = [
      { playerId: 'shared', action: 'pause', code: 'Escape' },
    ];
    expect(detectConflicts(bindings)).toEqual([]);
  });
});