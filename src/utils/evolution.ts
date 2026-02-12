import { POKEMON_DB } from '@/data/pokemon';
import { Pokemon } from '@/types';

const EVOLUTION_CHAIN: Record<string, { targetId: string, level: number }> = {
    'charmander': { targetId: 'charmeleon', level: 16 },
    'charmeleon': { targetId: 'charizard', level: 36 },
    'squirtle': { targetId: 'wartortle', level: 16 },
    'wartortle': { targetId: 'blastoise', level: 36 },
    'bulbasaur': { targetId: 'ivysaur', level: 16 },
    'ivysaur': { targetId: 'venusaur', level: 36 },
    'vulpix': { targetId: 'ninetales', level: 30 },
    'psyduck': { targetId: 'golduck', level: 33 },
    'oddish': { targetId: 'gloom', level: 21 },
    'pikachu': { targetId: 'raichu', level: 16 },
    'magnemite': { targetId: 'magneton', level: 30 },
    'eevee': { targetId: 'umbreon', level: 16 },
    'gastly': { targetId: 'haunter', level: 25 },
    'haunter': { targetId: 'gengar', level: 35 },
};

export const getEvolutionTarget = (speciesId: string, level: number): Pokemon | null => {
    const evo = EVOLUTION_CHAIN[speciesId];
    if (evo && level >= evo.level) {
        return POKEMON_DB[evo.targetId];
    }
    return null;
};
