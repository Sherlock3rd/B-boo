import { useEffect, useCallback } from 'react';
import { GridMap } from './components/map/GridMap';
import { BattleScene } from './components/battle/BattleScene';
import { Pokedex } from './components/menu/Pokedex';
import { TeamEdit } from './components/menu/TeamEdit';
import { useGameFlowStore } from './store/useGameFlowStore';
import { useBattleStore } from './store/useBattleStore';
import { usePlayerStore } from './store/usePlayerStore';
import { useMapStore } from './store/useMapStore';
import { CampModal } from './components/camp/CampModal'; // To be created
import { ExpFloatingText } from './components/ui/ExpFloatingText';

// Passive Generation Ticker
const useGameTicker = () => {
    // Need to use getters inside interval or access via store.getState() to get fresh values
    // Using destructuring here captures the INITIAL values in closure, which is why it fails!
    
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const second = Math.floor(now / 1000);
            
            // Access FRESH state directly
            const { buildings, addResources } = usePlayerStore.getState();

            // Stored Mana Generation: 1 per second (Base)
            // Use 'storedMana' field in addResources
            addResources({ storedMana: 1 });

            // Lumber Mill: Every 10s if assigned
            if (buildings.lumber_mill.assignedPokemonId && second % 10 === 0) {
                console.log("Adding Passive Wood");
                addResources({ wood: 30 });
            }

            // Mine: Every 20s if assigned
            if (buildings.mine.assignedPokemonId && second % 20 === 0) {
                console.log("Adding Passive Ore");
                addResources({ ore: 30 });
            }
            
        }, 1000);

        return () => clearInterval(interval);
    }, []);
};

function App() {
  const { scene, setScene, encounterLocation, clearEncounterLocation, activeBuilding, setBuildingInteraction } = useGameFlowStore();
  const { endBattle } = useBattleStore();
  const { gainExp } = usePlayerStore(); // Added methods
  const { clearEncounter, teleportPlayer } = useMapStore();

  // Run Ticker
  useGameTicker();

  const handleBattleEnd = useCallback((result: 'player' | 'enemy') => {
    if (result === 'player') {
      // Victory: Clear the enemy from the map
      if (encounterLocation) {
          clearEncounter(encounterLocation.x, encounterLocation.y);
          clearEncounterLocation();
      }
      // Gain Exp (100 per kill)
      gainExp(100);
    } else {
        // Defeat: Teleport to Camp Center (Plateau-1) at (2, 2)
        teleportPlayer(2, 2);
    }
    
    endBattle();
    setScene('map');
  }, [encounterLocation, clearEncounter, clearEncounterLocation, gainExp, teleportPlayer, endBattle, setScene]);

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-black relative shadow-2xl overflow-hidden border-x border-slate-800">
        <ExpFloatingText />
        {scene === 'map' && <GridMap />}
        {scene === 'battle' && <BattleScene onBattleEnd={handleBattleEnd} />}
        {scene === 'menu' && <Pokedex />}
        {scene === 'team' && <TeamEdit />}

        {/* Camp Interaction Modal */}
        {activeBuilding && (
            <CampModal 
                type={activeBuilding} 
                onClose={() => setBuildingInteraction(null)} 
            />
        )}
      </div>
    </div>
  );
}
export default App;
