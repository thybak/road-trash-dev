import Phaser from 'phaser';

const GAME_HOST_ID = 'game-host';
const BOOT_FAILURE_ID = 'boot-failure';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Road Trash — loading', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#e0e0e0',
      })
      .setOrigin(0.5);
  }
}

function showFailure(message: string): void {
  const host = document.getElementById(GAME_HOST_ID);
  if (host) host.style.display = 'none';
  const failure = document.getElementById(BOOT_FAILURE_ID);
  if (failure) {
    failure.style.display = 'block';
    failure.textContent = `Road Trash failed to start:\n${message}`;
  }
}

function startGame(): void {
  const host = document.getElementById(GAME_HOST_ID);
  if (!host) {
    showFailure(`host element #${GAME_HOST_ID} not found`);
    return;
  }

  try {
    const game = new Phaser.Game({
      type: Phaser.WEBGL,
      parent: host,
      backgroundColor: '#0a0a0a',
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
      },
      scene: [BootScene],
    });
    game.events.on('destroy', () => {
      /* placeholder for future teardown hooks */
    });
  } catch (error) {
    showFailure(error instanceof Error ? error.message : String(error));
  }
}

startGame();