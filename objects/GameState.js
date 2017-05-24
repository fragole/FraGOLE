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
