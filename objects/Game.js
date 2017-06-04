/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T11:47:38+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Player = require('./Player.js').Player,
    PlayerToken = require('./PlayerToken.js').PlayerToken,
    Waypoint = require('./Waypoint.js').Waypoint;

const ID = 0;
const ITEM = 1;

// Base Game objects
// contains all GameItems, handels the initial drawing of the gameboard
// and connects a GameController-Instance to all items of the game
// XXX: rethink if Game- Object is necessary at all (maybe its work could be
// handled by GameController)
class Game {
    constructor () {
        this.items = {};
        this.gameController = undefined;
    }

    // assign a GameController-Instance
    // chainable
    setController(gameController) {
        this.gameController = gameController;
        return this;
    }

    // set the name of the game
    // chainable
    setName(name)  {
        this.name = name;
        return this;
    }

    // assign alle GameObject to the game
    // GameController-Instance will be connected to everyone
    setItems (items) {
        this.items = items;
        for (let item in items) {
            items[item].gameController = this.gameController;
        }
    }

    // draw the initial gameboard => Waypoints and PlayerTokens will be drawn
    // XXX: this may need some work / consideration
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
