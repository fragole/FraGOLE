var Component = require('./Component').Component;
var Collection = require('./Collection').Collection;
var templates = require('../FragoleTemplates.js');

class Card extends Component {
    constructor(id, label, text, image=null, action=undefined, template=templates.CARD_DEFAULT) {
        super(id, template);
        this.context.content_id = 'card_' + id;
        this.context.label = label;
        this.context.text = text;
        this.context.image = image;
        if(action) {
            this.action = action;
        } else {
            this.action = function(context) { console.log('Keine Aktion hinterlegt');};
        }
    }

    activate() {
        this.gameController.rpcServer.connect('play_card_' + this.id, this.play, this);
        this.context.active = true;
    }

    deactivate() {
        this.context.active = false;
        this.gameController.disconnect('play_card_' + this.id);
    }

    // events
    play() {
        if (this.gameController) {
            this.gameController.emit('playCard', this.id, this);
        }
    }
}

class CardStack extends Component {
    constructor(id, x, y, label, image=null, show_cnt=false, template=templates.CARD_STACK_DEFAULT) {
        super(id, template);
        this.context.content_id = 'card_stack_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.image = image;
        this.context.active = false;
        this.cards = new Collection();
        this.stack = [];
    }

    addCards(cards) {
        if(cards instanceof Array) {
            for(let card of cards) {
                this.stack.push(card.id);
                this.cards.addItem(card);
            }
        } else {
            this.stack.push(cards.id);
            this.cards.addItem(cards);
        }
    }

    removeCards(cards) {
        if(cards instanceof Array) {
            for(let card of cards) {
                this.stack.splice(this.stack.indexOf(card.id), 1);
                this.cards.deleteItem(card.id);
            }
        } else {
            this.stack.splice(this.stack.indexOf(cards.id), 1);
            this.cards.deleteItem(cards.id);
        }
    }

    shuffle() {
        for (let i = this.stack.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [this.stack[i - 1], this.stack[j]] = [this.stack[j], this.stack[i - 1]];
        }
    }

    // EVENTS
    click() {
        this.drawCard();
    }

    drawCard() {
        var card = this.cards.deleteItem(this.stack.pop());
        if (this.gameController) {
            this.gameController.emit('drawCard', this.id, this, card);
        }
    }
}

class CardHand extends Component {
    constructor(id, template=templates.CARD_HAND_DEFAULT) {
        super(id, template);
        this.context.content_id = 'card_hand_' + id;
        this.context.cards = [];
    }

    init(collection) {
        this.owner = collection.owner;
        this.collection = collection;
        collection.subscribe(this);
        this.context.cards = this.collection.getType(Card);
    }

    update(type, item) {
        this.context.cards = this.collection.getType(Card);
        this.remove(null, 'modal_' + this.context.content_id); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    activate() {
        for(let card of this.context.cards) {
            card.activate();
        }
        this.remove(null, 'modal_' + this.context.content_id); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    deactivate() {
        for(let card of this.context.cards) {
            card.deactivate();
        }
        this.remove(null, 'modal_' + this.context.content_id); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }
}

module.exports = {
    CardStack: CardStack,
    Card: Card,
    CardHand: CardHand
};
