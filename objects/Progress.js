/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:45:05+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Statistic = require('./Statistic.js').Statistic;
var templates = require('../lib/FragoleTemplates.js');

// Implements a client-side progress-bar which can be drawn on the gameboard
// see Statistic Base-Class for details
class Progress extends Statistic {
    constructor(id, x, y, color, label, value, max, template=templates.PROGRESS_DEFAULT) {
        super(id, x, y, label, value, null, null, template);
        this.context.content_id = 'progress_' + id;
        this.context.color = color;
        this.context.max = max;
    }
}
module.exports.Progress = Progress;


// Implements as client-side progress-bar which can be attached to a players
// Dashboard
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
