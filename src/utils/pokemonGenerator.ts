import { Pokemon, Skill } from '@/types';
import { SKILL_POOL } from '@/data/pokemon';

/**
 * Generates a Pokemon with random skills.
 * Ensures at least one damaging skill.
 */
export const generatePokemon = (base: Pokemon): Pokemon => {
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
    
    return {
        ...base,
        skills: selectedSkills
    };
};
