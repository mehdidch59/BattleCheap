import React, { useState } from 'react';
import { SHIPS_CONFIG, canPlaceShip, generateRandomFleet, GRID_SIZE } from '../utils/gameAI';
import { ShipIcon } from './ShipGraphic';
import { sound } from '../utils/audio';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ShipPlacement = ({ onReady }) => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal'); // 'horizontal' | 'vertical'
  const [placedShips, setPlacedShips] = useState([]);
  const [hoverCoord, setHoverCoord] = useState(null);

  const currentShip = currentShipIndex < SHIPS_CONFIG.length ? SHIPS_CONFIG[currentShipIndex] : null;

  // Toggle orientation
  const handleRotate = () => {
    sound.playBlip(720, 0.05);
    setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Keyboard shortcut listener for 'R' to rotate, 'Z' to undo, 'A' to auto-deploy, 'Enter' to lock in
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
    } else if (e.key === 'Enter') {
      if (placedShips.length === SHIPS_CONFIG.length) {
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
    setCurrentShipIndex(prev => prev - 1);
  };

  // Reset entire fleet
  const handleReset = () => {
    sound.playBlip(350, 0.1);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setCurrentShipIndex(0);
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
    setCurrentShipIndex(SHIPS_CONFIG.length);
  };

  // Check if current hover is a valid placement
  const isValidPlacement = (x, y) => {
    if (!currentShip) return false;
    return canPlaceShip(grid, x, y, currentShip.size, orientation === 'horizontal');
  };

  // Get coordinates covered by preview
  const getPreviewCells = () => {
    if (!hoverCoord || !currentShip) return [];
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

  // Place ship at coordinates
  const handlePlaceShip = (x, y) => {
    if (!currentShip) return;

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

    setGrid(newGrid);
    setPlacedShips(prev => [...prev, { ...currentShip, isHorizontal, positions }]);
    setCurrentShipIndex(prev => prev + 1);
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
        <div className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.85rem', letterSpacing: '3px' }}>
          STRATEGIC FLEET DISPOSITION
        </div>
        <h2 style={{ color: 'var(--nav-text)', margin: '0.2rem 0', fontSize: '2rem' }}>
          WARSHIP DEPLOYMENT
        </h2>
        <p className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.85rem', margin: 0 }}>
          {currentShip
            ? `Positionnez votre [${currentShip.name}] (${currentShip.size} cases). Appuyez sur R pour pivoter.`
            : 'Tous les bâtiments de combat sont opérationnels. Prêt pour l\'engagement.'}
        </p>
      </div>

      {/* Fleet Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        {SHIPS_CONFIG.map((ship, idx) => {
          const isPlaced = placedShips.some(p => p.id === ship.id);
          const isCurrent = currentShipIndex === idx;

          return (
            <div
              key={ship.id}
              style={{
                background: isCurrent ? 'rgba(100, 255, 218, 0.15)' : 'rgba(10, 25, 47, 0.6)',
                border: `1px solid ${isCurrent ? 'var(--nav-teal)' : isPlaced ? 'rgba(100, 255, 218, 0.4)' : 'var(--nav-lighter)'}`,
                padding: '0.5rem',
                borderRadius: '4px',
                textAlign: 'center',
                boxShadow: isCurrent ? '0 0 10px rgba(100, 255, 218, 0.2)' : 'none',
                opacity: isPlaced ? 0.65 : 1
              }}
            >
              <ShipIcon type={ship.icon} size={16} color={isCurrent || isPlaced ? 'var(--nav-teal)' : 'var(--nav-slate)'} />
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isPlaced ? 'var(--nav-teal)' : 'var(--nav-text)', marginTop: '4px' }}>
                {isPlaced ? `✓ ${ship.name}` : ship.name}
              </div>
              <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-slate)' }}>
                {ship.size} CASES
              </div>
            </div>
          );
        })}
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
          disabled={!currentShip}
          title="Raccourci clavier: Touche R"
        >
          PIVOTER (R): <span style={{ color: 'var(--nav-teal)', fontWeight: 'bold' }}>{orientation === 'horizontal' ? 'HORIZONTAL ➔' : 'VERTICAL ⬇'}</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={handleAutoDeploy}
          style={{ borderColor: 'var(--nav-gold)', color: 'var(--nav-gold)' }}
        >
          AUTO-DÉPLOIEMENT (RND)
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleUndo}
          disabled={placedShips.length === 0}
          title="Raccourci clavier: Touche Z"
        >
          ↺ ANNULER (Z)
        </button>

        <button
          className="btn btn-danger"
          onClick={handleReset}
          disabled={placedShips.length === 0}
        >
          RÉINITIALISER
        </button>
      </div>

      {/* Placement Grid with Interactive Hover Preview */}
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
                    onClick={() => handlePlaceShip(x, y)}
                    onMouseEnter={() => {
                      setHoverCoord({ x, y });
                      sound.playRadarBeep();
                    }}
                    aria-label={`Case ${LETTERS[y]}-${x + 1}`}
                    style={{
                      cursor: currentShip ? (placementValid ? 'pointer' : 'not-allowed') : 'default'
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
        <span className="hotkey-item"><kbd>R</kbd> PIVOTER</span>
        <span className="hotkey-item"><kbd>Z</kbd> ANNULER</span>
        <span className="hotkey-item"><kbd>A</kbd> AUTO-DÉPLOIEMENT</span>
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
