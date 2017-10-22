/**
 * @Author: Michael Bauer
 * @Date:   2017-08-31T10:25:41+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-10-22T08:44:04+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const FragoleServer = require('./lib/FragoleServer.js');
const Lib = require('./lib/FragoleLib.js');
const {Game, GameController, GameState, Player, PlayerToken, Collection,
        Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
        Progress, PlayerProgress, Prompt, Question, Card, CardStack, CardHand, Button} = require('./objects/FragoleObjects.js');
const Lobby = require('./lib/FragoleLobby.js');
const Templates = require('./lib/FragoleTemplates.js');

let server = new FragoleServer.Server();
let sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
let game = new Game();
let controller = new GameController('game_controller1', 1, server);

game.setName('Boilerplate')
     .addController(controller);
server.setGame(game);
server.start(80);

 // Game States
let STATE_INIT = new GameState('STATE_INIT');

// Player Objects
let players = {player1: new Player('Player1')};

// Create a Token for each player
let tokens = {playerToken1: new PlayerToken('PlayerToken1', 'playertokens', 300, 50),};

// add (potential) players to the gameController
game.gameControllers[0].addPlayer(players.player1);

// create Lobby
let lobby = new Lobby(controller);

// STATE_INIT event-handlers
STATE_INIT.setHandlers({
    enter:  (src) => {
        // init the controller with all items
        src.addItems(players);
        src.addItems(tokens);

        // init player inventories
        let items = src.items;
        items.player1.addInventoryEx([items.playerToken1]);

        src.setupBoard();
    },
});


// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', (player) => { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', () => {
    lobby.quit();
    console.log('all players ready');
    controller.nextState(STATE_INIT);
});
