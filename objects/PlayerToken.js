/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:51:28+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Token = require('./Token.js').Token;
var templates = require('../FragoleTemplates.js');

class PlayerToken extends Token {
    constructor (id, category, x, y, template=templates.PLAYER_TOKEN_DEFAULT) {
        super(id, category, x, y, template);
    }
}
module.exports.PlayerToken = PlayerToken;
