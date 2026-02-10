import { create } from 'zustand';
import { Pokemon, Skill } from '@/types';
import { TYPE_CHART } from '@/data/constants';

export interface BattleUnit extends Pokemon {
  instanceId: string; // Unique ID for this battle instance
  currentHp: number;
  maxHp: number;
  actionValue: number; // 0 to 10000, 0 means ready to act
  team: 'player' | 'enemy';
  isDead: boolean;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'heal' | 'kill';
}

interface BattleState {
  isActive: boolean;
  units: BattleUnit[];
  actionQueue: string[]; // instanceIds sorted by actionValue
  logs: BattleLog[];
  turnCount: number;
  winner: 'player' | 'enemy' | null;
  isPaused: boolean;

  // Actions
  startBattle: (playerTeam: Pokemon[], enemyTeam: Pokemon[]) => void;
  nextTurn: () => void;
  pauseBattle: (paused: boolean) => void;
  endBattle: () => void;
}

const BASE_ACTION_DELAY = 10000;

export const useBattleStore = create<BattleState>((set, get) => ({
  isActive: false,
  units: [],
  actionQueue: [],
  logs: [],
  turnCount: 0,
  winner: null,
  isPaused: false,

  startBattle: (playerTeam, enemyTeam) => {
    // Initialize units
    const createUnit = (p: Pokemon, team: 'player' | 'enemy'): BattleUnit => ({
      ...p,
      instanceId: `${team}-${p.id}-${Math.random()}`,
      currentHp: p.stats.hp,
      maxHp: p.stats.maxHp,
      actionValue: BASE_ACTION_DELAY / p.stats.speed, // Initial delay
      team,
      isDead: false,
    });

    const units = [
      ...playerTeam.map(p => createUnit(p, 'player')),
      ...enemyTeam.map(p => createUnit(p, 'enemy'))
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
    
    // Get actor
    const actorId = actionQueue[0];
    let actor = units.find(u => u.instanceId === actorId);

    if (!actor || actor.isDead) {
      // Remove dead unit from queue if somehow still there
      const newQueue = actionQueue.filter(id => id !== actorId);
      set({ actionQueue: newQueue });
      return;
    }

    // Advance time (subtract actionValue from everyone)
    const timePassed = actor.actionValue;
    units = units.map(u => ({
      ...u,
      actionValue: Math.max(0, u.actionValue - timePassed)
    }));
    
    // Actor acts
    // 1. Select Target (Random living enemy)
    const targets = units.filter(u => u.team !== actor?.team && !u.isDead);
    if (targets.length === 0) {
      // Game Over (Win)
      set({ winner: actor.team });
      return;
    }
    const target = targets[Math.floor(Math.random() * targets.length)];

    // 2. Select Skill (Random for now)
    const skill = actor.skills[Math.floor(Math.random() * actor.skills.length)];

    // 3. Calculate Damage
    let damage = 0;
    let logMsg = '';
    
    if (skill) {
        // Type multiplier
        const multiplier = TYPE_CHART[skill.type]?.[target.element] || 1;
        
        // Basic damage formula
        const rawDamage = (actor.stats.atk * skill.power / 50) * (100 / (100 + target.stats.def));
        damage = Math.floor(rawDamage * multiplier);
        
        logMsg = `${actor.name} used ${skill.name} on ${target.name} for ${damage} damage!`;
        if (multiplier > 1) logMsg += ' (Super Effective!)';
        if (multiplier < 1) logMsg += ' (Not Effective...)';
    } else {
        // Default attack
        damage = Math.floor(actor.stats.atk * 0.8);
        logMsg = `${actor.name} attacked ${target.name} for ${damage} damage.`;
    }

    // 4. Apply Damage
    target.currentHp = Math.max(0, target.currentHp - damage);
    if (target.currentHp === 0) {
      target.isDead = true;
      logs = [...logs, { id: Date.now().toString(), message: `${target.name} fainted!`, type: 'kill' }];
    }
    
    logs = [...logs, { id: Date.now().toString() + 'dmg', message: logMsg, type: 'damage' }];

    // 5. Update Actor's Action Value
    actor.actionValue = BASE_ACTION_DELAY / actor.stats.speed;

    // 6. Update State
    // Update units array
    units = units.map(u => {
      if (u.instanceId === actor?.instanceId) return actor!;
      if (u.instanceId === target.instanceId) return target;
      return u;
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
      logs: logs.slice(-50), // Keep last 50 logs
      turnCount: turnCount + 1
    });
  },

  pauseBattle: (paused) => set({ isPaused: paused }),
  endBattle: () => set({ isActive: false, winner: null, units: [] }),
}));
