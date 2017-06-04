/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T11:25:17+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var GameObject = require('./GameObject.js').GameObject;

const ID = 0;
const ITEM = 1;

// Collection implements a "container" for all types of GameObjects
// items: Array of GameObjects
// Other Objects may subscribe to the Collection (the .update method of those
// objects will be called when the Collection is modified)
class Collection extends GameObject {
    constructor(id, items=[]) {
        super(id);
        this.items = new Map();
        items.forEach(function(item){ this.set(item.id, item);}, this.items);
        this.subscribers = []; // override standard behaviour of GameObject
    }

    // Add a GameObject
    addItem(item) {
        this.items.set(item.id, item);
        for (let subscriber of this.subscribers) {
            subscriber.update('addItem', item);
        }
    }

    // remove a GameObject
    deleteItem(id) {
        var item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            for (let subscriber of this.subscribers) {
                subscriber.update('deleteItem', item);
            }
            return item;
        }
    }

    // Return a GameObject via it's id
    getItem(id) {
        return this.items.get(id);
    }

    // return all GameObject of a given 'category'
    getCategory(category) {
        var res = [];
        for(let item of this.iterator()) {
            if (item[ITEM].category == category) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    // return all GameObject of 'type' (e.g. all Card-objects)
    getType(type) {
        var res = [];
        for(let item of this.iterator()) {
            if (item[ITEM] instanceof type) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    // return an Iterator of all objects in Collection
    iterator() {
        return this.items[Symbol.iterator]();
    }

    // subscribe to the collection
    // .update of subscriber will be called when collection is modified
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    // cancel a subscription to the collection
    unsubscribe(subscriber) {
        var item_idx = this.subscribers.indexOf(subscriber);
        if (item_idx > -1) {
            this.subscribers.splice(item_idx, 1);
        }
    }
}
module.exports.Collection = Collection;
