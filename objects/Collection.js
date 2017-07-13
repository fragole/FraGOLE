/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:57:56+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
/** @module Collection */
const GameObject = require('./GameObject.js').GameObject;

const ID = 0;
const ITEM = 1;

/** Class Collection
* @extends {module:GameObject~GameObject}
* Collection implements a "container" for all types of GameObjects
* items: Array of GameObjects
* Other Objects may subscribe to the Collection (the .update method of those
* objects will be called when the Collection is modified)
*/
class Collection extends GameObject {
    /**
    * Create a new Collection
    * @param {string} id - unique id of the Collection
    * @param {Array<GameObject>} items - items that should be contained within the Collection
    */
    constructor(id, items=[]) {
        super(id);
        this.items = new Map();
        items.forEach((item) => { this.set(item.id, item);}, this.items);
        this.subscribers = []; // override standard behaviour of GameObject
    }

    /**
    * Add a GameObject
    * @param {GameObject} item - item that should be added
    */
    addItem(item) {
        this.items.set(item.id, item);
        for (let subscriber of this.subscribers) {
            subscriber.update('addItem', item);
        }
    }

    /**
    * remove a GameObject by it's id.
    * returns the removed item (success), or null (failure)
    * @param {string} id - id of the item that should be removed
    * @return {GameObject | null}
    */
    deleteItem(id) {
        let item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            for (let subscriber of this.subscribers) {
                subscriber.update('deleteItem', item);
            }
            return item;
        }
    }

    /** Return a GameObject via it's id
    * @param {string} id - id of the item that should be removed
    * @return {GameObject}
    */
    getItem(id) {
        return this.items.get(id);
    }

    /**
    * return all GameObjects of a given 'category'
    * @param {string} category
    */
    getCategory(category) {
        let res = [];
        for(let item of this.iterator()) {
            if (item[ITEM].category === category) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    /**
    * return all GameObjects of 'type' (e.g. all Card-objects)
    * @param {GameObject} type - GameObject or a Subclass
    */
    getType(type) {
        let res = [];
        for(let item of this.iterator()) {
            if (item[ITEM] instanceof type) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    /** return an Iterator of all objects in Collection */
    iterator() {
        return this.items[Symbol.iterator]();
    }

    /**
    * subscribe to the collection
    * .update of subscriber will be called when collection is modified
    * @param {GameObject} subscriber - the subscribing object
    */
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    /** cancel a subscription to the collection
    * @param {GameObject} subscriber - the subscribing object
    */
    unsubscribe(subscriber) {
        let itemIdx = this.subscribers.indexOf(subscriber);
        if (itemIdx > -1) {
            this.subscribers.splice(itemIdx, 1);
        }
    }
}
module.exports.Collection = Collection;
