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
//   X = car (left half)
//   Z = car (right half)
//   N = NPC spawn point (walkable)
//   E = encounter zone (walkable, random battles)
//   H = heal point
//   T = transition to another zone
//   V = vleugelpiano body (zwart)
//   F = vleugelpiano toetsen (front)
//   B = bar counter
//   Q = koffieautomaat
//   I = cake/taartjes vitrine
//   J = table

const MAPS = {
  parkeerplaats: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_path',
    encounterRate: 0.15,
    encounterMons: ['pocketon'],
    encounterLevels: [4, 6],
    tiles: [
      '#########################',
      '#.......................#',
      '#..XZ..XZ..XZ..XZ..XZ...#',
      '#.......................#',
      '#..XZ..XZ..LL..XZ..XZ...#',
      '#.......................#',
      '#..XZ..LL..XZ..XZ..LL...#',
      '#.......................#',
      '#..XZ..XZ..XZ..XZ..XZ...#',
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
      { char: 'T', target: 'entreecafe', spawnX: 11, spawnY: 12 },
    ],
    npcs: [],
  },

  buitentuin: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_outside',
    encounterRate: 0.18,
    encounterMons: ['pocketon', 'orderon'],
    encounterLevels: [4, 7],
    tiles: [
      '#########################',
      '#.......T...............#',
      '#...PPPP....PPPP........#',
      '#...P..P....P..P........#',
      '#...PPPP....PPPP........#',
      '#.......................#',
      '#.........A.............#',
      '#.......................#',
      '#..PP..EEEEEEEEE.PP....#',
      '#..PP..EEEEEEEEE.PP....#',
      '#......EEEEEEEEE........#',
      '#......EEEEEEEEE........#',
      '#.......................#',
      '#..PP.EEEEEEEE.PP......#',
      '#..PP.EEEEEEEE.PP......#',
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

  entreecafe: {
    width: 25,
    height: 15,
    floorTile: 'tile_floor_wood',
    encounterRate: 0,
    encounterMons: [],
    encounterLevels: [1, 1],
    tiles: [
      '#####GGGGG#T#GGGGG######',
      '#......................#',
      '#..BBBBBB......Q.......#',
      '#..N...........N.......#',
      '#......................#',
      '#...JCJ..JCJ..JCJ..P..#',
      '#........N.............#',
      '#...JCJ..JCJ..JCJ..P..#',
      '#......................#',
      '#..III..............P..#',
      '#......................#',
      '#..PP..............PP..#',
      '#......................#',
      '#...........T..........#',
      '########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 16 },
      { char: 'T', target: 'parkeerplaats', spawnX: 11, spawnY: 16 },
    ],
    npcs: [
      {
        id: 'receptionist',
        sprite: 'npc_receptionist',
        x: 3,
        y: 3,
        name: 'Lisa de Receptionist',
        dialog: [
          { speaker: 'Lisa', text: 'Welkom bij AFAS, {name}! Wat fijn dat je er bent! Ik ben Lisa, de receptionist.' },
          { speaker: 'Lisa', text: 'Oké, dit klinkt gek, maar onze softwaremodules zijn tot leven gekomen. We noemen ze AFASmon!' },
          { speaker: 'Lisa', text: 'Geen paniek — met een Contract kun je ze vangen. Hier, neem er een paar mee.' },
          { speaker: 'Lisa', text: 'Maar je hebt zelf ook een AFASmon nodig om te vechten. Kies er maar eentje!' },
        ],
        givesStarter: true,
        isTrainer: false,
      },
      {
        id: 'hospitality',
        sprite: 'npc_marketing_f',
        x: 9,
        y: 6,
        name: 'Hospitality Medewerker Esmee',
        dialog: [
          { speaker: 'Esmee', text: 'Hey {name}! Welkom in het Entreecafé! Ik ben Esmee van Hospitality.' },
          { speaker: 'Esmee', text: 'Dit is het hart van het Clubhuis — lekker koffie, taartjes, en gezelligheid.' },
          { speaker: 'Esmee', text: 'Loop door naar het noorden voor het Atrium. Daar kun je naar alle andere ruimtes!' },
          { speaker: 'Esmee', text: 'En vergeet de koffieautomaat niet — die herstelt je hele team gratis. ☕' },
        ],
        isTrainer: false,
      },
    ],
  },

  atrium: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_atrium',
    encounterRate: 0,
    encounterMons: [],
    encounterLevels: [1, 1],
    tiles: [
      '#####GGG#######GGG######',
      '#......................#',
      '#..PP..............PP..#',
      '#......................#',
      '#......................#',
      '#.....RRRRRRRR.........#',
      '#.....R......R.........#',
      'T.....R..N...R.........T',
      '#.....RRRRRRRR.........#',
      '#......................#',
      '#......................#',
      '#..PP..............PP..#',
      'T......................T',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#####GGG##T##GGG######.#',
      '########################',
    ],
    transitions: [
      { char: 'T', target: 'kantoor', spawnX: 0, spawnY: 8, index: 0 },
      { char: 'T', target: 'restaurant', spawnX: 0, spawnY: 8, index: 1 },
      { char: 'T', target: 'collegezalen', spawnX: 12, spawnY: 1, index: 2 },
      { char: 'T', target: 'theater', spawnX: 12, spawnY: 1, index: 3 },
      { char: 'T', target: 'entreecafe', spawnX: 12, spawnY: 1, index: 4 },
    ],
    npcs: [
      {
        id: 'infobalie',
        sprite: 'npc_receptionist',
        x: 10,
        y: 7,
        name: 'Receptionist Daniëlle',
        isInfobalie: true,
        isTrainer: false,
        dialog: [],
      },
    ],
  },

  kantoor: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.20,
    encounterMons: ['pocketon', 'projecto'],
    encounterLevels: [5, 9],
    tiles: [
      '#########################',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.......................#',
      '#.....N.........Q.......#',
      'T.....................N.T',
      '#.......................#',
      '#.......................#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#.....................E.#',
      '#...KCKCKCKCKCKCKCKCKE..#',
      '#...........Q...........#',
      '#...........N...........#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 0, spawnY: 7, index: 0 },
      { char: 'T', target: 'overlegruimtes', spawnX: 0, spawnY: 8, index: 1 },
    ],
    npcs: [
      {
        id: 'junior_dev_1',
        sprite: 'npc_developer',
        x: 6,
        y: 7,
        name: 'Junior Developer Tim',
        dialog: [
          { speaker: 'Tim', text: 'Hey {name}! Ik ben Tim, junior developer. Ik hoorde dat je net begonnen bent?' },
          { speaker: 'Tim', text: 'Hier bij het kantoor testen we onze AFASmon in de praktijk. Laat eens zien wat je kunt!' },
        ],
        isTrainer: true,
        team: [{ species: 'pocketon', level: 6 }],
        defeatDialog: [
          { speaker: 'Tim', text: 'Wow {name}, niet slecht voor een stagiair! Je Kopstoot is dodelijk.' },
          { speaker: 'Tim', text: 'Loop verder naar rechts — Cas zit daar ook. Die wil vast ook een potje!' },
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
          { speaker: 'Cas', text: 'Ah, {name}! Tim heeft het al over je gehad. Ik ben Cas — ik werk aan de nieuwste features.' },
          { speaker: 'Cas', text: 'Mijn code compileert tenminste wél op vrijdagmiddag. Kom maar op!' },
        ],
        isTrainer: true,
        team: [{ species: 'pocketon', level: 7 }, { species: 'projecto', level: 7 }],
        defeatDialog: [
          { speaker: 'Cas', text: 'Prima gedaan, {name}! Je hebt echt talent. Misschien wel meer dan sommige developers hier...' },
          { speaker: 'Cas', text: 'Aan de rechterkant van het kantoor is een deur naar de Overlegruimtes. Daar wachten Sophie en Bertine!' },
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
          { speaker: 'Mark', text: 'Hey {name}! Pro-tip: ga naar het Restaurant — rechts vanuit het Atrium.' },
          { speaker: 'Mark', text: 'Chef-kok Thijmen herstelt je hele team gratis. En het eten hier is echt top, eerlijk.' },
          { speaker: 'Mark', text: 'Oh, en Jan Vayne speelt er piano! Ja, dé Jan Vayne. Wel een beetje surrealistisch op de werkvloer.' },
        ],
        isTrainer: false,
      },
    ],
  },

  overlegruimtes: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.18,
    encounterMons: ['projecto', 'relatiox'],
    encounterLevels: [7, 11],
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
      '##########..D..##########',
      '#.......................#',
      '#..........T............#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'kantoor', spawnX: 24, spawnY: 8, index: 0 },
      { char: 'T', target: 'sportruimtes', spawnX: 0, spawnY: 8, index: 1 },
      { char: 'T', target: 'directiekamer', spawnX: 12, spawnY: 14, index: 2 },
    ],
    npcs: [
      {
        id: 'trainer_consultant',
        sprite: 'npc_consultant_f',
        x: 2,
        y: 4,
        name: 'Senior Consultant Sophie',
        dialog: [
          { speaker: 'Sophie', text: 'Welkom in de Overlegruimtes, {name}! Ik ben Sophie, senior consultant.' },
          { speaker: 'Sophie', text: 'In een overleg moet je strategisch denken. Net als in een AFASmon-battle! Laat maar zien.' },
        ],
        isTrainer: true,
        team: [{ species: 'projecto', level: 8 }, { species: 'relatiox', level: 8 }],
        defeatDialog: [
          { speaker: 'Sophie', text: 'Goed plan, {name}! Echt consultancy-waardig.' },
          { speaker: 'Sophie', text: 'De Sportruimtes en Mediastudio\'s zijn nu open! Ga terug naar het Atrium, of loop door via rechts.' },
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
          { speaker: 'Bertine', text: 'Hey {name}! Bij support lossen we élk probleem op — ook AFASmon-problemen!' },
          { speaker: 'Bertine', text: 'Ticket aangemaakt: "Stagiair denkt trainers te kunnen verslaan." Prioriteit: hoog.' },
        ],
        isTrainer: true,
        team: [{ species: 'salarion', level: 9 }, { species: 'projecto', level: 9 }],
        defeatDialog: [
          { speaker: 'Bertine', text: 'Ticket opgelost: "Stagiair kan inderdaad trainers verslaan." Status: goedgekeurd!' },
          { speaker: 'Bertine', text: 'De Collegezalen zijn nu open — terug via het Atrium, dan naar het zuiden. Trainer Herman wacht daar!' },
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
          { speaker: 'Arthur', text: 'Hey {name}! Weetje: het type-systeem werkt als een cirkel.' },
          { speaker: 'Arthur', text: 'Doen > Vertrouwen > Gek > Familie > Doen. Net als de AFAS-kernwaarden!' },
          { speaker: 'Arthur', text: 'En Kopstoot — die NEUTRAAL-move — werkt altijd even goed. Handig als je geen type-voordeel hebt.' },
        ],
        isTrainer: false,
      },
    ],
  },

  collegezalen: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_atrium',
    encounterRate: 0.20,
    encounterMons: ['profitron', 'salarion'],
    encounterLevels: [8, 13],
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
      { char: 'T', target: 'atrium', spawnX: 0, spawnY: 12, index: 0 },
    ],
    npcs: [
      {
        id: 'trainer_opleiding',
        sprite: 'npc_trainer',
        x: 8,
        y: 7,
        name: 'Trainer Herman',
        dialog: [
          { speaker: 'Herman', text: 'Welkom bij de opleiding, {name}! Ik ben Herman, en ik leer je alles over AFASmon-types.' },
          { speaker: 'Herman', text: 'Doen verslaat Vertrouwen, maar verliest van Familie. Onthoud de cirkel!' },
          { speaker: 'Herman', text: 'Examen tijd! Laat maar zien of je het snapt.' },
        ],
        isTrainer: true,
        team: [
          { species: 'profitron', level: 10 },
          { species: 'salarion', level: 10 },
          { species: 'orderon', level: 9 },
        ],
        defeatDialog: [
          { speaker: 'Herman', text: 'Uitstekend, {name}! Cum laude geslaagd! ...Oké, we geven hier geen diploma\'s, maar je snapt het.' },
          { speaker: 'Herman', text: 'Het AFAS Theater en de Parkeergarage zijn nu bereikbaar. Het Theater vind je links vanuit het Atrium.' },
        ],
        reward: { items: { contract: 5, koffie: 3 }, unlocks: ['theater', 'parkeergarage'] },
      },
      {
        id: 'trainer_opleiding_2',
        sprite: 'npc_trainer_f',
        x: 13,
        y: 15,
        name: 'Cursusleider Manouk',
        dialog: [
          { speaker: 'Manouk', text: 'In mijn cursus leer je pas écht vechten, {name}. Klaar voor een praktijkexamen?' },
        ],
        isTrainer: true,
        team: [
          { species: 'relatiox', level: 10 },
          { species: 'workflox', level: 10 },
        ],
        defeatDialog: [
          { speaker: 'Manouk', text: 'Knap gedaan, {name}! Je mag het certificaat "AFASmon Expert" op je LinkedIn zetten.' },
        ],
        reward: { items: { contract: 3 }, unlocks: [] },
      },
    ],
  },

  restaurant: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_restaurant',
    encounterRate: 0.15,
    encounterMons: ['salarion'],
    encounterLevels: [5, 9],
    tiles: [
      '#########################',
      '#..RRRRRR.........H.PP.#',
      '#..RRRRRR..............#',
      '#..N.......JC..JC......#',
      '#..........JC..JC......#',
      '#.......................#',
      '#..JC..JC....VV..JC.JC.#',
      '#..JC..JC...VVV..JC.JC.#',
      'T...........FFF........#',
      '#..JC..JC....N...JC.JC.#',
      '#..JC..JC........JC.JC.#',
      '#.......................#',
      '#..........JC..JC......#',
      '#..........JC..JC......#',
      '#..EEE..............EE.#',
      '#..EEE.........N....EE.#',
      '#.......................#',
      '#..PP...............PP.#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 23, spawnY: 7, index: 0 },
    ],
    npcs: [
      {
        id: 'chef',
        sprite: 'npc_chef',
        x: 3,
        y: 3,
        name: 'Chef-kok Thijmen',
        dialog: [
          { speaker: 'Thijmen', text: 'Welkom in het restaurant, {name}! Ik ben Thijmen, de chef-kok hier.' },
          { speaker: 'Thijmen', text: 'Bij AFAS eten alle medewerkers gratis. En jouw AFASmon ook!' },
          { speaker: 'Thijmen', text: 'Eén maaltijd van Thijmen en je team is weer helemaal fit. Eet smakelijk!' },
          { speaker: 'Systeem', text: 'Je hele team is volledig hersteld!' },
        ],
        heals: true,
        isTrainer: false,
      },
      {
        id: 'jan_vayne',
        sprite: 'npc_jan_vayne',
        x: 13,
        y: 9,
        name: 'Jan Vayne',
        dialog: [
          { speaker: 'Jan Vayne', text: 'Welkom... Ik ben Jan Vayne, huispianist van het AFAS restaurant.' },
          { speaker: 'Jan Vayne', text: 'Muziek brengt mensen samen. Net als goede software, toch? Of AFASmon-battles.' },
          { speaker: 'Jan Vayne', text: '*speelt een prachtige melodie op de vleugel* ...Jouw team voelt zich geïnspireerd!' },
        ],
        isTrainer: false,
      },
      {
        id: 'restaurant_npc',
        sprite: 'npc_marketing_f',
        x: 15,
        y: 15,
        name: 'Collega Britt',
        dialog: [
          { speaker: 'Britt', text: 'Hey {name}! Wist je dat het AFAS Clubhuis een van de duurzaamste kantoren van Nederland is?' },
          { speaker: 'Britt', text: 'Meer dan 1000 zonnepanelen op het dak, 100 laadpalen, en een eigen binnentuin!' },
          { speaker: 'Britt', text: 'Op het Dakterras kun je de zonnepanelen zien. Daar zweven ook sterke AFASmon rond!' },
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
    encounterLevels: [9, 13],
    tiles: [
      '#########################',
      '#..N....................#',
      '#.......................#',
      '#.###.###.###.###.###..#',
      '#.#...#...#...#...#....#',
      '#.#.#.#.#.#.#.#.#.#.#..#',
      '#...#...#...#...#...#..#',
      '#.###.###.###.###.###..#',
      'T.......................#',
      '#.###.###.###.###.###..#',
      '#...#...#...#...#...#..#',
      '#.#.#.#.#.#.#.#.#.#.#..#',
      '#.#...#...#...#...#....#',
      '#.###.###.###.###.###..#',
      '#.......................#',
      '#...........N...........#',
      '#..EEEEEEEEEEEEEEEEE...#',
      '#..EEEEEEEEEEEEEEEEE...#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'overlegruimtes', spawnX: 24, spawnY: 8, index: 0 },
    ],
    npcs: [
      {
        id: 'scrum_master',
        sprite: 'npc_trainer_f',
        x: 3,
        y: 1,
        name: 'Scrum Master Femke',
        dialog: [
          { speaker: 'Femke', text: 'Hey {name}! Ik ben Femke, Scrum Master. Welkom bij de Sprint Planning Obstakelrun!' },
          { speaker: 'Femke', text: 'Loop door het doolhof naar de finish — binnen 30 seconden! Druk E als je klaar bent.' },
        ],
        isTrainer: false,
        isSprintMaster: true,
      },
      {
        id: 'sprint_finish',
        sprite: 'npc_consultant',
        x: 11,
        y: 15,
        name: 'Finish Coordinator',
        dialog: [
          { speaker: 'Coordinator', text: 'Dit is de finish van de Sprint! Haal de tijd om beloningen te verdienen.' },
        ],
        isTrainer: false,
        isSprintFinish: true,
      },
    ],
  },

  studios: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_office',
    encounterRate: 0.18,
    encounterMons: ['relatiox', 'workflox'],
    encounterLevels: [9, 13],
    tiles: [
      '#########################',
      '#..KK...#..KK...#..KK..#',
      '#.......#.......#......#',
      '#..KK...#..KK...#..KK..#',
      '#...D...#...D...#...D..#',
      '#.......................#',
      '#..........N............#',
      '#.......................#',
      'T.......................#',
      '#.......................#',
      '#..........N............#',
      '#..KK...#..KK...#..KK..#',
      '#.......#.......#......#',
      '#..KK.N.#..KK...#..KK..#',
      '#...D...#...D...#...D..#',
      '#.......................#',
      '#EEEEEEEEEEEEEEEEEEEEE.#',
      '#EEEEEEEEEEEEEEEEEEEEE.#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 0, spawnY: 7, index: 0 },
    ],
    npcs: [
      {
        id: 'marketing_trainer',
        sprite: 'npc_marketing',
        x: 10,
        y: 6,
        name: 'Marketing Manager Martijn',
        dialog: [
          { speaker: 'Martijn', text: 'Welcome to the studio, {name}! Ik ben Martijn, marketing manager.' },
          { speaker: 'Martijn', text: 'Mijn AFASmon zijn net onze campagnes: visueel aantrekkelijk en moeilijk te weerstaan!' },
        ],
        isTrainer: true,
        team: [
          { species: 'relatiox', level: 10 },
          { species: 'pocketon', level: 10 },
        ],
        defeatDialog: [
          { speaker: 'Martijn', text: 'Oef — dat was geen goede ROI op mijn AFASmon-investering. Goed gespeeld, {name}!' },
        ],
        reward: { items: { contract: 3 }, unlocks: [] },
      },
      {
        id: 'qa_engineer',
        sprite: 'npc_developer',
        x: 10,
        y: 10,
        name: 'QA Engineer Priya',
        dialog: [
          { speaker: 'Priya', text: 'Hey {name}! Ik ben Priya, QA Engineer. Ik test alles — inclusief jouw kennis!' },
          { speaker: 'Priya', text: 'Wil je meedoen aan de "Bug Hunting" Quiz? 5 vragen over software en AFAS!' },
          { speaker: 'Priya', text: 'Fout antwoord = een wilde Workflox die je moet verslaan. Goed antwoord = beloningen!' },
        ],
        isTrainer: false,
        isQuizMaster: true,
      },
      {
        id: 'studio_hint',
        sprite: 'npc_developer',
        x: 6,
        y: 13,
        name: 'Videograaf Joren',
        dialog: [
          { speaker: 'Joren', text: 'Ik ben Joren, videograaf! Relatiox verschijnt hier vaak — Vertrouwen-type, sterk tegen Gek.' },
          { speaker: 'Joren', text: 'Tip: gebruik een Doen-type move om Relatiox snel te verslaan. Die healers zijn anders eindeloos!' },
        ],
        isTrainer: false,
      },
    ],
  },

  theater: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_theater',
    encounterRate: 0.20,
    encounterMons: ['workflox', 'profitron'],
    encounterLevels: [11, 15],
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
      { char: 'T', target: 'atrium', spawnX: 23, spawnY: 12, index: 0 },
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
          { speaker: 'Mohamed', text: 'Welkom in het AFAS Theater, {name}! Plaats voor 850 bezoekers — maar vandaag draait de show om ons!' },
          { speaker: 'Mohamed', text: 'Ik ben Mohamed, regisseur. Als je míj verslaat, mag je door naar de directiekamer...' },
          { speaker: 'Mohamed', text: 'En dan wacht CEO Bas op je. Met zijn legendarische Innovaxx. Eng? Een beetje.' },
        ],
        isTrainer: true,
        team: [
          { species: 'workflox', level: 12 },
          { species: 'profitron', level: 12 },
          { species: 'salarion', level: 13 },
        ],
        defeatDialog: [
          { speaker: 'Mohamed', text: 'Bravo, {name}! Standing ovation! Het publiek gaat uit zijn dak!' },
          { speaker: 'Mohamed', text: 'De Directiekamer en het Dakterras zijn nu open. De Directiekamer bereik je via de Overlegruimtes — deur aan de zuidkant.' },
          { speaker: 'Mohamed', text: 'Maar train eerst nog even op het Dakterras. Bas is echt geen makkelijke tegenstander...' },
        ],
        reward: { items: { contract: 5, koffie: 5 }, unlocks: ['directiekamer', 'dakterras'] },
      },
    ],
  },

  parkeergarage: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_garage',
    encounterRate: 0.25,
    encounterMons: ['workflox', 'orderon', 'pocketon'],
    encounterLevels: [11, 16],
    tiles: [
      '#########################',
      '#...........T...........#',
      '#.###.#####.#.#####.##.#',
      '#.#.........#.......#..#',
      '#.#.#######.###.###.#..#',
      '#...#.....#.....#.N....#',
      '#.###.###.#####.#.####.#',
      '#.#...#.........#......#',
      '#.#.###.###M###.####.#.#',
      '#.......#.....#........#',
      '#.####.##.###.##.####..#',
      '#......#..#M#..#.......#',
      '#.##.###..#.#..###.##..#',
      '#..#......#.#......#...#',
      '#..####.###.###.####.#.#',
      '#........E.M.E.........#',
      '#.N.....................#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'theater', spawnX: 11, spawnY: 17, index: 0 },
    ],
    npcs: [
      {
        id: 'devops_trainer',
        sprite: 'npc_trainer',
        x: 2,
        y: 16,
        name: 'DevOps Engineer Daan',
        dialog: [
          { speaker: 'Daan', text: 'Hey {name}! Ik ben Daan, DevOps Engineer. Welkom in de Server Migratie Doolhof!' },
          { speaker: 'Daan', text: 'Er liggen 3 Encryptiesleutels verborgen in dit doolhof. Vind ze allemaal!' },
          { speaker: 'Daan', text: 'Pas als je alle 3 sleutels hebt, is de server-migratie compleet.' },
          { speaker: 'Daan', text: 'Maar pas op — het wemelt hier van de wilde AFASmon!' },
        ],
        isTrainer: true,
        team: [
          { species: 'workflox', level: 14 },
          { species: 'orderon', level: 15 },
        ],
        defeatDialog: [
          { speaker: 'Daan', text: 'Wow, sterk! Jij bent klaar voor de cloud. Zoek nu de 3 Encryptiesleutels in het doolhof!' },
          { speaker: 'Daan', text: 'Interacteer met de server-racks (de blauwe blokken) om sleutels op te pakken.' },
        ],
        reward: { items: { koffie: 3 }, unlocks: [] },
      },
      {
        id: 'sysadmin_hint',
        sprite: 'npc_consultant',
        x: 19,
        y: 5,
        name: 'Sysadmin Rick',
        dialog: [
          { speaker: 'Rick', text: 'Ik ben Rick, sysadmin. De encryptiesleutels zitten verborgen bij de server-racks.' },
          { speaker: 'Rick', text: 'Je herkent de racks aan de blauwe kleur. Loop ernaartoe en druk E!' },
        ],
        isTrainer: false,
      },
    ],
  },

  dakterras: {
    width: 25,
    height: 19,
    floorTile: 'tile_floor_path',
    encounterRate: 0.22,
    encounterMons: ['profitron', 'relatiox', 'workflox'],
    encounterLevels: [13, 17],
    tiles: [
      '#########################',
      '#SSSSSSSSSSSSSSSSSSSS.N.#',
      '#SSSSSSSSSSSSSSSSSSSS...#',
      '#.......................#',
      '#..SS..EEEEEEEEEEE.SS..#',
      '#..SS..EEEEEEEEEEE.SS..#',
      '#......EEEEEEEEEEE.....#',
      '#......EEEEEEEEEEE.....#',
      '#..SS..EEEEEEEEEEE.SS..#',
      '#..SS..EEEEEEEEEEE.SS..#',
      '#..........T............#',
      '#.......................#',
      '#..SS...............SS..#',
      '#..SS...............SS..#',
      '#.......................#',
      '#..SS...............SS..#',
      '#..SS...............SS..#',
      '#.......................#',
      '#########################',
    ],
    transitions: [
      { char: 'T', target: 'atrium', spawnX: 12, spawnY: 2, index: 0 },
    ],
    npcs: [
      {
        id: 'cloud_architect',
        sprite: 'npc_trainer_f',
        x: 22,
        y: 1,
        name: 'Cloud Architect Yara',
        dialog: [
          { speaker: 'Yara', text: 'Hey {name}! Ik ben Yara, Cloud Architect. Welkom op het Dakterras!' },
          { speaker: 'Yara', text: 'De Cloud Deployment Challenge: versla 3 waves van wilde AFASmon achter elkaar!' },
          { speaker: 'Yara', text: 'Geen healing tussendoor! Als je alle waves overleeft, krijg je een speciale beloning...' },
          { speaker: 'Yara', text: 'En wie weet verschijnt er daarna iets legendarisch op het dak... ⚡' },
        ],
        isTrainer: false,
        isWaveMaster: true,
      },
    ],
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
          { speaker: 'Bas', text: 'Ah, {name}! Ik ben Bas van der Veldt, CEO van AFAS Software.' },
          { speaker: 'Bas', text: 'Ik heb gehoord dat je alle trainers in het Clubhuis hebt verslagen. Indrukwekkend.' },
          { speaker: 'Bas', text: 'Bij AFAS geloven we in vier kernwaarden: Doen, Vertrouwen, Gek en Familie.' },
          { speaker: 'Bas', text: 'Dit is je sollicitatiegesprek, {name}. Alleen dan... met AFASmon.' },
          { speaker: 'Bas', text: 'Versla mij, en je krijgt je vaste aanstelling. En misschien iets heel bijzonders...' },
        ],
        isTrainer: true,
        isBoss: true,
        team: [
          { species: 'profitron', level: 15 },
          { species: 'workflox', level: 15 },
          { species: 'salarion', level: 16 },
          { species: 'innovaxx', level: 18 },
        ],
        defeatDialog: [
          { speaker: 'Bas', text: 'Ongelooflijk, {name}! Je hebt het gedaan!' },
          { speaker: 'Bas', text: 'Gefeliciteerd met je vaste aanstelling bij AFAS Software, {name}!' },
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
        case 'X': tileKey = 'tile_car_left'; isWalkable = false; break;
        case 'Z': tileKey = 'tile_car_right'; isWalkable = false; break;
        case 'V': tileKey = 'tile_piano'; isWalkable = false; break;
        case 'F': tileKey = 'tile_piano_keys'; isWalkable = false; break;
        case 'B': tileKey = 'tile_bar'; isWalkable = false; break;
        case 'Q': tileKey = 'tile_koffie'; isWalkable = false; break;
        case 'I': tileKey = 'tile_cake'; isWalkable = false; break;
        case 'J': tileKey = 'tile_table'; isWalkable = false; break;
        case 'M': tileKey = 'tile_server_rack'; isWalkable = false; break;
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
