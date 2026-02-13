
import React from 'react';
import { BuildingType } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { X, Hammer, Shovel, Axe, Droplet, Home, Tent } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useGameFlowStore } from '@/store/useGameFlowStore';

// Sub-components for each building type
import { CampCenter } from './CampCenter';
import { LumberMill } from './LumberMill';
import { Mine } from './Mine';
import { ManaWell } from './ManaWell';
import { Workshop } from './Workshop';
import { TentBuilding } from './TentBuilding';

export const CampModal: React.FC<{ type: BuildingType; onClose: () => void }> = ({ type, onClose }) => {
    const { buildings } = usePlayerStore();
    const building = buildings[type];

    // Close on ESC
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // If building data is missing (e.g. teleport_point has no building data in store), handle gracefully
    // Teleport Points are not upgradeable buildings in player store, so they don't have 'level'.
    // We should probably just return null or show a simple info modal, but for now let's prevent the crash.
    if (!building) {
        // If it's a teleport point, maybe we don't even want to show this modal?
        // Or show a simple "Teleport Point" info.
        if (type === 'teleport_point') {
             return (
                <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-6 text-center">
                        <h2 className="text-xl font-bold text-cyan-400 mb-2">Teleport Point</h2>
                        <p className="text-gray-400 mb-4">A mystical beacon that allows instant travel.</p>
                        <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white">Close</button>
                    </div>
                </div>
             );
        }
        return null;
    }

    const getTitle = () => {
        switch (type) {
            case 'camp_center': return 'Camp Center';
            case 'lumber_mill': return 'Lumber Mill';
            case 'mine': return 'Mine';
            case 'mana_well': return 'Mana Well';
            case 'workshop': return 'Workshop';
            case 'tent': return 'Tent';
            default: return 'Building';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'camp_center': return <Home className="w-6 h-6 text-yellow-400" />;
            case 'lumber_mill': return <Axe className="w-6 h-6 text-amber-700" />;
            case 'mine': return <Shovel className="w-6 h-6 text-stone-400" />;
            case 'mana_well': return <Droplet className="w-6 h-6 text-blue-400" />;
            case 'workshop': return <Hammer className="w-6 h-6 text-orange-400" />;
            case 'tent': return <Tent className="w-6 h-6 text-green-400" />;
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="flex items-center gap-2">
                        {getIcon()}
                        <div>
                            <h2 className="text-xl font-bold text-white leading-none">{getTitle()}</h2>
                            <div className="text-xs text-gray-400 mt-1">Level {building.level}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {type === 'camp_center' && <CampCenter />}
                    {type === 'lumber_mill' && <LumberMill />}
                    {type === 'mine' && <Mine />}
                    {type === 'mana_well' && <ManaWell />}
                    {type === 'workshop' && <Workshop />}
                    {type === 'tent' && <TentBuilding />}
                </div>
            </div>
        </div>
    );
};
