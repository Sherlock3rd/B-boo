import { create } from 'zustand';
import { Player, Pokemon, Item } from '@/types';

interface PlayerState extends Player {
  pokedex: string[]; // Unlocked Pokemon IDs
  storage: Pokemon[]; // Pokemon not in team
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (id: string) => void;
  moveToTeam: (pokemonId: string) => void;
  moveToStorage: (pokemonId: string) => void;
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
  inventory: [],
  gold: 0,
  diamonds: 0,

  addPokemon: (pokemon) => set((state) => {
    const newPokedex = state.pokedex.includes(pokemon.id) ? state.pokedex : [...state.pokedex, pokemon.id];
    
    if (state.team.length < 4) {
      return { team: [...state.team, pokemon], pokedex: newPokedex };
    }
    // Send to storage if team is full
    return { storage: [...state.storage, pokemon], pokedex: newPokedex };
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
