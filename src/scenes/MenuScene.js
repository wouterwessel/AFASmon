import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    // Dark gradient background
    this.cameras.main.setBackgroundColor('#0a0a2e');

    // Cleanup on scene shutdown
    this.events.on('shutdown', () => {
      this.tweens.killAll();
      if (this.particles) { this.particles.forEach(p => p.destroy()); this.particles = null; }
    });
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x00396b, 0x00396b);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Clubhuis silhouette at bottom
    if (this.textures.exists('clubhuis_silhouette')) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'clubhuis_silhouette').setAlpha(1).setOrigin(0.5, 1);
    }

    // Floating particles
    this.particles = [];
    for (let i = 0; i < 25; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(2, 6),
        Phaser.Math.Between(0, 1) ? 0x4FC3F7 : 0xFFFFFF,
        0.12
      );
      p.vx = Phaser.Math.FloatBetween(-0.2, 0.2);
      p.vy = Phaser.Math.FloatBetween(-0.3, -0.05);
      this.particles.push(p);
    }

    // Logo area
    const logoY = 120;

    // Tagline with typewriter effect
    const tagline = this.add.text(GAME_WIDTH / 2, logoY - 55, '', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
      color: '#90CAF9',
      letterSpacing: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Measure AFAS width
    const measure = this.add.text(0, 0, 'AFAS', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '72px',
    }).setOrigin(0.5);
    const monX = GAME_WIDTH / 2 + measure.width / 2;
    measure.destroy();

    // Title AFAS in white
    const titleAfas = this.add.text(GAME_WIDTH / 2, logoY, 'AFAS', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    // "mon" in silver/light grey (not orange)
    const titleMon = this.add.text(monX + 2, logoY + 8, 'mon', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '40px',
      color: '#B0BEC5',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setAlpha(0);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, logoY + 48, '', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '17px',
      color: '#B0BEC5',
    }).setOrigin(0.5);

    // Accent line
    const accentLine = this.add.rectangle(GAME_WIDTH / 2, logoY + 72, 0, 3, 0xF57C00).setOrigin(0.5);

    // === Animations ===
    this.tweens.add({
      targets: [titleAfas, titleMon],
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    this.time.delayedCall(400, () => {
      tagline.setAlpha(1);
      const fullTag = 'Succes begint met';
      let idx = 0;
      this.time.addEvent({
        delay: 40, repeat: fullTag.length - 1,
        callback: () => { tagline.setText(fullTag.substring(0, ++idx)); },
      });
    });

    this.time.delayedCall(1200, () => {
      const fullSub = 'Vang ze allemaal in het AFAS Clubhuis!';
      let idx = 0;
      this.time.addEvent({
        delay: 30, repeat: fullSub.length - 1,
        callback: () => { subtitle.setText(fullSub.substring(0, ++idx)); },
      });
    });

    this.time.delayedCall(1000, () => {
      this.tweens.add({ targets: accentLine, width: 280, duration: 600, ease: 'Power2' });
    });

    // Menu buttons
    const buttonY = 270;
    const buttonSpacing = 60;
    const hasSave = !!localStorage.getItem('afasmon_save');

    const buttonData = [
      { text: 'Nieuw Spel', y: buttonY, action: () => this.startNewGame(), primary: true },
      { text: 'Verder Spelen', y: buttonY + buttonSpacing, action: () => this.continueGame(), primary: false },
    ];

    buttonData.forEach(({ text, y, action, primary }) => {
      const isDisabled = text === 'Verder Spelen' && !hasSave;
      const bgColor = isDisabled ? 0x263238 : primary ? 0xF57C00 : 0x00000000;
      const borderColor = isDisabled ? 0x37474F : primary ? 0xF57C00 : 0xFFFFFF;
      const textColor = isDisabled ? '#546E7A' : '#ffffff';

      const btnBg = this.add.rectangle(GAME_WIDTH / 2, y, 280, 48, bgColor)
        .setStrokeStyle(2, borderColor).setAlpha(0);

      const btnText = this.add.text(GAME_WIDTH / 2, y, text, {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        color: textColor,
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: [btnBg, btnText],
        alpha: 1,
        duration: 500,
        delay: 1400 + (primary ? 0 : 150),
      });

      if (primary && !isDisabled) {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: btnBg,
            scaleX: 1.02, scaleY: 1.02,
            duration: 1200,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut',
          });
        });
      }

      if (!isDisabled) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on('pointerover', () => {
          btnBg.setFillStyle(primary ? 0xFF9800 : 0x00529C);
        });
        btnBg.on('pointerout', () => {
          btnBg.setFillStyle(bgColor);
        });
        btnBg.on('pointerdown', action);
      }
    });

    // AFASmon row
    const monsterKeys = ['profitron', 'salarion', 'relatiox', 'orderon', 'workflox', 'projecto', 'pocketon', 'innovaxx'];
    this.floatingMonsters = [];
    const rowY = 430;
    const startX = GAME_WIDTH / 2 - (monsterKeys.length - 1) * 45;

    monsterKeys.forEach((key, i) => {
      const x = startX + i * 90;
      const sprite = this.add.image(x, rowY, `${key}_battle`).setScale(0.65).setAlpha(0);
      this.tweens.add({ targets: sprite, alpha: 0.7, duration: 400, delay: 1800 + i * 100 });
      this.tweens.add({
        targets: sprite, y: rowY - 8,
        duration: 1800 + i * 200, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut', delay: 1800 + i * 100,
      });
      this.floatingMonsters.push(sprite);
    });

    // Stats
    this.add.text(GAME_WIDTH / 2, 495, '8 AFASmon  \u2022  13 zones  \u2022  28 aanvallen  \u2022  1 Clubhuis', {
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', color: '#546E7A',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 540, '\u00a9 2026 AFAS Software \u2014 Leusden, Nederland', {
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', color: '#37474F',
    }).setOrigin(0.5);

    const enterText = this.add.text(GAME_WIDTH / 2, 565, 'Druk op ENTER of klik om te starten', {
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', color: '#90CAF9',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: enterText, alpha: 0.4, duration: 1500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 4, 0xF57C00).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown-ENTER', () => { this.startNewGame(); });
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
    localStorage.removeItem('afasmon_save');
    this.scene.start(SCENES.CHARACTER_CREATE);
  }

  continueGame() {
    const saveData = localStorage.getItem('afasmon_save');
    if (saveData) {
      try {
        const data = JSON.parse(saveData);
        this.scene.start(SCENES.WORLD, {
          newGame: false,
          saveData: data,
          currentZone: data.currentZone,
        });
      } catch (e) {
        localStorage.removeItem('afasmon_save');
        this.scene.start(SCENES.MENU);
      }
    }
  }
}
