import { TYPE_CHART } from '../utils/constants.js';

export class BattleSystem {
  constructor() {
    this.log = [];
  }

  calculateDamage(attacker, defender, move) {
    if (move.power === 0) return 0;

    const atkStat = attacker.getEffectiveStat('attack');
    const defStat = defender.getEffectiveStat('defense');
    const level = attacker.level;

    // Pokémon-style damage formula (boosted for faster battles)
    const baseDamage = ((2 * level / 5 + 2) * move.power * (atkStat / defStat)) / 30 + 2;

    // Type effectiveness
    const effectiveness = this.getTypeEffectiveness(move.type, defender.type);

    // STAB (Same Type Attack Bonus)
    const stab = (move.type === attacker.type) ? 1.3 : 1.0;

    // Random factor (85-100%)
    const random = 0.85 + Math.random() * 0.15;

    // Crit chance (GEK type gets higher crit rate)
    const critRate = attacker.type === 'GEK' ? 0.15 : 0.0625;
    const crit = Math.random() < critRate ? 1.5 : 1.0;

    return Math.max(1, Math.floor(baseDamage * effectiveness * stab * random * crit));
  }

  getTypeEffectiveness(moveType, defenderType) {
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][defenderType] !== undefined) {
      return TYPE_CHART[moveType][defenderType];
    }
    return 1.0;
  }

  getEffectivenessText(moveType, defenderType) {
    const eff = this.getTypeEffectiveness(moveType, defenderType);
    if (eff >= 1.5) return 'Het is super effectief!';
    if (eff <= 0.75) return 'Het is niet erg effectief...';
    return null;
  }

  determineTurnOrder(playerMon, enemyMon) {
    const pSpeed = playerMon.getEffectiveStat('speed');
    const eSpeed = enemyMon.getEffectiveStat('speed');
    if (pSpeed === eSpeed) return Math.random() < 0.5 ? 'player' : 'enemy';
    return pSpeed > eSpeed ? 'player' : 'enemy';
  }

  executeMove(attacker, defender, move) {
    const results = [];

    // Check PP
    if (move.currentPp <= 0) {
      results.push({ type: 'message', text: `${move.name} heeft geen PP meer!` });
      return results;
    }

    move.currentPp--;

    // Accuracy check
    if (Math.random() * 100 > move.accuracy) {
      results.push({ type: 'message', text: `${attacker.name} gebruikt ${move.name}!` });
      results.push({ type: 'miss', text: 'De aanval mist!' });
      return results;
    }

    results.push({ type: 'message', text: `${attacker.name} gebruikt ${move.name}!` });

    // Apply damage
    if (move.power > 0) {
      const damage = this.calculateDamage(attacker, defender, move);
      const fainted = defender.takeDamage(damage);

      results.push({ type: 'damage', target: 'defender', amount: damage });

      const effText = this.getEffectivenessText(move.type, defender.type);
      if (effText) results.push({ type: 'effectiveness', text: effText });

      if (fainted) {
        results.push({ type: 'faint', target: 'defender', text: `${defender.name} is flauwgevallen!` });
      }
    }

    // Apply effects
    if (move.effect && Math.random() < Math.min(1.0, move.effect.chance || 1.0)) {
      switch (move.effect.type) {
        case 'buff':
          attacker.battleMods[move.effect.stat] = Math.min(6, attacker.battleMods[move.effect.stat] + move.effect.amount);
          results.push({
            type: 'stat_change',
            target: 'attacker',
            stat: move.effect.stat,
            amount: move.effect.amount,
            text: `${attacker.name}'s ${this.translateStat(move.effect.stat)} steeg!`,
          });
          break;

        case 'debuff':
          defender.battleMods[move.effect.stat] = Math.max(-6, defender.battleMods[move.effect.stat] + move.effect.amount);
          results.push({
            type: 'stat_change',
            target: 'defender',
            stat: move.effect.stat,
            amount: move.effect.amount,
            text: `${defender.name}'s ${this.translateStat(move.effect.stat)} daalde!`,
          });
          break;

        case 'heal':
          attacker.heal(move.effect.amount);
          results.push({
            type: 'heal',
            target: 'attacker',
            amount: move.effect.amount,
            text: `${attacker.name} herstelde ${move.effect.amount} HP!`,
          });
          break;

        case 'recoil':
          attacker.takeDamage(move.effect.amount);
          results.push({
            type: 'recoil',
            target: 'attacker',
            amount: move.effect.amount,
            text: `${attacker.name} nam ${move.effect.amount} terugslag-schade!`,
          });
          break;
      }
    }

    return results;
  }

  calculateCatchChance(targetMon, currentHp) {
    const hpPercent = currentHp / targetMon.maxHp;
    const baseCatch = targetMon.catchRate;
    // Lower HP = higher catch chance
    const hpModifier = 1 + (1 - hpPercent) * 2;
    const chance = Math.min(0.95, baseCatch * hpModifier);
    return chance;
  }

  attemptCatch(targetMon) {
    const chance = this.calculateCatchChance(targetMon, targetMon.currentHp);
    const roll = Math.random();

    if (roll < chance) {
      return { success: true, shakes: 3 };
    }
    // Number of shakes before breaking free
    const shakes = roll < chance * 3 ? 2 : roll < chance * 2 ? 1 : 0;
    return { success: false, shakes };
  }

  calculateXpGain(defeatedMon, isWild) {
    const base = defeatedMon.xpYield;
    const level = defeatedMon.level;
    const wildBonus = isWild ? 1.5 : 2.5;
    return Math.floor((base * level / 3) * wildBonus);
  }

  selectEnemyMove(enemyMon, playerMon) {
    const availableMoves = enemyMon.moves.filter(m => m.currentPp > 0);
    if (availableMoves.length === 0) {
      return { key: 'struggle', name: 'Worsteling', type: 'DOEN', power: 30, accuracy: 100, pp: 999, currentPp: 999, effect: { type: 'recoil', amount: 10 } };
    }

    // Simple AI: prefer super-effective moves, then highest power
    const scored = availableMoves.map(move => {
      let score = move.power || 20;
      const eff = this.getTypeEffectiveness(move.type, playerMon.type);
      score *= eff;
      // Only prefer heal moves when HP is actually low
      if (move.effect && move.effect.type === 'heal') {
        if (enemyMon.getHpPercent() < 0.35) {
          score += 40;
        } else {
          // Strongly discourage healing when HP is fine
          score *= 0.15;
        }
      }
      // Add some randomness
      score *= (0.7 + Math.random() * 0.6);
      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  translateStat(stat) {
    const translations = {
      attack: 'aanval',
      defense: 'verdediging',
      speed: 'snelheid',
      hp: 'HP',
    };
    return translations[stat] || stat;
  }
}
