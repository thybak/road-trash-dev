import Phaser from 'phaser';
import type { RaceSnapshot } from '../../simulation/session/RaceSession';

const STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  color: '#00ff66',
};

export class DiagnosticOverlay {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(10, 10, '', STYLE).setOrigin(0, 0);
  }

  update(snapshot: RaceSnapshot, frameTimeMs: number): void {
    const { rider, phase, elapsedTimeS } = snapshot;
    const lines = [
      `Phase: ${phase}`,
      `Time: ${elapsedTimeS.toFixed(2)} s`,
      `Segment: ${this.segmentIndex(snapshot)}`,
      `Speed: ${rider.speedMps.toFixed(1)} m/s`,
      `Lateral: ${rider.lateral.toFixed(2)} m`,
      `Height: ${rider.heightM.toFixed(2)} m`,
      `Frame: ${frameTimeMs.toFixed(1)} ms`,
    ];
    this.text.setText(lines.join('\n'));
  }

  private segmentIndex(snapshot: RaceSnapshot): number {
    const starts = snapshot.trackState.segmentStartM;
    for (let i = starts.length - 1; i >= 0; i--) {
      if (snapshot.rider.progressM >= (starts[i] as number)) return i;
    }
    return 0;
  }

  destroy(): void {
    this.text.destroy();
  }
}
