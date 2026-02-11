
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, Gem, Hammer } from 'lucide-react';

export const CampCenter: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, spendResources } = usePlayerStore();
    const building = buildings.camp_center;
    
    // Cost Formula: Base * Level^1.5
    // Camp Center Cost: Wood 100, Ore 0
    const woodCost = Math.floor(100 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    
    const canAfford = wood >= woodCost && ore >= oreCost;

    const handleUpgrade = () => {
        if (spendResources({ wood: woodCost, ore: oreCost })) {
            upgradeBuilding('camp_center');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Command Center</h3>
                <p className="text-sm text-gray-400 mb-4">
                    The heart of your camp. Upgrade this to unlock higher levels for other buildings.
                </p>
                
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-bold text-white">Current Bonuses:</div>
                    <ul className="list-disc list-inside text-xs text-gray-300">
                        <li>Max Building Level: {building.level}</li>
                        <li>Global Production Speed: +{(building.level - 1) * 5}%</li>
                    </ul>
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Upgrade</h3>
                
                <div className="flex gap-4 mb-4">
                    <div className={`flex flex-col items-center p-2 bg-slate-900 rounded border ${wood >= woodCost ? 'border-slate-600' : 'border-red-900'}`}>
                        <span className="text-xs text-gray-400">Wood</span>
                        <span className={`font-bold ${wood >= woodCost ? 'text-white' : 'text-red-500'}`}>{woodCost}</span>
                    </div>
                </div>

                <button 
                    onClick={handleUpgrade}
                    disabled={!canAfford}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowUp className="w-5 h-5" />
                    Upgrade to Level {building.level + 1}
                </button>
            </div>
        </div>
    );
};
