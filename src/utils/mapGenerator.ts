import { GridCell, CellType, BuildingType, Pokemon, CollectibleType } from '@/types';
import { REGION_CONFIG, REGION_SIZE, GLOBAL_MAP_WIDTH, GLOBAL_MAP_HEIGHT } from '@/data/constants';
import { WILD_POKEMON_POOL, INITIAL_PLATEAU_POOL, ISTVAN_V_POOL } from '@/data/pokemon';

const RESOURCE_CONFIG = {
    WOOD: { count: 5, min: 20, max: 50 },
    ORE: { count: 5, min: 20, max: 50 },
    POKEBALL: { count: 2, amount: 1 }
};

export const generateGlobalMap = (): GridCell[][] => {
  const grid: GridCell[][] = [];

  // 1. Initialize Void Grid
  for (let y = 0; y < GLOBAL_MAP_HEIGHT; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GLOBAL_MAP_WIDTH; x++) {
      row.push({
        x, y, type: 'wall', isWalkable: false // Default to void/wall
      });
    }
    grid.push(row);
  }

  // 2. Generate Regions
  REGION_CONFIG.forEach(region => {
      const startX = region.gridX * REGION_SIZE;
      const startY = region.gridY * REGION_SIZE;

      // Draw Region Terrain (Walls & Floor)
      for (let ly = 0; ly < REGION_SIZE; ly++) {
          for (let lx = 0; lx < REGION_SIZE; lx++) {
              const gx = startX + lx;
              const gy = startY + ly;

              // Default: Wall Border
              let type: CellType = 'wall';
              let isWalkable = false;
              let hasEnemy = false;
              let enemyCount = 0;
              let enemyGroup: Pokemon[] = [];
              let hasBuilding = false;
              let buildingType: BuildingType | undefined = undefined;

              // Check if inside border (1-cell thick wall)
              const isBorder = lx === 0 || lx === REGION_SIZE - 1 || ly === 0 || ly === REGION_SIZE - 1;
              
              if (!isBorder) {
                  type = region.type;
                  isWalkable = true;

                  // Random Terrain Variation
                  if (region.type === 'grass' && Math.random() < 0.1) type = 'forest';
                  if (region.type === 'mountain' && Math.random() < 0.05) { type = 'wall'; isWalkable = false; }

                  // Enemies
                  if (isWalkable && Math.random() < 0.03) {
                      hasEnemy = true;
                      let pool = WILD_POKEMON_POOL;
                      if (region.id.includes('plateau')) pool = INITIAL_PLATEAU_POOL;
                      else if (region.id.includes('istvan')) pool = ISTVAN_V_POOL;
                      
                      // Difficulty Adjustment based on Region
                      let minCount = 1;
                      let maxCount = 2;

                      switch (region.id) {
                          case 'plateau-1': minCount = 1; maxCount = 1; break;
                          case 'plateau-2': minCount = 2; maxCount = 2; break;
                          case 'plateau-3': minCount = 2; maxCount = 4; break;
                          case 'plateau-4': minCount = 3; maxCount = 4; break;
                          case 'plateau-5': minCount = 4; maxCount = 5; break;
                          case 'istvan-1':
                          case 'istvan-2': minCount = 4; maxCount = 6; break;
                          case 'istvan-3':
                          case 'istvan-4': minCount = 4; maxCount = 7; break;
                          case 'istvan-5': minCount = 4; maxCount = 10; break;
                          default: minCount = 1; maxCount = 2; break;
                      }
                      
                      enemyCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

                      enemyGroup = Array(enemyCount).fill(0).map(() => ({ ...pool[Math.floor(Math.random() * pool.length)] }));
                  }
              }

              // Update Grid
              grid[gy][gx] = {
                  x: gx, y: gy, type, isWalkable, hasEnemy, enemyCount, enemyGroup, hasBuilding, buildingType
              };
          }
      }

      // 3. Generate Features

      // Camp (Plateau-1 Top-Left)
      if (region.id === 'plateau-1') {
          // Define Camp Area (Top-Left corner, e.g., 10x10)
          const campSize = 10;
          for (let cy = 1; cy < campSize; cy++) {
              for (let cx = 1; cx < campSize; cx++) {
                  const gx = startX + cx;
                  const gy = startY + cy;
                  
                  if (grid[gy][gx]) {
                      grid[gy][gx].type = 'camp_floor';
                      grid[gy][gx].isWalkable = true;
                      grid[gy][gx].hasEnemy = false;
                  }
              }
          }

          // Place Buildings
          const placeBuilding = (bx: number, by: number, bType: BuildingType) => {
              const gx = startX + bx;
              const gy = startY + by;
              if (grid[gy][gx]) {
                  grid[gy][gx].hasBuilding = true;
                  grid[gy][gx].buildingType = bType;
              }
          };

          placeBuilding(4, 4, 'camp_center');
          placeBuilding(2, 4, 'lumber_mill');
          placeBuilding(6, 4, 'mine');
          placeBuilding(4, 2, 'mana_well');
          placeBuilding(4, 6, 'workshop');
          placeBuilding(6, 6, 'tent');
          placeBuilding(8, 8, 'teleport_point');
      }

      // Add Teleport Point for EVERY Region
      if (region.id !== 'plateau-1') {
          // Default TP location (e.g., center or slightly offset)
          const tpX = startX + 8;
          const tpY = startY + 8;
          
          if (grid[tpY] && grid[tpY][tpX]) {
              grid[tpY][tpX].type = 'grass'; // Ensure walkable floor
              grid[tpY][tpX].isWalkable = true;
              grid[tpY][tpX].hasBuilding = true;
              grid[tpY][tpX].buildingType = 'teleport_point';
              grid[tpY][tpX].hasEnemy = false;
          }
      }

      // Gates (Connections)
      // Check neighbors to determine gate placement
      const center = Math.floor(REGION_SIZE / 2);
      
      // Right Connection (to gridX + 1)
      const hasRight = region.connections.some(cid => {
          const t = REGION_CONFIG.find(r => r.id === cid);
          return t && t.gridX === region.gridX + 1 && t.gridY === region.gridY;
      });
      if (hasRight) {
          // Gate on Right Wall
          const gx = startX + REGION_SIZE - 1;
          const gy = startY + center;
          createGate(grid, gx, gy, 'portal');
      }

      // Left Connection (to gridX - 1)
      const hasLeft = region.connections.some(cid => {
          const t = REGION_CONFIG.find(r => r.id === cid);
          return t && t.gridX === region.gridX - 1 && t.gridY === region.gridY;
      });
      if (hasLeft) {
          // Gate on Left Wall
          const gx = startX;
          const gy = startY + center;
          createGate(grid, gx, gy, 'portal');
      }

      // Bottom Connection (to gridY + 1) - Plateau-5 to Istvan-1
      const hasBottom = region.connections.some(cid => {
          const t = REGION_CONFIG.find(r => r.id === cid);
          return t && t.gridX === region.gridX && t.gridY === region.gridY + 1;
      });
      if (hasBottom) {
          // Gate on Bottom Wall
          const gx = startX + center;
          const gy = startY + REGION_SIZE - 1;
          createGate(grid, gx, gy, 'portal');
      }

      // Top Connection (to gridY - 1) - Istvan-1 to Plateau-5
      const hasTop = region.connections.some(cid => {
          const t = REGION_CONFIG.find(r => r.id === cid);
          return t && t.gridX === region.gridX && t.gridY === region.gridY - 1;
      });
      if (hasTop) {
          // Gate on Top Wall
          const gx = startX + center;
          const gy = startY;
          createGate(grid, gx, gy, 'portal');
      }

      // 4. Spawn Collectibles
      spawnCollectiblesInRegion(grid, startX, startY, region.id);
  });

  return grid;
};

const spawnCollectiblesInRegion = (grid: GridCell[][], startX: number, startY: number, regionId: string) => {
    // Helper to spawn item
    const spawn = (type: CollectibleType, count: number, minAmt: number, maxAmt: number) => {
        let placed = 0;
        let attempts = 0;
        while (placed < count && attempts < 100) {
            attempts++;
            const rx = Math.floor(Math.random() * (REGION_SIZE - 2)) + 1; // 1 to 28
            const ry = Math.floor(Math.random() * (REGION_SIZE - 2)) + 1;
            
            // Check Camp Safety Zone for Plateau-1
            if (regionId === 'plateau-1' && rx < 10 && ry < 10) continue;

            const gx = startX + rx;
            const gy = startY + ry;

            if (grid[gy][gx] && 
                grid[gy][gx].isWalkable && 
                !grid[gy][gx].hasBuilding && 
                !grid[gy][gx].hasEnemy && 
                !grid[gy][gx].collectible
            ) {
                const amount = type === 'pokeball' ? 1 : Math.floor(Math.random() * (maxAmt - minAmt + 1)) + minAmt;
                grid[gy][gx].collectible = { type, amount };
                placed++;
            }
        }
    };

    spawn('wood', RESOURCE_CONFIG.WOOD.count, RESOURCE_CONFIG.WOOD.min, RESOURCE_CONFIG.WOOD.max);
    spawn('ore', RESOURCE_CONFIG.ORE.count, RESOURCE_CONFIG.ORE.min, RESOURCE_CONFIG.ORE.max);
    spawn('pokeball', RESOURCE_CONFIG.POKEBALL.count, 1, 1);
};

const createGate = (grid: GridCell[][], gx: number, gy: number, type: BuildingType) => {
    // Create a 3-wide gate for easier access
    for (let i = -1; i <= 1; i++) {
        // Horizontal gate (vertical wall) or Vertical gate (horizontal wall)?
        // Simple heuristic: clear 3x3 around center to be safe, or just 3 cells along the wall.
        // We know the exact coordinate on the wall.
        // Let's check which axis is the wall.
        // If gx % REGION_SIZE === 0 or REGION_SIZE-1 -> Vertical Wall -> Vary Y
        // If gy % REGION_SIZE === 0 or REGION_SIZE-1 -> Horizontal Wall -> Vary X
        
        // Actually, we passed the exact wall coordinate.
        // Let's just make the specific cell and neighbors open.
        // We need to be careful not to open into the void if it's a corner, but gates are usually centered.
        
        let tx = gx;
        let ty = gy;
        
        // Determine orientation based on wall position
        if (gx % REGION_SIZE === 0 || gx % REGION_SIZE === REGION_SIZE - 1) {
            // Vertical Wall, extend in Y
            ty = gy + i;
        } else {
            // Horizontal Wall, extend in X
            tx = gx + i;
        }

        if (grid[ty] && grid[ty][tx]) {
            grid[ty][tx].type = 'grass'; // Gate floor
            grid[ty][tx].isWalkable = true;
            grid[ty][tx].hasBuilding = true;
            grid[ty][tx].buildingType = type;
            grid[ty][tx].hasEnemy = false;
        }
    }
};
