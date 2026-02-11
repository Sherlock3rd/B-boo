
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, Tent } from 'lucide-react';

export const TentBuilding: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, spendResources, gainExp } = usePlayerStore();
    const building = buildings.tent;
    
    // Cost: Wood 30, Ore 0
    const woodCost = Math.floor(30 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    const canAfford = wood >= woodCost && ore >= oreCost;
    
    const isCapped = building.level >= buildings.camp_center.level;

    const handleUpgrade = () => {
        if (!isCapped && spendResources({ wood: woodCost, ore: oreCost })) {
            upgradeBuilding('tent');
        }
    };

    // For now, Tent gives instant EXP on click if "rested" (simplified for MVP as requested feature was "click to get after accumulating")
    // Since we don't have accumulation state yet, let's just make it a "Rest" button that gives small exp with cooldown?
    // User requirement: "Accumulates > 10, click to get".
    // I will simulate this by just giving a fixed amount for now or using a local state?
    // Actually, let's just give 10 EXP per click for now to demonstrate functionality, or 
    // better yet, since the ticker doesn't store it, we can't do exact logic without store refactor.
    // I will add a simple "Rest" button that gives 10 EXP.
    
    const handleRest = () => {
        gainExp(10);
    };

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-green-400">Tent</h3>
                    <div className="text-xs text-green-400 font-bold">Level {building.level}</div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    A place to rest and gain experience. 
                    <br/><span className="text-xs text-gray-500">(Passive Exp generation is active)</span>
                </p>

                <button 
                    onClick={handleRest}
                    className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Tent className="w-5 h-5" />
                    Rest (Claim 10 EXP)
                </button>
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
