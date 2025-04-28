import React from 'react';

const Board = ({ board, ships, onCellClick, isPlayerBoard, isGameStarted, isPlayerTurn }) => {
  // Créer une grille vide 10x10
  const grid = Array(10).fill().map(() => Array(10).fill(null));
  
  // Placer les bateaux sur la grille du joueur
  if (isPlayerBoard && ships) {
    ships.forEach(ship => {
      ship.positions.forEach(pos => {
        if (pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10) {
          grid[pos.y][pos.x] = {
            isShip: true,
            hit: pos.hit
          };
        }
      });
    });
  }
  
  // Mettre à jour la grille avec les coups joués
  if (board) {
    board.forEach(shot => {
      if (shot.x >= 0 && shot.x < 10 && shot.y >= 0 && shot.y < 10) {
        if (!grid[shot.y][shot.x]) {
          grid[shot.y][shot.x] = { miss: true };
        } else {
          grid[shot.y][shot.x].hit = true;
        }
      }
    });
  }
  
  const handleClick = (x, y) => {
    // Si c'est la grille de l'adversaire et que le jeu a commencé et que c'est le tour du joueur
    if (!isPlayerBoard && isGameStarted && isPlayerTurn) {
      onCellClick(x, y);
    }
  };
  
  return (
    <div className="board-container" style={{ marginBottom: '2rem' }}>
      <h3 className="text-center mb-3">
        {isPlayerBoard ? 'Votre grille' : 'Grille adverse'}
      </h3>
      
      <div className="grid-container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="grid">
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell ${
                  cell
                    ? cell.hit
                      ? 'hit'
                      : cell.miss
                        ? 'miss'
                        : cell.isShip
                          ? 'ship'
                          : ''
                    : ''
                } ${!isPlayerBoard && isGameStarted && isPlayerTurn ? 'clickable' : ''}`}
                onClick={() => handleClick(x, y)}
                style={{
                  cursor: !isPlayerBoard && isGameStarted && isPlayerTurn ? 'pointer' : 'default'
                }}
              >
                {cell && cell.hit && '✓'}
                {cell && cell.miss && '✗'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Board; 