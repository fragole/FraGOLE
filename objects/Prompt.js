var Component = require('./Component').Component;
var templates = require('../FragoleTemplates.js');

class Prompt extends Component {
    constructor(id, header, content, image, actions={'Ok':{color:'blue', icon:'checkmark'}, 'Abbrechen':{color:'red', icon:'remove'}}, template=templates.PROMPT_DEFAULT) {
        super(id, template);
        this.context.content_id = 'prompt_' + id;
        this.context.header = header;
        this.context.content = content;
        this.context.image = image;
        this.context.actions = actions;
    }

    show() {
        this.gameController.rpcServer.connect('prompt_' + this.id, this.select, this);
        this.draw();
    }

    // EVENTS
    select(option) {
        if (this.gameController) {
            this.gameController.currentState.emit('prompt', this.id, option, this);
        }
        this.emit('prompt', this.id, option, this);
        this.gameController.rpcServer.disconnect('prompt_' + this.id);
    }
}
module.exports.Prompt = Prompt;
