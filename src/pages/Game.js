import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import Header from '../components/Header';
import Board from '../components/Board';
import ShipPlacement from '../components/ShipPlacement';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { emit, on, error: socketError } = useSocket();
  
  const [playerId, setPlayerId] = useState(null);
  const [opponentName, setOpponentName] = useState('');
  const [opponentReady, setOpponentReady] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  
  // État du jeu
  const [ships, setShips] = useState([]);
  const [myShots, setMyShots] = useState([]);
  const [opponentShots, setOpponentShots] = useState([]);
  
  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }
    
    // Écouter les événements socket
    const unsubscribePlayerJoined = on('playerJoined', ({ username }) => {
      setOpponentName(username);
      setMessage(`${username} a rejoint la partie.`);
    });
    
    const unsubscribePlayerIsReady = on('playerIsReady', ({ playerId: readyPlayerId }) => {
      if (readyPlayerId !== playerId) {
        setOpponentReady(true);
        setMessage(`${opponentName || 'Votre adversaire'} est prêt !`);
      }
    });
    
    const unsubscribeGameStart = on('gameStart', ({ turn }) => {
      setGameStarted(true);
      setIsPlayerTurn(turn === playerId);
      setMessage(turn === playerId ? 'Le jeu commence ! C\'est votre tour.' : 'Le jeu commence ! C\'est le tour de votre adversaire.');
    });
    
    const unsubscribeShotResult = on('shotResult', ({ playerId: shooterId, x, y, hit, nextTurn }) => {
      if (shooterId === playerId) {
        // C'est notre tir
        setMyShots(prev => [...prev, { x, y, hit }]);
        setMessage(hit ? 'Touché !' : 'Manqué !');
        setIsPlayerTurn(nextTurn === playerId);
      } else {
        // C'est le tir de l'adversaire
        setOpponentShots(prev => [...prev, { x, y, hit }]);
        setMessage(hit ? 'Votre bateau a été touché !' : 'Votre adversaire a manqué !');
        setIsPlayerTurn(nextTurn === playerId);
      }
    });
    
    const unsubscribeGameOver = on('gameOver', ({ winner: winnerId }) => {
      setGameOver(true);
      setWinner(winnerId === playerId);
      setMessage(winnerId === playerId ? 'Félicitations, vous avez gagné !' : 'Vous avez perdu. Meilleure chance la prochaine fois !');
    });
    
    const unsubscribeOpponentLeft = on('opponentLeft', () => {
      setMessage('Votre adversaire a quitté la partie.');
      setGameOver(true);
      setWinner(true);
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
    };
  }, [roomId, navigate, emit, on, currentUser, playerId, opponentName]);
  
  const handleReady = (ships) => {
    setShips(ships);
    setIsReady(true);
    
    // Informer le serveur que nous sommes prêts
    emit('playerReady', ships);
    setMessage('Vous êtes prêt ! En attente de votre adversaire...');
  };
  
  const handleCellClick = (x, y) => {
    if (!gameStarted || !isPlayerTurn || gameOver) return;
    
    // Vérifier si on a déjà tiré à cette position
    if (myShots.some(shot => shot.x === x && shot.y === y)) return;
    
    // Envoyer le tir au serveur
    emit('fireShot', { x, y });
  };
  
  const handleLeaveGame = () => {
    navigate('/');
  };
  
  return (
    <div>
      <Header />
      
      <main className="container">
        <div className="game-header" style={{ textAlign: 'center', margin: '1rem 0' }}>
          <h1>Salle: {roomId}</h1>
          {opponentName && <p>Adversaire: {opponentName}</p>}
          
          {message && (
            <div className={`alert ${gameOver ? (winner ? 'alert-success' : 'alert-danger') : 'alert-info'}`} style={{ margin: '1rem 0' }}>
              {message}
            </div>
          )}
          
          {socketError && (
            <div className="alert alert-danger">
              Erreur de connexion: {socketError}
            </div>
          )}
        </div>
        
        <div className="game-container">
          {!isReady ? (
            <ShipPlacement onReady={handleReady} />
          ) : (
            <div className="boards-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Board
                board={opponentShots}
                ships={ships}
                onCellClick={() => {}}
                isPlayerBoard={true}
                isGameStarted={gameStarted}
              />
              
              <Board
                board={myShots}
                ships={[]}
                onCellClick={handleCellClick}
                isPlayerBoard={false}
                isGameStarted={gameStarted}
                isPlayerTurn={isPlayerTurn}
              />
              
              <div className="game-status" style={{ margin: '1rem 0' }}>
                {!gameStarted ? (
                  <div>
                    {isReady && <p>Vous êtes prêt !</p>}
                    {opponentReady && <p>Votre adversaire est prêt !</p>}
                    {isReady && !opponentReady && <p>En attente de votre adversaire...</p>}
                  </div>
                ) : (
                  <div>
                    <p>
                      {gameOver
                        ? 'Partie terminée'
                        : isPlayerTurn
                          ? 'C\'est votre tour'
                          : 'Tour de votre adversaire'}
                    </p>
                  </div>
                )}
              </div>
              
              {gameOver && (
                <button className="btn btn-primary" onClick={handleLeaveGame}>
                  Retour à l'accueil
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Game; 