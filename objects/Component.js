/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-16T23:42:17+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var GameItem = require('./GameObject.js').GameItem;

// Components is the base-class for all HTML-Based (client-side) items
class Component extends GameItem {
    constructor (id, template) {
        super(id, '');
        this.template = new template();
        this.context = {};
        this.context.id = id;
        this.supress_setup = false; // set true to supress drawing by setupBoard
    }

    // draw a Component to the client document
    // standard-target => all players
    draw(players=undefined, item=undefined) {
        // if context-vars are defined by the template => add them to the 'local' context
        for(let add_context in this.template.context) {
            if(!this.context[add_context]) {
                this.context[add_context] = this.template.context[add_context];
            }
        }
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        if (item) {
            this.gameController.rpcListOrOwner(players, item, cmd);
        } else {
            this.gameController.rpcListOrAll(players, cmd);
        }
    }

    // remove a Component from the Client-DOM
    remove(players=undefined, id=undefined) {
        var remove_id = this.context.content_id;
        if (id) {
            remove_id = id;
        }
        var cmd = ['removeDomContent',
            '#' + remove_id,
            400   // this is for easing on the client side
        ];
        this.gameController.rpcListOrAll(players, cmd);
    }

    // connects a click-handler to the Component
    // registers a corresponding function in the RPC-Server
    activate(players=undefined) {
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        this.context.activate = 'on';
        this.draw(players);
    }

    // removes the click-handler from the component
    // disconnects the click-function in the RPC-Server
    deactivate(players=undefined) {
        this.context.activate = 'off';
        this.draw(players);
        this.context.activate = null;
        this.gameController.rpcServer.disconnect('click_' + this.id);
    }

    // sets highlighting of the compontent on
    // how the highlighting is done is dertermined by the template
    highlight(players=undefined) {
        this.context.highlight = 'on';
        this.draw(players);
    }

    // sets highlighting of the componte off
    unhighlight(players=undefined) {
        this.context.highlight = 'off';
        this.draw(players);
        this.context.highlight = null;
    }

    // EVENTS - these are normaly triggerd by the client

    // component was clicked => send event
    click(clientId) {
        //console.log(this.gameController.playersId[clientId]);
        this.gameController.emit('click', this.id, this);
    }


}
module.exports.Component = Component;
