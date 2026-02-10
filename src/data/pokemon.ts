import { Pokemon, Skill } from '@/types';

const TACKLE: Skill = { id: 'tackle', name: 'Tackle', type: 'Wind', category: 'Single', power: 40, accuracy: 100, description: 'Basic attack', cooldown: 0, range: 1 };
const EMBER: Skill = { id: 'ember', name: 'Ember', type: 'Fire', category: 'Single', power: 40, accuracy: 100, description: 'Fire attack', cooldown: 0, range: 3 };
const WATER_GUN: Skill = { id: 'water_gun', name: 'Water Gun', type: 'Water', category: 'Single', power: 40, accuracy: 100, description: 'Water attack', cooldown: 0, range: 3 };
const THUNDER_SHOCK: Skill = { id: 'thunder_shock', name: 'Thunder Shock', type: 'Light', category: 'Single', power: 40, accuracy: 100, description: 'Electric attack', cooldown: 0, range: 3 };

// New Skills
const FLAME_BURST: Skill = { id: 'flame_burst', name: 'Flame Burst', type: 'Fire', category: 'AOE', power: 30, accuracy: 90, description: 'Explodes on impact', cooldown: 2, range: 3, aoeRadius: 1 };
const HEAL_PULSE: Skill = { id: 'heal_pulse', name: 'Heal Pulse', type: 'Light', category: 'Heal', power: 50, accuracy: 100, description: 'Restores HP', cooldown: 3, range: 3 };
const AQUA_RING: Skill = { id: 'aqua_ring', name: 'Aqua Ring', type: 'Water', category: 'Heal', power: 30, accuracy: 100, description: 'Self heal', cooldown: 3, range: 0 };
const RAZOR_LEAF: Skill = { id: 'razor_leaf', name: 'Razor Leaf', type: 'Wind', category: 'AOE', power: 35, accuracy: 95, description: 'Leaves cut everyone', cooldown: 1, range: 3, aoeRadius: 1 };
const HOWL: Skill = { id: 'howl', name: 'Howl', type: 'Wind', category: 'Buff', power: 0, accuracy: 100, description: 'Raises Attack', cooldown: 3, range: 0, buff: { type: 'atk', value: 0.2, duration: 2 } };

// Additional Skills for variety and Dark coverage
const BITE: Skill = { id: 'bite', name: 'Bite', type: 'Dark', category: 'Single', power: 45, accuracy: 100, description: 'Chomp!', cooldown: 0, range: 1 };
const DARK_PULSE: Skill = { id: 'dark_pulse', name: 'Dark Pulse', type: 'Dark', category: 'AOE', power: 50, accuracy: 100, description: 'Dark aura', cooldown: 2, range: 3, aoeRadius: 1 };
const FIRE_SPIN: Skill = { id: 'fire_spin', name: 'Fire Spin', type: 'Fire', category: 'Single', power: 35, accuracy: 90, description: 'Traps enemy', cooldown: 1, range: 3 };
const BUBBLE: Skill = { id: 'bubble', name: 'Bubble', type: 'Water', category: 'Single', power: 30, accuracy: 100, description: 'Slows enemy', cooldown: 0, range: 3 };
const SPARK: Skill = { id: 'spark', name: 'Spark', type: 'Light', category: 'Single', power: 45, accuracy: 100, description: 'Shocking', cooldown: 1, range: 2 };
const VINE_WHIP: Skill = { id: 'vine_whip', name: 'Vine Whip', type: 'Wind', category: 'Single', power: 45, accuracy: 100, description: 'Whip it', cooldown: 0, range: 2 };

export const SKILL_POOL = [
    TACKLE, EMBER, WATER_GUN, THUNDER_SHOCK,
    FLAME_BURST, HEAL_PULSE, AQUA_RING, RAZOR_LEAF, HOWL,
    BITE, DARK_PULSE, FIRE_SPIN, BUBBLE, SPARK, VINE_WHIP
];

export const POKEMON_DB: Record<string, Pokemon> = {
  'charmander': {
    id: 'charmander',
    name: 'Charmander',
    element: 'Fire',
    stats: { hp: 120, maxHp: 120, atk: 25, def: 15, speed: 65 },
    skills: [], // Assigned randomly at runtime
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmander.gif',
    moveRange: 3,
    attackRange: 1
  },
  'squirtle': {
    id: 'squirtle',
    name: 'Squirtle',
    element: 'Water',
    stats: { hp: 130, maxHp: 130, atk: 22, def: 20, speed: 43 },
    skills: [],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/squirtle.gif',
    moveRange: 3,
    attackRange: 1
  },
  'bulbasaur': {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    element: 'Wind',
    stats: { hp: 125, maxHp: 125, atk: 24, def: 18, speed: 45 },
    skills: [],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif',
    moveRange: 2,
    attackRange: 3
  },
  'pikachu': {
    id: 'pikachu',
    name: 'Pikachu',
    element: 'Light',
    stats: { hp: 100, maxHp: 100, atk: 30, def: 12, speed: 90 },
    skills: [],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif',
    moveRange: 2,
    attackRange: 3
  },
  'eevee': {
    id: 'eevee',
    name: 'Eevee',
    element: 'Dark', // Normal usually, but using Dark for coverage
    stats: { hp: 110, maxHp: 110, atk: 25, def: 15, speed: 55 },
    skills: [],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/eevee.gif',
    moveRange: 3,
    attackRange: 1
  },

  // --- Evolutions ---
  'charmeleon': {
    id: 'charmeleon',
    name: 'Charmeleon',
    element: 'Fire',
    stats: { hp: 150, maxHp: 150, atk: 35, def: 20, speed: 80 },
    skills: [],
    level: 16,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmeleon.gif',
    moveRange: 3,
    attackRange: 1
  },
  'wartortle': {
    id: 'wartortle',
    name: 'Wartortle',
    element: 'Water',
    stats: { hp: 160, maxHp: 160, atk: 30, def: 25, speed: 58 },
    skills: [],
    level: 16,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/wartortle.gif',
    moveRange: 3,
    attackRange: 1
  },
  'ivysaur': {
    id: 'ivysaur',
    name: 'Ivysaur',
    element: 'Wind',
    stats: { hp: 155, maxHp: 155, atk: 32, def: 22, speed: 60 },
    skills: [],
    level: 16,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/ivysaur.gif',
    moveRange: 2,
    attackRange: 3
  },
  'raichu': {
    id: 'raichu',
    name: 'Raichu',
    element: 'Light',
    stats: { hp: 130, maxHp: 130, atk: 45, def: 18, speed: 110 },
    skills: [],
    level: 16,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/raichu.gif',
    moveRange: 3,
    attackRange: 2
  },
  'umbreon': {
    id: 'umbreon',
    name: 'Umbreon',
    element: 'Dark',
    stats: { hp: 180, maxHp: 180, atk: 30, def: 40, speed: 65 },
    skills: [],
    level: 16,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/umbreon.gif',
    moveRange: 3,
    attackRange: 1
  },
};

export const INITIAL_PLAYER_TEAM = [POKEMON_DB['charmander']];

// Zone 1: Initial Plateau (Base Forms)
export const INITIAL_PLATEAU_POOL = [
    POKEMON_DB['charmander'], 
    POKEMON_DB['squirtle'], 
    POKEMON_DB['bulbasaur'], 
    POKEMON_DB['pikachu'], 
    POKEMON_DB['eevee']
];

// Zone 2: Istvan V (Evolved Forms)
export const ISTVAN_V_POOL = [
    POKEMON_DB['charmeleon'], 
    POKEMON_DB['wartortle'], 
    POKEMON_DB['ivysaur'], 
    POKEMON_DB['raichu'], 
    POKEMON_DB['umbreon']
];

// Fallback/Legacy
export const WILD_POKEMON_POOL = [...INITIAL_PLATEAU_POOL, ...ISTVAN_V_POOL];
