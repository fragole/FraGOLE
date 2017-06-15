/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-15T19:56:50+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const GameObject = require('./GameObject.js').GameObject,
    Collection = require('./Collection.js').Collection,
    GameState = require('./GameState.js').GameState,
    templates = require('../FragoleTemplates.js'),
    Player = require('./Player.js').Player,
    PlayerToken = require('./PlayerToken.js').PlayerToken,
    Waypoint = require('./Waypoint.js').Waypoint,
    Lib = require('../FragoleLib.js');

const ID = 0;
const ITEM = 1;

// GameController
// * handles the Games State-Machine
// * emits events (to it self and to the current GameState)
// * handles RPC-Calls to the clients
// * Provides client-chat, messaging and logging
// * Watchdog-Timer may be used to handle client inactivity
// args:
// minPlayers: minimum players to start the game
// rpcServer: an FragoleServer-Instance
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
        this.items = {};

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

    // add a Player to the Game
    addPlayer(player) {
        this.players.addItem(player);
        return this;
    }

    // assign GameObject to the game
    // GameController-Instance will be connected to everyone
    addItems (items) {
        for (let item in items) {
            this.items[item] = items[item];
            items[item].gameController = this;
        }
    }

    // draw the initial gameboard => Waypoints and PlayerTokens will be drawn
    setupBoard() {
        for (let i in this.items) {
            var item = this.items[i];
            switch(item.constructor.name) {
                case 'Waypoint':
                    item.draw();
                    break;
                case 'PlayerToken':
                    if (item.owner.joined) {
                        item.draw();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // called when a new Player joins
    joinPlayer(name, clientProxy) {
        var player;

        // check if this player has already joined XXX check client-ip
        for (let p of this.players.iterator()) {
            p = p[ITEM];
            if (p.name == name) {
                p.init(name, clientProxy);
                this.emit('joinPlayer', p);
                return p;
            }
        }

        try {
            player = this.playersIterator.next().value[ITEM];
        } catch(e) { player = undefined; }

        if (player) {
            player.init(name, clientProxy);
            player.joined = true;
            this.joinedPlayers.push(player);
            this.emit('joinPlayer', player);
            return player;
        }
        return undefined;
    }

    // advance the FSM to state:
    // exit() of old state is called
    // state is changed
    // enter() of new state is called
    next_state(state) {
        this.currentState.exit();
        this.currentState=state;
        state.enter();
    }

    // pass the turn to the next player
    // you may set Player.skip_turns to a positiv number => this player will be
    // skipped until Player.skip_turns <= 0;
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

    // send a chat msg to all players
    // XXX: add msg.players like in sendPopup
    sendChat(player, msg) {
        var msg_id = '#chat_msg_' + (++this.chatCnt);
        var cmd = (['addDomContent',
            this.chatMsg.content({player: player, msg: msg, msg_id: msg_id}),
            '#' + this.chatMsg.parent,
            msg_id]);
        this.rpcListOrAll(null, cmd);
    }

    // send a log msg to all players
    // XXX: add msg.players like in sendPopup
    sendLog(src, msg) {
        var msg_id = '#log_msg_' + (++this.logCnt);
        var cmd = (['addDomContent',
            this.logMsg.content({src: src, msg: msg.content, icon:msg.icon, msg_id: msg_id}),
            '#' + this.logMsg.parent,
            msg_id]);
        this.rpcListOrAll(null, cmd);
    }

    // send a popup-msgs to msg.players
    sendPopup(msg) {
        this.popupContext= Lib.mergeDicts({header: msg.header,
            msg: msg.msg,
            color:msg.color,
            icon:msg.icon,
            x: msg.x,
            y:msg.y},
             this.popupMsg.context);

        var cmd = (['addDomContent',
            this.popupMsg.content(this.popupContext),
            '#' + this.popupMsg.parent,
            '#popup_msg']);
        this.rpcListOrAll(msg.players, cmd);
    }

    // return owner(s) of an object
    // if owner is specified return list of all players
    // item: GameObject
    getOwner(item) {
        if(item.owner) {
            return item.owner;
        } else {
            return this.joinedPlayers;
        }
    }

    // send a RPC-Call to clients specified by 'players' or to all connected
    // clients
    // players: Player-Instance or Array of Players
    // cmd: a valid RPC-Cmd (see client-API)
    rpcListOrAll(players, cmd) {
        if (players) {
            this.rpcCall(players, cmd);
        } else {
            this.rpcCall(this.joinedPlayers, cmd);
        }
    }

    // send a RPC-Call to clients specified by 'players' or to the ovner of 'item'
    // players: Player-Instance or Array of Players
    // item: GameObject
    // cmd: a valid RPC-Cmd (see client-API)
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

    // emit an event to the GameController itself
    // and to the current GameState
    // reset the Watchdog-Timer
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
    // context == this
    watchdog(context) {
        context.emit('watchdog');
    }
}
module.exports.GameController = GameController;
