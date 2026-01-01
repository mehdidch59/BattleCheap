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
    <div className="board-container" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 10px' }}>
        <h4 style={{
          color: isPlayerBoard ? 'var(--nav-teal)' : 'var(--nav-red)',
          margin: 0,
          borderBottom: `2px solid ${isPlayerBoard ? 'var(--nav-teal)' : 'var(--nav-red)'}`,
          paddingBottom: '2px'
        }}>
          {isPlayerBoard ? 'FLEET STATUS' : 'TARGET ACQUISITION'}
        </h4>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--nav-slate)' }}>
          {isPlayerBoard ? 'GRID: DEFENSIVE' : 'GRID: OFFENSIVE'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={isPlayerBoard ? "player-board" : "enemy-board"}>
        {/* Column Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 36px)', gap: '2px', paddingLeft: '30px', marginBottom: '5px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <div key={num} className="mono" style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--nav-slate)' }}>{num}</div>
          ))}
        </div>

        <div style={{ display: 'flex' }}>
          {/* Row Headers */}
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(10, 36px)', gap: '2px', width: '30px', marginRight: '5px' }}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(char => (
              <div key={char} className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--nav-slate)' }}>{char}</div>
            ))}
          </div>

          <div className="radar-grid" style={{
            borderColor: isPlayerBoard ? 'var(--nav-teal)' : 'var(--nav-red)',
          }}>
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`radar-cell ${cell
                      ? cell.hit
                        ? 'hit'
                        : cell.miss
                          ? 'miss'
                          : cell.isShip
                            ? 'ship'
                            : ''
                      : ''
                    }`}
                  onClick={() => handleClick(x, y)}
                  style={{
                    cursor: !isPlayerBoard && isGameStarted && isPlayerTurn ? 'crosshair' : 'default'
                  }}
                >
                  {/* Content handled by CSS ::before */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;