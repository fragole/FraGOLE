const EventEmitter = require('events');

class GameObject extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.gameController = undefined;
        this.owner = undefined;
        this.vars = {};
        this.var_subscribers = {};
    }

    // assign custom vars
    set(name, value) {
        this.vars[name] = value;
        if(this.var_subscribers[name] instanceof Array) {
            for(let item_players of this.var_subscribers[name]) {
                var item, players;
                [item, players] = item_players;
                item.update(value, players);
            }
        }
    }

    get(name) {
        return this.vars[name];
    }

    // subscribe to a var of this object
    // func will be called when set() for this var is called
    subscribe(name, item, players=undefined) {
        if(this.var_subscribers[name] instanceof Array) {
            this.var_subscribers[name].push([item, players]);
        } else {
            this.var_subscribers[name] = [[item, players]];
        }
    }

    clearCustVars() {
        this.custVars = {};
        this.var_subscribers = {};
    }
}

class GameItem extends GameObject {
    constructor (id, category='') {
        super(id, category);
        this.category=category;
    }
}

// EXPORTS
module.exports.GameObject = GameObject;
module.exports.GameItem = GameItem;
