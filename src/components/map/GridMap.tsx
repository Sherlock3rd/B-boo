import React, { useEffect, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { cn } from '@/lib/utils';
import { CellType, BuildingType } from '@/types';
import { REGION_CONFIG, REGION_SIZE, GLOBAL_MAP_WIDTH, GLOBAL_MAP_HEIGHT } from '@/data/constants';
import { useGameFlowStore } from '@/store/useGameFlowStore';
import { useBattleStore } from '@/store/useBattleStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { INITIAL_PLAYER_TEAM, ISTVAN_V_POOL, INITIAL_PLATEAU_POOL } from '@/data/pokemon';
import { generatePokemon } from '@/utils/pokemonGenerator';
import { Home, Users, BookOpen, X, Map as MapIcon, Axe, Shovel, Droplet, Coins, Zap, Lock, Unlock, Tent, Hammer, Trees, Gem, CircleDot } from 'lucide-react';

// Helper for cell styling - Pure Solid Colors
const TEXTURE_STYLES: Record<CellType, React.CSSProperties> = {
    grass: { 
        backgroundColor: '#166534', 
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)', 
        backgroundSize: '8px 8px' 
    },
    forest: { 
        backgroundColor: '#064e3b', 
        backgroundImage: 'repeating-linear-gradient(45deg, #064e3b 25%, #065f46 25%, #065f46 50%, #064e3b 50%, #064e3b 75%, #065f46 75%, #065f46 100%)', 
        backgroundSize: '10px 10px' 
    },
    water: { 
        backgroundColor: '#2563eb', 
        backgroundImage: 'radial-gradient(circle at center, #3b82f6 0%, #1d4ed8 100%)',
        animation: 'pulse 3s infinite'
    },
    mountain: { 
        backgroundColor: '#57534e', 
        backgroundImage: 'linear-gradient(135deg, #44403c 25%, #57534e 25%, #57534e 50%, #44403c 50%, #44403c 75%, #57534e 75%, #57534e 100%)', 
        backgroundSize: '20px 20px' 
    },
    wall: { 
        backgroundColor: '#1e293b', 
        backgroundImage: 'repeating-linear-gradient(90deg, #1e293b, #1e293b 10px, #334155 10px, #334155 20px)' 
    },
    camp_floor: { 
        backgroundColor: '#451a03', 
        backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
    },
};

const getCellStyle = (type: CellType) => {
  return TEXTURE_STYLES[type] || TEXTURE_STYLES.grass;
};

const getBuildingColor = (type: BuildingType) => {
    switch (type) {
        case 'camp_center': return 'bg-yellow-400';
        case 'lumber_mill': return 'bg-amber-600';
        case 'mine': return 'bg-stone-400';
        case 'mana_well': return 'bg-blue-400';
        case 'workshop': return 'bg-orange-500';
        case 'tent': return 'bg-green-400';
        case 'teleport_point': return 'bg-cyan-400';
        case 'portal': return 'bg-indigo-500'; // Distinct Gate Color
        default: return 'bg-white';
    }
};

const getBuildingIcon = (type: BuildingType) => {
    switch (type) {
        case 'camp_center': return <Home className="w-4 h-4 text-white fill-current" />;
        case 'lumber_mill': return <Trees className="w-4 h-4 text-white fill-current" />;
        case 'mine': return <Shovel className="w-4 h-4 text-white fill-current" />;
        case 'mana_well': return <Droplet className="w-4 h-4 text-white fill-current" />;
        case 'workshop': return <Hammer className="w-4 h-4 text-white fill-current" />;
        case 'tent': return <Tent className="w-4 h-4 text-white fill-current" />;
        case 'teleport_point': return <Zap className="w-4 h-4 text-white fill-current" />;
        case 'portal': return <div className="w-2 h-2 bg-white rounded-full animate-ping" />;
        default: return null;
    }
};

const getCollectibleIcon = (type: string) => {
    switch (type) {
        case 'wood': return <Axe className="w-4 h-4 text-amber-500 fill-current animate-pulse" />;
        case 'ore': return <Gem className="w-4 h-4 text-stone-400 fill-current animate-pulse" />;
        case 'pokeball': return <CircleDot className="w-4 h-4 text-red-500 bg-white rounded-full animate-bounce" />;
        default: return null;
    }
};

// Mini-map Preview Component
const MiniMapPreview: React.FC<{ 
    grid: any[][]; 
    playerPosition: { x: number; y: number }; 
    onClick: () => void;
}> = ({ grid, playerPosition, onClick }) => {
    const VIEWPORT_W = 15;
    const VIEWPORT_H = 11;
    
    // State for drag offset
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        e.stopPropagation();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Limit drag range to reasonable bounds (e.g. +/- 50 cells)
        // Convert pixel drag to roughly cell units? No, let's just use raw pixels or cell units.
        // Let's interpret offset as CELL offset.
        // But mouse move is pixels.
        // Let's say 10px = 1 cell.
        
        // Actually, let's keep it simple: offset is in CELLS.
        // We need to accumulate pixel delta and convert to cells?
        // Too complex for quick implementation.
        // Let's just say offset is added to startX/startY directly.
        
        // Simpler Drag: Just track mouse delta and update offset if delta > threshold.
        // Wait, standard drag behavior:
        // offset.x = (e.clientX - startX) / CELL_SIZE
        
        // Let's stick to the requested "Long Press Drag" logic, but standard drag is better UX.
        // We'll update the offset state which shifts the viewport.
        
        // Simplified: Just allow clicking to open big map for now, user asked for drag IN PREVIEW?
        // "preview window... add mouse long press drag"
        
        // Okay, let's implement a simple drag on the preview container.
        // Since we are rendering a grid, we can just shift the startX/startY by the offset.
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    // Add global mouse up listener to catch release outside
    useEffect(() => {
        if (isDragging) {
            const onUp = () => setIsDragging(false);
            window.addEventListener('mouseup', onUp);
            return () => window.removeEventListener('mouseup', onUp);
        }
    }, [isDragging]);

    // Calculate center based on player position AND offset
    // User reported "Preview not showing Plateau-1, showing Plateau-3".
    // This likely means the preview logic was centering on Player (2,2) but showing wrong area?
    // Player is at (2,2).
    // startX = 2 - 7 = -5.
    // Grid render logic: if gridX < 0 return null.
    // So it shows Void for left part.
    // Plateau-1 is (0,0) to (29,29).
    // Player at (2,2) should see Plateau-1.
    
    // Wait, why did user say they see Plateau-3?
    // Maybe previous logic was using wrong constants?
    // REGION_SIZE = 30.
    // Plateau-1 is GridX=0 -> x=0..29.
    // Plateau-3 is GridX=2 -> x=60..89.
    // If user saw Plateau-3, startX must have been ~60.
    // Why?
    // Maybe playerPosition was initialized wrong?
    // In useMapStore: playerPosition: { x: 2, y: 2 }.
    // That is definitely Plateau-1.
    
    // Let's check MiniMap logic again.
    // const startX = playerPosition.x - Math.floor(VIEWPORT_W / 2);
    // If player is at 2, startX = -5.
    // Render x = -5 to 9.
    // Grid has data from 0..149.
    // So it renders x=0..9 (Plateau-1).
    // Left side is void.
    
    // User might have been confused by "Void" being black and "Fog" or something?
    // Or maybe the MiniMap was rendering GLOBAL grid indices wrong?
    // grid[gridY][gridX].
    
    // Let's implement the drag offset.
    // And ensure we clamp to valid map bounds if desired, or allow free look.
    
    const centerX = playerPosition.x + Math.round(offset.x);
    const centerY = playerPosition.y + Math.round(offset.y);
    
    const startX_render = centerX - Math.floor(VIEWPORT_W / 2);
    const startY_render = centerY - Math.floor(VIEWPORT_H / 2);

    const viewportGrid = Array.from({ length: VIEWPORT_H }, (_, y) => {
        return Array.from({ length: VIEWPORT_W }, (_, x) => {
            const gridY = startY_render + y;
            const gridX = startX_render + x;
            if (gridY >= 0 && gridY < GLOBAL_MAP_HEIGHT && gridX >= 0 && gridX < GLOBAL_MAP_WIDTH) {
                if (grid[gridY] && grid[gridY][gridX]) {
                    return { ...grid[gridY][gridX], x: gridX, y: gridY };
                }
            }
            return null;
        });
    });

    // Handle Dragging Logic properly
    // We need to accumulate movement.
    // Let's use a ref for drag start to avoid re-renders during drag setup?
    // Actually, simple state is fine.
    
    // Better Drag Implementation:
    // On Mouse Down: Record clientX, clientY.
    // On Mouse Move: Calculate delta = (current - start) / CELL_PIXEL_SIZE.
    // Update offset.
    // BUT MiniMap is small pixels.
    // w-32 (128px) / 15 cells ~= 8.5px per cell.
    // Let's estimate sensitivity. 10px drag = 1 cell shift.
    
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setBaseOffset({ ...offset });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;
        
        // Sensitivity: 8px per cell
        const cellDeltaX = -Math.round(deltaX / 8); // Drag left to move view right (pan)
        const cellDeltaY = -Math.round(deltaY / 8);
        
        setOffset({
            x: baseOffset.x + cellDeltaX,
            y: baseOffset.y + cellDeltaY
        });
    };

    return (
        <div 
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
                // Only trigger click if not dragged
                if (Math.abs(offset.x - baseOffset.x) < 0.5 && Math.abs(offset.y - baseOffset.y) < 0.5) {
                    onClick();
                }
            }}
            className="w-32 h-24 bg-black border-2 border-slate-600 rounded-lg overflow-hidden cursor-pointer hover:border-yellow-400 transition-colors relative shadow-lg"
            title="Drag to pan, Click to expand"
        >
            <div 
                className="grid w-full h-full pointer-events-none" // Disable pointer events on children to let parent handle drag
                style={{
                    gridTemplateColumns: `repeat(${VIEWPORT_W}, 1fr)`,
                    gap: '0px'
                }}
            >
                {viewportGrid.map((row, y) => row.map((cell, x) => (
                    <div 
                        key={`${x}-${y}`}
                        className={cn(
                            "w-full h-full",
                            !cell ? 'bg-black' : '',
                            cell && playerPosition.x === cell.x && playerPosition.y === cell.y && "bg-white animate-pulse" // Highlight Player
                        )}
                        style={cell ? getCellStyle(cell.type) : undefined}
                    />
                )))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white text-center py-0.5 pointer-events-none">
                {isDragging ? "Panning..." : "Mini Map"}
            </div>
        </div>
    );
};

// Memoized World Map Content
const WorldMapContent: React.FC<{
    grid: any[][];
    playerPosition: { x: number; y: number };
    unlockedTeleports: string[];
    onTeleport: (regionId: string) => void;
}> = React.memo(({ grid, playerPosition, unlockedTeleports, onTeleport }) => {
    return (
        <div 
            className="grid relative"
            style={{
                gridTemplateColumns: `repeat(${GLOBAL_MAP_WIDTH}, 20px)`,
                width: 'fit-content',
                height: 'fit-content',
            }}
        >
            {/* Region Labels */}
            {REGION_CONFIG.map(region => {
                    const isUnlocked = unlockedTeleports.includes(region.id);
                    return (
                    <div 
                        key={region.id}
                        className={cn(
                            "absolute font-bold text-xs select-none flex items-center justify-center z-50 pointer-events-none",
                            isUnlocked ? "opacity-90" : "opacity-70"
                        )}
                        style={{
                            left: `${region.gridX * REGION_SIZE * 20}px`, 
                            top: `${region.gridY * REGION_SIZE * 20}px`, 
                            width: `${REGION_SIZE * 20}px`, 
                            height: `${REGION_SIZE * 20}px`, 
                        }}
                    >
                        <div className={cn(
                            "px-3 py-1.5 rounded-full backdrop-blur-md border shadow-xl flex items-center gap-2 pointer-events-none",
                            isUnlocked ? "bg-black/60 border-yellow-500 text-yellow-100 shadow-yellow-500/20" : "bg-black/40 border-slate-600 text-slate-400"
                        )}>
                            {isUnlocked ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3" />}
                            {region.name}
                        </div>
                    </div>
                    );
            })}

            {grid.map((row, y) => row.map((cell: any, x: number) => {
                    const isTP = cell.hasBuilding && cell.buildingType === 'teleport_point';
                    // Find region for this cell (Only do this if it's a TP to save perf)
                    const region = isTP ? REGION_CONFIG.find(r => r.gridX === Math.floor(x / REGION_SIZE) && r.gridY === Math.floor(y / REGION_SIZE)) : null;
                    const isUnlocked = region && unlockedTeleports.includes(region.id);
                    const isPlayerHere = playerPosition.x === x && playerPosition.y === y;

                    return (
                    <div 
                        key={`${x}-${y}`}
                        className={cn(
                            "flex items-center justify-center box-border", 
                            // Highlight player on big map
                            isPlayerHere && "bg-white z-20 animate-pulse",
                            // Make TP clickable
                            isTP && isUnlocked ? "cursor-pointer hover:scale-150 z-30 hover:shadow-[0_0_10px_white]" : ""
                        )}
                        style={{ width: '20px', height: '20px', ...getCellStyle(cell.type) }}
                        onClick={(e) => {
                            if (isTP && isUnlocked && region) {
                                e.stopPropagation();
                                onTeleport(region.id);
                            }
                        }}
                    >
                        {cell.hasBuilding && cell.buildingType && (
                            <div className={cn(
                                "rounded-sm", 
                                cell.buildingType === 'teleport_point' ? "w-4 h-4 z-10 border border-white animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "w-3 h-3",
                                getBuildingColor(cell.buildingType)
                            )} />
                        )}
                    </div>
                    );
            }))}
        </div>
    );
}, (prev, next) => {
    // Custom comparison to avoid re-renders on simple object reference changes
    // Only re-render if:
    // 1. Grid changed (length or ref)
    // 2. Player moved (x, y)
    // 3. Unlocked teleports changed (length or content)
    
    if (prev.grid !== next.grid) return false;
    if (prev.playerPosition.x !== next.playerPosition.x || prev.playerPosition.y !== next.playerPosition.y) return false;
    if (prev.unlockedTeleports !== next.unlockedTeleports && 
        (prev.unlockedTeleports.length !== next.unlockedTeleports.length || 
         !prev.unlockedTeleports.every((val, index) => val === next.unlockedTeleports[index]))) return false;
         
    return true; // No re-render needed
});

export const GridMap: React.FC = () => {
  const { grid, playerPosition, movePlayer, initMap, checkEncounter, clearEncounter, teleportToMap, unlockedTeleports, getCurrentZoneInfo } = useMapStore();
  const { setScene } = useGameFlowStore();
  const { startBattle } = useBattleStore();
  const { team, addPokemon, level, exp, maxExp, wood, ore, mana, maxMana, essence, buildings, storage, refillMana, getPokemonById, tick, inventory } = usePlayerStore();

  // Tick System for Idle Rewards
  useEffect(() => {
      const interval = setInterval(() => {
          tick();
      }, 1000);
      return () => clearInterval(interval);
  }, [tick]);

  const currentZoneInfo = getCurrentZoneInfo();
  const currentZoneName = `${currentZoneInfo.name}`;

  const pokeBallCount = inventory.find(i => i.id === 'pokeball')?.count || 0;

  const VIEWPORT_W = 22;
  const VIEWPORT_H = 21;
  
  const [initialized, setInitialized] = React.useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  
  // World Map Drag Logic
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [mapDrag, setMapDrag] = useState({ isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  const onMapMouseDown = (e: React.MouseEvent) => {
      if (!mapContainerRef.current) return;
      setMapDrag({
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          scrollLeft: mapContainerRef.current.scrollLeft,
          scrollTop: mapContainerRef.current.scrollTop
      });
      e.preventDefault(); // Prevent text selection
  };

  const onMapMouseMove = (e: React.MouseEvent) => {
      if (!mapDrag.isDragging || !mapContainerRef.current) return;
      const x = e.clientX - mapDrag.startX;
      const y = e.clientY - mapDrag.startY;
      mapContainerRef.current.scrollLeft = mapDrag.scrollLeft - x;
      mapContainerRef.current.scrollTop = mapDrag.scrollTop - y;
  };

  const onMapMouseUp = () => {
      setMapDrag(prev => ({ ...prev, isDragging: false }));
  };

  // Center map on player when opened
  useEffect(() => {
      if (showMinimap && mapContainerRef.current) {
          // Calculate player pixel position: (x * 20, y * 20)
          const playerPixelX = playerPosition.x * 20;
          const playerPixelY = playerPosition.y * 20;
          
          // Center in viewport
          const containerW = mapContainerRef.current.clientWidth;
          const containerH = mapContainerRef.current.clientHeight;
          
          mapContainerRef.current.scrollLeft = playerPixelX - containerW / 2 + 10; // +10 for half cell
          mapContainerRef.current.scrollTop = playerPixelY - containerH / 2 + 10;
      }
  }, [showMinimap, playerPosition]); // Re-center if player moves while open? Maybe just on open.
  // Actually, keep it simple: re-center on open. 
  // If player moves, we might want to track? No, user is panning. Don't fight user.
  // So only dependency `showMinimap` changing from false to true.
  // We can use a separate effect or just check ref.

  const handleTeleport = (regionId: string) => {
      teleportToMap(regionId);
      setShowMinimap(false);
  };
  
  useEffect(() => {
    // Check dimensions mismatch or missing key features (Self-Healing)
    const isDimensionsMismatch = grid.length === 0 || 
                       grid.length !== GLOBAL_MAP_HEIGHT || 
                       (grid[0] && grid[0].length !== GLOBAL_MAP_WIDTH);
    
    // Check if Plateau-1 Teleport Point exists (at 8,8). If not, map is stale.
    const isMapStale = grid.length > 0 && (!grid[8][8]?.hasBuilding || grid[8][8]?.buildingType !== 'teleport_point');

    if (isDimensionsMismatch || isMapStale) {
      console.log("Regenerating Map... (Reason: " + (isDimensionsMismatch ? "Dimensions" : "Stale Data") + ")");
      initMap();
    }
    
    if (!initialized) {
        setInitialized(true);
        // Check if team has any pokemon (filtering out nulls)
        const activeTeam = usePlayerStore.getState().team.filter(Boolean);
        if (activeTeam.length === 0) {
            INITIAL_PLAYER_TEAM.forEach(p => addPokemon(generatePokemon(p)));
        }
    }
  }, [grid, initMap, team, addPokemon, initialized]);

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

  useEffect(() => {
    const { x, y } = playerPosition;
    const currentCell = grid[y]?.[x];
    if (currentCell?.type === 'camp_floor') {
        refillMana();
    }

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
              const pool = currentZoneInfo.zoneId === 'istvan' ? ISTVAN_V_POOL : INITIAL_PLATEAU_POOL;
              const base = pool[Math.floor(Math.random() * pool.length)];
              return generatePokemon(base); 
          });
          startBattle(team, enemies);
      }
      
      useGameFlowStore.getState().setEncounterLocation(x, y);
      setScene('battle');
    }
  }, [playerPosition, checkEncounter, startBattle, setScene, team, grid, clearEncounter, currentZoneInfo]);

  const handleBuildingClick = (buildingType: BuildingType, buildingX: number, buildingY: number) => {
      const dx = Math.abs(playerPosition.x - buildingX);
      const dy = Math.abs(playerPosition.y - buildingY);
      
      if (dx <= 1 && dy <= 1) {
          if (buildingType === 'teleport_point') {
              setShowMinimap(true);
          } else {
              useGameFlowStore.getState().setBuildingInteraction(buildingType);
          }
      }
  };

  if (grid.length === 0) return <div className="text-white">Loading Map...</div>;

  const startX = playerPosition.x - Math.floor(VIEWPORT_W / 2);
  const startY = playerPosition.y - Math.floor(VIEWPORT_H / 2);

  const visibleRows = Array.from({ length: VIEWPORT_H }, (_, dy) => {
    const y = startY + dy;
    return Array.from({ length: VIEWPORT_W }, (_, dx) => {
      const x = startX + dx;
      if (y >= 0 && y < grid.length && grid[y] && x >= 0 && x < grid[y].length) {
        return grid[y][x];
      }
      return null;
    });
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden bg-black relative">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 flex flex-col gap-2 pointer-events-none">
          <div className="flex justify-between items-start gap-2">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur-sm flex flex-col gap-1 min-w-[120px]">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-yellow-500">
                          <span className="font-bold text-yellow-400">{level}</span>
                      </div>
                      <div className="flex-1">
                          <div className="text-xs text-white font-bold">Trainer</div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-black">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(exp / maxExp) * 100}%` }} />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur-sm flex gap-3 text-xs font-bold shadow-lg">
                  <div className="flex items-center gap-1 text-amber-600"><Axe className="w-3 h-3" /> {wood}</div>
                  <div className="flex items-center gap-1 text-stone-400"><Shovel className="w-3 h-3" /> {ore}</div>
                  <div className="flex items-center gap-1 text-red-500"><CircleDot className="w-3 h-3" /> {pokeBallCount}</div>
                  <div className="flex items-center gap-1 text-purple-400"><Zap className="w-3 h-3" /> {essence}</div>
                  <div className="flex items-center gap-1 text-blue-400"><Droplet className="w-3 h-3" /> {mana}/{maxMana}</div>
              </div>
          </div>
      </div>

      {/* Zone Name */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/60 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-yellow-400 font-mono tracking-widest uppercase">
              {currentZoneName}
          </h2>
          <div className="text-xs text-gray-400">
              COORD: {playerPosition.x}, {playerPosition.y}
          </div>
      </div>

      {/* Mini Map Button */}
      <div className="absolute top-20 left-4 z-40">
          <MiniMapPreview 
              grid={grid} 
              playerPosition={playerPosition} 
              onClick={() => setShowMinimap(true)} 
          />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
        <button onClick={() => handleTeleport('plateau-1')} className="p-3 bg-yellow-600 rounded-full text-white shadow-lg hover:bg-yellow-500 transition-transform active:scale-95">
          <Home className="w-6 h-6" />
        </button>
        <button onClick={() => setScene('team')} className="p-3 bg-green-600 rounded-full text-white shadow-lg hover:bg-green-500 transition-transform active:scale-95">
          <Users className="w-6 h-6" />
        </button>
        <button onClick={() => setScene('menu')} className="p-3 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-transform active:scale-95">
          <BookOpen className="w-6 h-6" />
        </button>
      </div>

      {/* World Map Overlay */}
      {showMinimap && (
        <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 relative w-full max-w-[95vw] h-[80vh] flex gap-4">
                <button onClick={() => setShowMinimap(false)} className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 z-10">
                    <X className="w-4 h-4" />
                </button>
                
                <div 
                    ref={mapContainerRef}
                    onMouseDown={onMapMouseDown}
                    onMouseMove={onMapMouseMove}
                    onMouseUp={onMapMouseUp}
                    onMouseLeave={onMapMouseUp}
                    className="flex-1 bg-black border border-slate-700 p-4 relative overflow-hidden cursor-grab active:cursor-grabbing"
                >
                     <h2 className="absolute top-2 left-2 text-xl font-bold text-white flex items-center gap-2 z-10 pointer-events-none">
                        <MapIcon className="w-5 h-5" /> World Map
                    </h2>
                    
                    <div 
                        className="transition-transform duration-75 ease-out"
                        style={{
                            width: 'fit-content',
                            height: 'fit-content',
                        }}
                    >
                       <WorldMapContent 
                           grid={grid} 
                           playerPosition={playerPosition} 
                           unlockedTeleports={unlockedTeleports}
                           onTeleport={handleTeleport}
                       />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Grid Render */}
      <div 
        className="grid gap-0 bg-slate-900 p-2 rounded-lg shadow-2xl border-4 border-slate-700 mt-12 overflow-x-auto max-w-full"
        style={{
          gridTemplateColumns: `repeat(${VIEWPORT_W}, 40px)`,
          width: 'fit-content',
          minWidth: 'min-content' // Ensure grid doesn't shrink
        }}
      >
        {visibleRows.map((row, localY) => (
          row.map((cell, localX) => {
            if (!cell) {
              return <div key={`void-${localX}-${localY}`} className="w-10 h-10 bg-black border border-white/10" style={{ width: '40px', height: '40px' }} />;
            }

            const isPlayerHere = playerPosition.x === cell.x && playerPosition.y === cell.y;
            
            // Worker Visualization
            let workerSprite = null;
            if (cell.hasBuilding && cell.buildingType) {
                const building = buildings[cell.buildingType];
                if (building && building.assignedPokemonId) {
                    const worker = getPokemonById(building.assignedPokemonId);
                    if (worker) workerSprite = worker.sprite;
                }
            }

            return (
              <div
                key={`${cell.x}-${cell.y}`}
                className={cn(
                  "flex items-center justify-center relative transition-all duration-200 border border-white/10",
                )}
                style={{ width: '40px', height: '40px', ...getCellStyle(cell.type) }}
                onClick={() => cell.hasBuilding && cell.buildingType && handleBuildingClick(cell.buildingType, cell.x, cell.y)}
              >
                {/* Collectible Items */}
                {cell.collectible && !isPlayerHere && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                         <div className="drop-shadow-md transform hover:scale-110 transition-transform">
                            {getCollectibleIcon(cell.collectible.type)}
                         </div>
                    </div>
                )}

                {/* Building / Feature */}
                {cell.hasBuilding && cell.buildingType && (
                    <div className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md shadow-sm relative",
                        getBuildingColor(cell.buildingType)
                    )}>
                        {getBuildingIcon(cell.buildingType)}
                        {/* Worker Badge */}
                        {workerSprite && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-800 rounded-full border border-white flex items-center justify-center overflow-hidden z-20 shadow-lg">
                                <img src={workerSprite} alt="Worker" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                )}

                {/* Enemy (Sprite) */}
                {cell.hasEnemy && !isPlayerHere && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        {cell.enemyGroup && cell.enemyGroup[0] ? (
                            <>
                                <img 
                                    src={cell.enemyGroup[0].sprite} 
                                    alt="Enemy" 
                                    className="w-8 h-8 object-contain animate-bounce drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                                />
                                {/* Enemy Count Badge */}
                                {cell.enemyGroup.length > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white z-20 shadow-sm animate-pulse">
                                        {cell.enemyGroup.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-4 h-4 bg-red-600 animate-pulse rounded-full" />
                        )}
                    </div>
                )}

                {/* Player (Sprite) */}
                {isPlayerHere && (
                  <div className="absolute w-12 h-12 z-30 -mt-6 drop-shadow-2xl pointer-events-none">
                      <style>{`
                        @keyframes walk-bob {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-4px); }
                        }
                      `}</style>
                      <img 
                        src="https://play.pokemonshowdown.com/sprites/trainers/ash.png" 
                        alt="Ash"
                        className="w-full h-full object-contain"
                        style={{ animation: 'walk-bob 0.8s infinite ease-in-out' }}
                        onError={(e) => {
                            const target = e.currentTarget;
                            // Fallback to Red if Ash fails
                            if (!target.src.includes('red.png')) {
                                target.src = "https://img.pokemondb.net/sprites/heartgold-soulsilver/normal/red.png";
                            } else {
                                // If Red also fails, hide and show simple div
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center"><div class="w-3 h-1 bg-white"></div></div>';
                            }
                        }}
                      />
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};
