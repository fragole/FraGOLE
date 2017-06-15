/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-15T19:33:21+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
const ID = 0;
const ITEM = 1;

// Base Game objects
// contains all GameItems, handels the initial drawing of the gameboard
// and connects a GameController-Instance to all items of the game
// XXX: rethink if Game- Object is necessary at all (maybe its work could be
// handled by GameController)
class Game {
    constructor () {
        this.gameControllers = [];
    }

    // assign a GameController-Instance
    // chainable
    addController(gameController) {
        this.gameControllers.push(gameController);
        return this;
    }

    // set the name of the game
    // chainable
    setName(name)  {
        this.name = name;
        return this;
    }
}
module.exports.Game = Game;
