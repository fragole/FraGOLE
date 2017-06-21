/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:44:39+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const GameObject = require('./GameObject.js').GameObject;

// GameState is a Object representing a State of the FSM
// Eventhandlers can be declared as follows:
//
// GameStateInstance.on('eventType', function(args){...})
class GameState extends GameObject {
    constructor (id) {
        super(id);
    }

    // this allows alternate declaration of State-Events
    //
    // GameStateInstance.setHandlers({'eventType':function(){...}}, 'eventType':...)
    setHandlers(handlers = {}) {
        for (let handler in handlers) {
            var func = handlers[handler];
            this.on(handler, func);
        }
    }

    // EVENTS - these are triggered via GameController.next_state(GameState)
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
