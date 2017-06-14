/**
 * @Author: Michael Bauer
 * @Date:   2017-06-13T19:55:21+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-14T20:22:28+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */
const db = require('./db.js');

class PlayerModel {
    constructor (name) {
        this.name = name;
        this.statistics = {};
        this.badges = {};
        db.updatePlayer(this.name, () => {});
        this.refresh(() => {});
    }

    setStatistic(statistic, value, callback) {
        this.statistics[statistic] = value;
        db.updatePlayerStatistic(this.name, statistic, value, callback);
    }

    incStatistic(statistic, callback) {
        this.refresh(() => {
            if(!this.statistics[statistic]) {
                this.statistics[statistic] = 0;
            }
            this.statistics[statistic]++;
            this.setStatistic(statistic, this.statistics[statistic], callback);
        });
    }

    setBadge(badge, callback) {
        db.updatePlayerBadge(this.name, badge, new Date(), callback);
    }

    refresh (callback) {
        this.getStatistics((statistics) => {
            this.getBadges((badges) => {
                callback(this);
            });
        });
    }

    getStatistics(callback) {
        db.selectPlayerStatistics(this.name, (statistics) => {
            for(let statistic of statistics) {
                this.statistics[statistic.name] = statistic.value;
            }
            callback(this.statistics);
        });
    }

    getBadges(callback) {
        db.selectPlayerBadges(this.name, (badges) => {
            for(let badge of badges) {
                this.badges[badge.badge] = badge.earned;
            }
            callback(this.badges);
        });
    }
}
module.exports.PlayerModel = PlayerModel;
