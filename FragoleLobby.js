/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:53:29+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var pug = require('pug');
const EventEmitter = require('events');

class FragoleLobby extends EventEmitter {
    constructor (controller) {
        super();
        this.controller = controller;
        this.controller.rpcServer.connect('playerReady', this.playerReady, this);
        this.playersReady = {};
        this.lobbyComp = pug.compileFile('./components/lobby.pug');
        this.playerComp = pug.compileFile('./components/lobby_player.pug');
        this.playerReadyComp = pug.compileFile('./components/lobby_player_ready.pug');
    }

    joinPlayer(player) {
        this.playersReady[player.id] = 0;
        this.controller.rpcListOrAll(player, ['addDomContent', this.lobbyComp({id:player.id, player:player.name, }), '#board_div', '#lobby']);
        this.controller.rpcListOrAll(null, ['emptyDomContent', '#lobby_players']);
        for (let id in this.playersReady) {
            var p = this.controller.players.getItem(id);
            var locals = {id:p.id, player:p.name, number:p.number};
            if (this.playersReady[id]==1) {
                this.controller.rpcListOrAll(null, ['addDomContent', this.playerReadyComp(locals), '#lobby_players', '#lobby_' + p.id]);
            } else {
                this.controller.rpcListOrAll(null, ['addDomContent', this.playerComp({id:p.id, player:p.name, number:p.number}), '#lobby_players', '#lobby_' + p.id]);
            }
        }
    }

    quit() {
        this.controller.rpcListOrAll(null, ['removeDomContent', '#lobby']);
    }

  // called by client
    playerReady(playerId) {
        var player = this.controller.players.getItem(playerId);
        this.playersReady[player.id] = 1;
        this.controller.rpcListOrAll(null, ['addDomContent', this.playerReadyComp({id:player.id, player:player.name, number:player.number}), '#lobby_players', '#lobby_' + player.id]);
        console.log(player.name, ' ready');

        var sumReady = 0;
        for (let i in this.playersReady) {
            sumReady += this.playersReady[i];
        }
        if (sumReady == Object.keys(this.playersReady).length) {
            this.emit('allPlayersReady');
        }
    }
}
module.exports = FragoleLobby;
