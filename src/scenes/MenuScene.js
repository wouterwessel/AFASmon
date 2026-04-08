import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    // Animated background
    this.cameras.main.setBackgroundColor('#0a0a2e');

    // Floating particles
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        COLORS.PRIMARY,
        0.3
      );
      p.vx = Phaser.Math.FloatBetween(-0.3, 0.3);
      p.vy = Phaser.Math.FloatBetween(-0.5, -0.1);
      this.particles.push(p);
    }

    // Logo area
    const logoY = 160;

    // AFAS-style background shape
    this.add.rectangle(GAME_WIDTH / 2, logoY, 500, 100, COLORS.PRIMARY, 0.15)
      .setStrokeStyle(2, COLORS.PRIMARY, 0.3);

    // Title
    this.add.text(GAME_WIDTH / 2, logoY - 15, 'AFASmon', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '64px',
      color: '#F57C00',
      stroke: '#00529C',
      strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, logoY + 35, 'Vang ze allemaal in het AFAS Clubhuis!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#B0BEC5',
    }).setOrigin(0.5);

    // Menu buttons
    const buttonData = [
      { text: 'Nieuw Spel', y: 310, action: () => this.startNewGame() },
      { text: 'Verder Spelen', y: 370, action: () => this.continueGame() },
    ];

    buttonData.forEach(({ text, y, action }) => {
      const btnBg = this.add.rectangle(GAME_WIDTH / 2, y, 250, 44, COLORS.PRIMARY, 0.8)
        .setStrokeStyle(2, COLORS.SECONDARY)
        .setInteractive({ useHandCursor: true });

      const btnText = this.add.text(GAME_WIDTH / 2, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(COLORS.SECONDARY, 0.9);
        btnText.setScale(1.05);
      });
      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(COLORS.PRIMARY, 0.8);
        btnText.setScale(1);
      });
      btnBg.on('pointerdown', action);
    });

    // Check for existing save
    const hasSave = !!localStorage.getItem('afasmon_save');
    if (!hasSave) {
      buttonData[1] && (() => {
        // Dim the "Verder Spelen" button if no save
        const dimRect = this.add.rectangle(GAME_WIDTH / 2, 370, 250, 44, 0x000000, 0.5);
      })();
    }

    // Footer
    this.add.text(GAME_WIDTH / 2, 530, '© 2026 - AFAS Clubhuis Leusden', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#455A64',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 550, 'Druk op ENTER of klik om te starten', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#78909C',
    }).setOrigin(0.5);

    // Show random AFASmon sprites floating around
    const monsterKeys = ['profitron', 'salarion', 'relatiox', 'orderon', 'workflox', 'projecto', 'pocketon', 'innovaxx'];
    this.floatingMonsters = [];
    for (let i = 0; i < 4; i++) {
      const key = monsterKeys[Phaser.Math.Between(0, monsterKeys.length - 1)];
      const sprite = this.add.image(
        Phaser.Math.Between(50, GAME_WIDTH - 50),
        Phaser.Math.Between(420, 510),
        `${key}_battle`
      ).setAlpha(0.3).setScale(0.6);
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 15,
        duration: 2000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.floatingMonsters.push(sprite);
    }

    // Keyboard
    this.input.keyboard.on('keydown-ENTER', () => {
      this.startNewGame();
    });
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) p.y = GAME_HEIGHT + 5;
      if (p.x < -5) p.x = GAME_WIDTH + 5;
      if (p.x > GAME_WIDTH + 5) p.x = -5;
    });
  }

  startNewGame() {
    // Clear any existing save
    localStorage.removeItem('afasmon_save');

    this.scene.start(SCENES.WORLD, {
      newGame: true,
      currentZone: 'parkeerplaats',
    });
  }

  continueGame() {
    const saveData = localStorage.getItem('afasmon_save');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.scene.start(SCENES.WORLD, {
        newGame: false,
        saveData: data,
      });
    } else {
      this.startNewGame();
    }
  }
}
