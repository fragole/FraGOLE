/**
 * @Author: Michael Bauer
 * @Date:   2017-05-20T09:25:44+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-21T19:42:12+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */



var Component = require('./Component').Component;
var templates = require('../lib/FragoleTemplates.js');

// Implements a clients-side prompt with multiple options
// header: header-text
// content: content of the prompt, may contain HTML
// image: optional image to diplay within the prompt
// actions: dictionary of available options => {'optionName': {color:'...', icon:''}, ...} color and icon ar optional
class Prompt extends Component {
    constructor(id, header, content, image, actions={'Ok':{color:'blue', icon:'checkmark'}, 'Abbrechen':{color:'red', icon:'remove'}}, template=templates.PROMPT_DEFAULT) {
        super(id, template);
        this.context.contentId = 'prompt_' + id;
        this.context.header = header;
        this.context.content = content;
        this.context.image = image;
        this.context.actions = actions;
    }

    // show the prompt to client(s)
    // connect RPC-function for the option-buttons
    show(players=undefined) {
        this.gameController.rpcServer.connect('prompt_' + this.id, this.select, this);
        this.draw(players);
    }

    // EVENTS

    // this is called when an option-button is pressed on client-side
    // emit event with the slected options
    select(option) {
        this.gameController.emit('prompt', this.id, option, this);
        this.gameController.rpcServer.disconnect('prompt_' + this.id);
    }
}
module.exports.Prompt = Prompt;

// Implements a client-side question-prompt with mulitple answers (mulitple wrong/right choices are possible)
// header: header-text
// content: content of the prompt, may contain HTML
// image: optional image to diplay within the prompt
// actions: dictionary of available options => e.g. {'right':{correct:true, value:10}, 'wrong':{correct:false, value:-10}}
class Question extends Prompt {
    constructor(id, header, content, image, actions={}, template=templates.QUESTION_DEFAULT) {
        super(id, header, content, image, actions, template);
        this.context.contentId = 'question_' + id;
    }

    // display question to client(s)
    show(players=undefined) {
        this.gameController.rpcServer.connect('question_' + this.id, this.select, this);
        this.draw(players);
    }

    // show the result of the answered question to client(s)
    // this reveals the correct answer(s) if the question was answered wrong
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

    // gets called when an answer button is clicked
    select(option, clientId) {
        var selection = this.context.actions[option];
        this.context.selection = option;
        if (selection.correct) {
            this.gameController.emit('questionCorrect', this.id, option, selection.value, this);
        } else {
            this.gameController.emit('questionWrong', this.id, option, selection.value, this);
        }
        this.gameController.rpcServer.disconnect('question_' + this.id);
    }

    // get called when the OK-button of the result-display is clicked
    finished(clientId) {
        this.gameController.rpcServer.disconnect('question_' + this.id + '_finished');
        this.gameController.emit('questionFinished', this.id, this);
    }
}
module.exports.Question = Question;
