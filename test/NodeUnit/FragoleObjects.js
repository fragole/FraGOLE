var Fragole = require('../FragoleObjects.js');

exports.testCollection = {

  setUp: function(callback) {
    this.item1 = new Fragole.GameItem("item1");
    this.item2 = new Fragole.GameItem("item2");
    this.item3 = new Fragole.GameItem("item3");
    this.collection = new Fragole.Collection("collection1", [this.item1, this.item2, this.item3]);
    callback();
  },

  addItem: function(test) {
    var item4 = new Fragole.GameItem("item4")
    this.collection.on('addItem', (item) => {test.equal(item.id, 'item4');})
    this.collection.addItem(item4);

    test.deepEqual(this.collection.items, new Map([["item1", this.item1],["item2", this.item2],["item3", this.item3], ["item4", item4]]));
    test.done();
  },

  deleteItem: function(test) {
    this.collection.on('deleteItem', (item) => {test.equal(item.id, 'item1');})
    this.collection.deleteItem("item1");
    this.collection.deleteItem("item4");

    test.deepEqual(this.collection.items, new Map([["item2", this.item2],["item3", this.item3]]));
    test.done();
  },

  getItem: function(test) {
    var res = this.collection.getItem("item2");


    test.deepEqual(res, this.item2);
    test.done();
  },

  getItemNE: function(test) {
    var res = this.collection.getItem("item4");
    test.equals(res, undefined)
    test.done();
  },

  iterator: function(test) {
    var iterator = this.collection.iterator();

    var item1 = iterator.next().value;
    var item2 = iterator.next().value;
    var item3 = iterator.next().value;
    var ndef  = iterator.next().value;

    test.deepEqual(item1, ["item1", this.item1]);
    test.deepEqual(item2, ["item2", this.item2]);
    test.deepEqual(item3, ["item3", this.item3]);
    test.equals(ndef, "abc");
    test.done();
  }
}
