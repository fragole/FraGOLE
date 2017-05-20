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
                item.draw();
            }
            if (item instanceof Player && item.joined) {
                for (let i of item.inventory.iterator()) {
                    if (i[ITEM] instanceof PlayerToken) {
                        i[ITEM].draw();
                    }
                }
            }
        }
    }
}
module.exports.Game = Game;

class GameObject extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.gameController = undefined;
        this.owner = undefined;
        this.vars = {};
        this.var_subscribers = {};
    }

    // assign custom vars
    set(name, value) {
        this.vars[name] = value;
        if(this.var_subscribers[name] instanceof Array) {
            for(let item_players of this.var_subscribers[name]) {
                var item, players;
                [item, players] = item_players;
                item.update(value, players);
            }
        }
    }

    get(name) {
        return this.vars[name];
    }

    // subscribe to a var of this object
    // func will be called when set() for this var is called
    subscribe(name, item, players=undefined) {
        if(this.var_subscribers[name] instanceof Array) {
            this.var_subscribers[name].push([item, players]);
        } else {
            this.var_subscribers[name] = [[item, players]];
        }
    }

    clearCustVars() {
        this.custVars = {};
        this.var_subscribers = {};
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
        var cmd = (['addDomContent',
            this.chatMsg.content({player: player, msg: msg, msg_id: msg_id}),
            '#' + this.chatMsg.parent,
            msg_id]);
        this.rpcListOrAll(null, cmd);
    }

    // return owner(s) of an object
    // if owner is specified return list of all players
    getOwner(item) {
        if(item.owner) {
            return item.owner;
        } else {
            return this.joinedPlayers;
        }
    }

    rpcListOrAll(players, cmd) {
        if (players) {
            this.rpcCall(players, cmd);
        } else {
            this.rpcCall(this.joinedPlayers, cmd);
        }
    }

    rpcListOrOwner(players, item, cmd) {
        if (players) {
            this.rpcCall(players, cmd);
        } else {
            this.rpcCall(this.getOwner(item), cmd);
        }
    }

    rpcCall(players, args) {
        var func = args[0],
            _args = Array.prototype.slice.call(args, 1);

        if(players instanceof Array) {  // list of players
            for(let player of players) {
                if(player.session) {
                    player.session[func](..._args);
                }
            }
        } else { // single player
            players.session[func](..._args);
        }
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
        this.inventor.deleteItem(item);
        item.owner = undefined;
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

    // move token to a waypoint
    // standard-target => all players;
    moveToWaypoint(waypoint, players=undefined) {
        var wp_tpl = waypoint.template,
            to = nomalizeCoordinates(this, wp_tpl._x, wp_tpl._y),
            cmd =['moveToken', this.id, [to]];

        this.waypoint = waypoint;

        this.gameController.rpcListOrAll(players, cmd);
    }

    // activate click-handler a Token
    // standard-target => owner
    activate(players=undefined) {
        var cmd = ['activateToken', this.id, 'click_' + this.id];

        // register callback-function in rpc-server
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // deactivate click handler for a token
    // standard-target => owner
    deactivate (players=undefined) {
        var cmd = ['deactivateToken', this.id];

        this.gameController.rpcServer.disconnect('click_' + this.id);
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // visually highlight the token on client-side ('form' depends on client implementation)
    // standard-target => owner
    highlight(players=undefined) {
        var cmd = ['highlightToken', this.id];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // stop highlighting the token on client-side ('form' depends on client implementation)
    // standard-target => owner
    unhighlight(players=undefined) {
        var cmd = ['unhighlightToken', this.id];

        this.gameController.rpcListOrOwner(players, this, cmd);
    }

    // draw the token in the client browser
    // standard-target => all joined players
    draw(players=undefined) {
        var cmd;

        if (this.template instanceof templates.ShapeTemplate) {
            if (this.template._shape == templates.shapes.CIRCLE) {
                cmd= ['drawShape',
                    this.id,
                    this.template._shape,
                    this.template._fill,
                    this.template._stroke,
                    this.template._layer,
                    this.template._x,
                    this.template._y,
                    this.template._radius];
            }
        } else if (this.template instanceof templates.ImageTemplate) {
            cmd = ['drawImage',
                this.id,
                this.template._src,
                this.template._layer,
                this.template._x,
                this.template._y,
            ];
        }

        this.gameController.rpcListOrAll(players, cmd);
    }

    // EVENTS
    click() {
        if (this.gameController) {
            this.gameController.currentState.emit('click', this.id, this);
        }
        this.emit('click', this);
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

    // draw a Component to the client document
    // standard-target => all player;
    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.content_id
        ];

        this.gameController.rpcListOrAll(players, cmd);

    }
}

class Dice extends Component {
    constructor(id, sides, template=templates.DICE_DEFAULT) {
        super(id, template);
        this.sides = sides;
        this.content_id = 'dice_' + id;
        this.context = {id: this.id, content_id: this.content_id};
    }

    draw(players=undefined) {
        this.gameController.rpcServer.connect('roll_' + this.id, this.roll, this);
        return super.draw(players);
    }

    roll() {
        this.result = Math.floor(Math.random() * this.sides + 1);
        this.context = {id: this.id, content_id: this.content_id, result: this.result};
        if (this.gameController) {
            this.gameController.currentState.emit('roll', this.id, this);
        }
        this.emit('roll', this);
    }

    rollResult(players=undefined) {
        return super.draw(players);
    }

    reset() {
        this.context = {id: this.id, content_id: this.content_id};
    }
}
module.exports.Dice = Dice;

class Statistic extends Component {
    constructor(id, x, y, label, value, icon=undefined, img=undefined, template=templates.STATISTIC_DEFAULT) {
        super(id, template);
        this.context.content_id = 'stat_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.img = img;
        this.context.icon = icon;
        this.context.value = value;
        this.update.bind(this);
    }

    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrAll(players, cmd);
    }

    update(value) {
        this.context.value = value;
        this.draw();
    }
}
module.exports.Statistic = Statistic;

class PlayerStatistic extends Statistic {
    constructor(id, label, value, icon=undefined, img=undefined, template=templates.PLAYER_STATISTIC_DEFAULT) {
        super(id, 0, 0, label, value, icon, img, template);
    }

    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }

}
module.exports.PlayerStatistic = PlayerStatistic;

class Rating extends Statistic {
    constructor(id, x, y, type, label, value, max, template=templates.RATING_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.content_id = 'rating_' + id;
        this.context.type = type;
        this.context.max = max;
    }
}
module.exports.Rating = Rating;

class PlayerRating extends Rating {
    constructor(id, type, label, value, max, template=templates.PLAYER_RATING_DEFAULT) {
        super(id, 0, 0, type, label, value, max, template);
    }

    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }
}
module.exports.PlayerRating = PlayerRating;

class Progress extends Statistic {
    constructor(id, x, y, color, label, value, max, template=templates.PROGRESS_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.content_id = 'progress_' + id;
        this.context.color = color;
        this.context.max = max;
    }
}
module.exports.Progress = Progress;

class PlayerProgress extends Progress {
    constructor(id, color, label, value, max, template=templates.PLAYER_PROGRESS_DEFAULT) {
        super(id, 0,0, color, label, value, max, template);
    }

    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }
}
module.exports.PlayerProgress = PlayerProgress;
