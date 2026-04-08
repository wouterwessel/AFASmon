import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { BattleSystem } from '../systems/BattleSystem.js';
import { AFASmon } from '../entities/AFASmon.js';
import { DialogSystem } from '../systems/DialogSystem.js';

const STATES = {
  INTRO: 'intro',
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  ANIMATING: 'animating',
  CATCH: 'catch',
  WIN: 'win',
  LOSE: 'lose',
  FLEE: 'flee',
};

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BATTLE });
  }

  init(data) {
    this.battleType = data.type; // 'wild' or 'trainer'
    this.enemyMon = data.enemy || null;
    this.enemyTeam = data.enemyTeam || (data.enemy ? [data.enemy] : []);
    this.trainerName = data.trainerName || 'Wild';
    this.trainerId = data.trainerId || null;
    this.defeatDialog = data.defeatDialog || [];
    this.reward = data.reward || {};
    this.isBoss = data.isBoss || false;
    this.returnZone = data.zone;
    this.returnX = data.playerGridX;
    this.returnY = data.playerGridY;
    this.enemyIndex = 0;
    // Wave battle support
    this.isWaveBattle = data.isWaveBattle || false;
    this.currentWave = data.currentWave || 0;
    // Quiz support
    this.returnToQuiz = data.returnToQuiz || false;
    this.quizState = data.quizState || null;
  }

  create() {
    this.battleSystem = new BattleSystem();
    this.dialogSystem = new DialogSystem(this);

    // Cleanup on scene shutdown
    this.events.on('shutdown', () => {
      this.tweens.killAll();
      this.clearMenuKeys();
      if (this.dialogSystem) this.dialogSystem.hide();
    });

    this.inventory = this.registry.get('inventory');
    this.playerMon = this.inventory.getFirstAlive();

    if (!this.playerMon) {
      // Safety: no alive team members — return to restaurant for healing
      this.inventory.healTeam();
      this.scene.start(SCENES.WORLD, {
        newGame: false,
        currentZone: 'restaurant',
        spawnX: 5,
        spawnY: 8,
      });
      return;
    }

    if (!this.enemyMon && this.enemyTeam.length > 0) {
      this.enemyMon = this.enemyTeam[0];
    }

    this.state = STATES.INTRO;

    this.createBattleUI();
    this.showIntro();
  }

  createBattleUI() {
    // Background
    if (this.textures.exists('battle_bg')) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle_bg');
    } else {
      // Gradient background fallback
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4CAF50, 0x4CAF50);
      bg.fillRect(0, 0, GAME_WIDTH, 300);
      bg.fillStyle(0x8D6E63);
      bg.fillRect(0, 300, GAME_WIDTH, 300);
    }

    // Platforms
    if (this.textures.exists('platform')) {
      this.add.image(220, 350, 'platform').setScale(1.5);
      this.add.image(580, 220, 'platform').setScale(1.2);
    } else {
      this.add.ellipse(220, 355, 180, 40, 0x6D4C41);
      this.add.ellipse(580, 225, 150, 30, 0x6D4C41);
    }

    // Player AFASmon sprite
    const pSpriteKey = `${this.playerMon.spriteKey}_battle`;
    this.playerSprite = this.add.image(220, 300, pSpriteKey).setScale(1.5);

    // Enemy AFASmon sprite
    const eSpriteKey = `${this.enemyMon.spriteKey}_battle`;
    this.enemySprite = this.add.image(580, 170, eSpriteKey).setScale(1.2);

    // Player info box (top-right area)
    this.createInfoBox(460, 360, this.playerMon, 'player');

    // Enemy info box (top-left area)
    this.createInfoBox(50, 30, this.enemyMon, 'enemy');

    // Action menu container (bottom)
    this.actionContainer = this.add.container(0, 440).setDepth(100);
    this.createActionMenu();

    // Message box
    this.messageBox = this.add.container(0, 0).setDepth(200);
  }

  createInfoBox(x, y, mon, owner) {
    const container = this.add.container(x, y).setDepth(50);
    const prefix = owner === 'player' ? 'p' : 'e';

    // Background
    container.add(this.add.rectangle(0, 0, 290, 80, 0x000000, 0.75)
      .setOrigin(0, 0).setStrokeStyle(1, COLORS.PRIMARY));

    // Name and level
    const nameText = this.add.text(10, 8, `${mon.name}`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    });
    container.add(nameText);

    const levelText = this.add.text(275, 8, `Lv.${mon.level}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#B0BEC5',
    }).setOrigin(1, 0);
    container.add(levelText);

    // Type badge
    const typeColors = {
      DOEN: 0xE53935, VERTROUWEN: 0x2196F3, GEK: 0xAB47BC,
      FAMILIE: 0x66BB6A, NEUTRAAL: 0x9E9E9E, LEGENDARY: 0xFFD700,
    };
    const badge = this.add.rectangle(10 + nameText.width + 10, 14, 0, 18,
      typeColors[mon.type] || 0x888888).setOrigin(0, 0.5);
    const typeText = this.add.text(10 + nameText.width + 14, 14, mon.type, {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    badge.width = typeText.width + 8;
    container.add([badge, typeText]);

    // HP bar
    container.add(this.add.text(10, 34, 'HP', {
      fontFamily: 'Arial', fontSize: '11px', color: '#B0BEC5',
    }));

    const hpBg = this.add.rectangle(35, 38, 200, 14, 0x333333).setOrigin(0, 0);
    container.add(hpBg);

    const hpPercent = mon.getHpPercent();
    const hpColor = hpPercent > 0.5 ? COLORS.HP_GREEN : hpPercent > 0.25 ? COLORS.HP_YELLOW : COLORS.HP_RED;
    const hpBar = this.add.rectangle(36, 39, 198 * hpPercent, 12, hpColor).setOrigin(0, 0);
    container.add(hpBar);

    const hpText = this.add.text(245, 38, `${mon.currentHp}/${mon.maxHp}`, {
      fontFamily: 'Arial', fontSize: '11px', color: '#ffffff',
    }).setOrigin(1, 0);
    container.add(hpText);

    // XP bar (player only)
    if (owner === 'player') {
      container.add(this.add.text(10, 56, 'XP', {
        fontFamily: 'Arial', fontSize: '10px', color: '#B0BEC5',
      }));
      const xpPercent = mon.xp / mon.xpToNextLevel;
      container.add(this.add.rectangle(35, 60, 200, 8, 0x333333).setOrigin(0, 0));
      const xpBar = this.add.rectangle(36, 61, 198 * xpPercent, 6, COLORS.XP_BLUE).setOrigin(0, 0);
      container.add(xpBar);
      this[`${prefix}XpBar`] = xpBar;
    }

    // Store references for updating
    this[`${prefix}InfoContainer`] = container;
    this[`${prefix}HpBar`] = hpBar;
    this[`${prefix}HpText`] = hpText;
    this[`${prefix}NameText`] = nameText;
    this[`${prefix}LevelText`] = levelText;

    return container;
  }

  updateInfoBox(owner) {
    const mon = owner === 'player' ? this.playerMon : this.enemyMon;
    const prefix = owner === 'player' ? 'p' : 'e';

    const hpPercent = mon.getHpPercent();
    const hpColor = hpPercent > 0.5 ? COLORS.HP_GREEN : hpPercent > 0.25 ? COLORS.HP_YELLOW : COLORS.HP_RED;

    this.tweens.add({
      targets: this[`${prefix}HpBar`],
      width: 198 * hpPercent,
      duration: 400,
      onUpdate: () => {
        this[`${prefix}HpBar`].fillColor = hpColor;
      },
    });
    this[`${prefix}HpText`].setText(`${mon.currentHp}/${mon.maxHp}`);

    if (owner === 'player' && this[`${prefix}XpBar`]) {
      const xpPercent = mon.xp / mon.xpToNextLevel;
      this.tweens.add({
        targets: this[`${prefix}XpBar`],
        width: 198 * xpPercent,
        duration: 300,
      });
    }
  }

  createActionMenu() {
    this.actionContainer.removeAll(true);
    this.clearMenuKeys();

    // Background
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, 160, 0x0a0a2e, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, COLORS.PRIMARY);
    this.actionContainer.add(bg);

    if (this.state !== STATES.PLAYER_TURN) return;

    // Main actions
    const actions = [
      { text: '⚔️ Aanvallen', action: () => this.showMoveMenu(), key: '1' },
      { text: '📋 Contract', action: () => this.attemptCatch(), key: '2', enabled: this.battleType === 'wild' },
      { text: '☕ Koffie', action: () => this.useKoffie(), key: '3' },
      { text: '🔄 Wissel', action: () => this.showSwitchMenu(), key: '4', enabled: this.inventory.team.filter(m => !m.isFainted).length > 1 },
    ];

    if (this.battleType === 'wild') {
      actions.push({ text: '🏃 Vluchten', action: () => this.attemptFlee(), key: '5' });
    }

    actions.forEach((action, i) => {
      const x = 20 + (i % 3) * 260;
      const y = 20 + Math.floor(i / 3) * 50;
      const enabled = action.enabled !== false;

      const btnBg = this.add.rectangle(x, y, 240, 40, enabled ? COLORS.PRIMARY : 0x333333, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(1, enabled ? COLORS.SECONDARY : 0x555555);
      if (enabled) btnBg.setInteractive({ useHandCursor: true });

      const btnText = this.add.text(x + 10, y + 10, `[${action.key}] ${action.text}`, {
        fontFamily: 'Arial', fontSize: '15px',
        color: enabled ? '#ffffff' : '#666666',
        fontStyle: 'bold',
      });

      if (enabled) {
        btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.SECONDARY, 0.9));
        btnBg.on('pointerout', () => btnBg.setFillStyle(COLORS.PRIMARY, 0.8));
        btnBg.on('pointerdown', action.action);

        // Keyboard shortcut
        this.input.keyboard.once(`keydown-${action.key}`, () => {
          if (this.state === STATES.PLAYER_TURN) action.action();
        });
      }

      this.actionContainer.add([btnBg, btnText]);
    });

    // Item counts
    this.actionContainer.add(this.add.text(20, 120, `Contracten: ${this.inventory.getItemCount('contract')}  |  Koffie: ${this.inventory.getItemCount('koffie')}`, {
      fontFamily: 'Arial', fontSize: '12px', color: '#78909C',
    }));
  }

  showMoveMenu() {
    this.actionContainer.removeAll(true);
    this.clearMenuKeys();

    const bg = this.add.rectangle(0, 0, GAME_WIDTH, 160, 0x0a0a2e, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, COLORS.PRIMARY);
    this.actionContainer.add(bg);

    const typeColors = {
      DOEN: 0xE53935, VERTROUWEN: 0x2196F3, GEK: 0xAB47BC,
      FAMILIE: 0x66BB6A, NEUTRAAL: 0x9E9E9E, LEGENDARY: 0xFFD700,
    };

    this.playerMon.moves.forEach((move, i) => {
      const x = 20 + (i % 2) * 390;
      const y = 15 + Math.floor(i / 2) * 60;
      const haspp = move.currentPp > 0;

      const moveColor = typeColors[move.type] || 0x555555;
      const btnBg = this.add.rectangle(x, y, 370, 50, haspp ? moveColor : 0x333333, 0.7)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0xFFFFFF);
      if (haspp) btnBg.setInteractive({ useHandCursor: true });

      const nameText = this.add.text(x + 10, y + 6, move.name, {
        fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
      });

      const ppText = this.add.text(x + 355, y + 6, `PP ${move.currentPp}/${move.pp}`, {
        fontFamily: 'Arial', fontSize: '12px', color: '#B0BEC5',
      }).setOrigin(1, 0);

      const infoText = this.add.text(x + 10, y + 28, `${move.type} | Kracht: ${move.power || '-'} | Raak: ${move.accuracy}%`, {
        fontFamily: 'Arial', fontSize: '11px', color: '#dddddd',
      });

      if (haspp) {
        btnBg.on('pointerover', () => btnBg.setAlpha(1));
        btnBg.on('pointerout', () => btnBg.setAlpha(0.7));
        btnBg.on('pointerdown', () => this.executePlayerMove(move));

        this.input.keyboard.once(`keydown-${i + 1}`, () => {
          if (this.state === STATES.PLAYER_TURN) this.executePlayerMove(move);
        });
      }

      this.actionContainer.add([btnBg, nameText, ppText, infoText]);
    });

    // Back button
    const backBtn = this.add.text(GAME_WIDTH - 80, 130, '[ESC] Terug', {
      fontFamily: 'Arial', fontSize: '14px', color: '#F57C00',
    }).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.createActionMenu());
    this.input.keyboard.once('keydown-ESC', () => {
      if (this.state === STATES.PLAYER_TURN) this.createActionMenu();
    });
    this.actionContainer.add(backBtn);
  }

  showSwitchMenu() {
    this.actionContainer.removeAll(true);
    this.clearMenuKeys();

    const bg = this.add.rectangle(0, 0, GAME_WIDTH, 160, 0x0a0a2e, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, COLORS.PRIMARY);
    this.actionContainer.add(bg);

    this.actionContainer.add(this.add.text(20, 8, 'Kies een AFASmon:', {
      fontFamily: 'Arial', fontSize: '14px', color: '#F57C00',
    }));

    const alive = this.inventory.team.filter(m => !m.isFainted && m !== this.playerMon);
    alive.forEach((mon, i) => {
      const x = 20 + (i % 3) * 260;
      const y = 35 + Math.floor(i / 3) * 55;

      const btnBg = this.add.rectangle(x, y, 240, 45, COLORS.PRIMARY, 0.7)
        .setOrigin(0, 0)
        .setStrokeStyle(1, COLORS.SECONDARY)
        .setInteractive({ useHandCursor: true });

      const text = this.add.text(x + 10, y + 5, `${mon.name} Lv.${mon.level}`, {
        fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
      });

      const hp = this.add.text(x + 10, y + 25, `HP: ${mon.currentHp}/${mon.maxHp}`, {
        fontFamily: 'Arial', fontSize: '11px', color: '#B0BEC5',
      });

      btnBg.on('pointerdown', () => this.switchMon(mon));

      this.actionContainer.add([btnBg, text, hp]);
    });

    // Back
    const backBtn = this.add.text(GAME_WIDTH - 80, 130, '[ESC] Terug', {
      fontFamily: 'Arial', fontSize: '14px', color: '#F57C00',
    }).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.createActionMenu());
    this.input.keyboard.once('keydown-ESC', () => {
      if (this.state === STATES.PLAYER_TURN) this.createActionMenu();
    });
    this.actionContainer.add(backBtn);
  }

  showIntro() {
    const isWild = this.battleType === 'wild';
    const text = isWild
      ? `Een wilde ${this.enemyMon.name} verschijnt!`
      : `${this.trainerName} daagt je uit!`;

    this.showMessage(text, () => {
      if (!isWild) {
        this.showMessage(`${this.trainerName} stuurt ${this.enemyMon.name} het veld in!`, () => {
          this.showMessage(`Ga, ${this.playerMon.name}!`, () => {
            this.state = STATES.PLAYER_TURN;
            this.createActionMenu();
          });
        });
      } else {
        this.showMessage(`Ga, ${this.playerMon.name}!`, () => {
          this.state = STATES.PLAYER_TURN;
          this.createActionMenu();
        });
      }
    });
  }

  showMessage(text, callback) {
    this.messageBox.removeAll(true);
    this.clearMenuKeys();

    // Block input briefly to prevent rapid-fire advances
    this.messageReady = false;
    this.time.delayedCall(350, () => { this.messageReady = true; });

    const bg = this.add.rectangle(0, 440, GAME_WIDTH, 160, 0x0a0a2e, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, COLORS.PRIMARY);
    this.messageBox.add(bg);

    const msgText = this.add.text(30, 470, text, {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
      wordWrap: { width: GAME_WIDTH - 60 },
    });
    this.messageBox.add(msgText);

    const cont = this.add.text(GAME_WIDTH - 40, 570, '▶', {
      fontFamily: 'Arial', fontSize: '16px', color: '#F57C00',
    }).setOrigin(0.5);
    this.tweens.add({ targets: cont, x: cont.x + 5, duration: 500, yoyo: true, repeat: -1 });
    this.messageBox.add(cont);

    const advance = () => {
      if (!this.messageReady) return;
      this.input.off('pointerdown', advance);
      this.input.keyboard.off('keydown-SPACE', advance);
      this.input.keyboard.off('keydown-ENTER', advance);
      this.messageBox.removeAll(true);
      if (callback) callback();
    };

    this.input.on('pointerdown', advance);
    this.input.keyboard.on('keydown-SPACE', advance);
    this.input.keyboard.on('keydown-ENTER', advance);
  }

  async showMessages(messages, callback) {
    if (messages.length === 0) {
      if (callback) callback();
      return;
    }
    const [first, ...rest] = messages;
    const text = typeof first === 'string' ? first : first.text;
    this.showMessage(text, () => this.showMessages(rest, callback));
  }

  executePlayerMove(move) {
    if (this.state !== STATES.PLAYER_TURN) return;
    this.state = STATES.ANIMATING;
    this.clearMenuKeys();
    this.actionContainer.removeAll(true);

    const turnOrder = this.battleSystem.determineTurnOrder(this.playerMon, this.enemyMon);

    if (turnOrder === 'player') {
      this.doPlayerAttack(move, () => {
        if (this.enemyMon.isFainted) {
          this.handleEnemyFainted();
        } else {
          this.doEnemyAttack(() => {
            if (this.playerMon.isFainted) {
              this.handlePlayerFainted();
            } else {
              this.state = STATES.PLAYER_TURN;
              this.createActionMenu();
            }
          });
        }
      });
    } else {
      this.doEnemyAttack(() => {
        if (this.playerMon.isFainted) {
          this.handlePlayerFainted();
        } else {
          this.doPlayerAttack(move, () => {
            if (this.enemyMon.isFainted) {
              this.handleEnemyFainted();
            } else {
              this.state = STATES.PLAYER_TURN;
              this.createActionMenu();
            }
          });
        }
      });
    }
  }

  doPlayerAttack(move, callback) {
    const results = this.battleSystem.executeMove(this.playerMon, this.enemyMon, move);
    this.animateAttack('player', results, callback);
  }

  doEnemyAttack(callback) {
    const move = this.battleSystem.selectEnemyMove(this.enemyMon, this.playerMon);
    const results = this.battleSystem.executeMove(this.enemyMon, this.playerMon, move);
    this.animateAttack('enemy', results, callback);
  }

  animateAttack(attacker, results, callback) {
    // Add attacker label to the first message for clarity
    const isPlayer = attacker === 'player';
    const label = isPlayer ? '🔵 JIJ: ' : '🔴 VIJAND: ';
    const messages = results.map((r, i) => {
      if (!r.text) return null;
      // Prefix the first message (the attack announcement) with the attacker label
      if (i === 0) return label + r.text;
      return r.text;
    }).filter(Boolean);

    // Shake animation on damaged sprite
    const hasDamage = results.some(r => r.type === 'damage');
    if (hasDamage) {
      const targetSprite = isPlayer ? this.enemySprite : this.playerSprite;
      this.tweens.add({
        targets: targetSprite,
        x: targetSprite.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });

      // Flash
      this.time.delayedCall(100, () => {
        targetSprite.setTint(0xFF0000);
        this.time.delayedCall(200, () => targetSprite.clearTint());
      });
    }

    // Only update the HP bar of the target that was affected
    this.time.delayedCall(300, () => {
      if (isPlayer) {
        this.updateInfoBox('enemy');
        if (results.some(r => r.type === 'recoil' || r.type === 'heal')) {
          this.updateInfoBox('player');
        }
      } else {
        this.updateInfoBox('player');
        if (results.some(r => r.type === 'recoil' || r.type === 'heal')) {
          this.updateInfoBox('enemy');
        }
      }
    });

    this.showMessages(messages, callback);
  }

  handleEnemyFainted() {
    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y + 50,
      alpha: 0,
      duration: 600,
    });

    // Check if trainer has more Pokémon
    if (this.battleType === 'trainer') {
      this.enemyIndex++;
      if (this.enemyIndex < this.enemyTeam.length) {
        const xp = this.battleSystem.calculateXpGain(this.enemyMon, false);
        const xpResult = this.playerMon.gainXp(xp);

        const messages = [`${this.enemyMon.name} is verslagen! +${xp} XP`];
        if (xpResult.leveled) {
          messages.push(`${this.playerMon.name} is nu level ${this.playerMon.level}!`);
        }

        this.showMessages(messages, () => {
          this.enemyMon = this.enemyTeam[this.enemyIndex];
          this.showMessage(`${this.trainerName} stuurt ${this.enemyMon.name}!`, () => {
            // Update enemy sprite
            const eSpriteKey = `${this.enemyMon.spriteKey}_battle`;
            this.enemySprite.setTexture(eSpriteKey).setY(170).setAlpha(1);

            // Rebuild enemy info
            if (this.eInfoContainer) this.eInfoContainer.destroy();
            this.createInfoBox(50, 30, this.enemyMon, 'enemy');
            this.updateInfoBox('player');

            this.state = STATES.PLAYER_TURN;
            this.createActionMenu();
          });
        });
        return;
      }
    }

    // Victory!
    const xp = this.battleSystem.calculateXpGain(this.enemyMon, this.battleType === 'wild');
    const xpResult = this.playerMon.gainXp(xp);

    this.updateInfoBox('player');

    const messages = [`${this.enemyMon.name} is verslagen! +${xp} XP`];
    if (xpResult.leveled) {
      messages.push(`${this.playerMon.name} is nu level ${this.playerMon.level}!`);
    }

    this.showMessages(messages, () => {
      if (this.battleType === 'trainer') {
        this.handleTrainerDefeated();
      } else {
        this.returnToWorld();
      }
    });
  }

  handleTrainerDefeated() {
    this.inventory.markTrainerDefeated(this.trainerId);

    // Apply rewards
    if (this.reward) {
      if (this.reward.items) {
        Object.entries(this.reward.items).forEach(([item, count]) => {
          this.inventory.addItem(item, count);
        });
      }
      if (this.reward.unlocks) {
        this.reward.unlocks.forEach(zone => this.inventory.unlockZone(zone));
      }
      if (this.reward.givesInnovaxx) {
        const innovaxx = new AFASmon('innovaxx', 20, { isWild: false });
        this.inventory.addToTeam(innovaxx);
      }
    }

    // Show defeat dialog
    if (this.defeatDialog && this.defeatDialog.length > 0) {
      this.dialogSystem.show(this.defeatDialog, () => {
        const rewardMessages = [];
        if (this.reward?.items) {
          Object.entries(this.reward.items).forEach(([item, count]) => {
            if (count > 0) rewardMessages.push(`Je ontving ${count}x ${item}!`);
          });
        }
        if (this.reward?.unlocks?.length > 0) {
          rewardMessages.push(`Nieuwe gebieden ontgrendeld: ${this.reward.unlocks.join(', ')}!`);
        }
        if (this.reward?.givesInnovaxx) {
          rewardMessages.push('Je ontving Innovaxx!');
        }

        if (rewardMessages.length > 0) {
          this.showMessages(rewardMessages, () => {
            if (this.isBoss) {
              this.showVictoryScreen();
            } else {
              this.returnToWorld();
            }
          });
        } else {
          this.returnToWorld();
        }
      });
    } else {
      this.returnToWorld();
    }
  }

  handlePlayerFainted() {
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y + 50,
      alpha: 0,
      duration: 600,
    });

    // Check if player has more alive team members
    const nextMon = this.inventory.team.find(m => !m.isFainted && m !== this.playerMon);
    if (nextMon) {
      this.showMessage(`${this.playerMon.name} is flauwgevallen!`, () => {
        this.showSwitchAfterFaint();
      });
    } else {
      // All fainted — lose
      this.showMessage(`${this.playerMon.name} is flauwgevallen!`, () => {
        this.showMessage('Al je AFASmon zijn flauwgevallen...', () => {
          this.showMessage('Je sleept je naar het restaurant voor herstel.', () => {
            this.inventory.healTeam();
            this.scene.start(SCENES.WORLD, {
              newGame: false,
              currentZone: 'restaurant',
              spawnX: 5,
              spawnY: 8,
            });
          });
        });
      });
    }
  }

  showSwitchAfterFaint() {
    this.actionContainer.removeAll(true);
    this.clearMenuKeys();

    const bg = this.add.rectangle(0, 0, GAME_WIDTH, 160, 0x0a0a2e, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, COLORS.PRIMARY);
    this.actionContainer.add(bg);

    this.actionContainer.add(this.add.text(20, 8, 'Kies je volgende AFASmon:', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#E53935',
    }));

    const alive = this.inventory.team.filter(m => !m.isFainted);
    alive.forEach((mon, i) => {
      const x = 20 + (i % 3) * 260;
      const y = 40 + Math.floor(i / 3) * 55;

      const btnBg = this.add.rectangle(x, y, 240, 45, COLORS.PRIMARY, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(1, COLORS.SECONDARY)
        .setInteractive({ useHandCursor: true });

      this.actionContainer.add(btnBg);
      this.actionContainer.add(this.add.text(x + 10, y + 5, `${mon.name} Lv.${mon.level}`, {
        fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
      }));
      this.actionContainer.add(this.add.text(x + 10, y + 25, `HP: ${mon.currentHp}/${mon.maxHp}`, {
        fontFamily: 'Arial', fontSize: '11px', color: '#B0BEC5',
      }));

      btnBg.on('pointerdown', () => this.switchMon(mon));
    });
  }

  switchMon(newMon) {
    this.state = STATES.ANIMATING;
    this.playerMon.resetBattleMods();

    this.showMessage(`${this.playerMon.name}, kom terug!`, () => {
      this.playerMon = newMon;
      this.playerMon.resetBattleMods();

      // Update sprite
      const pSpriteKey = `${this.playerMon.spriteKey}_battle`;
      this.playerSprite.setTexture(pSpriteKey).setY(300).setAlpha(1);

      // Rebuild player info
      if (this.pInfoContainer) this.pInfoContainer.destroy();
      this.createInfoBox(460, 360, this.playerMon, 'player');

      this.showMessage(`Ga, ${this.playerMon.name}!`, () => {
        // Enemy gets a free attack
        this.doEnemyAttack(() => {
          if (this.playerMon.isFainted) {
            this.handlePlayerFainted();
          } else {
            this.state = STATES.PLAYER_TURN;
            this.createActionMenu();
          }
        });
      });
    });
  }

  attemptCatch() {
    if (this.state !== STATES.PLAYER_TURN) return;
    if (!this.inventory.useItem('contract')) {
      this.showMessage('Je hebt geen Contracten meer!', () => {
        this.state = STATES.PLAYER_TURN;
        this.createActionMenu();
      });
      return;
    }

    this.state = STATES.ANIMATING;
    this.clearMenuKeys();
    this.actionContainer.removeAll(true);

    const result = this.battleSystem.attemptCatch(this.enemyMon);

    // Animate contract throw
    this.showMessage(`Je biedt ${this.enemyMon.name} een Contract aan...`, () => {
      const shakeMessages = [];
      for (let i = 0; i < result.shakes; i++) {
        shakeMessages.push('...');
      }

      if (result.success) {
        shakeMessages.push(`Gelukt! ${this.enemyMon.name} heeft het Contract getekend!`);

        this.showMessages(shakeMessages, () => {
          // Award XP for catching
          const xp = this.battleSystem.calculateXpGain(this.enemyMon, true);
          const xpResult = this.playerMon.gainXp(xp);
          this.updateInfoBox('player');

          const catchMessages = [`${this.enemyMon.name} gevangen! +${xp} XP`];
          if (xpResult.leveled) {
            catchMessages.push(`${this.playerMon.name} is nu level ${this.playerMon.level}!`);
          }

          this.enemyMon.isWild = false;
          this.enemyMon.resetBattleMods();
          if (this.inventory.addToTeam(this.enemyMon)) {
            catchMessages.push(`${this.enemyMon.name} is toegevoegd aan je team!`);
          } else {
            catchMessages.push('Je team is vol! Er is geen plek meer.');
          }

          this.showMessages(catchMessages, () => {
            this.returnToWorld();
          });
        });
      } else {
        shakeMessages.push(`${this.enemyMon.name} weigert het Contract en breekt los!`);
        this.showMessages(shakeMessages, () => {
          // Enemy gets a free attack
          this.doEnemyAttack(() => {
            if (this.playerMon.isFainted) {
              this.handlePlayerFainted();
            } else {
              this.state = STATES.PLAYER_TURN;
              this.createActionMenu();
            }
          });
        });
      }
    });
  }

  useKoffie() {
    if (this.state !== STATES.PLAYER_TURN) return;
    if (!this.inventory.useItem('koffie')) {
      this.showMessage('Je hebt geen Koffie meer!', () => {
        this.state = STATES.PLAYER_TURN;
        this.createActionMenu();
      });
      return;
    }

    this.state = STATES.ANIMATING;
    this.clearMenuKeys();
    this.actionContainer.removeAll(true);
    const healAmount = Math.floor(this.playerMon.maxHp * 0.4);
    this.playerMon.heal(healAmount);
    this.updateInfoBox('player');

    this.showMessage(`${this.playerMon.name} drinkt koffie en herstelt ${healAmount} HP!`, () => {
      this.doEnemyAttack(() => {
        if (this.playerMon.isFainted) {
          this.handlePlayerFainted();
        } else {
          this.state = STATES.PLAYER_TURN;
          this.createActionMenu();
        }
      });
    });
  }

  attemptFlee() {
    if (this.state !== STATES.PLAYER_TURN) return;
    this.state = STATES.ANIMATING;
    this.clearMenuKeys();
    this.actionContainer.removeAll(true);
    const fleeChance = 0.5 + (this.playerMon.getEffectiveStat('speed') / this.enemyMon.getEffectiveStat('speed')) * 0.3;

    if (Math.random() < fleeChance) {
      // Cancel wave battle chain on flee
      this.isWaveBattle = false;
      this.showMessage('Je bent succesvol gevlucht!', () => {
        this.returnToWorld();
      });
    } else {
      this.showMessage('Je kunt niet vluchten!', () => {
        this.doEnemyAttack(() => {
          if (this.playerMon.isFainted) {
            this.handlePlayerFainted();
          } else {
            this.state = STATES.PLAYER_TURN;
            this.createActionMenu();
          }
        });
      });
    }
  }

  showVictoryScreen() {
    const container = this.add.container(0, 0).setDepth(3000);

    container.add(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9));

    container.add(this.add.text(GAME_WIDTH / 2, 100, '🎉 Gefeliciteerd! 🎉', {
      fontFamily: 'Arial Black', fontSize: '42px', color: '#FFD700',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5));

    container.add(this.add.text(GAME_WIDTH / 2, 180, 'Je hebt CEO Bas van der Veldt verslagen!', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5));

    container.add(this.add.text(GAME_WIDTH / 2, 230, 'Je hebt je vaste aanstelling bij AFAS Software verdiend!', {
      fontFamily: 'Arial', fontSize: '18px', color: '#F57C00',
    }).setOrigin(0.5));

    container.add(this.add.text(GAME_WIDTH / 2, 300, 'Jouw Team:', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#00529C',
    }).setOrigin(0.5));

    this.inventory.team.forEach((mon, i) => {
      const x = 100 + (i % 3) * 250;
      const y = 350 + Math.floor(i / 3) * 60;
      container.add(this.add.text(x, y, `${mon.name} Lv.${mon.level}`, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
      }));
    });

    container.add(this.add.text(GAME_WIDTH / 2, 520, 'Bedankt voor het spelen!', {
      fontFamily: 'Arial', fontSize: '16px', color: '#B0BEC5',
    }).setOrigin(0.5));

    const restartBtn = this.add.text(GAME_WIDTH / 2, 560, 'Klik om terug te gaan naar het menu', {
      fontFamily: 'Arial', fontSize: '14px', color: '#F57C00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    container.add(restartBtn);

    restartBtn.on('pointerdown', () => {
      this.scene.start(SCENES.MENU);
    });
  }

  returnToWorld() {
    this.clearMenuKeys();
    // Save before returning
    const saveData = this.inventory.serialize();
    localStorage.setItem('afasmon_save', JSON.stringify(saveData));

    this.scene.start(SCENES.WORLD, {
      newGame: false,
      saveData: saveData,
      currentZone: this.returnZone,
      spawnX: this.returnX,
      spawnY: this.returnY,
      // Wave battle continuation
      isWaveBattle: this.isWaveBattle,
      currentWave: this.currentWave,
      // Quiz continuation
      returnToQuiz: this.returnToQuiz,
      quizState: this.quizState,
    });
  }

  setupKeys() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  clearMenuKeys() {
    // Remove all pending listeners for menu keys to prevent ghost inputs
    ['1', '2', '3', '4', '5', 'ESC'].forEach(key => {
      this.input.keyboard.removeAllListeners(`keydown-${key}`);
    });
  }
}
