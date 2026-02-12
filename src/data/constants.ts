import { ElementType } from '@/types';

export const TYPE_CHART: Record<ElementType, Record<ElementType, number>> = {
  Fire: { Fire: 1, Water: 0.5, Wind: 2, Light: 1, Dark: 1 },
  Water: { Fire: 2, Water: 1, Wind: 0.5, Light: 1, Dark: 1 },
  Wind: { Fire: 0.5, Water: 2, Wind: 1, Light: 1, Dark: 1 },
  Light: { Fire: 1, Water: 1, Wind: 1, Light: 1, Dark: 2 },
  Dark: { Fire: 1, Water: 1, Wind: 1, Light: 2, Dark: 1 },
};

export const MAX_TEAM_SIZE = 4;

// --- New Map Architecture ---

export const REGION_SIZE = 30; // 30x30 squares per region

export interface RegionConfig {
    id: string;
    name: string;
    type: 'grass' | 'mountain';
    gridX: number; // Global Grid Column (0-4)
    gridY: number; // Global Grid Row (0-1)
    levelReq: number;
    connections: string[]; // IDs of connected regions
}

export const REGION_CONFIG: RegionConfig[] = [
    // --- Plateau (Row 0, Left to Right) ---
    { id: 'plateau-1', name: 'Initial Plateau 1', type: 'grass', gridX: 0, gridY: 0, levelReq: 1, connections: ['plateau-2'] },
    { id: 'plateau-2', name: 'Initial Plateau 2', type: 'grass', gridX: 1, gridY: 0, levelReq: 3, connections: ['plateau-1', 'plateau-3'] },
    { id: 'plateau-3', name: 'Initial Plateau 3', type: 'grass', gridX: 2, gridY: 0, levelReq: 5, connections: ['plateau-2', 'plateau-4'] },
    { id: 'plateau-4', name: 'Initial Plateau 4', type: 'grass', gridX: 3, gridY: 0, levelReq: 7, connections: ['plateau-3', 'plateau-5'] },
    { id: 'plateau-5', name: 'Initial Plateau 5', type: 'grass', gridX: 4, gridY: 0, levelReq: 9, connections: ['plateau-4', 'istvan-1'] },

    // --- Istvan (Row 1, Right to Left) ---
    // Note: gridX 4 aligns with Plateau-5
    { id: 'istvan-1', name: 'Istvan 1', type: 'mountain', gridX: 4, gridY: 1, levelReq: 12, connections: ['plateau-5', 'istvan-2'] },
    { id: 'istvan-2', name: 'Istvan 2', type: 'mountain', gridX: 3, gridY: 1, levelReq: 15, connections: ['istvan-1', 'istvan-3'] },
    { id: 'istvan-3', name: 'Istvan 3', type: 'mountain', gridX: 2, gridY: 1, levelReq: 18, connections: ['istvan-2', 'istvan-4'] },
    { id: 'istvan-4', name: 'Istvan 4', type: 'mountain', gridX: 1, gridY: 1, levelReq: 21, connections: ['istvan-3', 'istvan-5'] },
    { id: 'istvan-5', name: 'Istvan 5', type: 'mountain', gridX: 0, gridY: 1, levelReq: 24, connections: ['istvan-4'] },
];

export const GLOBAL_MAP_WIDTH = 5 * REGION_SIZE; // 150
export const GLOBAL_MAP_HEIGHT = 2 * REGION_SIZE; // 60
