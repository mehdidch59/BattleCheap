// Établir la connexion avec Socket.IO
const socket = io();

// Configuration du jeu
const GRID_SIZE = 10; // 10x10 grille
const CELL_SIZE = 30; // 30px par cellule
const SHIPS = [
    { name: 'Porte-avions', size: 5, color: '#FF5733' },
    { name: 'Croiseur', size: 4, color: '#33A8FF' },
    { name: 'Contre-torpilleur', size: 3, color: '#33FF57' },
    { name: 'Sous-marin', size: 3, color: '#A833FF' },
    { name: 'Torpilleur', size: 2, color: '#FFD733' }
];

// État du jeu
let gameState = {
    playerGrid: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)),
    opponentGrid: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)),
    playerShips: [],
    phase: 'placement', // 'placement', 'playing', 'gameOver'
    playerTurn: false,
    roomId: null
};

// Valeurs des cellules
// 0 = eau (non touché)
// 1 = bateau (non touché)
// 2 = eau (touché) = miss
// 3 = bateau (touché) = hit

// Éléments du DOM
const waitingRoom = document.getElementById('waiting-room');
const createBtn = document.getElementById('create-btn');
const roomCodeContainer = document.querySelector('.room-code-container');
const roomCode = document.getElementById('room-code');
const joinCodeInput = document.getElementById('join-code');
const joinBtn = document.getElementById('join-btn');
const statusMessage = document.querySelector('.status-message');
const gameContainer = document.getElementById('game-container');
const gameStatus = document.getElementById('game-status');
const myGrid = document.getElementById('my-grid');
const opponentGrid = document.getElementById('opponent-grid');
const myGridCtx = myGrid ? myGrid.getContext('2d') : null;
const opponentGridCtx = opponentGrid ? opponentGrid.getContext('2d') : null;
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send');
const leaveGameBtn = document.getElementById('leave-game');

// Initialisation des canvas si présents
if (myGrid && opponentGrid) {
    myGrid.width = opponentGrid.width = GRID_SIZE * CELL_SIZE;
    myGrid.height = opponentGrid.height = GRID_SIZE * CELL_SIZE;
}

// Couleurs
const COLORS = {
    grid: '#182b3a',
    water: '#64b5f6',
    ship: '#455a64',
    miss: '#e0e0e0',
    hit: '#f44336',
    hover: 'rgba(255, 255, 255, 0.3)'
};

// Initialisation du jeu
function initGame() {
    if (myGridCtx && opponentGridCtx) {
        drawGrid(myGridCtx);
        drawGrid(opponentGridCtx);
    }
    setupEventListeners();
}

// Dessiner la grille
function drawGrid(ctx) {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Fond de la grille
    ctx.fillStyle = COLORS.water;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Lignes de la grille
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    
    // Lignes horizontales
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(ctx.canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Lignes verticales
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, ctx.canvas.height);
        ctx.stroke();
    }
}

// Mettre à jour la grille du joueur
function updatePlayerGrid() {
    if (!myGridCtx) return;
    
    drawGrid(myGridCtx);
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = gameState.playerGrid[y][x];
            
            if (cell === 1) {
                // Bateau non touché
                myGridCtx.fillStyle = COLORS.ship;
                myGridCtx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            } else if (cell === 2) {
                // Eau touchée (miss)
                myGridCtx.fillStyle = COLORS.miss;
                myGridCtx.beginPath();
                myGridCtx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 6, 0, 2 * Math.PI);
                myGridCtx.fill();
            } else if (cell === 3) {
                // Bateau touché (hit)
                myGridCtx.fillStyle = COLORS.ship;
                myGridCtx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                
                myGridCtx.fillStyle = COLORS.hit;
                myGridCtx.beginPath();
                myGridCtx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, 2 * Math.PI);
                myGridCtx.fill();
            }
        }
    }
}

// Mettre à jour la grille de l'adversaire
function updateOpponentGrid() {
    if (!opponentGridCtx) return;
    
    drawGrid(opponentGridCtx);
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = gameState.opponentGrid[y][x];
            
            if (cell === 2) {
                // Eau touchée (miss)
                opponentGridCtx.fillStyle = COLORS.miss;
                opponentGridCtx.beginPath();
                opponentGridCtx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 6, 0, 2 * Math.PI);
                opponentGridCtx.fill();
            } else if (cell === 3) {
                // Bateau touché (hit)
                opponentGridCtx.fillStyle = COLORS.hit;
                opponentGridCtx.beginPath();
                opponentGridCtx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, 2 * Math.PI);
                opponentGridCtx.fill();
            }
        }
    }
}

// Placer un bateau sur la grille du joueur
function placeShip(x, y, size, isHorizontal = true) {
    // Vérifier si le placement est valide
    if (isValidPlacement(x, y, size, isHorizontal)) {
        const ship = {
            x, y, size, isHorizontal,
            hits: 0
        };
        
        gameState.playerShips.push(ship);
        
        // Mettre à jour la grille
        if (isHorizontal) {
            for (let i = 0; i < size; i++) {
                gameState.playerGrid[y][x + i] = 1;
            }
        } else {
            for (let i = 0; i < size; i++) {
                gameState.playerGrid[y + i][x] = 1;
            }
        }
        
        updatePlayerGrid();
        return true;
    }
    
    return false;
}

// Vérifier si le placement d'un bateau est valide
function isValidPlacement(x, y, size, isHorizontal) {
    // Vérifier si le bateau dépasse de la grille
    if (isHorizontal) {
        if (x + size > GRID_SIZE) return false;
    } else {
        if (y + size > GRID_SIZE) return false;
    }
    
    // Vérifier si le bateau chevauche un autre bateau ou est adjacent à un autre bateau
    for (let i = -1; i <= size; i++) {
        for (let j = -1; j <= 1; j++) {
            const checkX = isHorizontal ? x + i : x + j;
            const checkY = isHorizontal ? y + j : y + i;
            
            // Ignorer les coordonnées hors grille
            if (checkX < 0 || checkX >= GRID_SIZE || checkY < 0 || checkY >= GRID_SIZE) continue;
            
            // Si une case est déjà occupée
            if (i >= 0 && i < size) {
                const cellX = isHorizontal ? x + i : x;
                const cellY = isHorizontal ? y : y + i;
                
                if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
                    if (gameState.playerGrid[cellY][cellX] === 1) return false;
                }
            }
            
            // Vérifier l'adjacence (option plus stricte)
            // if (gameState.playerGrid[checkY][checkX] === 1) return false;
        }
    }
    
    return true;
}

// Placer automatiquement tous les bateaux (pour test ou option de placement rapide)
function autoPlaceShips() {
    // Réinitialiser la grille et les bateaux
    gameState.playerGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    gameState.playerShips = [];
    
    // Placer chaque bateau
    for (const ship of SHIPS) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const isHorizontal = Math.random() > 0.5;
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            
            placed = placeShip(x, y, ship.size, isHorizontal);
            attempts++;
        }
        
        // Si on n'a pas réussi à placer un bateau après plusieurs tentatives
        if (!placed) {
            console.error("Impossible de placer le bateau de taille " + ship.size);
            return false;
        }
    }
    
    updatePlayerGrid();
    console.log("Tous les bateaux ont été placés avec succès");
    return true;
}

// Tirer sur la grille adverse
function fireShot(x, y) {
    if (gameState.playerTurn && gameState.phase === 'playing') {
        socket.emit('fire', { x, y });
        gameState.playerTurn = false;
        updateGameStatus();
    }
}

// Mettre à jour le message de statut du jeu
function updateGameStatus() {
    if (!gameStatus) return;
    
    if (gameState.phase === 'placement') {
        gameStatus.className = 'alert alert-waiting';
        gameStatus.textContent = 'Placez vos bateaux...';
    } else if (gameState.phase === 'waiting') {
        gameStatus.className = 'alert alert-waiting';
        gameStatus.textContent = 'En attente d\'un adversaire...';
    } else if (gameState.phase === 'playing') {
        if (gameState.playerTurn) {
            gameStatus.className = 'alert alert-your-turn';
            gameStatus.textContent = 'À vous de jouer!';
        } else {
            gameStatus.className = 'alert alert-opponent-turn';
            gameStatus.textContent = 'Au tour de l\'adversaire...';
        }
    } else if (gameState.phase === 'gameOver') {
        if (gameState.winner) {
            gameStatus.className = 'alert alert-winner';
            gameStatus.textContent = 'Victoire! Vous avez gagné!';
        } else {
            gameStatus.className = 'alert alert-loser';
            gameStatus.textContent = 'Défaite! Vous avez perdu.';
        }
    }
}

// Ajouter un message dans le chat
function addChatMessage(sender, message) {
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    
    const senderElement = document.createElement('span');
    senderElement.className = 'chat-sender';
    senderElement.textContent = sender + ': ';
    
    const textElement = document.createElement('span');
    textElement.className = 'chat-text';
    textElement.textContent = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(textElement);
    chatMessages.appendChild(messageElement);
    
    // Scroll en bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ajouter une notification dans le chat
function addNotification(message) {
    if (!chatMessages) return;
    
    const notificationElement = document.createElement('div');
    notificationElement.className = 'chat-notification';
    notificationElement.textContent = message;
    
    chatMessages.appendChild(notificationElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Générer un code de salle aléatoire
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Bouton de création de salle
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const newRoomCode = generateRoomCode();
            socket.emit('createRoom', newRoomCode);
            gameState.roomId = newRoomCode;
            
            // Afficher le code de salle et attendre un autre joueur
            roomCode.textContent = newRoomCode;
            roomCodeContainer.style.display = 'block';
            createBtn.disabled = true;
            
            console.log("Salle créée avec le code: " + newRoomCode);
        });
    }
    
    // Bouton pour rejoindre une partie
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const code = joinCodeInput.value.trim().toUpperCase();
            if (code) {
                socket.emit('joinRoom', code);
            }
        });
    }
    
    // Touche Entrée pour rejoindre une partie
    if (joinCodeInput) {
        joinCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBtn.click();
            }
        });
    }
    
    // Événement de clic sur la grille de l'adversaire
    if (opponentGrid) {
        opponentGrid.addEventListener('click', (e) => {
            if (gameState.phase !== 'playing' || !gameState.playerTurn) return;
            
            const rect = opponentGrid.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
            const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
            
            // Vérifier qu'on n'a pas déjà tiré à cet emplacement
            if (gameState.opponentGrid[y][x] === 0 || gameState.opponentGrid[y][x] === 1) {
                fireShot(x, y);
            }
        });
    
        // Effet de survol sur la grille adverse
        opponentGrid.addEventListener('mousemove', (e) => {
            if (gameState.phase !== 'playing' || !gameState.playerTurn) return;
            
            const rect = opponentGrid.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
            const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
            
            updateOpponentGrid();
            
            // Afficher un indicateur de survol seulement sur les cellules non encore ciblées
            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE &&
                (gameState.opponentGrid[y][x] === 0 || gameState.opponentGrid[y][x] === 1)) {
                opponentGridCtx.fillStyle = COLORS.hover;
                opponentGridCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        });
        
        // Réinitialiser l'affichage lorsque la souris quitte la grille
        opponentGrid.addEventListener('mouseleave', () => {
            updateOpponentGrid();
        });
    }
    
    // Envoi d'un message de chat
    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                socket.emit('chat', message);
                chatInput.value = '';
            }
        });
        
        // Touche Entrée pour envoyer un message
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                chatSendBtn.click();
            }
        });
    }
    
    // Quitter la partie
    if (leaveGameBtn) {
        leaveGameBtn.addEventListener('click', () => {
            socket.emit('leaveGame');
            resetGame();
        });
    }
}

// Réinitialiser le jeu
function resetGame() {
    gameState = {
        playerGrid: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)),
        opponentGrid: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)),
        playerShips: [],
        phase: 'placement',
        playerTurn: false,
        roomId: null
    };
    
    if (waitingRoom) waitingRoom.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
    if (chatMessages) chatMessages.innerHTML = '';
    updateGameStatus();
    if (myGridCtx) drawGrid(myGridCtx);
    if (opponentGridCtx) drawGrid(opponentGridCtx);
    
    // Réinitialiser l'interface de création de salle
    if (createBtn) createBtn.disabled = false;
    if (roomCodeContainer) roomCodeContainer.style.display = 'none';
    if (joinCodeInput) joinCodeInput.value = '';
}

// Gérer les événements de Socket.IO
socket.on('connect', () => {
    console.log('Connecté au serveur');
});

socket.on('roomCreated', (roomId) => {
    console.log('Salle créée avec succès: ' + roomId);
    statusMessage.textContent = "En attente d'un adversaire...";
});

socket.on('playerJoined', (data) => {
    console.log('Un joueur a rejoint votre salle: ' + data.username);
    
    // Stocker l'ID de salle que le serveur nous transmet
    gameState.roomId = data.roomId;
    console.log('ID de salle stocké: ' + gameState.roomId);
    
    // Transition vers l'écran de jeu
    waitingRoom.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Initialiser les grilles
    gameState.phase = 'placement';
    updateGameStatus();
    
    // Placer automatiquement les bateaux pour le test
    if (autoPlaceShips()) {
        socket.emit('ready');
        gameState.phase = 'waiting';
        updateGameStatus();
    }
    
    addNotification(data.username + ' a rejoint la partie!');
});

socket.on('roomJoined', (data) => {
    console.log('Salle rejointe avec succès: ' + data.roomId);
    gameState.roomId = data.roomId;
    
    // Transition vers l'écran de jeu
    waitingRoom.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Initialiser les grilles
    gameState.phase = 'placement';
    updateGameStatus();
    
    // Placer automatiquement les bateaux pour le test (à remplacer par l'interface de placement)
    if (autoPlaceShips()) {
        socket.emit('ready');
        gameState.phase = 'waiting';
        updateGameStatus();
    }
});

socket.on('gameStart', (isFirstPlayer) => {
    gameState.phase = 'playing';
    gameState.playerTurn = isFirstPlayer;
    updateGameStatus();
    addNotification('La partie commence!');
});

socket.on('roomNotFound', () => {
    alert('Salle introuvable. Vérifiez le code.');
});

socket.on('roomFull', () => {
    alert('Cette salle est déjà pleine.');
});

socket.on('shotResult', (data) => {
    const { x, y, hit, sunk, gameOver, winner } = data;
    
    if (data.player === 'opponent') {
        // Résultat du tir adverse sur notre grille
        gameState.playerGrid[y][x] = hit ? 3 : 2;
        updatePlayerGrid();
        
        if (sunk) {
            addNotification('Votre adversaire a coulé votre ' + SHIPS[data.shipIndex].name + '!');
        }
    } else {
        // Résultat de notre tir sur la grille adverse
        gameState.opponentGrid[y][x] = hit ? 3 : 2;
        updateOpponentGrid();
        
        if (hit) {
            addNotification('Touché!');
            if (sunk) {
                addNotification('Vous avez coulé le ' + SHIPS[data.shipIndex].name + ' adverse!');
            }
        } else {
            addNotification('Manqué!');
        }
        
        gameState.playerTurn = true;
        updateGameStatus();
    }
    
    if (gameOver) {
        gameState.phase = 'gameOver';
        gameState.winner = winner === socket.id;
        updateGameStatus();
    }
});

socket.on('playerDisconnected', () => {
    addNotification('Votre adversaire s\'est déconnecté!');
    resetGame();
});

socket.on('chat', (data) => {
    addChatMessage(data.sender, data.message);
});

// Initialiser le jeu au chargement
window.onload = initGame;
