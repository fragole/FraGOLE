/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T20:23:48+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module Progress */
const Statistic = require('./Statistic.js').Statistic;
const templates = require('../lib/FragoleTemplates.js');

/** Class Progress
* @extends {module:Statistic~Statistic}
* Implements a client-side progress-bar which can be drawn on the gameboard
*/
class Progress extends Statistic {
    /**
    * creates a new progress-bar
    * @param {string} id - unique identifier
    * @param {number} x - the x-Position of the bar
    * @param {number} y - the y-Position of the bar
    * @param {string} color - the color of the bar
    * @param {string} label - a label-text that is displayed below the bar
    * @param {number} value - the current value displayed by the bar
    * @param {number} max - the maximum value of the bar (=100%)
    */
    constructor(id, x, y, color, label, value, max, template=templates.PROGRESS_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.contentId = 'progress_' + id;
        this.context.color = color;
        this.context.max = max;
    }
}
module.exports.Progress = Progress;


/** Class Progress
* @extends Progress
* Implements as client-side progress-bar which can be attached to a players
* Dashboard
*/
class PlayerProgress extends Progress {
    /**
    * creates a new progress-bar
    * @param {string} id - unique identifier
    * @param {string} color - the color of the bar
    * @param {string} label - a label-text that is displayed below the bar
    * @param {number} value - the current value displayed by the bar
    * @param {number} max - the maximum value of the bar (=100%)
    */
    constructor(id, color, label, value, max, template=templates.PLAYER_PROGRESS_DEFAULT) {
        super(id, 0,0, color, label, value, max, template);
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
module.exports.PlayerProgress = PlayerProgress;
