/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:52:22+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

// Implements a simple Webserver for delivering the Contents of the Framework
// to the connected clients
// and an RPC-Server based on Eureca.io (see http://eureca.io)
var express = require('express');
var cookieParser = require('cookie-parser');
var http = require('http');
var Eureca = require('eureca.io');
var pug = require('pug');
var path = require('path');
const PlayerModel = require('../model/player.js').PlayerModel;

var sessions = new Map();
var globalGame;

function localIpHelper(ip) {
    if(ip=='::ffff:127.0.0.1' || ip=='::1') {
        return 'localhost';
    }
    return ip;
}

class SERVER {
    constructor( port ) {
        var app = express(app);
        this.server = http.createServer(app);

        app.enable('trust proxy');
        app.set('views', path.join(__dirname,'../views'));
        app.set('view engine', 'pug');
        app.locals.pretty = true;

        // serve static files like css from 'public' directory
        app.use(express.static(path.join(__dirname,'../public')));
        app.use(express.static(path.join(__dirname,'../semantic/dist')));

        app.use(cookieParser());

        // display index page
        app.get('/', function( request, response ) {
            var playername;
            if (playername = request.query['playername']) {
                response.cookie('fragole' , playername);
            } else if (!(playername=request.cookies['fragole']))  {
                response.render('index_register');
                return;
            }
            sessions.set(localIpHelper(request.ip), [playername, undefined]);
            response.render('index', {player: playername});
        });

        app.get('/profile/:player_name', function( request, response) {
            var player_name = request.params.player_name;
            var player_storage = new PlayerModel(player_name);
            player_storage.refresh(() => {
                var context = {player_name : player_name,
                    statistics : player_storage.statistics,
                    badges: player_storage.badges};
                response.render('player_profile', context);
            });
        });
        // rpcServer
        this.connections = {};
        var connections = this.connections;

        this.eurecaServer = new Eureca.Server({allow:['setClientId', 'setBackgroundColor', 'setBackgroundImage', 'addDomContent', 'removeDomContent', 'emptyDomContent',
            'drawShape', 'drawImage', 'activateToken', 'deactivateToken', 'moveToken', 'highlightToken', 'unhighlightToken']});

        this.eurecaServer.attach(this.server);

        this.eurecaServer.onConnect ( function (connection) {
            connections[connection.id] = connection.clientProxy;

            // try to match http-session to rpc sessions
            var session;
            var clientIp = localIpHelper(connection.eureca.remoteAddress.ip);
            if (session = sessions.get(clientIp)) {
                sessions.set(clientIp, [session[0], connection]);
            }
            connection.clientProxy.setClientId(connection.id);
        });

        this.connect('ready', ready);
    }

    start(port) {
        this.server.listen(process.env.PORT || port, function() {
            console.log('WebServer listening at port ' + port);
        });
    }

    // dynamically connect server-function to serverProxy.callserver[func]
    // available at runtime (EXPERMIMENTAL)
    connect( name, func, context=null ) {
        var export_func;
        if (context) {
            // conserve context
            export_func = func.bind(context);
        } else {
            export_func =func;
        }
        this.eurecaServer.exports[name] = export_func;
        // Publish new functions to all connected clients
        this.eurecaServer.updateContract(); // !!! EXPERMIMENTAL in eureca.io
    }

    disconnect(name) {
        delete this.eurecaServer.exports[name];
        // Publish new functions to all connected clients
        this.eurecaServer.updateContract(); // !!! EXPERMIMENTAL in eureca.io
    }

    setGame(game) {
        globalGame = game;
    }
}

// handle rpc-sessions
function ready() {
    var player, playerName, connection;
    var clientIp = localIpHelper(this.connection.eureca.remoteAddress.ip);

    try {
        [playerName, connection] = sessions.get(clientIp);

        if(player = globalGame.gameControllers[0].joinPlayer(playerName, connection)) {
            console.log('Player No.', player.number, ' joined:', player.name);
            connection.clientProxy.setBackgroundImage('/assets/base.jpg');
        } else {
            console.log('Max Players already joined!');
        }
    } catch (e) {
        console.log(e);
        console.log('ClientIp: ', clientIp);
        console.log(sessions);
    }
}


module.exports.SERVER = SERVER;
module.exports.ready = ready;
