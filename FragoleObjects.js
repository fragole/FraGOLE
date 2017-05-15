var templates = require('./FragoleTemplates.js');
var {nomalizeCoordinates} = require('./FragoleLib.js');
const EventEmitter = require('events');

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
                RPC_ALL(item.draw());
            }
            if (item instanceof Player && item.joined) {
                for (let i of item.inventory.iterator()) {
                    if (i[1] instanceof PlayerToken) {
                        RPC_ALL(i[1].draw());
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
        this.custVars = {};
    }

    // assign custom vars
    set(name, value) {
        this.custVars[name] = value;
    }

    get(name) {
        return this.custVars[name];
    }

    clearCustVars() {
        this.custVars = {};
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
        this.joinedPlayers = [];
        this.activePlayer = undefined;
        this.currentState = new GameState('NULL');
        this.playersIterator = this.players.iterator();

        // connect chat to rpcServer
        this.rpcServer.connect('send_chat', this.sendChat, this);
        this.chatMsg = new templates.CHAT_DEFAULT();
        this.chatCnt = 0;
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
            this.joinedPlayers.push(player);
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

    next_player() {
        var currentIdx;
        var playerCount = this.joinedPlayers.length;

        if (!this.activePlayer) {
            this.activePlayer = this.joinedPlayers[0];
        } else {
            currentIdx = this.joinedPlayers.indexOf(this.activePlayer);
            this.activePlayer = this.joinedPlayers[++currentIdx % playerCount];
            if (this.activePlayer.skip_turns != 0) {
                this.activePlayer.skip_turns -= 1;
                this.next_player();
            }
        }
        return this.activePlayer;
    }

    sendChat(player, msg) {
        var msg_id = '#chat_msg_' + (++this.chatCnt);
        RPC_ALL(['addDomContent',
            this.chatMsg.content({player: player, msg: msg, msg_id: msg_id}),
            '#' + this.chatMsg.parent,
            msg_id]);
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
        this.skip_turns = 0;
    }

    addInventory (item) {
        this.inventory.addItem(item);
    }

    getInventory( {id='', category=''} ) {
        if (id) {
            return this.inventory.getItem(id);
        } else if (category) {
            return this.inventory.getCategory(category);
        }
    }

    removeInventory (item) {
        this.inventor.deleteItem(item);
    }

}
Player.playerNumber = 0;
module.exports.Player = Player;

class Token extends GameItem {
    constructor (id, category='', x, y, template, drawable=1) {
        super(id, category);
        this.x = x;
        this.y = y;
        this.template = new template().x(x).y(y);
        this.waypoint = undefined;
    }

    moveToWaypoint(waypoint, path=true) {
        var wp_tpl = waypoint.template,
            to = nomalizeCoordinates(this, wp_tpl._x, wp_tpl._y);
        this.waypoint = waypoint;
        return ['moveToken', this.id, [to]];
    }

    moveToXY(x, y) {}

    activate() {
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        return ['activateToken', this.id, 'click_' + this.id];
    }

    deactivate () {
        this.gameController.rpcServer.disconnect('click_' + this.id);
        return ['deactivateToken', this.id];
    }

    click() {
        if (this.gameController) {
            this.gameController.currentState.emit('click', this.id, this);
        }
        this.emit('click', this);
    }

    highlight() {
        return ['highlightToken', this.id];
    }

    unhighlight() {
        return ['unhighlightToken', this.id];
    }

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
        this.tokens=[];
    }
}
module.exports.Waypoint = Waypoint;

class Component extends GameItem {
    constructor (id, template) {
        super(id, '');
        this.template = new template();
        this.context = {};
    }

    draw() {
        return ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.content_id
        ];
    }
}

class Dice extends Component {
    constructor(id, sides, template=templates.DICE_DEFAULT) {
        super(id, template);
        this.sides = sides;
        this.content_id = 'dice_' + id;
        this.context = {id: this.id, content_id: this.content_id};
    }

    draw() {
        this.gameController.rpcServer.connect('roll_' + this.id, this.roll, this);
        return super.draw();
    }

    roll() {
        this.result = Math.floor(Math.random() * this.sides + 1);
        this.context = {id: this.id, content_id: this.content_id, result: this.result};
        if (this.gameController) {
            this.gameController.currentState.emit('roll', this.id, this);
        }
        this.emit('roll', this);
    }

    rollResult() {
        return super.draw();
    }

    reset() {
        this.context = {id: this.id, content_id: this.content_id};
    }
}
module.exports.Dice = Dice;

// --------------------- Global Objects ---------------------------------------
// at The moment only gameController should be Global
global.game = new Game();

// glabals
var game = global.game;

function callAll(args) {
    var func = args[0],
        _args = Array.prototype.slice.call(args, 1);
    for(let player of game.gameController.players.iterator()) {
        if(player[ITEM].session) {
            player[ITEM].session[func](..._args);
        }
    }
}

// call remote function on all clients, except the one specified by player
function callAllBut(exclude_player, args) {
    var func = args[0],
        _args = Array.prototype.slice.call(args, 1);
    for(let player of game.gameController.players.iterator()) {
        if(player[ITEM].session && player[ITEM].id != exclude_player.id) {
            player[ITEM].session[func](..._args);
        }
    }
}

function callOne(player, args) {
    var func = args[0],
        _args = Array.prototype.slice.call(args, 1);
    player.session[func](..._args);
}

global.RPC_ALL = callAll;
global.RPC_ONE = callOne;
global.RPC_ALL_EX = callAllBut;
