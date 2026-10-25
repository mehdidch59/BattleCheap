import { MEDALS, getUnlockedMedals, evaluateCombatMedals } from './achievements';

describe('Naval Campaign Achievements Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('MEDALS defines all 6 tactical decorations', () => {
    expect(MEDALS.length).toBe(6);
    expect(MEDALS.map(m => m.id)).toEqual([
      'elite_shot',
      'blitzkrieg',
      'carrier_intact',
      'admiral_slayer',
      'veteran',
      'naval_legend'
    ]);
  });

  test('evaluateCombatMedals unlocks elite_shot when accuracy >= 55% on win', () => {
    const unlocked = evaluateCombatMedals({
      userId: 'test_user',
      isWin: true,
      shotsCount: 25,
      accuracy: 60,
      carrierHitCount: 2,
      isSolo: false,
      totalWins: 1
    });

    expect(unlocked.some(m => m.id === 'elite_shot')).toBe(true);
    expect(unlocked.some(m => m.id === 'blitzkrieg')).toBe(false);

    const saved = getUnlockedMedals('test_user');
    expect(saved.elite_shot).toBeDefined();
  });

  test('evaluateCombatMedals unlocks blitzkrieg when shots <= 18', () => {
    const unlocked = evaluateCombatMedals({
      userId: 'test_user_2',
      isWin: true,
      shotsCount: 16,
      accuracy: 45,
      carrierHitCount: 1,
      isSolo: false,
      totalWins: 2
    });

    expect(unlocked.some(m => m.id === 'blitzkrieg')).toBe(true);
  });

  test('evaluateCombatMedals unlocks admiral_slayer when defeating admiral AI', () => {
    const unlocked = evaluateCombatMedals({
      userId: 'test_user_3',
      isWin: true,
      shotsCount: 30,
      accuracy: 40,
      carrierHitCount: 3,
      isSolo: true,
      soloDifficulty: 'admiral',
      totalWins: 3
    });

    expect(unlocked.some(m => m.id === 'admiral_slayer')).toBe(true);
  });

  test('evaluateCombatMedals does not unlock on loss', () => {
    const unlocked = evaluateCombatMedals({
      userId: 'test_user_loss',
      isWin: false,
      shotsCount: 15,
      accuracy: 80,
      carrierHitCount: 0,
      isSolo: true,
      soloDifficulty: 'admiral',
      totalWins: 0
    });

    expect(unlocked.length).toBe(0);
  });
});
