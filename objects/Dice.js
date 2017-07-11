/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-11T20:24:47+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const Component = require('./Component.js').Component;
const templates = require('../lib/FragoleTemplates.js');

/**
* Class Dice
* @extends Component
* Implemnts a N-sided dice
*/
class Dice extends Component {
    /**
    * Create a new Dice
    * @param {number} sides - number of sides on the dice
    */
    constructor (id, sides, template=templates.DICE_DEFAULT) {
        super(id, template);
        this.sides = sides;
        this.contentId = 'dice_' + id;
        this.context = {id: this.id, contentId: this.contentId};
    }

    /** draw the dice in the client-DOM
    * @param {Player | Array<Player>} players - Player or List of Clients where the dice should be drawn
    */
    draw (players=undefined) {
        this.gameController.rpcServer.connect('roll_' + this.id, this.roll, this);
        super.draw(players);
    }


    /** display the roll result on the client-side
    * @param {Player | Array<Player>} players - Player or List of Clients where the dice should be drawn
    * @param {boolean} reset - true = reset dice afterwards (reomves the displayed result)
    */
    rollResult (players=undefined, reset=false) {
        super.draw(players);
        if (reset) {
            this.reset(players);
        }
    }

    /** reset the die => removes the rollResult or the roll-prompt from the
    * Client-DOM
    */
    reset (players=undefined) {
        this.context = {id: this.id, contentId: this.contentId};
        this.remove(players);
        this.remove(players, this.context.contentId + '_result');
    }


    // EVENTS

    /** The die was rolled by the client
    * calculate result and emit 'roll' envent => to be dispached by an Eventhandler
    */
    roll (clientId) {
        this.result = Math.floor(Math.random() * this.sides + 1);
        this.context = {id: this.id, contentId: this.contentId + '_result', result: this.result};
        this.gameController.emit('roll', this.id, this);
    }

}
module.exports.Dice = Dice;
