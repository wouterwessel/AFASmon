import { TILE_SIZE } from '../utils/constants.js';

// Map definitions for the AFAS Clubhuis
// Each map is a 2D array of tile keys
// Legend:
//   . = walkable floor (type depends on zone)
//   # = wall
//   G = glass wall
//   D = door/transition
//   K = desk
//   C = chair
//   P = plant
//   W = water/fountain
//   A = art/kunstwerk
//   R = counter (reception/restaurant)
//   L = laadpaal
//   S = solar panel
//   X = car
//   N = NPC spawn point (walkable)
//   E = encounter zone (walkable, random battles)
//   H = heal point
//   T = transition to another zone

const MAPS = {
  parkeerplaats: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_path',
    encounterRate: 0.06,
    encounterMons: ['pocketon'],
    encounterLevels: [3, 5],
    tiles: [
      '#########################',
      '#.......................#',
      '#..XX..XX..XX..XX..XX...#',
      '#.......................#',
      '#..XX..XX..LL..XX..XX...#',
      '#.......................#',
      '#..XX..LL..XX..XX..LL...#',
      '#.......................#',
      '#..XX..XX..XX..XX..XX...#',
      '#.......................#',
      '#..........A............#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#..........T............#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'buitentuin', spawnX: 12, spawnY: 1 },
    ],
    npcs: [],
  },

  buitentuin: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_outside',
    encounterRate: 0.08,
    encounterMons: ['pocketon', 'orderon'],
    encounterLevels: [3, 6],
    tiles: [
      '#########################',
      '#.......T...............#',
      '#...PPPP....PPPP........#',
      '#...P..P....P..P........#',
      '#...PPPP....PPPP........#',
      '#.......................#',
      '#.........A.............#',
      '#.......................#',
      '#..PP.............PP....#',
      '#..PP...WWWWW.....PP....#',
      '#.......WWWWW...........#',
      '#.......WWWWW...........#',
      '#.......................#',
      '#..PP...........PP......#',
      '#..PP...........PP......#',
      '#.......................#',
      '#...........T...........#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'parkeerplaats', spawnX: 12, spawnY: 14, index: 0 },
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 1, index: 1 },
    ],
    npcs: [],
  },

  atrium: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_atrium',
    encounterRate: 0,
    encounterMons: [],
    encounterLevels: [1, 1],
    tiles: [
      '#####GGG###T###GGG######',
      '#......................#',
      '#..R..........R........#',
      '#..R..........R........#',
      '#......................#',
      '#..N...................#',
      '#......................#',
      'T.......PPPP...........T',
      '#.......PWWP...........#',
      '#.......PWAP...........#',
      '#.......PPPP...........#',
      '#......................#',
      'T......................T',
      '#......................#',
      '#......................#',
      '#...........N..........#',
      '#......................#',
      '#####GGG#####GGG######.#',
      '########################',
    ],
    transitions: [
      { char: 'T', target: 'buitentuin', spawnX: 12, spawnY: 16, index: 0 },
      { char: 'T', target: 'kantoor', spawnX: 1, spawnY: 9, index: 1 },
      { char: 'T', target: 'restaurant', spawnX: 23, spawnY: 9, index: 2 },
      { char: 'T', target: 'collegezalen', spawnX: 12, spawnY: 1, index: 3 },
      { char: 'T', target: 'theater', spawnX: 12, spawnY: 1, index: 4 },
    ],
    npcs: [
      {
        id: 'receptionist',
        sprite: 'npc_receptionist',
        x: 5,
        y: 5,
        name: 'Lisa de Receptionist',
        dialog: [
          { speaker: 'Lisa', text: 'Welkom bij AFAS, nieuwe stagiair! Wat fijn dat je er bent!' },
          { speaker: 'Lisa', text: 'Het is hier een beetje... anders dan normaal vandaag. Onze softwaremodules zijn tot leven gekomen!' },
          { speaker: 'Lisa', text: 'We noemen ze AFASmon. Hier, neem dit Contract — daarmee kun je ze vangen.' },
          { speaker: 'Lisa', text: 'En hier is je eerste AFASmon om je te helpen. Kies maar!' },
        ],
        givesStarter: true,
        isTrainer: false,
      },
      {
        id: 'save_point',
        sprite: 'npc_consultant',
        x: 11,
        y: 15,
        name: 'Koffie-automaat',
        dialog: [
          { speaker: 'Systeem', text: 'Je neemt een slokje koffie. Je voelt je verfrist! Spel opgeslagen.' },
        ],
        heals: true,
        saves: true,
        isTrainer: false,
      },
    ],
  },

  kantoor: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.10,
    encounterMons: ['pocketon', 'projecto'],
    encounterLevels: [5, 8],
    tiles: [
      '#########################',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.......................#',
      '#.....N.................#',
      'T.....................N.T',
      '#.......................#',
      '#.......................#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.......................#',
      '#...........N...........#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 22, spawnY: 7, index: 0 },
      { char: 'T', target: 'overlegruimtes', spawnX: 1, spawnY: 9, index: 1 },
    ],
    npcs: [
      {
        id: 'junior_dev_1',
        sprite: 'npc_developer',
        x: 6,
        y: 7,
        name: 'Junior Developer Tim',
        dialog: [
          { speaker: 'Tim', text: 'Hey, jij bent de nieuwe stagiair? Laat eens zien wat je AFASmon kan!' },
        ],
        isTrainer: true,
        team: [{ species: 'pocketon', level: 6 }],
        defeatDialog: [
          { speaker: 'Tim', text: 'Wow, niet slecht! Je bent een natuurtalent.' },
        ],
        reward: { items: { contract: 2 }, unlocks: [] },
      },
      {
        id: 'junior_dev_2',
        sprite: 'npc_developer',
        x: 20,
        y: 8,
        name: 'Developer Cas',
        dialog: [
          { speaker: 'Cas', text: 'Ik werk aan de nieuwste features. Maar eerst... een battle!' },
        ],
        isTrainer: true,
        team: [{ species: 'pocketon', level: 7 }, { species: 'projecto', level: 6 }],
        defeatDialog: [
          { speaker: 'Cas', text: 'Prima gedaan! De overlegruimtes verderop zijn nu open voor je.' },
        ],
        reward: { items: { koffie: 2 }, unlocks: ['overlegruimtes'] },
      },
      {
        id: 'kantoor_consultant',
        sprite: 'npc_consultant',
        x: 11,
        y: 17,
        name: 'Consultant Mark',
        dialog: [
          { speaker: 'Mark', text: 'Tip: in het Restaurant kun je je team gratis laten herstellen! Rechts van het Atrium.' },
        ],
        isTrainer: false,
      },
    ],
  },

  overlegruimtes: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.08,
    encounterMons: ['projecto', 'relatiox'],
    encounterLevels: [7, 10],
    tiles: [
      '#########################',
      '#.....#.....#.....#.....#',
      '#.KCK.#.KCK.#.KCK.#.N...#',
      '#.....#.....#.....#.....#',
      '#.N...D.....D.....D.....#',
      '#.....#.....#.....#.....#',
      '###D########D####D####..#',
      '#.....................E.#',
      'T.......................T',
      '#.....................E.#',
      '###D########D####D####..#',
      '#.....#.....#.....#.....#',
      '#.N...D.....D.....D.....#',
      '#.KCK.#.KCK.#.KCK.#.....#',
      '#.....#.....#.....#.....#',
      '#########################',
      '#.....................E.#',
      '#..........T............#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'kantoor', spawnX: 22, spawnY: 8, index: 0 },
      { char: 'T', target: 'sportruimtes', spawnX: 1, spawnY: 9, index: 1 },
      { char: 'T', target: 'directiekamer', spawnX: 12, spawnY: 14, index: 2 },
    ],
    npcs: [
      {
        id: 'trainer_consultant',
        sprite: 'npc_consultant',
        x: 2,
        y: 4,
        name: 'Senior Consultant Sophie',
        dialog: [
          { speaker: 'Sophie', text: 'In een overleg moet je strategisch denken. Net als in een AFASmon-battle!' },
        ],
        isTrainer: true,
        team: [{ species: 'projecto', level: 9 }, { species: 'relatiox', level: 8 }],
        defeatDialog: [
          { speaker: 'Sophie', text: 'Goed plan! De sportruimtes zijn nu ook bereikbaar.' },
        ],
        reward: { items: { contract: 3 }, unlocks: ['sportruimtes', 'studios'] },
      },
      {
        id: 'trainer_support',
        sprite: 'npc_support',
        x: 21,
        y: 2,
        name: 'Support Medewerker Bertine',
        dialog: [
          { speaker: 'Bertine', text: 'Bij support lossen we elk probleem op. Jouw AFASmon ook?' },
        ],
        isTrainer: true,
        team: [{ species: 'salarion', level: 10 }, { species: 'projecto', level: 9 }],
        defeatDialog: [
          { speaker: 'Bertine', text: 'Netjes opgelost! Ga je eens melden bij de collegezalen.' },
        ],
        reward: { items: { koffie: 3 }, unlocks: ['collegezalen'] },
      },
      {
        id: 'hint_npc',
        sprite: 'npc_consultant',
        x: 2,
        y: 12,
        name: 'Collega Arthur',
        dialog: [
          { speaker: 'Arthur', text: 'Wist je dat het type-systeem werkt als een cirkel? Doen > Vertrouwen > Gek > Familie > Doen!' },
        ],
        isTrainer: false,
      },
    ],
  },

  collegezalen: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_atrium',
    encounterRate: 0.10,
    encounterMons: ['profitron', 'salarion'],
    encounterLevels: [8, 12],
    tiles: [
      '#########################',
      '#...........T...........#',
      '#.......................#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#.......................#',
      '#........N..............#',
      '#.......................#',
      '#####DDDDD##DDDDD#####..#',
      '#.......................#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#.......................#',
      '#.............N.........#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 16, index: 0 },
    ],
    npcs: [
      {
        id: 'trainer_opleiding',
        sprite: 'npc_trainer',
        x: 8,
        y: 7,
        name: 'Trainer Herman',
        dialog: [
          { speaker: 'Herman', text: 'Welkom bij de opleiding! Hier leer je alles over AFASmon-types.' },
          { speaker: 'Herman', text: 'Doen is sterk tegen Vertrouwen, maar zwak tegen Familie.' },
          { speaker: 'Herman', text: 'Laat maar zien wat je geleerd hebt!' },
        ],
        isTrainer: true,
        team: [
          { species: 'profitron', level: 11 },
          { species: 'salarion', level: 11 },
          { species: 'orderon', level: 10 },
        ],
        defeatDialog: [
          { speaker: 'Herman', text: 'Uitstekend! Je hebt de theorie goed begrepen. Het theater is nu bereikbaar!' },
        ],
        reward: { items: { contract: 5, koffie: 3 }, unlocks: ['theater', 'parkeergarage'] },
      },
      {
        id: 'trainer_opleiding_2',
        sprite: 'npc_trainer',
        x: 13,
        y: 15,
        name: 'Cursusleider Manouk',
        dialog: [
          { speaker: 'Manouk', text: 'In mijn cursus leer je pas écht vechten. Klaar?' },
        ],
        isTrainer: true,
        team: [
          { species: 'relatiox', level: 12 },
          { species: 'workflox', level: 11 },
        ],
        defeatDialog: [
          { speaker: 'Manouk', text: 'Knap gedaan! Je bent klaar voor het echte werk.' },
        ],
        reward: { items: { contract: 3 }, unlocks: [] },
      },
    ],
  },

  restaurant: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_restaurant',
    encounterRate: 0.05,
    encounterMons: ['salarion'],
    encounterLevels: [5, 8],
    tiles: [
      '#########################',
      '#.....................H.#',
      '#..RRRRRR...............#',
      '#..RRRRRR.....KCKCKCKE..#',
      '#.....................E.#',
      '#.............KCKCKCKE..#',
      '#.......................#',
      '#....N..........KCKCKE..#',
      'T.......................#',
      '#.............KCKCKCKE..#',
      '#.....................E.#',
      '#.............KCKCKCKE..#',
      '#.......................#',
      '#.....................E.#',
      '#..PPPP.........KCKCKE..#',
      '#..PPPP.................#',
      '#..PPPP....N............#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 1, spawnY: 12, index: 0 },
    ],
    npcs: [
      {
        id: 'chef',
        sprite: 'npc_support',
        x: 5,
        y: 7,
        name: 'Chef-kok',
        dialog: [
          { speaker: 'Chef-kok', text: 'Welkom in het restaurant! Hier kun je je team volledig laten herstellen.' },
          { speaker: 'Chef-kok', text: 'Geniet van een maaltijd — op kosten van AFAS natuurlijk!' },
          { speaker: 'Systeem', text: 'Je hele team is volledig hersteld!' },
        ],
        heals: true,
        isTrainer: false,
      },
      {
        id: 'restaurant_npc',
        sprite: 'npc_marketing',
        x: 11,
        y: 16,
        name: 'Collega Britt',
        dialog: [
          { speaker: 'Britt', text: 'Wist je dat AFAS een van de duurzaamste kantoren van Nederland heeft?' },
          { speaker: 'Britt', text: 'Met meer dan 1000 zonnepanelen op het dak en 100 laadpalen!' },
        ],
        isTrainer: false,
      },
    ],
  },

  sportruimtes: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_sport',
    encounterRate: 0.12,
    encounterMons: ['orderon', 'pocketon'],
    encounterLevels: [8, 12],
    tiles: [
      '#########################',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#.......................#',
      '#.....N.................#',
      'T.....................N.#',
      '#.......................#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'overlegruimtes', spawnX: 22, spawnY: 8, index: 0 },
    ],
    npcs: [
      {
        id: 'sport_trainer',
        sprite: 'npc_trainer',
        x: 6,
        y: 7,
        name: 'Fitness Trainer Lars',
        dialog: [
          { speaker: 'Lars', text: 'Training maakt je AFASmon sterker! Maar eerst moet je MIJ verslaan!' },
        ],
        isTrainer: true,
        team: [
          { species: 'orderon', level: 12 },
          { species: 'pocketon', level: 13 },
        ],
        defeatDialog: [
          { speaker: 'Lars', text: 'Sterk! Je AFASmon zijn in topvorm.' },
        ],
        reward: { items: { koffie: 5 }, unlocks: [] },
      },
      {
        id: 'sport_hint',
        sprite: 'npc_consultant',
        x: 20,
        y: 8,
        name: 'Sportief Collega',
        dialog: [
          { speaker: 'Collega', text: 'In de encounter zones (het grasveld) kun je wilde AFASmon tegenkomen!' },
          { speaker: 'Collega', text: 'Loop er rond om ze te vinden en te vangen met een Contract.' },
        ],
        isTrainer: false,
      },
    ],
  },

  studios: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.08,
    encounterMons: ['relatiox', 'workflox'],
    encounterLevels: [8, 12],
    tiles: [
      '#########################',
      '#..KK...#..KK...#..KK...#',
      '#.......#.......#.......#',
      '#..KK...#..KK...#..KK...#',
      '#...D...#...D...#...D...#',
      '#.......................#',
      '#..........N............#',
      '#.......................#',
      'T.......................#',
      '#.......................#',
      '#.......................#',
      '#..KK...#..KK...#..KK...#',
      '#.......#.......#.......#',
      '#..KK.N.#..KK...#..KK...#',
      '#...D...#...D...#...D...#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 1, spawnY: 7, index: 0 },
    ],
    npcs: [
      {
        id: 'marketing_trainer',
        sprite: 'npc_marketing',
        x: 10,
        y: 6,
        name: 'Marketing Manager Martijn',
        dialog: [
          { speaker: 'Martijn', text: 'In de studio maken we de mooiste content. Maar mijn AFASmon zijn nog mooier!' },
        ],
        isTrainer: true,
        team: [
          { species: 'relatiox', level: 11 },
          { species: 'pocketon', level: 12 },
        ],
        defeatDialog: [
          { speaker: 'Martijn', text: 'Dat was... content-waardig! Goed gedaan.' },
        ],
        reward: { items: { contract: 3 }, unlocks: [] },
      },
      {
        id: 'studio_hint',
        sprite: 'npc_developer',
        x: 6,
        y: 13,
        name: 'Videograaf Joren',
        dialog: [
          { speaker: 'Joren', text: 'Relatiox is hier vaak te vinden. Het is een Vertrouwen-type — sterk tegen Gek!' },
        ],
        isTrainer: false,
      },
    ],
  },

  theater: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_theater',
    encounterRate: 0.08,
    encounterMons: ['workflox', 'profitron'],
    encounterLevels: [10, 14],
    tiles: [
      '#########################',
      '#...........T...........#',
      '#.......................#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#........A..............#',
      '#.......................#',
      '#.........N.............#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#..........T............#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 13, index: 0 },
      { char: 'T', target: 'parkeergarage', spawnX: 12, spawnY: 1, index: 1 },
    ],
    npcs: [
      {
        id: 'theater_boss',
        sprite: 'npc_trainer',
        x: 9,
        y: 13,
        name: 'Theaterregisseur Mohamed',
        dialog: [
          { speaker: 'Mohamed', text: 'Het AFAS Theater biedt plek aan 850 bezoekers. Maar nu is het podium voor ons!' },
          { speaker: 'Mohamed', text: 'Dit wordt de show van je leven!' },
        ],
        isTrainer: true,
        team: [
          { species: 'workflox', level: 14 },
          { species: 'profitron', level: 13 },
          { species: 'salarion', level: 14 },
        ],
        defeatDialog: [
          { speaker: 'Mohamed', text: 'Bravo! Standing ovation! Je bent klaar voor de directiekamer.' },
        ],
        reward: { items: { contract: 5, koffie: 5 }, unlocks: ['directiekamer', 'dakterras'] },
      },
    ],
  },

  parkeergarage: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_garage',
    encounterRate: 0.15,
    encounterMons: ['workflox', 'orderon', 'pocketon'],
    encounterLevels: [10, 15],
    tiles: [
      '#########################',
      '#...........T...........#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#..XX..XX..XX..XX..XX...#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'theater', spawnX: 12, spawnY: 16, index: 0 },
    ],
    npcs: [],
  },

  dakterras: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_path',
    encounterRate: 0.12,
    encounterMons: ['profitron', 'relatiox', 'workflox'],
    encounterLevels: [12, 16],
    tiles: [
      '#########################',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#.......................#',
      '#..........T............#',
      '#.......................#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#SSSSSSSSSSSSSSSSSSSSSE.#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE..#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 2, index: 0 },
    ],
    npcs: [],
  },

  directiekamer: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_atrium',
    encounterRate: 0,
    encounterMons: [],
    encounterLevels: [1, 1],
    tiles: [
      '#########################',
      '#.....................A.#',
      '#.......................#',
      '#..KKKKKKKKKKKKKKKKK....#',
      '#..CCCCCCCCCCCCCCCCC....#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#.........N.............#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#..........T............#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'overlegruimtes', spawnX: 12, spawnY: 2, index: 0 },
    ],
    npcs: [
      {
        id: 'ceo_boss',
        sprite: 'npc_ceo',
        x: 9,
        y: 8,
        name: 'CEO Bas van der Veldt',
        dialog: [
          { speaker: 'Bas', text: 'Ah, daar ben je! Ik heb gehoord dat je alle trainers hebt verslagen.' },
          { speaker: 'Bas', text: 'Bij AFAS geloven we in vier kernwaarden: Doen, Vertrouwen, Gek en Familie.' },
          { speaker: 'Bas', text: 'Laat zien dat je die waarden beheerst in dit laatste gevecht!' },
          { speaker: 'Bas', text: 'Als je wint, krijg je je vaste aanstelling. En misschien... een heel bijzondere AFASmon.' },
        ],
        isTrainer: true,
        isBoss: true,
        team: [
          { species: 'profitron', level: 18 },
          { species: 'workflox', level: 18 },
          { species: 'salarion', level: 19 },
          { species: 'innovaxx', level: 20 },
        ],
        defeatDialog: [
          { speaker: 'Bas', text: 'Ongelooflijk! Je hebt het gedaan!' },
          { speaker: 'Bas', text: 'Gefeliciteerd met je vaste aanstelling bij AFAS Software!' },
          { speaker: 'Bas', text: 'En hier — Innovaxx is nu van jou. Zorg er goed voor.' },
          { speaker: 'Systeem', text: 'Je hebt Innovaxx gekregen! 🎉' },
          { speaker: 'Systeem', text: 'Gefeliciteerd! Je hebt AFASmon uitgespeeld! Bedankt voor het spelen!' },
        ],
        reward: { items: {}, unlocks: [], givesInnovaxx: true },
      },
    ],
  },
};

export function getMap(zoneName) {
  return MAPS[zoneName] || MAPS.parkeerplaats;
}

export function parseMap(mapData) {
  const tiles = [];
  const walkable = [];
  const encounters = [];
  const transitionPoints = [];

  const transitionIndex = {};

  for (let y = 0; y < mapData.tiles.length; y++) {
    const row = mapData.tiles[y];
    tiles[y] = [];
    walkable[y] = [];
    encounters[y] = [];

    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      let tileKey = mapData.floorTile;
      let isWalkable = true;
      let isEncounter = false;

      switch (char) {
        case '#': tileKey = 'tile_wall'; isWalkable = false; break;
        case 'G': tileKey = 'tile_wall_glass'; isWalkable = false; break;
        case 'K': tileKey = 'tile_desk'; isWalkable = false; break;
        case 'C': tileKey = 'tile_chair'; isWalkable = true; break;
        case 'P': tileKey = 'tile_plant'; isWalkable = false; break;
        case 'W': tileKey = 'tile_water'; isWalkable = false; break;
        case 'A': tileKey = 'tile_art_quinn'; isWalkable = true; break;
        case 'R': tileKey = 'tile_counter'; isWalkable = false; break;
        case 'L': tileKey = 'tile_laadpaal'; isWalkable = false; break;
        case 'S': tileKey = 'tile_solar_panel'; isWalkable = false; break;
        case 'X': tileKey = 'tile_car'; isWalkable = false; break;
        case 'D': tileKey = mapData.floorTile; isWalkable = true; break;
        case 'N': tileKey = mapData.floorTile; isWalkable = true; break;
        case 'H': tileKey = mapData.floorTile; isWalkable = true; break;
        case 'E':
          tileKey = mapData.floorTile;
          isWalkable = true;
          isEncounter = true;
          break;
        case 'T':
          tileKey = 'tile_door';
          isWalkable = true;
          if (!transitionIndex[char]) transitionIndex[char] = 0;
          const tIdx = transitionIndex[char]++;
          const transition = mapData.transitions[tIdx];
          if (transition) {
            transitionPoints.push({ x, y, ...transition });
          }
          break;
        case '.': tileKey = mapData.floorTile; break;
        default: tileKey = mapData.floorTile; break;
      }

      tiles[y][x] = tileKey;
      walkable[y][x] = isWalkable;
      encounters[y][x] = isEncounter;
    }
  }

  return { tiles, walkable, encounters, transitionPoints };
}

export default MAPS;
