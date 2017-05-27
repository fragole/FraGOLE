var GameItem = require('./GameObject.js').GameItem;

class Component extends GameItem {
    constructor (id, template) {
        super(id, '');
        this.template = new template();
        this.context = {};
        this.context.id = id;
    }

    // draw a Component to the client document
    // standard-target => all player;
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

    remove(players=undefined, id=undefined) {
        var remove_id = this.context.content_id;
        if (id) {
            remove_id = id;
        }
        var cmd = ['removeDomContent',
            '#' + remove_id,
            400
        ];
        this.gameController.rpcListOrAll(players, cmd);
    }

    activate(players=undefined) {
        this.gameController.rpcServer.connect('click_' + this.id, this.click, this);
        this.context.activate = 'on';
        this.draw(players);
    }

    deactivate(players=undefined) {
        this.context.activate = 'off';
        this.draw(players);
        this.context.activate = null;
        this.gameController.rpcServer.disconnect('click_' + this.id);
    }

    highlight(players=undefined) {
        this.context.highlight = 'on';
        this.draw(players);
    }

    unhighlight(players=undefined) {
        this.context.highlight = 'off';
        this.draw(players);
        this.context.highlight = null;
    }

    // EVENTS
    click() {
        if (this.gameController) {
            this.gameController.emit('click', this.id, this);
        }
    }


}
module.exports.Component = Component;
