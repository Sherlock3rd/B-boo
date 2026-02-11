import { create } from 'zustand';
import { Player, Pokemon, Item } from '@/types';

interface PlayerState extends Player {
  pokedex: string[]; // Unlocked Pokemon IDs
  storage: Pokemon[]; // Pokemon not in team
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (id: string) => void;
  moveToTeam: (pokemonId: string) => void;
  moveToStorage: (pokemonId: string) => void;
  cheatUnlockAll: (allPokemon: Pokemon[]) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string, count: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  name: 'Trainer',
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
    const uniquePokemon = { 
        ...pokemon, 
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
    if (state.team.length >= 4) return state;
    const pokemon = state.storage.find(p => p.id === pokemonId);
    if (!pokemon) return state;

    return {
      storage: state.storage.filter(p => p.id !== pokemonId),
      team: [...state.team, pokemon]
    };
  }),

  moveToStorage: (pokemonId) => set((state) => {
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
      
      // 2. Add one of each to storage (avoid duplicates if needed, but for cheat simply adding is fine)
      // We need to clone them to have unique instance properties if they were battle units, 
      // but here they are base data. We should probably give them unique IDs if we want to manage them individually.
      const newStorageItems = allPokemon.map(p => ({
          ...p,
          id: `${p.id}-cheat-${Date.now()}-${Math.random()}`, // Unique ID for storage instance
          // Reset stats to base if needed, but they are already base in DB
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
}));
