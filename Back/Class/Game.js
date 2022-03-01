var Player = require('./player.js');
var Settings = require('./settings.js');
var GameStatus = require('./gameStatus.js');

/**
 * BattleCheap constructor
 * @param {type} idPlayer1 Socket ID du soldat 1
 * @param {type} idPlayer2 Socket ID du soldat 2
 */
function BattleCheapGame(idPlayer1, idPlayer2) {
  this.currentPlayer = Math.floor(Math.random() * 2);
  this.winningPlayer = null;
  this.gameStatus = GameStatus.inProgress;

  this.players = [new Player(idPlayer1), new Player(idPlayer2)];
}

/**
 * Obtient le socket ID pour les joueurs
 * @param {type} player
 * @returns {undefined}
 */
BattleCheapGame.prototype.getPlayerId = function(player) {
  return this.players[player].id;
};

/**
 * Reçoit le socket ID du joueur gagné
 * @returns {BattleCheapGame.prototype@arr;players@pro;id}
 */
BattleCheapGame.prototype.getWinnerId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  return this.players[this.winningPlayer].id;
};

/**
 * Obtient le socket ID du joueur perdu
 * @returns {BattleCheapGame.prototype@arr;players@pro;id}
 */
BattleCheapGame.prototype.getLoserId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  var loser = this.winningPlayer === 0 ? 1 : 0;
  return this.players[loser].id;
};

/**
 * Switch les tours
 */
BattleCheapGame.prototype.switchPlayer = function() {
  this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
};

/**
 * Interrompt le jeu
 * @param {Number} player
 */
BattleCheapGame.prototype.abortGame = function(player) {
  // Le soldat gagne
  this.gameStatus = GameStatus.gameOver;
  this.winningPlayer = player === 0 ? 1 : 0;
}

/**
 * Tir pour le joueur actuel
 * @param {Object} position avec x et y
 * @returns {boolean} True si le tire touche
 */
BattleCheapGame.prototype.shoot = function(position) {
  var opponent = this.currentPlayer === 0 ? 1 : 0,
      gridIndex = position.y * Settings.gridCols + position.x;

  if(this.players[opponent].shots[gridIndex] === 0 && this.gameStatus === GameStatus.inProgress) {
    // On n'a pas encore tiré sur ce carré.
    if(!this.players[opponent].shoot(gridIndex)) {
      // Manqué
      this.switchPlayer();
    }

    // Check si la game est finie
    if(this.players[opponent].getShipsLeft() <= 0) {
      this.gameStatus = GameStatus.gameOver;
      this.winningPlayer = opponent === 0 ? 1 : 0;
    }
    
    return true;
  }

  return false;
};

/**
 * Obtenir la mise à jour de l'état du jeu (pour une grille).
 * @param {Number} player Joueur qui reçoit cette mise à jour
 * @param {Number} gridOwner Joueur dont l'état de la grille doit être mis à jour
 * @returns {BattleCheapGame.prototype.getGameState.BattleCheapGameAnonym$0}
 */
BattleCheapGame.prototype.getGameState = function(player, gridOwner) {
  return {
    turn: this.currentPlayer === player,                 // C'est le tour de ce joueur ?
    gridIndex: player === gridOwner ? 0 : 1,             // Quelle grille doit être mise à jour ? (0 = ma grille, 1 = adversaire)
    grid: this.getGrid(gridOwner, player !== gridOwner)  // Cacher les navires non coulés s'il ne s'agit pas de sa propre grille
  };
};

/**
 * Obtenez une grille avec des navires pour un joueur.
 * @param {type} player Quelle grille de joueur obtenir
 * @param {type} hideShips Cacher les navires non coulé
 * @returns {BattleCheapGame.prototype.getGridState.BattleCheapGameAnonym$0}
 */
BattleCheapGame.prototype.getGrid = function(player, hideShips) {
  return {
    shots: this.players[player].shots,
    ships: hideShips ? this.players[player].getSunkShips() : this.players[player].ships
  };
};

module.exports = BattleCheapGame;