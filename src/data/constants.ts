import { ElementType } from '@/types';

export const TYPE_CHART: Record<ElementType, Record<ElementType, number>> = {
  Fire: { Fire: 1, Water: 0.5, Wind: 2, Light: 1, Dark: 1 },
  Water: { Fire: 2, Water: 1, Wind: 0.5, Light: 1, Dark: 1 },
  Wind: { Fire: 0.5, Water: 2, Wind: 1, Light: 1, Dark: 1 },
  Light: { Fire: 1, Water: 1, Wind: 1, Light: 1, Dark: 2 },
  Dark: { Fire: 1, Water: 1, Wind: 1, Light: 2, Dark: 1 },
};

export const MAP_WIDTH = 40; // Doubled from 20 to 40
export const MAP_HEIGHT = 30; // 16:9 vertical ratio rough approximation for grid

export const MAX_TEAM_SIZE = 4;

export const ZONES = [
  { id: 1, name: 'Starting Plains', type: 'grass' },
  { id: 2, name: 'Misty Lake', type: 'water' },
  { id: 3, name: 'Windy Peaks', type: 'mountain' },
  { id: 4, name: 'Scorched Cave', type: 'wall' }, // Interior-like
  { id: 5, name: 'Ancient Ruins', type: 'forest' },
];
