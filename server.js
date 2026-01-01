const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Initialisation
const app = express();
const server = http.createServer(app);

// MODIFICATION : Configuration CORS sécurisée
const io = new Server(server, {
  cors: {
    // On autorise ton sous-domaine en production, localhost en développement
    origin: process.env.NODE_ENV === 'production'
      ? "https://battlecheap.mehdichafai.me"
      : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());

// En production, servir les fichiers statiques depuis le répertoire build
if (process.env.NODE_ENV === 'production') {
  // On s'assure que le chemin vers 'build' est correct par rapport à la racine
  app.use(express.static(path.join(__dirname, 'build')));

  app.get(/^(?!\/socket\.io\/).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Gestion des salles et des utilisateurs
const rooms = {};
const users = {};

// Socket.io
io.on('connection', (socket) => {
  console.log(`Nouvelle connexion: ${socket.id}`);

  // Créer une salle
  socket.on('createRoom', ({ roomId, username }) => {
    console.log(`Création de la salle: ${roomId} par ${username}`);

    if (rooms[roomId]) {
      socket.emit('error', 'Une salle avec ce code existe déjà');
      return;
    }

    rooms[roomId] = {
      id: roomId,
      players: [socket.id],
      gameState: {
        status: 'waiting',
        turn: null,
        player1Ready: false,
        player2Ready: false,
        board1: null,
        board2: null
      }
    };

    socket.join(roomId);

    users[socket.id] = {
      roomId: roomId,
      playerId: 0,
      username: username || 'Joueur 1'
    };

    socket.emit('roomCreated', { roomId, playerId: 0 });
  });

  // Rejoindre une salle
  socket.on('joinRoom', ({ roomId, username }) => {
    console.log(`Tentative de rejoindre la salle: ${roomId} par ${username}`);

    if (!rooms[roomId]) {
      socket.emit('roomNotFound');
      return;
    }

    if (rooms[roomId].players.includes(socket.id)) {
      const playerId = rooms[roomId].players.indexOf(socket.id);
      users[socket.id] = {
        roomId: roomId,
        playerId: playerId,
        username: username || users[socket.id]?.username || 'Joueur'
      };
      socket.emit('roomJoined', { roomId, playerId });
      return;
    }

    if (rooms[roomId].players.length >= 2) {
      socket.emit('roomFull');
      return;
    }

    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    users[socket.id] = {
      roomId: roomId,
      playerId: 1,
      username: username || 'Joueur 2'
    };

    socket.emit('roomJoined', { roomId, playerId: 1 });
    io.to(rooms[roomId].players[0]).emit('playerJoined', {
      username: users[socket.id].username
    });

    const creatorSocketId = rooms[roomId].players[0];
    const creatorName = users[creatorSocketId]?.username;
    if (creatorName) {
      socket.emit('playerJoined', { username: creatorName });
    }
  });

  // Joueur prêt (bateaux placés)
  socket.on('playerReady', (boardData) => {
    if (!users[socket.id] || !users[socket.id].roomId) return;
    const { roomId, playerId } = users[socket.id];
    if (!rooms[roomId]) return;

    if (playerId === 0) {
      rooms[roomId].gameState.player1Ready = true;
      rooms[roomId].gameState.board1 = boardData;
    } else {
      rooms[roomId].gameState.player2Ready = true;
      rooms[roomId].gameState.board2 = boardData;
    }

    if (rooms[roomId].gameState.player1Ready && rooms[roomId].gameState.player2Ready) {
      rooms[roomId].gameState.status = 'playing';
      rooms[roomId].gameState.turn = 0;
      io.to(roomId).emit('gameStart', { turn: 0 });
    } else {
      socket.to(roomId).emit('playerIsReady', { playerId });
    }
  });

  // Chat : Envoi de message
  socket.on('sendMessage', ({ message }) => {
    if (!users[socket.id] || !users[socket.id].roomId) return;
    const { roomId, username } = users[socket.id];

    // Diffuser le message à toute la salle (y compris l'expéditeur)
    io.to(roomId).emit('receiveMessage', {
      sender: username,
      text: message,
      timestamp: new Date().toISOString()
    });
  });

  // Action de tir
  socket.on('fireShot', ({ x, y }) => {
    if (!users[socket.id] || !users[socket.id].roomId) return;
    const { roomId, playerId } = users[socket.id];
    const room = rooms[roomId];

    if (!room || room.gameState.status !== 'playing' || room.gameState.turn !== playerId) return;

    const targetPlayerId = playerId === 0 ? 1 : 0;
    const targetBoard = targetPlayerId === 0 ? room.gameState.board1 : room.gameState.board2;

    if (!targetBoard) return;

    const hit = targetBoard.some(ship => ship.positions.some(pos => pos.x === x && pos.y === y && !pos.hit));

    if (hit) {
      targetBoard.forEach(ship => {
        ship.positions.forEach(pos => {
          if (pos.x === x && pos.y === y) pos.hit = true;
        });
      });

      const allSunk = targetBoard.every(ship => ship.positions.every(pos => pos.hit));

      if (allSunk) {
        room.gameState.status = 'gameOver';
        io.to(roomId).emit('gameOver', { winner: playerId });
      } else {
        io.to(roomId).emit('shotResult', { playerId, x, y, hit: true, nextTurn: playerId });
      }
    } else {
      room.gameState.turn = targetPlayerId;
      io.to(roomId).emit('shotResult', { playerId, x, y, hit: false, nextTurn: targetPlayerId });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.roomId) {
      socket.to(user.roomId).emit('opponentLeft');
      delete rooms[user.roomId];
      delete users[socket.id];
    }
  });
});

// MODIFICATION : Port dynamique + Host 0.0.0.0 pour Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});