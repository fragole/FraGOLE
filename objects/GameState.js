var GameObject = require('./GameObject.js').GameObject;

class GameState extends GameObject {
    constructor (id) {
        super(id);
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
