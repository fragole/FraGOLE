/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:44:24+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var GameItem = require('./GameObject.js').GameItem;
var templates = require('../lib/FragoleTemplates.js');
var Lib = require('../lib/FragoleLib.js');

// Base-Clase for Tokens
// Tokens are shapes or images the are displayed in the clients gameboard
// canvas
//
// category: allows to create logical collections of tokens
// x,y absolute position on the gameboard
class Token extends GameItem {
    constructor (id, category='', x, y, template) {
        super(id, category);
        this.x = x;
        this.y = y;
        this.template = new template().x(x).y(y);
        this.waypoint = undefined;
    }

    // move token to a waypoint
    // standard-target => all players;
    moveToWaypoint(waypoint, use_path=true, players=undefined) {
        var wp_tpl = waypoint.template,
            path = [];

        if (use_path) {
            var s_path = Lib.getPath(this.waypoint, waypoint);
            var step = 0;
            for (let wp of s_path) {
                var p_tpl = wp.template;
                if (step == 0) {
                    this.gameController.emit('leaveWaypoint', this.id, this, wp);
                } else if (step < s_path.length-1) {
                    this.gameController.emit('passWaypoint', this.id, this, wp);
                }
                step++;
                path.push(Lib.normalizeCoordinates(this, p_tpl._x, p_tpl._y));
            }
        } else {
            path.push(Lib.normalizeCoordinates(this, wp_tpl._x, wp_tpl._y));
        }


        var cmd =['moveToken', this.id, path];

        this.waypoint = waypoint;
        this.gameController.rpcServer.connect('move_complete_' + this.id, this.moveComplete, this);
        this.gameController.rpcListOrAll(players, cmd);
    }

    // activate click-handler a Token
    // standard-target => owner
    activate(players=undefined) {
        var cmd = ['activateToken', this.id, 'click_' + this.id];

        // register callback-function in rpc-server
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // deactivate click handler for a token
    // standard-target => owner
    deactivate (players=undefined) {
        var cmd = ['deactivateToken', this.id];

        this.gameController.rpcServer.disconnect('click_' + this.id);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // visually highlight the token on client-side ('form' depends on client implementation)
    // standard-target => owner
    highlight(players=undefined) {
        var cmd = ['highlightToken', this.id];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // stop highlighting the token on client-side ('form' depends on client implementation)
    // standard-target => owner
    unhighlight(players=undefined) {
        var cmd = ['unhighlightToken', this.id];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // draw the token in the client browser
    // standard-target => all joined players
    draw(players=undefined) {
        var cmd;

        if (this.template instanceof templates.ShapeTemplate) {
            if (this.template._shape == templates.shapes.CIRCLE) {
                cmd= ['drawShape',
                    this.id,
                    this.template._shape,
                    this.template._fill,
                    this.template._stroke,
                    this.template._layer,
                    this.template._x,
                    this.template._y,
                    this.template._radius];
            }
        } else if (this.template instanceof templates.ImageTemplate) {
            cmd = ['drawImage',
                this.id,
                this.template._src,
                this.template._layer,
                this.template._x,
                this.template._y,
            ];
        }
        this.gameController.rpcListOrAll(players, cmd);
    }

    // EVENTS

    click(clientId) {
        this.gameController.emit('click', this.id, this);
    }

    // is called when the animation-tween on the client-side is completed
    // emits moveComplete & enterWaypoint Events
    moveComplete(clientId) {
        if(this.gameController.playersId[clientId] == this.gameController.activePlayer) {
            this.gameController.emit('moveComplete', this.id, this);
            this.gameController.emit('enterWaypoint', this.id, this.waypoint, this);
            //this.gameController.rpcServer.disconnect('move_complete_' + this.id);
        }
    }

}
module.exports.Token = Token;
