import React, { useEffect, useState } from 'react';
import { useBattleStore, BattleUnit } from '@/store/useBattleStore';
import { cn } from '@/lib/utils';
import { Heart, Zap, Shield, Swords } from 'lucide-react';
import { TYPE_CHART } from '@/data/constants';

const UnitCard = ({ unit, isNext }: { unit: BattleUnit; isNext: boolean }) => {
  const hpPercent = (unit.currentHp / unit.maxHp) * 100;
  
  return (
    <div className={cn(
      "relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 w-24 sm:w-32",
      unit.isDead ? "opacity-30 grayscale" : "opacity-100",
      isNext ? "scale-110 ring-4 ring-yellow-400 z-10" : "scale-100",
      unit.team === 'player' ? "bg-slate-800 border-2 border-blue-500" : "bg-slate-800 border-2 border-red-500"
    )}>
      {/* Action Bar (Simple visual) */}
      <div className="absolute -top-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-400 transition-all duration-300" 
          style={{ width: `${Math.max(0, 100 - (unit.actionValue / 100))}%` }} 
        />
      </div>

      {/* Sprite (Placeholder if image fails) */}
      <div className="w-16 h-16 mb-2 relative">
        <img src={unit.sprite} alt={unit.name} className="w-full h-full object-contain pixelated" />
      </div>
      
      {/* Info */}
      <div className="text-xs font-bold text-white mb-1 truncate w-full text-center">{unit.name}</div>
      <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
         <span className={cn(
           "px-1 rounded text-black font-bold",
           unit.element === 'Fire' && "bg-red-500",
           unit.element === 'Water' && "bg-blue-500",
           unit.element === 'Wind' && "bg-green-500",
           unit.element === 'Light' && "bg-yellow-400",
           unit.element === 'Dark' && "bg-purple-600",
         )}>{unit.element}</span>
         Lv.{unit.level}
      </div>

      {/* HP Bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
        <div 
          className={cn("h-full transition-all duration-500", 
            hpPercent > 50 ? "bg-green-500" : hpPercent > 20 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
      <div className="text-[10px] text-gray-300">{unit.currentHp}/{unit.maxHp}</div>
    </div>
  );
};

export const BattleScene: React.FC<{ onBattleEnd: (winner: 'player' | 'enemy') => void }> = ({ onBattleEnd }) => {
  const { 
    units, 
    actionQueue, 
    logs, 
    isActive, 
    winner, 
    nextTurn, 
    isPaused 
  } = useBattleStore();

  // Auto-battle loop
  useEffect(() => {
    if (!isActive || isPaused || winner) return;

    const timer = setInterval(() => {
      nextTurn();
    }, 1000); // 1 second per turn

    return () => clearInterval(timer);
  }, [isActive, isPaused, winner, nextTurn]);

  // Handle battle end
  useEffect(() => {
    if (winner) {
      setTimeout(() => {
        onBattleEnd(winner);
      }, 2000);
    }
  }, [winner, onBattleEnd]);

  const playerUnits = units.filter(u => u.team === 'player');
  const enemyUnits = units.filter(u => u.team === 'enemy');
  const nextActorId = actionQueue[0];

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative overflow-hidden">
      {/* Background (Dungeon) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50" />
      
      {/* Top Bar: Turn Order / Status */}
      <div className="z-10 bg-black/50 p-2 backdrop-blur-sm flex justify-between items-center border-b border-white/10">
        <h2 className="text-white font-bold text-lg">Battle!</h2>
        <div className="text-xs text-gray-400">Auto-Battle Active</div>
      </div>

      {/* Battle Field */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10 p-4">
        {/* Enemy Side */}
        <div className="flex gap-4 justify-center flex-wrap">
          {enemyUnits.map(u => (
            <UnitCard key={u.instanceId} unit={u} isNext={u.instanceId === nextActorId} />
          ))}
        </div>

        {/* VS / Info */}
        <div className="text-2xl font-bold text-white/20 italic">VS</div>

        {/* Player Side */}
        <div className="flex gap-4 justify-center flex-wrap">
          {playerUnits.map(u => (
            <UnitCard key={u.instanceId} unit={u} isNext={u.instanceId === nextActorId} />
          ))}
        </div>
      </div>

      {/* Logs / Bottom Panel */}
      <div className="h-1/3 bg-black/80 border-t-2 border-slate-700 z-20 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className={cn(
              "border-l-2 pl-2",
              log.type === 'damage' && "border-red-500 text-red-200",
              log.type === 'kill' && "border-purple-500 text-purple-400 font-bold",
              log.type === 'heal' && "border-green-500 text-green-200",
              log.type === 'info' && "border-blue-500 text-blue-200"
            )}>
              {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Victory Overlay */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center flex-col animate-in fade-in duration-500">
          <h1 className={cn(
            "text-4xl font-bold mb-4",
            winner === 'player' ? "text-yellow-400" : "text-red-600"
          )}>
            {winner === 'player' ? 'VICTORY!' : 'DEFEATED...'}
          </h1>
          <p className="text-white animate-pulse">Returning to map...</p>
        </div>
      )}
    </div>
  );
};
