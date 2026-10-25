/**
 * Naval Campaign Achievements & Medals Engine
 * Defines tactical decorations awarded to commanders for distinguished combat feats
 */

export const MEDALS = [
  {
    id: 'elite_shot',
    title: "Tir d'Élite",
    category: 'Précision',
    rarity: 'Or',
    color: '#ffcc00',
    icon: '🎯',
    desc: 'Remporter une bataille avec une précision de tir ≥ 55%.'
  },
  {
    id: 'blitzkrieg',
    title: 'Blitzkrieg Naval',
    category: 'Vitesse',
    rarity: 'Cyan',
    color: '#64ffda',
    icon: '⚡',
    desc: 'Anéantir la flottille hostile en moins de 18 salves de tir.'
  },
  {
    id: 'carrier_intact',
    title: 'Amirauté Invaincue',
    category: 'Défense',
    rarity: 'Or',
    color: '#ffcc00',
    icon: '🛡️',
    desc: 'Remporter la victoire avec son Porte-avions totalement intact.'
  },
  {
    id: 'admiral_slayer',
    title: "Tombeur de l'Amiral",
    category: 'Stratégie',
    rarity: 'Diamant',
    color: '#00f0ff',
    icon: '🤖',
    desc: "Vaincre l'I.A. en protocole Menace 3/3 (Amiral)."
  },
  {
    id: 'veteran',
    title: 'Vétéran des Mers',
    category: 'Service',
    rarity: 'Argent',
    color: '#c0c0c0',
    icon: '⚔️',
    desc: 'Cumuler au moins 5 victoires confirmées au registre militaire.'
  },
  {
    id: 'naval_legend',
    title: 'Légende Navale',
    category: 'État-Major',
    rarity: 'Diamant',
    color: '#64ffda',
    icon: '⚓',
    desc: "Atteindre le grade suprême d'Amiral d'Escadre (16 victoires)."
  }
];

export function getUnlockedMedals(userId = 'guest') {
  try {
    const key = `bc_medals_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Check game outcome and unlock any newly earned medals
 * Returns array of newly unlocked medal objects
 */
export function evaluateCombatMedals({
  userId = 'guest',
  isWin,
  shotsCount,
  accuracy,
  carrierHitCount = 0,
  isSolo,
  soloDifficulty,
  totalWins = 0
}) {
  if (!isWin) return [];

  const currentMedals = getUnlockedMedals(userId);
  const newlyUnlocked = [];
  const now = new Date().toISOString();

  // 1. Tir d'Élite: accuracy >= 55%
  if (accuracy >= 55 && !currentMedals.elite_shot) {
    currentMedals.elite_shot = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'elite_shot'));
  }

  // 2. Blitzkrieg Naval: shotsCount <= 18
  if (shotsCount <= 18 && !currentMedals.blitzkrieg) {
    currentMedals.blitzkrieg = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'blitzkrieg'));
  }

  // 3. Amirauté Invaincue: carrier intact (0 hits)
  if (carrierHitCount === 0 && !currentMedals.carrier_intact) {
    currentMedals.carrier_intact = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'carrier_intact'));
  }

  // 4. Tombeur de l'Amiral: beat Admiral AI in solo
  if (isSolo && soloDifficulty === 'admiral' && !currentMedals.admiral_slayer) {
    currentMedals.admiral_slayer = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'admiral_slayer'));
  }

  // 5. Vétéran: totalWins >= 5
  if (totalWins >= 5 && !currentMedals.veteran) {
    currentMedals.veteran = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'veteran'));
  }

  // 6. Légende Navale: totalWins >= 16
  if (totalWins >= 16 && !currentMedals.naval_legend) {
    currentMedals.naval_legend = { unlockedAt: now };
    newlyUnlocked.push(MEDALS.find(m => m.id === 'naval_legend'));
  }

  if (newlyUnlocked.length > 0) {
    try {
      localStorage.setItem(`bc_medals_${userId}`, JSON.stringify(currentMedals));
    } catch (e) {}
  }

  return newlyUnlocked;
}
