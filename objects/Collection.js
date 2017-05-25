var GameObject = require('./GameObject.js').GameObject;

const ID = 0;
const ITEM = 1;

class Collection extends GameObject {
    constructor(id, items=[]) {
        super(id);
        this.items = new Map();
        items.forEach(function(item){ this.set(item.id, item);}, this.items);
        this.subscribers = []; // override standard behaviour of GameObject
    }

    addItem(item) {
        this.items.set(item.id, item);
        if (this.gameController) {
            this.gameController.currentState.emit('addItem', this.id, item);
        }
        for (let subscriber of this.subscribers) {
            subscriber.update('addItem', item);
        }
    }

    deleteItem(id) {
        var item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            if (this.gameController) {
                this.gameController.currentState.emit('deleteItem', this.id, item);
            }
            for (let subscriber of this.subscribers) {
                subscriber.update('deleteItem', item);
            }
            return item;
        }
    }

    getItem(id) {
        return this.items.get(id);
    }

    getCategory(category) {
        var res = [];
        for(let item of this.iterator()) {
            if (item[ITEM].category == category) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    getType(type) {
        var res = [];
        for(let item of this.iterator()) {
            if (item[ITEM] instanceof type) {
                res.push(item[ITEM]);
            }
        }
        return res;
    }

    iterator(){
        return this.items[Symbol.iterator]();
    }

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subscriber) {
        var item_idx = this.subscribers.indexOf(subscriber);
        if (item_idx > -1) {
            this.subscribers.splice(item_idx, 1);
        }
    }
}
module.exports.Collection = Collection;
