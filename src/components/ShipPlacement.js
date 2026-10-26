import React, { useState } from 'react';
import { SHIPS_CONFIG, canPlaceShip, generateRandomFleet, GRID_SIZE } from '../utils/gameAI';
import { ShipIcon } from './ShipGraphic';
import { sound } from '../utils/audio';
import { RotateIcon, UndoIcon, CheckIcon } from './TacticalIcons';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PRESET_FORMATIONS = {
  coastal: {
    label: 'DISPERSION CÔTIÈRE',
    desc: 'Bordures maritimes',
    ships: [
      { id: 0, isHorizontal: true, start: { x: 0, y: 0 } },
      { id: 1, isHorizontal: false, start: { x: 9, y: 0 } },
      { id: 2, isHorizontal: true, start: { x: 6, y: 9 } },
      { id: 3, isHorizontal: false, start: { x: 0, y: 6 } },
      { id: 4, isHorizontal: true, start: { x: 1, y: 9 } }
    ]
  },
  staggered: {
    label: 'ÉCRAN EN QUINCONCE',
    desc: 'Anti-parité I.A.',
    ships: [
      { id: 0, isHorizontal: true, start: { x: 2, y: 2 } },
      { id: 1, isHorizontal: false, start: { x: 8, y: 4 } },
      { id: 2, isHorizontal: true, start: { x: 1, y: 7 } },
      { id: 3, isHorizontal: false, start: { x: 5, y: 5 } },
      { id: 4, isHorizontal: true, start: { x: 7, y: 9 } }
    ]
  },
  battleline: {
    label: 'LIGNE D\'ESCADRE',
    desc: 'Vanguard d\'assaut',
    ships: [
      { id: 0, isHorizontal: false, start: { x: 2, y: 2 } },
      { id: 1, isHorizontal: false, start: { x: 4, y: 3 } },
      { id: 2, isHorizontal: false, start: { x: 6, y: 4 } },
      { id: 3, isHorizontal: false, start: { x: 8, y: 3 } },
      { id: 4, isHorizontal: true, start: { x: 4, y: 8 } }
    ]
  }
};

const ShipPlacement = ({ onReady }) => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [selectedShipId, setSelectedShipId] = useState(0);
  const [orientation, setOrientation] = useState('horizontal'); // 'horizontal' | 'vertical'
  const [placedShips, setPlacedShips] = useState([]);
  const [hoverCoord, setHoverCoord] = useState(null);

  const currentShip = SHIPS_CONFIG.find(s => s.id === selectedShipId) || SHIPS_CONFIG[0];
  const isCurrentShipPlaced = placedShips.some(p => p.id === currentShip.id);

  // Toggle orientation with mechanical ratchet audio
  const handleRotate = () => {
    sound.playRatchetClick();
    setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Pick up an already placed ship from the grid (or fleet card)
  const pickupShip = (shipId) => {
    const existing = placedShips.find(p => p.id === shipId);
    if (!existing) {
      setSelectedShipId(shipId);
      sound.playBlip(680, 0.03);
      return;
    }

    sound.playBlip(540, 0.05);

    // Remove ship from grid
    const newGrid = grid.map(row => [...row]);
    existing.positions.forEach(pos => {
      newGrid[pos.y][pos.x] = null;
    });

    setGrid(newGrid);
    setPlacedShips(prev => prev.filter(p => p.id !== shipId));
    setOrientation(existing.isHorizontal ? 'horizontal' : 'vertical');
    setSelectedShipId(shipId);
  };

  // Select next unplaced ship automatically
  const selectNextUnplacedShip = (currentPlacedList) => {
    const remaining = SHIPS_CONFIG.find(s => !currentPlacedList.some(p => p.id === s.id));
    if (remaining) {
      setSelectedShipId(remaining.id);
    }
  };

  // Keyboard shortcut listener for 'R' to rotate, 'Z' to undo, 'A' to auto-deploy, '1-5' to pick ship, 'Enter' to lock in
  const handleKeyDown = (e) => {
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      handleRotate();
    } else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      handleUndo();
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      handleAutoDeploy();
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      const numIdx = parseInt(e.key, 10) - 1;
      if (SHIPS_CONFIG[numIdx]) {
        pickupShip(SHIPS_CONFIG[numIdx].id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoverCoord(prev => ({ x: prev ? prev.x : 0, y: Math.max(0, (prev ? prev.y : 0) - 1) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoverCoord(prev => ({ x: prev ? prev.x : 0, y: Math.min(9, (prev ? prev.y : 0) + 1) }));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHoverCoord(prev => ({ x: Math.max(0, (prev ? prev.x : 0) - 1), y: prev ? prev.y : 0 }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHoverCoord(prev => ({ x: Math.min(9, (prev ? prev.x : 0) + 1), y: prev ? prev.y : 0 }));
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (hoverCoord && !isCurrentShipPlaced && isValidPlacement(hoverCoord.x, hoverCoord.y)) {
        e.preventDefault();
        handlePlaceShip(hoverCoord.x, hoverCoord.y);
      } else if (placedShips.length === SHIPS_CONFIG.length && isCurrentShipPlaced) {
        e.preventDefault();
        handleConfirm();
      }
    }
  };

  // Undo last placed ship
  const handleUndo = () => {
    if (placedShips.length === 0) return;
    sound.playBlip(440, 0.08);

    const lastShip = placedShips[placedShips.length - 1];
    const newGrid = grid.map(row => [...row]);
    lastShip.positions.forEach(pos => {
      newGrid[pos.y][pos.x] = null;
    });

    setGrid(newGrid);
    setPlacedShips(prev => prev.slice(0, -1));
    setSelectedShipId(lastShip.id);
    setOrientation(lastShip.isHorizontal ? 'horizontal' : 'vertical');
  };

  // Reset entire fleet
  const handleReset = () => {
    sound.playBlip(350, 0.1);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setSelectedShipId(0);
    setPlacedShips([]);
  };

  // Auto-Deploy (Randomize Fleet)
  const handleAutoDeploy = () => {
    sound.playSonarPing();
    const randomizedFleet = generateRandomFleet(SHIPS_CONFIG);
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    randomizedFleet.forEach(ship => {
      ship.positions.forEach(pos => {
        newGrid[pos.y][pos.x] = ship.id;
      });
    });

    setGrid(newGrid);
    setPlacedShips(randomizedFleet);
    setSelectedShipId(SHIPS_CONFIG[0].id);
  };

  // Check if current hover is a valid placement
  const isValidPlacement = (x, y) => {
    if (!currentShip || isCurrentShipPlaced) return false;
    return canPlaceShip(grid, x, y, currentShip.size, orientation === 'horizontal');
  };

  // Get coordinates covered by preview
  const getPreviewCells = () => {
    if (!hoverCoord || !currentShip || isCurrentShipPlaced) return [];
    const { x, y } = hoverCoord;
    const isHorizontal = orientation === 'horizontal';
    const cells = [];

    for (let i = 0; i < currentShip.size; i++) {
      const cx = isHorizontal ? x + i : x;
      const cy = isHorizontal ? y : y + i;
      if (cx >= 0 && cx < GRID_SIZE && cy >= 0 && cy < GRID_SIZE) {
        cells.push({ x: cx, y: cy });
      }
    }
    return cells;
  };

  // Place ship at coordinates or pickup existing ship if clicking occupied cell
  const handleCellClick = (x, y) => {
    const existingShipId = grid[y][x];

    // If clicking an existing ship on the grid, pick it up to relocate!
    if (existingShipId !== null && existingShipId !== undefined) {
      pickupShip(existingShipId);
      return;
    }

    // Otherwise, place currently selected ship
    if (!currentShip || isCurrentShipPlaced) return;

    const isHorizontal = orientation === 'horizontal';
    if (!canPlaceShip(grid, x, y, currentShip.size, isHorizontal)) {
      sound.playBlip(220, 0.12);
      return;
    }

    sound.playShipPlace();

    const newGrid = grid.map(row => [...row]);
    const positions = [];

    for (let i = 0; i < currentShip.size; i++) {
      const posX = isHorizontal ? x + i : x;
      const posY = isHorizontal ? y : y + i;
      newGrid[posY][posX] = currentShip.id;
      positions.push({ x: posX, y: posY, hit: false });
    }

    const updatedPlaced = [...placedShips, { ...currentShip, isHorizontal, positions }];
    setGrid(newGrid);
    setPlacedShips(updatedPlaced);

    // Automatically transition cursor to next unplaced ship
    selectNextUnplacedShip(updatedPlaced);
  };

  // 1-Click Tactical Naval Formation Application
  const handleApplyFormation = (key) => {
    sound.playSonarPing();
    const formation = PRESET_FORMATIONS[key];
    if (!formation) return;

    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    const newPlaced = [];

    formation.ships.forEach(item => {
      const shipConfig = SHIPS_CONFIG.find(s => s.id === item.id);
      if (!shipConfig) return;

      const positions = [];
      for (let i = 0; i < shipConfig.size; i++) {
        const posX = item.isHorizontal ? item.start.x + i : item.start.x;
        const posY = item.isHorizontal ? item.start.y : item.start.y + i;
        newGrid[posY][posX] = shipConfig.id;
        positions.push({ x: posX, y: posY, hit: false });
      }

      newPlaced.push({
        ...shipConfig,
        isHorizontal: item.isHorizontal,
        positions
      });
    });

    setGrid(newGrid);
    setPlacedShips(newPlaced);
    setSelectedShipId(0);
  };

  const handleConfirm = () => {
    if (placedShips.length === SHIPS_CONFIG.length) {
      sound.playLaunch();
      onReady(placedShips);
    }
  };

  const previewCells = getPreviewCells();
  const placementValid = hoverCoord ? isValidPlacement(hoverCoord.x, hoverCoord.y) : false;

  return (
    <div
      className="ship-placement tactical-panel player-board"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem', outline: 'none' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--nav-text)', margin: '0 0 0.4rem', fontSize: '1.75rem', letterSpacing: '1px' }}>
          Déploiement de votre flotte
        </h2>
        <p style={{ color: 'var(--nav-slate)', fontSize: '0.85rem', margin: '0 auto', maxWidth: '580px', lineHeight: 1.5 }}>
          {!isCurrentShipPlaced
            ? `Positionnez votre ${currentShip.name} (${currentShip.size} cases). Appuyez sur R pour pivoter.`
            : placedShips.length === SHIPS_CONFIG.length
              ? 'Tous les bâtiments sont en position. Cliquez sur un navire pour le déplacer ou verrouillez la flotte.'
              : 'Sélectionnez un autre bâtiment ci-dessous pour continuer le déploiement.'}
        </p>
      </div>

      {/* Fleet Overview Cards (Clickable to select / pick up) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        {SHIPS_CONFIG.map((ship, idx) => {
          const isPlaced = placedShips.some(p => p.id === ship.id);
          const isSelected = selectedShipId === ship.id;

          return (
            <button
              key={ship.id}
              type="button"
              onClick={() => pickupShip(ship.id)}
              className={`placement-ship-card ${isSelected ? 'active-selecting' : ''}`}
              style={{
                background: isSelected ? 'rgba(100, 255, 218, 0.18)' : 'rgba(10, 25, 47, 0.6)',
                border: `1px solid ${isSelected ? 'var(--nav-teal)' : isPlaced ? 'rgba(100, 255, 218, 0.4)' : 'var(--nav-lighter)'}`,
                padding: '0.6rem 0.5rem',
                borderRadius: '4px',
                textAlign: 'center',
                boxShadow: isSelected ? '0 0 12px rgba(100, 255, 218, 0.25)' : 'none',
                opacity: isPlaced && !isSelected ? 0.75 : 1
              }}
              title={`Touche ${idx + 1} • Cliquez pour sélectionner ou repositionner`}
            >
              <ShipIcon type={ship.icon} size={16} color={isSelected || isPlaced ? 'var(--nav-teal)' : 'var(--nav-slate)'} />
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isPlaced ? 'var(--nav-teal)' : 'var(--nav-text)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {isPlaced && <CheckIcon size={12} color="var(--nav-teal)" />}
                <span>{ship.name}</span>
              </div>
              <div className="mono" style={{ fontSize: '0.65rem', color: isSelected ? 'var(--nav-teal)' : 'var(--nav-slate)' }}>
                {ship.size} CASES {isSelected && !isPlaced ? '• EN MAIN' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tactical Naval Formations Quick Presets (Modulify & Game-UI inspiration) */}
      <div style={{
        marginBottom: '1.25rem',
        background: 'rgba(2, 12, 27, 0.65)',
        border: '1px solid var(--nav-lighter)',
        borderRadius: '4px',
        padding: '0.65rem 1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-teal)', letterSpacing: '1px' }}>
            DOCTRINES NAVALES & FORMATIONS PRÉCONFIGURÉES :
          </span>
          <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-gold)' }}>1-CLIC STRATÉGIQUE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
          {Object.entries(PRESET_FORMATIONS).map(([key, f]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyFormation(key)}
              className="btn btn-secondary mono"
              style={{
                padding: '0.45rem 0.6rem',
                fontSize: '0.72rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                alignItems: 'center'
              }}
              title="Déployer instantanément cette formation"
            >
              <strong style={{ color: 'var(--nav-text)' }}>{f.label}</strong>
              <span style={{ fontSize: '0.62rem', color: 'var(--nav-slate)' }}>{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Actions Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleRotate}
          title="Raccourci clavier: Touche R"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateIcon size={14} color="var(--nav-teal)" />
          <span>PIVOTER (R) : <strong style={{ color: 'var(--nav-teal)' }}>{orientation === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL'}</strong></span>
        </button>

        <button
          className="btn btn-primary"
          onClick={handleAutoDeploy}
          style={{ borderColor: 'var(--nav-gold)', color: 'var(--nav-gold)' }}
        >
          AUTO-DÉPLOIEMENT (A)
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleUndo}
          disabled={placedShips.length === 0}
          title="Raccourci clavier: Touche Z"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <UndoIcon size={14} color="currentColor" />
          <span>ANNULER (Z)</span>
        </button>

        <button
          className="btn btn-danger"
          onClick={handleReset}
          disabled={placedShips.length === 0}
        >
          RÉINITIALISER
        </button>
      </div>

      {/* Placement Grid with Interactive Hover Preview & Relocate Pickups */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Column Numbers - Mathematically aligned with cells */}
        <div
          className="radar-col-headers"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, var(--cell-size))',
            gap: '2px',
            paddingLeft: '41px', // 28px width + 4px margin + 1px border + 8px padding
            marginBottom: '4px'
          }}
        >
          {NUMBERS.map(num => (
            <div
              key={num}
              className="mono"
              style={{ width: 'var(--cell-size)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--nav-slate)' }}
            >
              {num}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {/* Row Letters - Mathematically aligned with cells */}
          <div
            className="radar-row-headers"
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(10, var(--cell-size))',
              gap: '2px',
              paddingTop: '9px', // 1px border + 8px padding
              marginRight: '4px',
              width: '28px'
            }}
          >
            {LETTERS.map(char => (
              <div
                key={char}
                className="mono"
                style={{ height: 'var(--cell-size)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', width: '28px', color: 'var(--nav-slate)' }}
              >
                {char}
              </div>
            ))}
          </div>

          <div
            className="radar-grid player-board"
            onMouseLeave={() => setHoverCoord(null)}
          >
            {grid.map((row, y) =>
              row.map((cell, x) => {
                const isOccupied = cell !== null;
                const isPreview = previewCells.some(c => c.x === x && c.y === y);

                let cellClass = 'radar-cell';
                if (isOccupied) cellClass += ' ship';
                if (isPreview) {
                  cellClass += placementValid ? ' preview-valid' : ' preview-invalid';
                }

                return (
                  <button
                    key={`${x}-${y}`}
                    className={cellClass}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => {
                      setHoverCoord({ x, y });
                      sound.playRadarBeep();
                    }}
                    aria-label={`Case ${LETTERS[y]}-${x + 1} ${isOccupied ? 'Navire présent (cliquer pour déplacer)' : ''}`}
                    title={isOccupied ? 'Cliquer pour déplacer ce bâtiment' : isPreview ? (placementValid ? 'Valider position' : 'Position invalide') : ''}
                    style={{
                      cursor: isOccupied ? 'grab' : (!isCurrentShipPlaced && placementValid ? 'pointer' : 'default')
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hotkey Shortcuts Strip (Emil Kowalski & Game-UI principles) */}
      <div className="hotkeys-telemetry mono">
        <span className="hotkey-item"><kbd>1-5</kbd> CHOISIR</span>
        <span className="hotkey-item"><kbd>R</kbd> PIVOTER</span>
        <span className="hotkey-item"><kbd>Z</kbd> ANNULER</span>
        <span className="hotkey-item"><kbd>A</kbd> AUTO</span>
        <span className="hotkey-item"><kbd>ENTRÉE</kbd> VERROUILLER</span>
      </div>

      {/* Confirmation CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={placedShips.length < SHIPS_CONFIG.length}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            boxShadow: placedShips.length === SHIPS_CONFIG.length ? '0 0 25px rgba(100, 255, 218, 0.4)' : 'none'
          }}
        >
          {placedShips.length === SHIPS_CONFIG.length ? 'VERROUILLER LA POSITION & ENTRER EN GUERRE' : `DISPOSER TOUS LES NAVIRES (${placedShips.length}/${SHIPS_CONFIG.length})`}
        </button>
      </div>
    </div>
  );
};

export default ShipPlacement;
