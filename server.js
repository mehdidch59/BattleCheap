const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Initialisation
const app = express();
const server = http.createServer(app);

// Configuration CORS sécurisée
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? "https://battlecheap.mehdichafai.me"
      : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware HTTP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes."
});
app.use(limiter);
app.use(express.json());

// En production, servir les fichiers statiques depuis le répertoire build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get(/^(?!\/socket\.io\/).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// ==========================================
// MESURES DE SÉCURITÉ & VALIDATIONS DÉFENSIVES
// ==========================================

// 1. Stockage en Maps isolées (Immunité contre la pollution de prototype Object.prototype)
const rooms = new Map();
const users = new Map();
const socketRateLimits = new Map();

// 2. Limiteur de fréquence d'événements par Socket (Anti-DoS / Anti-Flood)
function checkSocketRateLimit(socket, maxEvents = 40, windowMs = 5000) {
  const now = Date.now();
  const record = socketRateLimits.get(socket.id) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    socketRateLimits.set(socket.id, record);
    return true;
  }

  record.count += 1;
  socketRateLimits.set(socket.id, record);

  if (record.count > maxEvents) {
    socket.emit('error', 'Cadence de requêtes excessive. Veuillez patienter.');
    return false;
  }
  return true;
}

// 3. Validation et assainissement des entrées utilisateur
const ROOM_ID_REGEX = /^[A-Za-z0-9_\-\s]{3,30}$/;

function sanitizeUsername(name, fallback = 'Joueur') {
  if (typeof name !== 'string') return fallback;
  const clean = name.trim().replace(/[<>]/g, '');
  return clean.length > 0 ? clean.substring(0, 30) : fallback;
}

// 4. Moteur Anti-Triche : Validation stricte de la flotte
function validateFleet(boardData) {
  if (!Array.isArray(boardData) || boardData.length !== 5) return false;

  const EXPECTED_SIZES = [5, 4, 3, 3, 2];
  const occupiedCells = new Set();
  const sizes = [];

  for (const ship of boardData) {
    if (!ship || typeof ship !== 'object' || !Array.isArray(ship.positions)) return false;
    if (ship.positions.length !== ship.size) return false;
    sizes.push(ship.size);

    const xs = [];
    const ys = [];

    for (const pos of ship.positions) {
      if (!pos || !Number.isInteger(pos.x) || !Number.isInteger(pos.y)) return false;
      if (pos.x < 0 || pos.x > 9 || pos.y < 0 || pos.y > 9) return false;

      const key = `${pos.x},${pos.y}`;
      if (occupiedCells.has(key)) return false; // Chevauchement interdit
      occupiedCells.add(key);

      xs.push(pos.x);
      ys.push(pos.y);
    }

    // Vérification de contiguïté (alignement horizontal ou vertical strict)
    const allSameX = xs.every(x => x === xs[0]);
    const allSameY = ys.every(y => y === ys[0]);
    if (!allSameX && !allSameY) return false;

    if (allSameY) {
      const sortedX = [...xs].sort((a, b) => a - b);
      for (let i = 0; i < sortedX.length - 1; i++) {
        if (sortedX[i + 1] !== sortedX[i] + 1) return false;
      }
    } else {
      const sortedY = [...ys].sort((a, b) => a - b);
      for (let i = 0; i < sortedY.length - 1; i++) {
        if (sortedY[i + 1] !== sortedY[i] + 1) return false;
      }
    }
  }

  // Vérification de la conformité des tailles des 5 bâtiments
  sizes.sort((a, b) => b - a);
  return sizes.every((size, idx) => size === EXPECTED_SIZES[idx]);
}

// 5. Nettoyage périodique des salles abandonnées (Garbage Collector mémoire)
const ROOM_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 heures max
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (now - (room.createdAt || 0) > ROOM_MAX_AGE_MS) {
      rooms.delete(roomId);
    }
  }
}, 15 * 60 * 1000);

// ==========================================
// GESTIONNAIRES D'ÉVÉNEMENTS SOCKET.IO
// ==========================================

io.on('connection', (socket) => {
  console.log(`Nouvelle connexion tactique : ${socket.id}`);

  // Créer une salle
  socket.on('createRoom', ({ roomId, username }) => {
    if (!checkSocketRateLimit(socket)) return;

    const cleanRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    if (!ROOM_ID_REGEX.test(cleanRoomId)) {
      socket.emit('error', 'Identifiant de secteur non conforme (3 à 30 caractères autorisés).');
      return;
    }

    if (rooms.has(cleanRoomId)) {
      socket.emit('error', 'Un secteur avec cet identifiant est déjà actif.');
      return;
    }

    const cleanUsername = sanitizeUsername(username, 'Joueur 1');

    rooms.set(cleanRoomId, {
      id: cleanRoomId,
      players: [socket.id],
      createdAt: Date.now(),
      gameState: {
        status: 'waiting',
        turn: null,
        player1Ready: false,
        player2Ready: false,
        board1: null,
        board2: null,
        shots: { 0: new Set(), 1: new Set() }
      }
    });

    socket.join(cleanRoomId);

    users.set(socket.id, {
      roomId: cleanRoomId,
      playerId: 0,
      username: cleanUsername
    });

    socket.emit('roomCreated', { roomId: cleanRoomId, playerId: 0 });
  });

  // Rejoindre une salle
  socket.on('joinRoom', ({ roomId, username }) => {
    if (!checkSocketRateLimit(socket)) return;

    const cleanRoomId = typeof roomId === 'string' ? roomId.trim() : '';
    if (!ROOM_ID_REGEX.test(cleanRoomId)) {
      socket.emit('roomNotFound');
      return;
    }

    const room = rooms.get(cleanRoomId);
    if (!room) {
      socket.emit('roomNotFound');
      return;
    }

    if (room.players.includes(socket.id)) {
      const playerId = room.players.indexOf(socket.id);
      const existingUser = users.get(socket.id);
      users.set(socket.id, {
        roomId: cleanRoomId,
        playerId: playerId,
        username: sanitizeUsername(username, existingUser?.username || 'Joueur')
      });
      socket.emit('roomJoined', { roomId: cleanRoomId, playerId });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('roomFull');
      return;
    }

    const cleanUsername = sanitizeUsername(username, 'Joueur 2');

    room.players.push(socket.id);
    socket.join(cleanRoomId);

    users.set(socket.id, {
      roomId: cleanRoomId,
      playerId: 1,
      username: cleanUsername
    });

    socket.emit('roomJoined', { roomId: cleanRoomId, playerId: 1 });
    io.to(room.players[0]).emit('playerJoined', {
      username: cleanUsername
    });

    const creatorSocketId = room.players[0];
    const creatorUser = users.get(creatorSocketId);
    if (creatorUser?.username) {
      socket.emit('playerJoined', { username: creatorUser.username });
    }
  });

  // Joueur prêt (validation et enregistrement de la flotte)
  socket.on('playerReady', (boardData) => {
    if (!checkSocketRateLimit(socket)) return;

    const user = users.get(socket.id);
    if (!user || !user.roomId) return;
    const { roomId, playerId } = user;
    const room = rooms.get(roomId);
    if (!room) return;

    // Contrôle d'intégrité anti-triche
    if (!validateFleet(boardData)) {
      socket.emit('error', 'Déploiement de flotte non conforme aux règles militaires.');
      return;
    }

    // Assainissement des données du plateau
    const sanitizedBoard = boardData.map(ship => ({
      id: ship.id,
      name: String(ship.name || 'Bâtiment').substring(0, 30),
      size: ship.size,
      positions: ship.positions.map(p => ({ x: p.x, y: p.y, hit: false }))
    }));

    if (playerId === 0) {
      room.gameState.player1Ready = true;
      room.gameState.board1 = sanitizedBoard;
    } else {
      room.gameState.player2Ready = true;
      room.gameState.board2 = sanitizedBoard;
    }

    if (room.gameState.player1Ready && room.gameState.player2Ready) {
      room.gameState.status = 'playing';
      room.gameState.turn = 0;
      io.to(roomId).emit('gameStart', { turn: 0 });
    } else {
      socket.to(roomId).emit('playerIsReady', { playerId });
    }
  });

  // Chat : Envoi de message sécurisé
  socket.on('sendMessage', ({ message }) => {
    if (!checkSocketRateLimit(socket, 15, 5000)) return; // Max 15 messages / 5 sec

    const user = users.get(socket.id);
    if (!user || !user.roomId) return;
    const { roomId, username } = user;

    if (typeof message !== 'string') return;
    const cleanMessage = message.trim();
    if (cleanMessage.length === 0 || cleanMessage.length > 250) return;

    io.to(roomId).emit('receiveMessage', {
      sender: username,
      text: cleanMessage,
      timestamp: new Date().toISOString()
    });
  });

  // Action de tir avec validation des coordonnées et de l'état de jeu
  socket.on('fireShot', ({ x, y }) => {
    if (!checkSocketRateLimit(socket, 25, 5000)) return;

    const user = users.get(socket.id);
    if (!user || !user.roomId) return;
    const { roomId, playerId } = user;
    const room = rooms.get(roomId);

    if (!room || room.gameState.status !== 'playing' || room.gameState.turn !== playerId) return;

    // Validation stricte des coordonnées
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 9 || y < 0 || y > 9) {
      socket.emit('error', 'Coordonnées de frappe invalides.');
      return;
    }

    const targetPlayerId = playerId === 0 ? 1 : 0;
    const targetBoard = targetPlayerId === 0 ? room.gameState.board1 : room.gameState.board2;
    if (!targetBoard) return;

    // Protection anti-doublon de tir
    if (!room.gameState.shots) {
      room.gameState.shots = { 0: new Set(), 1: new Set() };
    }
    const shotKey = `${x},${y}`;
    if (room.gameState.shots[playerId].has(shotKey)) {
      return; // Case déjà pilonnée
    }
    room.gameState.shots[playerId].add(shotKey);

    const hit = targetBoard.some(ship => ship.positions.some(pos => pos.x === x && pos.y === y && !pos.hit));

    if (hit) {
      targetBoard.forEach(ship => {
        ship.positions.forEach(pos => {
          if (pos.x === x && pos.y === y) pos.hit = true;
        });
      });

      const allSunk = targetBoard.every(ship => ship.positions.every(pos => pos.hit));
      const justSunk = targetBoard.find(ship => ship.positions.some(pos => pos.x === x && pos.y === y) && ship.positions.every(pos => pos.hit));
      const sunkInfo = justSunk ? { id: justSunk.id, name: justSunk.name, size: justSunk.size, positions: justSunk.positions } : null;

      if (allSunk) {
        room.gameState.status = 'gameOver';
        io.to(roomId).emit('shotResult', { playerId, x, y, hit: true, sunkShip: sunkInfo });
        io.to(roomId).emit('gameOver', { winner: playerId });
      } else {
        io.to(roomId).emit('shotResult', { playerId, x, y, hit: true, nextTurn: playerId, sunkShip: sunkInfo });
      }
    } else {
      room.gameState.turn = targetPlayerId;
      io.to(roomId).emit('shotResult', { playerId, x, y, hit: false, nextTurn: targetPlayerId });
    }
  });

  // Demande de revanche immédiate (Multijoueur)
  socket.on('requestRematch', () => {
    if (!checkSocketRateLimit(socket)) return;
    const user = users.get(socket.id);
    if (!user || !user.roomId) return;
    const room = rooms.get(user.roomId);
    if (!room || room.gameState.status !== 'gameOver') return;

    if (!room.rematchRequests) {
      room.rematchRequests = new Set();
    }
    room.rematchRequests.add(socket.id);

    // Notifier l'adversaire
    socket.to(user.roomId).emit('rematchRequested', {
      sender: user.username
    });

    // Si les deux joueurs acceptent la revanche : réinitialisation de la salle
    if (room.rematchRequests.size >= 2) {
      room.rematchRequests.clear();
      room.gameState = {
        status: 'waiting',
        turn: null,
        player1Ready: false,
        player2Ready: false,
        board1: null,
        board2: null,
        shots: { 0: new Set(), 1: new Set() }
      };
      io.to(user.roomId).emit('rematchStart');
    }
  });

  // Rejet de la demande de revanche
  socket.on('declineRematch', () => {
    const user = users.get(socket.id);
    if (!user || !user.roomId) return;
    const room = rooms.get(user.roomId);
    if (room && room.rematchRequests) {
      room.rematchRequests.clear();
      socket.to(user.roomId).emit('rematchDeclined');
    }
  });

  // Déconnexion propre
  socket.on('disconnect', () => {
    socketRateLimits.delete(socket.id);
    const user = users.get(socket.id);
    if (user && user.roomId) {
      socket.to(user.roomId).emit('opponentLeft');
      rooms.delete(user.roomId);
      users.delete(socket.id);
    }
  });
});

// Port dynamique + Host 0.0.0.0 pour Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur défensif démarré sur le port ${PORT}`);
});
