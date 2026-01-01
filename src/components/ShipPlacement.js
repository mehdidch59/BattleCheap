import React, { useState } from 'react';

const SHIPS = [
  { id: 0, name: 'Porte-avions', size: 5, color: '#6c757d' },
  { id: 1, name: 'Croiseur', size: 4, color: '#6c757d' },
  { id: 2, name: 'Contre-torpilleur', size: 3, color: '#6c757d' },
  { id: 3, name: 'Sous-marin', size: 3, color: '#6c757d' },
  { id: 4, name: 'Torpilleur', size: 2, color: '#6c757d' }
];

const ShipPlacement = ({ onReady }) => {
  const [grid, setGrid] = useState(Array(10).fill().map(() => Array(10).fill(null)));
  const [currentShip, setCurrentShip] = useState(0);
  const [orientation, setOrientation] = useState('horizontal');
  const [placedShips, setPlacedShips] = useState([]);

  const resetPlacement = () => {
    setGrid(Array(10).fill().map(() => Array(10).fill(null)));
    setCurrentShip(0);
    setPlacedShips([]);
  };

  const rotateShip = () => {
    setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const canPlaceShip = (x, y, size, isHorizontal) => {
    if (isHorizontal) {
      if (x + size > 10) return false;

      for (let i = 0; i < size; i++) {
        if (grid[y][x + i] !== null) return false;
      }
    } else {
      if (y + size > 10) return false;

      for (let i = 0; i < size; i++) {
        if (grid[y + i][x] !== null) return false;
      }
    }

    return true;
  };

  const placeShip = (x, y) => {
    if (currentShip >= SHIPS.length) return;

    const ship = SHIPS[currentShip];
    const isHorizontal = orientation === 'horizontal';

    if (!canPlaceShip(x, y, ship.size, isHorizontal)) return;

    const newGrid = [...grid.map(row => [...row])];
    const positions = [];

    if (isHorizontal) {
      for (let i = 0; i < ship.size; i++) {
        newGrid[y][x + i] = ship.id;
        positions.push({ x: x + i, y, hit: false });
      }
    } else {
      for (let i = 0; i < ship.size; i++) {
        newGrid[y + i][x] = ship.id;
        positions.push({ x, y: y + i, hit: false });
      }
    }

    setGrid(newGrid);
    setPlacedShips([...placedShips, { ...ship, positions }]);
    setCurrentShip(currentShip + 1);
  };

  const handleReady = () => {
    if (placedShips.length === SHIPS.length) {
      onReady(placedShips);
    }
  };

  return (
    <div className="ship-placement tactical-panel player-board">
      <h2 className="text-center mb-3" style={{ color: 'var(--nav-teal)' }}>FLEET DEPLOYMENT</h2>

      <div className="controls" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          className="btn btn-secondary"
          onClick={rotateShip}
          disabled={currentShip >= SHIPS.length}
          style={{ width: 'auto' }}
        >
          ROTATE: {orientation === 'horizontal' ? 'X' : 'Y'}
        </button>

        <button
          className="btn btn-danger"
          onClick={resetPlacement}
          style={{ width: 'auto' }}
        >
          RESET GRID
        </button>
      </div>

      <div className="instructions" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {currentShip < SHIPS.length ? (
          <div style={{ display: 'inline-block', border: '1px dashed var(--nav-teal)', padding: '10px 20px', background: 'rgba(100, 255, 218, 0.05)' }}>
            <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.8rem' }}>CURRENT ASSET</div>
            <div style={{ color: 'var(--nav-teal)', fontSize: '1.2rem', fontWeight: 'bold' }}>{SHIPS[currentShip].name.toUpperCase()}</div>
            <div className="mono" style={{ color: 'var(--nav-text)' }}>[SIZE: {SHIPS[currentShip].size}]</div>
          </div>
        ) : (
          <div style={{ color: 'var(--nav-teal)', fontSize: '1.2rem', fontWeight: 'bold' }}>✔ FLEET READY FOR COMBAT</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex' }}>
          {/* Row Headers */}
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(10, 36px)', gap: '2px', width: '30px', marginRight: '5px' }}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(char => (
              <div key={char} className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--nav-slate)' }}>{char}</div>
            ))}
          </div>

          <div className="radar-grid">
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`radar-cell ${cell !== null ? 'ship' : ''}`}
                  onClick={() => placeShip(x, y)}
                  style={{
                    cursor: currentShip < SHIPS.length ? 'copy' : 'default',
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="ready-button" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleReady}
          disabled={placedShips.length < SHIPS.length}
        >
          CONFIRM DEPLOYMENT
        </button>
      </div>
    </div>
  );
};

export default ShipPlacement;