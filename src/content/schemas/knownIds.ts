import type { SceneryKind } from './SceneryPlacement';

export const SURFACE_IDS = Object.freeze(['asphalt', 'dirt'] as const);

export type SurfaceId = (typeof SURFACE_IDS)[number];

export const SCENERY_KINDS = Object.freeze(['post'] as const);

export function isKnownSurfaceId(surfaceId: string): surfaceId is SurfaceId {
  return (SURFACE_IDS as readonly string[]).includes(surfaceId);
}

export function isKnownSceneryKind(kind: string): kind is SceneryKind {
  return (SCENERY_KINDS as readonly string[]).includes(kind);
}
