/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:59:32+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
/** @module GameState */
const GameObject = require('./GameObject.js').GameObject;

/** Class GameState
* @extends {module:GameObject~GameObject}
* GameState is a Object representing a State of the FSM
* Eventhandlers can be declared as follows:
*
* GameStateInstance.on('eventType', function(args){})
*/
class GameState extends GameObject {

    /** this allows alternate declaration of State-Events
    *
    * GameStateInstance.setHandlers({'eventType':function () {...}}, 'eventType':...)
    * or even shorter
    * GameStateInstance.setHandlers({eventType () {...}}, eventType () {...}, ...})
    */
    setHandlers(handlers = {}) {
        for (let handler in handlers) {
            let func = handlers[handler];
            this.on(handler, func);
        }
    }

    // EVENTS - these are triggered via GameController.next_state(GameState)
    /** triggers automatically when the State is entered */
    enter() {
        console.log(this.id + ' ENTER');
        this.emit('enter');
    }

    /** triggers automatically when the State is exited */
    exit() {
        console.log(this.id + ' EXIT');
        this.emit('exit');
    }
}
exports.GameState = GameState;
