import { create } from 'zustand';
import { Player, Pokemon, Item } from '@/types';

// Level 1-30 Exp Table
const EXP_TABLE: number[] = [
    0, 100, 200, 500, 1000, 
    2000, 3500, 5500, 8000, 11000,
    15000, 20000, 26000, 33000, 41000,
    50000, 60000, 71000, 83000, 96000,
    110000, 125000, 141000, 158000, 176000,
    195000, 215000, 236000, 258000, 281000
];

export type BuildingType = 'camp_center' | 'lumber_mill' | 'mine' | 'mana_well' | 'workshop' | 'tent';

export interface BuildingState {
    level: number;
    assignedPokemonId?: string;
    lastCollected?: number; // Timestamp
}

interface PlayerState extends Player {
  // New Stats
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
  
  wood: number;
  ore: number;
  
  // Mana System
  mana: number; // Carried Mana (on player)
  maxMana: number; // Max Carried Mana (50 + Level * 10)
  
  storedMana: number; // Base Stored Mana
  maxStoredMana: number; // Base Storage Cap (300)
  
  buildings: Record<BuildingType, BuildingState>;

  pokedex: string[]; // Unlocked Pokemon IDs
  storage: Pokemon[]; // Pokemon not in team
  
  // Actions
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (id: string) => void;
  moveToTeam: (pokemonId: string) => void;
  moveToStorage: (pokemonId: string) => void;
  cheatUnlockAll: (allPokemon: Pokemon[]) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string, count: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  
  // New Actions
  gainExp: (amount: number) => void;
  addResources: (res: { wood?: number, ore?: number, mana?: number, storedMana?: number }) => void;
  spendResources: (res: { wood?: number, ore?: number, mana?: number }) => boolean;
  upgradeBuilding: (type: BuildingType) => void;
  assignPokemonToBuilding: (type: BuildingType, pokemonId: string | undefined) => void;
  refillMana: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  name: 'Trainer',
  
  // New Stats Defaults
  level: 1,
  maxLevel: 30,
  exp: 0,
  maxExp: EXP_TABLE[1], // 100
  
  wood: 0,
  ore: 0,
  
  mana: 50,
  maxMana: 50, // Initial 50
  
  storedMana: 0,
  maxStoredMana: 300, // Fixed Cap

  buildings: {
      camp_center: { level: 1 },
      lumber_mill: { level: 1 },
      mine: { level: 1 },
      mana_well: { level: 1 },
      workshop: { level: 1 },
      tent: { level: 1 }
  },

  team: [],
  storage: [],
  pokedex: [],
  inventory: [
    { id: 'pokeball', name: 'Poke Ball', count: 5, type: 'consumable' }
  ],
  gold: 0,
  diamonds: 0,

  addPokemon: (pokemon) => set((state) => {
    // 1. Add Species ID to Pokedex (assume pokemon.id is the species ID)
    const newPokedex = state.pokedex.includes(pokemon.id) ? state.pokedex : [...state.pokedex, pokemon.id];
    
    // 2. Generate unique instance ID for storage/team
    // Constraint: Pokemon level cannot exceed player level
    const clampedLevel = Math.min(pokemon.level, state.level);
    
    const uniquePokemon = { 
        ...pokemon, 
        level: clampedLevel,
        id: `${pokemon.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };

    if (state.team.length < 4) {
      return { team: [...state.team, uniquePokemon], pokedex: newPokedex };
    }
    // Send to storage if team is full
    return { storage: [...state.storage, uniquePokemon], pokedex: newPokedex };
  }),

  removePokemon: (id) => set((state) => ({
    team: state.team.filter((p) => p.id !== id),
    storage: state.storage.filter((p) => p.id !== id),
  })),

  moveToTeam: (pokemonId) => set((state) => {
    // Check if Pokemon is assigned to a building
    const isAssigned = Object.values(state.buildings).some(b => b.assignedPokemonId === pokemonId);
    if (isAssigned) {
        alert("This Pokemon is currently working in a building!");
        return state;
    }

    if (state.team.length >= 4) return state;
    const pokemon = state.storage.find(p => p.id === pokemonId);
    if (!pokemon) return state;

    return {
      storage: state.storage.filter(p => p.id !== pokemonId),
      team: [...state.team, pokemon]
    };
  }),

  moveToStorage: (pokemonId) => set((state) => {
    // Check if Pokemon is assigned to a building
    const isAssigned = Object.values(state.buildings).some(b => b.assignedPokemonId === pokemonId);
    if (isAssigned) {
        alert("This Pokemon is currently working in a building!");
        return state;
    }

    // Must have at least 1 pokemon in team
    if (state.team.length <= 1) return state;
    const pokemon = state.team.find(p => p.id === pokemonId);
    if (!pokemon) return state;

    return {
      team: state.team.filter(p => p.id !== pokemonId),
      storage: [...state.storage, pokemon]
    };
  }),

  cheatUnlockAll: (allPokemon: Pokemon[]) => set((state) => {
      // 1. Unlock all pokedex
      const allIds = allPokemon.map(p => p.id);
      
      const newStorageItems = allPokemon.map(p => ({
          ...p,
          level: Math.min(p.level, state.level), // Clamp level
          id: `${p.id}-cheat-${Date.now()}-${Math.random()}`, 
      }));

      return {
          pokedex: Array.from(new Set([...state.pokedex, ...allIds])),
          storage: [...state.storage, ...newStorageItems]
      };
  }),

  addItem: (item) => set((state) => {
    const existing = state.inventory.find((i) => i.id === item.id);
    if (existing) {
      return {
        inventory: state.inventory.map((i) =>
          i.id === item.id ? { ...i, count: i.count + item.count } : i
        ),
      };
    }
    return { inventory: [...state.inventory, item] };
  }),

  removeItem: (itemId, count) => set((state) => ({
    inventory: state.inventory.map((i) =>
      i.id === itemId ? { ...i, count: Math.max(0, i.count - count) } : i
    ).filter(i => i.count > 0),
  })),

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount) => {
    const { gold } = get();
    if (gold >= amount) {
      set({ gold: gold - amount });
      return true;
    }
    return false;
  },

  // --- New Actions ---
  
  gainExp: (amount) => set((state) => {
      if (state.level >= state.maxLevel) return state;

      let newExp = state.exp + amount;
      let newLevel = state.level;
      let currentMaxExp = EXP_TABLE[newLevel];

      // Level Up Logic
      while (newExp >= currentMaxExp && newLevel < state.maxLevel) {
          newExp -= currentMaxExp;
          newLevel++;
          currentMaxExp = EXP_TABLE[newLevel];
      }
      
      // If capped
      if (newLevel >= state.maxLevel) {
          newExp = 0;
          currentMaxExp = 0;
      }
      
      // Update Max Mana on Level Up (Base 50 + 10 per level beyond 1)
      // Level 1: 50
      // Level 2: 60...
      const newMaxMana = 50 + (newLevel - 1) * 10;

      return { level: newLevel, exp: newExp, maxExp: currentMaxExp, maxMana: newMaxMana };
  }),

  addResources: (res) => set((state) => ({
      wood: state.wood + (res.wood || 0),
      ore: state.ore + (res.ore || 0),
      mana: Math.min(state.maxMana, state.mana + (res.mana || 0)), // Carried Mana
      storedMana: Math.min(state.maxStoredMana, state.storedMana + (res.storedMana || 0)) // Base Stored Mana
  })),

  spendResources: (res) => {
      const state = get();
      if (
          state.wood >= (res.wood || 0) &&
          state.ore >= (res.ore || 0) &&
          state.mana >= (res.mana || 0)
      ) {
          set({
              wood: state.wood - (res.wood || 0),
              ore: state.ore - (res.ore || 0),
              mana: state.mana - (res.mana || 0)
          });
          return true;
      }
      return false;
  },
  
  refillMana: () => set((state) => {
      const needed = state.maxMana - state.mana;
      if (needed <= 0) return state;
      
      const take = Math.min(needed, state.storedMana);
      return {
          mana: state.mana + take,
          storedMana: state.storedMana - take
      };
  }),

  upgradeBuilding: (type) => set((state) => {
      const building = state.buildings[type];
      return {
          buildings: {
              ...state.buildings,
              [type]: { ...building, level: building.level + 1 }
          }
      };
  }),

  assignPokemonToBuilding: (type, pokemonId) => set((state) => {
      const building = state.buildings[type];
      return {
          buildings: {
              ...state.buildings,
              [type]: { ...building, assignedPokemonId: pokemonId }
          }
      };
  })

}));
