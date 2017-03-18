var FragoleServer = require('./FragoleServer.js');

var webServer = new FragoleServer.HTTP(80);
var rpc = new FragoleServer.RPC(81);

rpc.connect('ready', function () { this.clientProxy.setBackgroundColor('#2F3F3F', 'test'); } );

// var controller = new Fragole.GameController();
