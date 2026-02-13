import { create } from 'zustand';
import { GridCell } from '@/types';
import { generateGlobalMap } from '@/utils/mapGenerator';
import { REGION_CONFIG, REGION_SIZE, GLOBAL_MAP_WIDTH, GLOBAL_MAP_HEIGHT } from '@/data/constants';
import { usePlayerStore } from '@/store/usePlayerStore';

interface MapState {
  grid: GridCell[][];
  playerPosition: { x: number; y: number };
  unlockedTeleports: string[]; 
  
  // Actions
  initMap: () => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  teleportPlayer: (x: number, y: number) => void; 
  teleportToMap: (regionId: string) => void;
  checkEncounter: () => boolean;
  clearEncounter: (x: number, y: number) => void;
  unlockTeleport: (key: string) => void;
  
  // Helpers
  getCurrentZoneInfo: () => { zoneId: string, subZoneId: number, name: string };
}

export const useMapStore = create<MapState>((set, get) => ({
  grid: [],
  playerPosition: { x: 2, y: 2 }, // Start in Plateau-1 Camp (Top-Left)
  unlockedTeleports: ['plateau-1'], 

  initMap: () => {
    const grid = generateGlobalMap();
    set({ 
      grid,
      playerPosition: { x: 2, y: 2 }
    });
  },

  movePlayer: (direction) => {
    const { playerPosition, grid, unlockedTeleports } = get();
    let { x, y } = playerPosition;

    if (direction === 'up') y = Math.max(0, y - 1);
    if (direction === 'down') y = Math.min(GLOBAL_MAP_HEIGHT - 1, y + 1);
    if (direction === 'left') x = Math.max(0, x - 1);
    if (direction === 'right') x = Math.min(GLOBAL_MAP_WIDTH - 1, x + 1);

    const targetCell = grid[y][x];
    
    // Check if walkable
    if (!targetCell.isWalkable) return;

    // --- Region Level Logic ---
    const currentRegion = getRegionByPos(playerPosition.x, playerPosition.y);
    const targetRegion = getRegionByPos(x, y);

    if (targetRegion && targetRegion.id !== currentRegion?.id) {
        const playerLevel = usePlayerStore.getState().level;
        if (playerLevel < targetRegion.levelReq) {
            alert(`Locked! ${targetRegion.name} requires Level ${targetRegion.levelReq}.`);
            
            // Push back if currently on a portal to avoid getting stuck "in" the door
            const currentCell = grid[playerPosition.y][playerPosition.x];
            if (currentCell.buildingType === 'portal') {
                 let backX = playerPosition.x;
                 let backY = playerPosition.y;
                 
                 // Move opposite to the attempted direction
                 if (direction === 'up') backY++;
                 else if (direction === 'down') backY--;
                 else if (direction === 'left') backX++;
                 else if (direction === 'right') backX--;
                 
                 // Verify bounds and walkability
                 if (
                     backY >= 0 && backY < GLOBAL_MAP_HEIGHT &&
                     backX >= 0 && backX < GLOBAL_MAP_WIDTH &&
                     grid[backY][backX].isWalkable
                 ) {
                     set({ playerPosition: { x: backX, y: backY } });
                 }
            }
            return;
        }
    }

    // --- Special Vertical Teleport (Plateau-5 <-> Istvan-1) ---
    // P5 is (4,0), I1 is (4,1).
    // Connection is P5 Bottom <-> I1 Top.
    // P5 Bottom Gate is around x=135, y=29.
    // I1 Top Gate is around x=135, y=30.
    
    // If moving Down from P5 Bottom Gate
    if (currentRegion?.id === 'plateau-5' && direction === 'down' && targetCell.buildingType === 'portal' && targetRegion?.id === 'istvan-1') {
        // Just move naturally, level check already passed
    }
    
    // Actually, P5 and I1 are not adjacent in Y axis in the grid array?
    // GLOBAL_MAP_HEIGHT = 60. P5 Y=0..29. I1 Y=30..59.
    // They ARE adjacent in the array. So natural movement works if walls are open.
    // My generator puts a gate on Bottom of P5 and Top of I1.
    // If they align, player can just walk.
    
    // --- Check Teleport Unlock ---
    if (targetCell.buildingType === 'teleport_point') {
        if (targetRegion) {
             const key = targetRegion.id;
             if (!unlockedTeleports.includes(key)) {
                set({ unlockedTeleports: [...unlockedTeleports, key] });
                alert(`Teleport Point Unlocked: ${targetRegion.name}`);
             }
        }
    }
    
    // --- Collectible Item Logic ---
    if (targetCell.collectible) {
        const item = targetCell.collectible;
        const { addResources, addItem, gainExp, showFloatingText } = usePlayerStore.getState();
        
        let msg = "";
        let color = "white";

        if (item.type === 'wood') {
            addResources({ wood: item.amount });
            msg = `+${item.amount} Wood`;
            color = "amber";
        } else if (item.type === 'ore') {
            addResources({ ore: item.amount });
            msg = `+${item.amount} Ore`;
            color = "stone";
        } else if (item.type === 'pokeball') {
            addItem({ id: 'pokeball', name: 'Poke Ball', count: item.amount, type: 'consumable' });
            msg = `+${item.amount} Poke Ball`;
            color = "red";
        }

        gainExp(10); // +10 EXP
        showFloatingText(`${msg} & +10 EXP`, color);

        // Remove from grid
        const newGrid = [...grid];
        newGrid[y][x] = { ...targetCell, collectible: undefined };
        set({ grid: newGrid });
    }

    set({ playerPosition: { x, y } });
  },

  teleportPlayer: (x, y) => set({ playerPosition: { x, y } }),
  
  teleportToMap: (regionId) => {
      const region = REGION_CONFIG.find(r => r.id === regionId);
      if (!region) return;

      const startX = region.gridX * REGION_SIZE;
      const startY = region.gridY * REGION_SIZE;
      
      // Default to center or specific spot
      let tx = startX + 8;
      let ty = startY + 8;
      
      if (region.id === 'plateau-1') { tx = startX + 8; ty = startY + 8; }
      
      set({ playerPosition: { x: tx, y: ty } });
  },

  checkEncounter: () => {
    const { playerPosition, grid } = get();
    // Safety Check: Plateau-1 Camp Area (0,0 to 10,10)
    if (playerPosition.x < 10 && playerPosition.y < 10) return false;
    
    if (!grid[playerPosition.y] || !grid[playerPosition.y][playerPosition.x]) return false;

    const cell = grid[playerPosition.y][playerPosition.x];
    return !!cell.hasEnemy;
  },
  
  clearEncounter: (x, y) => set((state) => {
      const newGrid = [...state.grid];
      if (newGrid[y] && newGrid[y][x]) {
          newGrid[y][x] = { ...newGrid[y][x], hasEnemy: false };
      }
      return { grid: newGrid };
  }),
  
  unlockTeleport: (key) => set((state) => ({ unlockedTeleports: [...state.unlockedTeleports, key] })),

  getCurrentZoneInfo: () => {
      const { playerPosition } = get();
      const region = getRegionByPos(playerPosition.x, playerPosition.y);
      if (region) {
          // Extract "1" from "plateau-1"
          const parts = region.id.split('-');
          const num = parseInt(parts[1]) || 1;
          return { zoneId: parts[0], subZoneId: num, name: region.name };
      }
      return { zoneId: 'unknown', subZoneId: 1, name: 'Unknown' };
  }
}));

// Helper
const getRegionByPos = (x: number, y: number) => {
    const gx = Math.floor(x / REGION_SIZE);
    const gy = Math.floor(y / REGION_SIZE);
    return REGION_CONFIG.find(r => r.gridX === gx && r.gridY === gy);
};
