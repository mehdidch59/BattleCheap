// Naval Battle AI & Fleet Generation Engine
// Implements Hunt-and-Target State Machine, Checkerboard Parity & Probability Density

export const SHIPS_CONFIG = [
  { id: 0, key: 'carrier', name: 'Porte-avions', code: 'CVN-68', size: 5, icon: 'carrier' },
  { id: 1, key: 'battleship', name: 'Croiseur', code: 'CG-52', size: 4, icon: 'cruiser' },
  { id: 2, key: 'destroyer', name: 'Contre-torpilleur', code: 'DDG-51', size: 3, icon: 'destroyer' },
  { id: 3, key: 'submarine', name: 'Sous-marin', code: 'SSN-774', size: 3, icon: 'submarine' },
  { id: 4, key: 'patrol', name: 'Torpilleur', code: 'PT-109', size: 2, icon: 'patrol' }
];

export const GRID_SIZE = 10;

// Check if a ship can be placed at (x, y) with a given orientation
export function canPlaceShip(grid, x, y, size, isHorizontal) {
  if (isHorizontal) {
    if (x + size > GRID_SIZE) return false;
    for (let i = 0; i < size; i++) {
      if (grid[y][x + i] !== null) return false;
    }
  } else {
    if (y + size > GRID_SIZE) return false;
    for (let i = 0; i < size; i++) {
      if (grid[y + i][x] !== null) return false;
    }
  }
  return true;
}

// Generates a valid random fleet configuration
export function generateRandomFleet(ships = SHIPS_CONFIG) {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placed = [];

  for (const ship of ships) {
    let placedSuccess = false;
    let attempts = 0;

    while (!placedSuccess && attempts < 500) {
      attempts++;
      const isHorizontal = Math.random() < 0.5;
      const x = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE - ship.size + 1 : GRID_SIZE));
      const y = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : GRID_SIZE - ship.size + 1));

      if (canPlaceShip(grid, x, y, ship.size, isHorizontal)) {
        const positions = [];
        for (let i = 0; i < ship.size; i++) {
          const posX = isHorizontal ? x + i : x;
          const posY = isHorizontal ? y : y + i;
          grid[posY][posX] = ship.id;
          positions.push({ x: posX, y: posY, hit: false });
        }
        placed.push({ ...ship, isHorizontal, positions });
        placedSuccess = true;
      }
    }
  }

  return placed;
}

// Determines if any ship has just been sunk or is completely sunk
export function getShipStatus(ships, shots) {
  const shotMap = new Set(shots.map(s => `${s.x},${s.y}`));
  
  return ships.map(ship => {
    const hitsCount = ship.positions.filter(pos => shotMap.has(`${pos.x},${pos.y}`)).length;
    const isSunk = hitsCount === ship.size;
    return {
      ...ship,
      hitsCount,
      isSunk
    };
  });
}

// Find if the latest shot just sunk a ship
export function findJustSunkShip(ships, shots, latestShot) {
  if (!latestShot || !latestShot.hit) return null;
  const shotMap = new Set(shots.map(s => `${s.x},${s.y}`));
  
  for (const ship of ships) {
    const includesLatest = ship.positions.some(p => p.x === latestShot.x && p.y === latestShot.y);
    if (includesLatest) {
      const allHit = ship.positions.every(p => shotMap.has(`${p.x},${p.y}`));
      if (allHit) return ship;
    }
  }
  return null;
}

// Tactical AI implementation for Solo Simulation mode
export class TacticalAI {
  constructor(difficulty = 'veteran') {
    this.difficulty = difficulty; // 'recruit' | 'veteran' | 'admiral'
    this.shotsFired = [];
    this.hitHistory = [];
    this.targetQueue = [];
    this.currentHunt = []; // hits belonging to currently targeted ship
  }

  reset() {
    this.shotsFired = [];
    this.hitHistory = [];
    this.targetQueue = [];
    this.currentHunt = [];
  }

  hasFired(x, y) {
    return this.shotsFired.some(s => s.x === x && s.y === y);
  }

  getValidNeighbors(x, y) {
    const candidates = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ];
    return candidates.filter(c => c.x >= 0 && c.x < GRID_SIZE && c.y >= 0 && c.y < GRID_SIZE && !this.hasFired(c.x, c.y));
  }

  // Returns next shot coordinates { x, y }
  getNextShot(playerShips) {
    let chosen = null;

    // 1. If we have queued tactical targets (from previous hits)
    while (this.targetQueue.length > 0) {
      const candidate = this.targetQueue.shift();
      if (!this.hasFired(candidate.x, candidate.y)) {
        chosen = candidate;
        break;
      }
    }

    // 2. If no queued target, use strategic search based on difficulty
    if (!chosen) {
      if (this.difficulty === 'recruit') {
        chosen = this.getRandomShot();
      } else if (this.difficulty === 'veteran') {
        chosen = this.getParityShot();
      } else {
        chosen = this.getAdmiralHeatmapShot(playerShips);
      }
    }

    return chosen;
  }

  getRandomShot() {
    const available = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!this.hasFired(x, y)) available.push({ x, y });
      }
    }
    if (available.length === 0) return { x: 0, y: 0 };
    return available[Math.floor(Math.random() * available.length)];
  }

  // Parity / Checkerboard search: every ship is at least size 2,
  // so testing only checkerboard squares (x + y)%2 === 0 finds every ship 2x faster!
  getParityShot() {
    const parityCells = [];
    const fallbackCells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!this.hasFired(x, y)) {
          if ((x + y) % 2 === 0) {
            parityCells.push({ x, y });
          } else {
            fallbackCells.push({ x, y });
          }
        }
      }
    }

    const pool = parityCells.length > 0 ? parityCells : fallbackCells;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Probability density heatmap calculation for Admiral difficulty
  getAdmiralHeatmapShot(playerShips) {
    const heatmap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    const aliveShipSizes = playerShips
      ? playerShips.filter(s => !s.positions.every(p => this.hasFired(p.x, p.y))).map(s => s.size)
      : [5, 4, 3, 3, 2];

    for (const size of aliveShipSizes) {
      // Horizontal placements
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x <= GRID_SIZE - size; x++) {
          let canFit = true;
          for (let i = 0; i < size; i++) {
            const fired = this.shotsFired.find(s => s.x === x + i && s.y === y);
            if (fired && !fired.hit) {
              canFit = false;
              break;
            }
          }
          if (canFit) {
            for (let i = 0; i < size; i++) {
              if (!this.hasFired(x + i, y)) {
                heatmap[y][x + i] += 1;
              }
            }
          }
        }
      }

      // Vertical placements
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y <= GRID_SIZE - size; y++) {
          let canFit = true;
          for (let i = 0; i < size; i++) {
            const fired = this.shotsFired.find(s => s.x === x && s.y === y + i);
            if (fired && !fired.hit) {
              canFit = false;
              break;
            }
          }
          if (canFit) {
            for (let i = 0; i < size; i++) {
              if (!this.hasFired(x, y + i)) {
                heatmap[y + i][x] += 1;
              }
            }
          }
        }
      }
    }

    let maxVal = -1;
    let candidates = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!this.hasFired(x, y)) {
          if (heatmap[y][x] > maxVal) {
            maxVal = heatmap[y][x];
            candidates = [{ x, y }];
          } else if (heatmap[y][x] === maxVal) {
            candidates.push({ x, y });
          }
        }
      }
    }

    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return this.getParityShot();
  }

  // AI learns the outcome of its shot
  recordShotResult(x, y, hit, sunkShip = null) {
    this.shotsFired.push({ x, y, hit });

    if (hit) {
      this.hitHistory.push({ x, y });
      this.currentHunt.push({ x, y });

      if (sunkShip) {
        // Ship sunk! Remove its positions from currentHunt
        const sunkSet = new Set(sunkShip.positions.map(p => `${p.x},${p.y}`));
        this.currentHunt = this.currentHunt.filter(p => !sunkSet.has(`${p.x},${p.y}`));
        // Re-evaluate queue: if hits remain from another overlapping ship, hunt them
        this.targetQueue = [];
        if (this.currentHunt.length > 0) {
          this.rebuildTargetQueue();
        }
      } else {
        // Not sunk yet -> hunt adjacent or follow established axis!
        this.updateHuntStrategy();
      }
    }
  }

  updateHuntStrategy() {
    if (this.currentHunt.length === 1) {
      // First hit -> probe all 4 neighbors
      const h = this.currentHunt[0];
      const neighbors = this.getValidNeighbors(h.x, h.y);
      this.targetQueue = [...neighbors, ...this.targetQueue];
    } else if (this.currentHunt.length >= 2) {
      // 2 or more hits -> identify alignment (horizontal or vertical)
      const sortedX = [...this.currentHunt].sort((a, b) => a.x - b.x);
      const sortedY = [...this.currentHunt].sort((a, b) => a.y - b.y);

      const isHorizontal = this.currentHunt.every(p => p.y === this.currentHunt[0].y);
      const isVertical = this.currentHunt.every(p => p.x === this.currentHunt[0].x);

      const linearTargets = [];
      if (isHorizontal) {
        const minX = sortedX[0].x;
        const maxX = sortedX[sortedX.length - 1].x;
        const y = sortedX[0].y;
        if (maxX + 1 < GRID_SIZE && !this.hasFired(maxX + 1, y)) linearTargets.push({ x: maxX + 1, y });
        if (minX - 1 >= 0 && !this.hasFired(minX - 1, y)) linearTargets.push({ x: minX - 1, y });
      } else if (isVertical) {
        const minY = sortedY[0].y;
        const maxY = sortedY[sortedY.length - 1].y;
        const x = sortedY[0].x;
        if (maxY + 1 < GRID_SIZE && !this.hasFired(x, maxY + 1)) linearTargets.push({ x, y: maxY + 1 });
        if (minY - 1 >= 0 && !this.hasFired(x, minY - 1)) linearTargets.push({ x, y: minY - 1 });
      }

      this.targetQueue = [...linearTargets, ...this.targetQueue];
    }
  }

  rebuildTargetQueue() {
    for (const h of this.currentHunt) {
      const neighbors = this.getValidNeighbors(h.x, h.y);
      this.targetQueue.push(...neighbors);
    }
  }
}
