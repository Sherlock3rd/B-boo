import { GridCell, CellType, Pokemon } from '@/types';
import { MAP_WIDTH, MAP_HEIGHT } from '@/data/constants';
import { WILD_POKEMON_POOL, INITIAL_PLATEAU_POOL, ISTVAN_V_POOL } from '@/data/pokemon';

export const generateMap = (_zoneId: number): GridCell[][] => {
  const grid: GridCell[][] = [];
  
  const SPLIT_X = Math.floor(MAP_WIDTH / 2);
  const CONNECTION_Y = Math.floor(MAP_HEIGHT / 2);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let type: CellType = 'grass';
      let isWalkable = true;
      let hasEnemy = false;
      let enemyCount = 0;
      let enemyGroup: Pokemon[] = [];

      // 1. Terrain Generation
      if (x < SPLIT_X) {
        // ZONE 1: Initial Plateau (Grass dominant)
        if (Math.random() < 0.1) {
             type = 'forest'; // Obstacles in plateau
             isWalkable = true; // Forests are walkable but maybe slower? keeping walkable for now
        }
        if (Math.random() < 0.05) {
            type = 'wall';
            isWalkable = false;
        }
      } else {
        // ZONE 2: Istvan V (Wasteland/Mountain)
        type = 'mountain';
        // Some clear paths in mountain
        if (Math.random() < 0.6) {
             type = 'grass'; // Representing dry land
        } else {
             isWalkable = false; // Dense mountains block
        }
      }

      // 2. The Great Divider
      if (x === SPLIT_X) {
          type = 'wall';
          isWalkable = false;
          // Connection Point
          if (y === CONNECTION_Y) {
              type = 'grass'; // or 'bridge'
              isWalkable = true;
          }
      }

      // 3. Enemy Generation
      if (isWalkable && x !== SPLIT_X) { // Don't spawn on divider
        hasEnemy = Math.random() < 0.05;
        if (hasEnemy) {
            let pool = WILD_POKEMON_POOL;

            if (x < SPLIT_X) {
                // ZONE 1: Initial Plateau
                // Pool: 5 Base Forms
                pool = INITIAL_PLATEAU_POOL;

                // Weighted Spawns: 1: 40%, 2: 40%, 3-4: 20%
                const r = Math.random();
                if (r < 0.4) enemyCount = 1;
                else if (r < 0.8) enemyCount = 2;
                else enemyCount = Math.floor(Math.random() * 2) + 3; // 3 or 4
            } else {
                // ZONE 2: Istvan V
                // Pool: 5 Evolved Forms
                pool = ISTVAN_V_POOL;

                // Istvan V: 1-10 enemies
                enemyCount = Math.floor(Math.random() * 10) + 1;
            }

            // Pre-generate Enemy Group for Preview
            enemyGroup = Array(enemyCount).fill(0).map(() => {
                const base = pool[Math.floor(Math.random() * pool.length)];
                return { ...base }; // Keep base ID for now, sanitized in BattleScene/GridMap logic if needed
            });
        }
      }

      row.push({
        x,
        y,
        type,
        isWalkable,
        hasEnemy,
        enemyCount,
        enemyGroup, // Store the pre-generated group
      });
    }
    grid.push(row);
  }

  return grid;
};
