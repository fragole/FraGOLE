var Component = require('./Component').Component;
var Collection = require('./Collection').Collection;
var templates = require('../FragoleTemplates.js');

class Card extends Component {
    constructor(id, label, text, actions={}, template=templates.CARD_DEFAULT) {
        super(id, template);
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
    }

    addCards(cards) {

    }

    removeCards(cards) {

    }

    shuffle() {

    }

    // EVENTS
    click() {
        this.drawCard();
    }

    drawCard() {
        if (this.gameController) {
            this.gameController.emit('drawCard', this.id, this);    
        }
    }
}

class CardHand extends Component {
    constructor(id, collection, template=templates.CARD_DEFAULT) {
        super(id, template);
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
