var FragoleServer = require('./FragoleServer.js');
var Fragole = require('./FragoleObjects.js');
var Lobby = require('./FragoleLobby.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);
var sessions = FragoleServer.sessions;

// Game definitionv
var gameController = new Fragole.GameController('game_controller1', 1, rpc);

game.setName('TestGame')
    .setController(gameController);

// STATES
var STATE_INIT = new Fragole.GameState('STATE_INIT');

var all_game_items = {
    // Players
    player1: new Fragole.Player('player1'),
    player2: new Fragole.Player('player2'),
    // Waypoints
    wp1: new Fragole.Waypoint('test', 'wegpunkte', 30, 30),
    coll1: new Fragole.Collection('collection1'),
};

game.setItems(all_game_items);
game.gameController.addPlayer(all_game_items.player1)
                   .addPlayer(all_game_items.player2);

var lobby = new Lobby();

// STATE_INIT event-handlers
STATE_INIT.on('enter', function () {
    all_game_items.wp1.template.fill('grey'),
    RPC_ALL(...all_game_items.wp1.draw());
});

STATE_INIT.on('addItem', function (src, item) {
    if (src == 'collection1') {
        console.log('STATE_INIT addItem ' + item.id + ' from ' + src);
    }
});

game.gameController.on('joinPlayer', function (player) { lobby.joinPlayer(player);});

lobby.on('allPlayersReady', function () {
    lobby.quit();
    console.log('all players ready');
    game.gameController.next_state(STATE_INIT);
    all_game_items.coll1.addItem(all_game_items.player1);
});

function ready(rpc) {
    var player, playerName, clientProxy;
    var clientIp = rpc.connection.eureca.remoteAddress.ip;
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

// xxx rpc disconnect
