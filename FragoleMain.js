var FragoleServer = require('./FragoleServer.js');
var Fragole = require('./FragoleObjects.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);
var sessions = FragoleServer.sessions;

// Game definition
var gameController = new Fragole.GameController('myFirstGame', minPlayers=1);
gameController.addPlayer(new Fragole.Player('player1'));
gameController.addPlayer(new Fragole.Player('player2'));

gameController.on('joinPlayer', function (player) {player.session.setBackgroundColor('#3F3F3F');});

rpc.connect('ready', function () {
                                    var player, playerName, clientProxy;
                                    var clientIp = this.connection.eureca.remoteAddress.ip;
                                    [playerName, clientProxy] = sessions.get(clientIp);

                                    if(player = gameController.joinPlayer(playerName, clientProxy)) {
                                      console.log("Player No.", player.number, " joined:", player.name);
                                    } else {
                                      console.log("Max Players already joined!");
                                    }
                                 } );
