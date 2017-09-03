/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-09-03T06:46:05+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/** @module Cards */
const Component = require('./Component').Component;
const Collection = require('./Collection').Collection;
const templates = require('../lib/FragoleTemplates.js');

/** Class Card
* @extends {module:Component~Component}
* Basic card object
* the presentation of 'label', 'text' and 'image' is determined by the template
* action: a function that can be executed when the card is played. It may recieve
*         a parameter 'context', which may contain neccesary information for the action
*/
class Card extends Component {
    /** Create a Card-Instance
    * @param {string} id - unique id of the gamecontroller
    * @param {string} label - label on top of the card
    * @param {string} text - text on the card-body
    * @param {string} image - (optional) path to an image to display on the cards body
    * @param {Function} action - (optional) assign a function to this card (e.g. to execute when card is played)
    */
    constructor(id, label, text, image=null, action=undefined, template=templates.CARD_DEFAULT) {
        super(id, template);
        this.context.contentId = 'card_' + id;
        this.context.label = label;
        this.context.text = text;
        this.context.image = image;
        if(action) {
            this.action = action;
        } else {
            this.action = function (context) { console.log('Keine Aktion hinterlegt');};
        }
    }

    /** activate the card => connect click-handler to the card-action-button
    * visual signalisation must be handled by the template
    */
    activate() {
        this.gameController.rpcServer.connect('play_card_' + this.id, this.play, this);
        this.context.active = true;
    }

    /** deactivate the card => remove click-handler on the card-action button */
    deactivate() {
        this.context.active = false;
        this.gameController.disconnect('play_card_' + this.id);
    }

    // EVENTS - these are normally triggered by client

    /**
    * play the card => emit corresponding event
    * the card-action must be executed by an event-handler
    */
    play(clientId) {
        if (this.gameController) {
            this.gameController.emit('playCard', this.id, this);
        }
    }
}

/** Class CardStack
* CardStack represents an orderd stack of Card-objects
* cards may be added to or removed from the stack
* the stack can also be shuffled
* @extends {module:Component~Component}
*/
class CardStack extends Component {
    /**
    * create a CardStack
    * @param {string} id - unique id
    * @param {number} x - x-Position
    * @param {number} y - y-Position
    * @param {string} label - (NYI) label of the Button
    * @param {string} image - path to an image. Can be used by the template to present the stack on client-side
    */
    // TODO show_cnt: NYI => show number of cards in the stack
    constructor(id, x, y, label, image=null, showCnt=false, template=templates.CARD_STACK_DEFAULT) {
        super(id, template);
        this.context.contentId = 'card_stack_' + id;
        this.context.x = x;
        this.context.y = y;
        this.context.label = label;
        this.context.image = image;
        this.context.active = false;
        this.cards = new Collection();
        this.stack = [];
    }

    /**
    * add Card(s) to the stack
    * @param {Array<Card> | Card} cards - a single Card-object or an Array of Card-objects
    */
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

    /**
    * remove Card(s) to the stack
    * @param {Array<Card> | Card} cards - a single Card-object or an Array of Card-objects
    */
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

    /**
    * shuffle the stack
    * every card will be moved to a new, random position within the stack
    */
    shuffle() {
        for (let i = this.stack.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [this.stack[i - 1], this.stack[j]] = [this.stack[j], this.stack[i - 1]];
        }
    }

    // EVENTS
    click(clientId) {
        this.drawCard(clientId);
    }

    /** draw a card from the stack (it will be removed), the drawn card is
    * returned via a 'drawCard'-Event
    */
    drawCard(clientId) {
        let card = this.cards.deleteItem(this.stack.pop());
        if (this.gameController) {
            this.gameController.emit('drawCard', this.id, card, this, clientId);
        }
    }
}

/**
* Class CardHand
* @extends {module:Component~Component}
* the hand-cards of a player
* CardHand sucbscribes to the players inventory => if Cards are added to or
* removed from the inventory the CardHand updates automatically
*/
class CardHand extends Component {
    /** create a CardHand Object */
    constructor(id, template=templates.CARD_HAND_DEFAULT) {
        super(id, template);
        this.context.contentId = 'card_hand_' + id;
        this.context.cards = [];
    }

    /**
    * initialise the card hand-cards
    * @param {Collection} collection: a Collection-Object (normally a Player-Inventory)
    */
    init(collection) {
        this.owner = collection.owner;
        this.collection = collection;
        collection.subscribe(this);
        this.context.cards = this.collection.getType(Card);
    }

    /** this is automatically called when the subcribed collection is changed */
    update(type, item) {
        this.context.cards = this.collection.getType(Card);
        this.remove(null, 'modal_' + this.context.contentId); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    /** active the action-button for all cards in the CardHand */
    activate() {
        for(let card of this.context.cards) {
            card.activate();
        }
        this.remove(null, 'modal_' + this.context.contentId); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }

    /** deactive the action-button for all cards in the CardHand */
    deactivate() {
        for(let card of this.context.cards) {
            card.deactivate();
        }
        this.remove(null, 'modal_' + this.context.contentId); // workaround => modal does not update properly => remove and add again
        this.draw(null, this);
    }
}

module.exports = {
    CardStack: CardStack,
    Card: Card,
    CardHand: CardHand
};
