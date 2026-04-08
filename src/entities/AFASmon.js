import afasmonData from '../data/afasmon.json';
import movesData from '../data/moves.json';
import { MAX_LEVEL, BASE_XP } from '../utils/constants.js';

export class AFASmon {
  constructor(speciesKey, level = 5, overrides = {}) {
    const species = afasmonData[speciesKey];
    if (!species) throw new Error(`Unknown AFASmon: ${speciesKey}`);

    this.speciesKey = speciesKey;
    this.id = species.id;
    this.name = overrides.nickname || species.name;
    this.type = species.type;
    this.description = species.description;
    this.spriteKey = species.spriteKey;
    this.catchRate = species.catchRate;
    this.xpYield = species.xpYield;

    this.level = Math.min(level, MAX_LEVEL);

    // Calculate stats based on level
    const bs = species.baseStats;
    this.baseStats = { ...bs };
    this.maxHp = this.calcStat(bs.hp);
    this.currentHp = overrides.currentHp ?? this.maxHp;
    this.attack = this.calcStat(bs.attack);
    this.defense = this.calcStat(bs.defense);
    this.speed = this.calcStat(bs.speed);

    // Temp battle modifiers (reset each battle)
    this.battleMods = { attack: 0, defense: 0, speed: 0 };

    // Moves (max 4)
    this.moves = species.moves.slice(0, 4).map(moveKey => {
      const moveData = movesData[moveKey];
      return {
        key: moveKey,
        ...moveData,
        currentPp: moveData.pp,
      };
    });

    // XP
    this.xp = overrides.xp || 0;
    this.xpToNextLevel = this.calcXpToNext();

    this.isWild = overrides.isWild ?? true;
    this.isFainted = this.currentHp <= 0;
  }

  calcStat(base) {
    return Math.floor(base * (1 + (this.level - 1) * 0.08));
  }

  getEffectiveStat(stat) {
    const base = this[stat];
    const mod = this.battleMods[stat] || 0;
    return Math.max(1, base + mod);
  }

  calcXpToNext() {
    return Math.floor(BASE_XP * Math.pow(this.level, 1.3));
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - Math.floor(amount));
    this.isFainted = this.currentHp <= 0;
    return this.isFainted;
  }

  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + Math.floor(amount));
    this.isFainted = false;
  }

  fullHeal() {
    this.currentHp = this.maxHp;
    this.isFainted = false;
    this.moves.forEach(m => { m.currentPp = m.pp; });
    this.resetBattleMods();
  }

  resetBattleMods() {
    this.battleMods = { attack: 0, defense: 0, speed: 0 };
  }

  gainXp(amount) {
    if (this.level >= MAX_LEVEL) return { leveled: false };

    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpToNextLevel && this.level < MAX_LEVEL) {
      this.xp -= this.xpToNextLevel;
      this.levelUp();
      leveled = true;
    }
    return { leveled, newLevel: this.level };
  }

  levelUp() {
    const oldMaxHp = this.maxHp;
    this.level++;
    this.maxHp = this.calcStat(this.baseStats.hp);
    this.attack = this.calcStat(this.baseStats.attack);
    this.defense = this.calcStat(this.baseStats.defense);
    this.speed = this.calcStat(this.baseStats.speed);
    this.xpToNextLevel = this.calcXpToNext();
    // Heal the HP difference
    this.currentHp += (this.maxHp - oldMaxHp);
  }

  getHpPercent() {
    return this.currentHp / this.maxHp;
  }

  serialize() {
    return {
      speciesKey: this.speciesKey,
      level: this.level,
      currentHp: this.currentHp,
      xp: this.xp,
      nickname: this.name !== afasmonData[this.speciesKey].name ? this.name : undefined,
      moves: this.moves.map(m => ({ key: m.key, currentPp: m.currentPp })),
    };
  }

  static deserialize(data) {
    const mon = new AFASmon(data.speciesKey, data.level, {
      currentHp: data.currentHp,
      xp: data.xp,
      nickname: data.nickname,
      isWild: false,
    });
    // Restore PP
    if (data.moves) {
      data.moves.forEach((savedMove, i) => {
        if (mon.moves[i]) {
          mon.moves[i].currentPp = savedMove.currentPp;
        }
      });
    }
    return mon;
  }
}
