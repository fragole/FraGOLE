/* Implements a simple Webserver for delivering the Contents of the Framework
to the connected clients
*/
var express = require('express');
var pug = require('pug');
var path = require('path');

class GF_WebServer {
  constructor(port) {
    var app = express();

    app.set('views', './views');
    app.set('view engine', 'pug');

    // serve static files like css from 'public' directory
    app.use(express.static(path.join(__dirname,'public')));
    app.use(express.static(path.join(__dirname,'semantic/dist')));

    // display index page
    app.get('/', function(request, response) {
      response.render('index');
    });

    app.listen(port, function() {
      console.log("GF_WebServer listening at port " + port)
    });
  }
}

module.exports = GF_WebServer;
