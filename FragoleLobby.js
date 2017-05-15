var pug = require('pug');
const EventEmitter = require('events');

class FragoleLobby extends EventEmitter {
    constructor () {
        super();
        game.gameController.rpcServer.connect('playerReady', this.playerReady, this);
        this.playersReady = {};
        this.lobbyComp = pug.compileFile('./components/lobby.pug');
        this.playerComp = pug.compileFile('./components/lobby_player.pug');
        this.playerReadyComp = pug.compileFile('./components/lobby_player_ready.pug');
    }

    joinPlayer(player) {
        this.playersReady[player.id] = 0;
        RPC_ONE(player, ['addDomContent', this.lobbyComp({id:player.id, player:player.name, }), '#board_div', '#lobby']);
        RPC_ALL(['emptyDomContent', '#lobby_players']);
        for (let id in this.playersReady) {
            var p = game.gameController.players.getItem(id);
            var locals = {id:p.id, player:p.name, number:p.number};
            if (this.playersReady[id]==1) {
                RPC_ALL(['addDomContent', this.playerReadyComp(locals), '#lobby_players', '#lobby_' + p.id]);
            } else {
                RPC_ALL(['addDomContent', this.playerComp({id:p.id, player:p.name, number:p.number}), '#lobby_players', '#lobby_' + p.id]);
            }
        }
    }

    quit() {
        RPC_ALL(['removeDomContent', '#lobby']);
    }

  // called by client
    playerReady(playerId) {
        var player = game.gameController.players.getItem(playerId);
        this.playersReady[player.id] = 1;
        RPC_ALL(['addDomContent', this.playerReadyComp({id:player.id, player:player.name, number:player.number}), '#lobby_players', '#lobby_' + player.id]);
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
