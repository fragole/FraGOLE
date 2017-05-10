var FragoleServer = require('./FragoleServer.js');
var {GameController, GameState, Player, PlayerToken, Collection, Waypoint} = require('./FragoleObjects.js');
var Lobby = require('./FragoleLobby.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);
var sessions = FragoleServer.sessions;

// glabals
var game = global.game;
var RPC_ALL = global.RPC_ALL;
var RPC_ONE = global.RPC_ONE;

// ****************************************************************************
// Game definition
var gameController = new GameController('game_controller1', 1, rpc);

game.setName('TestGame')
    .setController(gameController);

// STATES
var STATE_INIT = new GameState('STATE_INIT');

// *****************************************************************************
// collection of all game items
var all_game_items = {
    // Players
    player1: new Player('player1'),
    player2: new Player('player2'),
    // Waypoints
    wp1: new Waypoint('wp1', 'wegpunkte', 100, 100),
    wp2: new Waypoint('wp2', 'wegpunkte', 200, 100),
    wp3: new Waypoint('wp3', 'wegpunkte', 200, 200),
    coll1: new Collection('collection1'),
    // player tokens
    player_token1: new PlayerToken('player_token1', 'spielfiguren', 100, 100),
    player_token2: new PlayerToken('player_token2', 'spielfiguren', 85, 50),
};

// init game with all items
game.setItems(all_game_items);
game.gameController.addPlayer(all_game_items.player1)
                   .addPlayer(all_game_items.player2);

// assign player_tokens to players
all_game_items.player1.addInventory(all_game_items.player_token1);
all_game_items.player2.addInventory(all_game_items.player_token2);

var lobby = new Lobby();

// *****************************************************************************
// STATE_INIT event-handlers
STATE_INIT.on('enter', function () {
    all_game_items.wp1.template.fill('grey');
    all_game_items.wp2.template.fill('blue').stroke('grey');
    all_game_items.wp3.template.fill('lightgreen').stroke('grey');
    game.setupBoard();
    RPC_ONE(all_game_items.player1, ...all_game_items.player_token1.activate());
});

STATE_INIT.on('addItem', function (src, item) {
    if (src == 'collection1') {
        console.log('STATE_INIT addItem ' + item.id + ' from ' + src);
    }
});

STATE_INIT.on('click', function(src, item) {
    console.log('STATE_INIT click ' + src);
    RPC_ALL('moveToken', 'player_token1', [{x:168, y:68}, {x:168, y:168}, {x:68, y:68}]);
});
// *****************************************************************************

// *****************************************************************************
// Game-Lobby
game.gameController.on( 'joinPlayer', function (player) { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', function () {
    lobby.quit();
    console.log('all players ready');
    game.gameController.next_state(STATE_INIT);
    all_game_items.coll1.addItem(all_game_items.player1);
});

function ready() {
    var player, playerName, clientProxy;
    var clientIp = this.connection.eureca.remoteAddress.ip;
    try {
        [playerName, clientProxy] = sessions.get(clientIp);

        if(player = game.gameController.joinPlayer(playerName, clientProxy)) {
            console.log('Player No.', player.number, ' joined:', player.name);
        } else {
            console.log('Max Players already joined!');
        }
    } catch (e) {
        console.log(e);
        console.log('ClientIp: ', clientIp);
        console.log(sessions);
    }
}


rpc.connect('ready', ready);
