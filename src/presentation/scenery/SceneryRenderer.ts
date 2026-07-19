import Phaser from 'phaser';
import type { RaceSnapshot } from '../../simulation/session/RaceSession';
import { projectRoadBoundary, type CameraFrame } from '../../simulation/math/projection';
import {
  POST_HEIGHT_M,
  POST_OFFSET_FROM_EDGE_M,
  POST_WIDTH_M,
  ROAD_DRAW_DISTANCE_M,
} from '../../simulation/tuning';
import { segmentIndexAt, propertiesAt } from '../../simulation/systems/TrackSystem';

const POST_COLOR = 0xc47a4a;

export class SceneryRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  render(frame: CameraFrame, snapshot: RaceSnapshot): void {
    this.graphics.clear();

    const { trackState, rider } = snapshot;
    const drawEndM = Math.min(trackState.totalLengthM, rider.progressM + ROAD_DRAW_DISTANCE_M);
    const startIndex = segmentIndexAt(trackState, rider.progressM);
    const endIndex = segmentIndexAt(trackState, drawEndM);

    for (let i = startIndex; i <= endIndex; i++) {
      const segment = trackState.definition.segments[i];
      if (!segment) continue;

      const segmentStartM = trackState.segmentStartM[i] as number;

      for (const item of segment.scenery) {
        const progressM = segmentStartM + item.offsetM;
        if (progressM < rider.progressM || progressM > drawEndM) continue;

        const { halfWidthM } = propertiesAt(trackState, progressM);
        const lateralSign = item.side === 'left' ? -1 : 1;
        const lateralM = lateralSign * (halfWidthM + POST_OFFSET_FROM_EDGE_M);

        const base = projectRoadBoundary(frame, trackState, progressM, lateralM, 0);
        const top = projectRoadBoundary(frame, trackState, progressM, lateralM, POST_HEIGHT_M);
        if (!base || !top) continue;

        const width = Math.max(1, POST_WIDTH_M * base.scale);
        this.graphics.fillStyle(POST_COLOR, 1);
        this.graphics.fillRect(base.screenX - width / 2, top.screenY, width, base.screenY - top.screenY);
      }
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
