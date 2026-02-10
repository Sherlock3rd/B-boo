export type ElementType = 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';

export interface Stats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
}

export interface Skill {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  description: string;
  cooldown: number; // in turns
}

export interface Pokemon {
  id: string;
  name: string;
  element: ElementType;
  stats: Stats;
  skills: Skill[];
  level: number;
  exp: number;
  sprite: string; // URL or asset path
  isWild?: boolean;
}

export interface Player {
  name: string;
  team: Pokemon[]; // Max 4
  inventory: Item[];
  gold: number;
  diamonds: number;
}

export interface Item {
  id: string;
  name: string;
  count: number;
  type: 'consumable' | 'material';
  effect?: (target: Pokemon) => void;
}

export type CellType = 'empty' | 'wall' | 'grass' | 'water' | 'forest' | 'mountain';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  isWalkable: boolean;
  hasEnemy?: boolean;
  enemyGroup?: Pokemon[]; // If hasEnemy is true
  hasResource?: boolean;
  resourceType?: string;
}

export interface GameState {
  currentScene: 'map' | 'battle' | 'menu' | 'pokedex';
  currentZoneId: number;
  playerPosition: { x: number; y: number };
}
