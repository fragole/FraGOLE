/**
 * @Author: Michael Bauer
 * @Date:   2017-06-16T17:53:07+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-11T19:45:15+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
const Component = require('./Component').Component;
const templates = require('../lib/FragoleTemplates.js');

/** Class Button
* @extends Component
* Create a UI-Button on the client-side
*/
class Button extends Component {
    /**
    * Create a Button-Instance
    * @param {string} id - unique id
    * @param {number} x - x-Position
    * @param {number} y - y-Position
    * @param {string} label - label of the Button
    * @param {string} color - (optional) color of the Button
    * @param {string} icon - (optional) icon to display in fron of label
    */
    constructor (id, x, y, label, color, icon, template=templates.BUTTON_DEFAULT) {
        super(id, template);
        this.context.contentId = 'btn_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.color = color;
        this.context.icon = icon;
        this.click.bind(this);
    }
}
module.exports.Button = Button;
