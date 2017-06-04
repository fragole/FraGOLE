/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:51:36+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var GameObject = require('./GameObject.js').GameObject;

class GameState extends GameObject {
    constructor (id) {
        super(id);
    }

    setHandlers(handlers = {}) {
        for (let handler in handlers) {
            var func = handlers[handler];
            this.on(handler, func);
        }
    }

    enter () {
        console.log(this.id + ' ENTER');
        this.emit('enter');
    }

    exit () {
        console.log(this.id + ' EXIT');
        this.emit('exit');
    }
}
exports.GameState = GameState;
