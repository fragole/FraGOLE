/**
 * @Author: Michael Bauer
 * @Date:   2017-06-13T19:56:11+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-14T19:15:11+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var sqlite = require('sqlite3'),
    db = new sqlite.Database('fragole.db');

// insertPlayer if not present in db
function updatePlayer(name, callback) {
    selectPlayer(name, function(row) {
        if (!row) {
            var sql = db.prepare('INSERT INTO players (`name`) VALUES (?)');
            sql.run(name, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    callback();
                }
            });
        }
    });
}

function selectPlayer(name, callback) {
    var sql_sel = db.prepare('SELECT * FROM players WHERE name = ?');
    sql_sel.get(name, function (err, row) {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

function selectPlayerStatistic(name, statistic, callback) {
    var sql_sel = db.prepare('SELECT * FROM players INNER JOIN statistics ON players.player_id = statistics.player_id WHERE players.name=? AND statistics.name = ?');
    sql_sel.get(name, statistic, function (err, row) {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

function selectPlayerBadge(name, badge, callback) {
    var sql_sel = db.prepare('SELECT * FROM players INNER JOIN badges ON players.player_id = badges.player_id WHERE players.name=? AND badges.badge = ?');
    sql_sel.get(name, badge, function (err, row) {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

function selectPlayerStatistics(name, callback) {
    var res = [];
    var sql_sel = db.prepare('SELECT * FROM players INNER JOIN statistics ON players.player_id = statistics.player_id WHERE players.name=?');
    sql_sel.each(name, function (err, row) {
        if (err) {
            console.error(err);
        }
        res.push(row);

    }, () => callback(res));
}

function selectPlayerBadges(name, callback) {
    var res = [];
    var sql_sel = db.prepare('SELECT * FROM players INNER JOIN badges ON players.player_id = badges.player_id WHERE players.name=?');
    sql_sel.each(name, function (err, row) {
        if (err) {
            console.error(err);
        }
        res.push(row);
    }, () => callback(res));
}

function updatePlayerStatistic(name, statistic, value) {
    selectPlayerStatistic(name, statistic, function (row) {
        if (row) {
            var upd_sql = db.prepare('UPDATE statistics SET value = ? WHERE player_id = ? AND name = ?');
            upd_sql.run(value, row.player_id, row.name);
        } else {
            selectPlayer(name, function(player) {
                var ins_sql = db.prepare('INSERT INTO statistics (player_id, name, value) VALUES (?,?,?);');
                ins_sql.run(player.player_id, statistic, value);
            });
        }
    });
}

function updatePlayerBadge(name, badge, earned, callback) {
    selectPlayerBadge(name, badge, function (row) {
        if(!row) {
            selectPlayer(name, function(player) {
                var ins_sql = db.prepare('INSERT INTO badges (player_id, badge, earned) VALUES (?,?,?);');
                ins_sql.run(player.player_id, badge, earned);
                callback();
            });
        }
    });
}

module.exports = {
    updatePlayerStatistic: updatePlayerStatistic,
    updatePlayerBadge : updatePlayerBadge,
    selectPlayerStatistics: selectPlayerStatistics,
    selectPlayerBadges : selectPlayerBadges,
    updatePlayer: updatePlayer,
};
