import Phaser from 'phaser';

const LOADING_TEXT = 'Road Trash — booting';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, LOADING_TEXT, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#e0e0e0',
      })
      .setOrigin(0.5);

    this.scene.start('PreloadScene');
  }
}