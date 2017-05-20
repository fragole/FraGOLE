var Statistic = require('./Statistic.js').Statistic;
var templates = require('../FragoleTemplates.js');

class Rating extends Statistic {
    constructor(id, x, y, type, label, value, max, template=templates.RATING_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.content_id = 'rating_' + id;
        this.context.type = type;
        this.context.max = max;
    }
}
module.exports.Rating = Rating;

class PlayerRating extends Rating {
    constructor(id, type, label, value, max, template=templates.PLAYER_RATING_DEFAULT) {
        super(id, 0, 0, type, label, value, max, template);
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
module.exports.PlayerRating = PlayerRating;
