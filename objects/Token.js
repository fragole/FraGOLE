var GameItem = require('./GameObject.js').GameItem;
var nomalizeCoordinates = require('../FragoleLib.js').nomalizeCoordinates;
var templates = require('../FragoleTemplates.js');

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
    moveToWaypoint(waypoint, players=undefined) {
        var wp_tpl = waypoint.template,
            to = nomalizeCoordinates(this, wp_tpl._x, wp_tpl._y),
            cmd =['moveToken', this.id, [to]];

        this.waypoint = waypoint;

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
        if (this.gameController) {
            this.gameController.currentState.emit('click', this.id, this);
        }
        this.emit('click', this);
    }

}
module.exports.Token = Token;
