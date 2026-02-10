import React, { useEffect, useState } from 'react';
import { useBattleStore, BATTLE_WIDTH, BATTLE_HEIGHT, BattleUnit, VisualEffect } from '@/store/useBattleStore';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';

// Helper for color by element
const getElementColor = (element: string) => {
    switch (element) {
        case 'Fire': return 'bg-red-500 shadow-red-500';
        case 'Water': return 'bg-blue-500 shadow-blue-500';
        case 'Wind': return 'bg-green-500 shadow-green-500';
        case 'Light': return 'bg-yellow-400 shadow-yellow-400';
        case 'Dark': return 'bg-purple-600 shadow-purple-600';
        default: return 'bg-white shadow-white';
    }
};

// ... (Projectile and FloatUp components remain the same)
const Projectile: React.FC<{ effect: VisualEffect; onComplete: () => void }> = ({ effect, onComplete }) => {
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            setStarted(true);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    const sourceStyle: React.CSSProperties = {
        left: `calc(8px + (100% - 16px) / ${BATTLE_WIDTH} * ${effect.sourcePos.x - 1})`,
        top: `calc(8px + (100% - 16px) / ${BATTLE_HEIGHT} * ${effect.sourcePos.y - 1})`,
        opacity: 0,
        transform: 'scale(0.5)'
    };

    const targetStyle: React.CSSProperties = {
        left: `calc(8px + (100% - 16px) / ${BATTLE_WIDTH} * ${effect.targetPos.x - 1})`,
        top: `calc(8px + (100% - 16px) / ${BATTLE_HEIGHT} * ${effect.targetPos.y - 1})`,
        opacity: 1,
        transform: 'scale(1)'
    };

    return (
        <div 
            className={cn(
                "absolute w-4 h-4 rounded-full shadow-[0_0_10px] z-50",
                getElementColor(effect.element || 'Normal')
            )}
            style={{
                width: `calc((100% - 16px) / ${BATTLE_WIDTH} - 12px)`, 
                height: `calc((100% - 16px) / ${BATTLE_HEIGHT} - 12px)`,
                transition: `all ${effect.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                ...(started ? targetStyle : sourceStyle)
            }}
            onTransitionEnd={onComplete}
        />
    );
};

const FloatUp: React.FC<{ effect: VisualEffect; children: React.ReactNode; onComplete: () => void }> = ({ effect, children, onComplete }) => {
    const [started, setStarted] = useState(false);
    
    useEffect(() => {
        const raf = requestAnimationFrame(() => setStarted(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div 
            className={cn("absolute font-bold text-2xl transition-all ease-out z-50", 
                effect.type === 'heal' ? "text-green-400" : "text-yellow-400"
            )}
            style={{
                left: `calc(8px + (100% - 16px) / ${BATTLE_WIDTH} * ${effect.targetPos.x - 1})`,
                top: `calc(8px + (100% - 16px) / ${BATTLE_HEIGHT} * ${effect.targetPos.y - 1})`,
                transform: started ? 'translateY(-30px)' : 'translateY(0)',
                opacity: started ? 0 : 1,
                transitionDuration: `${effect.duration}ms`
            }}
            onTransitionEnd={onComplete}
        >
            {children}
        </div>
    );
};

// Capture Interface Component
const CaptureInterface: React.FC<{ 
    enemies: BattleUnit[]; 
    onCapture: (target: BattleUnit) => void; 
    onLeave: () => void;
    pokeballs: number;
}> = ({ enemies, onCapture, onLeave, pokeballs }) => {
    // Auto-select if only one enemy
    const [selectedId, setSelectedId] = useState<string | null>(enemies.length === 1 ? enemies[0].instanceId : null);

    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">Victory!</h2>
            <p className="text-gray-300 mb-6">Choose a Pokemon to capture ({pokeballs} Poke Balls left)</p>
            
            <div className="flex gap-4 mb-8 overflow-x-auto p-4 max-w-full">
                {enemies.map(unit => (
                    <div 
                        key={unit.instanceId}
                        onClick={() => setSelectedId(unit.instanceId)}
                        className={cn(
                            "relative w-32 h-40 bg-slate-800 rounded-xl border-2 flex flex-col items-center p-4 cursor-pointer transition-all hover:scale-105",
                            selectedId === unit.instanceId ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "border-slate-700 opacity-80 hover:opacity-100"
                        )}
                    >
                        <div className="w-20 h-20 mb-2 relative">
                             <img src={unit.sprite} alt={unit.name} className="w-full h-full object-contain pixelated" />
                             {unit.isDead && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                     <span className="text-red-500 font-bold -rotate-12 border-2 border-red-500 px-1 rounded">FAINTED</span>
                                 </div>
                             )}
                        </div>
                        <div className="text-sm font-bold text-white truncate w-full text-center">{unit.name}</div>
                        <div className="text-xs text-gray-400">Lv.{unit.level}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={onLeave}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                    Release All
                </button>
                <button 
                    disabled={!selectedId || pokeballs <= 0}
                    onClick={() => {
                        const target = enemies.find(e => e.instanceId === selectedId);
                        if (target) onCapture(target);
                    }}
                    className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/50"
                >
                    Capture!
                </button>
            </div>
        </div>
    );
};

export const BattleScene: React.FC<{ onBattleEnd: (winner: 'player' | 'enemy') => void }> = ({ onBattleEnd }) => {
  const { 
    units, 
    actionQueue, 
    logs, 
    visualEffects,
    isActive, 
    winner, 
    nextTurn, 
    isPaused,
    clearEffect 
  } = useBattleStore();
  
  const { addPokemon, inventory, removeItem } = usePlayerStore();
  const [showCapture, setShowCapture] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // Auto-battle loop
  useEffect(() => {
    if (!isActive || isPaused || winner) return;
    const timer = setInterval(() => { nextTurn(); }, 1000);
    return () => clearInterval(timer);
  }, [isActive, isPaused, winner, nextTurn]);

  // Handle battle end -> Trigger Capture Phase
  useEffect(() => {
    if (winner === 'player') {
        // Delay slightly to show final kill
        setTimeout(() => setShowCapture(true), 1000);
    } else if (winner === 'enemy') {
        setTimeout(() => onBattleEnd('enemy'), 2000);
    }
  }, [winner, onBattleEnd]);

  // Select a random catchable enemy
  const [catchableTarget, setCatchableTarget] = useState<BattleUnit | null>(null);
  
  useEffect(() => {
      if (showCapture && !catchableTarget) {
          // If we are showing capture, we should allow user to select ANY surviving enemy?
          // Or just one random one?
          // User request was "limit capture to one random survivor" previously.
          // BUT wait, if we are in this state, the user should be able to click on the list.
          
          // The previous logic was: "Select a random catchable enemy" and set it as `catchableTarget`.
          // Then pass `[catchableTarget]` to `CaptureInterface`.
          // This effectively forces the user to only see ONE option.
          
          // Is the issue that `catchableTarget` is not being set correctly?
          const enemyUnits = units.filter(u => u.team === 'enemy'); // Should we filter dead ones? Maybe capture dead ones is fine in Pokemon logic? usually no. 
          // Let's assume we capture ANY enemy that was in battle (dead or alive).
          
          if (enemyUnits.length > 0) {
              const randomEnemy = enemyUnits[Math.floor(Math.random() * enemyUnits.length)];
              setCatchableTarget(randomEnemy);
          }
      }
  }, [showCapture, units, catchableTarget]);

  // Capture Interface Component needs to handle selection properly
  // In `CaptureInterface`, we have `const [selectedId, setSelectedId] = useState<string | null>(null);`
  // But we pass `enemies={[catchableTarget]}` which is an array of 1.
  // The user must CLICK that one enemy to select it (setting `selectedId`).
  // If they don't click, `selectedId` is null, and button is disabled.
  
  // FIX: Auto-select the single target if there is only one.
  // Or ensure the click works.
  
  // Let's modify CaptureInterface to auto-select if only 1 enemy.
  
  const handleCapture = (target: BattleUnit) => {
      // Deduct Ball
      const ball = inventory.find(i => i.id === 'pokeball');
      if (!ball || ball.count <= 0) return;
      removeItem('pokeball', 1);

      setCapturing(true);

      // Simple Probability Logic: 90% base - 5% per level diff (if target is higher)
      // Assuming player level 5 for now as baseline or avg team level
      const playerAvgLevel = 5; 
      const levelDiff = Math.max(0, target.level - playerAvgLevel);
      const successRate = 0.9 - (levelDiff * 0.05);
      const isSuccess = Math.random() < successRate;

      // Simulate Animation Delay
      setTimeout(() => {
          if (isSuccess) {
              const { instanceId, currentHp, maxHp, actionValue, team, isDead, position, ...basePokemon } = target;
              // Reset stats for capture
              const newPokemon = {
                  ...basePokemon,
                  isWild: false,
                  stats: { ...basePokemon.stats, hp: basePokemon.stats.maxHp } // Full heal on capture? Or keep low? Let's full heal.
              };
              addPokemon(newPokemon as any);
              alert(`Gotcha! ${target.name} was caught!`);
              onBattleEnd('player');
          } else {
              alert(`Oh no! The Pokemon broke free!`);
              onBattleEnd('player'); // Only 1 chance
          }
          setCapturing(false);
      }, 1500); // Animation duration
  };

  const nextActorId = actionQueue[0];
  const firstActor = units.find(u => u.instanceId === nextActorId);
  
  // ... (Batch logic)
  const batchActorIds = React.useMemo(() => {
    if (!firstActor) return [];
    const batch: string[] = [];
    for (const id of actionQueue) {
        const u = units.find(unit => unit.instanceId === id);
        if (u && !u.isDead && u.team === firstActor.team) {
            batch.push(id);
        } else {
            break;
        }
    }
    return batch;
  }, [actionQueue, units, firstActor]);

  const getUnit = (id: string) => units.find(u => u.instanceId === id);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative overflow-hidden">
      {/* Background (Dungeon) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50" />
      
      {/* Capture Overlay */}
      {showCapture && !capturing && catchableTarget && (
          <CaptureInterface 
              enemies={[catchableTarget]} // Only pass the single random target
              onCapture={handleCapture}
              onLeave={() => onBattleEnd('player')}
              pokeballs={inventory.find(i => i.id === 'pokeball')?.count || 0}
          />
      )}
      
      {/* Capture Animation Overlay */}
      {capturing && (
          <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-black animate-bounce relative overflow-hidden">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-black" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-black rounded-full" />
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600" />
              </div>
          </div>
      )}

      {/* Top Bar: Turn Order Axis */}
      <div className="z-20 bg-black/80 p-2 backdrop-blur-sm flex flex-col gap-1 border-b border-white/10">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-white font-bold text-lg leading-none">Battle!</h2>
            <div className="text-xs text-gray-400">Auto-Battle Active</div>
        </div>
        
        {/* Action Axis */}
            <div className="w-full h-12 bg-slate-800/50 rounded-lg flex items-center px-2 gap-2 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest absolute right-2 top-1/2 -translate-y-1/2 opacity-20">Action Order</div>
                
                {actionQueue.slice(0, 10).map((id, index) => {
                    const unit = getUnit(id);
                    if (!unit) return null;
                    return (
                        <div 
                            key={`${id}-${index}`} 
                            className={cn(
                                "relative flex-shrink-0 w-10 h-10 rounded border-2 overflow-hidden transition-all duration-300",
                                index === 0 ? "scale-110 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10" : "border-slate-600 opacity-80",
                                unit.team === 'player' ? "bg-slate-700" : "bg-red-900/50"
                            )}
                        >
                            <img src={unit.sprite} alt={unit.name} className="w-full h-full object-contain pixelated" />
                            {/* Team Dot */}
                            <div className={cn(
                                "absolute top-0 right-0 w-2 h-2 rounded-bl",
                                unit.team === 'player' ? "bg-blue-500" : "bg-red-500"
                            )} />
                        </div>
                    );
                })}
            </div>
        </div>

      {/* Battle Field Container */}
      <div className="flex-1 flex items-center justify-center z-10 p-4 overflow-hidden">
        <div 
            className="relative bg-slate-800/50 p-2 rounded-lg border border-slate-700 shadow-2xl"
            style={{
                width: '100%',
                maxWidth: '600px', // Limit width for better aspect ratio
                aspectRatio: `${BATTLE_WIDTH}/${BATTLE_HEIGHT}`
            }}
        >
            {/* 1. Grid Layer (Background) */}
            <div 
                className="absolute inset-0 grid gap-1 p-2"
                style={{
                    gridTemplateColumns: `repeat(${BATTLE_WIDTH}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${BATTLE_HEIGHT}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: BATTLE_WIDTH * BATTLE_HEIGHT }).map((_, idx) => {
                    const x = (idx % BATTLE_WIDTH) + 1; // 1-based x
                    const y = Math.floor(idx / BATTLE_WIDTH) + 1; // 1-based y
                    return (
                        <div 
                            key={`grid-${x}-${y}`} 
                            className="relative border border-white/5 bg-white/5 rounded-sm flex items-center justify-center overflow-hidden"
                        >
                            <span className="absolute top-0 left-1 text-[8px] text-gray-600 font-mono select-none">{x},{y}</span>
                        </div>
                    );
                })}
            </div>

            {/* 2. Unit Layer (Overlays) */}
            <div className="absolute inset-0 p-2 pointer-events-none"> 
                {/* Need same padding/gap structure to align perfectly. 
                    Best way is to use percentage based positioning. 
                    Grid gap makes it tricky. 
                    Simpler approach: Calculate % positions assuming uniform grid.
                */}
                {units.filter(u => !u.isDead).map(unit => {
                     // Calculate position percentage
                     // 1-based index to 0-based for calc
                     // Width of one cell = 100% / WIDTH
                     // We need to account for gap... 
                     // Actually, if we use the same grid container for units but with gridColumn/Row start, 
                     // CSS Grid handles the gaps for us!
                     
                     return (
                        <div
                            key={unit.instanceId}
                            className={cn(
                                "absolute transition-all duration-500 ease-in-out flex flex-col items-center justify-center p-1",
                                batchActorIds.includes(unit.instanceId) ? "z-30 scale-110" : "z-10"
                            )}
                            style={{
                                width: `calc((100% - 16px) / ${BATTLE_WIDTH} - 4px)`, // Approx width: (Total - Padding) / Count - Gap
                                height: `calc((100% - 16px) / ${BATTLE_HEIGHT} - 4px)`,
                                left: `calc(8px + (100% - 16px) / ${BATTLE_WIDTH} * ${unit.position.x - 1})`,
                                top: `calc(8px + (100% - 16px) / ${BATTLE_HEIGHT} * ${unit.position.y - 1})`,
                                // Note: The gap logic in calc is simplified, might be slightly off pixel-perfectly but good for animation
                            }}
                        >
                            {/* Sprite */}
                            <img 
                                src={unit.sprite} 
                                alt={unit.name}
                                className={cn(
                                    "w-full h-full object-contain pixelated drop-shadow-lg",
                                    unit.team === 'enemy' ? "scale-x-[-1]" : ""
                                )} 
                            />
                            
                            {/* Indicators */}
                            <div className="absolute bottom-0 w-full px-1 mb-1">
                                <div className="h-1 bg-gray-700 rounded-full overflow-hidden w-full">
                                    <div 
                                        className={cn("h-full transition-all duration-300", 
                                            (unit.currentHp/unit.maxHp) > 0.5 ? "bg-green-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }} 
                                    />
                                </div>
                            </div>

                            {/* Team Marker */}
                            <div className={cn(
                                "absolute top-1 right-1 w-2 h-2 rounded-full border border-black/50 shadow-sm",
                                unit.team === 'player' ? "bg-blue-500" : "bg-red-500"
                            )} />
                            
                            {/* Action Ready Indicator */}
                            {batchActorIds.includes(unit.instanceId) && (
                                <div className="absolute inset-0 border-2 border-yellow-400 rounded animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                            )}
                        </div>
                     );
                })}

                {/* 3. VFX Layer */}
                <div className="absolute inset-0 pointer-events-none z-50">
                    {visualEffects.map(effect => {
                        const isProjectile = effect.type === 'projectile';
                        const isAOE = effect.type === 'aoe';
                        const isBuff = effect.type === 'buff';
                        const isHeal = effect.type === 'heal';
                        
                        // Simple animation using CSS keyframes or transition?
                        // React key-based mounting triggers animation
                        
                        return (
                            <div key={effect.id} className="absolute inset-0 overflow-hidden pointer-events-none">
                                {/* Projectile: Moves from Source to Target */}
                            {isProjectile && (
                                <Projectile effect={effect} onComplete={() => clearEffect(effect.id)} />
                            )}
                            
                            {/* AOE: Large explosion at target */}
                            {isAOE && (
                                <div 
                                    className={cn(
                                        "absolute rounded-full opacity-50 animate-ping",
                                        getElementColor(effect.element || 'Normal')
                                    )}
                                    style={{
                                        // 3x3 area approx. 
                                        // Logic: 3 cells width + 2 gaps. 
                                        // But since we use % based calc: (Total / Width) * 3
                                        width: `calc(((100% - 16px) / ${BATTLE_WIDTH}) * 3)`,
                                        height: `calc(((100% - 16px) / ${BATTLE_HEIGHT}) * 3)`,
                                        // Center on target (x-1) then shift left by 1 cell width
                                        left: `calc(8px + ((100% - 16px) / ${BATTLE_WIDTH}) * (${effect.targetPos.x - 1} - 1))`,
                                        top: `calc(8px + ((100% - 16px) / ${BATTLE_HEIGHT}) * (${effect.targetPos.y - 1} - 1))`,
                                        animationIterationCount: 1, // Ensure it plays only once!
                                    }}
                                    onAnimationEnd={() => clearEffect(effect.id)}
                                />
                            )}
                            
                            {/* Heal/Buff: Rising particles */}
                            {(isHeal || isBuff) && (
                                <FloatUp effect={effect} onComplete={() => clearEffect(effect.id)}>
                                    {isHeal ? '++' : '^^'}
                                </FloatUp>
                            )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
      </div>

      {/* Logs / Bottom Panel */}
      <div className="h-1/3 bg-black/80 border-t-2 border-slate-700 z-20 flex flex-col font-mono text-sm">
        <div className="bg-slate-800 px-2 py-1 text-xs text-gray-400 border-b border-slate-700">Battle Log</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
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

      {/* Victory Overlay (REMOVED: Handled by CaptureInterface now) */}
      {winner && winner === 'enemy' && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center flex-col animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold mb-4 text-red-600">DEFEATED...</h1>
          <p className="text-white animate-pulse">Returning to map...</p>
        </div>
      )}
    </div>
  );
};
