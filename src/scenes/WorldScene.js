import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, ZONES } from '../utils/constants.js';
import { getMap, parseMap } from '../data/maps.js';
import { AFASmon } from '../entities/AFASmon.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { DialogSystem } from '../systems/DialogSystem.js';
import afasmonData from '../data/afasmon.json';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.WORLD });
  }

  init(data) {
    this.newGame = data.newGame;
    this.saveData = data.saveData || null;
    this.spawnZone = data.currentZone || 'parkeerplaats';
    this.spawnX = data.spawnX;
    this.spawnY = data.spawnY;
    this.customPlayerName = data.playerName;
    this.customShirtColor = data.shirtColor;
    this.customHairColor = data.hairColor;
  }

  create() {
    // Initialize inventory
    if (this.newGame) {
      this.inventory = new InventorySystem();
      this.inventory.currentZone = 'parkeerplaats';
      if (this.customPlayerName) this.inventory.playerName = this.customPlayerName;
      if (this.customShirtColor !== undefined) this.inventory.shirtColor = this.customShirtColor;
      if (this.customHairColor !== undefined) this.inventory.hairColor = this.customHairColor;
    } else if (this.saveData) {
      this.inventory = InventorySystem.deserialize(this.saveData);
    } else {
      this.inventory = this.registry.get('inventory') || new InventorySystem();
    }

    // Store inventory in registry for cross-scene access
    this.registry.set('inventory', this.inventory);

    // Regenerate player sprite with custom colors
    this.regeneratePlayerSprite(this.inventory.shirtColor, this.inventory.hairColor);

    // Dialog system
    this.dialogSystem = new DialogSystem(this);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D'),
    };
    this.interactKey = this.input.keyboard.addKey('E');
    this.menuKey = this.input.keyboard.addKey('M');

    this.isMoving = false;
    this.moveSpeed = 150; // ms per tile

    // Zone name display
    this.zoneLabel = this.add.text(GAME_WIDTH - 8, 8, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#00529C',
      padding: { x: 12, y: 4 },
      wordWrap: { width: GAME_WIDTH - 40 },
    }).setOrigin(1, 0).setDepth(500).setScrollFactor(0);

    // Quest display (below zone label)
    this.questLabel = this.add.text(GAME_WIDTH / 2, 42, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#FFE0B2',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 3 },
      wordWrap: { width: GAME_WIDTH - 40 },
    }).setOrigin(0.5).setDepth(500).setScrollFactor(0);

    // Mini HUD
    this.hudContainer = this.add.container(10, GAME_HEIGHT - 50).setDepth(500).setScrollFactor(0);

    // Load current zone
    this.currentZone = this.spawnZone || this.inventory.currentZone;
    this.loadZone(this.currentZone);

    this.updateHUD();

    // Show intro dialog for new game
    if (this.newGame && !this.inventory.getFlag('intro_done')) {
      this.time.delayedCall(500, () => {
        this.dialogSystem.show([
          { speaker: 'Verteller', text: 'Je arriveert op de parkeerplaats van het AFAS Clubhuis in Leusden...' },
          { speaker: 'Verteller', text: 'Het imposante kunstwerk "You are the World" van Lorenzo Quinn verwelkomt je. Indrukwekkend!' },
          { speaker: 'Verteller', text: 'Dit is je eerste dag als stagiair bij AFAS Software, {name}. Maar iets voelt... anders.' },
          { speaker: 'Verteller', text: 'Overal in het gebouw lopen vreemde digitale wezens rond. Softwaremodules... die leven?!' },
          { speaker: 'Verteller', text: 'Loop naar het zuiden, het Entreecafé in, en praat met Lisa. Zij weet vast meer!' },
          { speaker: 'Verteller', text: 'Gebruik pijltjestoetsen of WASD om te bewegen. Druk op E om te praten. M opent je team.' },
        ], () => {
          this.inventory.setFlag('intro_done');
          this.updateQuestLabel();
        });
      });
    }

    // Menu key (M)
    this.input.keyboard.on('keydown-M', () => {
      if (!this.dialogSystem.isActive && !this.teamMenu) {
        this.showTeamMenu();
      }
    });

    // Interact key (E)
    this.input.keyboard.on('keydown-E', () => {
      if (!this.dialogSystem.isActive) {
        this.checkInteraction();
      }
    });
  }

  loadZone(zoneName) {
    // Clear existing
    if (this.tileContainer) this.tileContainer.destroy();
    if (this.npcSprites) this.npcSprites.forEach(n => {
      n.sprite.destroy();
      if (n.marker) n.marker.destroy();
    });

    this.mapData = getMap(zoneName);
    this.parsedMap = parseMap(this.mapData);
    this.currentZone = zoneName;
    this.inventory.currentZone = zoneName;

    // Object tiles that are rendered on top of the floor tile
    const overlayTiles = new Set([
      'tile_plant', 'tile_cake', 'tile_table', 'tile_chair',
      'tile_chair_up', 'tile_chair_left', 'tile_chair_right',
      'tile_laadpaal', 'tile_art_quinn', 'tile_desk', 'tile_koffie',
      'tile_car_left', 'tile_car_right',
    ]);

    // Helper: get tile at position (for chair auto-rotation)
    const getTile = (tx, ty) => {
      if (ty >= 0 && ty < this.parsedMap.tiles.length && tx >= 0 && tx < this.parsedMap.tiles[ty].length) {
        return this.parsedMap.tiles[ty][tx];
      }
      return null;
    };
    const isTableOrDesk = (key) => key === 'tile_table' || key === 'tile_desk';

    // Render tiles
    this.tileContainer = this.add.container(0, 0);
    for (let y = 0; y < this.parsedMap.tiles.length; y++) {
      for (let x = 0; x < this.parsedMap.tiles[y].length; x++) {
        let tileKey = this.parsedMap.tiles[y][x];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        // Auto-rotate chairs toward adjacent table/desk
        if (tileKey === 'tile_chair') {
          const left = getTile(x - 1, y);
          const right = getTile(x + 1, y);
          const up = getTile(x, y - 1);
          const down = getTile(x, y + 1);
          if (isTableOrDesk(left)) tileKey = 'tile_chair_left';
          else if (isTableOrDesk(right)) tileKey = 'tile_chair_right';
          else if (isTableOrDesk(up)) tileKey = 'tile_chair_up';
          else if (isTableOrDesk(down)) tileKey = 'tile_chair';
          // default stays 'tile_chair' (facing down)
        }

        // Always render floor underneath object tiles
        if (overlayTiles.has(tileKey) && this.textures.exists(this.mapData.floorTile)) {
          const floor = this.add.image(px, py, this.mapData.floorTile);
          this.tileContainer.add(floor);
        }

        if (this.textures.exists(tileKey)) {
          const tile = this.add.image(px, py, tileKey);
          this.tileContainer.add(tile);
        } else {
          // Fallback colored rectangle
          const colors = {
            tile_wall: 0x455A64,
            tile_wall_glass: 0xB3E5FC,
            tile_desk: 0x795548,
            tile_chair: 0x37474F,
            tile_plant: 0x2E7D32,
            tile_water: 0x1565C0,
            tile_art_quinn: 0xFFD700,
            tile_counter: 0x6D4C41,
            tile_laadpaal: 0x4CAF50,
            tile_solar_panel: 0x1A237E,
            tile_car_left: 0x78909C,
            tile_car_right: 0x78909C,
            tile_door: 0xF57C00,
          };
          const color = colors[tileKey] || 0x888888;
          const rect = this.add.rectangle(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE, TILE_SIZE, color
          );
          this.tileContainer.add(rect);
        }

        // Encounter zone indicator
        if (this.parsedMap.encounters[y][x]) {
          const indicator = this.add.rectangle(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE, TILE_SIZE,
            0x4CAF50, 0.12
          );
          this.tileContainer.add(indicator);
        }
      }
    }

    // Render transition indicators with destination labels
    const doorZoneNames = {
      parkeerplaats: 'Parkeerplaats',
      entreecafe: 'Entreecafé',
      atrium: 'Atrium',
      kantoor: 'Kantoor',
      overlegruimtes: 'Overlegruimtes',
      collegezalen: 'Collegezalen',
      restaurant: 'Restaurant',
      sportruimtes: 'Sportruimtes',
      studios: "Mediastudio's",
      theater: 'Theater',
      parkeergarage: 'Parkeergarage',
      dakterras: 'Dakterras',
      directiekamer: 'Directiekamer',
    };
    this.parsedMap.transitionPoints.forEach(tp => {
      const tx = tp.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = tp.y * TILE_SIZE + TILE_SIZE / 2;

      const destName = doorZoneNames[tp.target] || tp.target;
      const locked = !this.inventory.isZoneUnlocked(tp.target);
      const labelText = locked ? `🔒 ${destName}` : `→ ${destName}`;
      const labelColor = locked ? '#EF9A9A' : '#ffffff';
      // Place label above door, but below door if it would go off-screen
      const aboveDoor = ty - 20 >= 0;
      const labelY = aboveDoor ? ty - 20 : ty + 20;
      const label = this.add.text(tx, labelY, labelText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: labelColor,
        backgroundColor: '#00529C',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(102);
      this.tileContainer.add(label);
    });

    // Place player
    if (this.playerSprite) this.playerSprite.destroy();

    const spawnX = this.spawnX ?? Math.floor(this.mapData.width / 2);
    const spawnY = this.spawnY ?? Math.floor(this.mapData.height / 2);
    // Find a walkable spawn point near the suggested position
    this.playerGridX = this.findWalkable(spawnX, spawnY).x;
    this.playerGridY = this.findWalkable(spawnX, spawnY).y;

    this.playerSprite = this.add.image(
      this.playerGridX * TILE_SIZE + TILE_SIZE / 2,
      this.playerGridY * TILE_SIZE + TILE_SIZE / 2,
      'player_down_0'
    ).setDepth(100);
    this.playerDir = 'down';
    this.animFrame = 0;

    // Reset spawn overrides
    this.spawnX = undefined;
    this.spawnY = undefined;

    // Place NPCs
    this.npcSprites = [];
    if (this.mapData.npcs) {
      this.mapData.npcs.forEach(npc => {
        const npcSprite = this.add.image(
          npc.x * TILE_SIZE + TILE_SIZE / 2,
          npc.y * TILE_SIZE + TILE_SIZE / 2,
          npc.sprite
        ).setDepth(99);

        // Exclamation mark for trainers not yet defeated
        let marker = null;
        if (npc.isTrainer && !this.inventory.isTrainerDefeated(npc.id)) {
          marker = this.add.text(
            npc.x * TILE_SIZE + TILE_SIZE / 2,
            npc.y * TILE_SIZE - 8,
            '!',
            { fontFamily: 'Arial Black', fontSize: '18px', color: '#F57C00' }
          ).setOrigin(0.5).setDepth(101);
          this.tweens.add({
            targets: marker,
            y: marker.y - 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
          });
        }

        this.npcSprites.push({ ...npc, sprite: npcSprite, marker });
      });
    }

    // Camera
    const mapWidth = this.mapData.width * TILE_SIZE;
    const mapHeight = (this.mapData.tiles?.length || this.mapData.height) * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, Math.max(mapWidth, GAME_WIDTH), Math.max(mapHeight, GAME_HEIGHT));
    this.cameras.main.startFollow(this.playerSprite, true, 0.15, 0.15);

    // Update zone label
    const zoneNames = {
      parkeerplaats: '🅿️ Parkeerplaats',
      buitentuin: '🌿 Buitentuin',
      entreecafe: '☕ Entreecafé',
      atrium: '🏛️ Atrium',
      kantoor: '💼 Kantoorvleugel',
      overlegruimtes: '🤝 Overlegruimtes',
      collegezalen: '📚 Collegezalen',
      restaurant: '🍽️ Restaurant',
      sportruimtes: '🏋️ Sportruimtes',
      studios: '🎬 Mediastudio\'s',
      theater: '🎭 AFAS Theater',
      parkeergarage: '🅿️ Parkeergarage (Ondergronds)',
      dakterras: '☀️ Dakterras (Zonnepanelen)',
      directiekamer: '👔 Directiekamer',
    };
    this.zoneLabel.setText(zoneNames[zoneName] || zoneName);

    // Flash zone label
    this.tweens.add({
      targets: this.zoneLabel,
      alpha: { from: 0, to: 1 },
      duration: 500,
      hold: 2000,
      yoyo: true,
      onComplete: () => { if (this.zoneLabel) this.zoneLabel.setAlpha(1); },
    });

    // Update quest label
    this.updateQuestLabel();
  }

  updateQuestLabel() {
    const quest = this.inventory.getCurrentQuest();
    this.questLabel.setText(`📋 ${quest.title}: ${quest.desc}`);
  }

  findWalkable(x, y) {
    if (this.isWalkable(x, y)) return { x, y };
    // Search nearby
    for (let r = 1; r < 5; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (this.isWalkable(x + dx, y + dy)) return { x: x + dx, y: y + dy };
        }
      }
    }
    return { x, y };
  }

  isWalkable(x, y) {
    if (!this.parsedMap.walkable[y] || this.parsedMap.walkable[y][x] === undefined) return false;
    if (!this.parsedMap.walkable[y][x]) return false;
    // Check NPC collision
    if (this.npcSprites?.some(n => n.x === x && n.y === y)) return false;
    return true;
  }

  update(time, delta) {
    if (this.isMoving || this.dialogSystem.isActive) return;

    let dx = 0, dy = 0, dir = this.playerDir;

    if (this.cursors.left.isDown || this.wasd.left.isDown) { dx = -1; dir = 'left'; }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) { dx = 1; dir = 'right'; }
    else if (this.cursors.up.isDown || this.wasd.up.isDown) { dy = -1; dir = 'up'; }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) { dy = 1; dir = 'down'; }

    if (dx !== 0 || dy !== 0) {
      this.playerDir = dir;
      const newX = this.playerGridX + dx;
      const newY = this.playerGridY + dy;

      if (this.isWalkable(newX, newY)) {
        this.movePlayer(newX, newY);
      } else {
        // Just update facing direction
        this.updatePlayerSprite();
      }
    }
  }

  movePlayer(newX, newY) {
    this.isMoving = true;
    this.playerGridX = newX;
    this.playerGridY = newY;

    // Animate sprite
    this.animFrame = (this.animFrame + 1) % 2;
    this.updatePlayerSprite();

    this.tweens.add({
      targets: this.playerSprite,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: this.moveSpeed,
      onComplete: () => {
        this.isMoving = false;
        this.checkTile();
      },
    });
  }

  updatePlayerSprite() {
    const key = `player_${this.playerDir}_${this.animFrame}`;
    if (this.textures.exists(key)) {
      this.playerSprite.setTexture(key);
    }
  }

  checkTile() {
    // Check transition
    const transition = this.parsedMap.transitionPoints.find(
      t => t.x === this.playerGridX && t.y === this.playerGridY
    );
    if (transition) {
      if (this.inventory.isZoneUnlocked(transition.target)) {
        this.transitionToZone(transition.target, transition.spawnX, transition.spawnY);
      } else {
        this.dialogSystem.show([
          { speaker: 'Systeem', text: 'Dit gebied is nog niet toegankelijk. Versla meer trainers om het te ontgrendelen.' },
        ]);
      }
      return;
    }

    // Check random encounter
    if (this.parsedMap.encounters[this.playerGridY]?.[this.playerGridX]) {
      if (Math.random() < this.mapData.encounterRate && this.inventory.team.length > 0) {
        this.triggerWildEncounter();
      }
    }
  }

  checkInteraction() {
    // Check adjacent tiles for NPCs
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    ];

    // Also check current tile
    dirs.push({ dx: 0, dy: 0 });

    for (const { dx, dy } of dirs) {
      const checkX = this.playerGridX + dx;
      const checkY = this.playerGridY + dy;

      const npc = this.npcSprites?.find(n => n.x === checkX && n.y === checkY);
      if (npc) {
        this.interactWithNPC(npc);
        return;
      }
    }

    // Check for NPCs behind a counter (distance 2, counter tile in between)
    for (const { dx, dy } of dirs) {
      if (dx === 0 && dy === 0) continue;
      const midX = this.playerGridX + dx;
      const midY = this.playerGridY + dy;
      const farX = this.playerGridX + dx * 2;
      const farY = this.playerGridY + dy * 2;
      if (midY >= 0 && midY < this.parsedMap.tiles.length &&
          midX >= 0 && midX < this.parsedMap.tiles[midY].length &&
          this.parsedMap.tiles[midY][midX] === 'tile_counter') {
        const npc = this.npcSprites?.find(n => n.x === farX && n.y === farY);
        if (npc) {
          this.interactWithNPC(npc);
          return;
        }
      }
    }

    // Check for koffieautomaat tile
    for (const { dx, dy } of dirs) {
      const checkX = this.playerGridX + dx;
      const checkY = this.playerGridY + dy;
      if (checkY >= 0 && checkY < this.parsedMap.tiles.length &&
          checkX >= 0 && checkX < this.parsedMap.tiles[checkY].length &&
          this.parsedMap.tiles[checkY][checkX] === 'tile_koffie') {
        this.dialogSystem.show([
          { speaker: 'Systeem', text: 'Je neemt een verse kop koffie. Het aroma vult de ruimte! ☕' },
          { speaker: 'Systeem', text: 'Je hele team voelt zich verfrist! Spel opgeslagen.' },
        ], () => {
          this.inventory.healTeam();
          this.saveGame();
          this.updateHUD();
        });
        return;
      }
    }
  }

  interactWithNPC(npc) {
    // Infobalie — dynamic quest-based dialog
    if (npc.isInfobalie) {
      const quest = this.inventory.getCurrentQuest();
      const firstName = npc.name.split(' ').pop();
      const hints = [
        { speaker: firstName, text: `Welkom bij de infobalie, {name}! Ik ben ${firstName}. Kan ik je ergens mee helpen?` },
        { speaker: firstName, text: `Je huidige missie: "${quest.title}"` },
        { speaker: firstName, text: quest.desc },
      ];
      this.dialogSystem.show(hints);
      return;
    }

    if (npc.givesStarter && !this.inventory.getFlag('got_starter')) {
      // Starter selection
      this.dialogSystem.show(npc.dialog, () => {
        this.showStarterSelection();
      });
      return;
    }

    if (npc.heals) {
      this.dialogSystem.show(npc.dialog, () => {
        this.inventory.healTeam();
        if (npc.saves) this.saveGame();
        this.updateHUD();
      });
      return;
    }

    if (npc.isTrainer) {
      if (this.inventory.isTrainerDefeated(npc.id)) {
        // Already defeated
        if (npc.defeatDialog) {
          this.dialogSystem.show([
            { speaker: npc.name.split(' ').pop(), text: 'Je hebt me al verslagen, {name}! Goed gedaan.' },
          ]);
        }
        return;
      }

      // Start trainer battle
      this.dialogSystem.show(npc.dialog, () => {
        if (this.inventory.team.length === 0) {
          this.dialogSystem.show([
            { speaker: 'Systeem', text: 'Je hebt nog geen AFASmon! Praat eerst met de receptionist.' },
          ]);
          return;
        }
        this.startTrainerBattle(npc);
      });
      return;
    }

    // Regular NPC dialog
    if (npc.dialog) {
      this.dialogSystem.show(npc.dialog);
    }
  }

  showStarterSelection() {
    const starters = [
      { key: 'profitron', name: 'Profitron', type: 'Doen (Aanval)', desc: 'Sterk in de aanval!' },
      { key: 'salarion', name: 'Salarion', type: 'Familie (Support)', desc: 'Goed in verdediging en herstel!' },
      { key: 'pocketon', name: 'Pocketon', type: 'Gek (Snelheid)', desc: 'Razendsnel en onvoorspelbaar!' },
    ];

    const container = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);

    // Overlay
    container.add(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7));

    // Title
    container.add(this.add.text(GAME_WIDTH / 2, 60, 'Kies je eerste AFASmon!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#F57C00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5));

    starters.forEach((starter, i) => {
      const x = 150 + i * 250;
      const y = GAME_HEIGHT / 2;

      // Card bg
      const card = this.add.rectangle(x, y, 200, 300, 0x1a1a4e, 0.9)
        .setStrokeStyle(2, COLORS.SECONDARY)
        .setInteractive({ useHandCursor: true });
      container.add(card);

      // Monster sprite
      const spriteKey = `${starter.key}_battle`;
      if (this.textures.exists(spriteKey)) {
        container.add(this.add.image(x, y - 70, spriteKey));
      }

      // Name
      container.add(this.add.text(x, y + 20, starter.name, {
        fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5));

      // Type
      container.add(this.add.text(x, y + 50, starter.type, {
        fontFamily: 'Arial', fontSize: '14px', color: '#B0BEC5',
      }).setOrigin(0.5));

      // Description
      container.add(this.add.text(x, y + 80, starter.desc, {
        fontFamily: 'Arial', fontSize: '12px', color: '#78909C',
        wordWrap: { width: 180 },
        align: 'center',
      }).setOrigin(0.5));

      card.on('pointerover', () => card.setStrokeStyle(3, COLORS.SECONDARY));
      card.on('pointerout', () => card.setStrokeStyle(2, COLORS.SECONDARY));
      card.on('pointerdown', () => {
        const mon = new AFASmon(starter.key, 5, { isWild: false });
        this.inventory.addToTeam(mon);
        this.inventory.setFlag('got_starter');
        container.destroy();

        this.dialogSystem.show([
          { speaker: 'Lisa', text: `Goede keuze, {name}! ${starter.name} zal je goed van pas komen.` },
          { speaker: 'Lisa', text: 'Ga nu naar de Kantoorvleugel — dat is links vanuit het Atrium. Daar zitten twee developers die je willen uitdagen!' },
          { speaker: 'Lisa', text: 'Versla trainers om nieuwe gebieden te ontgrendelen. Bij de deuren staat waar ze naartoe leiden.' },
          { speaker: 'Lisa', text: 'In het Restaurant rechts kun je altijd gratis herstellen. En vergeet de koffie-automaat hier niet!' },
          { speaker: 'Lisa', text: 'Druk op M om je team te bekijken. Veel succes, {name}! En pas op voor Relatiox — die healers zijn vervelend.' },
        ], () => {
          this.updateHUD();
          this.updateQuestLabel();
          this.saveGame();
        });
      });
    });
  }

  triggerWildEncounter() {
    const mons = this.mapData.encounterMons;
    if (!mons || mons.length === 0) return;

    const speciesKey = mons[Phaser.Math.Between(0, mons.length - 1)];
    const [minLevel, maxLevel] = this.mapData.encounterLevels;
    const level = Phaser.Math.Between(minLevel, maxLevel);

    const wildMon = new AFASmon(speciesKey, level, { isWild: true });

    // Battle transition effect
    this.cameras.main.flash(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(SCENES.BATTLE, {
        type: 'wild',
        enemy: wildMon,
        zone: this.currentZone,
        playerGridX: this.playerGridX,
        playerGridY: this.playerGridY,
      });
    });
  }

  startTrainerBattle(npc) {
    const enemyTeam = npc.team.map(t => new AFASmon(t.species, t.level, { isWild: false }));

    this.cameras.main.flash(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(SCENES.BATTLE, {
        type: 'trainer',
        trainerName: npc.name,
        trainerId: npc.id,
        enemyTeam,
        defeatDialog: npc.defeatDialog,
        reward: npc.reward,
        isBoss: npc.isBoss,
        zone: this.currentZone,
        playerGridX: this.playerGridX,
        playerGridY: this.playerGridY,
      });
    });
  }

  transitionToZone(zoneName, spawnX, spawnY) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.spawnX = spawnX;
      this.spawnY = spawnY;
      this.loadZone(zoneName);
      this.cameras.main.fadeIn(300, 0, 0, 0);
    });
  }

  showTeamMenu() {
    if (this.teamMenu) return;

    const container = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);
    this.teamMenu = container;

    // Overlay
    container.add(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8));

    // Title
    container.add(this.add.text(GAME_WIDTH / 2, 30, 'Je Team', {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#F57C00',
    }).setOrigin(0.5));

    // Team members
    this.inventory.team.forEach((mon, i) => {
      const y = 80 + i * 80;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 600, 70, 0x1a1a4e, 0.9)
        .setStrokeStyle(1, mon.isFainted ? 0xE53935 : 0x00529C);
      container.add(bg);

      // Sprite
      const spriteKey = `${mon.spriteKey}_icon`;
      if (this.textures.exists(spriteKey)) {
        container.add(this.add.image(130, y, spriteKey));
      }

      // Name & level
      container.add(this.add.text(160, y - 18, `${mon.name}  Lv.${mon.level}`, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      }));

      // Type
      container.add(this.add.text(160, y + 2, mon.type, {
        fontFamily: 'Arial', fontSize: '12px', color: '#B0BEC5',
      }));

      // HP bar
      const hpPercent = mon.getHpPercent();
      const hpColor = hpPercent > 0.5 ? 0x4CAF50 : hpPercent > 0.25 ? 0xFFC107 : 0xE53935;
      container.add(this.add.rectangle(500, y - 10, 150, 12, 0x333333).setStrokeStyle(1, 0x555555));
      container.add(this.add.rectangle(500 - 75 + (150 * hpPercent) / 2, y - 10, 150 * hpPercent, 10, hpColor).setOrigin(0, 0.5));
      container.add(this.add.text(500, y + 8, `${mon.currentHp}/${mon.maxHp} HP`, {
        fontFamily: 'Arial', fontSize: '11px', color: '#B0BEC5',
      }).setOrigin(0.5));
    });

    // Items
    const itemY = 80 + Math.max(this.inventory.team.length, 1) * 80 + 20;
    container.add(this.add.text(GAME_WIDTH / 2, itemY, 'Items', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#F57C00',
    }).setOrigin(0.5));

    container.add(this.add.text(GAME_WIDTH / 2, itemY + 30,
      `📋 Contracten: ${this.inventory.getItemCount('contract')}  |  ☕ Koffie: ${this.inventory.getItemCount('koffie')}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5));

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '[ESC / M] Sluiten', {
      fontFamily: 'Arial', fontSize: '16px', color: '#78909C',
    }).setOrigin(0.5);
    container.add(closeBtn);

    const closeMenu = () => {
      container.destroy();
      this.teamMenu = null;
    };

    this.input.keyboard.once('keydown-ESC', closeMenu);
    this.input.keyboard.once('keydown-M', closeMenu);
  }

  updateHUD() {
    this.hudContainer.removeAll(true);
    if (this.questLabel) this.updateQuestLabel();

    if (this.inventory.team.length === 0) return;

    const lead = this.inventory.team[0];
    if (!lead) return;

    // Small team indicator
    const bg = this.add.rectangle(0, 0, 200, 40, 0x000000, 0.6)
      .setOrigin(0, 0).setStrokeStyle(1, 0x00529C);
    this.hudContainer.add(bg);

    const nameText = this.add.text(8, 4, `${this.inventory.playerName} — ${lead.name} Lv.${lead.level}`, {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    });
    this.hudContainer.add(nameText);

    const hpPercent = lead.getHpPercent();
    const hpColor = hpPercent > 0.5 ? 0x4CAF50 : hpPercent > 0.25 ? 0xFFC107 : 0xE53935;
    const hpBg = this.add.rectangle(8, 24, 120, 8, 0x333333).setOrigin(0, 0);
    const hpBar = this.add.rectangle(8, 24, 120 * hpPercent, 8, hpColor).setOrigin(0, 0);
    const hpText = this.add.text(135, 21, `${lead.currentHp}/${lead.maxHp}`, {
      fontFamily: 'Arial', fontSize: '10px', color: '#B0BEC5',
    });
    this.hudContainer.add([hpBg, hpBar, hpText]);

    // Team count
    const teamCount = this.add.text(8, 36, `Team: ${this.inventory.team.filter(m => !m.isFainted).length}/${this.inventory.team.length}`, {
      fontFamily: 'Arial', fontSize: '10px', color: '#78909C',
    });
    this.hudContainer.add(teamCount);
  }

  saveGame() {
    const data = this.inventory.serialize();
    localStorage.setItem('afasmon_save', JSON.stringify(data));
  }

  regeneratePlayerSprite(shirtColor, hairColor) {
    const dirs = ['down', 'left', 'right', 'up'];
    dirs.forEach((dir) => {
      for (let frame = 0; frame < 2; frame++) {
        const key = `player_${dir}_${frame}`;
        if (this.textures.exists(key)) this.textures.remove(key);

        const g = this.make.graphics({ add: false });
        g.fillStyle(shirtColor);
        g.fillRoundedRect(6, 10, 20, 18, 3);
        g.fillStyle(0xFFDDB0);
        g.beginPath(); g.arc(16, 8, 7, 0, Math.PI * 2); g.closePath(); g.fillPath();
        g.fillStyle(hairColor);
        if (dir === 'down') { g.fillRect(9, 2, 14, 5); }
        else if (dir === 'up') { g.fillRect(9, 1, 14, 8); }
        else { g.fillRect(9, 2, 14, 5); g.fillRect(dir === 'left' ? 9 : 18, 2, 5, 7); }
        if (dir !== 'up') {
          g.fillStyle(0x000000);
          if (dir === 'down') { g.fillRect(12, 7, 2, 2); g.fillRect(18, 7, 2, 2); }
          else if (dir === 'left') { g.fillRect(11, 7, 2, 2); }
          else { g.fillRect(19, 7, 2, 2); }
        }
        g.fillStyle(0x333333);
        if (frame === 0) { g.fillRect(10, 28, 5, 4); g.fillRect(18, 28, 5, 4); }
        else { g.fillRect(8, 28, 5, 4); g.fillRect(20, 28, 5, 4); }
        g.generateTexture(key, TILE_SIZE, TILE_SIZE);
        g.destroy();
      }
    });
  }
}
