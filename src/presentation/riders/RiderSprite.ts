import Phaser from 'phaser';
import type { RaceSnapshot } from '../../simulation/session/RaceSession';
import { projectRider, type CameraFrame } from '../../simulation/math/projection';
import { LEAN_RAD_PER_LATERAL_MPS, MAX_LEAN_RAD } from '../../simulation/tuning';

export class RiderSprite {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  render(frame: CameraFrame, snapshot: RaceSnapshot): void {
    this.graphics.clear();

    const projected = projectRider(
      frame,
      snapshot.trackState,
      snapshot.rider.progressM,
      snapshot.rider.lateral,
      snapshot.rider.heightM,
    );
    if (!projected) return;

    const scale = projected.scale;
    const x = projected.screenX;
    const y = projected.screenY;

    // Placeholder bike silhouette in metres-at-rider-space, scaled to screen.
    const lean = Math.max(-MAX_LEAN_RAD, Math.min(MAX_LEAN_RAD, snapshot.rider.lateral * LEAN_RAD_PER_LATERAL_MPS));
    const cos = Math.cos(lean);
    const sin = Math.sin(lean);

    const wheelBaseM = 1.6;
    const wheelRadiusM = 0.3;
    const bodyHeightM = 0.7;

    // Helper to transform a local metre offset into screen space.
    const toScreen = (lx: number, ly: number) => ({
      x: x + (lx * cos - ly * sin) * scale,
      y: y + (lx * sin + ly * cos) * scale,
    });

    // Wheels
    this.graphics.lineStyle(2, 0x222222);
    const rearWheel = toScreen(-wheelBaseM * 0.45, 0);
    const frontWheel = toScreen(wheelBaseM * 0.45, 0);
    this.graphics.strokeCircle(rearWheel.x, rearWheel.y, wheelRadiusM * scale);
    this.graphics.strokeCircle(frontWheel.x, frontWheel.y, wheelRadiusM * scale);

    // Frame + rider as one filled shape.
    this.graphics.fillStyle(0x4f84ff, 1);
    const bodyPoints = [
      toScreen(-wheelBaseM * 0.45, 0),
      toScreen(wheelBaseM * 0.45, 0),
      toScreen(wheelBaseM * 0.35, -bodyHeightM * 0.6),
      toScreen(0, -bodyHeightM),
      toScreen(-wheelBaseM * 0.35, -bodyHeightM * 0.6),
    ];
    this.graphics.beginPath();
    this.graphics.moveTo(bodyPoints[0].x, bodyPoints[0].y);
    for (let i = 1; i < bodyPoints.length; i++) {
      const pt = bodyPoints[i] as { x: number; y: number };
      this.graphics.lineTo(pt.x, pt.y);
    }
    this.graphics.closePath();
    this.graphics.fillPath();

    // Rider head
    this.graphics.fillStyle(0xe0e0e0, 1);
    const head = toScreen(0, -bodyHeightM * 1.3);
    this.graphics.fillCircle(head.x, head.y, 0.18 * scale);
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
