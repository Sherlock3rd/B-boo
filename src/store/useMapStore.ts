import { create } from 'zustand';
import { GridCell } from '@/types';
import { generateMap } from '@/utils/mapGenerator';
import { MAP_WIDTH, MAP_HEIGHT } from '@/data/constants';
import { usePlayerStore } from '@/store/usePlayerStore'; // Direct import might cause circular dependency if store imports map store.
// Better to access player store inside the action or pass the value.
// But Zustand stores are separate.

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
  playerPosition: { x: Math.floor(MAP_WIDTH / 4), y: Math.floor(MAP_HEIGHT / 2) }, // Start in Initial Plateau

  initMap: (zoneId) => {
    const grid = generateMap(zoneId);
    set({ 
      currentZoneId: zoneId, 
      grid,
      playerPosition: { x: Math.floor(MAP_WIDTH / 4), y: Math.floor(MAP_HEIGHT / 2) } // Start in Initial Plateau
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
        // Check Gate Condition
        const SPLIT_X = Math.floor(MAP_WIDTH / 2);
        // Crossing from Left (SPLIT_X - 1) to Right (SPLIT_X) or stepping ON the split line (which is wall except at connection)
        // Actually, the divider is at SPLIT_X. 
        // If x === SPLIT_X, we are ON the gate.
        
        // Logic: If moving INTO the gate tile (x === SPLIT_X) from Left (x < SPLIT_X)
        if (x === SPLIT_X && playerPosition.x < SPLIT_X) {
             const pokedexCount = usePlayerStore.getState().pokedex.length;
             if (pokedexCount < 5) {
                 alert(`Gate Locked! You need 5 Pokemon in Pokedex to enter Istvan V. (Current: ${pokedexCount})`);
                 return; // Block movement
             }
        }

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
