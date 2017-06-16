/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-16T23:54:56+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const FragoleServer = require('./FragoleServer.js'),
    Lib = require('./FragoleLib.js'),
    {Game, GameController, GameState, Player, PlayerToken, Collection,
     Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
     Progress, PlayerProgress, Prompt, Card, CardStack, CardHand, Button} = require('./objects/FragoleObjects.js'),
    prompts = require('./content/Prompts.js'),
    game_items = require('./content/game_items.js'),
    Lobby = require('./FragoleLobby.js'),
    Templates = require('./FragoleTemplates.js');


var server = new FragoleServer.SERVER();
var sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
var game = new Game();
var controller = new GameController('game_controller1', 1, server);


game.setName('TestGame')
    .addController(controller);
server.setGame(game);
server.start(80);

// STATES
var STATE_INIT = new GameState('STATE_INIT');
var STATE_ROLL = new GameState('STATE_ROLL');
var STATE_SELECT_WAYPOINT = new GameState('STATE_SELECT_WAYPOINT');
var STATE_ENTER_WAYPOINT = new GameState('STATE_ENTER_WAYPOINT');
var STATE_CHOOSE_ACTION = new GameState('STATE_CHOOSE_ACTION');
var STATE_QUESTION = new GameState('STATE_QUESTION');
var STATE_DRAW_CARD = new GameState('DRAW_CARD');

// *****************************************************************************
// collection of all game items
var items = {
    // Players
    player1: new Player('player1'),
    player2: new Player('player2'),


    // player tokens
    player_token1: new PlayerToken('player_token1', 'spielfiguren', 65, 650),
    player_token2: new PlayerToken('player_token2', 'spielfiguren', 65, 650),
    // dice
    dice: new Dice('dice', 6, Templates.DICE_ALTERNATIVE),
    // statistics
    global_risk: new Progress('global_risk', 330, 200, 'blue', 'RISIKO', 0, 100),

    player1_points: new PlayerStatistic('player1_points', 'PUNKTE', 0, 'trophy'),
    player1_money: new PlayerStatistic('player1_money', 'GELD', 0, 'euro'),
    player1_risk: new PlayerProgress('player1_risk', 'blue', 'EIGENES RISIKO', 0, 100),
    player2_points: new PlayerStatistic('player2_points', 'PUNKTE', 0, 'trophy'),
    player2_money: new PlayerStatistic('player2_money', 'GELD', 0, 'euro'),
    player2_risk: new PlayerProgress('player2_risk', 'blue', 'EIGENES RISIKO', 0, 100),

    card_stack_good: new CardStack('card_stack_good', 1100, 20, 'Karten'),
    card_stack_bad: new CardStack('card_stack_bad', 1100, 250, 'Risiko'),
    card1: new Card('card1', 'Karte 1', 'dies ist eine erste Testkarte', 'assets/card1.jpg', (context) => {
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
    card_hand2: new CardHand('card_hand2'),

    btn_end_turn : new Button('btn_end_turn', 10, 10, 'Spielzug beenden', 'green'),
};


//<Lib.connectWaypoints([items.wp4, items.wp6, items.wp8, items.wp9]);

// Set position for dice-roll result
items.dice.template.result_x(25).result_y(25);

items.card_stack_good.addCards([
    items.card1, items.card2, items.card3,
    items.card4, items.card5, items.card6,
    items.card7, items.card8, items.card9,]);
items.card_stack_good.shuffle();

// add (potential) players to the gameController
game.gameControllers[0].addPlayer(items.player1)
                       .addPlayer(items.player2);

var lobby = new Lobby(controller);

// *****************************************************************************

// STATE_INIT event-handlers
STATE_INIT.setHandlers({

    'enter':  () => {
        var wps = game_items.waypoints;
        // assign player_tokens etc. to players
        items.player1.addInventory(items.player_token1);
        items.player1.addInventory(items.player1_points);
        items.player1.addInventory(items.player1_money);
        items.player1.addInventory(items.player1_risk);
        items.player1.addInventory(items.card_hand1);

        items.player2.addInventory(items.player_token2);
        items.player2.addInventory(items.card_hand2);

        items.card_hand1.init(items.player1.inventory);

        // init game with all items
        controller.addItems(items);
        controller.addItems(wps);
        controller.addItems(game_items.prompts);

        // setup player stats
        items.player1.subscribe('points', items.player1_points);
        items.player1.subscribe('money', items.player1_money);
        items.player1.subscribe('risk', items.player1_risk);

        items.player1.set('points', 0);
        items.player1.set('money', 100);
        items.player1.set('risk', 0);


        // connect waypoints - setup paths
        game_items.connectWaypoints();
        items.player_token1.waypoint = wps.start;
        items.player_token2.waypoint = wps.start;

        controller.setupBoard();  // Setup the gameboard - draw stuff etc.
        items.btn_end_turn.draw(controller.joinedPlayers);
        items.btn_end_turn.deactivate(controller.joinedPlayers);
        controller.rpcCall(controller.joinedPlayers, ['drawImage', 'test', 'assets/connectors.png', 'back', 0, 0]);
        controller.next_player();
        controller.sendLog('Spiel', {content:'Herzlich Willkommen!'});
        controller.next_state(STATE_CHOOSE_ACTION);
    },
});

controller.on('click', function click(id, item) {
    if(id == 'btn_end_turn') {
        item.deactivate(controller.activePlayer);
        controller.next_player();
        controller.next_state(STATE_CHOOSE_ACTION);
    }
});

STATE_CHOOSE_ACTION.setHandlers({
    'enter' : () => {
        game_items.prompts.choose_action.show(controller.activePlayer);
        items.btn_end_turn.activate(controller.activePlayer);
    },

    'prompt': (src, option, prompt) => {
        switch(option) {
            case 'Würfeln':
                controller.sendLog(controller.activePlayer.name, {content:'würfelt', icon:'inverted orange check square'});
                controller.next_state(STATE_ROLL);
                break;
            case 'Eine Frage beantworten':
                controller.sendLog(controller.activePlayer.name, {content:'beantwortet eine Frage', icon:'inverted orange check square'});
                controller.next_state(STATE_QUESTION);
                break;
            case 'Eine Karte ziehen':
                controller.sendLog(controller.activePlayer.name, {content:'zieht eine Karte', icon:'inverted orange check square'});
                break;
            default:
                break;
        }
    },
});

STATE_ROLL.setHandlers({
    'enter': () => {
        items.dice.roll();
        controller.activePlayer.storage.setBadge('Aller anfang ist schwer',
            () => controller.sendPopup({
                header:'Badge erhalten',
                msg:'Aller Anfang ist schwer: starte dein erstes Spiel',
                icon:'star',
                players:controller.activePlayer, x:10, y:10, color:'yellow'}));
    },

    'roll' : (src, dice) => {
        items.dice.rollResult(controller.activePlayer);

        controller.activePlayer.storage.incStatistic('Geworfene Würfel');
        if(controller.activePlayer.storage.statistics['Geworfene Würfel'] == 15) {
            controller.activePlayer.storage.setBadge('15 mal Würfeln',
                () => controller.sendPopup({
                    header:'Badge erhalten',
                    msg:'Wüfel-Anfänger: 15 mal gewürfelt',
                    icon:'star',
                    players:controller.activePlayer, x:10, y:10, color:'yellow'}));
        }

        controller.sendLog(controller.activePlayer.name, {content:'hat eine ' + dice.result + ' gewürfelt!', icon:'inverted teal cube'});
        controller.set('roll_result', dice.result);
        controller.next_state(STATE_SELECT_WAYPOINT);
    }
});

STATE_SELECT_WAYPOINT.setHandlers({
    'enter': function enter()  {
        this.set('playertoken', controller.activePlayer.getInventory({category:'spielfiguren'})[0]);
        this.set('wps', Lib.getWaypointsAtRange(this.get('playertoken').waypoint, controller.get('roll_result')));

        for (let wp of this.get('wps')) {
            wp.activate(controller.activePlayer);
            wp.highlight(controller.activePlayer);
        }
    },

    'selectWaypoint': function selectWaypoint (src, item)  {
        this.get('playertoken').moveToWaypoint(item);
        items.dice.reset(controller.activePlayer);
        controller.sendLog(controller.activePlayer.name, {content:'zieht zu ' + item.id +'!', icon:'inverted yellow location arrow'});
        controller.next_state(STATE_ENTER_WAYPOINT);
    },

    'exit': function exit() {
        for (let wp of this.get('wps')) {
            wp.unhighlight(controller.activePlayer);
            wp.deactivate(controller.activePlayer);
        }
    },
});

STATE_ENTER_WAYPOINT.setHandlers({
    'enterWaypoint' : (src, wp, item) => {
        // handle waypoint events
    },
});

STATE_QUESTION.setHandlers({
    'enter': function enter() {
        game_items.prompts.question1.show(controller.activePlayer);
    },

    'questionWrong': function(id, option, value, question) {
        game_items.prompts.question1.showResult(controller.activePlayer);
    },

    'questionCorrect': function(id, option, value, question) {
        controller.activePlayer.inc('points', value);
        game_items.prompts.question1.showResult(controller.activePlayer);
    },
});

// *****************************************************************************

// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', (player) => { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', () => {
    lobby.quit();
    console.log('all players ready');
    controller.next_state(STATE_INIT);
});
