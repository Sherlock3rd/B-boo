import { Pokemon, Skill } from '@/types';

const TACKLE: Skill = { id: 'tackle', name: 'Tackle', type: 'Wind', power: 40, accuracy: 100, description: 'Basic attack', cooldown: 0 };
const EMBER: Skill = { id: 'ember', name: 'Ember', type: 'Fire', power: 40, accuracy: 100, description: 'Fire attack', cooldown: 0 };
const WATER_GUN: Skill = { id: 'water_gun', name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, description: 'Water attack', cooldown: 0 };
const THUNDER_SHOCK: Skill = { id: 'thunder_shock', name: 'Thunder Shock', type: 'Light', power: 40, accuracy: 100, description: 'Electric attack', cooldown: 0 };

export const POKEMON_DB: Record<string, Pokemon> = {
  'charmander': {
    id: 'charmander',
    name: 'Charmander',
    element: 'Fire',
    stats: { hp: 39, maxHp: 39, atk: 52, def: 43, speed: 65 },
    skills: [EMBER, TACKLE],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmander.gif'
  },
  'squirtle': {
    id: 'squirtle',
    name: 'Squirtle',
    element: 'Water',
    stats: { hp: 44, maxHp: 44, atk: 48, def: 65, speed: 43 },
    skills: [WATER_GUN, TACKLE],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/squirtle.gif'
  },
  'bulbasaur': { // Using Wind for Grass
    id: 'bulbasaur',
    name: 'Bulbasaur',
    element: 'Wind',
    stats: { hp: 45, maxHp: 45, atk: 49, def: 49, speed: 45 },
    skills: [TACKLE],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif'
  },
  'pikachu': {
    id: 'pikachu',
    name: 'Pikachu',
    element: 'Light',
    stats: { hp: 35, maxHp: 35, atk: 55, def: 40, speed: 90 },
    skills: [THUNDER_SHOCK, TACKLE],
    level: 5,
    exp: 0,
    sprite: 'https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif'
  },
};

export const INITIAL_PLAYER_TEAM = [POKEMON_DB['charmander'], POKEMON_DB['pikachu']];
export const WILD_POKEMON_POOL = [POKEMON_DB['squirtle'], POKEMON_DB['bulbasaur']];
