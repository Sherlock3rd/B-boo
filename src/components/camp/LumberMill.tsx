
import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, User, Axe } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LumberMill: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, spendResources, addResources, team, storage, assignPokemonToBuilding } = usePlayerStore();
    const building = buildings.lumber_mill;
    
    // Cost: Wood 50, Ore 0
    const woodCost = Math.floor(50 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    const canAfford = wood >= woodCost && ore >= oreCost;
    
    // Constraint: Cannot exceed Camp Center Level
    const isCapped = building.level >= buildings.camp_center.level;

    const handleUpgrade = () => {
        if (!isCapped && spendResources({ wood: woodCost, ore: oreCost })) {
            upgradeBuilding('lumber_mill');
        }
    };

    const handleGather = () => {
        addResources({ wood: 1 });
    };

    // Assignment Logic
    const [showAssign, setShowAssign] = useState(false);
    
    // Ensure we are getting the latest state from the store
    // Use usePlayerStore hook which subscribes to updates
    // const { team, storage } = usePlayerStore(); // Already destructured above
    
    // Only allow assignment from storage (cannot assign team members)
    const availablePokemon = storage;
    
    // Debugging: Log available pokemon count
    // console.log("LumberMill available pokemon:", availablePokemon.length);

    const assignedPokemon = [...team, ...storage].find(p => p.id === building.assignedPokemonId);

    const handleAssign = (pokemonId: string) => {
        assignPokemonToBuilding('lumber_mill', pokemonId);
        setShowAssign(false);
    };

    // Calculate Rate: 1 per 10s = 6 per minute
    const productionRate = assignedPokemon ? "6/min" : "0/min";

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-amber-500">Lumber Mill</h3>
                    <div className="text-sm text-gray-400">Generates Wood over time</div>
                    <div className="text-xs text-green-400 mt-1">Rate: {productionRate}</div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{wood}</div>
                    <div className="text-xs text-amber-500">WOOD</div>
                </div>
            </div>

            {/* Manual Action */}
            <button 
                onClick={handleGather}
                className="w-full py-4 bg-amber-800 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-amber-950"
            >
                <Axe className="w-8 h-8 mb-1" />
                <span>CHOP WOOD (+1)</span>
            </button>

            {/* Assignment Section */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Worker</h3>
                    {assignedPokemon && (
                        <button onClick={() => assignPokemonToBuilding('lumber_mill', undefined)} className="text-xs text-red-400 hover:underline">Unassign</button>
                    )}
                </div>

                {!assignedPokemon ? (
                    <button 
                        onClick={() => setShowAssign(!showAssign)}
                        className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <User className="w-5 h-5" />
                        Assign Pokemon (Passive +1/10s)
                    </button>
                ) : (
                    <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <img src={assignedPokemon.sprite} alt={assignedPokemon.name} className="w-12 h-12 object-contain pixelated" />
                        <div>
                            <div className="font-bold text-white">{assignedPokemon.name}</div>
                            <div className="text-xs text-green-400">Generating Wood...</div>
                        </div>
                    </div>
                )}

                {showAssign && (
                    <div className="mt-4 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-lg">
                        {availablePokemon.length === 0 && <div className="col-span-4 text-center text-xs text-gray-500">No Pokemon in Storage</div>}
                        {availablePokemon.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => handleAssign(p.id)}
                                disabled={Object.values(buildings).some(b => b.assignedPokemonId === p.id)} // Disable if already assigned elsewhere
                                className="relative p-2 bg-slate-800 rounded border border-slate-700 hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <img src={p.sprite} alt={p.name} className="w-full h-8 object-contain pixelated" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Upgrade Section */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Upgrade</h3>
                    {isCapped && <span className="text-xs text-red-400">Camp Center Lv.{buildings.camp_center.level} required</span>}
                </div>
                
                <div className="flex gap-4 mb-4">
                    <div className={`flex flex-col items-center p-2 bg-slate-900 rounded border ${wood >= woodCost ? 'border-slate-600' : 'border-red-900'}`}>
                        <span className="text-xs text-gray-400">Wood</span>
                        <span className={`font-bold ${wood >= woodCost ? 'text-white' : 'text-red-500'}`}>{woodCost}</span>
                    </div>
                </div>

                <button 
                    onClick={handleUpgrade}
                    disabled={!canAfford || isCapped}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowUp className="w-5 h-5" />
                    Upgrade to Level {building.level + 1}
                </button>
            </div>
        </div>
    );
};
