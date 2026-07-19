import Phaser from 'phaser';
import { KeyboardService } from '../../services/input/keyboard/KeyboardService';
import { KeyboardAdapter } from '../../services/input/keyboard/KeyboardAdapter';
import { CommandMapper } from '../../services/input/bindings/CommandMapper';
import { DEFAULT_PRESET } from '../../services/input/bindings/presets';
import { installDebugProbe, type DebugProbe } from '../debug/DebugProbe';
import { defaultTrackRepository } from '../../content/repository';
import { RaceSession } from '../../simulation/session/RaceSession';
import { ChaseCamera } from '../../presentation/camera/ChaseCamera';
import { RoadRenderer } from '../../presentation/road/RoadRenderer';
import { SceneryRenderer } from '../../presentation/scenery/SceneryRenderer';
import { RiderSprite } from '../../presentation/riders/RiderSprite';
import { DiagnosticOverlay } from '../../presentation/hud/DiagnosticOverlay';
import { STEP_S, MAX_STEPS_PER_FRAME } from '../../simulation/tuning';

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '18px',
  color: '#101010',
};

export class RaceScene extends Phaser.Scene {
  private keyboard = new KeyboardService();
  private adapter = new KeyboardAdapter({ service: this.keyboard });
  private mapper = new CommandMapper(this.keyboard);
  private probe: DebugProbe = installDebugProbe();
  private session: RaceSession | null = null;
  private camera: ChaseCamera | null = null;
  private roadRenderer: RoadRenderer | null = null;
  private sceneryRenderer: SceneryRenderer | null = null;
  private riderSprite: RiderSprite | null = null;
  private diagnosticOverlay: DiagnosticOverlay | null = null;
  private backButton: Phaser.GameObjects.Text | null = null;
  private finishOverlay: Phaser.GameObjects.Text | null = null;

  private accumulatorS = 0;
  private raceFinished = false;

  constructor() {
    super({ key: 'RaceScene' });
  }

  create(): void {
    this.mapper.setPreset(DEFAULT_PRESET);
    this.keyboard.setPreventDefaultCodes(DEFAULT_PRESET.bindings.map((b: { code: string }) => b.code));
    this.adapter.attach();

    const track = defaultTrackRepository.getTrackById('test-track-01');
    this.session = new RaceSession(track, 'p1');
    this.camera = new ChaseCamera();
    this.roadRenderer = new RoadRenderer(this);
    this.sceneryRenderer = new SceneryRenderer(this);
    this.riderSprite = new RiderSprite(this);
    this.diagnosticOverlay = new DiagnosticOverlay(this);

    this.createBackButton();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.teardown, this);
    this.events.once('destroy', this.teardown, this);
  }

  override update(_time: number, deltaMs: number): void {
    if (!this.session || !this.camera || !this.roadRenderer || !this.sceneryRenderer || !this.riderSprite || !this.diagnosticOverlay) {
      return;
    }

    const commands = this.mapper.map();
    const p1Command = commands.p1;

    this.accumulatorS += deltaMs / 1000;
    const maxAccumulatedS = MAX_STEPS_PER_FRAME * STEP_S;
    if (this.accumulatorS > maxAccumulatedS) {
      this.accumulatorS = maxAccumulatedS;
    }

    while (this.accumulatorS >= STEP_S) {
      const snapshot = this.session.step(p1Command, STEP_S);
      if (snapshot.phase === 'finished' && !this.raceFinished) {
        this.raceFinished = true;
        this.showFinishOverlay(snapshot.finishTimeS ?? snapshot.elapsedTimeS);
      }
      this.accumulatorS -= STEP_S;
    }

    const snapshot = this.session.snapshot();
    const { width, height } = this.scale;
    this.camera.update(snapshot, width, height);
    const frame = this.camera.getFrame();

    if (frame) {
      this.roadRenderer.render(frame, snapshot);
      this.sceneryRenderer.render(frame, snapshot);
      this.riderSprite.render(frame, snapshot);
    }

    this.diagnosticOverlay.update(snapshot, deltaMs);
    this.keyboard.afterFrame();
    this.probe.setSnapshot({
      started: true,
      audioState: 'unlocked',
      presetId: DEFAULT_PRESET.id,
      presetDeviceKind: DEFAULT_PRESET.deviceKind,
      commands,
      downCodes: this.keyboard.downCodes(),
      pressedCodes: this.keyboard.pressedCodes(),
      releasedCodes: this.keyboard.releasedCodes(),
      p1AttackedThisFrame: commands.p1.attackPressed,
      p2AttackedThisFrame: commands.p2.attackPressed,
      phase: snapshot.phase,
      riderProgressM: snapshot.rider.progressM,
      ...(snapshot.finishTimeS !== null ? { finishTimeS: snapshot.finishTimeS } : {}),
    });
  }

  private createBackButton(): void {
    const { width } = this.scale;
    this.backButton = this.add
      .text(width - 10, 10, 'Back to Menu', BUTTON_STYLE)
      .setOrigin(1, 0)
      .setStyle({ backgroundColor: '#fc6' })
      .setPadding(8)
      .setInteractive({ useHandCursor: true });
    this.backButton.on('pointerup', () => this.returnToMenu());
  }

  private showFinishOverlay(finishTimeS: number): void {
    const { width, height } = this.scale;
    this.finishOverlay = this.add
      .text(width / 2, height / 2, `Finished!\nTime: ${finishTimeS.toFixed(2)} s\nClick Back to Menu`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setStyle({ backgroundColor: '#000000', padding: 12 });
  }

  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }

  private handleResize(
    gameSize: Phaser.Structs.Size,
    _baseSize: Phaser.Structs.Size,
    _displaySize: Phaser.Structs.Size,
    _resolution: number,
  ): void {
    if (this.backButton) {
      this.backButton.setPosition(gameSize.width - 10, 10);
    }
    if (this.finishOverlay) {
      this.finishOverlay.setPosition(gameSize.width / 2, gameSize.height / 2);
    }
  }

  private teardown(): void {
    this.adapter.detach();
    this.scale.off('resize', this.handleResize, this);
    this.events.off('shutdown', this.teardown, this);
    this.events.off('destroy', this.teardown, this);
    this.keyboard.clearAll();
    this.probe.clear();
    this.roadRenderer?.destroy();
    this.sceneryRenderer?.destroy();
    this.riderSprite?.destroy();
    this.diagnosticOverlay?.destroy();
    this.backButton?.destroy();
    this.finishOverlay?.destroy();
    this.roadRenderer = null;
    this.sceneryRenderer = null;
    this.riderSprite = null;
    this.diagnosticOverlay = null;
    this.backButton = null;
    this.finishOverlay = null;
    this.session = null;
    this.camera = null;
  }
}
