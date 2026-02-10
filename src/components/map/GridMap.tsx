import React, { useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { cn } from '@/lib/utils';
import { User, Skull, Trees, Mountain, BookOpen, Users } from 'lucide-react';
import { CellType } from '@/types';

import { useGameFlowStore } from '@/store/useGameFlowStore';
import { useBattleStore } from '@/store/useBattleStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { INITIAL_PLAYER_TEAM, WILD_POKEMON_POOL } from '@/data/pokemon';

// Helper for cell styling
const getCellColor = (type: CellType) => {
  switch (type) {
    case 'wall': return 'bg-slate-700';
    case 'water': return 'bg-blue-400';
    case 'forest': return 'bg-green-700';
    case 'mountain': return 'bg-stone-600';
    case 'grass':
    default: return 'bg-green-500';
  }
};

const CellIcon = ({ type }: { type: CellType }) => {
  switch (type) {
    case 'forest': return <Trees className="w-4 h-4 text-green-900 opacity-50" />;
    case 'mountain': return <Mountain className="w-4 h-4 text-stone-800 opacity-50" />;
    default: return null;
  }
};

export const GridMap: React.FC = () => {
  const { grid, playerPosition, movePlayer, initMap, checkEncounter, clearEncounter } = useMapStore();
  const { setScene } = useGameFlowStore();
  const { startBattle } = useBattleStore();
  const { team, addPokemon } = usePlayerStore();

  // Viewport Settings
  const VIEWPORT_W = 9;
  const VIEWPORT_H = 13;

  // Initialize map and team on mount if empty
  useEffect(() => {
    if (grid.length === 0) {
      initMap(1);
    }
    // Init team if empty (debug)
    if (team.length === 0) {
        INITIAL_PLAYER_TEAM.forEach(p => addPokemon(p));
    }
  }, [grid, initMap, team, addPokemon]);

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
    if (checkEncounter()) {
      const { x, y } = playerPosition;
      
      // Generate random enemies
      const enemyCount = Math.floor(Math.random() * 2) + 1; // 1-2 enemies
      const enemies = Array(enemyCount).fill(0).map(() => {
          const base = WILD_POKEMON_POOL[Math.floor(Math.random() * WILD_POKEMON_POOL.length)];
          return { ...base, id: base.id + Math.random() }; // Unique ID clone
      });

      startBattle(team, enemies);
      setScene('battle');
      
      clearEncounter(x, y);
    }
  }, [playerPosition, checkEncounter, clearEncounter, startBattle, setScene, team]);

  if (grid.length === 0) return <div>Loading Map...</div>;

  // Calculate viewport
  const startX = playerPosition.x - Math.floor(VIEWPORT_W / 2);
  const startY = playerPosition.y - Math.floor(VIEWPORT_H / 2);

  const visibleRows = Array.from({ length: VIEWPORT_H }, (_, dy) => {
    const y = startY + dy;
    return Array.from({ length: VIEWPORT_W }, (_, dx) => {
      const x = startX + dx;
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        return grid[y][x];
      }
      return null; // Void cell
    });
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden bg-black relative">
      {/* UI Overlay */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
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
        className="grid gap-1 bg-slate-900 p-2 rounded-lg shadow-2xl border-4 border-slate-700"
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

                {/* Enemy */}
                {cell.hasEnemy && !isPlayerHere && (
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <Skull className="w-8 h-8 text-red-900 drop-shadow-md" />
                  </div>
                )}

                {/* Player */}
                {isPlayerHere && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <User className="w-8 h-8 text-white drop-shadow-lg fill-white" />
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
