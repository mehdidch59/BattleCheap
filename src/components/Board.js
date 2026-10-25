import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { getActiveCamouflage } from '../utils/camouflages';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Board = ({
  board,
  ships,
  onCellClick,
  isPlayerBoard,
  isGameStarted,
  isPlayerTurn,
  sunkShips = []
}) => {
  const [hoverCoord, setHoverCoord] = useState(null);
  const camo = getActiveCamouflage();

  // Initialize 10x10 matrix
  const grid = Array(10).fill(null).map(() => Array(10).fill(null));

  // If this is player board, show player ships
  if (isPlayerBoard && ships) {
    ships.forEach(ship => {
      ship.positions.forEach(pos => {
        if (pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10) {
          grid[pos.y][pos.x] = {
            isShip: true,
            shipId: ship.id,
            shipName: ship.name,
            hit: pos.hit || false
          };
        }
      });
    });
  }

  // Populate shots on the grid
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

  // Check if a cell belongs to a known sunk ship
  const isCellSunk = (x, y) => {
    return sunkShips.some(s => s.positions.some(p => p.x === x && p.y === y));
  };

  const handleMouseEnter = (x, y) => {
    setHoverCoord({ x, y });
    if (!isPlayerBoard && isGameStarted && isPlayerTurn) {
      sound.playTacticalLock();
    }
  };

  const handleClick = (x, y) => {
    if (!isPlayerBoard && isGameStarted && isPlayerTurn) {
      // Don't fire on already shot cells
      const cell = grid[y][x];
      if (cell && (cell.hit || cell.miss)) return;
      onCellClick(x, y);
    }
  };

  const handleKeyDown = (e, x, y) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(x, y);
    }
  };

  const borderColor = isPlayerBoard ? 'var(--nav-teal)' : 'var(--nav-red)';

  return (
    <div className={`board-module tactical-panel ${isPlayerBoard ? 'friendly-sector' : 'hostile-sector'}`} style={{
      padding: '1.25rem',
      position: 'relative',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Sector Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        borderBottom: `2px solid ${borderColor}`,
        paddingBottom: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className={`status-indicator ${isPlayerBoard ? 'online' : (isPlayerTurn && isGameStarted ? 'online blink-slow' : 'offline')}`}
            style={{ background: isPlayerBoard ? 'var(--nav-teal)' : 'var(--nav-red)' }}
          />
          <h4 style={{ color: borderColor, margin: 0, fontSize: '0.95rem', letterSpacing: '2px' }}>
            {isPlayerBoard ? 'SECTEUR DÉFENSIF (FLOTTE)' : 'ACQUISITION DE CIBLE (OFFENSIF)'}
          </h4>
        </div>

        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>
          {hoverCoord ? (
            <span style={{ color: borderColor, fontWeight: 'bold' }}>
              SECTEUR {LETTERS[hoverCoord.y]}-{hoverCoord.x + 1 < 10 ? `0${hoverCoord.x + 1}` : hoverCoord.x + 1}
            </span>
          ) : (
            <span>{isPlayerBoard ? 'RADAR ALLIÉ' : (isPlayerTurn ? 'PRÊT AU TIR' : 'EN ATTENTE')}</span>
          )}
        </div>
      </div>

      {/* Dynamic Initiative & Tactical Beam */}
      {!isPlayerBoard && isGameStarted && (
        <div className={`radar-initiative-beam mono ${isPlayerTurn ? 'your-turn' : 'enemy-turn'}`}>
          <span className="initiative-dot" />
          <span>{isPlayerTurn ? 'ORDRE DE FEU ACCORDÉ • VERROUILLAGE SATELLITE ACTIF' : 'DÉTECTION DE FRACTION ENNEMIE • ATTENTE D\'IMPACT'}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Column Numbers 1-10 - Mathematically aligned with cells */}
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
          {NUMBERS.map((num, i) => {
            const isColHover = hoverCoord && hoverCoord.x === i;
            return (
              <div
                key={num}
                className="mono radar-header-label"
                style={{
                  width: 'var(--cell-size)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: isColHover ? 'bold' : 'normal',
                  color: isColHover ? borderColor : 'var(--nav-slate)',
                  textShadow: isColHover ? `0 0 8px ${borderColor}` : 'none',
                  transition: 'color 0.15s ease'
                }}
              >
                {num}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {/* Row Letters A-J - Mathematically aligned with cells */}
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
            {LETTERS.map((char, j) => {
              const isRowHover = hoverCoord && hoverCoord.y === j;
              return (
                <div
                  key={char}
                  className="mono radar-header-label"
                  style={{
                    height: 'var(--cell-size)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: isRowHover ? 'bold' : 'normal',
                    color: isRowHover ? borderColor : 'var(--nav-slate)',
                    textShadow: isRowHover ? `0 0 8px ${borderColor}` : 'none',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {char}
                </div>
              );
            })}
          </div>

          {/* 10x10 Radar Matrix */}
          <div
            className={`radar-grid ${isPlayerBoard ? 'player-board' : 'enemy-board'} ${!isPlayerBoard && isPlayerTurn && isGameStarted ? 'active-turn' : ''}`}
            style={{
              borderColor,
              boxShadow: `0 0 25px ${isPlayerBoard ? 'rgba(100, 255, 218, 0.15)' : 'rgba(255, 71, 87, 0.15)'}`
            }}
            onMouseLeave={() => setHoverCoord(null)}
          >
            {grid.map((row, y) =>
              row.map((cell, x) => {
                const sunk = isCellSunk(x, y);
                const isTargetable = !isPlayerBoard && isGameStarted && isPlayerTurn && (!cell || (!cell.hit && !cell.miss));

                let cellClass = 'radar-cell';
                if (cell) {
                  if (cell.hit) cellClass += ' hit';
                  if (cell.miss) cellClass += ' miss';
                  if (cell.isShip) cellClass += ' ship';
                }
                if (sunk) cellClass += ' sunk-cell';
                if (isTargetable) cellClass += ' targetable';

                const shipCamoStyle = (isPlayerBoard && cell?.isShip && !cell?.hit) ? {
                  background: camo.shipFill,
                  borderColor: camo.shipBorder,
                  boxShadow: `inset 0 0 8px ${camo.color}55`
                } : {};

                return (
                  <button
                    key={`${x}-${y}`}
                    className={cellClass}
                    style={shipCamoStyle}
                    onClick={() => handleClick(x, y)}
                    onMouseEnter={() => handleMouseEnter(x, y)}
                    onKeyDown={(e) => handleKeyDown(e, x, y)}
                    aria-label={`Secteur ${LETTERS[y]}-${x + 1} ${cell?.hit ? 'Touché' : cell?.miss ? 'Manqué' : ''}`}
                    disabled={!isTargetable && !isPlayerBoard}
                    tabIndex={isTargetable ? 0 : -1}
                  >
                    {isTargetable && hoverCoord?.x === x && hoverCoord?.y === y && (
                      <div className="targeting-reticle" aria-hidden="true">
                        <span className="reticle-corner tl" />
                        <span className="reticle-corner tr" />
                        <span className="reticle-corner bl" />
                        <span className="reticle-corner br" />
                        <span className="reticle-center-pip" />
                      </div>
                    )}
                    {cell?.hit && (
                      <div className="hit-marker" title="Cible touchée" aria-label="Touché">
                        <span className="explosion-glow" />
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--nav-red)" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                          <circle cx="12" cy="12" r="2" fill="var(--nav-red)" />
                        </svg>
                      </div>
                    )}
                    {cell?.miss && (
                      <div className="miss-marker" title="Tir dans l'eau" aria-label="Manqué">
                        <span className="splash-ripple" />
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                          <circle cx="12" cy="12" r="3.5" fill="var(--nav-slate)" opacity="0.85" />
                          <circle cx="12" cy="12" r="6" stroke="var(--nav-slate)" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
