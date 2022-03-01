/**** Import npm libs ****/

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require("express-session")({
    // CIR2-chat encode in sha256
    secret: "eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});

var BattleCheap = require('./Back/Class/Game.js');
var GameStatus = require('./Back/Class/gameStatus.js');
var Player = require('./Back/Class/Player.js');
const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const mysql = require('mysql');
const scoreHandler = require('./Back/Module/scoreHandler');
const date = import('./Front/JS/date.js');

// Connexion à la base de donnée
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "battlecheap"
});

con.connect(err => {
    if (err) throw err;
    else console.log('Bienvenue dans ma BDD');
});
/***************/

const bcrypt = require('bcrypt');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/front'));
app.use(urlencodedParser);
app.use(session);
app.use(express.json());

//Pour changer le nombre de salons
const roomnbr = 10;
var users = {};
let rooms = new Array(roomnbr);
let games = new Array(roomnbr);
for (let i = 0; i < roomnbr; i++) {
    rooms[i] = new Array(3);
    rooms[i][0] = 0;
}

// Le serveur ecoute sur ce port
http.listen(8880, () => {
    console.log('Serveur lancé sur le port 8880');
})

io.use(sharedsession(session, {
    // Session automatiquement sauvegardée en cas de modification
    autoSave: true
}));

// redirige vers la page d'accueil
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/index.html');
    let sessionData = req.session;
});

// redirige vers la page de connexion si l'URL contient '/login'
app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/login.html');
});


// redirige vers la page d'enregistrement si l'URL contient '/register'
app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/register.html');
});

// redirige vers la page d'attente si l'URL contient '/waitingRoom'
app.get('/waitingRoom', (req, res) => {
    req.session.ready = true;
    if (req.session.username) {
        res.sendFile(__dirname + '/Front/Html/waitingRoom.html');
        console.log(req.session.ready);
    }
    else {
        res.redirect('/');
    }
});

// redirige vers la page de jeu si l'URL contient '/game'
app.get('/game', (req, res) => {
    // console.log("username", req.session.username, "ready", req.session.ready);
    if (req.session.username && req.session.ready) {
        // console.log(req.session);
        res.sendFile(__dirname + '/Front/Html/game.html');
    }
    else {
        res.redirect('/');
    }

});

// Directement après la connexion d'un socket au serveur
io.on('connection', (socket) => {

    users[socket.id] = {
        inGame: null,
        player: null
    };

    // Entre dans la salle d'attente, il faut attendre un deuxième joueur.
    socket.join('waiting-room');

    socket.on("register", (info) => {
        let sql = "INSERT INTO users VALUES (default,?,?)";
        con.query(sql, [info[0], info[1], info[2]], (err) => {
            if (err) throw err;
        });

    });

    socket.on("getScore", () => {
        socket.emit("sendScore", (scoreHandler.getScores()));
        socket.handshake.session.ready = undefined;
    })

    socket.on("isSession", () => {
        io.emit("onSession", socket.handshake.session.username);
    });

    socket.on("username", (info) => {
        let sql = "SELECT username FROM users WHERE username = ?";
        con.query(sql, [info[0]], (err, res) => {
            if (err) throw err;
            socket.emit("resultUser", res);
        });
    });
    socket.on("password", (info) => {
        let sql = "SELECT password FROM users WHERE username = ?";
        con.query(sql, [info[0]], (err, res) => {
            if (err) throw err;
            socket.emit("resultPass", res[0].password);
        });
    });

    socket.on("crypt", (info) => {
        bcrypt.hash(info, 10, function (err, hash) {
            if (err) throw err;
            socket.emit("resultCrypt", hash);
        });
    });

    socket.on("decrypt", (info) => {
        bcrypt.compare(info[0], info[1], function (err, res) {
            if (err) throw err;
            socket.emit("resultDecrypt", res);
        });
    });

    socket.on("getRoom", () => {
        for (let i = 0; i < roomnbr; i++) {
            if (rooms[i][0] !== 2 && (i === 0 || rooms[i - 1][0] === 2)) {
                rooms[i][0] += 1; // Nbr de joueurs
                socket.handshake.session.player = rooms[i][0];
                socket.join("room" + i);
                rooms[i][rooms[i][0]] = socket.handshake.session.username
                socket.handshake.session.room = i;
                if (rooms[i][0] === 2) {
                    let joueur1 = new Player(rooms[socket.handshake.session.room][1])
                    let joueur2 = new Player(rooms[socket.handshake.session.room][2]);
                    games[socket.handshake.session.room] = new BattleCheap(joueur1, joueur2);
                    games[socket.handshake.session.room].ready = 0;
                    socket.to("room" + i).emit("redirectJ1"); // Envoie uniquement à l'autre joueur cette socket
                    socket.emit("redirectJ2"); // socket envoyé uniquement à l'emetteur
                }
                i = roomnbr;
            }
        }
    });

    /**
   * Traitement du tir
   */
    socket.on('shot', function (position) {
        var game = users[socket.id].inGame, opponent;

        if (game !== null) {
            // L'utilisateur est-il en ligne ?
            if (game.currentPlayer === users[socket.id].player) {
                opponent = game.currentPlayer === 0 ? 1 : 0;

                if (game.shoot(position)) {
                    // Le tir mène-t-il à la victoire ?
                    checkGameOver(game);

                    // Renouvelle le statut de jeu des deux côtés
                    io.to(socket.id).emit('update', game.getGameState(users[socket.id].player, opponent));
                    io.to(game.getPlayerId(opponent)).emit('update', game.getGameState(opponent, opponent));
                }
            }
        }
    });

    /**
   * Si un joueur quitte le jeu
   */
    socket.on('leave', function () {
        if (users[socket.id].inGame !== null) {
            leaveGame(socket);

            socket.join('waiting room');
            joinWaitingPlayers();
        }
    });

    /**
   * Si un joueur perd la connexion
   */
    socket.on('disconnect', function () {
        leaveGame(socket);

        delete users[socket.id];
    });

    joinWaitingPlayers();

});

/**
* Rejoindre la salle d'attente
*/
function joinWaitingPlayers() {
    var players = getClientsInRoom('waiting room');

    if (players.length >= 2) {
        // Deux joueurs en attente -> créer un nouveau jeu
        var game = new BattleshipGame(gameIdCounter++, players[0].id, players[1].id);

        // Créez une nouvelle salle pour ce jeu
        players[0].leave('waiting room');
        players[1].leave('waiting room');
        players[0].join('game' + game.id);
        players[1].join('game' + game.id);

        users[players[0].id].player = 0;
        users[players[1].id].player = 1;
        users[players[0].id].inGame = game;
        users[players[1].id].inGame = game;

        io.to('game' + game.id).emit('join', game.id);

        // Mettre en place le jeu
        io.to(players[0].id).emit('update', game.getGameState(0, 0));
        io.to(players[1].id).emit('update', game.getGameState(1, 1));

        console.log((players[0].username + " and " + players[1].username + " have joined game ID " + game.id));
    };
};


/**
* Trouver tous les sockets dans une salle
* @param {type} room
* @returns {Array}
*/
function getClientsInRoom(room) {
    var clients = [];
    for (var id in io.sockets.adapter.rooms[room]) {
        clients.push(io.sockets.adapter.nsp.connected[id]);
    }
    return clients;
}

/**
* Si l'utilisateur quitte le jeu
* @param {type} socket
*/
function leaveGame(socket) {
    if (users[socket.id].inGame !== null) {
        console.log((socket.handshake.session.username + ' left game ' + socket.handshake.session.room));

        // Notifier les joueurs
        socket.broadcast.to('game' + socket.handshake.session.room).emit('notification', {
            message: 'Opponent has left the game'
        });

        if (users[socket.id].inGame.gameStatus !== GameStatus.gameOver) {
            // Le jeu n'est pas terminé, annulez.
            users[socket.id].inGame.abortGame(users[socket.id].player);
            checkGameOver(users[socket.id].inGame);
        };

        socket.leave('game' + socket.handshake.session.room);

        users[socket.id].inGame = null;
        users[socket.id].player = null;

        io.to(socket.id).emit('leave');
    };
};

/**
* Avertir le joueur quand le jeu est terminé.
* @param {type} game
*/
function checkGameOver(game) {
    if (game.gameStatus === GameStatus.gameOver) {
        console.log(' Game ID ' + game.id + ' ended.');
        io.to(game.getWinnerId()).emit('gameover', true);
        io.to(game.getLoserId()).emit('gameover', false);
    };
};


app.post('/login', body('login').isLength({ min: 3 }).trim().escape(), (req, res) => {
    const login = req.body.login
    // Error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    else {
        // Store login
        req.session.username = login;
        req.session.ready = undefined;
        req.session.save()
        res.redirect('/');
        console.log(login + ' connected.');
    }

});
