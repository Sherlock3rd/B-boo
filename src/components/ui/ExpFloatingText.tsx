import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

interface FloatingText {
    id: number;
    text: string;
    color?: string;
    offset: number;
}

export const ExpFloatingText: React.FC = () => {
    const floatingTextEvent = usePlayerStore(state => state.floatingTextEvent);
    const [texts, setTexts] = useState<FloatingText[]>([]);

    useEffect(() => {
        if (floatingTextEvent) {
            setTexts(prev => {
                // Avoid duplicates
                if (prev.some(t => t.id === floatingTextEvent.id)) return prev;
                
                // Add new text with slight random offset for variety
                return [...prev, { 
                    id: floatingTextEvent.id, 
                    text: floatingTextEvent.text,
                    color: floatingTextEvent.color,
                    offset: (Math.random() - 0.5) * 60 // +/- 30px
                }];
            });
        }
    }, [floatingTextEvent]);

    const handleAnimationEnd = (id: number) => {
        setTexts(prev => prev.filter(t => t.id !== id));
    };

    const getColorClass = (color?: string) => {
        switch (color) {
            case 'yellow': return "text-yellow-400 border-yellow-500";
            case 'amber': return "text-amber-400 border-amber-500";
            case 'stone': return "text-stone-300 border-stone-400";
            case 'red': return "text-red-400 border-red-500";
            default: return "text-white border-white";
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            <style>{`
                @keyframes floatUpFade {
                    0% { opacity: 0; transform: translateY(0) scale(0.5); }
                    10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                    20% { transform: translateY(-25px) scale(1); }
                    80% { opacity: 1; transform: translateY(-60px); }
                    100% { opacity: 0; transform: translateY(-80px); }
                }
                .animate-float-exp {
                    animation: floatUpFade 2.0s ease-out forwards;
                }
            `}</style>
            
            {texts.map(item => (
                <div 
                    key={item.id}
                    onAnimationEnd={() => handleAnimationEnd(item.id)}
                    className="absolute top-1/2 left-1/2 animate-float-exp"
                    style={{ 
                        marginLeft: `${item.offset}px`,
                        // Start slightly higher to not cover player completely
                        marginTop: '-40px'
                    }}
                >
                    <div className={cn(
                        "text-xl sm:text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
                        "flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-black/60 border backdrop-blur-sm",
                        getColorClass(item.color)
                    )}>
                        <span>{item.text}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
