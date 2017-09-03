/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-09-03T05:52:32+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module Waypoint */
const Token = require('./Token.js').Token;
const templates = require('../lib/FragoleTemplates.js');

/** Class Waypoint
* @extends {module:Token~Token}
* Displays a Waypoint on the client-side
*/
class Waypoint extends Token {
    constructor(id, category, x, y, template=templates.WAYPOINT_DEFAULT) {
        super(id, category, x, y, template);
        this.next = [];
        this.tokens=[];
    }

    // Events - Triggered by client
    click(clientId) {
        this.gameController.emit('selectWaypoint', this.id, this, clientId);
    }
}
module.exports.Waypoint = Waypoint;
