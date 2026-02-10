import { create } from 'zustand';
import { Pokemon } from '@/types';
import { TYPE_CHART } from '@/data/constants';

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
  startBattle: (playerTeam: Pokemon[], enemyTeam: Pokemon[]) => void;
  nextTurn: () => void;
  pauseBattle: (paused: boolean) => void;
  endBattle: () => void;
  clearEffect: (id: string) => void;
}

const BASE_ACTION_DELAY = 10000;
export const BATTLE_WIDTH = 8;
export const BATTLE_HEIGHT = 6;

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
    // Initialize units
    const createUnit = (p: Pokemon, team: 'player' | 'enemy', index: number): BattleUnit => ({
      ...p,
      instanceId: `${team}-${p.id}-${Math.random()}`,
      currentHp: p.stats.hp,
      maxHp: p.stats.maxHp,
      actionValue: BASE_ACTION_DELAY / p.stats.speed, // Initial delay
      team,
      isDead: false,
      position: {
        x: team === 'player' ? 1 : BATTLE_WIDTH - 2, // Player at x=1, Enemy at x=6 (Width-2)
        y: index + 1, // Simple vertical distribution 1, 2, 3...
      },
      moveRange: p.moveRange || 3, // Default 3
      attackRange: p.attackRange || 1, // Default 1
    });

    const units = [
      ...playerTeam.map((p, i) => createUnit(p, 'player', i)),
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
        // 1. Identify Targets
        const targets = units.filter(u => u.team !== currentActor.team && !u.isDead);
        if (targets.length === 0) return; // Win condition handled at end

        // 2. Find Closest Target
        let closestTarget = targets[0];
        let minDistance = Infinity;
        const getDist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

        targets.forEach(t => {
            const d = getDist(currentActor.position, t.position);
            if (d < minDistance) {
                minDistance = d;
                closestTarget = t;
            }
        });

        // 3. Move Logic
        let movesLeft = currentActor.moveRange;
        const attackRange = currentActor.attackRange;
        let newPos = { ...currentActor.position };

        while (minDistance > attackRange && movesLeft > 0) {
            const dx = closestTarget.position.x - newPos.x;
            const dy = closestTarget.position.y - newPos.y;
            let nextX = newPos.x;
            let nextY = newPos.y;
            
            if (Math.abs(dx) >= Math.abs(dy)) nextX += dx > 0 ? 1 : -1;
            else nextY += dy > 0 ? 1 : -1;

            const isOccupied = units.some(u => !u.isDead && u.position.x === nextX && u.position.y === nextY);
            if (!isOccupied) {
                newPos = { x: nextX, y: nextY };
                movesLeft--;
                minDistance = getDist(newPos, closestTarget.position);
            } else {
                 // Try alt axis
                 let altX = newPos.x;
                 let altY = newPos.y;
                 if (Math.abs(dx) >= Math.abs(dy)) { if (dy !== 0) altY += dy > 0 ? 1 : -1; }
                 else { if (dx !== 0) altX += dx > 0 ? 1 : -1; }
                 
                 const isAltOccupied = units.some(u => !u.isDead && u.position.x === altX && u.position.y === altY);
                 if (!isAltOccupied && (altX !== newPos.x || altY !== newPos.y)) {
                     newPos = { x: altX, y: altY };
                     movesLeft--;
                     minDistance = getDist(newPos, closestTarget.position);
                 } else {
                     break;
                 }
            }
        }
        
        // Update position in units array immediately so next actor sees it occupied
        units = units.map(u => u.instanceId === currentActor.instanceId ? { ...u, position: newPos } : u);
        
        // 4. Attack Logic
        let logMsg = '';
        let damage = 0;
        
        if (minDistance <= attackRange) {
             const skill = currentActor.skills[Math.floor(Math.random() * currentActor.skills.length)];
             
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
     set({ isActive: false, winner: 'player', units, logs: [...logs, { id: 'end', message: 'You won!', type: 'info' }] });
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
