var GameItem = require('./GameObject.js').GameItem;

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
module.exports.Component = Component;
