var templates = require('./FragoleTemplates.js');

const EventEmitter = require('events');

const ID = 0;
const ITEM = 1;

class GameObject extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
  }
}

class GameState extends GameObject {
  constructor (id) {
    super(id);
  }

  enter () {
    console.log(this.id + " ENTER");
    this.emit("enter");
  }

  exit () {
    console.log(this.id + " EXIT");
    this.emit("exit");
  }
}
exports.GameState = GameState;

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
    this.currentState = new GameState('NULL');
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

  next_state(state) {
    this.currentState.exit();
    this.currentState=state;
    state.enter();
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
  constructor (id, category='') {
    super(id, category);
    this.category=category;
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
  constructor (id, category='', x, y, template=templates.TOKEN_DEFAULT, drawable=1) {
    super(id, category);
    this.x = x
    this.y = y
    this.template = new template().x(x).y(y);
  }

  moveToWayPoint(waypoint, path=TRUE) { }
  moveToXY(x, y) {}
  activate() {}
  highlight() {}
  show() {}
  hide() {}
  draw() {
    if (this.template._shape == templates.shapes.CIRCLE) {
      return ['drawShape',
               this.id,
               this.template._shape,
               this.template._fill,
               this.template._stroke,
               this.template._x,
               this.template._y,
               this.template._radius];
    }
  }
}
module.exports.Token = Token;

class PlayerToken extends Token {
  constructor (id, category, x, y, template=tempates.PLAYER_TOKEN_DEFAULT) {
    super(id, category, x, y, template);
  }
}
module.exports.PlayerToken = PlayerToken;

class Waypoint extends Token {
  constructor (id, category, x, y, template=templates.WAYPOINT_DEFAULT) {
    super(id, category, x, y, template);
    this.next = [];
    this.previous = [];
  }
}
module.exports.Waypoint = Waypoint;

// --------------------- Global Objects ---------------------------------------
// at The moment only gameController should be Global
global.gameController = new GameController();
