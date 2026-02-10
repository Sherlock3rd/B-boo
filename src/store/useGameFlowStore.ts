import { create } from 'zustand';

type Scene = 'map' | 'battle' | 'menu' | 'team';

interface GameFlowState {
  scene: Scene;
  setScene: (scene: Scene) => void;
}

export const useGameFlowStore = create<GameFlowState>((set) => ({
  scene: 'map',
  setScene: (scene) => set({ scene }),
}));
