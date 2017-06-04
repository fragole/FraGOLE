/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:51:39+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const EventEmitter = require('events');

class GameObject extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.gameController = undefined;
        this.owner = undefined;
        this.vars = {};
        this.subscribers = {};
    }

    // assign custom vars
    set(name, value) {
        this.vars[name] = value;
        if(this.subscribers[name] instanceof Array) {
            for(let item_players of this.subscribers[name]) {
                var item, players;
                [item, players] = item_players;
                item.update(value, players);
            }
        }
    }

    inc(name, offset=1) {
        var value = this.vars[name] + offset;
        this.set(name, value);
    }

    dec(name, offset=1) {
        var value = this.vars[name] - offset;
        this.set(name, value);
    }

    get(name) {
        return this.vars[name];
    }

    // subscribe to a var of this object
    // func will be called when set() for this var is called
    subscribe(name, item, players=undefined) {
        if(this.subscribers[name] instanceof Array) {
            this.subscribers[name].push([item, players]);
        } else {
            this.subscribers[name] = [[item, players]];
        }
    }

    clearCustVars() {
        this.custVars = {};
        this.subscribers = {};
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
