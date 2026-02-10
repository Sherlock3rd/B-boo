import { create } from 'zustand';
import { GridCell } from '@/types';
import { generateMap } from '@/utils/mapGenerator';
import { MAP_WIDTH, MAP_HEIGHT } from '@/data/constants';

interface MapState {
  currentZoneId: number;
  grid: GridCell[][];
  playerPosition: { x: number; y: number };
  
  // Actions
  initMap: (zoneId: number) => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  teleportPlayer: (x: number, y: number) => void;
  checkEncounter: () => boolean;
  clearEncounter: (x: number, y: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  currentZoneId: 1,
  grid: [],
  playerPosition: { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) },

  initMap: (zoneId) => {
    const grid = generateMap(zoneId);
    set({ 
      currentZoneId: zoneId, 
      grid,
      playerPosition: { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) }
    });
  },

  movePlayer: (direction) => {
    const { playerPosition, grid } = get();
    let { x, y } = playerPosition;

    if (direction === 'up') y = Math.max(0, y - 1);
    if (direction === 'down') y = Math.min(MAP_HEIGHT - 1, y + 1);
    if (direction === 'left') x = Math.max(0, x - 1);
    if (direction === 'right') x = Math.min(MAP_WIDTH - 1, x + 1);

    const targetCell = grid[y][x];
    if (targetCell.isWalkable) {
      set({ playerPosition: { x, y } });
    }
  },

  teleportPlayer: (x, y) => set({ playerPosition: { x, y } }),

  checkEncounter: () => {
    const { playerPosition, grid } = get();
    const cell = grid[playerPosition.y][playerPosition.x];
    return !!cell.hasEnemy;
  },
  
  clearEncounter: (x, y) => set((state) => {
      const newGrid = [...state.grid];
      newGrid[y][x] = { ...newGrid[y][x], hasEnemy: false };
      return { grid: newGrid };
  }),
}));
