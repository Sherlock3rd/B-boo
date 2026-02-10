import React from 'react';
import { GridMap } from './components/map/GridMap';
import { BattleScene } from './components/battle/BattleScene';
import { Pokedex } from './components/menu/Pokedex';
import { TeamEdit } from './components/menu/TeamEdit';
import { useGameFlowStore } from './store/useGameFlowStore';
import { useBattleStore } from './store/useBattleStore';
import { usePlayerStore } from './store/usePlayerStore';

function App() {
  const { scene, setScene } = useGameFlowStore();
  const { endBattle, winner, units } = useBattleStore();
  const { addPokemon } = usePlayerStore();

  const handleBattleEnd = (result: 'player' | 'enemy') => {
    if (result === 'player') {
      // Capture logic: Add a random surviving enemy or just the first enemy?
      // User said "玩家战胜对方后可以收费该宝可梦"
      // Let's capture the first enemy unit base data
      const enemyUnits = units.filter(u => u.team === 'enemy');
      if (enemyUnits.length > 0) {
         // Create a new pokemon instance from the battle unit
         const captured = { ...enemyUnits[0], isWild: false };
         // Remove battle specific props
         const { instanceId, currentHp, maxHp, actionValue, team, isDead, ...basePokemon } = captured;
         addPokemon(basePokemon as any); // Cast to fix type mismatch if any
         alert(`You captured ${basePokemon.name}!`);
      }
    } else {
        alert('You were defeated...');
    }
    
    endBattle();
    setScene('map');
  };

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-black relative shadow-2xl overflow-hidden border-x border-slate-800">
        {scene === 'map' && <GridMap />}
        {scene === 'battle' && <BattleScene onBattleEnd={handleBattleEnd} />}
        {scene === 'menu' && <Pokedex />}
        {scene === 'team' && <TeamEdit />}
      </div>
    </div>
  );
}
export default App;
