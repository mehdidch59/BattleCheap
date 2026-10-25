import { RANKS, getRank, getRankProgress } from './ranks';

describe('Military Naval Rank Progression Tests', () => {
  test('RANKS config defines all 4 officer tiers', () => {
    expect(RANKS.length).toBe(4);
    expect(RANKS.map(r => r.id)).toEqual(['enseigne', 'fregate', 'vaisseau', 'amiral']);
  });

  test('getRank correctly determines rank tier based on wins', () => {
    expect(getRank(0).id).toBe('enseigne');
    expect(getRank(1).id).toBe('enseigne');
    expect(getRank(2).id).toBe('enseigne');

    expect(getRank(3).id).toBe('fregate');
    expect(getRank(7).id).toBe('fregate');

    expect(getRank(8).id).toBe('vaisseau');
    expect(getRank(15).id).toBe('vaisseau');

    expect(getRank(16).id).toBe('amiral');
    expect(getRank(50).id).toBe('amiral');
  });

  test('getRank handles negative or NaN gracefully', () => {
    expect(getRank(-5).id).toBe('enseigne');
    expect(getRank(undefined).id).toBe('enseigne');
    expect(getRank(null).id).toBe('enseigne');
  });

  test('getRankProgress calculates percentage and remaining wins', () => {
    // Enseigne: minWins 0, maxWins 2 (total 3 wins to tier up)
    const p0 = getRankProgress(0);
    expect(p0.currentRank.id).toBe('enseigne');
    expect(p0.nextRank.id).toBe('fregate');
    expect(p0.progress).toBe(0);
    expect(p0.remaining).toBe(3);

    const p1 = getRankProgress(1);
    expect(p1.progress).toBe(33);
    expect(p1.remaining).toBe(2);

    // Amiral (max rank)
    const pMax = getRankProgress(20);
    expect(pMax.currentRank.id).toBe('amiral');
    expect(pMax.nextRank).toBeNull();
    expect(pMax.progress).toBe(100);
    expect(pMax.remaining).toBe(0);
  });
});
