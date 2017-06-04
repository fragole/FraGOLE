/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T19:23:44+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Component = require('./Component').Component;
var templates = require('../FragoleTemplates.js');

// A numeric representation of a Statistic (Points, etc) which can be drawn to
// the gameboard
// Statistics can subscribe to custom-vars of GameObjects
//
// x,y: absolute position on the gameboard
// label: text to display alongside the Statistic
// value: initial positive numeric value
// icon: optional icon to display next to the Statistic
// img: NYI
class Statistic extends Component {
    constructor(id, x, y, label, value, icon=undefined, img=undefined, template=templates.STATISTIC_DEFAULT) {
        super(id, template);
        this.context.content_id = 'stat_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.img = img;
        this.context.icon = icon;
        this.context.value = value;
        this.update.bind(this);
    }

    // draw the statistic on client(s)
    draw(players=undefined) {
        var cmd = ['addDomContent',
            this.template.content(this.context),
            '#' + this.template.parent,
            '#' + this.context.content_id
        ];
        this.gameController.rpcListOrAll(players, cmd);
    }

    // can be called manually to update the value of the Statistic
    // or gets called by another GameObject when subscribing to a custom-var of
    // that GameObject
    update(value) {
        this.context.value = value;
        this.draw();
    }
}
module.exports.Statistic = Statistic;

// same as Statistic but attaches to a players dashboard
class PlayerStatistic extends Statistic {
    constructor(id, label, value, icon=undefined, img=undefined, template=templates.PLAYER_STATISTIC_DEFAULT) {
        super(id, 0, 0, label, value, icon, img, template);
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
module.exports.PlayerStatistic = PlayerStatistic;
