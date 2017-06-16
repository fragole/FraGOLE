/**
 * @Author: Michael Bauer
 * @Date:   2017-06-16T17:53:07+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-16T19:06:23+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
const Component = require('./Component').Component,
    templates = require('../FragoleTemplates.js');

class Button extends Component {
    constructor(id, x, y, label, color, icon, template=templates.BUTTON_DEFAULT) {
        super(id, template);
        this.context.content_id = 'btn_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.color = color;
        this.context.icon = icon;
        this.click.bind(this);
    }
}
module.exports.Button = Button;
