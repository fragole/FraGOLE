/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-06T19:15:00+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Component = require('./Component.js').Component;
var templates = require('../FragoleTemplates.js');

// Implemnts a N-sided dice
// sides: number of sides
class Dice extends Component {
    constructor(id, sides, template=templates.DICE_DEFAULT) {
        super(id, template);
        this.sides = sides;
        this.content_id = 'dice_' + id;
        this.context = {id: this.id, content_id: this.content_id};
    }

    // draw the dice in the client-DOM
    draw(players=undefined) {
        this.gameController.rpcServer.connect('roll_' + this.id, this.roll, this);
        super.draw(players);
    }


    // display the roll result on the client-side
    rollResult(players=undefined, reset=false) {
        super.draw(players);
        if (reset) {
            this.reset(players);
        }
    }

    // reset the die => removes the rollResult or the roll-prompt from the
    // Client-DOM
    reset(players=undefined) {
        this.context = {id: this.id, content_id: this.content_id};
        this.remove(players);
        this.remove(players, this.context.content_id + '_result');
    }


    // EVENTS

    // The die was rolled by the client
    // calculate result and emit 'roll' envent => to be dispached by an Eventhandler
    roll() {
        this.result = Math.floor(Math.random() * this.sides + 1);
        this.context = {id: this.id, content_id: this.content_id + '_result', result: this.result};
        this.gameController.emit('roll', this.id, this);
    }

}
module.exports.Dice = Dice;
