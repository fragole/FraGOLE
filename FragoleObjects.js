var templates = require('./FragoleTemplates.js');
const EventEmitter = require('events');

// globals
var RPC_ALL = global.RPC_ALL;
var RPC_ONE = global.RPC_ONE;

const ID = 0;
const ITEM = 1;

class Game {
    constructor () {
        this.items = {};
        this.gameController = undefined;
    }

    setController(gameController) {
        this.gameController = gameController;
        return this;
    }

    setName(name)  {
        this.name = name;
        return this;
    }

    setItems (items) {
        this.items = items;
        for (let item in items) {
            items[item].gameController = this.gameController;
        }
    }

    setupBoard() {
        for (let i in this.items) {
            var item = this.items[i];
            if (item instanceof Waypoint) {
                RPC_ALL(...item.draw());
            }
            if (item instanceof Player && item.joined) {
                for (let i of item.inventory.iterator()) {
                    if (i[1] instanceof PlayerToken) {
                        RPC_ALL(...i[1].draw());
                    }
                }
            }
        }
    }

}

class GameObject extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.gameController = undefined;
    }

}

class GameState extends GameObject {
    constructor (id) {
        super(id);
    }

    enter () {
        console.log(this.id + ' ENTER');
        this.emit('enter');
    }

    exit () {
        console.log(this.id + ' EXIT');
        this.emit('exit');
    }
}
exports.GameState = GameState;

class GameController extends GameObject {
    constructor(id, minPlayers=1, rpcServer=undefined) {
        super(id);
        this.rpcServer = rpcServer;
        this.minPlayers = minPlayers;
        this.players = new Collection();
        this.activePlayer = undefined;
        this.currentState = new GameState('NULL');
        this.playersIterator = this.players.iterator();
    }

    addPlayer(player) {
        this.players.addItem(player);
        return this;
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
        } catch(e) { player = undefined; }

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

    filter(filterExpr) {
        // XXX
        return 'NYI';
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
        this.inventory = new Collection();
    }

    addInventory (item) {
        this.inventory.addItem(item);
    }

    removeInventory (item) {
        this.inventor.deleteItem(item);
    }

}
Player.playerNumber = 0;
module.exports.Player = Player;

class Token extends GameItem {
    constructor (id, category='', x, y, template=templates.TOKEN_DEFAULT, drawable=1) {
        super(id, category);
        this.x = x;
        this.y = y;
        this.template = new template().x(x).y(y);
    }

    moveToWayPoint(waypoint, path=true) { }
    moveToXY(x, y) {}

    activate() {
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        return ['activateToken', this.id, 'click_' + this.id];
    }

    click() {
        if (this.gameController) {
            this.gameController.currentState.emit('click', this.id, this);
        }
        this.emit('click', this);
    }

    highlight() {}
    show() {}
    hide() {}
    draw() {
        if (this.template instanceof templates.ShapeTemplate) {
            if (this.template._shape == templates.shapes.CIRCLE) {
                return ['drawShape',
                    this.id,
                    this.template._shape,
                    this.template._fill,
                    this.template._stroke,
                    this.template._layer,
                    this.template._x,
                    this.template._y,
                    this.template._radius];
            }
        }

        if (this.template instanceof templates.ImageTemplate) {
            return ['drawImage',
                this.id,
                this.template._src,
                this.template._layer,
                this.template._x,
                this.template._y,
            ];

        }
    }
}
module.exports.Token = Token;

class PlayerToken extends Token {
    constructor (id, category, x, y, template=templates.PLAYER_TOKEN_DEFAULT) {
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
global.game = new Game();
