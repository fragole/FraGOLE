/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T20:00:51+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module Rating */
const Statistic = require('./Statistic.js').Statistic;
const templates = require('../lib/FragoleTemplates.js');

/** Class Rating
* @extends {module:Statistic~Statistic}
* a rating-bar with stars or hearts that can be drawn to  the gameboard
*/
class Rating extends Statistic {
    /**
    * creates a new rating-bar
    * @param {string} id - unique identifier
    * @param {number} x - the x-Position of the bar
    * @param {number} y - the y-Position of the bar
    * @param {string} type - valid types are 'heart' or 'star'
    * @param {string} label - a label-text that is displayed below the bar
    * @param {number} value - the current value displayed by the bar
    * @param {number} max - maximum number of 'points'
    */
    constructor(id, x, y, type, label, value, max, template=templates.RATING_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.contentId = 'rating_' + id;
        this.context.type = type;
        this.context.max = max;
    }
}
module.exports.Rating = Rating;

/** Class Rating
* @extends Statistic
* a rating-bar with stars/hearts that can attached to a players dashboard
*/
class PlayerRating extends Rating {
    /**
    * creates a new rating-bar
    * @param {string} id - unique identifier
    * @param {string} type - valid types are 'heart' or 'star'
    * @param {string} label - a label-text that is displayed below the bar
    * @param {number} value - the current value displayed by the bar
    * @param {number} max - maximum number of 'points'
    */
    constructor(id, type, label, value, max, template=templates.PLAYER_RATING_DEFAULT) {
        super(id, 0, 0, type, label, value, max, template);
    }

    draw(players=undefined) {
        let cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.contentId
        ];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }
}
module.exports.PlayerRating = PlayerRating;
