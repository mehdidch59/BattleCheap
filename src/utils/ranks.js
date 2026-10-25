/**
 * Military Naval Rank Progression Engine
 * Defines four official naval officer tiers with insignia, title, and progression math
 */

export const RANKS = [
  {
    id: 'enseigne',
    minWins: 0,
    maxWins: 2,
    title: 'Enseigne de Vaisseau',
    shortTitle: 'ENSEIGNE',
    code: 'OF-1',
    color: '#cd7f32', // Bronze
    badgeBg: 'rgba(205, 127, 50, 0.12)',
    badgeBorder: 'rgba(205, 127, 50, 0.35)',
    desc: 'Officier subalterne en formation sur le front.'
  },
  {
    id: 'fregate',
    minWins: 3,
    maxWins: 7,
    title: 'Capitaine de Frégate',
    shortTitle: 'FRÉGATE',
    code: 'OF-4',
    color: '#c0c0c0', // Argent
    badgeBg: 'rgba(192, 192, 192, 0.12)',
    badgeBorder: 'rgba(192, 192, 192, 0.4)',
    desc: 'Commandant d\'escorteur d\'escadre aguerri.'
  },
  {
    id: 'vaisseau',
    minWins: 8,
    maxWins: 15,
    title: 'Capitaine de Vaisseau',
    shortTitle: 'VAISSEAU',
    code: 'OF-5',
    color: '#ffcc00', // Or
    badgeBg: 'rgba(255, 204, 0, 0.14)',
    badgeBorder: 'rgba(255, 204, 0, 0.45)',
    desc: 'Commandant de bâtiment de premier rang (Croiseur / Porte-avions).'
  },
  {
    id: 'amiral',
    minWins: 16,
    maxWins: Infinity,
    title: 'Amiral d\'Escadre',
    shortTitle: 'AMIRAL',
    code: 'OF-8',
    color: '#64ffda', // Diamant / Cyan Flotte
    badgeBg: 'rgba(100, 255, 218, 0.16)',
    badgeBorder: 'rgba(100, 255, 218, 0.5)',
    desc: 'Haut commandement de l\'état-major stratégique.'
  }
];

export function getRank(wins) {
  const w = Math.max(0, Number(wins) || 0);
  return RANKS.slice().reverse().find(r => w >= r.minWins) || RANKS[0];
}

export function getRankProgress(wins) {
  const w = Math.max(0, Number(wins) || 0);
  const currentRank = getRank(w);

  if (currentRank.maxWins === Infinity) {
    return {
      currentRank,
      nextRank: null,
      progress: 100,
      remaining: 0
    };
  }

  const currentIdx = RANKS.findIndex(r => r.id === currentRank.id);
  const nextRank = RANKS[currentIdx + 1];

  const totalRequiredInTier = (currentRank.maxWins + 1) - currentRank.minWins;
  const currentPointsInTier = w - currentRank.minWins;
  const progress = Math.min(100, Math.round((currentPointsInTier / totalRequiredInTier) * 100));
  const remaining = (currentRank.maxWins + 1) - w;

  return {
    currentRank,
    nextRank,
    progress,
    remaining
  };
}
