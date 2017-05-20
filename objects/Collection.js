var GameObject = require('./GameObject.js').GameObject;

const ID = 0;
const ITEM = 1;

class Collection extends GameObject {
    constructor(id, items=[]) {
        super(id);
        this.items = new Map();
        items.forEach(function(item){ this.set(item.id, item);}, this.items);
    }

    addItem(item) {
        this.items.set(item.id, item);
        if (this.gameController) {
            this.gameController.currentState.emit('addItem', this.id, item);
        }
        this.emit('addItem', item);
    }

    deleteItem(id) {
        var item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            this.emit('deleteItem', item);
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

    iterator(){
        return this.items[Symbol.iterator]();
    }

    cycle() {

    }
}
module.exports.Collection = Collection;
