/**
 * @Author: Michael Bauer
 * @Date:   2017-07-14T17:55:41+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-14T21:30:27+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const assert = require('assert');
const sinon = require('sinon');
const MockController = require('./Mock.js').MockController;
const Button = require('../objects/FragoleObjects.js').Button;

describe('Button', function () {
    let gameController = new MockController();
    let button = new Button('button', 1, 1, 'Button', 'green', 'icon');
    let expA =[undefined, ['addDomContent', '<div class="ui disabled green button" id="btn_button" style="position:absolute; top:1; left:1;">Button</div>', '#board_div', '#btn_button']];

    before(function () {
        gameController.addItems([button]);
    });

    describe('.draw()', function () {
        it('shoud produce a correct addDomContent-Cmd', function () {
            button.draw();

            assert.deepEqual(expA, gameController.rpcCmd);
        });
    });

    describe('.activate()', function () {
        it('shoud produce a correct addDomContent-Cmd', function () {
            button.activate();
            let exp =[undefined, ['addDomContent', '<div class="ui green button" id="btn_button" onClick="rpcServer.click_button(gameboard.clientId);" style="position:absolute; top:1; left:1;">Button</div>', '#board_div', '#btn_button']];
            assert.deepEqual(exp, gameController.rpcCmd);
            assert.deepEqual(['click_button'], gameController.rpcServer.rpcFunctions);
        });
    });

    describe('.deactivate()', function () {
        it('shoud produce a correct addDomContent-Cmd', function () {
            button.deactivate();
            assert.deepEqual(expA, gameController.rpcCmd);
            assert.deepEqual([], gameController.rpcServer.rpcFunctions);
        });
    });


    describe('.highlight()', function () {
        // NYI for Button
        it('shoud produce a correct addDomContent-Cmd');
    });

    describe('.unhighlight()', function () {
        // NYI for Button
        it('shoud produce a correct addDomContent-Cmd');
    });



    describe('.click()', function () {
        it('should emit a click event', function () {
            let spy = sinon.spy();
            gameController.on('click', spy);
            button.click();
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, 'button', button);
        });
    });
});
