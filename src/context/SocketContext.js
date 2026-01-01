import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Pour GitHub Pages, nous aurons besoin d'une URL de serveur externe
const SERVER_URL = process.env.NODE_ENV === 'production'
    ? 'https://battlecheap.onrender.com'
    : `http://localhost:${process.env.REACT_APP_PORT || 5000}`;

export function useSocketContext() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialiser le socket une seule fois
        if (!socketRef.current) {
            console.log('Initializing Global Socket connection...');
            const socket = io(SERVER_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket'] // Force websocket pour éviter les erreurs Render
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Socket Connected:', socket.id);
                setIsConnected(true);
                setError(null);
            });

            socket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err);
                setError(`Erreur de connexion: ${err.message}`);
                setIsConnected(false);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket Disconnected:', reason);
                setIsConnected(false);
            });
        }

        // Cleanup on unmount (only when App unmounts, effectively never for SPA root)
        return () => {
            // Optional: Don't disconnect here to verify behavior, or disconnect if truly shutting down
            if (socketRef.current) {
                // socketRef.current.disconnect();
            }
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
        return () => { };
    }, []);

    // Se désabonner d'un événement
    const off = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }, []);

    const value = {
        socket: socketRef.current,
        isConnected,
        error,
        emit,
        on,
        off
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}
