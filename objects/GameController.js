var GameObject = require('./GameObject.js').GameObject;
var Collection = require('./Collection.js').Collection;
var GameState = require('./GameState.js').GameState;
var templates = require('../FragoleTemplates.js');

const ID = 0;
const ITEM = 1;

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

        // dashboard-eventlog
        this.logMsg = new templates.LOG_DEFAULT();
        this.logCnt = 0;

        // popup msg
        this.popupMsg = new templates.POPUP_DEFAULT();
        this.popupContext = {};

        // Watchdog Timer (default 60 sec)
        this.watchdogSecs = 60;
        this.watchdogTimer = null;
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

    sendLog(src, msg) {
        var msg_id = '#log_msg_' + (++this.logCnt);
        var cmd = (['addDomContent',
            this.logMsg.content({src: src, msg: msg.content, icon:msg.icon, msg_id: msg_id}),
            '#' + this.logMsg.parent,
            msg_id]);
        this.rpcListOrAll(null, cmd);
    }

    sendPopup(msg) {
        this.popupContext= {header: msg.header, msg: msg.msg, color:msg.color, icon:msg.icon, x: msg.x, y:msg.y};
        for(let add_context in this.popupMsg.context) {
            if(!this.popupContext[add_context]) {
                this.popupContext[add_context] = this.popupMsg.context[add_context];
            }
        }
        var cmd = (['addDomContent',
            this.popupMsg.content(this.popupContext),
            '#' + this.popupMsg.parent,
            '#popup_msg']);
        this.rpcListOrAll(msg.players, cmd);
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

    emit() {
        this.setWatchdog(); // any event passed through here resets wd
        this.currentState.emit(...arguments);
        super.emit(...arguments);
    }

    // set or reset the watchdog-timer
    setWatchdog(time=undefined) {
        if (time) {
            this.watchdogSecs = time;
        }
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = setTimeout(this.watchdog, this.watchdogSecs * 1000, this);
    }

    // called when the watchdog-timer fires
    watchdog(context) {
        context.emit('watchdog');
    }
}
module.exports.GameController = GameController;
