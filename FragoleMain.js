var FragoleServer = require('./FragoleServer.js');
var Fragole = require('./FragoleObjects.js');
var Lobby = require('./FragoleLobby.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);
var sessions = FragoleServer.sessions;

// Game definitionv
gameController.setName('TestGame')
              .setMinPlayers(1)
              .setRpcServer(rpc);

var lobby = new Lobby();
gameController.addPlayer(new Fragole.Player('player1'))
              .addPlayer(new Fragole.Player('player2'));

var STATE_INIT = new Fragole.GameState('STATE_INIT');
STATE_INIT.on('enter', function () {
    var wp = new Fragole.Waypoint('test', 'wegpunkte', 30, 30);
    wp.template.fill('grey');
    RPC_ALL(...wp.draw());
});

gameController.on('joinPlayer', function (player) { lobby.joinPlayer(player);});

lobby.on('allPlayersReady', function () {
    lobby.quit();
    console.log('all players ready');
    gameController.next_state(STATE_INIT);
});

function ready(rpc) {
    var player, playerName, clientProxy;
    var clientIp = rpc.connection.eureca.remoteAddress.ip;
    try {
        [playerName, clientProxy] = sessions.get(clientIp);

        if(player = gameController.joinPlayer(playerName, clientProxy)) {
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
