import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Loading…', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#c0c0c0',
      })
      .setOrigin(0.5);
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}