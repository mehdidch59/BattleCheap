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
    <div className="ship-placement">
      <h2 className="text-center mb-3">Placement des bateaux</h2>
      
      <div className="controls" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={rotateShip}
          disabled={currentShip >= SHIPS.length}
        >
          Rotation ({orientation === 'horizontal' ? 'horizontal' : 'vertical'})
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={resetPlacement}
        >
          Réinitialiser
        </button>
      </div>
      
      <div className="instructions" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        {currentShip < SHIPS.length ? (
          <p>Placez votre {SHIPS[currentShip].name} ({SHIPS[currentShip].size} cases)</p>
        ) : (
          <p>Tous les bateaux sont placés !</p>
        )}
      </div>
      
      <div className="grid-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div className="grid">
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell ${cell !== null ? 'ship' : ''}`}
                onClick={() => placeShip(x, y)}
                style={{
                  backgroundColor: cell !== null ? SHIPS[cell].color : undefined,
                  cursor: currentShip < SHIPS.length ? 'pointer' : 'default'
                }}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="ready-button" style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handleReady}
          disabled={placedShips.length < SHIPS.length}
        >
          Je suis prêt
        </button>
      </div>
    </div>
  );
};

export default ShipPlacement; 