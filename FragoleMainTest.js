/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-22T18:32:15+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var FragoleServer = require('./FragoleServer.js');
var Lib = require('./FragoleLib.js');
var {Game, GameController, GameState, Player, PlayerToken, Collection,
     Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
     Progress, PlayerProgress, Prompt, Card, CardStack, CardHand} = require('./objects/FragoleObjects.js');
var Prompts = require('./content/Prompts.js');
var Lobby = require('./FragoleLobby.js');
var Templates = require('./FragoleTemplates.js');

var server = new FragoleServer.Server();
var sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
var game = new Game();
var controller = new GameController('game_controller1', 1, server);


game.setName('TestGame')
    .setController(controller);
server.setGame(game);
server.start(80);

// STATES
var STATE_INIT = new GameState('STATE_INIT');
var STATE_TURN = new GameState('STATE_TURN');

// *****************************************************************************
// collection of all game items
var items = {
    // Players
    player1: new Player('player1'),
    player2: new Player('player2'),
    // Waypoints
    wp1: new Waypoint('wp1', 'wegpunkte', 100, 100),
    wp2: new Waypoint('wp2', 'wegpunkte', 200, 100),
    wp3: new Waypoint('wp3', 'wegpunkte', 300, 150),
    wp4: new Waypoint('wp4', 'wegpunkte', 400, 200),
    wp5: new Waypoint('wp5', 'wegpunkte', 500, 250),
    wp6: new Waypoint('wp6', 'wegpunkte', 500, 150),
    wp7: new Waypoint('wp7', 'wegpunkte', 600, 250),
    wp8: new Waypoint('wp8', 'wegpunkte', 600, 150),
    wp9: new Waypoint('wp9', 'wegpunkte', 700, 200),
    wp10: new Waypoint('w10', 'wegpunkte', 800, 200),

    coll1: new Collection('collection1'),
    // player tokens
    player_token1: new PlayerToken('player_token1', 'spielfiguren', 100, 100),
    player_token2: new PlayerToken('player_token2', 'spielfiguren', 85, 50),
    // dice
    dice: new Dice('dice', 6, Templates.DICE_ALTERNATIVE),
    // statistics
    stat1: new Statistic('stat1', 100, 300, 'Zähler', 0, 'travel'),
    player_stat1: new PlayerStatistic('player_stat1', 'Punkte', 0, 'trophy'),
    rating1: new Rating('rating1', 100, 400, 'heart', 'WERTUNG', 3, 10),
    player_rating1: new PlayerRating('player_rating1', 'star', 'WERTUNG', 0, 10),
    progress1: new Progress('progress1', 100, 470, 'blue', 'FORTSCHRITT', 0, 10),
    player_progress1: new PlayerProgress('player_progress1', 'red', 'FORTSCHRITT', 0, 10),

    // prompts
    prompt1: Prompts.prompt1,
    question1: Prompts.question1,

    card_stack: new CardStack('card_stack', 500, 400, 'Karten'),
    card1: new Card('card1', 'Karte 1', 'dies ist eine erste Testkarte', 'assets/card1.jpg', function(context) {
        context.gameController.activePlayer.inc('points');
    }),
    card2: new Card('card2', 'Karte 2', 'dies ist eine zweite Testkarte', 'assets/card2.jpg'),
    card3: new Card('card3', 'Karte 3', 'dies ist eine dritte Testkarte', 'assets/card3.jpg'),
    card4: new Card('card4', 'Karte 4', 'dies ist eine vierte Testkarte', 'assets/card3.jpg'),
    card5: new Card('card5', 'Karte 5', 'dies ist eine fünfte Testkarte', 'assets/card3.jpg'),
    card6: new Card('card6', 'Karte 6', 'dies ist eine sechste Testkarte', 'assets/card3.jpg'),
    card7: new Card('card7', 'Karte 7', 'dies ist eine siebte Testkarte', 'assets/card3.jpg'),
    card8: new Card('card8', 'Karte 8', 'dies ist eine achte Testkarte', 'assets/card3.jpg'),
    card9: new Card('card9', 'Karte 9', 'dies ist eine neunte Testkarte', 'assets/card3.jpg'),
    card10: new Card('card10', 'Karte 10', 'dies ist eine zehnte Testkarte', 'assets/card3.jpg'),

    card_hand1: new CardHand('card_hand1'),
};

// connect waypoints - setup paths
Lib.connectWaypoints([items.wp1, items.wp2, items.wp3, items.wp4, items.wp5, items.wp7, items.wp9, items.wp10, items.wp1]);
Lib.connectWaypoints([items.wp4, items.wp6, items.wp8, items.wp9]);

// Set position for dice-roll result
items.dice.template.result_x(25).result_y(25);

// init game with all items
game.setItems(items);

// add (potential) players to the gameController
controller.addPlayer(items.player1)
          .addPlayer(items.player2);

// assign player_tokens etc. to players
items.player1.addInventory(items.player_token1);
items.player1.addInventory(items.player_stat1);
items.player1.addInventory(items.player_rating1);
items.player1.addInventory(items.player_progress1);
items.card_hand1.init(items.player1.inventory);

items.player2.addInventory(items.player_token2);

items.card_stack.addCards([
    items.card1, items.card2, items.card3,
    items.card4, items.card5, items.card6,
    items.card7, items.card8, items.card9,
    items.card10]);
items.card_stack.shuffle();

var lobby = new Lobby(controller);

// *****************************************************************************

// STATE_INIT event-handlers
STATE_INIT.setHandlers({

    'enter': function () {
        game.setupBoard();  // Setup the gameboard - draw stuff etc.

        controller.rpcCall(controller.joinedPlayers, ['drawImage', 'test', 'assets/Items/Colored/genericItem_color_035.png', 'back', 50, 50]);
        controller.next_player();
        controller.sendLog('Spiel', {content:'Herzlich Willkommen!'});
        items.player_token1.waypoint = items.wp1;
        items.player_token2.waypoint = items.wp1;

        items.player1.subscribe('points', items.player_stat1);
        items.player1.subscribe('points', items.player_rating1);
        items.player1.subscribe('points', items.player_progress1);
        items.player1.set('points', 0);

        controller.subscribe('counter', items.stat1);
        controller.subscribe('counter', items.rating1);
        controller.subscribe('counter', items.progress1);
        controller.set('counter', 10);
        items.prompt1.show(controller.activePlayer);

        items.card_stack.draw();
        items.card_stack.activate(controller.activePlayer);
        items.card_stack.highlight(controller.activePlayer);

        items.card_hand1.draw(items.player1);
    },

    'prompt': function (src, option, prompt) {
        console.log('Prompt selected => ', src, option);
        controller.sendLog(controller.activePlayer.name, {content:'hat ' + option + ' gewählt', icon:'inverted orange check square'});
        items.question1.show(controller.activePlayer);

    },

    'questionCorrect' : function(src, answer, score, item) {
        console.log('correct');
        items.question1.showResult(controller.activePlayer);
    },

    'questionWrong' : function(src, answer, score, item) {
        console.log('wrong');
        items.question1.showResult(controller.activePlayer);

    },

    'questionFinished': function(src, item) {
        controller.next_state(STATE_TURN);
    }

});


// ****************************************************************************
// STATE_TURN event-handlers
STATE_TURN.setHandlers({

    'enter': function() {
        this.set('playertoken', controller.activePlayer.getInventory({category:'spielfiguren'})[0]);
        this.set('player', controller.activePlayer);
        items.dice.draw(this.get('player'));
        controller.setWatchdog(60);
    },

    'roll': function(src, dice) {
        if(src === 'dice') {
            controller.sendLog(controller.activePlayer.name, {content:'hat eine ' + dice.result + ' gewürfelt!', icon:'inverted teal cube'});
            this.set('wps', Lib.getWaypointsAtRange(this.get('playertoken').waypoint, dice.result));
            items.dice.rollResult(this.get('player'));
            for (let wp of this.get('wps')) {
                wp.activate(this.get('player'));
                wp.highlight(this.get('player'));
            }
        }
    },

    'selectWaypoint': function(src, item) {
        controller.sendPopup({header:'test', msg:'Dies ist ein Test-Popup', icon:'cube', players:controller.activePlayer, x:700, y:500, color:'blue'});
        this.get('playertoken').moveToWaypoint(item);
        items.dice.reset(controller.activePlayer);
        controller.sendLog(controller.activePlayer.name, {content:'zieht zu ' + item.id +'!', icon:'inverted yellow location arrow'});
        for (let wp of this.get('wps')) {
            wp.unhighlight(this.get('player'));
            wp.deactivate(this.get('player'));
        }

        var counter = controller.get('counter');
        controller.set('counter', --counter);

        var points = this.get('player').get('points');
        this.get('player').set('points', ++points);
    },

    'drawCard': function(src, card, stack) {
        console.log('STATE_TURN drawCard', card.id);
        card.draw(controller.activePlayer);
        controller.activePlayer.addInventory(card);
        items.card_hand1.activate();
    },

    'playCard': function(src, card) {
        console.log('playCard', card.id);
        card.action(game);
        card.owner.removeInventory(card);
    },

    'enterWaypoint': function(src, wp, item) {
        Lib.probably(80, () => controller.sendPopup({header:'test', msg:'Zufall => A', icon:'cube', players:controller.activePlayer, x:700, y:500, color:'green'}),
                         () => controller.sendPopup({header:'test', msg:'Zufall => B', icon:'cube', players:controller.activePlayer, x:700, y:500, color:'red'}));
    },

    'moveComplete': function(src, item) {
        controller.next_state(STATE_TURN);
    },

    'watchdog': function() {
        console.log('WATCHDOG FIRED => next player');
        items.dice.reset(controller.activePlayer);
        for (let wp of this.get('wps')) {
            wp.unhighlight(this.get('player'));
            wp.deactivate(this.get('player'));
        }
        controller.next_state(STATE_TURN);
    },

    'exit': function() {
        controller.next_player();
    }

});

// *****************************************************************************

// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', function (player) { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', function () {
    lobby.quit();
    console.log('all players ready');
    controller.next_state(STATE_INIT);
});
