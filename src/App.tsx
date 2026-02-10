import { GridMap } from './components/map/GridMap';
import { BattleScene } from './components/battle/BattleScene';
import { Pokedex } from './components/menu/Pokedex';
import { TeamEdit } from './components/menu/TeamEdit';
import { useGameFlowStore } from './store/useGameFlowStore';
import { useBattleStore } from './store/useBattleStore';
import { usePlayerStore } from './store/usePlayerStore';

function App() {
  const { scene, setScene } = useGameFlowStore();
  const { endBattle, units } = useBattleStore();
  const { addPokemon } = usePlayerStore();

  const handleBattleEnd = (result: 'player' | 'enemy') => {
    if (result === 'player') {
      // Capture logic handled in BattleScene now
      // alert('Victory!'); 
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
