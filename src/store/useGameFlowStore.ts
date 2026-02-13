import { create } from 'zustand';
import { BuildingType } from '@/types';

type Scene = 'map' | 'battle' | 'menu' | 'team';

interface GameFlowState {
  scene: Scene;
  setScene: (scene: Scene) => void;
  encounterLocation: { x: number, y: number } | null;
  setEncounterLocation: (x: number, y: number) => void;
  clearEncounterLocation: () => void;
  
  activeBuilding: BuildingType | null;
  setBuildingInteraction: (type: BuildingType | null) => void;
}

export const useGameFlowStore = create<GameFlowState>((set) => ({
  scene: 'map',
  setScene: (scene) => set({ scene }),
  encounterLocation: null,
  setEncounterLocation: (x, y) => set({ encounterLocation: { x, y } }),
  clearEncounterLocation: () => set({ encounterLocation: null }),
  
  activeBuilding: null,
  setBuildingInteraction: (type) => set({ activeBuilding: type }),
}));
