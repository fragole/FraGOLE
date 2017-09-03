/**
 * @Author: Michael Bauer
 * @Date:   2017-08-31T10:25:41+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-09-03T18:39:57+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const FragoleServer = require('./lib/FragoleServer.js');
const Lib = require('./lib/FragoleLib.js');
const {Game, GameController, GameState, Player, PlayerToken, Collection,
        Waypoint, Dice, Statistic, PlayerStatistic, Rating, PlayerRating,
        Progress, PlayerProgress, Prompt, Question, Card, CardStack, CardHand, Button} = require('./objects/FragoleObjects.js');
const Lobby = require('./lib/FragoleLobby.js');
const Templates = require('./lib/FragoleTemplates.js');

let server = new FragoleServer.Server();
let sessions = FragoleServer.sessions;

// ****************************************************************************
// Game definition
let game = new Game();
let controller = new GameController('game_controller1', 1, server);

game.setName('FeatureDemo')
     .addController(controller);
server.setGame(game);
server.start(80);

 // Game States
let STATE_INIT = new GameState('STATE_INIT');
let STATE_1 = new GameState('STATE_1');
let STATE_2 = new GameState('STATE_2');

let players = {player1: new Player('Player1'),
    player2: new Player('Player2'),
    player3: new Player('Player3'),
    player4: new Player('Player4')};

let tokens = {playerToken1: new PlayerToken('PlayerToken1', 'playertokens', 300, 50),
    playerToken2: new PlayerToken('PlayerToken2', 'playertokens', 400, 150),
    playerToken3: new PlayerToken('PlayerToken3', 'playertokens', 10, 10),
    playerToken4: new PlayerToken('PlayerToken4', 'playertokens', 10, 10),
};

let stats = {
    player1Stat: new PlayerStatistic('Player1Stat', 'STATISTIK', 0, 'line chart'),
    player1Prog: new PlayerProgress('Player1Prog', 'red', 'FORTSCHRITT', 0, 100),
    player2Stat: new PlayerStatistic('Player2Stat', 'STATISTIK', 0, 'line chart'),
    player2Prog: new PlayerProgress('Player2Prog', 'green', 'FORTSCHRITT', 0, 100),
    player3Stat: new PlayerStatistic('Player3Stat', 'STATISTIK', 0, 'line chart'),
    player3Prog: new PlayerProgress('Player3Prog', 'blue', 'FORTSCHRITT', 0, 100),
    player4Stat: new PlayerStatistic('Player4Stat', 'STATISTIK', 0, 'line chart'),
    player4Prog: new PlayerProgress('Player4Prog', 'yellow', 'FORTSCHRITT', 0, 100),
    counter: new Statistic('counter', 270, 320, 'ZÄHLER', 0, 'hashtag'),

};

let waypoints = {
    wp1: new Waypoint('wp1', 'path1', 300, 50),
    wp2: new Waypoint('wp2', 'path1', 350, 100),
    wp3: new Waypoint('wp3', 'path1', 400, 150),
    wp4: new Waypoint('wp4', 'path1', 350, 200),
    wp5: new Waypoint('wp5', 'path1', 300, 250),
    wp6: new Waypoint('wp6', 'path1', 250, 200),
    wp7: new Waypoint('wp7', 'path1', 200, 150),
    wp8: new Waypoint('wp8', 'path1', 250, 100),
};

let dice = {dice1: new Dice('dice', 3, Templates.DICE_ALTERNATIVE),
    dice2: new Dice('dice', 3, Templates.DICE_ALTERNATIVE),
    dice3: new Dice('dice', 3, Templates.DICE_ALTERNATIVE),
    dice4: new Dice('dice', 3, Templates.DICE_ALTERNATIVE),   };

let buttons = {
    btnRoll : new Button('btnRoll', 10, 10, 'Würfeln', 'green'),
    btnQuestion: new Button('btnQuestion', 10, 50, 'Eine Frage beantworten', 'blue'),
    btnPrompt: new Button('btnPrompt', 10, 220, 'Eine Auswahl treffen', 'orange'),
    btnPopup: new Button('btnPopup', 10, 260, 'Ein Popup anzeigen', 'teal'),
    btnProgressUp: new Button('btnProgressUp', 10, 300, 'FORTSCHRITT', 'black', 'add circle'),
    btnProgressDown: new Button('btnProgressDown', 10, 340, 'FORTSCHRITT', 'black', 'minus circle'),
    btnSwitchState: new Button('btnSwitchState', 10, 400, 'State umschalten', 'yellow', 'refresh')
};

let cards = {
    cardStack: new CardStack('cardStack', 450, 50, 'Karten'),
    card: new Card('card1', 'Test', 'Dies ist ein Test.', 'assets/card1.jpg', (context) => {
        context.card.owner.inc('stat', 10);
        context.controller.items.cardStack.addCards(context.card);
    }),
    cardHand1: new CardHand('cardHand'),
    cardHand2: new CardHand('cardHand'),
    cardHand3: new CardHand('cardHand'),
    cardHand4: new CardHand('cardHand'),
};

let prompts = {
    prompt: new Prompt('prompt1', 'Auswahl',
        '<p>Bitte triff eine Auswahl aus den folgenden Punkten:</p><ul><li>Option 1</li><li>Option 2</li><li>Option 3</li><li>Option 4</li></ul>',
        '',
        {
            'Option 1':{color:'olive', icon:''},
            'Option 2':{color:'green', icon:''},
            'Option 3':{color:'teal',  icon:''},
            'Option 4':{color:'blue',  icon:''}
        }),

    question: new Question('guestion1', 'Frage',
        '<p>Was ist richtig?',
        '',
        {
            '1 + 1 = 2':{correct:true, value:10},
            '1 + 1 = 3':{correct:false, value:0},
        }),
};

cards.cardStack.addCards(cards.card);

// add (potential) players to the gameController
game.gameControllers[0].addPlayer(players.player1)
                       .addPlayer(players.player2)
                       .addPlayer(players.player3)
                       .addPlayer(players.player4);

let lobby = new Lobby(controller);

// STATE_INIT event-handlers
STATE_INIT.setHandlers({
    enter:  (src) => {
        // init the controller with all items
        src.addItems(players);
        src.addItems(stats);
        src.addItems(tokens);
        src.addItems(waypoints);
        src.addItems(dice);
        src.addItems(buttons);
        src.addItems(cards);
        src.addItems(prompts);

        // init player inventories
        let items = src.items;
        items.player1.addInventoryEx([items.playerToken1, items.player1Stat, items.player1Prog, items.dice1, items.cardHand1]);
        items.player2.addInventoryEx([items.playerToken2, items.player2Stat, items.player2Prog, items.dice2, items.cardHand2]);
        items.player3.addInventoryEx([items.playerToken3, items.player3Stat, items.player3Prog, items.dice3, items.cardHand3]);
        items.player4.addInventoryEx([items.playerToken4, items.player4Stat, items.player4Prog, items.dice4, items.cardHand4]);

        // init card-hand objects
        items.cardHand1.init(items.player1.inventory);
        items.cardHand2.init(items.player2.inventory);
        items.cardHand3.init(items.player3.inventory);
        items.cardHand4.init(items.player4.inventory);
        src.joinedPlayers.forEach((p) => {
            p.subscribe('stat', p.getInventory({id: p.id + 'Stat'}));
            p.subscribe('prog', p.getInventory({id: p.id + 'Prog'}));
            p.set('stat', 10);
            p.set('prog', 50);
        });

        src.subscribe('counter', items.counter);
        src.set('counter', 0);


        items.playerToken1.waypoint = items.wp1;
        items.playerToken2.waypoint = items.wp3;

        Lib.connectWaypoints([items.wp1, items.wp2, items.wp3, items.wp4,
            items.wp5, items.wp6, items.wp7, items.wp8, items.wp1], true);
        src.joinedPlayers.forEach((p) => {
            console.log(p.name);
            p.session.setBackgroundImage('/assets/strawberry.jpg');
        });
        src.setupBoard();
        src.nextState(STATE_1);
    },

    exit: (src) => {
        src.items.btnSwitchState.activate(src.items.player1);
    }
});


controller.on('playCard', function playCard(id, card) {
    card.action({controller, card});
    card.owner.removeInventory(card);
});

STATE_1.setHandlers({
    enter: (src) => {
        // activate Buttons (for all players)
        src.items.btnRoll.activate();
        src.items.btnQuestion.activate();
        src.items.btnPrompt.activate();
        src.items.btnPopup.activate();
        src.items.btnProgressUp.deactivate();
        src.items.btnProgressDown.deactivate();
        src.items.cardStack.activate();
    },

    click: (id, item, clientId) => {
        // get the player that clicked the button
        let controller = item.gameController;
        let player = controller.playersId[clientId];

        switch(id) {
            case 'btnRoll':
                player.getInventory({id: 'dice'}).roll();
                break;
            case 'btnQuestion':
                controller.items.question.show(player);
                break;
            case 'btnPrompt':
                controller.items.prompt.show(player);
                break;
            case 'btnPopup':
                controller.sendPopup({
                    header:'Popup',
                    msg:'Dies ist ist ein Popup!',
                    icon:'info circle',
                    players:player, x:150, y:100, color:'green'});
                break;
            case 'btnSwitchState':
                controller.nextState(STATE_2);
                break;
            default:
                break;
        }
    },

    roll: (id, dice, clientId) => {
        if(dice.owner.get('wps')) return;

        dice.gameController.inc('counter');
        dice.rollResult(dice.owner);
        let wps = Lib.getWaypointsAtRange(dice.owner.getInventory({category: 'playertokens'})[0].waypoint, dice.result);

        // store the wps (for this player) in a custom var => for deactivating them later
        dice.owner.set('wps', wps);
        wps.forEach((wp) => {
            wp.activate(dice.owner);
            wp.highlight(dice.owner);
        });
    },

    selectWaypoint: (id, item, clientId) => {
        let player = item.gameController.playersId[clientId];

        player.getInventory({category: 'playertokens'})[0].moveToWaypoint(item);
        player.getInventory({id: 'dice'}).reset();

        player.get('wps').forEach((wp) => {
            wp.deactivate(dice.owner);
            wp.unhighlight(dice.owner);
        });

        player.set('wps', null);
    },

    enterWaypoint: (id, wp, item, clientId) => {
        item.gameController.sendLog(item.owner.name, {content:'erreicht ' + wp.id +'!', icon:'inverted yellow location arrow'});
    },

    drawCard: (id, card, stack, clientId) => {
        if (card) {
            let player = card.gameController.playersId[clientId];
            card.draw(player);
            player.addInventory(card);
            player.getInventory({id: 'cardHand'}).activate();
        }
    },

    questionWrong: (id, option, value, question, clientId) => {
        let player = question.gameController.playersId[clientId];
        question.showResult(player);
    },

    questionCorrect: (id, option, value, question, clientId) => {
        let player = question.gameController.playersId[clientId];
        question.showResult(player);
    },

    prompt: (id, option, prompt, clientId) => {
        let player = prompt.gameController.playersId[clientId];
        prompt.gameController.sendLog(player.name, {content:'hat ' + option + ' gewählt!', icon:'inverted orange check square'});
    },

    exit: (src) => {
        src.items.btnSwitchState.context.color = 'purple';
        src.items.btnSwitchState.draw(src.items.player1);
    },

});

STATE_2.setHandlers({
    enter: (src) => {
        // activate Buttons (for all players)
        src.items.btnRoll.deactivate();
        src.items.btnQuestion.deactivate();
        src.items.btnPrompt.deactivate();
        src.items.btnPopup.deactivate();
        src.items.btnProgressUp.activate();
        src.items.btnProgressDown.activate();
        src.items.cardStack.deactivate();
    },

    click: (id, item, clientId) => {
        // get the player that clicked the button
        let controller = item.gameController;
        let player = controller.playersId[clientId];

        switch(id) {
            case 'btnSwitchState':
                controller.nextState(STATE_1);
                break;
            case 'btnProgressUp':
                player.inc('prog', 10);
                break;
            case 'btnProgressDown':
                player.dec('prog', 10);
                break;
            default:
                break;
        }
    },

    exit: (src) => {
        src.items.btnSwitchState.context.color = 'yellow';
        src.items.btnSwitchState.draw(src.items.player1);
    },
});


// *****************************************************************************
// Game-Lobby
controller.on( 'joinPlayer', (player) => { lobby.joinPlayer(player); } );

lobby.on('allPlayersReady', () => {
    lobby.quit();
    console.log('all players ready');
    controller.nextState(STATE_INIT);
});
