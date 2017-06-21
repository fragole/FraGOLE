/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:44:34+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Token = require('./Token.js').Token;
var templates = require('../lib/FragoleTemplates.js');

// Displays a Waypoint on the client-side
class Waypoint extends Token {
    constructor (id, category, x, y, template=templates.WAYPOINT_DEFAULT) {
        super(id, category, x, y, template);
        this.next = [];
        this.tokens=[];
    }

    // Events - Triggered by client
    click() {
        this.gameController.emit('selectWaypoint', this.id, this);
    }
}
module.exports.Waypoint = Waypoint;
