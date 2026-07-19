export type SceneryKind = 'post';

export interface SceneryPlacement {
  readonly kind: SceneryKind;
  readonly offsetM: number;
  readonly side: 'left' | 'right';
}
