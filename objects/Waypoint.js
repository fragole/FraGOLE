var Token = require('./Token.js').Token;
var templates = require('../FragoleTemplates.js');

class Waypoint extends Token {
    constructor (id, category, x, y, template=templates.WAYPOINT_DEFAULT) {
        super(id, category, x, y, template);
        this.next = [];
        this.tokens=[];
    }
}
module.exports.Waypoint = Waypoint;
