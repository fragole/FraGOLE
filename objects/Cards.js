/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T11:26:02+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */


var Component = require('./Component').Component;
var Collection = require('./Collection').Collection;
var templates = require('../FragoleTemplates.js');

// Basic card object
// the presentation of 'label', 'text' and 'image' is determined by the template
// action: a function that can be executed when the card is played. It may recieve
//         a parameter 'context', which may contain neccesary information for the action
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

    // activate the card => connect click-handler to the card-action-button
    // visual signalisation must be handled by the template
    activate() {
        this.gameController.rpcServer.connect('play_card_' + this.id, this.play, this);
        this.context.active = true;
    }

    // deactivate the card => remove click-handler on the card-action button
    deactivate() {
        this.context.active = false;
        this.gameController.disconnect('play_card_' + this.id);
    }

    // EVENTS - these are normally triggered by client

    // play the card => emit corresponding event
    // the card-action must be executed by an event-handler
    play() {
        if (this.gameController) {
            this.gameController.emit('playCard', this.id, this);
        }
    }
}

// CardStack represents an orderd stack of Card-objects
// cards may be added to or removed from the stack
// the stack can also be shuffled
class CardStack extends Component {
    // x,y: absolute position of the stack client-representation (see template)
    // label: NYI
    // image: can be used by the template to present the stack on client-side
    // show_cnt: NYI => show number of cards in the stack
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

    // add Card(s) to the stack
    // cards: a single Card-object or an Array of Card-objects
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

    // remove card(s) from the stack
    // cards: a single Card-object or an Array of Card-objects
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

    // shuffle the stack
    // every card will be moved to a new, random position within the stack
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

    // draw a card from the stack (it will be removed)
    drawCard() {
        var card = this.cards.deleteItem(this.stack.pop());
        if (this.gameController) {
            this.gameController.emit('drawCard', this.id, card, this);
        }
    }
}

// the hand-cards of a player
// CardHand sucbscribes to the players inventory => if Cards are added to or
// removed from the inventory the CardHand updates automatically
class CardHand extends Component {
    constructor(id, template=templates.CARD_HAND_DEFAULT) {
        super(id, template);
        this.context.content_id = 'card_hand_' + id;
        this.context.cards = [];
    }

    // initialise the card hand-cards
    // collection: a Collection-Object (nomally a Player-Inventory)
    init(collection) {
        this.owner = collection.owner;
        this.collection = collection;
        collection.subscribe(this);
        this.context.cards = this.collection.getType(Card);
    }

    // this is automatically called when the subcribed collection is changed
    update(type, item) {
        this.context.cards = this.collection.getType(Card);
        this.remove(null, 'modal_' + this.context.content_id); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    // active the action-button for all cards in the CardHand
    activate() {
        for(let card of this.context.cards) {
            card.activate();
        }
        this.remove(null, 'modal_' + this.context.content_id); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    // deactive the action-button for all cards in the CardHand
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
