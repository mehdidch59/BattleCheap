import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import ShipPlacement from '../components/ShipPlacement';
import Chat from '../components/Chat';
import FleetStatusHUD from '../components/FleetStatusHUD';
import CombatLog from '../components/CombatLog';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { sound } from '../utils/audio';
import { SHIPS_CONFIG, TacticalAI, generateRandomFleet, findJustSunkShip } from '../utils/gameAI';
import { MedalIcon, SkullIcon, CrosshairIcon, ShieldIcon, ClipboardIcon, LinkIcon, FlagIcon, SoundWaveIcon } from '../components/TacticalIcons';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isConnected, emit, on } = useSocket();
  const { currentUser } = useAuth();

  const isSolo = roomId.startsWith('solo');
  const soloDifficulty = isSolo ? (roomId.split('-')[1] || 'veteran') : 'veteran';

  const [gameStarted, setGameStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [ships, setShips] = useState([]);
  const [enemyShips, setEnemyShips] = useState(SHIPS_CONFIG);
  const [myShots, setMyShots] = useState([]);
  const [opponentShots, setOpponentShots] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [message, setMessage] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [opponentName, setOpponentName] = useState(isSolo ? `I.A. TACTIQUE (${soloDifficulty.toUpperCase()})` : '');
  const [copiedText, setCopiedText] = useState('');
  const [ambienceActive, setAmbienceActive] = useState(sound.ambiencePlaying);
  
  // Mobile active tab: 'offensive' | 'defensive'
  const [activeTab, setActiveTab] = useState('offensive');

  // Sunk ships tracking
  const [sunkEnemyShips, setSunkEnemyShips] = useState([]);
  const [sunkAlliedShips, setSunkAlliedShips] = useState([]);
  const [bannerAlert, setBannerAlert] = useState(null);

  // Combat Log telemetries
  const [combatLogs, setCombatLogs] = useState([]);
  const [turnCount, setTurnCount] = useState(1);

  // Game-feel screen shake trauma decay model
  const [trauma, setTrauma] = useState(0);

  // Solo AI instance
  const aiRef = useRef(null);

  const addTrauma = useCallback((amount) => {
    // Check if user disabled screen shake in settings
    const shakeDisabled = localStorage.getItem('bc_disable_shake') === 'true';
    if (shakeDisabled) return;
    setTrauma(prev => Math.min(1, prev + amount));
  }, []);

  // Trauma decay loop (Game Feel)
  useEffect(() => {
    if (trauma <= 0) return;
    const interval = setInterval(() => {
      setTrauma(prev => Math.max(0, prev - 0.06));
    }, 30);
    return () => clearInterval(interval);
  }, [trauma]);

  const addCombatLog = useCallback((text, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCombatLogs(prev => [...prev, { time, text, type }]);
  }, []);

  // Show tactical banner alert
  const triggerBanner = (text, type = 'danger') => {
    setBannerAlert({ text, type });
    setTimeout(() => {
      setBannerAlert(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      sound.stopAmbience();
    };
  }, []);

  // Solo AI Initialization
  useEffect(() => {
    if (isSolo) {
      aiRef.current = new TacticalAI(soloDifficulty);
      setOpponentName(`TACTICAL AI [${soloDifficulty.toUpperCase()}]`);
      addCombatLog(`Simulation engagée contre l'IA (${soloDifficulty.toUpperCase()})`, 'info');
    }
  }, [isSolo, soloDifficulty, addCombatLog]);

  // Handle ship placement ready
  const handleReady = (placedShips) => {
    setShips(placedShips);
    setIsReady(true);
    sound.playSonarPing();

    if (isSolo) {
      // Setup AI Fleet
      const aiFleet = generateRandomFleet(SHIPS_CONFIG);
      setEnemyShips(aiFleet);
      setGameStarted(true);
      setIsPlayerTurn(true);
      setMessage('Flottes déployées ! C\'est votre tour de tir.');
      addCombatLog('Toutes les unités sont prêtes. Feu à volonté !', 'info');
    } else {
      emit('playerReady', placedShips);
      setMessage('Flotte déployée. En attente de l\'adversaire...');
    }
  };

  // Player firing on enemy grid
  const handleCellClick = (x, y) => {
    if (!gameStarted || !isPlayerTurn || gameOver) return;
    if (myShots.some(s => s.x === x && s.y === y)) return;

    sound.playLaunch();
    const coordStr = `${LETTERS[y]}-${x + 1 < 10 ? `0${x + 1}` : x + 1}`;

    if (isSolo) {
      // Solo AI Execution
      handleSoloPlayerShot(x, y, coordStr);
    } else {
      // Multiplayer Socket Emission
      emit('fireShot', { x, y });
    }
  };

  // Solo Player Shot Logic
  const handleSoloPlayerShot = (x, y, coordStr) => {
    const targetBoard = enemyShips;
    const hitShip = targetBoard.find(ship =>
      ship.positions.some(pos => pos.x === x && pos.y === y)
    );

    const hit = !!hitShip;
    const newShots = [...myShots, { x, y, hit }];
    setMyShots(newShots);

    if (hit) {
      sound.playExplosion();
      addTrauma(0.5);

      // Check if ship is sunk
      const justSunk = findJustSunkShip(targetBoard, newShots, { x, y, hit: true });

      if (justSunk) {
        sound.playShipSunk();
        addTrauma(0.9);
        setSunkEnemyShips(prev => [...prev, justSunk]);
        triggerBanner(`NAVsoundIRE ENNEMI COULÉ : ${justSunk.name.toUpperCase()} !`, 'danger');
        addCombatLog(`[${coordStr}] DIRECT DANS LE MILLE ! ${justSunk.name} ennemi COULÉ !`, 'sink');
      } else {
        addCombatLog(`[${coordStr}] IMPACT CONFIRMÉ ! Bâtiment ennemi touché.`, 'hit');
        setMessage('Touché ! Vous conservez l\'initiative de tir.');
      }

      // Check for victory
      const allSunk = targetBoard.every(ship =>
        ship.positions.every(p => newShots.some(s => s.x === p.x && s.y === p.y && s.hit))
      );

      if (allSunk) {
        handleGameOver(true);
      }
      // Hit keeps player's turn in Battleship!
    } else {
      sound.playSplash();
      addCombatLog(`[${coordStr}] PLOUF ! Tir dans l'eau.`, 'info');
      setMessage('Manqué... Riposte ennemie imminente.');
      setIsPlayerTurn(false);

      // AI Counter-attack after realistic delay
      setTimeout(() => {
        executeAiTurn();
      }, 900);
    }
  };

  // Solo AI Turn Execution
  const executeAiTurn = () => {
    if (gameOver) return;

    const shot = aiRef.current.getNextShot(ships);
    const coordStr = `${LETTERS[shot.y]}-${shot.x + 1 < 10 ? `0${shot.x + 1}` : shot.x + 1}`;

    const hitShip = ships.find(ship =>
      ship.positions.some(p => p.x === shot.x && p.y === shot.y)
    );
    const hit = !!hitShip;

    setOpponentShots(prev => {
      const updated = [...prev, { x: shot.x, y: shot.y, hit }];
      
      if (hit) {
        sound.playExplosion();
        addTrauma(0.6);

        // Check if allied ship is sunk
        const justSunk = findJustSunkShip(ships, updated, { x: shot.x, y: shot.y, hit: true });
        aiRef.current.recordShotResult(shot.x, shot.y, true, justSunk);

        if (justSunk) {
          sound.playShipSunk();
          addTrauma(1.0);
          setSunkAlliedShips(prevSunk => [...prevSunk, justSunk]);
          triggerBanner(`ALERTE CRITIQUE : NOTRE ${justSunk.name.toUpperCase()} A ÉTÉ COULÉ !`, 'danger');
          addCombatLog(`L'adversaire a fait feu en [${coordStr}] : NOTRE ${justSunk.name} A ÉTÉ COULÉ !`, 'sink');
        } else {
          addCombatLog(`L'adversaire a fait feu en [${coordStr}] : IMPACT sur notre flotte !`, 'hit');
          setMessage('ALERTE ! Un de nos navires a été touché !');
        }

        // Check if player lost
        const allPlayerSunk = ships.every(ship =>
          ship.positions.every(p => updated.some(s => s.x === p.x && s.y === p.y && s.hit))
        );

        if (allPlayerSunk) {
          handleGameOver(false);
          return updated;
        }

        // AI hits again if successful
        setTimeout(() => {
          executeAiTurn();
        }, 900);
      } else {
        sound.playSplash();
        aiRef.current.recordShotResult(shot.x, shot.y, false);
        addCombatLog(`L'adversaire a tiré en [${coordStr}] : Tir manqué dans l'eau.`, 'info');
        setMessage('Tir ennemi manqué ! C\'est à vous d\'ordonner la riposte.');
        setIsPlayerTurn(true);
        setTurnCount(t => t + 1);
      }

      return updated;
    });
  };

  // Game Over Handler
  const handleGameOver = useCallback(async (isWin) => {
    setGameOver(true);
    setWinner(isWin);
    setMessage(isWin ? 'VICTOIRE ÉCLATANTE ! Flotte ennemie anéantie.' : 'DÉFAITE TACTIQUE. Notre flotte a été détruite.');

    if (isWin) {
      sound.playVictory();
      addCombatLog('VICTOIRE CONFIRMÉE ! Toutes les cibles hostiles sont détruites.', 'win');
    } else {
      sound.playDefeat();
      addCombatLog('DÉFAITE. Tous nos bâtiments sont hors de combat.', 'loss');
    }

    if (currentUser) {
      try {
        const gameResult = {
          date: new Date().toISOString(),
          opponent: opponentName || (isSolo ? 'IA TACTIQUE' : 'Unknown Hostile'),
          result: isWin ? 'WIN' : 'LOSS',
          roomId: roomId
        };

        await updateDoc(doc(db, 'users', currentUser.uid), {
          history: arrayUnion(gameResult)
        });
      } catch (err) {
        console.error('Error saving game history:', err);
      }
    }
  }, [addCombatLog, currentUser, isSolo, opponentName, roomId]);

  // Multiplayer Socket.io Event Listeners
  useEffect(() => {
    if (isSolo || !isConnected) return;

    const unsubscribePlayerJoined = on('playerJoined', ({ username }) => {
      setOpponentName(username);
      setMessage(`${username} a rejoint le front.`);
      addCombatLog(`Connexion établie avec l'officier hostile : ${username}`, 'info');
    });

    const unsubscribePlayerIsReady = on('playerIsReady', () => {
      if (isReady) {
        setMessage('L\'adversaire est prêt au combat !');
      } else {
        setMessage('L\'adversaire est prêt. Déployez votre flotte !');
      }
      sound.playSonarPing();
    });

    const unsubscribeGameStart = on('gameStart', ({ turn }) => {
      setGameStarted(true);
      const myTurn = turn === playerId;
      setIsPlayerTurn(myTurn);
      setMessage(myTurn ? 'ORDRE DE COMBAT : C\'est votre tour de tir !' : 'ATTENTE : Tour de l\'adversaire');
      sound.playSonarPing();
      addCombatLog('Engagement validé par le QG. Opérations navales déclenchées.', 'info');
    });

    const unsubscribeShotResult = on('shotResult', ({ playerId: shooterId, x, y, hit, nextTurn, sunkShip }) => {
      const coordStr = `${LETTERS[y]}-${x + 1 < 10 ? `0${x + 1}` : x + 1}`;

      if (shooterId === playerId) {
        // Player shot
        setMyShots(prev => [...prev, { x, y, hit }]);
        if (hit) {
          sound.playExplosion();
          addTrauma(0.5);
          if (sunkShip) {
            sound.playShipSunk();
            addTrauma(0.9);
            setSunkEnemyShips(prev => [...prev, sunkShip]);
            triggerBanner(`BÂTIMENT ENNEMI COULÉ : ${sunkShip.name.toUpperCase()} !`, 'danger');
            addCombatLog(`[${coordStr}] DIRECT DANS LE MILLE ! ${sunkShip.name} adverse COULÉ !`, 'sink');
          } else {
            addCombatLog(`[${coordStr}] IMPACT CONFIRMÉ sur navire hostile.`, 'hit');
            setMessage('Touché ! Salvo réussi.');
          }
        } else {
          sound.playSplash();
          addCombatLog(`[${coordStr}] Tir manqué dans l'eau.`, 'info');
          setMessage('Manqué... En attente de la riposte ennemie.');
        }
      } else {
        // Opponent shot
        setOpponentShots(prev => [...prev, { x, y, hit }]);
        if (hit) {
          sound.playExplosion();
          addTrauma(0.6);
          if (sunkShip) {
            sound.playShipSunk();
            addTrauma(1.0);
            setSunkAlliedShips(prev => [...prev, sunkShip]);
            triggerBanner(`ALERTE CRITIQUE : NOTRE ${sunkShip.name.toUpperCase()} A ÉTÉ DÉTRUIT !`, 'danger');
            addCombatLog(`L'adversaire a tiré en [${coordStr}] : NOTRE ${sunkShip.name} A ÉTÉ COULÉ !`, 'sink');
          } else {
            addCombatLog(`Tir hostile en [${coordStr}] : IMPACT sur notre formation !`, 'hit');
            setMessage('Alerte ! Bâtiment allié endommagé !');
          }
        } else {
          sound.playSplash();
          addCombatLog(`Tir hostile en [${coordStr}] : Manqué. Aucun dégât.`, 'info');
          setMessage('L\'adversaire a manqué ! À vous d\'ordonner le tir.');
        }
      }

      if (nextTurn !== undefined) {
        setIsPlayerTurn(nextTurn === playerId);
        setTurnCount(t => t + 1);
      }
    });

    const unsubscribeGameOver = on('gameOver', ({ winner: winnerId }) => {
      const isWin = winnerId === playerId;
      handleGameOver(isWin);
    });

    const unsubscribeOpponentLeft = () => {
      setMessage('L\'adversaire a déserté le secteur maritime.');
      triggerBanner('L\'ADVERSAIRE A FUI LE CHAMP DE BATAILLE', 'info');
      setGameOver(true);
      setWinner(true);
      sound.playVictory();
      addCombatLog('L\'adversaire a rompu la communication. Victoire par forfait.', 'win');
    };

    const unsubscribeRoomNotFound = () => {
      alert('Secteur introuvable. Redirection vers le quartier général.');
      navigate('/');
    };

    // Join room
    emit('joinRoom', { roomId, username: currentUser?.displayName || currentUser?.email || 'Capitaine' });

    const handleRoomCreated = ({ playerId: assignedPlayerId }) => {
      setPlayerId(assignedPlayerId);
    };

    const handleRoomJoined = ({ playerId: assignedPlayerId }) => {
      setPlayerId(assignedPlayerId);
    };

    on('roomCreated', handleRoomCreated);
    on('roomJoined', handleRoomJoined);
    on('opponentLeft', unsubscribeOpponentLeft);
    on('roomNotFound', unsubscribeRoomNotFound);

    return () => {
      unsubscribePlayerJoined();
      unsubscribePlayerIsReady();
      unsubscribeGameStart();
      unsubscribeShotResult();
      unsubscribeGameOver();
    };
  }, [roomId, isSolo, isConnected, emit, on, playerId, isReady, currentUser, navigate, addCombatLog, addTrauma, handleGameOver]);

  const shakeStyle = trauma > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * trauma * 14}px, ${(Math.random() - 0.5) * trauma * 14}px) rotate(${(Math.random() - 0.5) * trauma * 1.5}deg)`
  } : {};

  return (
    <div style={shakeStyle} className="game-screen-wrapper">
      <Header />

      {/* Sunk Ship Toast Banner */}
      {bannerAlert && (
        <div className="sunk-banner-toast">
          <div className="sunk-banner-content">
            <span className="banner-klaxon"><SkullIcon size={22} color="#fff" /></span>
            <span className="banner-text">{bannerAlert.text}</span>
            <span className="banner-klaxon"><SkullIcon size={22} color="#fff" /></span>
          </div>
        </div>
      )}

      <main className="container" style={{ marginTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Tactical Header Command Panel */}
        <div className="tactical-panel" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--nav-lighter)',
            paddingBottom: '0.75rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.85rem' }}>
                SECTEUR : <span style={{ color: 'var(--nav-teal)', fontWeight: 'bold' }}>{roomId.toUpperCase()}</span>
              </span>
              <span className="mono" style={{
                background: isSolo ? 'rgba(255, 204, 0, 0.15)' : 'rgba(100, 255, 218, 0.15)',
                color: isSolo ? 'var(--nav-gold)' : 'var(--nav-teal)',
                border: `1px solid ${isSolo ? 'var(--nav-gold)' : 'var(--nav-teal)'}`,
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {isSolo ? 'SIMULATION GUERRIÈRE (SOLO)' : 'OPÉRATION RÉSEAU MULTIJOUEUR'}
              </span>
            </div>

            <div className="mono" style={{ color: 'var(--nav-red)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              DEFCON 1 • CONDITION COMBAT
            </div>
          </div>

          <h2 style={{ fontSize: '1.6rem', letterSpacing: '4px', margin: '0.2rem 0' }}>
            BATAILLE NAVALE TACTIQUE
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <span className={`status-indicator ${opponentName ? 'online' : 'blink-slow'}`} style={{ background: opponentName ? 'var(--nav-teal)' : 'var(--nav-gold)' }} />
            <span className="mono" style={{ fontSize: '0.9rem' }}>
              {opponentName ? `CIBLE ENGAGÉE : ${opponentName}` : 'RECHERCHE D\'UN ÉCHO RADAR HOSTILE...'}
            </span>
          </div>

          {!opponentName && !isSolo && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  sound.playBlip();
                  setCopiedText('code');
                  setTimeout(() => setCopiedText(''), 2500);
                }}
              >
                <ClipboardIcon size={15} />
                <span>{copiedText === 'code' ? 'CODE COPIÉ DANS LE PRESSE-PAPIER !' : `COPIER LE CODE (${roomId})`}</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  sound.playBlip();
                  setCopiedText('link');
                  setTimeout(() => setCopiedText(''), 2500);
                }}
              >
                <LinkIcon size={15} />
                <span>{copiedText === 'link' ? 'LIEN DIRECT COPIÉ !' : 'COPIER LE LIEN D\'INVITATION'}</span>
              </button>
            </div>
          )}

          {message && (
            <div
              className={`alert ${gameOver ? (winner ? 'alert-success' : 'alert-danger') : (isPlayerTurn ? 'alert-info' : '')}`}
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                letterSpacing: '1px',
                background: gameOver ? (winner ? 'rgba(100, 255, 218, 0.15)' : 'rgba(255, 71, 87, 0.15)') : 'rgba(17, 34, 64, 0.8)',
                borderLeft: `4px solid ${gameOver ? (winner ? 'var(--nav-teal)' : 'var(--nav-red)') : (isPlayerTurn ? 'var(--nav-teal)' : 'var(--nav-slate)')}`
              }}
            >
              {message.toUpperCase()}
            </div>
          )}
        </div>

        {/* Game Area */}
        <div className="game-container">
          {!isReady ? (
            <ShipPlacement onReady={handleReady} />
          ) : (
            <div>
              {/* Telemetry HUD */}
              <FleetStatusHUD
                playerShips={ships}
                enemyShips={enemyShips}
                myShots={myShots}
                opponentShots={opponentShots}
                turnCount={turnCount}
              />

              {/* Mobile Tab Switcher */}
              <div className="mobile-radar-tabs" style={{ marginBottom: '1rem' }}>
                <button
                  className={`btn ${activeTab === 'offensive' ? 'btn-primary active' : 'btn-secondary'}`}
                  onClick={() => { setActiveTab('offensive'); sound.playBlip(); }}
                  style={{ flex: 1, padding: '0.75rem', gap: '8px' }}
                >
                  <CrosshairIcon size={16} color="currentColor" />
                  <span>CIBLAGE OFFENSIF {isPlayerTurn ? '●' : ''}</span>
                </button>
                <button
                  className={`btn ${activeTab === 'defensive' ? 'btn-primary active' : 'btn-secondary'}`}
                  onClick={() => { setActiveTab('defensive'); sound.playBlip(); }}
                  style={{ flex: 1, padding: '0.75rem', gap: '8px' }}
                >
                  <ShieldIcon size={16} color="currentColor" />
                  <span>FLOTTE ALLIÉE</span>
                </button>
              </div>

              {/* Dual Radar Layout: Side-by-Side on Desktop */}
              <div className="dual-radar-bridge">
                {/* Offensive Target Grid */}
                <div className={`radar-bridge-column offensive-col ${activeTab === 'offensive' ? 'active-mobile-view' : 'hidden-mobile-view'}`}>
                  <Board
                    board={myShots}
                    ships={[]}
                    onCellClick={handleCellClick}
                    isPlayerBoard={false}
                    isGameStarted={gameStarted}
                    isPlayerTurn={isPlayerTurn}
                    sunkShips={sunkEnemyShips}
                  />
                </div>

                {/* Defensive Allied Fleet Grid */}
                <div className={`radar-bridge-column defensive-col ${activeTab === 'defensive' ? 'active-mobile-view' : 'hidden-mobile-view'}`}>
                  <Board
                    board={opponentShots}
                    ships={ships}
                    onCellClick={() => { }}
                    isPlayerBoard={true}
                    isGameStarted={gameStarted}
                    isPlayerTurn={isPlayerTurn}
                    sunkShips={sunkAlliedShips}
                  />
                </div>
              </div>

              {/* Status Bar */}
              <div className="tactical-panel" style={{
                marginTop: '1.5rem',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div className="mono" style={{ color: isPlayerTurn ? 'var(--nav-teal)' : 'var(--nav-gold)', fontWeight: 'bold' }}>
                  {isPlayerTurn ? '⚡ STATUT : PRÊT AU TIR - SÉLECTIONNEZ UNE COORDONNÉE' : '⏳ STATUT : EN ATTENTE DU TIR HOSTILE...'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.85rem' }}>
                    SALVOS : <span style={{ color: 'var(--nav-text)' }}>{myShots.length}</span>
                  </div>

                  <button
                    className={`btn ${ambienceActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      const active = sound.toggleAmbience();
                      setAmbienceActive(active);
                    }}
                    title="Activer/Désactiver le drone acoustique sous-marin"
                  >
                    <SoundWaveIcon size={15} color="currentColor" />
                    <span>{ambienceActive ? 'AMBIANCE : ON' : 'AMBIANCE : OFF'}</span>
                  </button>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      sound.playBlip();
                      if (window.confirm('Confirmer le repli stratégique ? Votre flotte quittera le secteur.')) {
                        sound.stopAmbience();
                        navigate('/');
                      }
                    }}
                    title="Abandonner et retourner à la base"
                  >
                    <FlagIcon size={14} color="currentColor" />
                    <span>REPLI</span>
                  </button>
                </div>
              </div>

              {/* Tactical Comms & Combat Telemetry Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem'
              }}>
                <CombatLog logs={combatLogs} />
                {!isSolo && isConnected ? (
                  <Chat />
                ) : (
                  <div className="tactical-panel" style={{ padding: '1rem', height: '180px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ borderBottom: '1px solid var(--nav-teal)', paddingBottom: '0.4rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span className="mono" style={{ color: 'var(--nav-teal)', fontWeight: 'bold', fontSize: '0.75rem' }}>COMMUNICATIONS TACTIQUES</span>
                      <span className="status-indicator online" style={{ width: '6px', height: '6px' }} />
                    </div>
                    <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--nav-slate)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      Canal d'exercice crypté. I.A. tactique autonome active.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game Over Debriefing Modal */}
        {gameOver && (
          <div className="modal-backdrop">
            <div className="tactical-panel debrief-modal" style={{ maxWidth: '520px', width: '90%', textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {winner ? (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(100, 255, 218, 0.15)',
                    border: '2px solid var(--nav-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(100, 255, 218, 0.3)'
                  }}>
                    <MedalIcon size={36} color="var(--nav-teal)" />
                  </div>
                ) : (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255, 71, 87, 0.15)',
                    border: '2px solid var(--nav-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(255, 71, 87, 0.3)'
                  }}>
                    <SkullIcon size={36} color="var(--nav-red)" />
                  </div>
                )}
              </div>
              <h2 style={{
                color: winner ? 'var(--nav-teal)' : 'var(--nav-red)',
                fontSize: '2rem',
                letterSpacing: '3px',
                marginBottom: '0.5rem'
              }}>
                {winner ? 'MISSION ACCOMPLIE !' : 'BÂTIMENTS SUBMERGÉS'}
              </h2>
              <p className="mono" style={{ color: 'var(--nav-slate)', marginBottom: '1.5rem' }}>
                {winner
                  ? 'Félicitations Commandant. L\'ensemble de la flottille ennemie a été envoyé par le fond.'
                  : 'Tous nos navires ont été détruits par la puissance de feu ennemie.'}
              </p>

              {/* Debriefing Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                background: 'rgba(2, 12, 27, 0.7)',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid var(--nav-lighter)',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>TIRS EFFECTUÉS</div>
                  <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--nav-text)', fontWeight: 'bold' }}>{myShots.length}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>PRÉCISION</div>
                  <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--nav-teal)', fontWeight: 'bold' }}>
                    {myShots.length > 0 ? Math.round((myShots.filter(s => s.hit).length / myShots.length) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>NAVIRES ENNEMIS COULÉS</div>
                  <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--nav-red)', fontWeight: 'bold' }}>{sunkEnemyShips.length}/5</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>CYCLES DE TIR</div>
                  <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--nav-text)', fontWeight: 'bold' }}>{turnCount}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    sound.playBlip();
                    navigate('/');
                  }}
                  style={{ flex: 1 }}
                >
                  RETOUR AU Q.G.
                </button>
                {isSolo && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      sound.playBlip();
                      window.location.reload();
                    }}
                    style={{ flex: 1 }}
                  >
                    NOUVELLE SIMULATION
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
