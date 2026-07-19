import type { PlayerId, PlayerCommand } from '../../simulation/commands/PlayerCommand';

export interface DebugSnapshot {
  readonly started: boolean;
  readonly audioState: string;
  readonly presetId: string;
  readonly presetDeviceKind: string;
  readonly commands: Record<PlayerId, PlayerCommand>;
  readonly downCodes: readonly string[];
  readonly pressedCodes: readonly string[];
  readonly releasedCodes: readonly string[];
  readonly p1AttackedThisFrame: boolean;
  readonly p2AttackedThisFrame: boolean;
  readonly phase?: string;
  readonly finishTimeS?: number;
  readonly riderProgressM?: number;
}

export interface AttackEdgeLatch {
  readonly p1: boolean;
  readonly p2: boolean;
}

export interface DebugProbe {
  snapshot(): DebugSnapshot | null;
  setSnapshot(s: DebugSnapshot): void;
  clear(): void;
  consumeAttackEdges(): AttackEdgeLatch;
}

export class BrowserDebugProbe implements DebugProbe {
  private current: DebugSnapshot | null = null;
  private p1AttackLatched = false;
  private p2AttackLatched = false;

  snapshot(): DebugSnapshot | null {
    return this.current;
  }

  setSnapshot(s: DebugSnapshot): void {
    this.current = s;
    if (s.p1AttackedThisFrame) this.p1AttackLatched = true;
    if (s.p2AttackedThisFrame) this.p2AttackLatched = true;
  }

  clear(): void {
    this.current = null;
    this.p1AttackLatched = false;
    this.p2AttackLatched = false;
  }

  consumeAttackEdges(): AttackEdgeLatch {
    const result: AttackEdgeLatch = { p1: this.p1AttackLatched, p2: this.p2AttackLatched };
    this.p1AttackLatched = false;
    this.p2AttackLatched = false;
    return result;
  }
}

declare global {
  interface Window {
    roadTrashDebug?: DebugProbe;
  }
}

export function installDebugProbe(): DebugProbe {
  if (typeof window === 'undefined') {
    return {
      snapshot: () => null,
      setSnapshot: () => {},
      clear: () => {},
      consumeAttackEdges: () => ({ p1: false, p2: false }),
    } satisfies DebugProbe;
  }
  if (window.roadTrashDebug) {
    return window.roadTrashDebug;
  }
  const probe = new BrowserDebugProbe();
  window.roadTrashDebug = probe;
  return probe;
}