var GameItem = require('./GameObject.js').GameItem;
var nomalizeCoordinates = require('../FragoleLib.js').nomalizeCoordinates;
var templates = require('../FragoleTemplates.js');
var Lib = require('../FragoleLib.js');

class Token extends GameItem {
    constructor (id, category='', x, y, template, drawable=1) {
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
                path.push(nomalizeCoordinates(this, p_tpl._x, p_tpl._y));
            }
        } else {
            path.push(nomalizeCoordinates(this, wp_tpl._x, wp_tpl._y));
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
    click() {
        this.gameController.emit('click', this.id, this);
    }

    moveComplete() {
        this.gameController.rpcServer.disconnect('move_complete_' + this.id);
        this.gameController.emit('moveComplete', this.id, this);
        this.gameController.emit('enterWaypoint', this.id, this, this.waypoint);
    }

}
module.exports.Token = Token;
