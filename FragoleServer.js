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
    constructor( port ) {
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
        app.get('/', function( request, response ) {
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

    constructor( port ) {
        var server = http.createServer();

        this.connections = {};
        var connections = this.connections;

        this.eurecaServer = new Eureca.Server({allow:['setBackgroundColor', 'addDomContent', 'removeDomContent', 'drawShape', 'drawImage', 'activateToken', 'moveToken', 'highlightToken']});
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

}

module.exports.HTTP = HTTP;
module.exports.RPC = RPC;
module.exports.sessions = sessions;
