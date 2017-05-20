var Token = require('./Token.js').Token;
var templates = require('../FragoleTemplates.js');

class PlayerToken extends Token {
    constructor (id, category, x, y, template=templates.PLAYER_TOKEN_DEFAULT) {
        super(id, category, x, y, template);
    }
}
module.exports.PlayerToken = PlayerToken;
