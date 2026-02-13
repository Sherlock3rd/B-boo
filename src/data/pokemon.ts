import { Pokemon, Skill } from '@/types';

const TACKLE: Skill = { id: 'tackle', name: 'Tackle', type: 'Wind', power: 40, accuracy: 100, description: 'Basic attack', cooldown: 0, range: 1, category: 'Single' };
const EMBER: Skill = { id: 'ember', name: 'Ember', type: 'Fire', power: 40, accuracy: 100, description: 'Fire attack', cooldown: 0, range: 3, category: 'Single' };
const WATER_GUN: Skill = { id: 'water_gun', name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, description: 'Water attack', cooldown: 0, range: 3, category: 'Single' };
const THUNDER_SHOCK: Skill = { id: 'thunder_shock', name: 'Thunder Shock', type: 'Light', power: 40, accuracy: 100, description: 'Electric attack', cooldown: 0, range: 3, category: 'Single' };

// New Skills
const FLAME_BURST: Skill = { id: 'flame_burst', name: 'Flame Burst', type: 'Fire', power: 60, accuracy: 90, description: 'Strong Fire', cooldown: 2, range: 3, category: 'Single' };
const HEAL_PULSE: Skill = { id: 'heal_pulse', name: 'Heal Pulse', type: 'Light', power: 0, accuracy: 100, description: 'Heal', cooldown: 3, category: 'Heal', range: 4 }; 
const AQUA_RING: Skill = { id: 'aqua_ring', name: 'Aqua Ring', type: 'Water', power: 0, accuracy: 100, description: 'Heal', cooldown: 3, category: 'Heal', range: 4 };
const RAZOR_LEAF: Skill = { id: 'razor_leaf', name: 'Razor Leaf', type: 'Wind', power: 55, accuracy: 95, description: 'Sharp leaves', cooldown: 1, range: 3, category: 'Single' };
const HOWL: Skill = { id: 'howl', name: 'Howl', type: 'Wind', power: 0, accuracy: 100, description: 'Buff Atk', cooldown: 3, category: 'Buff', range: 0 }; // Self buff

// Additional Skills
const BITE: Skill = { id: 'bite', name: 'Bite', type: 'Dark', power: 60, accuracy: 100, description: 'Chomp!', cooldown: 0, range: 1, category: 'Single' };
const DARK_PULSE: Skill = { id: 'dark_pulse', name: 'Dark Pulse', type: 'Dark', power: 80, accuracy: 100, description: 'Dark aura', cooldown: 2, range: 3, category: 'Single' };
const FIRE_SPIN: Skill = { id: 'fire_spin', name: 'Fire Spin', type: 'Fire', power: 35, accuracy: 90, description: 'Traps enemy', cooldown: 1, range: 3, category: 'Single' };
const BUBBLE: Skill = { id: 'bubble', name: 'Bubble', type: 'Water', power: 40, accuracy: 100, description: 'Bubbles', cooldown: 0, range: 3, category: 'Single' };
const SPARK: Skill = { id: 'spark', name: 'Spark', type: 'Light', power: 65, accuracy: 100, description: 'Shocking', cooldown: 1, range: 1, category: 'Single' }; // Physical electric move usually
const VINE_WHIP: Skill = { id: 'vine_whip', name: 'Vine Whip', type: 'Wind', power: 45, accuracy: 100, description: 'Whip it', cooldown: 0, range: 2, category: 'Single' };
const HYDRO_PUMP: Skill = { id: 'hydro_pump', name: 'Hydro Pump', type: 'Water', power: 110, accuracy: 80, description: 'Massive Water', cooldown: 4, range: 4, category: 'Single' };
const SOLAR_BEAM: Skill = { id: 'solar_beam', name: 'Solar Beam', type: 'Wind', power: 120, accuracy: 100, description: 'Charge beam', cooldown: 4, range: 5, category: 'Single' };
const FIRE_BLAST: Skill = { id: 'fire_blast', name: 'Fire Blast', type: 'Fire', power: 110, accuracy: 85, description: 'Massive Fire', cooldown: 4, range: 4, category: 'Single' };
const THUNDER: Skill = { id: 'thunder', name: 'Thunder', type: 'Light', power: 110, accuracy: 70, description: 'Massive Electric', cooldown: 4, range: 4, category: 'Single' };
const SHADOW_BALL: Skill = { id: 'shadow_ball', name: 'Shadow Ball', type: 'Dark', power: 80, accuracy: 100, description: 'Ghostly blob', cooldown: 2, range: 3, category: 'Single' };

export const SKILL_POOL = [
    TACKLE, EMBER, WATER_GUN, THUNDER_SHOCK,
    FLAME_BURST, HEAL_PULSE, AQUA_RING, RAZOR_LEAF, HOWL,
    BITE, DARK_PULSE, FIRE_SPIN, BUBBLE, SPARK, VINE_WHIP,
    HYDRO_PUMP, SOLAR_BEAM, FIRE_BLAST, THUNDER, SHADOW_BALL
];

export const POKEMON_DB: Record<string, Pokemon> = {
  // --- Fire ---
  'charmander': {
    id: 'charmander', name: 'Charmander', element: 'Fire',
    stats: { hp: 120, maxHp: 120, atk: 52, def: 43, speed: 65 },
    skills: [EMBER, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmander.gif',
    moveRange: 3, attackRange: 1
  },
  'charmeleon': {
    id: 'charmeleon', name: 'Charmeleon', element: 'Fire',
    stats: { hp: 250, maxHp: 250, atk: 100, def: 90, speed: 95 },
    skills: [EMBER, FLAME_BURST, TACKLE], level: 16, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmeleon.gif',
    moveRange: 3, attackRange: 1
  },
  'charizard': {
    id: 'charizard', name: 'Charizard', element: 'Fire',
    stats: { hp: 450, maxHp: 450, atk: 180, def: 150, speed: 130 },
    skills: [FLAME_BURST, FIRE_BLAST, TACKLE], level: 36, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif',
    moveRange: 4, attackRange: 3
  },
  'vulpix': {
    id: 'vulpix', name: 'Vulpix', element: 'Fire',
    stats: { hp: 110, maxHp: 110, atk: 41, def: 40, speed: 65 },
    skills: [EMBER, FIRE_SPIN], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/vulpix.gif',
    moveRange: 3, attackRange: 3
  },
  'ninetales': {
    id: 'ninetales', name: 'Ninetales', element: 'Fire',
    stats: { hp: 180, maxHp: 180, atk: 76, def: 75, speed: 100 },
    skills: [FIRE_SPIN, FLAME_BURST, FIRE_BLAST], level: 30, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/ninetales.gif',
    moveRange: 4, attackRange: 3
  },

  // --- Water ---
  'squirtle': {
    id: 'squirtle', name: 'Squirtle', element: 'Water',
    stats: { hp: 130, maxHp: 130, atk: 48, def: 65, speed: 43 },
    skills: [WATER_GUN, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/squirtle.gif',
    moveRange: 3, attackRange: 1
  },
  'wartortle': {
    id: 'wartortle', name: 'Wartortle', element: 'Water',
    stats: { hp: 270, maxHp: 270, atk: 110, def: 120, speed: 70 },
    skills: [WATER_GUN, BUBBLE, TACKLE], level: 16, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/wartortle.gif',
    moveRange: 3, attackRange: 1
  },
  'blastoise': {
    id: 'blastoise', name: 'Blastoise', element: 'Water',
    stats: { hp: 500, maxHp: 500, atk: 180, def: 200, speed: 100 },
    skills: [BUBBLE, HYDRO_PUMP, AQUA_RING], level: 36, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/blastoise.gif',
    moveRange: 2, attackRange: 4
  },
  'psyduck': {
    id: 'psyduck', name: 'Psyduck', element: 'Water',
    stats: { hp: 125, maxHp: 125, atk: 52, def: 48, speed: 55 },
    skills: [WATER_GUN, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/psyduck.gif',
    moveRange: 3, attackRange: 1
  },
  'golduck': {
    id: 'golduck', name: 'Golduck', element: 'Water',
    stats: { hp: 190, maxHp: 190, atk: 82, def: 78, speed: 85 },
    skills: [WATER_GUN, HYDRO_PUMP, TACKLE], level: 33, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/golduck.gif',
    moveRange: 4, attackRange: 1
  },

  // --- Wind (Grass) ---
  'bulbasaur': {
    id: 'bulbasaur', name: 'Bulbasaur', element: 'Wind',
    stats: { hp: 125, maxHp: 125, atk: 49, def: 49, speed: 45 },
    skills: [VINE_WHIP, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif',
    moveRange: 3, attackRange: 1
  },
  'ivysaur': {
    id: 'ivysaur', name: 'Ivysaur', element: 'Wind',
    stats: { hp: 260, maxHp: 260, atk: 110, def: 110, speed: 75 },
    skills: [VINE_WHIP, RAZOR_LEAF, TACKLE], level: 16, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/ivysaur.gif',
    moveRange: 3, attackRange: 1
  },
  'venusaur': {
    id: 'venusaur', name: 'Venusaur', element: 'Wind',
    stats: { hp: 480, maxHp: 480, atk: 170, def: 170, speed: 110 },
    skills: [RAZOR_LEAF, SOLAR_BEAM, HOWL], level: 36, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/venusaur.gif',
    moveRange: 2, attackRange: 3
  },
  'oddish': {
    id: 'oddish', name: 'Oddish', element: 'Wind',
    stats: { hp: 115, maxHp: 115, atk: 50, def: 55, speed: 30 },
    skills: [VINE_WHIP, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/oddish.gif',
    moveRange: 2, attackRange: 1
  },
  'gloom': {
    id: 'gloom', name: 'Gloom', element: 'Wind',
    stats: { hp: 140, maxHp: 140, atk: 65, def: 70, speed: 40 },
    skills: [VINE_WHIP, RAZOR_LEAF, TACKLE], level: 21, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/gloom.gif',
    moveRange: 2, attackRange: 1
  },

  // --- Light (Electric) ---
  'pikachu': {
    id: 'pikachu', name: 'Pikachu', element: 'Light',
    stats: { hp: 100, maxHp: 100, atk: 55, def: 40, speed: 90 },
    skills: [THUNDER_SHOCK, SPARK, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif',
    moveRange: 4, attackRange: 1
  },
  'raichu': {
    id: 'raichu', name: 'Raichu', element: 'Light',
    stats: { hp: 130, maxHp: 130, atk: 90, def: 55, speed: 110 },
    skills: [SPARK, THUNDER, TACKLE], level: 16, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/raichu.gif',
    moveRange: 4, attackRange: 1
  },
  'magnemite': {
    id: 'magnemite', name: 'Magnemite', element: 'Light',
    stats: { hp: 100, maxHp: 100, atk: 35, def: 70, speed: 45 },
    skills: [THUNDER_SHOCK, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/magnemite.gif',
    moveRange: 3, attackRange: 3
  },
  'magneton': {
    id: 'magneton', name: 'Magneton', element: 'Light',
    stats: { hp: 140, maxHp: 140, atk: 60, def: 95, speed: 70 },
    skills: [SPARK, THUNDER_SHOCK, TACKLE], level: 30, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/magneton.gif',
    moveRange: 3, attackRange: 3
  },
  'joltik': { 
    id: 'joltik', name: 'Joltik', element: 'Light',
    stats: { hp: 90, maxHp: 90, atk: 47, def: 50, speed: 65 },
    skills: [THUNDER_SHOCK, BITE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/joltik.gif',
    moveRange: 4, attackRange: 1
  },

  // --- Dark ---
  'eevee': { 
    id: 'eevee', name: 'Eevee', element: 'Dark',
    stats: { hp: 110, maxHp: 110, atk: 55, def: 50, speed: 55 },
    skills: [TACKLE, BITE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/eevee.gif',
    moveRange: 3, attackRange: 1
  },
  'umbreon': {
    id: 'umbreon', name: 'Umbreon', element: 'Dark',
    stats: { hp: 180, maxHp: 180, atk: 65, def: 110, speed: 65 },
    skills: [BITE, DARK_PULSE, TACKLE], level: 16, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/umbreon.gif',
    moveRange: 3, attackRange: 1
  },
  'gastly': {
    id: 'gastly', name: 'Gastly', element: 'Dark',
    stats: { hp: 90, maxHp: 90, atk: 35, def: 30, speed: 80 },
    skills: [BITE, TACKLE], level: 5, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/gastly.gif',
    moveRange: 4, attackRange: 3
  },
  'haunter': {
    id: 'haunter', name: 'Haunter', element: 'Dark',
    stats: { hp: 115, maxHp: 115, atk: 50, def: 45, speed: 95 },
    skills: [BITE, SHADOW_BALL], level: 25, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/haunter.gif',
    moveRange: 4, attackRange: 3
  },
  'gengar': { 
    id: 'gengar', name: 'Gengar', element: 'Dark',
    stats: { hp: 150, maxHp: 150, atk: 65, def: 60, speed: 110 },
    skills: [SHADOW_BALL, DARK_PULSE, BITE], level: 35, exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/gengar.gif',
    moveRange: 4, attackRange: 3
  }
};

export const INITIAL_PLAYER_TEAM = [POKEMON_DB['charmander']];

// Zone Pools
export const INITIAL_PLATEAU_POOL = [
    POKEMON_DB['charmander'], POKEMON_DB['squirtle'], POKEMON_DB['bulbasaur'], 
    POKEMON_DB['pikachu'], POKEMON_DB['eevee'], POKEMON_DB['vulpix'], 
    POKEMON_DB['psyduck'], POKEMON_DB['oddish'], POKEMON_DB['magnemite'], 
    POKEMON_DB['joltik'], POKEMON_DB['gastly']
];

export const ISTVAN_V_POOL = [
    POKEMON_DB['charmeleon'], POKEMON_DB['wartortle'], POKEMON_DB['ivysaur'], 
    POKEMON_DB['raichu'], POKEMON_DB['umbreon'], POKEMON_DB['ninetales'], 
    POKEMON_DB['golduck'], POKEMON_DB['gloom'], POKEMON_DB['magneton'], 
    POKEMON_DB['haunter'], POKEMON_DB['charizard'], POKEMON_DB['blastoise'],
    POKEMON_DB['venusaur'], POKEMON_DB['gengar']
];

export const WILD_POKEMON_POOL = Object.values(POKEMON_DB);
