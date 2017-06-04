/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-04T10:53:44+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

module.exports= {
    Collection:       require('./Collection.js').Collection,
    Component:        require('./Component.js').Component,
    Dice:             require('./Dice.js').Dice,
    Game:             require('./Game.js').Game,
    GameController:   require('./GameController.js').GameController,
    GameObject:       require('./GameObject.js').GameObject,
    GameItem:         require('./GameObject.js').GameItem,
    GameState:        require('./GameState.js').GameState,
    Player:           require('./Player.js').Player,
    PlayerToken:      require('./PlayerToken.js').PlayerToken,
    Progress:         require('./Progress.js').Progress,
    PlayerProgress:   require('./Progress.js').PlayerProgress,
    Rating:           require('./Rating.js').Rating,
    PlayerRating:     require('./Rating.js').PlayerRating,
    Statistic:        require('./Statistic.js').Statistic,
    PlayerStatistic:  require('./Statistic.js').PlayerStatistic,
    Token:            require('./Token.js').Token,
    Waypoint:         require('./Waypoint.js').Waypoint,
    Prompt:           require('./Prompt.js').Prompt,
    Question:         require('./Prompt.js').Question,
    Card:             require('./Cards.js').Card,
    CardStack:        require('./Cards.js').CardStack,
    CardHand:         require('./Cards.js').CardHand,
};
