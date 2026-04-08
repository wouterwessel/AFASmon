import { AFASmon } from '../entities/AFASmon.js';
import { MAX_TEAM_SIZE } from '../utils/constants.js';

export class InventorySystem {
  constructor() {
    this.team = [];
    this.items = {
      contract: 5,
      koffie: 3,
    };
    this.defeatedTrainers = [];
    this.unlockedZones = ['parkeerplaats', 'atrium', 'kantoor', 'restaurant', 'collegezalen'];
    this.badges = [];
    this.currentZone = 'parkeerplaats';
    this.storyFlags = {};
  }

  addToTeam(afasmon) {
    if (this.team.length >= MAX_TEAM_SIZE) return false;
    afasmon.isWild = false;
    this.team.push(afasmon);
    return true;
  }

  removeFromTeam(index) {
    if (this.team.length <= 1) return false;
    this.team.splice(index, 1);
    return true;
  }

  getFirstAlive() {
    return this.team.find(m => !m.isFainted);
  }

  hasAliveTeamMember() {
    return this.team.some(m => !m.isFainted);
  }

  healTeam() {
    this.team.forEach(m => m.fullHeal());
  }

  useItem(itemKey) {
    if (!this.items[itemKey] || this.items[itemKey] <= 0) return false;
    this.items[itemKey]--;
    return true;
  }

  addItem(itemKey, amount = 1) {
    this.items[itemKey] = (this.items[itemKey] || 0) + amount;
  }

  getItemCount(itemKey) {
    return this.items[itemKey] || 0;
  }

  unlockZone(zone) {
    if (!this.unlockedZones.includes(zone)) {
      this.unlockedZones.push(zone);
    }
  }

  isZoneUnlocked(zone) {
    return this.unlockedZones.includes(zone);
  }

  markTrainerDefeated(trainerId) {
    if (!this.defeatedTrainers.includes(trainerId)) {
      this.defeatedTrainers.push(trainerId);
    }
  }

  isTrainerDefeated(trainerId) {
    return this.defeatedTrainers.includes(trainerId);
  }

  setFlag(flag, value = true) {
    this.storyFlags[flag] = value;
  }

  getFlag(flag) {
    return this.storyFlags[flag] || false;
  }

  serialize() {
    return {
      team: this.team.map(m => m.serialize()),
      items: { ...this.items },
      defeatedTrainers: [...this.defeatedTrainers],
      unlockedZones: [...this.unlockedZones],
      badges: [...this.badges],
      currentZone: this.currentZone,
      storyFlags: { ...this.storyFlags },
    };
  }

  static deserialize(data) {
    const inv = new InventorySystem();
    inv.team = data.team.map(d => AFASmon.deserialize(d));
    inv.items = data.items;
    inv.defeatedTrainers = data.defeatedTrainers;
    inv.unlockedZones = data.unlockedZones;
    inv.badges = data.badges;
    inv.currentZone = data.currentZone;
    inv.storyFlags = data.storyFlags || {};
    return inv;
  }
}
