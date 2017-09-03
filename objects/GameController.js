/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-08-31T12:31:36+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module GameController */
const GameObject = require('./GameObject.js').GameObject;
const Collection = require('./Collection.js').Collection;
const GameState = require('./GameState.js').GameState;
const templates = require('../lib/FragoleTemplates.js');
const Player = require('./Player.js').Player;
const PlayerToken = require('./PlayerToken.js').PlayerToken;
const Waypoint = require('./Waypoint.js').Waypoint;
const Lib = require('../lib/FragoleLib.js');

const ID = 0;
const ITEM = 1;

/** Class GameController
* @extends {module:GameObject~GameObject}
* handles the Games State-Machine
* emits events (to it self and to the current GameState)
* handles RPC-Calls to the clients
* Provides client-chat, messaging and logging
* Watchdog-Timer may be used to handle client inactivity
*/
class GameController extends GameObject {
    /**
    * Create a GameController instance
    * @param {string} id - unique id of the gamecontroller
    * @param {number} minPlayers - minimum players to start the game
    * @param {FragoleServer} rpcServer - an FragoleServer-Instance
    */
    constructor(id, minPlayers=1, rpcServer=undefined) {
        super(id);
        this.rpcServer = rpcServer;
        this.minPlayers = minPlayers;
        this.players = new Collection();
        this.playersId = {};
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

    /**
    * add a Player to the Game
    * @param {Player} player - an instance of Player
    */
    addPlayer(player) {
        this.players.addItem(player);
        return this;
    }

    /**
    * add GameObjects to the game
    * GameController-Instance will also be connected to each ojbect (=> object.gameController)
    * @param {Array<GameItem>} items - an array of GameItem-Objects
    */
    addItems(items) {
        for (let item in items) {
            this.items[item] = items[item];
            items[item].gameController = this;
        }
    }

    /**
    * draw the initial gameboard. Object added via addItems will be drawn.
    * if object.supressSetup is true, this object will be skipped
    */
    setupBoard() {
        for (let i in this.items) {
            let item = this.items[i];
            if (item.supressSetup) {
                continue;
            }
            switch(item.constructor.name) {
                case 'Waypoint':
                    item.draw();
                    break;
                case 'PlayerToken':
                    if (item.owner.joined) {
                        item.draw();
                    }
                    break;
                case 'PlayerStatistic':
                case 'CardHand':
                    if (item.owner && item.owner.joined) {
                        item.draw(item.owner);
                    }
                    break;
                case 'Statistic':
                case 'Progress':
                case 'CardStack':
                case 'Button':
                    item.draw();
                    break;
                default:
                    break;
            }
        }
    }

    // called when a new Player joins
    joinPlayer(name, connection) {
        let player;
        let clientProxy = connection.clientProxy;

        // check if this player has already joined XXX check client-ip
        for (let p of this.players.iterator()) {
            p = p[ITEM];
            if (p.name === name) {
                p.init(name, clientProxy);
                this.emit('joinPlayer', p);
                return p;
            }
        }

        try {
            player = this.playersIterator.next().value[ITEM];
        } catch(e) {
            player = undefined;
        }

        if (player) {
            player.init(name, clientProxy);
            player.joined = true;
            this.joinedPlayers.push(player);
            this.playersId[connection.id] = player;
            this.emit('joinPlayer', player);
            return player;
        }
        return undefined;
    }

    /**
    * advance the FSM to state:
    * exit() of old state is called
    * state is changed
    * enter() of new state is called
    * @param {GameState} state - the state to which should be switched
    */
    nextState(state) {
        this.currentState.exit(this);
        this.currentState=state;
        state.enter(this);
    }

    /**
    * pass the turn to the next player
    * you may set Player.skipTurns to a positive number => this player will be
    * skipped until Player.skipTurns <= 0 (it's decremented each time it would be the players turn)
    */
    nextPlayer() {
        let currentIdx;
        let playerCount = this.joinedPlayers.length;

        if (!this.activePlayer) {
            this.activePlayer = this.joinedPlayers[0];
        } else {
            currentIdx = this.joinedPlayers.indexOf(this.activePlayer);
            this.activePlayer = this.joinedPlayers[++currentIdx % playerCount];
            if (this.activePlayer.skipTurns !== 0) {
                this.activePlayer.skipTurns -= 1;
                this.next_player();
            }
        }
        return this.activePlayer;
    }

    /**
    * send a chat msg to all players
    * the message-object looks like this: {msg: 'content'}
    * @param {Player} player - the player who is sending the message
    * @param {Object} msg - Object containing the message
    */
    // TODO: add msg.players like in sendPopup
    sendChat(player, msg) {
        let msgId = '#chat_msg_' + (++this.chatCnt);
        let cmd = (['addDomContent',
            this.chatMsg.content({player: player, msg: msg, msgId: msgId}),
            '#' + this.chatMsg.parent,
            msgId]);
        this.rpcListOrAll(null, cmd);
    }

    /**
    * send a log message to all players
    * the message-object looks like this: {msg: 'content', icon: 'icon'}
    * @param {string} src - the source of the message
    * @param {Object} msg - Object containing the message
    */
    // TODO: add msg.players like in sendPopup
    sendLog(src, msg) {
        let msgId = '#log_msg_' + (++this.logCnt);
        let cmd = (['addDomContent',
            this.logMsg.content({src: src, msg: msg.content, icon:msg.icon, msgId: msgId}),
            '#' + this.logMsg.parent,
            msgId]);
        this.rpcListOrAll(null, cmd);
    }

    /**
    * send a popup message to specified players
    * the message-object looks like this:
    * {msg: 'content', color: 'color', icon: 'icon', x: pos_x, y: pos_y,
       players: arrayOfPlayers}
    * @param {string} src - the source of the message
    * @param {Object} msg - Object containing the message
    */
    sendPopup(msg) {
        this.popupContext= Lib.mergeDicts({header: msg.header,
            msg: msg.msg,
            color:msg.color,
            icon:msg.icon,
            x: msg.x,
            y:msg.y},
             this.popupMsg.context);

        let cmd = (['addDomContent',
            this.popupMsg.content(this.popupContext),
            '#' + this.popupMsg.parent,
            '#popup_msg']);
        this.rpcListOrAll(msg.players, cmd);
    }

    /**
    * return owner(s) of an object
    * if owner is not specified return list of all players
    * @param {GameObject} item - find owners of this object
    */
    getOwner(item) {
        if(item.owner) {
            return item.owner;
        } else {
            return this.joinedPlayers;
        }
    }

    /**
    * send a RPC-Call to clients specified by 'players' or to all connected clients
    * @param {Player | Array<Player>} players - Player-Instance or Array of Players
    * @param {Object} cmd - a valid RPC-Cmd (see client-API)
    */
    rpcListOrAll(players, cmd) {
        if (players) {
            this.rpcCall(players, cmd);
        } else {
            this.rpcCall(this.joinedPlayers, cmd);
        }
    }

    /**
    * send a RPC-Call to clients specified by 'players' or to the ovner of 'item'.
    * Precedence: players over item
    * @param {Player | Array<Player>} players - Player-Instance or Array of Players
    * @param {GameObject} - send to owner of this object
    * @param {Object} cmd - a valid RPC-Cmd (see client-API)
    */
    rpcListOrOwner(players, item, cmd) {
        if (players) {
            this.rpcCall(players, cmd);
        } else {
            this.rpcCall(this.getOwner(item), cmd);
        }
    }

    rpcCall(players, args) {
        let func = args[0];
        let _args = Array.prototype.slice.call(args, 1);
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

    /**
    * emit an event to the GameController itself
    * and to the current GameState
    * reset the Watchdog-Timer
    */
    emit() {
        this.setWatchdog(); // any event passed through here resets wd
        this.currentState.emit(...arguments);
        super.emit(...arguments);
    }

    /**
    * set or reset the watchdog-timer
    * @param {number} time - wotchdog-interval in seconds
    */
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
