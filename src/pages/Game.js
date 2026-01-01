import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import ShipPlacement from '../components/ShipPlacement';
import Chat from '../components/Chat';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isConnected, emit, on } = useSocket();
  const { currentUser } = useAuth();

  const [gameStarted, setGameStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [ships, setShips] = useState([]);
  const [myShots, setMyShots] = useState([]);
  const [opponentShots, setOpponentShots] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [message, setMessage] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [opponentName, setOpponentName] = useState('');

  // Fonction pour gérer le placement des bateaux
  const handleReady = (placedShips) => {
    setShips(placedShips);
    setIsReady(true);
    emit('playerReady', placedShips);
    setMessage('En attente de l\'adversaire...');
  };

  // Fonction pour gérer le tir
  const handleCellClick = (x, y) => {
    if (!gameStarted || !isPlayerTurn || gameOver) return;

    // Vérifier si on a déjà tiré ici
    if (myShots.some(shot => shot.x === x && shot.y === y)) return;

    emit('fireShot', { x, y });
  };

  const handleLeaveGame = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!isConnected) return;

    // Événements du jeu
    const unsubscribePlayerJoined = on('playerJoined', ({ username }) => {
      setOpponentName(username);
      setMessage(`${username} a rejoint la partie`);
    });

    const unsubscribePlayerIsReady = on('playerIsReady', () => {
      if (isReady) {
        setMessage('L\'adversaire est prêt !');
      } else {
        setMessage('L\'adversaire est prêt. Placez vos bateaux !');
      }
    });

    const unsubscribeGameStart = on('gameStart', ({ turn }) => {
      setGameStarted(true);
      setIsPlayerTurn(turn === playerId);
      setMessage(turn === playerId ? 'C\'est votre tour !' : 'Tour de l\'adversaire');
    });

    const unsubscribeShotResult = on('shotResult', ({ playerId: shooterId, x, y, hit, nextTurn }) => {
      if (shooterId === playerId) {
        // C'est moi qui ai tiré
        setMyShots(prev => [...prev, { x, y, hit }]);
        if (hit) {
          setMessage('Touché !');
        } else {
          setMessage('Manqué...');
        }
      } else {
        // L'adversaire a tiré
        setOpponentShots(prev => [...prev, { x, y, hit }]);
      }

      // Mettre à jour le tour
      if (nextTurn !== undefined) {
        setIsPlayerTurn(nextTurn === playerId);
      }
    });

    const unsubscribeGameOver = on('gameOver', async ({ winner: winnerId }) => {
      setGameOver(true);
      const isWinner = winnerId === playerId;
      setWinner(isWinner);

      if (isWinner) {
        setMessage('VICTOIRE ! Vous avez coulé tous les navires ennemis.');
      } else {
        setMessage('DÉFAITE. Votre flotte a été détruite.');
      }

      // Sauvegarder l'historique si l'utilisateur est connecté
      if (currentUser) {
        try {
          const gameResult = {
            date: new Date().toISOString(),
            opponent: opponentName || 'Unknown Hostile',
            result: isWinner ? 'WIN' : 'LOSS',
            roomId: roomId
          };

          await updateDoc(doc(db, 'users', currentUser.uid), {
            history: arrayUnion(gameResult),
            // On peut aussi mettre à jour les stats simples si on veut
            // mais l'historique est plus détaillé
          });
        } catch (error) {
          console.error("Error saving game history:", error);
        }
      }
    });

    const unsubscribeOpponentLeft = on('opponentLeft', () => {
      setMessage('Votre adversaire a quitté la partie.');
      setGameOver(true);
      setWinner(true);
    });

    const unsubscribeRoomNotFound = on('roomNotFound', () => {
      alert('Cette salle n\'existe plus (probablement suite à un redémarrage du serveur). Veuillez en créer une nouvelle.');
      navigate('/');
    });

    // Récupérer les informations de la salle
    emit('joinRoom', { roomId, username: currentUser?.displayName || currentUser?.email });

    on('roomCreated', ({ roomId: createdRoomId, playerId: assignedPlayerId }) => {
      setPlayerId(assignedPlayerId);
    });

    on('roomJoined', ({ roomId: joinedRoomId, playerId: assignedPlayerId }) => {
      setPlayerId(assignedPlayerId);
    });

    return () => {
      unsubscribePlayerJoined();
      unsubscribePlayerIsReady();
      unsubscribeGameStart();
      unsubscribeShotResult();
      unsubscribeGameOver();
      unsubscribeOpponentLeft();
      unsubscribeRoomNotFound();
    };
  }, [roomId, navigate, emit, on, currentUser, playerId, isReady, isConnected]);

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="tactical-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <span className="mono" style={{ color: 'var(--nav-slate)' }}>SECTOR: {roomId}</span>
            <span className="mono" style={{ color: 'var(--nav-red)' }}>DEFCON 1</span>
          </div>

          <h2 style={{ fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '0.5rem' }}>
            NAVAL ENGAGEMENT
          </h2>

          {opponentName ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <span className="status-indicator online"></span>
              <span className="mono">TARGET: {opponentName}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <span className="status-indicator blink-slow" style={{ background: 'var(--nav-gold)' }}></span>
              <span className="mono blink-slow">SCANNING HORIZON...</span>
            </div>
          )}

          {message && (
            <div
              className={`alert ${gameOver ? (winner ? 'alert-success' : 'alert-danger') : 'alert-info'}`}
              style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}
            >
              {message.toUpperCase()}
            </div>
          )}
        </div>

        <div className="game-container">
          {!isReady ? (
            <ShipPlacement onReady={handleReady} />
          ) : (
            <div className="boards-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              {/* Enemy Board */}
              <Board
                board={opponentShots}
                ships={ships}
                onCellClick={() => { }}
                isPlayerBoard={true}
                isGameStarted={gameStarted}
              />

              <div style={{ width: '100%', height: '1px', background: 'var(--nav-lighter)' }}></div>

              {/* Player Board */}
              <Board
                board={myShots}
                ships={[]}
                onCellClick={handleCellClick}
                isPlayerBoard={false}
                isGameStarted={gameStarted}
                isPlayerTurn={isPlayerTurn}
              />

              {/* Status Bar */}
              <div className="tactical-panel" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mono" style={{ color: isPlayerTurn ? 'var(--nav-teal)' : 'var(--nav-slate)' }}>
                  COMMAND: {isPlayerTurn ? '> AWAITING ORDERS' : 'STANDBY'}
                </div>
                <div className="mono" style={{ color: gameStarted ? 'var(--nav-teal)' : 'var(--nav-gold)' }}>
                  STATUS: {gameStarted ? 'ENGAGED' : 'PREPARING'}
                </div>
              </div>

              {gameOver && (
                <button className="btn btn-primary" onClick={handleLeaveGame} style={{ marginTop: '1rem' }}>
                  RETURN TO BASE
                </button>
              )}
            </div>
          )}

          {/* Chat Module */}
          {isConnected && <Chat />}
        </div>
      </main >
    </div >
  );
};

export default Game;