var FragoleServer = require('./FragoleServer.js');
var Lib = require('./FragoleLib.js');
var {GameController, GameState, Player, PlayerToken, Collection, Waypoint, Dice} = require('./FragoleObjects.js');
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
var controller = new GameController('game_controller1', 1, rpc);

game.setName('TestGame')
    .setController(controller);

// STATES
var STATE_INIT = new GameState('STATE_INIT');
var STATE_TURN = new GameState('STATE_TURN');

// *****************************************************************************
// collection of all game items
var items = {
    // Players
    player1: new Player('player1'),
    player2: new Player('player2'),
    // Waypoints
    wp1: new Waypoint('wp1', 'wegpunkte', 100, 100),
    wp2: new Waypoint('wp2', 'wegpunkte', 200, 100),
    wp3: new Waypoint('wp3', 'wegpunkte', 300, 150),
    wp4: new Waypoint('wp4', 'wegpunkte', 400, 200),
    wp5: new Waypoint('wp5', 'wegpunkte', 500, 250),
    wp6: new Waypoint('wp6', 'wegpunkte', 500, 150),
    wp7: new Waypoint('wp7', 'wegpunkte', 600, 250),
    wp8: new Waypoint('wp8', 'wegpunkte', 600, 150),
    wp9: new Waypoint('wp9', 'wegpunkte', 700, 200),
    wp10: new Waypoint('w10', 'wegpunkte', 800, 200),

    coll1: new Collection('collection1'),
    // player tokens
    player_token1: new PlayerToken('player_token1', 'spielfiguren', 100, 100),
    player_token2: new PlayerToken('player_token2', 'spielfiguren', 85, 50),
    // dice
    dice: new Dice('dice', 6),
};

Lib.connectWaypoints([items.wp1, items.wp2, items.wp3, items.wp4, items.wp5, items.wp7, items.wp9, items.wp10, items.wp1]);
Lib.connectWaypoints([items.wp4, items.wp6, items.wp8, items.wp9]);

// init game with all items
game.setItems(items);
controller.addPlayer(items.player1)
                   .addPlayer(items.player2);

// assign player_tokens to players
items.player1.addInventory(items.player_token1);
items.player2.addInventory(items.player_token2);

var lobby = new Lobby();

// *****************************************************************************
// STATE_INIT event-handlers
STATE_INIT.on('enter', function () {
    game.setupBoard();  // Setup the gameboard - draw stuff etc.
    controller.next_player();
    controller.next_state(STATE_TURN);
    items.player_token1.waypoint = items.wp1;
    items.player_token2.waypoint = items.wp1;
});

STATE_TURN.on('enter', function() {
    this.set('playertoken', controller.activePlayer.getInventory({category:'spielfiguren'})[0]);
    this.set('player', controller.activePlayer);
    RPC_ONE(this.get('player'), items.dice.draw());
});

// Eventhandler for clientside click on player_token1
STATE_TURN.on('click', function(src, item) {
    console.log('STATE_INIT click ' + src);
});

STATE_TURN.on('roll', function(src, dice) {
    if(src === 'dice') {
        this.set('wps', Lib.getWaypointsAtRange(this.get('playertoken').waypoint, dice.result));
        //console.log(wps);
        RPC_ONE(this.get('player'), items.dice.rollResult());
        for (let wp of this.get('wps')) {
            RPC_ONE(this.get('player'), wp.activate());
            RPC_ONE(this.get('player'), wp.highlight());
        }
    }
});

STATE_TURN.on('click', function(src, item) {
    if (item instanceof Waypoint) {
        RPC_ALL(this.get('playertoken').moveToWaypoint(item));
        for (let wp of this.get('wps')) {
            RPC_ONE(this.get('player'), wp.unhighlight());
            RPC_ONE(this.get('player'), wp.deactivate());
        }
        controller.next_player();
        controller.next_state(STATE_TURN);
    }
});

STATE_TURN.on('exit', function() {
    items.dice.reset();
});
// *****************************************************************************

// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', function (player) { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', function () {
    lobby.quit();
    console.log('all players ready');
    controller.next_state(STATE_INIT);
    items.coll1.addItem(items.player1);
});

// handle rpc-sessions
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
