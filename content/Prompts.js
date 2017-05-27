var Prompt = require('../objects/FragoleObjects.js').Prompt;

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

};
