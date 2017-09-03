/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-09-03T09:12:39+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

//  TODO documentation
// Implements a simple Webserver for delivering the Contents of the Framework
// to the connected clients
// and an RPC-Server based on Eureca.io (see http://eureca.io)
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const Eureca = require('eureca.io');
const pug = require('pug');
const path = require('path');
const PlayerModel = require('../model/player.js').PlayerModel;

let sessions = new Map();
let globalGame;

function localIpHelper(ip) {
    if(ip === '::ffff:127.0.0.1' || ip === '::1') {
        return 'localhost';
    }
    return ip;
}

class Server {
    constructor(port) {
        let app;
        app = express(app);
        this.server = http.createServer(app);
        this.rpcReferences = {};

        app.enable('trust proxy');
        app.set('views', path.join(__dirname,'../views'));
        app.set('view engine', 'pug');
        app.locals.pretty = true;

        // serve static files like css from 'public' directory
        app.use(express.static(path.join(__dirname,'../public')));
        app.use(express.static(path.join(__dirname,'../node_modules/semantic-ui-css')));

        app.use(cookieParser());

        // display index page
        app.get('/', function (request, response ) {
            let playerName;
            if (playerName = request.query['playerName']) {
                response.cookie('fragole' , playerName);
            } else if (!(playerName=request.cookies['fragole']))  {
                response.render('index_register');
                return;
            }
            sessions.set(localIpHelper(request.ip), [playerName, undefined]);
            response.render('index', {player: playerName});
        });

        app.get('/profile/:playerName', function (request, response) {
            let playerName = request.params.playerName;
            let playerStorage = new PlayerModel(playerName);
            playerStorage.refresh(() => {
                let context = {playerName : playerName,
                    statistics : playerStorage.statistics,
                    badges: playerStorage.badges};
                response.render('player_profile', context);
            });
        });
        // rpcServer
        this.connections = {};
        let connections = this.connections;

        this.eurecaServer = new Eureca.Server({allow:['setClientId', 'setBackgroundColor', 'setBackgroundImage', 'addDomContent', 'removeDomContent', 'emptyDomContent',
            'drawShape', 'drawImage', 'activateToken', 'deactivateToken', 'moveToken', 'highlightToken', 'unhighlightToken']});

        this.eurecaServer.attach(this.server);

        this.eurecaServer.onConnect ( function (connection) {
            connections[connection.id] = connection.clientProxy;

            // try to match http-session to rpc sessions
            let session;
            let clientIp = localIpHelper(connection.eureca.remoteAddress.ip);
            if (session = sessions.get(clientIp)) {
                sessions.set(clientIp, [session[0], connection]);
            }
            connection.clientProxy.setClientId(connection.id);
        });

        this.connect('ready', ready);
    }

    start(port) {
        let usePort = process.env.PORT || port;
        this.server.listen(usePort, function () {
            console.log('WebServer listening at port ' + usePort);
        });
    }

    // dynamically connect server-function to serverProxy.callserver[func]
    // available at runtime (EXPERMIMENTAL)
    connect(name, func, context=null) {
        let exportFunc;
        if (context) {
            // conserve context
            exportFunc = func.bind(context);
        } else {
            exportFunc =func;
        }
        // increase ref-counter for this function
        try {
            this.rpcReferences[name] += 1;
        } catch(e) {
            this.rpcReferences[name];
        }
        this.eurecaServer.exports[name] = exportFunc;
        // Publish new functions to all connected clients
        this.eurecaServer.updateContract(); // !!! EXPERMIMENTAL in eureca.io
    }

    disconnect(name) {
        this.rpcReferences[name] -= 1;
        // only remove the functions if function is no longer needed by any clients
        if (this.rpcReferences[name] <= 0) {
            delete this.eurecaServer.exports[name];
            // Publish new functions to all connected clients
            this.eurecaServer.updateContract(); // !!! EXPERMIMENTAL in eureca.io
            this.rpcReferences[name] = 0;
        }
    }

    setGame(game) {
        globalGame = game;
    }
}

// handle rpc-sessions
function ready() {
    let player;
    let playerName;
    let connection;
    let clientIp = localIpHelper(this.connection.eureca.remoteAddress.ip);

    try {
        [playerName, connection] = sessions.get(clientIp);

        if(player = globalGame.gameControllers[0].joinPlayer(playerName, connection)) {
            console.log('Player No.', player.number, ' joined:', player.name);
            //connection.clientProxy.setBackgroundImage('/assets/base.jpg');
        } else {
            console.log('Max Players already joined!');
        }
    } catch (e) {
        console.log(e);
        console.log('ClientIp: ', clientIp);
        console.log(sessions);
    }
}

module.exports.Server = Server;
module.exports.ready = ready;
