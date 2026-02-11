
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, Droplet } from 'lucide-react';

export const ManaWell: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, storedMana, maxStoredMana, spendResources } = usePlayerStore();
    const building = buildings.mana_well;
    
    // Cost: Wood 60, Ore 0
    const woodCost = Math.floor(60 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    const canAfford = wood >= woodCost && ore >= oreCost;
    
    const isCapped = building.level >= buildings.camp_center.level;

    const handleUpgrade = () => {
        if (!isCapped && spendResources({ wood: woodCost, ore: oreCost })) {
            upgradeBuilding('mana_well');
        }
    };

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-blue-400">Mana Well</h3>
                    <div className="text-xs text-blue-400 font-bold">{storedMana} / {maxStoredMana}</div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(storedMana / maxStoredMana) * 100}%` }}
                    />
                    {/* Tick marks for regen visual if needed, but simple bar is fine */}
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">Generates 1 Mana every second</div>
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
