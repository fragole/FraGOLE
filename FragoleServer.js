/* Implements a simple Webserver for delivering the Contents of the Framework
to the connected clients
*/
var express = require('express');
var cookieParser = require('cookie-parser');
var http = require('http');
var Eureca = require('eureca.io');
var pug = require('pug');
var path = require('path');

var sessions = new Map();

class HTTP {
    constructor(port) {
        var app = express(app);
        app.enable('trust proxy');
        app.set('views', './views');
        app.set('view engine', 'pug');
        app.locals.pretty = true;

        // serve static files like css from 'public' directory
        app.use(express.static(path.join(__dirname,'public')));
        app.use(express.static(path.join(__dirname,'semantic/dist')));

        app.use(cookieParser());

        // display index page
        app.get('/', function(request, response) {
            var playername;
            if (playername = request.query['playername']) {
                response.cookie('fragole' , playername);
            } else if (!(playername=request.cookies['fragole']))  {
                response.render('index_register');
                return;
            }
            sessions.set(request.ip, [playername, undefined]);
            response.render('index');
        });

        app.listen(port, function() {
            console.log('WebServer listening at port ' + port);
        });
    }
}

var contexts = {};

class RPC {

    constructor(port) {
        var server = http.createServer();

        this.connections = {};
        var connections = this.connections;

        this.eurecaServer = new Eureca.Server({allow:['setBackgroundColor', 'addDomContent', 'removeDomContent', 'drawShape']});
        this.eurecaServer.attach(server);

        this.eurecaServer.onConnect ( function (connection) {
            connections[connection.id] = connection.clientProxy;

            // try to match http-session to rpc sessions
            var session;
            var clientIp = connection.eureca.remoteAddress.ip;
            if (session = sessions.get(clientIp)) {
                sessions.set(clientIp, [session[0], connection.clientProxy]);
            }
        });

        server.listen(port, function() {
            console.log('RPC listening at port ' + port);
        });
    }

    connect(name, func, context=null) {
        if (context) {
            contexts[name] = context;
        }
        this.eurecaServer.exports[name] = function(context) {
            if(contexts[context]) {
                var args = Array.prototype.slice.call(arguments, 1);
                contexts[context][context](this, ...args);
            } else {
                func(this, ...arguments);
            }
        };
    }
}

module.exports.HTTP = HTTP;
module.exports.RPC = RPC;
module.exports.sessions = sessions;
