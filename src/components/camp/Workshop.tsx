
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, Hammer, CircleDot } from 'lucide-react';

export const Workshop: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, mana, spendResources, addItem } = usePlayerStore();
    const building = buildings.workshop;
    
    // Cost: Wood 100, Ore 0
    const woodCost = Math.floor(100 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    const canAfford = wood >= woodCost && ore >= oreCost;
    
    const isCapped = building.level >= buildings.camp_center.level;

    const handleUpgrade = () => {
        if (!isCapped && spendResources({ wood: woodCost, ore: oreCost })) {
            upgradeBuilding('workshop');
        }
    };

    // Crafting Logic
    const POKEBALL_COST = { ore: 15 };
    const canCraftBall = ore >= POKEBALL_COST.ore;

    const handleCraftPokeball = () => {
        if (spendResources(POKEBALL_COST)) {
            addItem({ id: 'pokeball', name: 'Poke Ball', count: 1, type: 'consumable' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Crafting Section */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-orange-400 mb-4">Crafting</h3>
                
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                            <CircleDot className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <div className="font-bold text-white">Poke Ball</div>
                            <div className="text-xs text-gray-400 flex gap-2">
                                <span className={ore >= POKEBALL_COST.ore ? 'text-green-400' : 'text-red-400'}>{POKEBALL_COST.ore} Ore</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleCraftPokeball}
                        disabled={!canCraftBall}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
                    >
                        Craft
                    </button>
                </div>
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
