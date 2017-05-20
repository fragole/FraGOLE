var Statistic = require('./Statistic.js').Statistic;
var templates = require('../FragoleTemplates.js');

class Progress extends Statistic {
    constructor(id, x, y, color, label, value, max, template=templates.PROGRESS_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.content_id = 'progress_' + id;
        this.context.color = color;
        this.context.max = max;
    }
}
module.exports.Progress = Progress;

class PlayerProgress extends Progress {
    constructor(id, color, label, value, max, template=templates.PLAYER_PROGRESS_DEFAULT) {
        super(id, 0,0, color, label, value, max, template);
    }

    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrOwner(players, this, cmd);
    }
}
module.exports.PlayerProgress = PlayerProgress;
