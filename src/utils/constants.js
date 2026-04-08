// AFAS kleurenschema
export const COLORS = {
  PRIMARY: 0x00529C,      // AFAS Blauw
  SECONDARY: 0xF57C00,    // AFAS Oranje
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  DARK_BG: 0x0a0a2e,
  LIGHT_BG: 0xE8EEF4,
  SUCCESS: 0x4CAF50,
  DANGER: 0xE53935,
  HP_GREEN: 0x4CAF50,
  HP_YELLOW: 0xFFC107,
  HP_RED: 0xE53935,
  XP_BLUE: 0x2196F3,
  DOEN: 0xE53935,          // Rood - aanvalssterk
  VERTROUWEN: 0x2196F3,    // Blauw - defensief
  GEK: 0xAB47BC,           // Paars - onvoorspelbaar
  FAMILIE: 0x66BB6A,        // Groen - heal/support
  LEGENDARY: 0xFFD700,     // Goud
};

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;

export const MAX_TEAM_SIZE = 6;
export const MAX_MOVES = 4;
export const MAX_LEVEL = 50;
export const BASE_XP = 50;

export const TYPE_CHART = {
  // attacker -> defender -> multiplier
  DOEN:       { DOEN: 1.0, VERTROUWEN: 1.5, GEK: 0.75, FAMILIE: 0.75, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
  VERTROUWEN: { DOEN: 0.75, VERTROUWEN: 1.0, GEK: 1.5, FAMILIE: 0.75, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
  GEK:        { DOEN: 0.75, VERTROUWEN: 0.75, GEK: 1.0, FAMILIE: 1.5, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
  FAMILIE:    { DOEN: 1.5, VERTROUWEN: 0.75, GEK: 0.75, FAMILIE: 1.0, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
  NEUTRAAL:   { DOEN: 1.0, VERTROUWEN: 1.0, GEK: 1.0, FAMILIE: 1.0, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
  LEGENDARY:  { DOEN: 1.0, VERTROUWEN: 1.0, GEK: 1.0, FAMILIE: 1.0, NEUTRAAL: 1.0, LEGENDARY: 1.0 },
};

export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  CHARACTER_CREATE: 'CharacterCreateScene',
  WORLD: 'WorldScene',
  BATTLE: 'BattleScene',
  DIALOG: 'DialogScene',
};

// Map zones gebaseerd op echt AFAS Clubhuis
export const ZONES = {
  PARKEERPLAATS: 'parkeerplaats',
  BUITENTUIN: 'buitentuin',
  ENTREECAFE: 'entreecafe',
  ATRIUM: 'atrium',
  KANTOOR: 'kantoor',
  OVERLEGRUIMTES: 'overlegruimtes',
  COLLEGEZALEN: 'collegezalen',
  RESTAURANT: 'restaurant',
  SPORTRUIMTES: 'sportruimtes',
  STUDIOS: 'studios',
  THEATER: 'theater',
  PARKEERGARAGE: 'parkeergarage',
  DAKTERRAS: 'dakterras',
  DIRECTIEKAMER: 'directiekamer',
};
