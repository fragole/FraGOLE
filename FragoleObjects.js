const EventEmitter = require('events');

const ID = 0;
const ITEM = 1;

class GameObject extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
  }
}


var gameControllerInstance = null;
class GameController extends GameObject {
  constructor(id, minPlayers=1, rpcServer=undefined) {
    if ( gameControllerInstance ) {
      return gameControllerInstance;
    }
    super(id);
    this.name = '';
    this.rpcServer = rpcServer;
    this.minPlayers = minPlayers;
    this.players = new Collection()
    this.activePlayer = undefined;
    this.playersIterator = this.players.iterator();
    gameControllerInstance = this;
  }

  setName(name) {
    this.name = name;
    return this
  }

  setRpcServer(rpcServer) {
    this.rpcServer = rpcServer;
    return this
  }

  setMinPlayers(minPlayers) {
    this.minPlayers = minPlayers
    return this;
  }

  addPlayer(player) {
    this.players.addItem(player);
    return this
  }

  joinPlayer(name, clientProxy) {
    var player;

    // check if this player has already joined XXX check client-ip
    for (let p of this.players.iterator()) {
      p = p[ITEM];
      if (p.name == name) {
        p.session=clientProxy; // update rpc-session
        this.emit('joinPlayer', p);
        return p;
      }
    }

    try {
      player = this.playersIterator.next().value[ITEM];
    } catch(e) {}

    if (player) {
      player.name = name;
      player.session = clientProxy;
      player.joined = true;
      this.emit('joinPlayer', player);
      return player;
    }
    return undefined;
  }

}
module.exports.GameController = GameController;

class Collection extends GameObject {
  constructor(id, items=[]) {
    super(id);
    this.items = new Map();
    items.forEach(function(item){ this.set(item.id, item);}, this.items);
  }

  addItem(item) {
    this.items.set(item.id, item);
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

  filter(filterExpr) {
    // XXX
    return 'NYI'
  }

  iterator(){
    return this.items[Symbol.iterator]();
  }

}
module.exports.Collection = Collection;

class GameItem extends GameObject {
  constructor (id, category='', x, y, style={}, drawable=1) {
    super(id, x, y, style, drawable);
    this.category=category;
  }

  moveToWayPoint(waypoint, path=TRUE) {

  }

  moveToXY(x, y) {

  }

  activate() {

  }

  highlight() {

  }

  show() {

  }

  hide() {

  }

  draw() {

  }
}
module.exports.GameItem = GameItem;

class Player extends GameObject {

  constructor (id) {
    super(id);
    this.number = ++Player.playerNumber;
    this.joined = false;
    this.session = undefined; // will be set by GameController.joinPlayer
    this.name = undefined;    // will be set by GameController.joinPlayer
    this.inventory = new Map();
  }

  addInventory (category, item) {

  }

  removeInventory (category, item) {

  }

}
Player.playerNumber = 0;
module.exports.Player = Player;

class Token extends GameItem {
  constructor (id, category='', x, y, style={}, drawable=1) {
    super(id, category, x, y, style, drawable);
  }
}
module.exports.Token = Token;

class PlayerToken extends Token {
  constructor (id, category, x, y, style) {
    super(id, category, x, y, style);
  }
}
module.exports.PlayerToken = PlayerToken;


// --------------------- Global Objects ---------------------------------------
// at The moment only gameController should be Global
global.gameController = new GameController();
