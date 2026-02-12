
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowUp, Gem, Hammer, Zap, User } from 'lucide-react';

export const CampCenter: React.FC = () => {
    const { buildings, upgradeBuilding, wood, ore, spendResources, pendingPlayerExp, pendingEssence, claimIdleRewards } = usePlayerStore();
    const building = buildings.camp_center;
    
    // Cost Formula: Base * Level^1.5
    // Camp Center Cost: Wood 100, Ore 0
    const woodCost = Math.floor(100 * Math.pow(building.level, 1.5));
    const oreCost = 0;
    
    const canAfford = wood >= woodCost && ore >= oreCost;
    const canClaim = pendingPlayerExp >= 10;

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
                    The heart of your camp. Generates passive resources and manages upgrades.
                </p>
                
                {/* Idle Rewards Section */}
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white">Idle Rewards</span>
                        <div className="text-[10px] text-gray-500">Rate: 1/sec</div>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                         <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400">EXP</span>
                                <span className="text-sm font-bold text-white">{Math.floor(pendingPlayerExp)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400">Essence</span>
                                <span className="text-sm font-bold text-white">{Math.floor(pendingEssence)}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={claimIdleRewards}
                        disabled={!canClaim}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded transition-colors text-xs"
                    >
                        {canClaim ? "Claim Rewards" : "Accumulating... (Min 10)"}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-sm font-bold text-white">Building Status:</div>
                    <ul className="list-disc list-inside text-xs text-gray-300">
                        <li>Level: {building.level}</li>
                        <li>Production Speed: +{(building.level - 1) * 5}%</li>
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
