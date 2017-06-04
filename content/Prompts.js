var Prompt = require('../objects/FragoleObjects.js').Prompt;
var Question = require('../objects/FragoleObjects.js').Question;

module.exports = {

    prompt1: new Prompt('prompt1', 'Auswahl',
        '<p>Bitte triff eine Auswahl aus den folgenden Punkten:</p><ul><li>Option 1</li><li>Option 2</li><li>Option 3</li><li>Option 4</li></ul>',
        'assets/prompt.jpg',
        {
            'Option 1':{color:'olive', icon:''},
            'Option 2':{color:'green', icon:''},
            'Option 3':{color:'teal',  icon:''},
            'Option 4':{color:'blue',  icon:''}
        }),

    question1: new Question('guestion1', 'Frage',
        '<p>Was ist richtig?',
        '',
        {
            '1 + 1 = 2':{correct:true, value:10},
            '1 + 1 = 3':{correct:false, value:0},
        }),

};
