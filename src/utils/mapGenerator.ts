import { GridCell, CellType } from '@/types';
import { MAP_WIDTH, MAP_HEIGHT } from '@/data/constants';

export const generateMap = (zoneId: number): GridCell[][] => {
  const grid: GridCell[][] = [];
  
  // Basic generation logic based on zone type
  // For now, just fill with grass and some walls
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let type: CellType = 'grass';
      let isWalkable = true;

      // Random walls (simple noise)
      if (Math.random() < 0.1) {
        type = 'wall';
        isWalkable = false;
      }
      
      // Random enemies
      const hasEnemy = isWalkable && Math.random() < 0.05;

      row.push({
        x,
        y,
        type,
        isWalkable,
        hasEnemy,
      });
    }
    grid.push(row);
  }

  return grid;
};
