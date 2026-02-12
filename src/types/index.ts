export type ElementType = 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';

export interface Stats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
}

export type SkillCategory = 'Single' | 'AOE' | 'Buff' | 'Heal';

export interface Buff {
  type: 'atk' | 'def' | 'speed';
  value: number; // Percentage increase (e.g., 0.2 for 20%)
  duration: number; // Turns
}

export interface Skill {
  id: string;
  name: string;
  type: ElementType;
  category: SkillCategory;
  power: number; // Damage or Heal amount
  accuracy: number;
  description: string;
  cooldown: number; // in turns
  range: number; // Cast range
  aoeRadius?: number; // For AOE skills (e.g., 1 for 3x3, 0 for 1x1)
  buff?: Buff; // For Buff skills
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
  moveRange?: number; // Movement range on battle grid
  attackRange?: number; // Basic attack range on battle grid
}

export interface Player {
  name: string;
  team: (Pokemon | null)[]; // Max 4, supports empty slots
  inventory: Item[];
  essence: number; // Replaces gold
  diamonds: number;
  slotLevels: [number, number, number, number]; // Levels for the 4 active slots
  pendingPlayerExp: number; // Accumulated idle EXP
  pendingEssence: number; // Accumulated idle Essence
}

export interface Item {
  id: string;
  name: string;
  count: number;
  type: 'consumable' | 'material';
  effect?: (target: Pokemon) => void;
}

export type CellType = 'empty' | 'wall' | 'grass' | 'water' | 'forest' | 'mountain' | 'camp_floor';
export type BuildingType = 'camp_center' | 'lumber_mill' | 'mine' | 'mana_well' | 'workshop' | 'tent' | 'teleport_point' | 'portal';

export interface PortalTarget {
    zoneId: string;
    subZoneId: number;
}

export type CollectibleType = 'wood' | 'ore' | 'pokeball';

export interface CollectibleItem {
    type: CollectibleType;
    amount: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  isWalkable: boolean;
  hasEnemy?: boolean;
  enemyCount?: number; // Added for map visualization
  enemyGroup?: Pokemon[]; // If hasEnemy is true
  hasResource?: boolean;
  resourceType?: string;
  hasBuilding?: boolean;
  buildingType?: BuildingType;
  portalTarget?: PortalTarget;
  collectible?: CollectibleItem;
}

export interface GameState {
  currentScene: 'map' | 'battle' | 'menu' | 'pokedex';
  currentZoneId: number;
  playerPosition: { x: number; y: number };
}
