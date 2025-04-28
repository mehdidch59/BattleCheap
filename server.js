/**** Import npm libs ****/
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session')({
    // CIR2-chat encode in sha256
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false,
    },
});

var BattleCheap = require('./Back/Class/Game.js');
var GameStatus = require('./Back/Class/gameStatus.js');
var Player = require('./Back/Class/Player.js');
const sharedsession = require('express-socket.io-session');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const mysql = require('mysql');
const scoreHandler = require('./Back/Module/scoreHandler');
const date = import('./Front/JS/date.js');
require('dotenv').config();

// Connexion à la base de donnée
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

con.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la BDD :', err.message);
        process.exit(1);
    } else {
        console.log('Bienvenue dans ma BDD');
    }
});
/***************/

const bcrypt = require('bcrypt');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/front'));
app.use(urlencodedParser);
app.use(session);
app.use(express.json());

// Pour gérer les salles avec des codes
const rooms = {};
const users = {};

// Le serveur ecoute sur ce port
const PORT = process.env.PORT || 8880;
http.listen(PORT, () => {
    console.log('Serveur lancé sur le port ' + PORT);
});

io.use(
    sharedsession(session, {
        // Session automatiquement sauvegardée en cas de modification
        autoSave: true,
    })
);

// redirige vers la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Front/Html/index.html');
    let sessionData = req.session;
});

// redirige vers la page de connexion si l'URL contient '/login'
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/Front/Html/login.html');
});

// redirige vers la page d'enregistrement si l'URL contient '/register'
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/Front/Html/register.html');
});

// redirige vers la page de jeu si l'URL contient '/game'
app.get('/game', (req, res) => {
    // Si l'utilisateur n'est pas connecté, rediriger vers l'accueil
    if (!req.session.username) {
        return res.redirect('/');
    }
    
    // Maintenant le roomId est défini dynamiquement lors de la création/jointure d'une salle,
    // donc on peut permettre l'accès à la page game même sans roomId
    res.sendFile(__dirname + '/Front/Html/game.html');
});

// Directement après la connexion d'un socket au serveur
io.on('connection', (socket) => {
    console.log("Nouvelle connexion: " + socket.id);
    
    // Gérer la création d'une salle
    socket.on('createRoom', (roomId) => {
        console.log(`Création de la salle: ${roomId} par ${socket.handshake.session.username}`);
        
        if (rooms[roomId]) {
            socket.emit('error', 'Une salle avec ce code existe déjà');
            return;
        }
        
        // Créer la nouvelle salle
        rooms[roomId] = {
            id: roomId,
            players: [socket.id],
            game: null,
            player1Ready: false,
            player2Ready: false
        };
        
        // Faire rejoindre cette salle au socket
        socket.join(roomId);
        
        // Stocker les informations de la salle dans la session
        socket.handshake.session.roomId = roomId;
        socket.handshake.session.playerId = 0; // Premier joueur (index 0)
        socket.handshake.session.save();
        
        // Enregistrer les infos utilisateur
        users[socket.id] = {
            roomId: roomId,
            playerId: 0,
            username: socket.handshake.session.username || 'Joueur 1'
        };
        
        // Envoyer l'ID de salle au créateur
        socket.emit('roomCreated', roomId);
    });
    
    // Gérer la jointure d'une salle
    socket.on('joinRoom', (roomId) => {
        console.log(`Tentative de rejoindre la salle: ${roomId} par ${socket.handshake.session.username}`);
        
        // Vérifier si la salle existe
        if (!rooms[roomId]) {
            socket.emit('roomNotFound');
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
        
        // Stocker les informations dans la session
        socket.handshake.session.roomId = roomId;
        socket.handshake.session.playerId = 1; // Deuxième joueur (index 1)
        socket.handshake.session.save();
        
        // Enregistrer les infos utilisateur
        users[socket.id] = {
            roomId: roomId,
            playerId: 1,
            username: socket.handshake.session.username || 'Joueur 2'
        };
        
        // Notifier les deux joueurs
        socket.emit('roomJoined', { roomId });
        io.to(rooms[roomId].players[0]).emit('playerJoined', { 
            username: users[socket.id].username,
            roomId: roomId
        });
        
        // Initialiser le jeu dans cette salle
        if (rooms[roomId].players.length === 2) {
            const player1 = new Player(rooms[roomId].players[0]);
            const player2 = new Player(rooms[roomId].players[1]);
            
            rooms[roomId].game = new BattleCheap(player1, player2);
        }
    });
    
    // Joueur prêt (bateaux placés)
    socket.on('ready', () => {
        if (!socket.handshake.session.roomId) return;
        
        const roomId = socket.handshake.session.roomId;
        const playerId = socket.handshake.session.playerId;
        
        if (!rooms[roomId]) return;
        
        // Marquer ce joueur comme prêt
        if (playerId === 0) {
            rooms[roomId].player1Ready = true;
        } else {
            rooms[roomId].player2Ready = true;
        }
        
        console.log(`Joueur ${socket.handshake.session.username} prêt dans la salle ${roomId} (${playerId === 0 ? 'Joueur 1' : 'Joueur 2'})`);
        
        // Vérifier si les deux joueurs sont prêts
        if (rooms[roomId].player1Ready && rooms[roomId].player2Ready) {
            console.log(`Démarrage du jeu dans la salle ${roomId}`);
            
            // Déterminer aléatoirement qui commence
            const firstPlayer = Math.floor(Math.random() * 2);
            
            // Notifier les joueurs
            io.to(rooms[roomId].players[0]).emit('gameStart', firstPlayer === 0);
            io.to(rooms[roomId].players[1]).emit('gameStart', firstPlayer === 1);
        }
    });
    
    // Gestion des tirs
    socket.on('fire', (position) => {
        if (!socket.handshake.session.roomId) return;
        
        const roomId = socket.handshake.session.roomId;
        const playerId = socket.handshake.session.playerId;
        
        if (!rooms[roomId] || !rooms[roomId].game) return;
        
        const game = rooms[roomId].game;
        const targetPlayerId = playerId === 0 ? 1 : 0;
        
        if (game.currentPlayer !== playerId) return; // Pas son tour
        
        // Traiter le tir
        if (game.shoot(position)) {
            // Vérifier si un bateau a été touché
            const opponentGrid = game.getGrid(targetPlayerId, false);
            const gridIndex = position.y * 10 + position.x;
            const hit = opponentGrid.shots[gridIndex] === 2;
            
            // Trouver si un navire a été coulé
            const sunkShips = game.players[targetPlayerId].getSunkShips();
            const sunk = sunkShips.length > 0;
            
            // Déterminer l'index du navire coulé (si applicable)
            let shipIndex = -1;
            if (sunk) {
                // Logique pour déterminer quel navire a été coulé
                shipIndex = game.players[targetPlayerId].shipGrid[gridIndex];
            }
            
            // Envoyer le résultat au tireur
            socket.emit('shotResult', {
                player: 'player',
                x: position.x,
                y: position.y,
                hit,
                sunk,
                shipIndex,
                gameOver: game.gameStatus === GameStatus.gameOver,
                winner: game.getWinnerId()
            });
            
            // Envoyer le résultat à l'adversaire
            io.to(rooms[roomId].players[targetPlayerId]).emit('shotResult', {
                player: 'opponent',
                x: position.x,
                y: position.y,
                hit,
                sunk,
                shipIndex,
                gameOver: game.gameStatus === GameStatus.gameOver,
                winner: game.getWinnerId()
            });
        }
    });
    
    // Gestion du chat
    socket.on('chat', (message) => {
        if (!socket.handshake.session.roomId) return;
        
        const roomId = socket.handshake.session.roomId;
        const username = socket.handshake.session.username || 'Joueur';
        
        io.to(roomId).emit('chat', {
            sender: username,
            message
        });
    });
    
    // Quitter la partie
    socket.on('leaveGame', () => {
        leaveRoom(socket);
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`Déconnexion: ${socket.id} (${socket.handshake.session?.username})`);
        leaveRoom(socket);
        delete users[socket.id];
    });
    
    socket.on('register', (info) => {
        let sql = 'INSERT INTO users VALUES (default,?,?)';
        con.query(sql, [info[0], info[1]], (err) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement :", err.message);
                socket.emit('error', "Erreur lors de l'enregistrement");
                return;
            }
        });
    });

    socket.on('getScore', () => {
        socket.emit('sendScore', scoreHandler.getScores());
    });

    socket.on('isSession', () => {
        io.emit('onSession', socket.handshake.session.username);
    });

    socket.on('username', (info) => {
        let sql = 'SELECT username FROM users WHERE username = ?';
        con.query(sql, [info[0]], (err, res) => {
            if (err) {
                console.error('Erreur SQL username :', err.message);
                socket.emit(
                    'error',
                    "Erreur lors de la vérification du nom d'utilisateur"
                );
                return;
            }
            socket.emit('resultUser', res);
        });
    });
    
    socket.on('password', (info) => {
        let sql = 'SELECT password FROM users WHERE username = ?';
        con.query(sql, [info[0]], (err, res) => {
            if (err) {
                console.error('Erreur SQL password :', err.message);
                socket.emit(
                    'error',
                    'Erreur lors de la vérification du mot de passe'
                );
                return;
            }
            socket.emit('resultPass', res[0]?.password || null);
        });
    });

    socket.on('crypt', (info) => {
        bcrypt.hash(info, 10, function (err, hash) {
            if (err) {
                console.error('Erreur de hashage :', err.message);
                socket.emit('error', 'Erreur lors du hashage');
                return;
            }
            socket.emit('resultCrypt', hash);
        });
    });

    socket.on('decrypt', (info) => {
        bcrypt.compare(info[0], info[1], function (err, res) {
            if (err) {
                console.error('Erreur de comparaison bcrypt :', err.message);
                socket.emit(
                    'error',
                    'Erreur lors de la vérification du mot de passe'
                );
                return;
            }
            socket.emit('resultDecrypt', res);
        });
    });
});

// Fonction pour faire quitter la salle à un joueur
function leaveRoom(socket) {
    if (!socket.handshake.session || !socket.handshake.session.roomId) return;
    
    const roomId = socket.handshake.session.roomId;
    
    if (!rooms[roomId]) return;
    
    console.log(`${socket.handshake.session.username} quitte la salle ${roomId}`);
    
    // Retirer le joueur de la liste des joueurs de la salle
    const playerIndex = rooms[roomId].players.indexOf(socket.id);
    if (playerIndex !== -1) {
        rooms[roomId].players.splice(playerIndex, 1);
    }
    
    // Quitter la salle Socket.IO
    socket.leave(roomId);
    
    // Réinitialiser la session
    socket.handshake.session.roomId = undefined;
    socket.handshake.session.playerId = undefined;
    socket.handshake.session.save();
    
    // Notifier l'autre joueur si présent
    if (rooms[roomId].players.length > 0) {
        io.to(rooms[roomId].players[0]).emit('playerDisconnected');
    }
    
    // Si la salle est vide, la supprimer
    if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
        console.log(`Salle ${roomId} supprimée`);
    }
}

app.post(
    '/login',
    body('login').isLength({ min: 3 }).trim().escape(),
    (req, res, next) => {
        const login = req.body.login;
        // Error management
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Store login
        req.session.username = login;
        req.session.save();
        res.redirect('/');
        console.log(login + ' connected.');
    }
);

// Route pour l'enregistrement de nouveaux utilisateurs
app.post(
    '/register',
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    async (req, res, next) => {
        try {
            // Validation des données
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password, confirmPassword } = req.body;
            
            // Vérification que les mots de passe correspondent
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
            }

            // Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Vérification si l'utilisateur existe déjà
            con.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
                if (err) {
                    console.error("Erreur de vérification d'utilisateur:", err);
                    return res.status(500).json({ error: "Erreur serveur" });
                }
                
                if (results.length > 0) {
                    return res.status(400).json({ error: "Ce nom d'utilisateur est déjà utilisé" });
                }
                
                // Insertion du nouvel utilisateur avec seulement username et password
                con.query(
                    'INSERT INTO users VALUES (default, ?, ?)',
                    [username, hashedPassword],
                    (err, result) => {
                        if (err) {
                            console.error("Erreur d'enregistrement:", err);
                            return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
                        }
                        
                        // Connexion automatique après inscription
                        req.session.username = username;
                        req.session.save();
                        
                        res.redirect('/');
                        console.log(username + ' registered and connected.');
                    }
                );
            });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            next(error);
        }
    }
);

// Middleware de gestion centralisée des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur Express :', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

