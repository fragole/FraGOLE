/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:51:32+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var GameObject = require('./GameObject.js').GameObject;
var Collection = require('./Collection.js').Collection;

class Player extends GameObject {
    constructor (id) {
        super(id);
        this.number = ++Player.playerNumber;
        this.joined = false;
        this.session = undefined; // will be set by GameController.joinPlayer
        this.name = undefined;    // will be set by GameController.joinPlayer
        this.inventory = new Collection();
        this.inventory.owner = this;
        this.skip_turns = 0;
    }

    addInventory (item) {
        this.inventory.addItem(item);
        item.owner = this;
    }

    getInventory( {id='', category=''} ) {
        if (id) {
            return this.inventory.getItem(id);
        } else if (category) {
            return this.inventory.getCategory(category);
        }
    }

    removeInventory (item) {
        this.inventory.deleteItem(item.id);
        item.owner = undefined;
    }

}
Player.playerNumber = 0;
module.exports.Player = Player;
