import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // AFAS-themed loading bar
    const barW = 400, barH = 30;
    const x = (GAME_WIDTH - barW) / 2;
    const y = GAME_HEIGHT / 2 + 40;

    const bg = this.add.rectangle(GAME_WIDTH / 2, y + barH / 2, barW, barH, 0x1a1a4e);
    bg.setStrokeStyle(2, COLORS.PRIMARY);

    const bar = this.add.rectangle(x + 2, y + 2, 0, barH - 4, COLORS.SECONDARY);
    bar.setOrigin(0, 0);

    const loadText = this.add.text(GAME_WIDTH / 2, y - 30, 'Laden...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'AFASmon', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '48px',
      color: '#F57C00',
      stroke: '#00529C',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 15, 'Vang ze allemaal!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = (barW - 4) * value;
      loadText.setText(`Laden... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadText.setText('Klaar!');
    });

    // Generate all placeholder textures programmatically
    this.generateTextures();
  }

  generateTextures() {
    // Player sprite (4 directions, 2 frames each for animation)
    this.generatePlayerSprite();

    // AFASmon sprites
    this.generateAFASmonSprites();

    // NPC sprites
    this.generateNPCSprites();

    // UI elements
    this.generateUITextures();

    // Tileset
    this.generateTileset();

    // Items
    this.generateItemSprites();
  }

  generatePlayerSprite() {
    const dirs = ['down', 'left', 'right', 'up'];
    const bodyColor = 0x00529C; // AFAS blauw

    dirs.forEach((dir, di) => {
      for (let frame = 0; frame < 2; frame++) {
        const key = `player_${dir}_${frame}`;
        const g = this.make.graphics({ add: false });

        // Body
        g.fillStyle(bodyColor);
        g.fillRoundedRect(6, 10, 20, 18, 3);

        // Head
        g.fillStyle(0xFFDDB0);
        g.fillCircle(16, 8, 7);

        // Hair
        g.fillStyle(0x4A3728);
        if (dir === 'down') {
          g.fillRect(9, 2, 14, 5);
        } else if (dir === 'up') {
          g.fillRect(9, 1, 14, 8);
        } else {
          g.fillRect(9, 2, 14, 5);
          g.fillRect(dir === 'left' ? 9 : 18, 2, 5, 7);
        }

        // Eyes
        if (dir !== 'up') {
          g.fillStyle(0x000000);
          if (dir === 'down') {
            g.fillRect(12, 7, 2, 2);
            g.fillRect(18, 7, 2, 2);
          } else if (dir === 'left') {
            g.fillRect(11, 7, 2, 2);
          } else {
            g.fillRect(19, 7, 2, 2);
          }
        }

        // Legs (animated)
        g.fillStyle(0x333333);
        if (frame === 0) {
          g.fillRect(10, 28, 5, 4);
          g.fillRect(18, 28, 5, 4);
        } else {
          g.fillRect(8, 28, 5, 4);
          g.fillRect(20, 28, 5, 4);
        }

        g.generateTexture(key, TILE_SIZE, TILE_SIZE);
        g.destroy();
      }
    });
  }

  generateAFASmonSprites() {
    const monsters = [
      { key: 'profitron', color: 0xE53935, accent: 0xFFD700, shape: 'diamond' },
      { key: 'salarion', color: 0x66BB6A, accent: 0xFFFFFF, shape: 'circle' },
      { key: 'relatiox', color: 0x2196F3, accent: 0xE91E63, shape: 'heart' },
      { key: 'orderon', color: 0xE53935, accent: 0x795548, shape: 'square' },
      { key: 'workflox', color: 0xAB47BC, accent: 0x00BCD4, shape: 'gear' },
      { key: 'projecto', color: 0x2196F3, accent: 0xFF9800, shape: 'triangle' },
      { key: 'pocketon', color: 0xAB47BC, accent: 0x4CAF50, shape: 'phone' },
      { key: 'innovaxx', color: 0xFFD700, accent: 0xFF5722, shape: 'star' },
    ];

    monsters.forEach(({ key, color, accent, shape }) => {
      // Battle sprite (64x64)
      const g = this.make.graphics({ add: false });
      this.drawMonsterShape(g, shape, color, accent, 64);
      g.generateTexture(`${key}_battle`, 64, 64);
      g.destroy();

      // World sprite (32x32) — smaller version
      const g2 = this.make.graphics({ add: false });
      this.drawMonsterShape(g2, shape, color, accent, 32);
      g2.generateTexture(`${key}_world`, 32, 32);
      g2.destroy();

      // Mini icon (24x24) for UI
      const g3 = this.make.graphics({ add: false });
      this.drawMonsterShape(g3, shape, color, accent, 24);
      g3.generateTexture(`${key}_icon`, 24, 24);
      g3.destroy();
    });
  }

  drawMonsterShape(g, shape, color, accent, size) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(cx, cy + r * 0.8, r * 1.5, r * 0.4);

    // Main body
    g.fillStyle(color);
    switch (shape) {
      case 'diamond':
        g.fillTriangle(cx, cy - r, cx + r, cy, cx, cy + r);
        g.fillTriangle(cx, cy - r, cx - r, cy, cx, cy + r);
        break;
      case 'circle':
        g.fillCircle(cx, cy, r);
        break;
      case 'heart':
        g.fillCircle(cx - r * 0.35, cy - r * 0.2, r * 0.5);
        g.fillCircle(cx + r * 0.35, cy - r * 0.2, r * 0.5);
        g.fillTriangle(cx - r * 0.8, cy, cx + r * 0.8, cy, cx, cy + r * 0.8);
        break;
      case 'square':
        g.fillRoundedRect(cx - r, cy - r, r * 2, r * 2, r * 0.2);
        break;
      case 'gear':
        g.fillCircle(cx, cy, r);
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          g.fillRect(
            cx + Math.cos(angle) * r * 0.7 - r * 0.15,
            cy + Math.sin(angle) * r * 0.7 - r * 0.15,
            r * 0.3, r * 0.3
          );
        }
        break;
      case 'triangle':
        g.fillTriangle(cx, cy - r, cx - r, cy + r * 0.7, cx + r, cy + r * 0.7);
        break;
      case 'phone':
        g.fillRoundedRect(cx - r * 0.5, cy - r * 0.8, r, r * 1.6, r * 0.15);
        g.fillStyle(accent);
        g.fillRect(cx - r * 0.35, cy - r * 0.55, r * 0.7, r * 0.9);
        g.fillStyle(color);
        break;
      case 'star':
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const nextAngle = (Math.PI * 2 * (i + 0.5)) / 5 - Math.PI / 2;
          const outerX = cx + Math.cos(angle) * r;
          const outerY = cy + Math.sin(angle) * r;
          const innerX = cx + Math.cos(nextAngle) * r * 0.45;
          const innerY = cy + Math.sin(nextAngle) * r * 0.45;
          g.fillTriangle(cx, cy, outerX, outerY, innerX, innerY);
          const prevAngle = (Math.PI * 2 * (i - 0.5)) / 5 - Math.PI / 2;
          const prevInnerX = cx + Math.cos(prevAngle) * r * 0.45;
          const prevInnerY = cy + Math.sin(prevAngle) * r * 0.45;
          g.fillTriangle(cx, cy, outerX, outerY, prevInnerX, prevInnerY);
        }
        break;
    }

    // Eyes
    g.fillStyle(0xFFFFFF);
    g.fillCircle(cx - r * 0.25, cy - r * 0.15, r * 0.18);
    g.fillCircle(cx + r * 0.25, cy - r * 0.15, r * 0.18);
    g.fillStyle(0x000000);
    g.fillCircle(cx - r * 0.2, cy - r * 0.12, r * 0.09);
    g.fillCircle(cx + r * 0.3, cy - r * 0.12, r * 0.09);

    // Accent detail
    g.fillStyle(accent);
    g.fillCircle(cx, cy + r * 0.3, r * 0.15);
  }

  generateNPCSprites() {
    const npcs = [
      { key: 'npc_receptionist', color: 0x00529C, hair: 0xE0B050 },
      { key: 'npc_consultant', color: 0x37474F, hair: 0x4A3728 },
      { key: 'npc_developer', color: 0x1B5E20, hair: 0x212121 },
      { key: 'npc_support', color: 0xF57C00, hair: 0xB71C1C },
      { key: 'npc_marketing', color: 0xE91E63, hair: 0xFFD54F },
      { key: 'npc_trainer', color: 0x7B1FA2, hair: 0x5D4037 },
      { key: 'npc_ceo', color: 0x212121, hair: 0x616161 },
    ];

    npcs.forEach(({ key, color, hair }) => {
      const g = this.make.graphics({ add: false });
      // Body
      g.fillStyle(color);
      g.fillRoundedRect(6, 10, 20, 18, 3);
      // Head
      g.fillStyle(0xFFDDB0);
      g.fillCircle(16, 8, 7);
      // Hair
      g.fillStyle(hair);
      g.fillRect(9, 2, 14, 5);
      // Eyes
      g.fillStyle(0x000000);
      g.fillRect(12, 7, 2, 2);
      g.fillRect(18, 7, 2, 2);
      // Legs
      g.fillStyle(0x333333);
      g.fillRect(10, 28, 5, 4);
      g.fillRect(18, 28, 5, 4);

      g.generateTexture(key, TILE_SIZE, TILE_SIZE);
      g.destroy();
    });
  }

  generateUITextures() {
    // Battle background
    const bg = this.make.graphics({ add: false });
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4CAF50, 0x4CAF50);
    bg.fillRect(0, 0, 800, 600);
    // Floor
    bg.fillStyle(0x8D6E63);
    bg.fillRect(0, 400, 800, 200);
    // Lines
    bg.lineStyle(2, 0x6D4C41);
    for (let i = 0; i < 10; i++) {
      bg.lineBetween(0, 400 + i * 20, 800, 400 + i * 20);
    }
    bg.generateTexture('battle_bg', 800, 600);
    bg.destroy();

    // Battle platform
    const plat = this.make.graphics({ add: false });
    plat.fillStyle(0x6D4C41);
    plat.fillEllipse(60, 15, 120, 30);
    plat.fillStyle(0x8D6E63);
    plat.fillEllipse(60, 12, 120, 26);
    plat.generateTexture('platform', 120, 30);
    plat.destroy();

    // Contract item (Pokéball equivalent)
    const ball = this.make.graphics({ add: false });
    ball.fillStyle(COLORS.PRIMARY);
    ball.fillCircle(12, 12, 11);
    ball.fillStyle(COLORS.WHITE);
    ball.fillRect(1, 12, 22, 11);
    ball.fillCircle(12, 12, 11);
    ball.fillStyle(COLORS.PRIMARY);
    ball.beginPath();
    ball.arc(12, 12, 11, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    ball.closePath();
    ball.fillPath();
    ball.fillStyle(0x333333);
    ball.fillRect(1, 11, 22, 2);
    ball.fillStyle(COLORS.WHITE);
    ball.fillCircle(12, 12, 4);
    ball.fillStyle(0x333333);
    ball.lineStyle(1.5, 0x333333);
    ball.strokeCircle(12, 12, 4);
    ball.generateTexture('contract', 24, 24);
    ball.destroy();

    // Koffie (heal item)
    const koffie = this.make.graphics({ add: false });
    koffie.fillStyle(0x795548);
    koffie.fillRoundedRect(4, 6, 16, 16, 2);
    koffie.fillStyle(0xFFFFFF);
    koffie.fillRoundedRect(6, 8, 12, 12, 1);
    koffie.fillStyle(0x4E342E);
    koffie.fillRect(7, 10, 10, 8);
    // Steam
    koffie.lineStyle(1, 0xCCCCCC, 0.6);
    koffie.lineBetween(10, 6, 9, 2);
    koffie.lineBetween(14, 6, 15, 2);
    koffie.generateTexture('koffie', 24, 24);
    koffie.destroy();
  }

  generateTileset() {
    const tileTypes = {
      floor_office: { color: 0xCFD8DC, pattern: 'grid' },
      floor_atrium: { color: 0xE8EEF4, pattern: 'marble' },
      floor_restaurant: { color: 0xD7CCC8, pattern: 'tile' },
      floor_theater: { color: 0x8D6E63, pattern: 'wood' },
      floor_sport: { color: 0x81C784, pattern: 'lines' },
      floor_garage: { color: 0x616161, pattern: 'concrete' },
      floor_outside: { color: 0x7CB342, pattern: 'grass' },
      floor_path: { color: 0xBDBDBD, pattern: 'stone' },
      wall: { color: 0x455A64, pattern: 'solid' },
      wall_glass: { color: 0xB3E5FC, pattern: 'glass' },
      desk: { color: 0x795548, pattern: 'solid' },
      chair: { color: 0x37474F, pattern: 'solid' },
      door: { color: 0xF57C00, pattern: 'solid' },
      solar_panel: { color: 0x1A237E, pattern: 'grid' },
      plant: { color: 0x2E7D32, pattern: 'solid' },
      water: { color: 0x1565C0, pattern: 'wave' },
      car: { color: 0x78909C, pattern: 'solid' },
      laadpaal: { color: 0x4CAF50, pattern: 'solid' },
      art_quinn: { color: 0xFFD700, pattern: 'solid' },
      counter: { color: 0x6D4C41, pattern: 'solid' },
    };

    Object.entries(tileTypes).forEach(([key, { color, pattern }]) => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(color);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      switch (pattern) {
        case 'grid':
          g.lineStyle(1, 0x000000, 0.1);
          g.lineBetween(TILE_SIZE / 2, 0, TILE_SIZE / 2, TILE_SIZE);
          g.lineBetween(0, TILE_SIZE / 2, TILE_SIZE, TILE_SIZE / 2);
          break;
        case 'marble':
          g.fillStyle(0xFFFFFF, 0.15);
          g.fillRect(0, 0, TILE_SIZE / 2, TILE_SIZE / 2);
          g.fillRect(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2);
          break;
        case 'tile':
          g.lineStyle(1, 0x000000, 0.15);
          g.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
          break;
        case 'wood':
          g.lineStyle(1, 0x000000, 0.08);
          for (let i = 0; i < 5; i++) {
            g.lineBetween(0, i * 7, TILE_SIZE, i * 7);
          }
          break;
        case 'lines':
          g.lineStyle(1, 0xFFFFFF, 0.2);
          g.lineBetween(0, TILE_SIZE / 3, TILE_SIZE, TILE_SIZE / 3);
          g.lineBetween(0, (TILE_SIZE * 2) / 3, TILE_SIZE, (TILE_SIZE * 2) / 3);
          break;
        case 'concrete':
          g.fillStyle(0x000000, 0.08);
          g.fillRect(4, 4, 3, 3);
          g.fillRect(20, 14, 2, 2);
          g.fillRect(12, 24, 3, 2);
          break;
        case 'grass':
          g.fillStyle(0x558B2F, 0.3);
          g.fillRect(3, 5, 2, 4);
          g.fillRect(15, 2, 2, 5);
          g.fillRect(25, 18, 2, 4);
          g.fillRect(8, 22, 2, 5);
          break;
        case 'stone':
          g.lineStyle(1, 0x000000, 0.1);
          g.lineBetween(0, TILE_SIZE / 2, TILE_SIZE, TILE_SIZE / 2);
          g.lineBetween(TILE_SIZE / 3, 0, TILE_SIZE / 3, TILE_SIZE / 2);
          g.lineBetween(TILE_SIZE * 2 / 3, TILE_SIZE / 2, TILE_SIZE * 2 / 3, TILE_SIZE);
          break;
        case 'glass':
          g.fillStyle(0xFFFFFF, 0.3);
          g.fillRect(2, 2, 4, TILE_SIZE - 4);
          g.fillRect(TILE_SIZE - 6, 2, 4, TILE_SIZE - 4);
          break;
        case 'wave':
          g.fillStyle(0x1976D2, 0.3);
          g.fillRect(0, 8, TILE_SIZE, 4);
          g.fillRect(0, 20, TILE_SIZE, 4);
          break;
      }

      g.generateTexture(`tile_${key}`, TILE_SIZE, TILE_SIZE);
      g.destroy();
    });
  }

  generateItemSprites() {
    // Exclamation mark for NPC interaction
    const excl = this.make.graphics({ add: false });
    excl.fillStyle(COLORS.SECONDARY);
    excl.fillRoundedRect(9, 2, 6, 14, 2);
    excl.fillCircle(12, 20, 3);
    excl.generateTexture('exclamation', 24, 24);
    excl.destroy();

    // Arrow indicator
    const arrow = this.make.graphics({ add: false });
    arrow.fillStyle(COLORS.SECONDARY);
    arrow.fillTriangle(12, 0, 0, 16, 24, 16);
    arrow.generateTexture('arrow_down', 24, 16);
    arrow.destroy();
  }

  create() {
    this.scene.start(SCENES.MENU);
  }
}
