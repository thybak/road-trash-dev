import type { RaceSnapshot } from '../../simulation/session/RaceSession';
import { buildChaseCamera, type CameraFrame } from '../../simulation/math/projection';

export class ChaseCamera {
  private frame: CameraFrame | null = null;

  update(snapshot: RaceSnapshot, screenWidth: number, screenHeight: number): void {
    this.frame = buildChaseCamera(
      snapshot.trackState,
      snapshot.rider.progressM,
      snapshot.rider.lateral,
      snapshot.rider.heightM,
      screenWidth,
      screenHeight,
    );
  }

  getFrame(): CameraFrame | null {
    return this.frame;
  }
}
