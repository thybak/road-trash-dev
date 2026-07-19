import Phaser from 'phaser';
import { createGameConfig } from './app/game-config';

const GAME_HOST_ID = 'game-host';
const BOOT_FAILURE_ID = 'boot-failure';

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
    const game = new Phaser.Game(createGameConfig(host));
    game.events.on('destroy', () => {
      /* placeholder for future teardown hooks */
    });
  } catch (error) {
    showFailure(error instanceof Error ? error.message : String(error));
  }
}

startGame();