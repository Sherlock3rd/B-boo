import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useGameFlowStore } from '@/store/useGameFlowStore';
import { X, ArrowRight, ArrowLeft, Briefcase, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pokemon, Skill } from '@/types';

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

const PokemonCard = ({ pokemon, onClick, actionIcon, isWorking, effectiveLevel, onMoveUp, onMoveDown, isFirst, isLast }: { 
    pokemon: Pokemon, 
    onClick: () => void, 
    actionIcon: React.ReactNode, 
    isWorking?: boolean, 
    effectiveLevel?: number,
    onMoveUp?: () => void,
    onMoveDown?: () => void,
    isFirst?: boolean,
    isLast?: boolean
}) => (
  <div 
    className={cn(
        "relative flex flex-col p-2 bg-slate-800 rounded-lg border border-slate-700 mb-2 gap-2",
        isWorking && "opacity-75 border-amber-900/50 bg-amber-950/10"
    )}
  >
    <div className="flex items-center gap-3">
        {/* Reorder Buttons (Only for Team) */}
        {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col gap-1">
                <button onClick={onMoveUp} disabled={isFirst} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30">
                    <ArrowUp className="w-3 h-3 text-slate-400" />
                </button>
                <button onClick={onMoveDown} disabled={isLast} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30">
                    <ArrowDown className="w-3 h-3 text-slate-400" />
                </button>
            </div>
        )}

        <div className="w-12 h-12 bg-slate-900 rounded-md border border-slate-600 shrink-0 relative">
          <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain pixelated" />
          {isWorking && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                  <Briefcase className="w-5 h-5 text-amber-500" />
              </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
              <div className="text-sm font-bold truncate text-white">{pokemon.name}</div>
              {isWorking && <span className="text-[9px] bg-amber-900 text-amber-200 px-1 rounded uppercase tracking-wider">Working</span>}
          </div>
          <div className="flex gap-2 text-[10px] text-gray-400">
            <span className={cn(
               "px-1 rounded text-black font-bold",
               pokemon.element === 'Fire' && "bg-red-500",
               pokemon.element === 'Water' && "bg-blue-500",
               pokemon.element === 'Wind' && "bg-green-500",
               pokemon.element === 'Light' && "bg-yellow-400",
               pokemon.element === 'Dark' && "bg-purple-600",
            )}>{pokemon.element}</span>
            <span className="text-yellow-400 font-bold">Lv.{effectiveLevel || pokemon.level}</span>
          </div>
        </div>

        <button 
          onClick={onClick}
          disabled={isWorking}
          className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-full transition-colors shrink-0"
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

const SlotUpgradeCard = ({ index, level, cost, onUpgrade, canAfford, isMaxed }: { 
    index: number, level: number, cost: number, onUpgrade: () => void, canAfford: boolean, isMaxed: boolean 
}) => (
    <div className="flex flex-col items-center justify-center bg-slate-800 border border-slate-700 rounded-lg p-2 gap-1 w-full h-full min-h-[80px]">
        <div className="text-[10px] text-gray-400 uppercase">Slot {index + 1}</div>
        <div className="text-xl font-bold text-yellow-400">Lv.{level}</div>
        
        {!isMaxed ? (
            <button 
                onClick={onUpgrade}
                disabled={!canAfford}
                className="w-full mt-1 flex items-center justify-center gap-1 bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 rounded px-2 py-1 text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-0.5 text-purple-300">
                    <Zap className="w-3 h-3" />
                    <span>{cost}</span>
                </div>
                <ArrowUp className="w-3 h-3 text-green-400" />
            </button>
        ) : (
            <div className="text-[10px] text-green-500 font-bold mt-1">MAX</div>
        )}
    </div>
);

export const TeamEdit: React.FC = () => {
  const { team, storage, moveToStorage, moveToTeam, buildings, slotLevels, upgradeSlot, essence, level: playerLevel, getPokemonLevel, swapTeamSlots } = usePlayerStore();
  const { setScene } = useGameFlowStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isAssigned = (id: string) => Object.values(buildings).some(b => b.assignedPokemonId === id);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
        swapTeamSlots(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Manage Team</h2>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded-full text-purple-300 text-sm font-bold">
                <Zap className="w-4 h-4 fill-current" />
                <span>{essence}</span>
             </div>
            <button onClick={() => setScene('map')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
              <X className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Slot Upgrades */}
      <div className="grid grid-cols-4 gap-2 mb-4">
          {slotLevels.map((lvl, idx) => {
              const cost = Math.floor(50 * Math.pow(1.2, lvl - 1));
              const canAfford = essence >= cost;
              const isMaxed = lvl >= playerLevel;
              return (
                  <SlotUpgradeCard 
                      key={idx}
                      index={idx}
                      level={lvl}
                      cost={cost}
                      onUpgrade={() => upgradeSlot(idx)}
                      canAfford={canAfford}
                      isMaxed={isMaxed}
                  />
              );
          })}
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Active Team */}
        <div className="flex-1 bg-black/20 rounded-xl p-3 border border-slate-700 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Team ({team.filter(Boolean).length}/4)</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Render 4 Slots explicitly to show empty ones if any */}
            {[0, 1, 2, 3].map(slotIdx => {
                const p = team[slotIdx];
                const isDragging = draggedIndex === slotIdx;
                
                return (
                    <div
                        key={`slot-${slotIdx}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, slotIdx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slotIdx)}
                        className={cn(
                            "transition-all duration-200",
                            isDragging && "opacity-50 scale-95",
                            draggedIndex !== null && draggedIndex !== slotIdx && "hover:bg-slate-800/50 rounded-lg"
                        )}
                    >
                        {!p ? (
                            <div className="p-4 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-between text-slate-600 text-sm bg-slate-900/50">
                                <span>Empty Slot (Lv.{slotLevels[slotIdx]})</span>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => swapTeamSlots(slotIdx, slotIdx - 1)} disabled={slotIdx === 0} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30">
                                        <ArrowUp className="w-3 h-3 text-slate-400" />
                                    </button>
                                    <button onClick={() => swapTeamSlots(slotIdx, slotIdx + 1)} disabled={slotIdx === 3} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30">
                                        <ArrowDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <PokemonCard 
                                pokemon={p} 
                                effectiveLevel={slotLevels[slotIdx]}
                                onClick={() => moveToStorage(p.id)}
                                isWorking={isAssigned(p.id)}
                                actionIcon={<ArrowRight className="w-4 h-4 text-red-400" />}
                                onMoveUp={() => swapTeamSlots(slotIdx, slotIdx - 1)}
                                onMoveDown={() => swapTeamSlots(slotIdx, slotIdx + 1)}
                                isFirst={slotIdx === 0}
                                isLast={slotIdx === 3}
                            />
                        )}
                    </div>
                );
            })}
          </div>
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
                effectiveLevel={getPokemonLevel(p.id)}
                onClick={() => moveToTeam(p.id)}
                isWorking={isAssigned(p.id)}
                actionIcon={<ArrowLeft className="w-4 h-4 text-green-400" />}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
