/**
 * Fleet Camouflage Themes
 * Naval hull paint schemes and acoustic stealth finishes
 */

export const CAMOUFLAGES = [
  {
    id: 'ocean',
    name: 'Marine Océanique',
    subtitle: 'Atlantique classique',
    color: '#64ffda',
    secondary: '#00b4d8',
    shipFill: 'rgba(100, 255, 218, 0.25)',
    shipBorder: '#64ffda',
    badge: 'OTAN-BLUE'
  },
  {
    id: 'arctic',
    name: 'Banquise Arctique',
    subtitle: 'Gris titane / Furtif polaire',
    color: '#e2e8f0',
    secondary: '#94a3b8',
    shipFill: 'rgba(226, 232, 240, 0.25)',
    shipBorder: '#e2e8f0',
    badge: 'ARCTIC-OPS'
  },
  {
    id: 'desert',
    name: 'Tempête du Désert',
    subtitle: 'Ambre & Or tactique',
    color: '#ffcc00',
    secondary: '#fb8500',
    shipFill: 'rgba(255, 204, 0, 0.25)',
    shipBorder: '#ffcc00',
    badge: 'MIRAGE-GOLD'
  },
  {
    id: 'phantom',
    name: 'Flotte Fantôme',
    subtitle: 'Onyx & Crimson furtif',
    color: '#ff4757',
    secondary: '#b5179e',
    shipFill: 'rgba(255, 71, 87, 0.25)',
    shipBorder: '#ff4757',
    badge: 'STEALTH-RED'
  }
];

export function getActiveCamouflage() {
  const saved = localStorage.getItem('bc_camo');
  return CAMOUFLAGES.find(c => c.id === saved) || CAMOUFLAGES[0];
}

export function setActiveCamouflage(camoId) {
  const found = CAMOUFLAGES.find(c => c.id === camoId);
  if (found) {
    localStorage.setItem('bc_camo', found.id);
  }
  return found || CAMOUFLAGES[0];
}
