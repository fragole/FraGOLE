const EventEmitter = require('events');
var Player = require('./Player.js').Player,
    PlayerToken = require('./PlayerToken.js').PlayerToken,
    Waypoint = require('./Waypoint.js').Waypoint;

const ID = 0;
const ITEM = 1;

class Game {
    constructor () {
        this.items = {};
        this.gameController = undefined;
    }

    setController(gameController) {
        this.gameController = gameController;
        return this;
    }

    setName(name)  {
        this.name = name;
        return this;
    }

    setItems (items) {
        this.items = items;
        for (let item in items) {
            items[item].gameController = this.gameController;
        }
    }

    setupBoard() {
        for (let i in this.items) {
            var item = this.items[i];
            if (item instanceof Waypoint) {
                item.draw();
            }
            if (item instanceof Player && item.joined) {
                for (let i of item.inventory.iterator()) {
                    if (i[ITEM] instanceof PlayerToken) {
                        i[ITEM].draw();
                    }
                }
            }
        }
    }
}
module.exports.Game = Game;
