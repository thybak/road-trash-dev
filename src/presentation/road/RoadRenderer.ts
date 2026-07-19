import Phaser from 'phaser';
import type { RaceSnapshot } from '../../simulation/session/RaceSession';
import {
  projectRoadBoundary,
  projectSegment,
  type CameraFrame,
} from '../../simulation/math/projection';
import { ROAD_DRAW_DISTANCE_M } from '../../simulation/tuning';
import { segmentIndexAt } from '../../simulation/systems/TrackSystem';

const ROAD_COLORS = [0x3a3a3a, 0x404040];
const SHOULDER_COLOR = 0x2a2a2a;
const EDGE_COLOR = 0x8a8a8a;

interface ScreenPoint {
  readonly screenX: number;
  readonly screenY: number;
}

export class RoadRenderer {
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

    for (let i = endIndex; i >= startIndex; i--) {
      const segment = trackState.definition.segments[i];
      if (!segment) continue;

      const projected = projectSegment(frame, trackState, i);
      if (!projected) continue;

      const nearStartM = trackState.segmentStartM[i] as number;
      const farStartM = nearStartM + segment.lengthM;
      const shoulderHalfWidthM = segment.halfWidthM + 2;

      const shoulderLeft = projectRoadBoundary(frame, trackState, nearStartM, -shoulderHalfWidthM, 0);
      const shoulderRight = projectRoadBoundary(frame, trackState, nearStartM, shoulderHalfWidthM, 0);
      const shoulderFarLeft = projectRoadBoundary(frame, trackState, farStartM, -shoulderHalfWidthM, 0);
      const shoulderFarRight = projectRoadBoundary(frame, trackState, farStartM, shoulderHalfWidthM, 0);

      if (shoulderLeft && shoulderRight && shoulderFarLeft && shoulderFarRight) {
        this.drawPolygon(
          shoulderLeft,
          shoulderRight,
          shoulderFarRight,
          shoulderFarLeft,
          SHOULDER_COLOR,
          1,
        );
      }

      const color = ROAD_COLORS[i % ROAD_COLORS.length];
      if (color !== undefined) {
        this.drawPolygon(
          projected.nearLeft,
          projected.nearRight,
          projected.farRight,
          projected.farLeft,
          color,
          1,
        );
      }

      this.graphics.lineStyle(1, EDGE_COLOR, 1);
      this.graphics.lineBetween(
        projected.nearLeft.screenX,
        projected.nearLeft.screenY,
        projected.farLeft.screenX,
        projected.farLeft.screenY,
      );
      this.graphics.lineBetween(
        projected.nearRight.screenX,
        projected.nearRight.screenY,
        projected.farRight.screenX,
        projected.farRight.screenY,
      );

      if (i % 2 === 0) {
        this.graphics.lineStyle(1, 0xaaaaaa, 0.6);
        const nearCenterX = (projected.nearLeft.screenX + projected.nearRight.screenX) / 2;
        const nearCenterY = (projected.nearLeft.screenY + projected.nearRight.screenY) / 2;
        const farCenterX = (projected.farLeft.screenX + projected.farRight.screenX) / 2;
        const farCenterY = (projected.farLeft.screenY + projected.farRight.screenY) / 2;
        this.graphics.lineBetween(nearCenterX, nearCenterY, farCenterX, farCenterY);
      }
    }
  }

  private drawPolygon(
    a: ScreenPoint,
    b: ScreenPoint,
    c: ScreenPoint,
    d: ScreenPoint,
    fillColor: number,
    alpha: number,
  ): void {
    this.graphics.fillStyle(fillColor, alpha);
    this.graphics.beginPath();
    this.graphics.moveTo(a.screenX, a.screenY);
    this.graphics.lineTo(b.screenX, b.screenY);
    this.graphics.lineTo(c.screenX, c.screenY);
    this.graphics.lineTo(d.screenX, d.screenY);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
