var FragoleServer = require('./FragoleServer.js');
var Lib = require('./FragoleLib.js');
var {Game, GameController, GameState, Player, PlayerToken, Collection,
     Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
     Progress, PlayerProgress} = require('./FragoleObjects.js');
var Lobby = require('./FragoleLobby.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);
var sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
var game = new Game();
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
    // statistics
    stat1: new Statistic('stat1', 100, 300, 'Zähler', 0, 'travel'),
    player_stat1: new PlayerStatistic('player_stat1', 'Punkte', 0, 'trophy'),
    rating1: new Rating('rating1', 100, 400, 'heart', 'WERTUNG', 3, 10),
    player_rating1: new PlayerRating('player_rating1', 'star', 'WERTUNG', 0, 10),
    progress1: new Progress('progress1', 100, 470, 'blue', 'FORTSCHRITT', 0, 10),
    player_progress1: new PlayerProgress('player_progress1', 'red', 'FORTSCHRITT', 0, 10),
};

Lib.connectWaypoints([items.wp1, items.wp2, items.wp3, items.wp4, items.wp5, items.wp7, items.wp9, items.wp10, items.wp1]);
Lib.connectWaypoints([items.wp4, items.wp6, items.wp8, items.wp9]);

// init game with all items
game.setItems(items);
controller.addPlayer(items.player1)
          .addPlayer(items.player2);

// assign player_tokens etc. to players
items.player1.addInventory(items.player_token1);
items.player1.addInventory(items.player_stat1);
items.player1.addInventory(items.player_rating1);
items.player1.addInventory(items.player_progress1);

items.player2.addInventory(items.player_token2);

var lobby = new Lobby(controller);

// *****************************************************************************
// STATE_INIT event-handlers
STATE_INIT.on('enter', function () {
    game.setupBoard();  // Setup the gameboard - draw stuff etc.
    controller.next_player();
    controller.next_state(STATE_TURN);

    items.player_token1.waypoint = items.wp1;
    items.player_token2.waypoint = items.wp1;

    items.player1.subscribe('points', items.player_stat1);
    items.player1.subscribe('points', items.player_rating1);
    items.player1.subscribe('points', items.player_progress1);
    items.player1.set('points', 0);

    controller.subscribe('counter', items.stat1);
    controller.subscribe('counter', items.rating1);
    controller.subscribe('counter', items.progress1);
    controller.set('counter', 10);
});

STATE_TURN.on('enter', function() {
    this.set('playertoken', controller.activePlayer.getInventory({category:'spielfiguren'})[0]);
    this.set('player', controller.activePlayer);
    items.dice.draw(this.get('player'));
});

STATE_TURN.on('roll', function(src, dice) {
    if(src === 'dice') {
        this.set('wps', Lib.getWaypointsAtRange(this.get('playertoken').waypoint, dice.result));
        //console.log(wps);
        items.dice.rollResult(this.get('player'));
        for (let wp of this.get('wps')) {
            wp.activate(this.get('player'));
            wp.highlight(this.get('player'));
        }
    }
});

STATE_TURN.on('click', function(src, item) {
    if (item instanceof Waypoint) {
        this.get('playertoken').moveToWaypoint(item);
        for (let wp of this.get('wps')) {
            wp.unhighlight(this.get('player'));
            wp.deactivate(this.get('player'));
        }

        var counter = controller.get('counter');
        controller.set('counter', --counter);

        var points = this.get('player').get('points');
        this.get('player').set('points', ++points);

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
});

// handle rpc-sessions
function ready() {
    var player, playerName, clientProxy;
    var clientIp = FragoleServer.localIpHelper(this.connection.eureca.remoteAddress.ip);

    try {
        [playerName, clientProxy] = sessions.get(clientIp);

        if(player = game.gameController.joinPlayer(playerName, clientProxy)) {
            console.log('Player No.', player.number, ' joined:', player.name);
            clientProxy.setBackgroundImage('/assets/background.jpg');
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
