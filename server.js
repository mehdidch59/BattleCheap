const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Initialisation
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"]
  }
});

// Middleware
app.use(express.json());

// En production, servir les fichiers statiques depuis le répertoire build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
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

    // Créer la nouvelle salle
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

    // Faire rejoindre cette salle au socket
    socket.join(roomId);

    // Enregistrer les infos utilisateur
    users[socket.id] = {
      roomId: roomId,
      playerId: 0,
      username: username || 'Joueur 1'
    };

    // Envoyer l'ID de salle au créateur
    socket.emit('roomCreated', { roomId, playerId: 0 });
  });

  // Rejoindre une salle
  socket.on('joinRoom', ({ roomId, username }) => {
    console.log(`Tentative de rejoindre la salle: ${roomId} par ${username} (${socket.id})`);

    // Vérifier si la salle existe
    if (!rooms[roomId]) {
      socket.emit('roomNotFound');
      return;
    }

    // Vérifier si le joueur est déjà dans la salle
    if (rooms[roomId].players.includes(socket.id)) {
      console.log(`Joueur ${username} déjà dans la salle ${roomId}`);
      const playerId = rooms[roomId].players.indexOf(socket.id);

      // Mettre à jour le username si besoin
      users[socket.id] = {
        roomId: roomId,
        playerId: playerId,
        username: username || users[socket.id]?.username || 'Joueur'
      };

      socket.emit('roomJoined', { roomId, playerId });

      // Si l'adversaire est déjà là, on renvoie l'info
      const opponentId = playerId === 0 ? 1 : 0;
      if (rooms[roomId].players[opponentId]) {
        const opponentSocketId = rooms[roomId].players[opponentId];
        const opponentName = users[opponentSocketId]?.username;
        if (opponentName) {
          socket.emit('playerJoined', { username: opponentName });
        }
      }
      return;
    }

    // Vérifier si la salle est pleine
    if (rooms[roomId].players.length >= 2) {
      socket.emit('roomFull');
      return;
    }

    // Rejoindre la salle
    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    // Enregistrer les infos utilisateur
    users[socket.id] = {
      roomId: roomId,
      playerId: 1, // Si on arrive ici, on est forcément le 2ème (index 1) car createRoom met le premier, et le check duplicate gère le rejoin
      username: username || 'Joueur 2'
    };

    // Notifier les deux joueurs
    socket.emit('roomJoined', { roomId, playerId: 1 });

    // Notifier le créateur qu'un joueur a rejoint
    io.to(rooms[roomId].players[0]).emit('playerJoined', {
      username: users[socket.id].username
    });

    // Notifier le nouveau joueur du nom du créateur (pour que lui aussi sache contre qui il joue)
    const creatorSocketId = rooms[roomId].players[0];
    const creatorName = users[creatorSocketId]?.username;
    if (creatorName) {
      socket.emit('playerJoined', { username: creatorName });
    }
  });

  // Joueur prêt (bateaux placés)
  socket.on('playerReady', (boardData) => {
    if (!users[socket.id] || !users[socket.id].roomId) return;

    const roomId = users[socket.id].roomId;
    const playerId = users[socket.id].playerId;

    if (!rooms[roomId]) return;

    if (playerId === 0) {
      rooms[roomId].gameState.player1Ready = true;
      rooms[roomId].gameState.board1 = boardData;
    } else {
      rooms[roomId].gameState.player2Ready = true;
      rooms[roomId].gameState.board2 = boardData;
    }

    // Vérifier si les deux joueurs sont prêts
    if (rooms[roomId].gameState.player1Ready && rooms[roomId].gameState.player2Ready) {
      rooms[roomId].gameState.status = 'playing';
      rooms[roomId].gameState.turn = 0; // Premier joueur commence

      // Informer les deux joueurs que la partie commence
      io.to(roomId).emit('gameStart', {
        turn: 0
      });
    } else {
      // Informer les autres joueurs qu'un joueur est prêt
      socket.to(roomId).emit('playerIsReady', { playerId });
    }
  });

  // Action de tir
  socket.on('fireShot', ({ x, y }) => {
    if (!users[socket.id] || !users[socket.id].roomId) return;

    const roomId = users[socket.id].roomId;
    const playerId = users[socket.id].playerId;
    const room = rooms[roomId];

    if (!room || room.gameState.status !== 'playing' || room.gameState.turn !== playerId) return;

    // Déterminer la cible
    const targetPlayerId = playerId === 0 ? 1 : 0;
    const targetBoard = targetPlayerId === 0 ? room.gameState.board1 : room.gameState.board2;

    if (!targetBoard) return;

    // Vérifier si la cellule contient un bateau
    const hit = targetBoard.some(ship => ship.positions.some(pos => pos.x === x && pos.y === y && !pos.hit));

    // Mettre à jour l'état du jeu
    if (hit) {
      // Marquer la position comme touchée
      targetBoard.forEach(ship => {
        ship.positions.forEach(pos => {
          if (pos.x === x && pos.y === y) {
            pos.hit = true;
          }
        });
      });

      // Vérifier si tous les bateaux sont coulés
      const allSunk = targetBoard.every(ship =>
        ship.positions.every(pos => pos.hit)
      );

      if (allSunk) {
        room.gameState.status = 'gameOver';
        io.to(roomId).emit('gameOver', { winner: playerId });
      } else {
        // Informer les joueurs du résultat
        io.to(roomId).emit('shotResult', {
          playerId,
          x,
          y,
          hit: true,
          nextTurn: playerId
        });
      }
    } else {
      // Changer de tour
      room.gameState.turn = targetPlayerId;

      // Informer les joueurs du résultat
      io.to(roomId).emit('shotResult', {
        playerId,
        x,
        y,
        hit: false,
        nextTurn: targetPlayerId
      });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.roomId) {
      const roomId = user.roomId;
      const room = rooms[roomId];

      if (room) {
        // Notifier l'autre joueur
        socket.to(roomId).emit('opponentLeft');

        // Supprimer la salle si elle existe encore
        delete rooms[roomId];
      }

      // Supprimer l'utilisateur
      delete users[socket.id];
    }
  });
});

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

