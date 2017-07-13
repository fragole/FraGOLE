/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T20:06:43+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
/** @module Token */
const GameItem = require('./GameObject.js').GameItem;
const templates = require('../lib/FragoleTemplates.js');
const Lib = require('../lib/FragoleLib.js');

/**
* Class Token
* @extends {module:GameObject~GameItem}
* Base-Clase for Tokens
* Tokens are shapes or images the are displayed in the clients gameboard
* canvas
*/
class Token extends GameItem {
    /**
    * create a new Token
    * @param {string} id - unique identifier
    * @param {string} category - the category of the token
    * @param {number} x - the x-Position of the token
    * @param {number} y - the y-Position of the token
    */
    constructor(id, category='', x, y, Template) {
        super(id, category);
        this.x = x;
        this.y = y;
        this.template = new Template().x(x).y(y);
        this.waypoint = undefined;
    }

    /** move token to a waypoint
    * when usePath is used 'leaveWaypoint' (when leaving the first waypoint)
    * and 'passWaypoint' (for waypoints between first and last) Events are created
    * @param {Waypoint} waypoint - the target waypoint
    * @param {boolean} usePath - true: calculate shortest path to target an move the token along that path
    */
    moveToWaypoint(waypoint, usePath=true, players=undefined) {
        let wpTpl = waypoint.template;
        let path = [];

        if (usePath) {
            let sPath = Lib.getPath(this.waypoint, waypoint);
            let step = 0;
            for (let wp of sPath) {
                let pTpl = wp.template;
                if (step === 0) {
                    this.gameController.emit('leaveWaypoint', this.id, this, wp);
                } else if (step < sPath.length-1) {
                    this.gameController.emit('passWaypoint', this.id, this, wp);
                }
                step++;
                path.push(Lib.normalizeCoordinates(this, pTpl._x, pTpl._y));
            }
        } else {
            path.push(Lib.normalizeCoordinates(this, wpTpl._x, wpTpl._y));
        }

        let cmd =['moveToken', this.id, path];
        this.waypoint = waypoint;
        this.gameController.rpcServer.connect('move_complete_' + this.id, this.moveComplete, this);
        this.gameController.rpcListOrAll(players, cmd);
    }

    /** activate click-handler for the Token
    * @param {Player | Array<Player>} players - single Player or list of Player to activate the Token for (if undefined Token is activated for its owner only)
    */
    // standard-target => owner
    activate(players=undefined) {
        let cmd = ['activateToken', this.id, 'click_' + this.id];

        // register callback-function in rpc-server
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    /** deactivate click-handler for the Token
    * @param {Player | Array<Player>} players - single Player or list of Player to deactivate the Token for (if undefined Token is deactivated for its owner only)
    */
    // standard-target => owner
    deactivate(players=undefined) {
        let cmd = ['deactivateToken', this.id];

        this.gameController.rpcServer.disconnect('click_' + this.id);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    /** visually highlight the token on client-side ('form' depends on client implementation)
    * @param {Player | Array<Player>} players - single Player or list of Player (if undefined only the owner is affected)
    */
    highlight(players=undefined) {
        let cmd = ['highlightToken', this.id];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    /** stop highlighting the token on client-side
    * @param {Player | Array<Player>} players - single Player or list of Player (if undefined only the owner is affected)
    */
    unhighlight(players=undefined) {
        let cmd = ['unhighlightToken', this.id];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    /** draw the token in the client browser
    * @param {Player | Array<Player>} players - single Player or list of Player (if undefined, all joined players are affected)
    */
    draw(players=undefined) {
        let cmd;

        if (this.template instanceof templates.ShapeTemplate) {
            if (this.template._shape === templates.shapes.CIRCLE) {
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

    /** EVENT: this is emitted when an activated Token is clicked */
    click(clientId) {
        this.gameController.emit('click', this.id, this);
    }

    /** is called when the animation-tween on the client-side is completed
    * emits moveComplete & enterWaypoint Events
    */
    moveComplete(clientId) {
        // ensure that moveComplete is only triggered once
        if(this.gameController.playersId[clientId] === this.gameController.activePlayer) {
            this.gameController.emit('moveComplete', this.id, this);
            this.gameController.emit('enterWaypoint', this.id, this.waypoint, this);
            //this.gameController.rpcServer.disconnect('move_complete_' + this.id);
        }
    }

}
module.exports.Token = Token;
