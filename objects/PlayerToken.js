/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T18:45:45+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module PlayerToken */
const Token = require('./Token.js').Token;
const templates = require('../lib/FragoleTemplates.js');

/** Class PlayerToken
* @extends Token
* this represents a client-side PlayerToken
*/
class PlayerToken extends Token {

    /**
    * create a new PlayerToken
    * @param {string} id - unique identifier
    * @param {string} category - the category of the items
    * @param {number} x - current x-Position of the PlayerToken
    * @param {number} y - current y-Position of the PlayerToken
    */
    constructor(id, category, x, y, template=templates.PLAYER_TOKEN_DEFAULT) {
        super(id, category, x, y, template);
    }
}
module.exports.PlayerToken = PlayerToken;
