import { generateRandomFleet, TacticalAI, canPlaceShip, SHIPS_CONFIG, GRID_SIZE } from './gameAI';

describe('Game AI & Naval Logic Tests', () => {
  test('generateRandomFleet should place all 5 ships without overlap and within bounds', () => {
    const fleet = generateRandomFleet(SHIPS_CONFIG);
    expect(fleet).toHaveLength(5);

    const occupied = new Set();
    fleet.forEach(ship => {
      expect(ship.positions).toHaveLength(ship.size);
      ship.positions.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(GRID_SIZE);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(GRID_SIZE);

        const key = `${pos.x},${pos.y}`;
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      });
    });

    // 5 + 4 + 3 + 3 + 2 = 17 total cells
    expect(occupied.size).toBe(17);
  });

  test('canPlaceShip should reject out-of-bounds placements', () => {
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    // Size 5 starting at x=8 horizontally should fail
    expect(canPlaceShip(grid, 8, 2, 5, true)).toBe(false);

    // Size 5 starting at y=7 vertically should fail
    expect(canPlaceShip(grid, 2, 7, 5, false)).toBe(false);

    // Valid placement
    expect(canPlaceShip(grid, 0, 0, 5, true)).toBe(true);
  });

  test('TacticalAI should fire valid shots without repeating', () => {
    const ai = new TacticalAI('veteran');
    const playerFleet = generateRandomFleet(SHIPS_CONFIG);

    const shot1 = ai.getNextShot(playerFleet);
    expect(shot1.x).toBeGreaterThanOrEqual(0);
    expect(shot1.x).toBeLessThan(GRID_SIZE);
    expect(shot1.y).toBeGreaterThanOrEqual(0);
    expect(shot1.y).toBeLessThan(GRID_SIZE);

    ai.recordShotResult(shot1.x, shot1.y, false);

    const shot2 = ai.getNextShot(playerFleet);
    expect(shot2.x !== shot1.x || shot2.y !== shot1.y).toBe(true);
  });

  test('TacticalAI should prioritize adjacent neighbors when a hit is recorded', () => {
    const ai = new TacticalAI('veteran');
    // Simulate hit at (4, 4)
    ai.recordShotResult(4, 4, true);

    const nextShot = ai.getNextShot([]);
    const isAdjacent = (
      (Math.abs(nextShot.x - 4) === 1 && nextShot.y === 4) ||
      (Math.abs(nextShot.y - 4) === 1 && nextShot.x === 4)
    );
    expect(isAdjacent).toBe(true);
  });
});
