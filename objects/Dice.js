var Component = require('./Component.js').Component;
var templates = require('../FragoleTemplates.js');

class Dice extends Component {
    constructor(id, sides, template=templates.DICE_DEFAULT) {
        super(id, template);
        this.sides = sides;
        this.content_id = 'dice_' + id;
        this.context = {id: this.id, content_id: this.content_id};
    }

    draw(players=undefined) {
        this.gameController.rpcServer.connect('roll_' + this.id, this.roll, this);
        return super.draw(players);
    }

    roll() {
        this.result = Math.floor(Math.random() * this.sides + 1);
        this.context = {id: this.id, content_id: this.content_id + '_result', result: this.result};
        if (this.gameController) {
            this.gameController.currentState.emit('roll', this.id, this);
        }
        this.emit('roll', this);
    }

    rollResult(players=undefined) {
        return super.draw(players);
    }

    reset(players=undefined) {
        this.context = {id: this.id, content_id: this.content_id};
        this.remove(players);
        this.remove(players, this.context.content_id + '_result');
    }
}
module.exports.Dice = Dice;
