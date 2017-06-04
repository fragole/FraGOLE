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

    show(players=undefined) {
        this.gameController.rpcServer.connect('prompt_' + this.id, this.select, this);
        this.draw(players);
    }

    // EVENTS
    select(option) {
        this.gameController.emit('prompt', this.id, option, this);
        this.gameController.rpcServer.disconnect('prompt_' + this.id);
    }
}
module.exports.Prompt = Prompt;

class Question extends Prompt {
    // provide pobible answers in actions-dict => {'right':{correct:true, value:10}, 'wrong':{correct:false, value:-10}}
    constructor(id, header, content, image, actions={}, template=templates.QUESTION_DEFAULT) {
        super(id, header, content, image, actions, template);
        this.context.content_id = 'question_' + id;
    }

    show(players=undefined) {
        this.gameController.rpcServer.connect('question_' + this.id, this.select, this);
        this.draw(players);
    }

    showResult(players=undefined) {
        this.gameController.rpcServer.connect('question_' + this.id + '_finished', this.finished, this);
        var answer = this.context.actions[this.context.selection];
        this.context.correct = answer.correct;
        this.context.correct_answers = [];
        for (let answer in this.context.actions) {
            if (this.context.actions[answer].correct) {
                this.context.correct_answers.push(answer);
            }
        }
        this.draw(players);
        this.context.selection = undefined;
    }

    // EVENTS
    select(option) {
        var selection = this.context.actions[option];
        this.context.selection = option;
        if (selection.correct) {
            this.gameController.emit('questionCorrect', this.id, option, selection.value, this);
        } else {
            this.gameController.emit('questionWrong', this.id, option, selection.value, this);
        }
        this.gameController.rpcServer.disconnect('question_' + this.id);
    }

    finished() {
        this.gameController.rpcServer.disconnect('question_' + this.id + '_finished');
        this.gameController.emit('questionFinished', this.id, this);
    }
}
module.exports.Question = Question;
