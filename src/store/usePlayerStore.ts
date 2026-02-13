import { create } from 'zustand';
import { Player, Pokemon, Item, BuildingType } from '@/types';
import { getEvolutionTarget } from '@/utils/evolution';

// Level 1-30 Exp Table
const EXP_TABLE: number[] = [
    0, 100, 200, 500, 1000, 
    2000, 3500, 5500, 8000, 11000,
    15000, 20000, 26000, 33000, 41000,
    50000, 60000, 71000, 83000, 96000,
    110000, 125000, 141000, 158000, 176000,
    195000, 215000, 236000, 258000, 281000
];

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
  
  // Visual Feedback State
  floatingTextEvent: { id: number, text: string, color?: string } | null;

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
  
  // Helpers
  getPokemonById: (id: string) => Pokemon | undefined;

  // New Actions
  gainExp: (amount: number) => void;
  addResources: (res: { wood?: number, ore?: number, mana?: number, storedMana?: number }) => void;
  spendResources: (res: { wood?: number, ore?: number, mana?: number }) => boolean;
  upgradeBuilding: (type: BuildingType) => void;
  assignPokemonToBuilding: (type: BuildingType, pokemonId: string | undefined) => void;
  refillMana: () => void;
  showFloatingText: (text: string, color?: string) => void;
  swapTeamSlots: (indexA: number, indexB: number) => void;
  checkTeamEvolutions: () => void;

  // Essence & Slot Actions
  addEssence: (amount: number) => void;
  spendEssence: (amount: number) => boolean;
  getPokemonLevel: (pokemonId: string) => number;
  upgradeSlot: (slotIndex: number) => void;
  
  // Idle System
  tick: () => void;
  claimIdleRewards: () => void;
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
      tent: { level: 1 },
      teleport_point: { level: 1 },
      portal: { level: 1 }
  },

  team: [null, null, null, null],
  storage: [],
  pokedex: [],
  inventory: [
    { id: 'pokeball', name: 'Poke Ball', count: 5, type: 'consumable' }
  ],
  essence: 0,
  diamonds: 0,
  
  slotLevels: [1, 1, 1, 1],
  pendingPlayerExp: 0,
  pendingEssence: 0,

  gold: 0, // Deprecated
  floatingTextEvent: null,

  getPokemonById: (id) => {
      const { team, storage } = get();
      return team.find(p => p && p.id === id) || storage.find(p => p.id === id);
  },
  
  getPokemonLevel: (pokemonId) => {
      const { team, slotLevels } = get();
      const teamIndex = team.findIndex(p => p && p.id === pokemonId);
      
      if (teamIndex !== -1) {
          return slotLevels[teamIndex];
      }
      
      // If not in team (storage), use minimum slot level
      return Math.min(...slotLevels);
  },

  addPokemon: (pokemon) => {
    set((state) => {
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

      const emptyIndex = state.team.findIndex(p => p === null);
      if (emptyIndex !== -1) {
          const newTeam = [...state.team];
          newTeam[emptyIndex] = uniquePokemon;
          return { team: newTeam, pokedex: newPokedex };
      }

      // Send to storage if team is full
      return { storage: [...state.storage, uniquePokemon], pokedex: newPokedex };
    });
    get().checkTeamEvolutions();
  },

  removePokemon: (id) => set((state) => {
    // Release Reward: 100 Essence
    return {
      team: state.team.map((p) => p && p.id === id ? null : p),
      storage: state.storage.filter((p) => p.id !== id),
      essence: state.essence + 100 // Add reward
    };
  }),

  moveToTeam: (pokemonId) => {
    set((state) => {
      // Check if Pokemon is assigned to a building
      const isAssigned = Object.values(state.buildings).some(b => b.assignedPokemonId === pokemonId);
      if (isAssigned) {
          alert("This Pokemon is currently working in a building!");
          return state;
      }

      const emptyIndex = state.team.findIndex(p => p === null);
      if (emptyIndex === -1) return state;

      const pokemon = state.storage.find(p => p.id === pokemonId);
      if (!pokemon) return state;

      const newTeam = [...state.team];
      newTeam[emptyIndex] = pokemon;

      return {
        storage: state.storage.filter(p => p.id !== pokemonId),
        team: newTeam
      };
    });
    get().checkTeamEvolutions();
  },

  moveToStorage: (pokemonId) => set((state) => {
    // Check if Pokemon is assigned to a building
    const isAssigned = Object.values(state.buildings).some(b => b.assignedPokemonId === pokemonId);
    if (isAssigned) {
        alert("This Pokemon is currently working in a building!");
        return state;
    }

    // Must have at least 1 pokemon in team
    const teamCount = state.team.filter(Boolean).length;
    if (teamCount <= 1) return state;

    const teamIndex = state.team.findIndex(p => p && p.id === pokemonId);
    if (teamIndex === -1) return state;
    
    const pokemon = state.team[teamIndex];
    if (!pokemon) return state;

    const newTeam = [...state.team];
    newTeam[teamIndex] = null;

    return {
      team: newTeam,
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

  // New Essence Actions
  addEssence: (amount) => set((state) => ({ essence: state.essence + amount })),
  spendEssence: (amount) => {
      const { essence } = get();
      if (essence >= amount) {
          set({ essence: essence - amount });
          return true;
      }
      return false;
  },

  // Deprecated Gold Actions (Compat)
  addGold: (amount) => set((state) => ({ essence: state.essence + amount })),
  spendGold: (_amount) => false,

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

      return { 
          level: newLevel, 
          exp: newExp, 
          maxExp: currentMaxExp, 
          maxMana: newMaxMana,
          floatingTextEvent: { id: Date.now(), text: `+${amount} EXP`, color: 'yellow' } 
      };
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
  }),

  showFloatingText: (text, color) => set({
      floatingTextEvent: { id: Date.now(), text, color }
  }),
  
  // Idle System Logic
  tick: () => set((state) => {
      // Accumulate floating point values
      const newPendingExp = state.pendingPlayerExp + 1;
      const newPendingEssence = state.pendingEssence + 1;
      
      return {
          pendingPlayerExp: newPendingExp,
          pendingEssence: newPendingEssence
      };
  }),
  
  claimIdleRewards: () => {
      const { pendingPlayerExp, pendingEssence, gainExp, addEssence } = get();
      if (pendingPlayerExp >= 10) {
          gainExp(Math.floor(pendingPlayerExp));
          addEssence(Math.floor(pendingEssence));
          set({ pendingPlayerExp: 0, pendingEssence: 0 });
      }
  },
  
  upgradeSlot: (slotIndex) => {
      const { slotLevels, level, spendEssence } = get();
      const currentSlotLevel = slotLevels[slotIndex];
      
      if (currentSlotLevel >= level) {
          // Cannot exceed player level
          return;
      }
      
      // Cost Formula: 50 * 1.2^(Level-1)
      const cost = Math.floor(50 * Math.pow(1.2, currentSlotLevel - 1));
      
      if (spendEssence(cost)) {
          const newLevels = [...slotLevels] as [number, number, number, number];
          newLevels[slotIndex] += 1;
          set({ slotLevels: newLevels });
          get().checkTeamEvolutions();
      }
  },
  
  swapTeamSlots: (indexA, indexB) => {
      set((state) => {
        if (indexA < 0 || indexA >= 4 || indexB < 0 || indexB >= 4) return state;
        
        const newTeam = [...state.team];
        
        if (indexA >= newTeam.length || indexB >= newTeam.length) return state;
        
        [newTeam[indexA], newTeam[indexB]] = [newTeam[indexB], newTeam[indexA]];
        
        return { team: newTeam };
      });
      get().checkTeamEvolutions();
  },

  checkTeamEvolutions: () => {
      const { team, slotLevels, buildings } = get();
      let hasChanges = false;
      const newTeam = [...team];
      const idMap: Record<string, string> = {};

      newTeam.forEach((pokemon, index) => {
          if (!pokemon) return;

          let currentPokemon = pokemon;
          let evolved = false;
          // Slot levels might be longer than team, use index
          const slotLevel = slotLevels[index] || 1;

          while (true) {
              const speciesId = currentPokemon.id.split('-')[0];
              const target = getEvolutionTarget(speciesId, slotLevel);
              
              if (target) {
                  const oldId = currentPokemon.id;
                  const suffixIndex = oldId.indexOf('-');
                  const suffix = suffixIndex !== -1 ? oldId.substring(suffixIndex) : `-${Date.now()}`;
                  const newId = target.id + suffix;
                  
                  currentPokemon = {
                      ...target,
                      id: newId,
                      level: target.level,
                      exp: 0,
                  };
                  evolved = true;
              } else {
                  break;
              }
          }

          if (evolved) {
              hasChanges = true;
              idMap[pokemon.id] = currentPokemon.id;
              newTeam[index] = currentPokemon;
          }
      });

      if (hasChanges) {
          const newBuildings = { ...buildings };
          let buildingsChanged = false;
          (Object.keys(newBuildings) as BuildingType[]).forEach((key) => {
              const b = newBuildings[key];
              if (b.assignedPokemonId && idMap[b.assignedPokemonId]) {
                  newBuildings[key] = { ...b, assignedPokemonId: idMap[b.assignedPokemonId] };
                  buildingsChanged = true;
              }
          });

          set({ team: newTeam, buildings: buildingsChanged ? newBuildings : buildings });
          get().showFloatingText("Pokemon Evolved!", "gold");
      }
  }

}));
