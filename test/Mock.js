/**
 * @Author: Michael Bauer
 * @Date:   2017-07-14T18:02:08+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-14T19:16:53+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const EventEmitter = require('events');

class MockController extends EventEmitter {
    constructor() {
        super();
        this.items = {};
        this.rpcServer = {
            rpcFunctions: [],
            connect() {
                this.rpcFunctions.push(arguments[0]);
            },
            disconnect() {
                let i = this.rpcFunctions.indexOf(arguments[0]);
                this.rpcFunctions.splice(i,1);
            }
        };
        this.rpcCmd = undefined;
    }

    addItems(items) {
        for (let item in items) {
            this.items[item] = items[item];
            items[item].gameController = this;
        }
    }

    rpcListOrAll(players, cmd) {
        this.rpcCall(players, cmd);
    }

    rpcListOrOwner(players, item, cmd) {
        this.rpcCall(players, item, cmd);
    }

    rpcCall(players, args) {
        this.rpcCmd = [players, args];
    }

    emit() {
        super.emit(...arguments);
    }
}
module.exports = {MockController: MockController};
