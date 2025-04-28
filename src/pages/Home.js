import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import Header from '../components/Header';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { emit, on, isConnected, error: socketError } = useSocket();
  const navigate = useNavigate();

  // S'abonner aux événements socket
  React.useEffect(() => {
    if (!isConnected) return;

    const unsubscribeRoomCreated = on('roomCreated', ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    const unsubscribeRoomJoined = on('roomJoined', ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    const unsubscribeRoomNotFound = on('roomNotFound', () => {
      setError('Salle introuvable.');
    });

    const unsubscribeRoomFull = on('roomFull', () => {
      setError('Cette salle est pleine.');
    });

    return () => {
      unsubscribeRoomCreated();
      unsubscribeRoomJoined();
      unsubscribeRoomNotFound();
      unsubscribeRoomFull();
    };
  }, [isConnected, on, navigate]);

  // Générer un ID aléatoire pour la salle
  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Créer une nouvelle salle
  const handleCreateRoom = () => {
    const newRoomId = roomId || generateRoomId();
    
    if (currentUser) {
      emit('createRoom', { 
        roomId: newRoomId,
        username: currentUser.displayName || currentUser.email
      });
    } else {
      navigate('/login');
    }
  };

  // Rejoindre une salle existante
  const handleJoinRoom = () => {
    if (!joinRoomId) {
      setError('Veuillez entrer un code de salle.');
      return;
    }
    
    if (currentUser) {
      emit('joinRoom', { 
        roomId: joinRoomId,
        username: currentUser.displayName || currentUser.email
      });
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      <Header />
      
      <main className="container" style={{ marginTop: '2rem' }}>
        <h1 className="text-center">BattleCheap</h1>
        <p className="text-center">Un jeu de bataille navale en ligne</p>
        
        {(error || socketError) && (
          <div className="alert alert-danger">{error || socketError}</div>
        )}
        
        <div style={{ 
          maxWidth: '500px', 
          margin: '2rem auto', 
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 className="text-center">Créer une partie</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Code de salle (laissez vide pour générer automatiquement)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={handleCreateRoom}
            disabled={!isConnected}
          >
            Créer une partie
          </button>
          
          <hr style={{ margin: '2rem 0' }} />
          
          <h2 className="text-center">Rejoindre une partie</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Entrez le code de salle"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={handleJoinRoom}
            disabled={!isConnected}
          >
            Rejoindre une partie
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home; 