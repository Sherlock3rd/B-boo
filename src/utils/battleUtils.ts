import { BattleUnit } from '@/store/useBattleStore';
// import { Pokemon } from '@/types';
// import { Skill } from '@/types';

export const BATTLE_WIDTH = 16;
export const BATTLE_HEIGHT = 12;

export const getDistance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const isInRange = (attacker: { x: number, y: number }, target: { x: number, y: number }, range: number) => {
    return getDistance(attacker, target) <= range;
};

// Find the best tile to stand on to attack target
// It should be:
// 1. Within skill range of target
// 2. Walkable (empty or occupied by self) -- actually just empty, we move step by step
// 3. Closest to current position (least movement cost)
export const findBestMoveTarget = (
    attacker: BattleUnit, 
    target: BattleUnit, 
    skillRange: number, 
    occupiedPositions: Set<string>,
    targetThreatRange: number = 0
): { x: number, y: number } | null => {
    
    const isSafe = (pos: {x: number, y: number}) => !isInRange(pos, target.position, targetThreatRange);

    // If current position is perfect (in range AND safe), stay put
    // If it's in range but unsafe, we proceed to search for a safe spot
    if (isInRange(attacker.position, target.position, skillRange) && isSafe(attacker.position)) {
        return attacker.position;
    }

    let bestPos: { x: number, y: number } | null = null;
    let maxScore = -Infinity;

    // Scan all tiles in the map
    for (let y = 0; y < BATTLE_HEIGHT; y++) {
        for (let x = 0; x < BATTLE_WIDTH; x++) {
            const posKey = `${x},${y}`;
            
            // Skip occupied tiles (unless it's self)
            if (occupiedPositions.has(posKey) && posKey !== `${attacker.position.x},${attacker.position.y}`) continue;

            // Check if this tile allows hitting the target
            if (isInRange({ x, y }, target.position, skillRange)) {
                const safe = isSafe({ x, y });
                const distToSelf = getDistance(attacker.position, { x, y });
                
                // Scoring:
                // Base priority: Safety (+1000)
                // Secondary priority: Minimize movement (-dist)
                const score = (safe ? 1000 : 0) - distToSelf;

                if (score > maxScore) {
                    maxScore = score;
                    bestPos = { x, y };
                }
            }
        }
    }

    return bestPos;
};

// Calculate next step towards a destination
// Simple Manhattan pathfinding (not full A* for simplicity in this grid size)
export const getNextStep = (
    current: { x: number, y: number }, 
    target: { x: number, y: number }, 
    moveRange: number,
    occupiedPositions: Set<string>
): { x: number, y: number } => {
    
    let pos = { ...current };
    let movesLeft = moveRange;

    // Safety break
    let steps = 0;
    while (movesLeft > 0 && (pos.x !== target.x || pos.y !== target.y) && steps < 20) {
        steps++;
        
        // Try to move along X
        let nextX = pos.x;
        if (pos.x < target.x) nextX++;
        else if (pos.x > target.x) nextX--;

        if (nextX !== pos.x && !occupiedPositions.has(`${nextX},${pos.y}`)) {
            pos.x = nextX;
            movesLeft--;
            continue;
        }

        // Try to move along Y
        let nextY = pos.y;
        if (pos.y < target.y) nextY++;
        else if (pos.y > target.y) nextY--;

        if (nextY !== pos.y && !occupiedPositions.has(`${pos.x},${nextY}`)) {
            pos.y = nextY;
            movesLeft--;
            continue;
        }

        // If blocked in desired direction, simple stuck handling: don't move
        // A* would be better here but for 8x6 grid with few units, this is okay-ish
        break;
    }

    return pos;
};
