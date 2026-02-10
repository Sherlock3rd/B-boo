import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useGameFlowStore } from '@/store/useGameFlowStore';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pokemon, Skill } from '@/types';

// ...

const SkillTag = ({ skill }: { skill: Skill }) => (
    <div className="group relative px-2 py-1 bg-black/40 rounded text-[10px] text-gray-300 border border-white/5 hover:border-white/20 cursor-help">
        <div className="flex items-center gap-1">
            <span className={cn(
                "w-2 h-2 rounded-full",
                skill.type === 'Fire' && "bg-red-500",
                skill.type === 'Water' && "bg-blue-500",
                skill.type === 'Wind' && "bg-green-500",
                skill.type === 'Light' && "bg-yellow-400",
                skill.type === 'Dark' && "bg-purple-600",
            )} />
            <span>{skill.name}</span>
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-600 p-2 rounded shadow-xl z-50 hidden group-hover:block pointer-events-none">
            <div className="font-bold text-white mb-1">{skill.name}</div>
            <div className="text-xs text-gray-400 mb-1">{skill.description}</div>
            <div className="flex justify-between text-[9px] text-gray-500">
                <span>Pwr: {skill.power}</span>
                <span>Acc: {skill.accuracy}%</span>
                <span>CD: {skill.cooldown}t</span>
            </div>
        </div>
    </div>
);

const PokemonCard = ({ pokemon, onClick, actionIcon }: { pokemon: Pokemon, onClick: () => void, actionIcon: React.ReactNode }) => (
  <div 
    className="relative flex flex-col p-2 bg-slate-800 rounded-lg border border-slate-700 mb-2 gap-2"
  >
    <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-900 rounded-md border border-slate-600 shrink-0">
          <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain pixelated" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate text-white">{pokemon.name}</div>
          <div className="flex gap-2 text-[10px] text-gray-400">
            <span className={cn(
               "px-1 rounded text-black font-bold",
               pokemon.element === 'Fire' && "bg-red-500",
               pokemon.element === 'Water' && "bg-blue-500",
               pokemon.element === 'Wind' && "bg-green-500",
               pokemon.element === 'Light' && "bg-yellow-400",
               pokemon.element === 'Dark' && "bg-purple-600",
            )}>{pokemon.element}</span>
            <span>Lv.{pokemon.level}</span>
          </div>
        </div>

        <button 
          onClick={onClick}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors shrink-0"
        >
          {actionIcon}
        </button>
    </div>

    {/* Skills List */}
    <div className="flex flex-wrap gap-1 mt-1 pl-[60px]">
        {pokemon.skills.map((skill, idx) => (
            <SkillTag key={`${skill.id}-${idx}`} skill={skill} />
        ))}
    </div>
  </div>
);

export const TeamEdit: React.FC = () => {
  const { team, storage, moveToStorage, moveToTeam } = usePlayerStore();
  const { setScene } = useGameFlowStore();

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Manage Team</h2>
        <button onClick={() => setScene('map')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Active Team */}
        <div className="flex-1 bg-black/20 rounded-xl p-3 border border-slate-700 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Team ({team.length}/4)</h3>
          </div>
          
          {team.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No Pokemon in team</div>
          ) : (
            team.map(p => (
              <PokemonCard 
                key={p.id} 
                pokemon={p} 
                onClick={() => moveToStorage(p.id)}
                actionIcon={<ArrowRight className="w-4 h-4 text-red-400" />}
              />
            ))
          )}
        </div>

        {/* Storage */}
        <div className="flex-1 bg-black/20 rounded-xl p-3 border border-slate-700 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Storage PC</h3>
          </div>

          {storage.length === 0 ? (
            <div className="text-center text-gray-600 py-8">Storage is empty</div>
          ) : (
            storage.map(p => (
              <PokemonCard 
                key={p.id} 
                pokemon={p} 
                onClick={() => moveToTeam(p.id)}
                actionIcon={<ArrowLeft className="w-4 h-4 text-green-400" />}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
