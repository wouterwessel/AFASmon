import { AFASmon } from '../entities/AFASmon.js';
import { MAX_TEAM_SIZE } from '../utils/constants.js';

export class InventorySystem {
  constructor() {
    this.playerName = 'Speler';
    this.shirtColor = 0x00529C;
    this.hairColor = 0x4A3728;
    this.skinColor = 0xFFDDB0;
    this.gender = 'male';
    this.team = [];
    this.items = {
      contract: 5,
      koffie: 3,
    };
    this.defeatedTrainers = [];
    this.unlockedZones = ['parkeerplaats', 'entreecafe', 'atrium', 'kantoor', 'restaurant', 'collegezalen'];
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

  getCurrentQuest() {
    if (!this.getFlag('intro_done')) return { title: 'Welkom bij AFAS', desc: 'Loop naar het Entreecafé en praat met Lisa.' };
    if (!this.getFlag('got_starter')) return { title: 'Kies je AFASmon', desc: 'Praat met Lisa in het Entreecafé om je eerste AFASmon te kiezen.' };
    if (!this.isTrainerDefeated('junior_dev_1')) return { title: 'Eerste uitdaging', desc: 'Versla Tim in de Kantoorvleugel. (Links vanuit het Atrium)' };
    if (!this.isTrainerDefeated('junior_dev_2')) return { title: 'Bewijs jezelf', desc: 'Versla Cas in de Kantoorvleugel.' };
    if (!this.isTrainerDefeated('trainer_consultant')) return { title: 'Overleg!', desc: 'Versla Sophie in de Overlegruimtes. (Rechts van het Kantoor)' };
    if (!this.isTrainerDefeated('trainer_support')) return { title: 'Support nodig?', desc: 'Versla Bertine in de Overlegruimtes.' };
    if (!this.isTrainerDefeated('trainer_opleiding')) return { title: 'Terug naar school', desc: 'Versla Herman in de Collegezalen. (Zuid vanuit het Atrium)' };
    if (!this.isTrainerDefeated('theater_boss')) return { title: 'Showtime!', desc: 'Versla Mohamed in het AFAS Theater.' };
    if (!this.getFlag('garage_cleared')) return { title: 'Server Migratie', desc: 'Vind alle 3 Encryptiesleutels in de Parkeergarage!' };
    if (!this.isTrainerDefeated('ceo_boss')) return { title: 'De CEO wacht', desc: 'Ga naar de Directiekamer en versla Bas van der Veldt!' };
    return { title: 'Klaar!', desc: 'Je hebt het Clubhuis veroverd! Verken vrij rond.' };
  }

  hasAllGarageKeys() {
    return this.getFlag('garage_key_1') && this.getFlag('garage_key_2') && this.getFlag('garage_key_3');
  }

  serialize() {
    return {
      playerName: this.playerName,
      shirtColor: this.shirtColor,
      hairColor: this.hairColor,
      skinColor: this.skinColor,
      gender: this.gender,
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
    inv.playerName = data.playerName || 'Speler';
    inv.shirtColor = data.shirtColor ?? 0x00529C;
    inv.hairColor = data.hairColor ?? 0x4A3728;
    inv.skinColor = data.skinColor ?? 0xFFDDB0;
    inv.gender = data.gender ?? 'male';
    return inv;
  }
}
