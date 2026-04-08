import Phaser from 'phaser';
import { SCENES } from '../utils/constants.js';

// Stub scene — dialog is handled inline by DialogSystem
export class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.DIALOG });
  }

  create() {
    // Not used — dialog is rendered as overlay within WorldScene/BattleScene
  }
}
