import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Pour GitHub Pages, nous aurons besoin d'une URL de serveur externe
// car GitHub Pages ne peut pas héberger de serveur backend
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_SERVER_URL || 'https://votre-serveur-backend.herokuapp.com'
  : `http://localhost:${process.env.REACT_APP_PORT || 5000}`;

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Créer la connexion socket
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    // Gérer les événements de connexion
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setError(`Erreur de connexion: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('error', (message) => {
      setError(message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Nettoyer la connexion lors du démontage
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Émettre un événement
  const emit = useCallback((event, data, callback) => {
    if (socketRef.current) {
      return callback 
        ? socketRef.current.emit(event, data, callback)
        : socketRef.current.emit(event, data);
    }
  }, []);

  // S'abonner à un événement
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      
      // Retourner une fonction pour se désabonner
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    }
    return () => {};
  }, []);

  // Se désabonner d'un événement
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off
  };
} 