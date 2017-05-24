var Token = require('./Token.js').Token;
var templates = require('../FragoleTemplates.js');

class Waypoint extends Token {
    constructor (id, category, x, y, template=templates.WAYPOINT_DEFAULT) {
        super(id, category, x, y, template);
        this.next = [];
        this.tokens=[];
    }

    click() {
        if (this.gameController) {
            this.gameController.emit('selectWaypoint', this.id, this);
        }
    }
}
module.exports.Waypoint = Waypoint;
