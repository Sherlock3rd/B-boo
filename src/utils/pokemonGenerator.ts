import { Pokemon, Skill } from '@/types';
import { SKILL_POOL } from '@/data/pokemon';
import { REGION_CONFIG } from '@/data/constants';

/**
 * Generates a Pokemon with random skills.
 * Ensures at least one damaging skill.
 */
export const generatePokemon = (base: Pokemon, zoneId?: string): Pokemon => {
    // Determine Level based on Zone
    let level = 1;
    if (zoneId) {
        const region = REGION_CONFIG.find(r => r.id === zoneId);
        if (region) {
            level = region.levelReq;
        } else {
             // Fallback logic if region not found (legacy)
             if (zoneId.includes('plateau')) {
                const num = parseInt(zoneId.split('-')[1]) || 1;
                level = num;
            } else if (zoneId.includes('istvan')) {
                const num = parseInt(zoneId.split('-')[1]) || 1;
                level = 10 + num;
            }
        }
    }

    // Fixed number of skills: 2
    const skillCount = 2; 
    
    // Filter skills by Element Type
    const elementSkills = SKILL_POOL.filter(s => s.type === base.element);

    // Fallback if not enough skills for this element (shouldn't happen with updated pool, but safety first)
    const pool = elementSkills.length >= skillCount ? elementSkills : SKILL_POOL;
    
    // Filter damaging skills within the valid pool
    const damageSkills = pool.filter(s => s.power > 0);
    
    const selectedSkills: Skill[] = [];
    
    // Ensure at least 1 damaging skill
    if (damageSkills.length > 0) {
        const firstSkill = damageSkills[Math.floor(Math.random() * damageSkills.length)];
        selectedSkills.push(firstSkill);
    }
    
    // Fill the rest randomly from the valid pool, avoiding duplicates
    while (selectedSkills.length < skillCount) {
        const randomSkill = pool[Math.floor(Math.random() * pool.length)];
        if (!selectedSkills.find(s => s.id === randomSkill.id)) {
            selectedSkills.push(randomSkill);
        }
        
        // Safety break if pool is too small (e.g. only 1 skill available)
        if (selectedSkills.length >= pool.length) break;
    }
    
    // Calculate Stats based on Level
    // Formula: Base * (1 + (Level - 1) * 0.1) -> 10% growth per level
    const growthFactor = 1 + (level - 1) * 0.1;
    const scaledStats = {
        hp: Math.floor(base.stats.hp * growthFactor),
        maxHp: Math.floor(base.stats.maxHp * growthFactor),
        atk: Math.floor(base.stats.atk * growthFactor),
        def: Math.floor(base.stats.def * growthFactor),
        speed: Math.floor(base.stats.speed * growthFactor),
    };

    return {
        ...base,
        level,
        stats: scaledStats,
        skills: selectedSkills
    };
};
