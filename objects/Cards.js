var Component = require('./Component').Component;
var Collection = require('./Collection').Collection;
var templates = require('../FragoleTemplates.js');

class Card extends Component {
    constructor(id, label, text, image=null, actions={}, template=templates.CARD_DEFAULT) {
        super(id, template);
        this.context.content_id = 'card_' + id;
        this.context.label = label;
        this.context.text = text;
        this.context.image = image;
    }

    activate(players=undefined) {

    }

    play(players=undefined) {

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
    }

    init(collection) {
        this.collection = collection;
        collection.subscribe(this);
        this.cards = this.collection.getType(Card);
    }

    update(type, item) {
        this.cards = this.collection.getType(Card);
        // update in the document
        // send to listOrOwner
    }
}

module.exports = {
    CardStack: CardStack,
    Card: Card,
    CardHand: CardHand
};
