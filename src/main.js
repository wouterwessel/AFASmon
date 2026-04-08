import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from './utils/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { DialogScene } from './scenes/DialogScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0a0a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, WorldScene, BattleScene, DialogScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Catch runtime errors and display on screen
window.onerror = (msg, src, line, col, err) => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:12px;font-family:monospace;z-index:99999;white-space:pre-wrap';
  div.textContent = `ERROR: ${msg}\nat ${src}:${line}:${col}\n${err?.stack || ''}`;
  document.body.appendChild(div);
};

const game = new Phaser.Game(config);
