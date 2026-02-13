import { create } from 'zustand';
import { Pokemon } from '@/types';
import { TYPE_CHART } from '@/data/constants';
import { BATTLE_WIDTH, getDistance, isInRange, findBestMoveTarget, getNextStep } from '@/utils/battleUtils';
import { usePlayerStore } from '@/store/usePlayerStore';

export interface BattleUnit extends Pokemon {
  instanceId: string; // Unique ID for this battle instance
  currentHp: number;
  maxHp: number;
  actionValue: number; // 0 to 10000, 0 means ready to act
  team: 'player' | 'enemy';
  isDead: boolean;
  position: { x: number, y: number };
  moveRange: number;
  attackRange: number;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'heal' | 'kill';
}

export interface VisualEffect {
    id: string;
    type: 'projectile' | 'aoe' | 'buff' | 'heal';
    element?: string; // For coloring
    sourcePos: { x: number, y: number };
    targetPos: { x: number, y: number };
    duration: number;
}

interface BattleState {
  isActive: boolean;
  units: BattleUnit[];
  actionQueue: string[]; // instanceIds sorted by actionValue
  logs: BattleLog[];
  visualEffects: VisualEffect[]; // Queue for visual effects
  turnCount: number;
  winner: 'player' | 'enemy' | null;
  isPaused: boolean;

  // Actions
  startBattle: (playerTeam: (Pokemon | null)[], enemyTeam: Pokemon[]) => void;
  nextTurn: () => void;
  pauseBattle: (paused: boolean) => void;
  endBattle: () => void;
  clearEffect: (id: string) => void;
}

const BASE_ACTION_DELAY = 10000;
// Re-export constants from Utils to avoid circular deps if Utils imported constants from here (which it shouldn't)
// But to be safe, let's keep them here or import them. 
// Ideally define in constants.ts but for now matching utils.
export { BATTLE_WIDTH, BATTLE_HEIGHT } from '@/utils/battleUtils';

export const useBattleStore = create<BattleState>((set, get) => ({
  isActive: false,
  units: [],
  actionQueue: [],
  logs: [],
  visualEffects: [],
  turnCount: 0,
  winner: null,
  isPaused: false,

  startBattle: (playerTeam, enemyTeam) => {
    // Filter out nulls from player team for battle initialization
    const activePlayerTeam = playerTeam.filter((p): p is Pokemon => p !== null);
    
    // Initialize units
    const createUnit = (p: Pokemon, team: 'player' | 'enemy', index: number): BattleUnit => {
        // Calculate Effective Stats based on Level
        // Formula: Base * (1 + (Level - 1) * 0.1) -> 10% growth per level
        // We need to use the 'effective level' here.
        // For Player Team: Level is determined by Slot Level (passed in or resolved)
        // For Enemy Team: Level is fixed in generator.
        
        let effectiveLevel = p.level;
        if (team === 'player') {
            // Re-fetch effective level from store to ensure it's up-to-date with Slot Level
            effectiveLevel = usePlayerStore.getState().getPokemonLevel(p.id);
        }

        // const growthFactor = 1 + (effectiveLevel - 1) * 0.1;
        
        // Base stats are stored in p.stats. 
        // NOTE: p.stats might ALREADY be scaled if it's a wild pokemon generated with a level.
        // But for Player pokemon, p.stats are likely the capture-time stats (or base stats if we didn't update them).
        // To be safe, we should probably store 'baseStats' in Pokemon type, but currently we overwrite 'stats'.
        // Assuming 'p.stats' for player pokemon are their BASE stats (at capture level) is risky if we updated them.
        // However, 'generatePokemon' scales stats.
        // For Player Pokemon, we should probably recalculate from a 'base' if possible, or assume p.stats are current.
        // ISSUE: If we just use p.stats, it reflects the stats at capture/generation.
        // If slot level is higher, we need to scale UP.
        // If slot level is lower, we need to scale DOWN.
        // But we don't know the original level they were generated at easily without storing it.
        // WORKAROUND: Assume p.stats are the stats at p.level.
        // We want stats at effectiveLevel.
        // Factor = (1 + (effective - 1) * 0.1) / (1 + (p.level - 1) * 0.1)
        
        const currentLevelFactor = 1 + (p.level - 1) * 0.1;
        const targetLevelFactor = 1 + (effectiveLevel - 1) * 0.1;
        const scaleRatio = targetLevelFactor / currentLevelFactor;

        const effectiveStats = {
            hp: Math.floor(p.stats.hp * scaleRatio),
            maxHp: Math.floor(p.stats.maxHp * scaleRatio),
            atk: Math.floor(p.stats.atk * scaleRatio),
            def: Math.floor(p.stats.def * scaleRatio),
            speed: Math.floor(p.stats.speed * scaleRatio),
        };

        return {
          ...p,
          level: effectiveLevel, // Update visual level
          stats: effectiveStats, // Update stats for battle
          instanceId: `${team}-${p.id}-${Math.random()}`,
          currentHp: effectiveStats.maxHp, // Full HP start
          maxHp: effectiveStats.maxHp,
          actionValue: BASE_ACTION_DELAY / effectiveStats.speed,
          team,
          isDead: false,
          position: {
            x: team === 'player' ? 4 : BATTLE_WIDTH - 5,
            y: index + 4,
          },
          moveRange: p.moveRange || 3,
          attackRange: p.attackRange || 1,
        };
    };

    const units = [
      ...activePlayerTeam.map((p, i) => createUnit(p, 'player', i)),
      ...enemyTeam.map((p, i) => createUnit(p, 'enemy', i))
    ];

    // Sort queue
    const actionQueue = [...units]
      .sort((a, b) => a.actionValue - b.actionValue)
      .map(u => u.instanceId);

    set({
      isActive: true,
      units,
      actionQueue,
      logs: [{ id: 'start', message: 'Battle Start!', type: 'info' }],
      turnCount: 0,
      winner: null,
      isPaused: false,
    });
  },

  nextTurn: () => {
    const state = get();
    if (!state.isActive || state.winner || state.isPaused) return;

    let { units, actionQueue, logs, turnCount } = state;

    // Get the first actor
    const firstActorId = actionQueue[0];
    let firstActor = units.find(u => u.instanceId === firstActorId);

    if (!firstActor || firstActor.isDead) {
      console.log(`[Turn] Skipping dead/invalid actor: ${firstActorId}`);
      const newQueue = actionQueue.filter(id => id !== firstActorId);
      set({ actionQueue: newQueue });
      return;
    }

    // Identify batch: All units with the same team as the first actor
    // AND who are "ready" or close enough in actionValue?
    // Actually, "parallel action" usually implies everyone on the same team who is next in line acts together.
    // But this is an ATB system where speed determines turn.
    // Interpretation: If multiple units of the same team are consecutive in the queue, they act together.
    
    const batchActors: BattleUnit[] = [];
    for (const id of actionQueue) {
        const u = units.find(unit => unit.instanceId === id);
        if (u && !u.isDead && u.team === firstActor.team) {
            batchActors.push(u);
        } else {
            // Break on first unit of different team
            break;
        }
    }
    
    // Safety check: limit batch size to avoid chaos or just process all?
    // Let's process all consecutive teammates.
    console.log(`[Turn Batch] Team ${firstActor.team} acting with ${batchActors.length} units.`);

    const timePassed = firstActor.actionValue;
    units = units.map(u => ({
      ...u,
      actionValue: Math.max(0, u.actionValue - timePassed)
    }));

    // Process actions for EACH actor in the batch
    // We need to update 'units' and 'logs' cumulatively
    
    const batchEffects: VisualEffect[] = [];

    batchActors.forEach(actor => {
        // Refresh actor from current 'units' state (important if modified by previous actor in batch)
        // But wait, parallel actions implies they shouldn't affect each other's position mid-batch ideally?
        // However, if A kills B, C shouldn't attack B.
        // So we should refresh state.
        const currentActor = units.find(u => u.instanceId === actor.instanceId);
        if (!currentActor || currentActor.isDead) return;

        // --- AI LOGIC (Reused) ---
        // 1. Select Best Skill (Simplified: Random capable skill or just random)
        // Ideally we pick skill first to know range, but for now we assume default attack range or max skill range.
        // Let's use the unit's base 'attackRange' as the primary engagement distance.
        let skill = currentActor.skills[Math.floor(Math.random() * currentActor.skills.length)];

        // Mana Consumption Logic for Player
        if (currentActor.team === 'player') {
            const { mana, spendResources } = usePlayerStore.getState();
            if (mana > 0) {
                // Consume 1 Mana per action
                spendResources({ mana: 1 });
            } else {
                // Out of Mana! Force Struggle/Weak Attack
                skill = { 
                    id: 'struggle', 
                    name: 'Struggle', 
                    type: 'Normal', 
                    power: 20, 
                    category: 'Physical', 
                    description: 'Out of mana!', 
                    range: 1 
                } as any;
            }
        }

        // Use skill range if available, else fallback to unit range
        const effectiveRange = skill?.range ?? currentActor.attackRange;

        // 2. Identify Targets
        const targets = units.filter(u => u.team !== currentActor.team && !u.isDead);
        if (targets.length === 0) return; 

        // 3. Find Closest Target
        let closestTarget = targets[0];
        let minDistance = Infinity;

        targets.forEach(t => {
            const d = getDistance(currentActor.position, t.position);
            if (d < minDistance) {
                minDistance = d;
                closestTarget = t;
            }
        });

        // Calculate target threat range (Max of attackRange or any skill range)
        const targetMaxRange = Math.max(
            closestTarget.attackRange || 1,
            ...(closestTarget.skills?.map(s => s.range) || [])
        );

        // 4. Move Logic
        // Calculate where we want to be
        const occupied = new Set(units.filter(u => !u.isDead).map(u => `${u.position.x},${u.position.y}`));
        let newPos = { ...currentActor.position };

        const currentInRange = isInRange(currentActor.position, closestTarget.position, effectiveRange);
        const currentIsSafe = !isInRange(currentActor.position, closestTarget.position, targetMaxRange);

        // If not in range OR not safe (and we might find a safe spot), try to move
        if (!currentInRange || !currentIsSafe) {
             // Find ideal tile to attack from
             const idealPos = findBestMoveTarget(currentActor, closestTarget, effectiveRange, occupied, targetMaxRange);
             
             if (idealPos) {
                 // Move towards idealPos
                 // We might not reach it in one turn if moveRange is low
                 newPos = getNextStep(currentActor.position, idealPos, currentActor.moveRange, occupied);
             } else if (!currentInRange) {
                 // No valid tile found (blocked?), try simple approach towards enemy
                 newPos = getNextStep(currentActor.position, closestTarget.position, currentActor.moveRange, occupied);
             }
        }
        
        // Update position immediately
        units = units.map(u => u.instanceId === currentActor.instanceId ? { ...u, position: newPos } : u);
        
        // 5. Attack Logic
        let logMsg = '';
        let damage = 0;
        
        // Check range again after move
        if (isInRange(newPos, closestTarget.position, effectiveRange)) {
             if (skill) {
               // Add Visual Effect
               const effectId = `vfx-${Date.now()}-${Math.random()}`;
               const newVfx: VisualEffect = {
                   id: effectId,
                   type: skill.category === 'AOE' ? 'aoe' : skill.category === 'Buff' ? 'buff' : skill.category === 'Heal' ? 'heal' : 'projectile',
                   element: skill.type,
                   sourcePos: { ...currentActor.position }, // Use actor pos
                   targetPos: { ...closestTarget.position }, // Use target pos
                   duration: 800,
               };
               batchEffects.push(newVfx);
             }

             // ... Logic for different skill categories
             if (skill.category === 'Heal') {
                 // Heal logic
                 // Reduced healing by 25% as requested (0.75 multiplier)
                 const healAmount = Math.floor(currentActor.stats.atk * (skill.power / 100) * 0.75);
                 const targetNewHp = Math.min(closestTarget.maxHp, closestTarget.currentHp + healAmount);
                 logMsg = `${currentActor.name} used ${skill.name} and healed ${closestTarget.name} for ${healAmount}!`;
                 
                 units = units.map(u => u.instanceId === closestTarget.instanceId ? { ...u, currentHp: targetNewHp } : u);
             } 
             else if (skill.category === 'Buff') {
                 // Buff logic (Placeholder: just log for now as stats are not dynamic yet)
                 logMsg = `${currentActor.name} used ${skill.name} on ${closestTarget.name}! (Buffs not impl yet)`;
             }
             else if (skill.category === 'AOE') {
                  // AOE Logic
                  // Radius 1 means 3x3 centered on target
                  const radius = skill.aoeRadius || 1;
                  const aoeTargets = units.filter(u => 
                      u.team !== currentActor.team && 
                      !u.isDead &&
                      Math.abs(u.position.x - closestTarget.position.x) <= radius &&
                      Math.abs(u.position.y - closestTarget.position.y) <= radius
                  );
                  
                  aoeTargets.forEach(target => {
                      const multiplier = TYPE_CHART[skill.type]?.[target.element] || 1;
                      const rawDamage = (currentActor.stats.atk * skill.power / 50) * (100 / (100 + target.stats.def));
                      damage = Math.floor(rawDamage * multiplier);
                      
                      const tNewHp = Math.max(0, target.currentHp - damage);
                      units = units.map(u => {
                          if (u.instanceId === target.instanceId) {
                              return { ...u, currentHp: tNewHp, isDead: tNewHp === 0 };
                          }
                          return u;
                      });
                  });
                  logMsg = `${currentActor.name} used ${skill.name} (AOE) hitting ${aoeTargets.length} targets!`;
             }
             else {
               // Single Target Damage
               const multiplier = TYPE_CHART[skill.type]?.[closestTarget.element] || 1;
               const rawDamage = (currentActor.stats.atk * skill.power / 50) * (100 / (100 + closestTarget.stats.def));
               damage = Math.floor(rawDamage * multiplier);
               logMsg = `${currentActor.name} used ${skill.name} on ${closestTarget.name} for ${damage} damage!`;
               if (multiplier > 1) logMsg += ' (Super Effective!)';
               if (multiplier < 1) logMsg += ' (Not Effective...)';
               
               const targetNewHp = Math.max(0, closestTarget.currentHp - damage);
               units = units.map(u => {
                   if (u.instanceId === closestTarget.instanceId) {
                        const isDead = targetNewHp === 0;
                        if (isDead) {
                           logs = [...logs, { id: Date.now().toString() + Math.random(), message: `${closestTarget.name} fainted!`, type: 'kill' }];
                        }
                        return { ...u, currentHp: targetNewHp, isDead };
                   }
                   return u;
               });
             }

            logs = [...logs, { id: Date.now().toString() + 'dmg' + Math.random(), message: logMsg, type: 'damage' }];
       } else {
            // Just moved
            // logMsg = `${currentActor.name} moved.`;
            // logs = [...logs, { id: Date.now().toString() + 'move' + Math.random(), message: logMsg, type: 'info' }];
       }

       // 5. Update Actor's Action Value
       units = units.map(u => u.instanceId === currentActor.instanceId ? {
            ...u, 
            actionValue: BASE_ACTION_DELAY / u.stats.speed 
       } : u);
   });

   // Check win condition
   const livingPlayers = units.filter(u => u.team === 'player' && !u.isDead);
   const livingEnemies = units.filter(u => u.team === 'enemy' && !u.isDead);

   if (livingPlayers.length === 0) {
     set({ isActive: false, winner: 'enemy', units, logs: [...logs, { id: 'end', message: 'You lost...', type: 'info' }] });
     return;
   }
   if (livingEnemies.length === 0) {
     const { addEssence, gainExp } = usePlayerStore.getState();
     // Battle Victory Rewards: 100 Essence per enemy
     const essenceReward = units.filter(u => u.team === 'enemy').length * 100;
     addEssence(essenceReward);
     
     // Also give some EXP for winning
     const expReward = 50; 
     gainExp(expReward);

     set({ isActive: false, winner: 'player', units, logs: [...logs, { id: 'end', message: `You won! Gained ${essenceReward} Essence & ${expReward} EXP!`, type: 'info' }] });
     return;
   }

   // Re-sort queue
   const newQueue = [...units]
     .filter(u => !u.isDead)
     .sort((a, b) => a.actionValue - b.actionValue)
     .map(u => u.instanceId);

    set({
      units,
      actionQueue: newQueue,
      logs: logs.slice(-50),
      turnCount: turnCount + 1,
      visualEffects: [...state.visualEffects, ...batchEffects] // Append new effects
    });
  },

  pauseBattle: (paused) => set({ isPaused: paused }),
  endBattle: () => set({ isActive: false, winner: null, units: [] }),
  clearEffect: (id: string) => {
    set(state => ({
        visualEffects: state.visualEffects.filter(e => e.id !== id)
    }));
  },
}));
