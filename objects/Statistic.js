/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T20:01:18+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module Statistic */
const Component = require('./Component').Component;
const templates = require('../lib/FragoleTemplates.js');

/** Class Statistic
* @extends {module:Component~Component}
* A numeric representation of a Statistic (Points, etc) which can be drawn to
* the gameboard
* Statistics can subscribe to custom-vars of GameObjects and are automatically
* when the value of that var changes
*/
class Statistic extends Component {
    /** create a new Statistic
    * @param {string} id - unique identifier
    * @param {number} x - the x-Position of the statistic
    * @param {number} y - the y-Position of the statistic
    * @param {string} label - a label-text that is displayed below the bar
    * @param {number} value - the current value of the statistic
    * @param {string} icon - optional icon to display next to the Statistic
    * @param {string} img - NYI
    */
    constructor(id, x, y, label, value, icon=undefined, img=undefined, template=templates.STATISTIC_DEFAULT) {
        super(id, template);
        this.context.contentId = 'stat_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.img = img;
        this.context.icon = icon;
        this.context.value = value;
        this.update.bind(this);
    }

    // internal helper function
    mkDrawCmd() {
        let cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.contentId
        ];
        return cmd;
    }

    /** draw the statistic on client(s) */
    draw(players=undefined) {
        this.gameController.rpcListOrAll(players, this.mkDrawCmd());
    }

    /** can be called manually to update the value of the Statistic
    * or gets called by another GameObject when subscribing to a custom-var of
    * that GameObject
    * @param {number} value - the new value
    */
    update(value) {
        this.context.value = value;
        this.draw();
    }
}
module.exports.Statistic = Statistic;

/** Class PlayerStatistic
* @extends Statistic
* same as Statistic but attaches to a players dashboard
*/
class PlayerStatistic extends Statistic {
    constructor(id, label, value, icon=undefined, img=undefined, template=templates.PLAYER_STATISTIC_DEFAULT) {
        super(id, 0, 0, label, value, icon, img, template);
    }

    draw(players=undefined) {
        this.gameController.rpcListOrOwner(players, this, this.mkDrawCmd());
    }

}
module.exports.PlayerStatistic = PlayerStatistic;
