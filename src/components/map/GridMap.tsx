import React, { useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { cn } from '@/lib/utils';
import { User, Skull, Trees, Mountain, BookOpen, Users, Home, Tent, Shovel, Axe, Droplet, Hammer, Star, Coins } from 'lucide-react';
import { CellType, BuildingType } from '@/types';

// ...

const BuildingIcon = ({ type }: { type: BuildingType }) => {
    switch (type) {
        case 'camp_center': return <Home className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
        case 'lumber_mill': return <Axe className="w-5 h-5 text-amber-700" />;
        case 'mine': return <Shovel className="w-5 h-5 text-stone-400" />;
        case 'mana_well': return <Droplet className="w-5 h-5 text-blue-400 animate-pulse" />;
        case 'workshop': return <Hammer className="w-5 h-5 text-orange-400" />;
        case 'tent': return <Tent className="w-5 h-5 text-green-400" />;
        default: return null;
    }
};

const CellIcon = ({ type }: { type: CellType }) => {
  switch (type) {
    case 'forest': return <Trees className="w-4 h-4 text-green-900 opacity-50" />;
    case 'mountain': return <Mountain className="w-4 h-4 text-stone-800 opacity-50" />;
    case 'camp_floor': return null; // Clean floor for buildings
    default: return null;
  }
};

// Helper for cell styling
const getCellColor = (type: CellType) => {
  switch (type) {
    case 'wall': return 'bg-slate-700';
    case 'water': return 'bg-blue-400';
    case 'forest': return 'bg-green-700';
    case 'mountain': return 'bg-stone-600';
    case 'camp_floor': return 'bg-amber-900/40 border-amber-800/50';
    case 'grass':
    default: return 'bg-green-500';
  }
};

import { useGameFlowStore } from '@/store/useGameFlowStore';
import { useBattleStore } from '@/store/useBattleStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { INITIAL_PLAYER_TEAM, WILD_POKEMON_POOL, INITIAL_PLATEAU_POOL, ISTVAN_V_POOL } from '@/data/pokemon';
import { generatePokemon } from '@/utils/pokemonGenerator';

import { MAP_WIDTH } from '@/data/constants';

// ... (Imports)

export const GridMap: React.FC = () => {
  const { grid, playerPosition, movePlayer, initMap, checkEncounter, clearEncounter } = useMapStore();
  const { setScene } = useGameFlowStore();
  const { startBattle } = useBattleStore();
  const { team, addPokemon, level, exp, maxExp, wood, ore, mana, maxMana, gold, buildings, storage, refillMana } = usePlayerStore();

  // ...

  // Helper to find worker assigned to a specific building
  const getAssignedWorker = (buildingType: BuildingType) => {
      const building = buildings[buildingType];
      if (!building?.assignedPokemonId) return null;
      // Search in storage first (workers are usually in storage if not in team? Or both?)
      // Wait, workers can be in team too.
      return [...team, ...storage].find(p => p.id === building.assignedPokemonId);
  };

  // Viewport Settings
  const VIEWPORT_W = 9;
  const VIEWPORT_H = 13;
  
  // Calculate current Zone Name
  const SPLIT_X = Math.floor(MAP_WIDTH / 2);
  const currentZoneName = playerPosition.x < SPLIT_X ? "Initial Plateau" : "Istvan V";

  // Initialize map and team on mount if empty
  const [initialized, setInitialized] = React.useState(false);
  
  useEffect(() => {
    if (grid.length === 0) {
      initMap(1);
    }
    // Init team if strictly empty and not yet initialized in this session
    // Using a ref or state to track if we've already tried initializing might be safer 
    // but checking team.length === 0 should be enough IF strict mode doesn't double invoke.
    // However, StrictMode DOES double invoke effects.
    
    if (team.length === 0 && !initialized) {
        setInitialized(true);
        // Only add if truly empty
        if (usePlayerStore.getState().team.length === 0) {
            INITIAL_PLAYER_TEAM.forEach(p => addPokemon(generatePokemon(p)));
        }
    }
  }, [grid, initMap, team, addPokemon, initialized]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') movePlayer('up');
      if (e.key === 's' || e.key === 'ArrowDown') movePlayer('down');
      if (e.key === 'a' || e.key === 'ArrowLeft') movePlayer('left');
      if (e.key === 'd' || e.key === 'ArrowRight') movePlayer('right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Check encounters after movement
  useEffect(() => {
    // 0. Check for Camp Refill
    const { x, y } = playerPosition;
    const currentCell = grid[y]?.[x];
    if (currentCell?.type === 'camp_floor') {
        refillMana();
    }

    // 1. Check for Enemy Encounter (Only if not in camp)
    if (checkEncounter()) {
      const { x, y } = playerPosition;
      
      const cell = grid[y]?.[x]; 
      if (!cell) {
          clearEncounter(x, y);
          return;
      }
      
      if (cell.enemyGroup && cell.enemyGroup.length > 0) {
          const encounterEnemies = cell.enemyGroup.map(base => generatePokemon(base));
          startBattle(team, encounterEnemies);
      } else {
          const count = cell.enemyCount || 1;
          const enemies = Array(count).fill(0).map(() => {
              const pool = x < Math.floor(MAP_WIDTH / 2) ? INITIAL_PLATEAU_POOL : ISTVAN_V_POOL;
              const base = pool[Math.floor(Math.random() * pool.length)];
              return generatePokemon(base); 
          });
          startBattle(team, enemies);
      }
      
      useGameFlowStore.getState().setEncounterLocation(x, y);
      setScene('battle');
    }
  }, [playerPosition, checkEncounter, startBattle, setScene, team, grid, clearEncounter]);

  const handleBuildingClick = (buildingType: BuildingType, buildingX: number, buildingY: number) => {
      // Check Chebyshev distance (max of dx, dy) to be within 1 tile
      // This allows clicking on diagonals and the tile itself
      const dx = Math.abs(playerPosition.x - buildingX);
      const dy = Math.abs(playerPosition.y - buildingY);
      
      // If we are ON the tile (dx=0, dy=0) or adjacent/diagonal (dx<=1, dy<=1)
      if (dx <= 1 && dy <= 1) {
          useGameFlowStore.getState().setBuildingInteraction(buildingType);
      } else {
          console.log("Too far to interact");
      }
  };

  if (grid.length === 0) return <div>Loading Map...</div>;

  // Calculate viewport
  const startX = playerPosition.x - Math.floor(VIEWPORT_W / 2);
  const startY = playerPosition.y - Math.floor(VIEWPORT_H / 2);

  const visibleRows = Array.from({ length: VIEWPORT_H }, (_, dy) => {
    const y = startY + dy;
    return Array.from({ length: VIEWPORT_W }, (_, dx) => {
      const x = startX + dx;
      if (y >= 0 && y < grid.length && grid[y] && x >= 0 && x < grid[y].length) {
        return grid[y][x];
      }
      return null; // Void cell
    });
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden bg-black relative">
      {/* HUD: Resources & Level */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 flex flex-col gap-2 pointer-events-none">
          {/* Top Bar: Level & Resources */}
          <div className="flex justify-between items-start gap-2">
              {/* Player Status */}
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur-sm flex flex-col gap-1 min-w-[120px]">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-yellow-500">
                          <span className="font-bold text-yellow-400">{level}</span>
                      </div>
                      <div className="flex-1">
                          <div className="text-xs text-white font-bold">Trainer</div>
                          {/* EXP Bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-black">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(exp / maxExp) * 100}%` }} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Resources */}
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur-sm flex gap-3 text-xs font-bold shadow-lg">
                  <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-amber-600"><Axe className="w-3 h-3" /> {wood}</div>
                  </div>
                  <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-stone-400"><Shovel className="w-3 h-3" /> {ore}</div>
                  </div>
                  <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-blue-400"><Droplet className="w-3 h-3" /> {mana}/{maxMana}</div>
                  </div>
                  <div className="flex flex-col items-center border-l border-slate-700 pl-3">
                      <div className="flex items-center gap-1 text-yellow-400"><Coins className="w-3 h-3" /> {gold}</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Zone HUD (Moved down slightly) */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/60 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-yellow-400 font-mono tracking-widest uppercase">
              {currentZoneName}
          </h2>
          <div className="text-xs text-gray-400">
              COORD: {playerPosition.x}, {playerPosition.y}
          </div>
      </div>

      {/* UI Overlay (Buttons) */}
      <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
        <button 
          onClick={() => setScene('team')}
          className="p-3 bg-green-600 rounded-full text-white shadow-lg hover:bg-green-500 transition-transform active:scale-95"
          title="Team"
        >
          <Users className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setScene('menu')}
          className="p-3 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-transform active:scale-95"
          title="Pokedex"
        >
          <BookOpen className="w-6 h-6" />
        </button>
      </div>

      <div 
        className="grid gap-1 bg-slate-900 p-2 rounded-lg shadow-2xl border-4 border-slate-700 mt-12"
        style={{
          gridTemplateColumns: `repeat(${VIEWPORT_W}, minmax(0, 1fr))`,
          width: 'fit-content',
        }}
      >
        {visibleRows.map((row, localY) => (
          row.map((cell, localX) => {
            // If cell is null (void), render empty placeholder
            if (!cell) {
              return (
                <div 
                  key={`void-${localX}-${localY}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-black opacity-50"
                />
              );
            }

            const { x, y } = cell;
            const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
            
            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative transition-all duration-200 rounded-sm",
                  getCellColor(cell.type),
                  !cell.isWalkable && "opacity-80"
                )}
              >
                {/* Terrain Icon */}
                <CellIcon type={cell.type} />
                {/* Building Icon */}
                {cell.hasBuilding && cell.buildingType && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center z-10 animate-bounce-slow cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => handleBuildingClick(cell.buildingType!, cell.x, cell.y)}
                    >
                        <BuildingIcon type={cell.buildingType} />
                        
                        {/* Worker Pokemon (Floating nearby) */}
                        {getAssignedWorker(cell.buildingType) && (
                             <div className="absolute -top-3 -right-3 w-6 h-6 z-20 animate-pulse bg-slate-900/80 rounded-full border border-yellow-500 shadow-sm flex items-center justify-center">
                                <img 
                                    src={getAssignedWorker(cell.buildingType)!.sprite} 
                                    alt="worker" 
                                    className="w-5 h-5 object-contain pixelated"
                                />
                             </div>
                        )}
                    </div>
                )}

                {/* Enemy */}
                {cell.hasEnemy && !isPlayerHere && (
                  <div className={cn(
                      "absolute flex items-center justify-center animate-pulse z-20", // Added z-index
                      // Size logic based on enemyCount
                      cell.enemyCount && cell.enemyCount >= 9 ? "w-[300%] h-[300%] -top-[100%] -left-[100%]" :
                      cell.enemyCount && cell.enemyCount >= 4 ? "w-[200%] h-[200%] -top-[50%] -left-[50%]" :
                      "inset-0"
                  )}>
                    {/* Render Preview Sprite if available, else Skull */}
                    {cell.enemyGroup && cell.enemyGroup.length > 0 ? (
                        <img 
                            src={cell.enemyGroup[0].sprite} 
                            alt="enemy" 
                            className={cn(
                                "object-contain pixelated drop-shadow-md transition-all",
                                cell.enemyCount && cell.enemyCount >= 9 ? "w-24 h-24" :
                                cell.enemyCount && cell.enemyCount >= 4 ? "w-16 h-16" :
                                "w-10 h-10"
                            )}
                        />
                    ) : (
                        <Skull className={cn(
                            "text-red-900 drop-shadow-md transition-all",
                            cell.enemyCount && cell.enemyCount >= 9 ? "w-24 h-24" :
                            cell.enemyCount && cell.enemyCount >= 4 ? "w-16 h-16" :
                            "w-8 h-8"
                        )} />
                    )}
                    
                    {/* Count Indicator */}
                    <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded-full font-bold">
                        {cell.enemyCount}
                    </span>
                  </div>
                )}

                {/* Player */}
                {isPlayerHere && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <img 
                        src="https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif" // Placeholder or specific Trainer sprite if available.
                        // Since I don't have a reliable Ash URL handy that is guaranteed to work without hotlink protection, 
                        // I'll use a high quality trainer sprite or fallback.
                        // Let's use a generic Red/Ash style sprite if possible, or just a placeholder 'trainer' logic.
                        // Actually, user asked for "Ash" (Xiaozhi).
                        // Let's try a common sprite resource.
                        srcSet="https://play.pokemonshowdown.com/sprites/trainers/ash.png"
                        alt="Ash"
                        className="w-full h-full object-contain pixelated drop-shadow-lg"
                        onError={(e) => {
                            // Fallback to User icon if image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('fallback-icon');
                        }}
                    />
                    <User className="hidden fallback-icon:block w-8 h-8 text-white drop-shadow-lg fill-white" />
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <div className="mt-4 text-white text-sm opacity-50">
        Use WASD or Arrows to move. Red Skulls are enemies.
      </div>
    </div>
  );
};
