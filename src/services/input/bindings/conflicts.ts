import type { Binding } from '../types';

export type ConflictReason =
  | 'duplicate-code'
  | 'duplicate-binding'
  | 'shared-pause-collision';

export interface Conflict {
  readonly reason: ConflictReason;
  readonly message: string;
  readonly codes: readonly string[];
  readonly bindings: readonly Binding[];
}

export function detectConflicts(bindings: readonly Binding[]): Conflict[] {
  const conflicts: Conflict[] = [];

  const byCode = new Map<string, Binding[]>();
  for (const b of bindings) {
    const list = byCode.get(b.code) ?? [];
    list.push(b);
    byCode.set(b.code, list);
  }
  for (const [code, list] of byCode) {
    if (list.length > 1) {
      const isSharedPauseCase =
        list.length === 2 &&
        list.some((b) => b.playerId === 'shared' && b.action === 'pause');
      conflicts.push({
        reason: isSharedPauseCase ? 'shared-pause-collision' : 'duplicate-code',
        message: `Code "${code}" is bound to more than one action.`,
        codes: [code],
        bindings: list,
      });
    }
  }

  const byPlayerAction = new Map<string, Binding[]>();
  for (const b of bindings) {
    const key = `${b.playerId}:${b.action}`;
    const list = byPlayerAction.get(key) ?? [];
    list.push(b);
    byPlayerAction.set(key, list);
  }
  for (const [, list] of byPlayerAction) {
    if (list.length > 1) {
      conflicts.push({
        reason: 'duplicate-binding',
        message: `Action "${list[0].action}" for "${list[0].playerId}" is bound to multiple codes.`,
        codes: list.map((b) => b.code),
        bindings: list,
      });
    }
  }

  return conflicts;
}