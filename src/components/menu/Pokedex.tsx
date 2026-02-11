import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { POKEMON_DB } from '@/data/pokemon';
import { cn } from '@/lib/utils';
import { useGameFlowStore } from '@/store/useGameFlowStore';
import { X, Wand2 } from 'lucide-react';

export const Pokedex: React.FC = () => {
  const { pokedex, cheatUnlockAll } = usePlayerStore();
  const { setScene } = useGameFlowStore();
  
  // Convert DB to array
  const allPokemon = Object.values(POKEMON_DB);

  const handleCheat = () => {
      if (confirm('CHEAT: Unlock all Pokemon and add them to storage?')) {
          cheatUnlockAll(allPokemon);
      }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">Pokedex</h2>
        <div className="flex gap-2">
            <button 
                onClick={handleCheat}
                className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 text-white"
                title="Cheat: Unlock All"
            >
                <Wand2 className="w-6 h-6" />
            </button>
            <button onClick={() => setScene('map')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
            <X className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 pb-4">
        {allPokemon.map((p) => {
          const isUnlocked = pokedex.includes(p.id);
          
          return (
            <div key={p.id} className={cn(
              "aspect-square rounded-lg flex flex-col items-center justify-center p-2 border-2 transition-all",
              isUnlocked ? "bg-slate-800 border-blue-500" : "bg-slate-900 border-slate-800 opacity-50"
            )}>
              <div className="w-16 h-16 relative mb-2">
                {isUnlocked ? (
                  <img src={p.sprite} alt={p.name} className="w-full h-full object-contain pixelated" />
                ) : (
                  <div className="w-full h-full bg-black/50 mask-image-sprite" /> // Placeholder for silhouette
                )}
              </div>
              <div className="text-xs text-center w-full truncate">
                {isUnlocked ? p.name : '???'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-2 bg-slate-800 rounded-lg text-center text-sm text-gray-400">
        Collected: {pokedex.length} / {allPokemon.length}
      </div>
    </div>
  );
};
