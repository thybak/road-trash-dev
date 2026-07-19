import Phaser from 'phaser';
import { KeyboardService } from '../../services/input/keyboard/KeyboardService';
import { KeyboardAdapter } from '../../services/input/keyboard/KeyboardAdapter';
import { CommandMapper } from '../../services/input/bindings/CommandMapper';
import { DEFAULT_PRESET } from '../../services/input/bindings/presets';
import { detectConflicts } from '../../services/input/bindings/conflicts';
import { AudioContextService } from '../../services/audio/AudioContextService';
import { PlaceholderPresenter } from '../../presentation/placeholders/PlaceholderPresenter';
import { installDebugProbe, type DebugProbe } from '../debug/DebugProbe';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '28px',
  color: '#e0e0e0',
};
const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  color: '#c0c0c0',
};
const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '18px',
  color: '#101010',
};

const BINDING_LABELS: Record<string, string> = {
  accelerate: 'Accelerate',
  brake: 'Brake',
  steerLeft: 'Steer Left',
  steerRight: 'Steer Right',
  attack: 'Attack',
  pause: 'Pause',
};

export class MenuScene extends Phaser.Scene {
  private keyboard = new KeyboardService();
  private adapter = new KeyboardAdapter({ service: this.keyboard });
  private mapper = new CommandMapper(this.keyboard);
  private audio = new AudioContextService();
  private probe: DebugProbe = installDebugProbe();
  private currentPresetId = DEFAULT_PRESET.id;
  private currentPresetDeviceKind = DEFAULT_PRESET.deviceKind;
  private presenter: PlaceholderPresenter | null = null;

  private stateLabel: Phaser.GameObjects.Text | null = null;
  private startButton: Phaser.GameObjects.Text | null = null;
  private actionPanel: Phaser.GameObjects.Text | null = null;
  private rawCodePanel: Phaser.GameObjects.Text | null = null;
  private flashLabel: Phaser.GameObjects.Text | null = null;

  private started = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.mapper.setPreset(DEFAULT_PRESET);
    this.keyboard.setPreventDefaultCodes(DEFAULT_PRESET.bindings.map((b) => b.code));

    const { width, height } = this.scale;
    const bounds = new Phaser.Geom.Rectangle(40, 280, width - 80, height - 320);

    this.add
      .text(width / 2, 30, 'Road Trash — input laboratory', TITLE_STYLE)
      .setOrigin(0.5, 0);

    this.add
      .text(40, 80, this.describePreset(), BODY_STYLE)
      .setOrigin(0, 0);

    this.startButton = this.add
      .text(width / 2, 140, this.started ? 'Audio unlocked' : 'Press Start', BUTTON_STYLE)
      .setOrigin(0.5, 0)
      .setStyle({ backgroundColor: this.started ? '#456' : '#fc6' })
      .setPadding(8)
      .setInteractive({ useHandCursor: true });

    this.startButton.on('pointerup', () => {
      void this.audio.unlock().then(() => {
        this.started = true;
        (this.startButton as Phaser.GameObjects.Text).setText('Audio unlocked');
        (this.startButton as Phaser.GameObjects.Text).setStyle({ backgroundColor: '#456' });
      });
    });

    this.stateLabel = this.add
      .text(width - 40, 80, this.describeAudioState(), BODY_STYLE)
      .setOrigin(1, 0);

    this.actionPanel = this.add
      .text(40, 180, this.buildActionPanel(), BODY_STYLE)
      .setOrigin(0, 0);

    this.rawCodePanel = this.add
      .text(width / 2, 220, 'Active codes:', BODY_STYLE)
      .setOrigin(0.5, 0);

    this.add
      .text(width - 40, 220, this.buildConflictPanel(), BODY_STYLE)
      .setOrigin(1, 0);

    // Visual bounds outline for the placeholder area.
    this.add.rectangle(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width,
      bounds.height,
    ).setStrokeStyle(1, 0x606060, 0.5);

    this.presenter = new PlaceholderPresenter(this, bounds);

    this.add
      .text(width / 2, height - 70, 'Start Race', BUTTON_STYLE)
      .setOrigin(0.5, 0)
      .setStyle({ backgroundColor: '#6c6' })
      .setPadding(8)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('RaceScene'));

    this.flashLabel = this.add
      .text(width / 2, height - 32, '', BODY_STYLE)
      .setOrigin(0.5, 0.5);

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.teardown, this);
    this.events.once('destroy', this.teardown, this);

    this.adapter.attach();
  }

  override update(time: number): void {
    if (!this.actionPanel || !this.rawCodePanel || !this.presenter || !this.stateLabel) return;

    // Shared pause is the only command consumed outside PlayerCommand; read it through the
    // same KeyboardService so its lifecycle guarantees still apply.
    if (this.keyboard.pressed('Escape')) {
      void this.audio.suspend().then(() => {
        this.updateStateLabel();
        this.flashMessage('Paused — click Start to resume audio');
      });
    }

    const commands = this.mapper.map();
    this.presenter.update(commands, time);

    this.actionPanel.setText(this.buildActionPanel());
    this.rawCodePanel.setText(this.buildRawCodePanel());
    this.stateLabel.setText(this.describeAudioState());

    this.events.emit('frame', commands);
    this.probe.setSnapshot({
      started: this.started,
      audioState: this.audio.getState(),
      presetId: this.currentPresetId,
      presetDeviceKind: this.currentPresetDeviceKind,
      commands,
      downCodes: this.keyboard.downCodes(),
      pressedCodes: this.keyboard.pressedCodes(),
      releasedCodes: this.keyboard.releasedCodes(),
      p1AttackedThisFrame: commands.p1.attackPressed,
      p2AttackedThisFrame: commands.p2.attackPressed,
    });
    this.keyboard.afterFrame();
  }

  private buildActionPanel(): string {
    const lines: string[] = ['Bindings (pressed / held / released):'];
    for (const b of DEFAULT_PRESET.bindings) {
      const code = b.code;
      const state = this.actionStateLabel(code);
      const player = b.playerId === 'shared' ? 'shared' : b.playerId.toUpperCase();
      lines.push(
        `${player} ${BINDING_LABELS[b.action] ?? b.action}: ${code} ${state}`,
      );
    }
    return lines.join('\n');
  }

  private actionStateLabel(code: string): string {
    const parts: string[] = [];
    if (this.keyboard.pressed(code)) parts.push('pressed');
    if (this.keyboard.isDown(code)) parts.push('held');
    if (this.keyboard.released(code)) parts.push('released');
    return parts.length === 0 ? '—' : parts.join(' / ');
  }

  private buildRawCodePanel(): string {
    const down = this.keyboard.downCodes();
    if (down.length === 0) return 'Active codes: none';
    return `Active codes: ${down.join(', ')}`;
  }

  private buildConflictPanel(): string {
    const conflicts = detectConflicts(DEFAULT_PRESET.bindings);
    if (conflicts.length === 0) return 'Conflicts: none';
    return `Conflicts:\n${conflicts.map((c) => c.message).join('\n')}`;
  }

  private describePreset(): string {
    return `Preset: ${DEFAULT_PRESET.label} (${DEFAULT_PRESET.deviceKind}, ${DEFAULT_PRESET.id}) — a second (gamepad) preset is scheduled for Phase 6.`;
  }

  private describeAudioState(): string {
    return `Audio: ${this.audio.getState()}`;
  }

  private updateStateLabel(): void {
    if (this.stateLabel) this.stateLabel.setText(this.describeAudioState());
  }

  private flashMessage(message: string): void {
    if (this.flashLabel) this.flashLabel.setText(message);
    this.time.delayedCall(2000, () => {
      if (this.flashLabel) this.flashLabel.setText('');
    });
  }

  private handleResize(
    gameSize: Phaser.Structs.Size,
    _baseSize: Phaser.Structs.Size,
    _displaySize: Phaser.Structs.Size,
    _resolution: number,
  ): void {
    if (!this.startButton || !this.stateLabel || !this.rawCodePanel) return;
    const width = gameSize.width;
    const height = gameSize.height;
    this.startButton.setPosition(width / 2, 140);
    this.stateLabel.setPosition(width - 40, 80).setOrigin(1, 0);
    this.rawCodePanel.setPosition(width / 2, 220).setOrigin(0.5, 0);
    if (this.flashLabel) this.flashLabel.setPosition(width / 2, height - 32).setOrigin(0.5, 0.5);
  }

  private teardown(): void {
    this.adapter.detach();
    this.scale.off('resize', this.handleResize, this);
    this.events.off('shutdown', this.teardown, this);
    this.events.off('destroy', this.teardown, this);
    void this.audio.shutdown();
    this.probe.clear();
    this.presenter?.destroy();
    this.presenter = null;
  }
}