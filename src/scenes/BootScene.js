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

    // Clubhuis silhouette for menu/create screens
    this.generateClubhuisSilhouette();
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
      { key: 'npc_receptionist', color: 0x00529C, hair: 0xE0B050, female: true },
      { key: 'npc_consultant', color: 0x37474F, hair: 0x4A3728, female: false },
      { key: 'npc_consultant_f', color: 0x37474F, hair: 0x4A3728, female: true },
      { key: 'npc_developer', color: 0x1B5E20, hair: 0x212121, female: false },
      { key: 'npc_support', color: 0xF57C00, hair: 0xB71C1C, female: true },
      { key: 'npc_marketing', color: 0xE91E63, hair: 0xFFD54F, female: false },
      { key: 'npc_marketing_f', color: 0xE91E63, hair: 0xFFD54F, female: true },
      { key: 'npc_trainer', color: 0x7B1FA2, hair: 0x5D4037, female: false },
      { key: 'npc_trainer_f', color: 0x7B1FA2, hair: 0x5D4037, female: true },
      { key: 'npc_ceo', color: 0x212121, hair: 0x616161, female: false },
    ];

    npcs.forEach(({ key, color, hair, female }) => {
      const g = this.make.graphics({ add: false });
      // Body
      g.fillStyle(color);
      g.fillRoundedRect(6, 10, 20, 18, 3);
      // Head
      g.fillStyle(0xFFDDB0);
      g.fillCircle(16, 8, 7);
      // Hair
      g.fillStyle(hair);
      if (female) {
        // Longer hair — top + sides falling to shoulders
        g.fillRect(9, 1, 14, 6);
        g.fillRect(7, 1, 4, 14);
        g.fillRect(21, 1, 4, 14);
      } else {
        // Short hair — top only
        g.fillRect(9, 2, 14, 5);
      }
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

    // Jan Vayne — pianist with long grey hair
    const jv = this.make.graphics({ add: false });
    jv.fillStyle(0x1A1A1A);
    jv.fillRoundedRect(6, 10, 20, 18, 3);
    jv.fillStyle(0xFFDDB0);
    jv.fillCircle(16, 8, 7);
    // Long grey hair — top + sides falling to shoulders
    jv.fillStyle(0x9E9E9E);
    jv.fillRect(9, 1, 14, 6);
    jv.fillRect(7, 1, 4, 16);
    jv.fillRect(21, 1, 4, 16);
    jv.fillStyle(0x000000);
    jv.fillRect(12, 7, 2, 2);
    jv.fillRect(18, 7, 2, 2);
    jv.fillStyle(0x333333);
    jv.fillRect(10, 28, 5, 4);
    jv.fillRect(18, 28, 5, 4);
    jv.generateTexture('npc_jan_vayne', TILE_SIZE, TILE_SIZE);
    jv.destroy();

    // Chef-kok Thijmen — white uniform with chef's hat (koksmuts)
    const chef = this.make.graphics({ add: false });
    chef.fillStyle(0xF5F5F5);
    chef.fillRoundedRect(6, 10, 20, 18, 3);
    chef.fillStyle(0xFFDDB0);
    chef.fillCircle(16, 8, 7);
    // Koksmuts (toque) — tall white hat
    chef.fillStyle(0xFFFFFF);
    chef.fillRoundedRect(9, -4, 14, 10, 3);
    chef.fillRect(8, 2, 16, 3);
    // Eyes
    chef.fillStyle(0x000000);
    chef.fillRect(12, 7, 2, 2);
    chef.fillRect(18, 7, 2, 2);
    // Legs
    chef.fillStyle(0x333333);
    chef.fillRect(10, 28, 5, 4);
    chef.fillRect(18, 28, 5, 4);
    chef.generateTexture('npc_chef', TILE_SIZE, TILE_SIZE);
    chef.destroy();
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
    const S = TILE_SIZE;

    // Helper to create a tile texture with a custom draw function
    const makeTile = (name, drawFn) => {
      const g = this.make.graphics({ add: false });
      drawFn(g, S);
      g.generateTexture(`tile_${name}`, S, S);
      g.destroy();
    };

    // --- Floor tiles ---
    makeTile('floor_office', (g) => {
      g.fillStyle(0xCFD8DC); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x000000, 0.1);
      g.lineBetween(S / 2, 0, S / 2, S);
      g.lineBetween(0, S / 2, S, S / 2);
    });
    makeTile('floor_atrium', (g) => {
      g.fillStyle(0xE8EEF4); g.fillRect(0, 0, S, S);
      g.fillStyle(0xFFFFFF, 0.15);
      g.fillRect(0, 0, S / 2, S / 2);
      g.fillRect(S / 2, S / 2, S / 2, S / 2);
    });
    makeTile('floor_restaurant', (g) => {
      g.fillStyle(0xD7CCC8); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x000000, 0.15);
      g.strokeRect(1, 1, S - 2, S - 2);
    });
    makeTile('floor_theater', (g) => {
      g.fillStyle(0x8D6E63); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x6D4C41, 0.2);
      for (let i = 0; i < 5; i++) g.lineBetween(0, i * 7, S, i * 7);
    });
    makeTile('floor_sport', (g) => {
      g.fillStyle(0x81C784); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0xFFFFFF, 0.2);
      g.lineBetween(0, S / 3, S, S / 3);
      g.lineBetween(0, (S * 2) / 3, S, (S * 2) / 3);
    });
    makeTile('floor_garage', (g) => {
      g.fillStyle(0x616161); g.fillRect(0, 0, S, S);
      g.fillStyle(0x000000, 0.08);
      g.fillRect(4, 4, 3, 3);
      g.fillRect(20, 14, 2, 2);
      g.fillRect(12, 24, 3, 2);
    });
    makeTile('floor_outside', (g) => {
      g.fillStyle(0x7CB342); g.fillRect(0, 0, S, S);
      g.fillStyle(0x558B2F, 0.3);
      g.fillRect(3, 5, 2, 4); g.fillRect(15, 2, 2, 5);
      g.fillRect(25, 18, 2, 4); g.fillRect(8, 22, 2, 5);
    });
    makeTile('floor_path', (g) => {
      g.fillStyle(0xBDBDBD); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x000000, 0.1);
      g.lineBetween(0, S / 2, S, S / 2);
      g.lineBetween(S / 3, 0, S / 3, S / 2);
      g.lineBetween(S * 2 / 3, S / 2, S * 2 / 3, S);
    });
    // Entreecafé wooden floor — warm brown with visible grain
    makeTile('floor_wood', (g) => {
      g.fillStyle(0xA1887F); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x795548, 0.25);
      for (let i = 0; i < 6; i++) g.lineBetween(0, i * 6, S, i * 6);
      g.fillStyle(0x8D6E63, 0.15);
      g.fillRect(0, 0, S / 2, S / 2);
      g.fillRect(S / 2, S / 2, S / 2, S / 2);
    });

    // --- Wall tiles ---
    makeTile('wall', (g) => {
      g.fillStyle(0x455A64); g.fillRect(0, 0, S, S);
      // Mortar/brick lines
      g.lineStyle(1, 0x37474F, 0.4);
      g.lineBetween(0, 8, S, 8);
      g.lineBetween(0, 16, S, 16);
      g.lineBetween(0, 24, S, 24);
      g.lineBetween(S / 2, 0, S / 2, 8);
      g.lineBetween(0, 8, 0, 16);
      g.lineBetween(S / 2, 16, S / 2, 24);
    });
    makeTile('wall_glass', (g) => {
      g.fillStyle(0xB3E5FC); g.fillRect(0, 0, S, S);
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillRect(2, 2, 4, S - 4);
      g.fillRect(S - 6, 2, 4, S - 4);
      // Reflection highlight
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRect(8, 4, 6, 3);
    });

    // --- Furniture tiles ---
    makeTile('desk', (g) => {
      // Brown desk surface
      g.fillStyle(0x795548); g.fillRect(0, 0, S, S);
      g.fillStyle(0x6D4C41); g.fillRect(2, 2, S - 4, S - 4);
      // Monitor on desk
      g.fillStyle(0x90A4AE); g.fillRect(8, 3, 16, 12);
      g.fillStyle(0x263238); g.fillRect(10, 5, 12, 8);
      // Monitor stand
      g.fillStyle(0x78909C); g.fillRect(14, 15, 4, 3);
      // Keyboard
      g.fillStyle(0xBDBDBD); g.fillRect(8, 22, 16, 5);
    });
    makeTile('chair', (g) => {
      // Chair facing down (backrest at top)
      g.fillStyle(0x37474F); g.fillRect(6, 24, 20, 4);
      g.fillStyle(0x455A64); g.fillRect(8, 2, 16, 10);
      g.fillStyle(0x546E7A); g.fillRect(6, 12, 20, 12);
      g.fillStyle(0x607D8B); g.fillRect(10, 14, 12, 8);
    });
    makeTile('chair_up', (g) => {
      // Chair facing up (backrest at bottom)
      g.fillStyle(0x37474F); g.fillRect(6, 0, 20, 4);
      g.fillStyle(0x455A64); g.fillRect(8, S - 12, 16, 10);
      g.fillStyle(0x546E7A); g.fillRect(6, 4, 20, 12);
      g.fillStyle(0x607D8B); g.fillRect(10, 6, 12, 8);
    });
    makeTile('chair_left', (g) => {
      // Chair facing left (backrest at right)
      g.fillStyle(0x37474F); g.fillRect(0, 6, 4, 20);
      g.fillStyle(0x455A64); g.fillRect(S - 12, 8, 10, 16);
      g.fillStyle(0x546E7A); g.fillRect(4, 6, 12, 20);
      g.fillStyle(0x607D8B); g.fillRect(6, 10, 8, 12);
    });
    makeTile('chair_right', (g) => {
      // Chair facing right (backrest at left)
      g.fillStyle(0x37474F); g.fillRect(S - 4, 6, 4, 20);
      g.fillStyle(0x455A64); g.fillRect(2, 8, 10, 16);
      g.fillStyle(0x546E7A); g.fillRect(12, 6, 12, 20);
      g.fillStyle(0x607D8B); g.fillRect(14, 10, 8, 12);
    });
    makeTile('door', (g) => {
      g.fillStyle(0xF57C00); g.fillRect(0, 0, S, S);
      g.fillStyle(0xE65100); g.fillRect(4, 2, S - 8, S - 4);
      // Door handle
      g.fillStyle(0xFFD54F); g.fillCircle(S - 8, S / 2, 2);
    });

    // --- Object tiles ---
    makeTile('solar_panel', (g) => {
      g.fillStyle(0x1A237E); g.fillRect(0, 0, S, S);
      g.lineStyle(1, 0x42A5F5, 0.3);
      g.lineBetween(S / 2, 0, S / 2, S);
      g.lineBetween(0, S / 2, S, S / 2);
      // Shiny cell
      g.fillStyle(0x283593, 0.5);
      g.fillRect(2, 2, S / 2 - 3, S / 2 - 3);
      g.fillRect(S / 2 + 1, S / 2 + 1, S / 2 - 3, S / 2 - 3);
    });
    makeTile('plant', (g) => {
      // Pot
      g.fillStyle(0x8D6E63); g.fillRect(8, 20, 16, 10);
      g.fillStyle(0x6D4C41); g.fillRect(10, 18, 12, 4);
      // Leaves
      g.fillStyle(0x388E3C); g.fillCircle(16, 10, 8);
      g.fillStyle(0x2E7D32); g.fillCircle(12, 12, 6);
      g.fillStyle(0x4CAF50); g.fillCircle(18, 8, 5);
      // Stem
      g.fillStyle(0x5D4037); g.fillRect(14, 14, 4, 6);
    });
    makeTile('water', (g) => {
      g.fillStyle(0x1565C0); g.fillRect(0, 0, S, S);
      // Wave highlights
      g.fillStyle(0x1976D2, 0.4);
      g.fillRect(0, 6, S, 4);
      g.fillRect(0, 18, S, 4);
      // Sparkle
      g.fillStyle(0x64B5F6, 0.3);
      g.fillRect(6, 2, 3, 2);
      g.fillRect(20, 14, 3, 2);
    });
    makeTile('car_left', (g) => {
      // Parking floor
      g.fillStyle(0x757575); g.fillRect(0, 0, S, S);
      // Car body left half (hood side)
      g.fillStyle(0x90A4AE); g.fillRect(2, 6, S - 2, 16);
      // Hood
      g.fillStyle(0x78909C); g.fillRect(2, 4, S - 2, 8);
      // Windshield
      g.fillStyle(0xB3E5FC); g.fillRect(6, 5, S - 8, 6);
      // Left wheel
      g.fillStyle(0x212121); g.fillRect(4, 22, 8, 5);
      // Headlight
      g.fillStyle(0xFFF176); g.fillRect(2, 10, 3, 3);
      // Side mirror
      g.fillStyle(0x78909C); g.fillRect(0, 10, 3, 2);
    });
    makeTile('car_right', (g) => {
      // Parking floor
      g.fillStyle(0x757575); g.fillRect(0, 0, S, S);
      // Car body right half (trunk side)
      g.fillStyle(0x90A4AE); g.fillRect(0, 6, S - 2, 16);
      // Trunk
      g.fillStyle(0x78909C); g.fillRect(0, 4, S - 2, 8);
      // Rear window
      g.fillStyle(0xB3E5FC); g.fillRect(2, 5, S - 8, 6);
      // Right wheel
      g.fillStyle(0x212121); g.fillRect(S - 12, 22, 8, 5);
      // Tail light
      g.fillStyle(0xE53935); g.fillRect(S - 5, 10, 3, 3);
      // Side mirror
      g.fillStyle(0x78909C); g.fillRect(S - 3, 10, 3, 2);
    });
    makeTile('laadpaal', (g) => {
      // Pole
      g.fillStyle(0x4CAF50); g.fillRect(12, 4, 8, 24);
      // Screen
      g.fillStyle(0xC8E6C9); g.fillRect(14, 6, 4, 6);
      // Cable
      g.fillStyle(0x333333); g.fillRect(10, 20, 2, 8);
      // Plug
      g.fillStyle(0x666666); g.fillRect(8, 26, 4, 3);
    });
    makeTile('art_quinn', (g) => {
      // Sculpture - golden abstract shape
      g.fillStyle(0xFFD700); g.fillCircle(16, 14, 10);
      g.fillStyle(0xFFC107); g.fillRect(10, 8, 12, 16);
      // Hands reaching up
      g.fillStyle(0xFFD700);
      g.fillRect(8, 4, 4, 10);
      g.fillRect(20, 4, 4, 10);
      // Highlight
      g.fillStyle(0xFFE082, 0.5); g.fillRect(14, 10, 4, 8);
    });
    makeTile('counter', (g) => {
      // Counter/bar surface
      g.fillStyle(0x6D4C41); g.fillRect(0, 0, S, S);
      // Lighter top edge (bar rail)
      g.fillStyle(0x8D6E63); g.fillRect(0, 0, S, 6);
      // Front panel detail
      g.fillStyle(0x5D4037); g.fillRect(2, 8, S - 4, S - 10);
      g.lineStyle(1, 0x4E342E, 0.3);
      g.lineBetween(S / 2, 8, S / 2, S);
    });
    makeTile('piano', (g) => {
      g.fillStyle(0x1A1A1A); g.fillRect(0, 0, S, S);
      // Piano body shine
      g.fillStyle(0x333333, 0.4);
      g.fillRect(2, 2, S - 4, 4);
    });
    makeTile('piano_keys', (g) => {
      g.fillStyle(0x1A1A1A); g.fillRect(0, 0, S, S);
      // White keys
      g.fillStyle(0xFFFFFF, 0.9);
      for (let i = 0; i < 6; i++) g.fillRect(2 + i * 5, S - 10, 3, 8);
      // Black keys
      g.fillStyle(0x333333, 0.6);
      for (let i = 0; i < 5; i++) g.fillRect(4 + i * 5, S - 10, 2, 5);
    });

    // --- New tiles for Entreecafé ---
    makeTile('bar', (g) => {
      // Bar counter
      g.fillStyle(0x5D4037); g.fillRect(0, 0, S, S);
      // Polished top
      g.fillStyle(0x8D6E63); g.fillRect(0, 0, S, 8);
      // Bottles/glasses on shelf
      g.fillStyle(0xBDBDBD);
      g.fillRect(4, 12, 4, 8);
      g.fillRect(12, 10, 4, 10);
      g.fillRect(22, 12, 4, 8);
      // Shelf line
      g.lineStyle(1, 0x4E342E, 0.5);
      g.lineBetween(0, 22, S, 22);
    });
    makeTile('koffie', (g) => {
      // Machine body
      g.fillStyle(0x4E342E); g.fillRect(0, 0, S, S);
      g.fillStyle(0x3E2723); g.fillRect(2, 2, S - 4, S - 4);
      // Cup slot
      g.fillStyle(0x795548); g.fillRect(8, 18, 16, 10);
      // White cup
      g.fillStyle(0xFFFFFF); g.fillRect(12, 20, 8, 7);
      // Coffee in cup
      g.fillStyle(0x4E342E); g.fillRect(13, 21, 6, 4);
      // Display/buttons
      g.fillStyle(0x81D4FA); g.fillRect(8, 4, 16, 8);
      // Steam
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillRect(14, 14, 2, 4);
      g.fillRect(17, 15, 2, 3);
    });
    makeTile('cake', (g) => {
      // Display case
      g.fillStyle(0xF5F5F5); g.fillRect(4, 4, S - 8, S - 8);
      g.lineStyle(1, 0xE0E0E0, 0.5);
      g.strokeRect(4, 4, S - 8, S - 8);
      // Cake base
      g.fillStyle(0xFFCC80); g.fillRect(6, 14, 20, 10);
      // Frosting
      g.fillStyle(0xFFF9C4); g.fillRect(6, 12, 20, 4);
      // Strawberry on top
      g.fillStyle(0xE53935); g.fillCircle(16, 10, 4);
      g.fillStyle(0x4CAF50); g.fillRect(15, 6, 3, 3);
    });
    makeTile('table', (g) => {
      // Table top
      g.fillStyle(0xBCAAA4); g.fillRect(4, 4, S - 8, S - 8);
      g.lineStyle(1, 0x8D6E63, 0.3);
      g.strokeRect(4, 4, S - 8, S - 8);
      // Table legs (corners)
      g.fillStyle(0x6D4C41);
      g.fillRect(4, 4, 3, 3);
      g.fillRect(S - 7, 4, 3, 3);
      g.fillRect(4, S - 7, 3, 3);
      g.fillRect(S - 7, S - 7, 3, 3);
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

  generateClubhuisSilhouette() {
    const W = 800, H = 280;
    const g = this.make.graphics({ add: false });
    const c = 0xFFFFFF;
    // Ground
    g.fillStyle(c, 0.08);
    g.fillRect(0, H - 20, W, 20);
    // Main building
    const bx = 140, by = 80, bw = 520, bh = 180;
    g.fillStyle(c, 0.12);
    g.fillRect(bx, by, bw, bh);
    // Roof edge
    g.fillStyle(c, 0.06);
    g.fillRect(bx - 10, by - 8, bw + 20, 12);
    // Glass facade columns
    g.fillStyle(c, 0.06);
    for (let i = 0; i < 12; i++) {
      g.fillRect(bx + 20 + i * 42, by + 15, 30, bh - 30);
    }
    // Horizontal lines
    g.fillStyle(c, 0.03);
    g.fillRect(bx + 10, by + 70, bw - 20, 2);
    g.fillRect(bx + 10, by + 130, bw - 20, 2);
    // Theater dome
    const dx = 560, dy = by - 5;
    g.fillStyle(c, 0.14);
    g.fillRect(dx - 50, dy, 100, 85);
    g.beginPath();
    g.arc(dx, dy, 50, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    g.fillStyle(c, 0.05);
    g.beginPath();
    g.arc(dx, dy, 40, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    // Entrance
    g.fillStyle(c, 0.08);
    g.fillRect(340, by + bh - 50, 120, 50);
    g.fillStyle(c, 0.05);
    g.fillRect(355, by + bh - 45, 35, 40);
    g.fillRect(400, by + bh - 45, 35, 40);
    // Solar panels
    g.fillStyle(c, 0.04);
    for (let i = 0; i < 8; i++) {
      g.fillRect(bx + 30 + i * 55, by - 3, 40, 3);
    }
    // Quinn sculpture
    g.fillStyle(c, 0.10);
    g.beginPath();
    g.arc(110, H - 70, 20, 0, Math.PI * 2);
    g.closePath();
    g.fillPath();
    g.fillRect(95, H - 95, 6, 30);
    g.fillRect(119, H - 95, 6, 30);
    // Bench
    g.fillStyle(c, 0.08);
    g.fillRect(90, H - 40, 40, 20);
    // Trees
    g.fillStyle(c, 0.06);
    g.beginPath(); g.arc(50, H - 45, 18, 0, Math.PI * 2); g.closePath(); g.fillPath();
    g.fillRect(47, H - 30, 6, 12);
    g.beginPath(); g.arc(730, H - 40, 15, 0, Math.PI * 2); g.closePath(); g.fillPath();
    g.fillRect(727, H - 28, 6, 10);
    g.beginPath(); g.arc(760, H - 50, 20, 0, Math.PI * 2); g.closePath(); g.fillPath();
    g.fillRect(757, H - 34, 6, 14);
    g.generateTexture('clubhuis_silhouette', W, H);
    g.destroy();
  }
}
