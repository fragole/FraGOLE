/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:42:57+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const FragoleServer = require('./lib/FragoleServer.js');
const Lib = require('./lib/FragoleLib.js');
const {Game, GameController, GameState, Player, PlayerToken, Collection,
       Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
       Progress, PlayerProgress, Prompt, Card, CardStack, CardHand, Button} = require('./objects/FragoleObjects.js');
const prompts = require('./content/Prompts.js');
const gameItems = require('./content/gameItems.js');
const Lobby = require('./lib/FragoleLobby.js');
const Templates = require('./lib/FragoleTemplates.js');

let server = new FragoleServer.Server();
let sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
let game = new Game();
let controller = new GameController('game_controller1', 1, server);

game.setName('TestGame')
    .addController(controller);
server.setGame(game);
server.start(80);

// STATES
let STATE_INIT = new GameState('STATE_INIT');
let STATE_ROLL = new GameState('STATE_ROLL');
let STATE_SELECT_WAYPOINT = new GameState('STATE_SELECT_WAYPOINT');
let STATE_ENTER_WAYPOINT = new GameState('STATE_ENTER_WAYPOINT');
let STATE_CHOOSE_ACTION = new GameState('STATE_CHOOSE_ACTION');
let STATE_QUESTION = new GameState('STATE_QUESTION');
let STATE_DRAW_CARD = new GameState('DRAW_CARD');

// *****************************************************************************
// collection of all game items
let items = {
    // Players
    player1: new Player('player1'),
    player2: new Player('player2'),


    // player tokens
    playerToken1: new PlayerToken('playerToken1', 'spielfiguren', 65, 650),
    playerToken2: new PlayerToken('playerToken2', 'spielfiguren', 65, 650),
    // dice
    dice: new Dice('dice', 6, Templates.DICE_ALTERNATIVE),
    // statistics
    globalRisk: new Progress('globalRisk', 330, 200, 'blue', 'RISIKO', 0, 100),

    player1Points: new PlayerStatistic('player1Points', 'PUNKTE', 0, 'trophy'),
    player1Money: new PlayerStatistic('player1Money', 'GELD', 0, 'euro'),
    player1Risk: new PlayerProgress('player1Risk', 'blue', 'EIGENES RISIKO', 0, 100),
    player2Points: new PlayerStatistic('player2Points', 'PUNKTE', 0, 'trophy'),
    player2Money: new PlayerStatistic('player2Money', 'GELD', 0, 'euro'),
    player2Risk: new PlayerProgress('player2Risk', 'blue', 'EIGENES RISIKO', 0, 100),

    cardStackGood: new CardStack('cardStackGood', 1100, 20, 'Karten'),
    cardStackBad: new CardStack('cardStackBad', 1100, 250, 'Risiko'),
    card1: new Card('card1', 'Abkürzung', 'Du hast eine Abkürzung gefunden!', 'assets/card1.jpg', (context) => {
        let wp = new Waypoint('wpak', 'path1', 130, 295);
        context.addItems([wp]);
        wp.draw();
    }),
    /*card2: new Card('card2', 'Karte 2', 'dies ist eine zweite Testkarte', 'assets/card2.jpg'),
    card3: new Card('card3', 'Karte 3', 'dies ist eine dritte Testkarte', 'assets/card3.jpg'),
    card4: new Card('card4', 'Karte 4', 'dies ist eine vierte Testkarte', 'assets/card3.jpg'),
    card5: new Card('card5', 'Karte 5', 'dies ist eine fünfte Testkarte', 'assets/card3.jpg'),
    card6: new Card('card6', 'Karte 6', 'dies ist eine sechste Testkarte', 'assets/card3.jpg'),
    card7: new Card('card7', 'Karte 7', 'dies ist eine siebte Testkarte', 'assets/card3.jpg'),
    card8: new Card('card8', 'Karte 8', 'dies ist eine achte Testkarte', 'assets/card3.jpg'),
    card9: new Card('card9', 'Karte 9', 'dies ist eine neunte Testkarte', 'assets/card3.jpg'),
    card10: new Card('card10', 'Karte 10', 'dies ist eine zehnte Testkarte', 'assets/card3.jpg'),
    */
    cardHand1: new CardHand('cardHand1'),
    cardHand2: new CardHand('cardHand2'),

    btnEndTurn : new Button('btnEndTurn', 10, 10, 'Spielzug beenden', 'green'),
};


//<Lib.connectWaypoints([items.wp4, items.wp6, items.wp8, items.wp9]);

// Set position for dice-roll result
items.dice.template.resultX(25).resultY(25);

items.cardStackGood.addCards(items.card1);

//items.cardStackGood.addCards([
//    items.card1, items.card2, items.card3,
//    items.card4, items.card5, items.card6,
//    items.card7, items.card8, items.card9,]);
items.cardStackGood.shuffle();

// add (potential) players to the gameController
game.gameControllers[0].addPlayer(items.player1)
                       .addPlayer(items.player2);

let lobby = new Lobby(controller);

// *****************************************************************************

// STATE_INIT event-handlers
STATE_INIT.setHandlers({

    enter:  () => {
        let wps = gameItems.waypoints;
        // assign player_tokens etc. to players
        items.player1.addInventory(items.playerToken1);
        items.player1.addInventory(items.player1Points);
        items.player1.addInventory(items.player1Money);
        items.player1.addInventory(items.player1Risk);
        items.player1.addInventory(items.cardHand1);

        items.player2.addInventory(items.playerToken2);
        items.player2.addInventory(items.cardHand2);

        items.cardHand1.init(items.player1.inventory);

        // init game with all items
        controller.addItems(items);
        controller.addItems(wps);
        controller.addItems(gameItems.prompts);

        controller.subscribe('globalRisk', items.globalRisk);
        controller.set('globalRisk', 0);
        // setup player stats
        items.player1.subscribe('points', items.player1Points);
        items.player1.subscribe('money', items.player1Money);
        items.player1.subscribe('risk', items.player1Risk);

        items.player1.set('points', 0);
        items.player1.set('money', 100);
        items.player1.set('risk', 0);
        items.player2.set('path', wps.start.category);

        // connect waypoints - setup paths
        gameItems.connectWaypoints();
        items.playerToken1.waypoint = wps.start;
        items.playerToken2.waypoint = wps.start;

        controller.setupBoard();  // Setup the gameboard - draw stuff etc.
        items.btnEndTurn.draw(controller.joinedPlayers);
        items.btnEndTurn.deactivate(controller.joinedPlayers);
        controller.rpcCall(controller.joinedPlayers, ['drawImage', 'test', 'assets/connectors.png', 'back', 0, 0]);
        controller.nextPlayer();
        controller.sendLog('Spiel', {content:'Herzlich Willkommen!'});
        controller.nextState(STATE_CHOOSE_ACTION);
    },
});

controller.on('click', function click(id, item) {
    if(id === 'btnEndTurn') {
        item.deactivate(controller.activePlayer);
        controller.nextPlayer();
        controller.nextState(STATE_CHOOSE_ACTION);
    }
});

controller.on('playCard', function playCard(src, card) {
    card.action(controller);
    card.owner.removeInventory(card);
});

STATE_CHOOSE_ACTION.setHandlers({
    enter() {
        gameItems.prompts.chooseAction.show(controller.activePlayer);
        items.btnEndTurn.activate(controller.activePlayer);
    },

    prompt(src, option, prompt) {
        switch(option) {
            case 'Würfeln':
                controller.sendLog(controller.activePlayer.name, {content:'würfelt', icon:'inverted orange check square'});
                controller.nextState(STATE_ROLL);
                break;
            case 'Eine Frage beantworten':
                controller.sendLog(controller.activePlayer.name, {content:'beantwortet eine Frage', icon:'inverted orange check square'});
                controller.nextState(STATE_QUESTION);
                break;
            case 'Eine Karte ziehen':
                controller.sendLog(controller.activePlayer.name, {content:'zieht eine Karte', icon:'inverted orange check square'});
                controller.nextState(STATE_DRAW_CARD);
                break;
            default:
                break;
        }
    },
});

STATE_ROLL.setHandlers({
    enter() {
        items.dice.roll();
        controller.activePlayer.storage.setBadge('Aller anfang ist schwer',
            () => controller.sendPopup({
                header:'Badge erhalten',
                msg:'Aller Anfang ist schwer: starte dein erstes Spiel',
                icon:'star',
                players:controller.activePlayer, x:10, y:10, color:'yellow'}));
    },

    roll(src, dice) {
        items.dice.rollResult(controller.activePlayer);

        controller.activePlayer.storage.incStatistic('Geworfene Würfel');
        if(controller.activePlayer.storage.statistics['Geworfene Würfel'] === 15) {
            controller.activePlayer.storage.setBadge('15 mal Würfeln',
                () => controller.sendPopup({
                    header:'Badge erhalten',
                    msg:'Wüfel-Anfänger: 15 mal gewürfelt',
                    icon:'star',
                    players:controller.activePlayer, x:10, y:10, color:'yellow'}));
        }

        controller.sendLog(controller.activePlayer.name, {content:'hat eine ' + dice.result + ' gewürfelt!', icon:'inverted teal cube'});
        controller.set('roll_result', dice.result);
        controller.nextState(STATE_SELECT_WAYPOINT);
    }
});

STATE_SELECT_WAYPOINT.setHandlers({
    enter() {
        this.set('playertoken', controller.activePlayer.getInventory({category:'spielfiguren'})[0]);
        this.set('wps', Lib.getWaypointsAtRange(this.get('playertoken').waypoint, controller.get('roll_result')));

        for (let wp of this.get('wps')) {
            wp.activate(controller.activePlayer);
            wp.highlight(controller.activePlayer);
        }
    },

    selectWaypoint(src, item)  {
        this.get('playertoken').moveToWaypoint(item);
        items.dice.reset(controller.activePlayer);
        controller.sendLog(controller.activePlayer.name, {content:'zieht zu ' + item.id +'!', icon:'inverted yellow location arrow'});
        controller.nextState(STATE_ENTER_WAYPOINT);
    },

    exit() {
        for (let wp of this.get('wps')) {
            wp.unhighlight(controller.activePlayer);
            wp.deactivate(controller.activePlayer);
        }
    },
});

STATE_ENTER_WAYPOINT.setHandlers({
    enterWaypoint(src, wp, item) {
        let  color;
        let icon;
        let header;
        let risk = 0;
        let globalRisk = controller.get('globalRisk');

        if(wp.category !== controller.activePlayer.get('path')) {
            // different path entered
            switch(wp.category) {
                case 'path1':
                    risk = globalRisk + 0;
                    controller.activePlayer.session.setBackgroundImage('/assets/path.jpg');
                    break;
                case 'path2':
                case 'path3':
                    risk = globalRisk + 40;
                    controller.activePlayer.session.setBackgroundImage('/assets/bridge.jpg');
                    break;
                case 'path4':
                case 'path5':
                    risk = globalRisk + 20;
                    controller.activePlayer.session.setBackgroundImage('/assets/background.jpg');
                    break;
                default:
                    break;
            }

            if (risk <= 15) {
                header = 'HINWEIS:';
                color = 'green';
                icon = 'smile';
            }  else if (risk <= 30) {
                header = 'ACHTUNG';
                color = 'yellow';
                icon = 'meh';
            } else {
                header = 'GEFAHR:';
                color = 'red';
                icon = 'frown';
            }
            Lib.probably(risk, () => controller.sendPopup({header:'Schlimme Dinge!', msg:'Ziehe eine Risiko-Karte', icon:'lightning', players:controller.activePlayer, x:200, y:10, color:'red'}),
                               () => controller.sendPopup({header:header, msg:'Dein Risiko beträgt: ' + risk, icon:icon, players:controller.activePlayer, x:200, y:10, color:color}));
            controller.activePlayer.set('risk', risk);
            controller.activePlayer.set('path', controller.set('path', wp.category));
        }
        // handle waypoint events
    },
});

STATE_DRAW_CARD.setHandlers({
    enter() {
        items.cardStackGood.highlight(controller.activePlayer);
        items.cardStackGood.activate(controller.activePlayer);
    },

    drawCard(src, card, stack) {
        console.log('STATE_TURN drawCard', card.id);
        card.draw(controller.activePlayer);
        controller.activePlayer.addInventory(card);
        items.cardHand1.activate();
        items.cardStackGood.unhighlight(controller.activePlayer);
        items.cardStackGood.deactivate(controller.activePlayer);
    },
});

STATE_QUESTION.setHandlers({
    enter() {
        gameItems.prompts.question1.show(controller.activePlayer);
    },

    questionWrong(id, option, value, question) {
        gameItems.prompts.question1.showResult(controller.activePlayer);
    },

    questionCorrect(id, option, value, question) {
        controller.activePlayer.inc('points', value);
        gameItems.prompts.question1.showResult(controller.activePlayer);
    },
});

// *****************************************************************************

// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', (player) => { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', () => {
    lobby.quit();
    console.log('all players ready');
    controller.nextState(STATE_INIT);
});
