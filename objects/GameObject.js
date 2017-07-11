/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-11T19:26:30+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module GameObject */
const EventEmitter = require('events');

/** Base-Class for everything
* @extends EventEmitter
*/
class GameObject extends EventEmitter {
    /**
      creates a GameObject
      @param {string} id - unique identifier of the object
    */
    constructor (id) {
        super();
        this.id = id;
        this.gameController = undefined;
        this.owner = undefined;
        this.vars = {};
        this.subscribers = {};
    }

    /**
    * assign custom-vars to the object or change the value of existing ones. This can be used to store values at runtime.
    * When a custom-var is set in this way, the update()-method of all subscribers of this object is called.
    * @param {string} name - the name (key) of the custom-var
    * @param {string | number | Object} value - the value to be set
    */
    set (name, value) {
        this.vars[name] = value;
        if(this.subscribers[name] instanceof Array) {
            for(let itemPlayers of this.subscribers[name]) {
                let item;
                let players;
                [item, players] = itemPlayers;
                item.update(value, players);
            }
        }
    }

    /**
    * increment a custom-var of this object. Updates subscribing objects
    * Note: the incremented var must be a number
    * @param {string} name - name of the var to be incremented
    * @param {number} offset: amount to increment (negative number = decrement)
    */
    inc (name, offset=1) {
        let value = this.vars[name] + offset;
        this.set(name, value);
    }

    /**
    * decrement a custom-var of this object. Updates subscribing objects
    * Note: the custom-var must be a number
    * @param {string} name - name of the var to be decremented
    * @param {number} offset: amount to decrement (negative number = increment)
    */
    dec (name, offset=1) {
        let value = this.vars[name] - offset;
        this.set(name, value);
    }

    /** get the value of a custom-var
    * @param {string} name - name of the var
    */
    get (name) {
        return this.vars[name];
    }

    /**
    * Subscribe to a custom-var of this object.
    * The update-method of the subscribing object will be called when set-method
    * of the sucbribed object is invoced
    * @param {string} name - name of the subscribers
    * @param {GameObject} item - the subscribing Object
    * @param {Array<Player>} players - (optional) an Array of players (this can be used within the upadte-method)
    */
    subscribe (name, item, players=undefined) {
        if(this.subscribers[name] instanceof Array) {
            this.subscribers[name].push([item, players]);
        } else {
            this.subscribers[name] = [[item, players]];
        }
    }

    /**
    * clear all custom-vars of the object
    */
    clearCustVars () {
        this.custVars = {};
        this.subscribers = {};
    }
}

/**
 GameItem Base-Class
 @extends GameObject
*/
class GameItem extends GameObject {
    /**
    * create a new GameItem
    * @param {string} id - unique identifier
    * @param {string} category - (optional) category-text
    */
    constructor (id, category='') {
        super(id, category);
        this.category=category;
    }
}

// EXPORTS
module.exports.GameObject = GameObject;
module.exports.GameItem = GameItem;
