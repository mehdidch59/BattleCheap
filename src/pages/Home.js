import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isConnected, emit, on, off, socketError } = useSocket();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Écouter la confirmation de création de salle
    const handleRoomCreated = ({ roomId }) => {
      navigate(`/game/${roomId}`);
    };

    // Écouter la confirmation pour rejoindre une salle
    const handleRoomJoined = ({ roomId }) => {
      navigate(`/game/${roomId}`);
    };

    // Écouter les erreurs
    const handleError = (message) => {
      setError(message);
    };

    const handleRoomFull = () => {
      setError('Cette salle est pleine');
    };

    const handleRoomNotFound = () => {
      setError('Salle introuvable');
    };

    if (isConnected) {
      on('roomCreated', handleRoomCreated);
      on('roomJoined', handleRoomJoined);
      on('error', handleError);
      on('roomFull', handleRoomFull);
      on('roomNotFound', handleRoomNotFound);
    }

    return () => {
      if (isConnected) {
        off('roomCreated', handleRoomCreated);
        off('roomJoined', handleRoomJoined);
        off('error', handleError);
        off('roomFull', handleRoomFull);
        off('roomNotFound', handleRoomNotFound);
      }
    };
  }, [navigate, isConnected, on, off]);

  const handleCreateRoom = () => {
    setError('');
    const newRoomId = roomId || Math.random().toString(36).substring(2, 8).toUpperCase();

    // Utiliser le nom de l'utilisateur ou son email s'il est connecté
    const username = currentUser ? (currentUser.displayName || currentUser.email) : 'Joueur 1';

    emit('createRoom', { roomId: newRoomId, username });
  };

  const handleJoinRoom = () => {
    setError('');
    if (!joinRoomId) {
      setError('Veuillez entrer un code de salle');
      return;
    }

    // Utiliser le nom de l'utilisateur ou son email s'il est connecté
    const username = currentUser ? (currentUser.displayName || currentUser.email) : 'Joueur 2';

    emit('joinRoom', { roomId: joinRoomId, username });
  };

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ letterSpacing: '4px', color: 'var(--nav-teal)', marginBottom: '1rem', fontSize: '0.9rem' }} className="mono">
            {/* UNIFIED NAVAL COMMAND SYSTEM */}
            UNIFIED NAVAL COMMAND SYSTEM
          </div>
          <h1 style={{ fontSize: '4rem', margin: 0 }}>BATTLECHEAP</h1>
          <p className="mono" style={{ color: 'var(--nav-slate)', marginTop: '0.5rem' }}>
            SECURE TACTICAL UPLINK v2.0
          </p>
        </div>

        {(error || socketError) && (
          <div className="alert alert-danger">{error || socketError}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Create Room Panel */}
          <div className="tactical-panel">
            <h3 className="text-center" style={{ color: 'var(--nav-teal)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(100, 255, 218, 0.1)', paddingBottom: '1rem' }}>
              INITIALIZE OPERATION
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-slate)', fontSize: '0.8rem' }}>MISSION ID [OPTIONAL]</label>
              <input
                type="text"
                className="form-control"
                placeholder="AUTO-GENERATE"
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
              CREATE LOBBY
            </button>
          </div>

          {/* Join Room Panel */}
          <div className="tactical-panel">
            <h3 className="text-center" style={{ color: 'var(--nav-text)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
              JOIN EXISTING FRONT
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-slate)', fontSize: '0.8rem' }}>COORDINATES [ROOM ID]</label>
              <input
                type="text"
                className="form-control"
                placeholder="ENTER CODE"
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
              CONNECT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;