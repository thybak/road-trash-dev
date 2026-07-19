import Phaser from 'phaser';
import type { PlayerId, PlayerCommand } from '../../simulation/commands/PlayerCommand';

interface PlaceholderConfig {
  readonly label: string;
  readonly color: number;
  readonly flashColor: number;
}

const PLAYER_CONFIG: Record<PlayerId, PlaceholderConfig> = {
  p1: { label: 'P1', color: 0x4f84ff, flashColor: 0xffffff },
  p2: { label: 'P2', color: 0xff8a4f, flashColor: 0xffffff },
};

const PLACEHOLDER_SIZE = 56;
const VERTICAL_SPEED_PX_PER_FRAME = 5;
const LATERAL_SPEED_PX_PER_FRAME = 6;
const FRICTION_PER_FRAME = 0.85;
const FLASH_DURATION_MS = 220;

interface PlaceholderSprite {
  readonly id: PlayerId;
  readonly rect: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
  vx: number;
  vy: number;
  flashUntil: number;
}

export class PlaceholderPresenter {
  private readonly scene: Phaser.Scene;
  private readonly bounds: Phaser.Geom.Rectangle;
  private readonly sprites: Record<PlayerId, PlaceholderSprite>;
  private readonly originY: number;
  private readonly originX: number;

  constructor(
    scene: Phaser.Scene,
    bounds: Phaser.Geom.Rectangle,
  ) {
    this.scene = scene;
    this.bounds = bounds;
    this.originX = bounds.x + bounds.width / 2;
    this.originY = bounds.y + bounds.height / 2;
    this.sprites = {
      p1: this.create('p1', this.originX - 80, this.originY),
      p2: this.create('p2', this.originX + 80, this.originY),
    };
  }

  private create(id: PlayerId, x: number, y: number): PlaceholderSprite {
    const config = PLAYER_CONFIG[id];
    const rect = this.scene.add.rectangle(x, y, PLACEHOLDER_SIZE, PLACEHOLDER_SIZE, config.color);
    rect.setStrokeStyle(2, 0xffffff, 0.9);
    const label = this.scene.add
      .text(x, y, config.label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#0a0a0a',
      })
      .setOrigin(0.5);
    return { id, rect, label, vx: 0, vy: 0, flashUntil: 0 };
  }

  update(commands: Record<PlayerId, PlayerCommand>, time: number): void {
    for (const id of ['p1', 'p2'] as const) {
      const sprite = this.sprites[id];
      const cmd = commands[id];

      if (cmd.accelerate) {
        sprite.vy = -VERTICAL_SPEED_PX_PER_FRAME;
      } else if (cmd.brake) {
        sprite.vy = VERTICAL_SPEED_PX_PER_FRAME * 0.6;
      } else {
        sprite.vy *= FRICTION_PER_FRAME;
        if (Math.abs(sprite.vy) < 0.05) sprite.vy = 0;
      }

      if (cmd.steer !== 0) {
        sprite.vx = cmd.steer * LATERAL_SPEED_PX_PER_FRAME;
      } else {
        sprite.vx *= FRICTION_PER_FRAME;
        if (Math.abs(sprite.vx) < 0.05) sprite.vx = 0;
      }

      if (cmd.attackPressed) {
        sprite.flashUntil = time + FLASH_DURATION_MS;
      }

      sprite.rect.x = Phaser.Math.Clamp(
        sprite.rect.x + sprite.vx,
        this.bounds.x + PLACEHOLDER_SIZE / 2,
        this.bounds.x + this.bounds.width - PLACEHOLDER_SIZE / 2,
      );
      sprite.rect.y = Phaser.Math.Clamp(
        sprite.rect.y + sprite.vy,
        this.bounds.y + PLACEHOLDER_SIZE / 2,
        this.bounds.y + this.bounds.height - PLACEHOLDER_SIZE / 2,
      );

      const flashing = time < sprite.flashUntil;
      sprite.rect.fillColor = flashing ? PLAYER_CONFIG[id].flashColor : PLAYER_CONFIG[id].color;
      sprite.label.x = sprite.rect.x;
      sprite.label.y = sprite.rect.y;
    }
  }

  destroy(): void {
    for (const id of ['p1', 'p2'] as const) {
      this.sprites[id].rect.destroy();
      this.sprites[id].label.destroy();
    }
  }
}