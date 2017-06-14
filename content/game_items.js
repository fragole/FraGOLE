/**
 * @Author: Michael Bauer
 * @Date:   2017-06-06T11:09:28+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-06T19:12:56+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

var Lib = require('../FragoleLib.js');
var Waypoint = require('../Objects/FragoleObjects.js').Waypoint;
var Prompt = require('../objects/FragoleObjects.js').Prompt;
var Question = require('../objects/FragoleObjects.js').Question;
var CustomTemplates = require('./custom_templates.js');

 // Waypoints
var waypoints = {
    start: new Waypoint('start', 'path1', 65, 650, CustomTemplates.WAYPOINT_GREEN),
    wp2: new Waypoint('wp2', 'path1', 35, 590, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp3: new Waypoint('wp3', 'path1', 32, 540, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp4: new Waypoint('wp4', 'path1', 55, 490, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp5: new Waypoint('wp5', 'path1', 80, 440, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp6: new Waypoint('wp6', 'path1', 90, 390, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp7: new Waypoint('wp7', 'path1', 70, 337, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp8: new Waypoint('wp8', 'path1', 45, 285, CustomTemplates.WAYPOINT_SMALL_WHITE),

    camp1: new Waypoint('camp1', 'path1', 45, 220, CustomTemplates.WAYPOINT_LIGHT_BLUE),

    wp11: new Waypoint('wp11', 'path1', 78, 180, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp12: new Waypoint('wp12', 'path1', 130, 153, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp13: new Waypoint('wp13', 'path1', 182, 143, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp14: new Waypoint('wp14', 'path1', 234, 140, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp15: new Waypoint('wp15', 'path1', 286, 138, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp16: new Waypoint('wp16', 'path1', 338, 138, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp17: new Waypoint('wp17', 'path1', 390, 152, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp18: new Waypoint('wp18', 'path1', 442, 148, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp19: new Waypoint('wp19', 'path1', 494, 120, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp20: new Waypoint('wp20', 'path1', 546, 120, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp21: new Waypoint('wp21', 'path1', 598, 115, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp22: new Waypoint('wp22', 'path1', 640, 70, CustomTemplates.WAYPOINT_SMALL_WHITE),

    peak: new Waypoint('peak', 'path1', 685, 30, CustomTemplates.WAYPOINT_ORANGE),

    wp24: new Waypoint('wp24', 'path1', 760, 42, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp25: new Waypoint('wp25', 'path1', 820, 33, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp26: new Waypoint('wp26', 'path1', 875, 40, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp27: new Waypoint('wp27', 'path1', 925, 70, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp28: new Waypoint('wp28', 'path1', 952, 112, CustomTemplates.WAYPOINT_SMALL_WHITE),

    camp2: new Waypoint('camp2', 'path1', 960, 162, CustomTemplates.WAYPOINT_LIGHT_BLUE),

    wp30: new Waypoint('wp30', 'path1', 995, 205, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp31: new Waypoint('wp31', 'path1', 1025, 250, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp32: new Waypoint('wp32', 'path1', 1020, 300, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp33: new Waypoint('wp33', 'path1', 1020, 350, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp34: new Waypoint('wp34', 'path1', 1062, 380, CustomTemplates.WAYPOINT_SMALL_WHITE),

    camp3: new Waypoint('camp3', 'path1', 1070, 427, CustomTemplates.WAYPOINT_LIGHT_BLUE),

    wp36: new Waypoint('wp36', 'path1', 1045, 473, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp37: new Waypoint('wp37', 'path1', 1032, 525, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp38: new Waypoint('wp38', 'path1', 1040, 575, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp39: new Waypoint('wp39', 'path1', 1025, 618, CustomTemplates.WAYPOINT_SMALL_WHITE),

    wp40: new Waypoint('wp40', 'path1', 975, 632, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp41: new Waypoint('wp41', 'path1', 925, 626, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp42: new Waypoint('wp42', 'path1', 875, 618, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp43: new Waypoint('wp43', 'path1', 825, 638, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp44: new Waypoint('wp44', 'path1', 775, 656, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp45: new Waypoint('wp45', 'path1', 725, 655, CustomTemplates.WAYPOINT_SMALL_WHITE),

    wp46: new Waypoint('wp46', 'path1', 675, 653, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp47: new Waypoint('wp47', 'path1', 625, 653, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp48: new Waypoint('wp48', 'path1', 575, 660, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp49: new Waypoint('wp49', 'path1', 525, 670, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp50: new Waypoint('wp50', 'path1', 475, 668, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp51: new Waypoint('wp51', 'path1', 425, 655, CustomTemplates.WAYPOINT_SMALL_WHITE),

    camp4: new Waypoint('camp4', 'path1', 360, 645, CustomTemplates.WAYPOINT_LIGHT_BLUE),

    wp53: new Waypoint('wp53', 'path1', 300, 658, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp54: new Waypoint('wp54', 'path1', 245, 663, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp55: new Waypoint('wp55', 'path1', 190, 658, CustomTemplates.WAYPOINT_SMALL_WHITE),
    wp56: new Waypoint('wp56', 'path1', 135, 665, CustomTemplates.WAYPOINT_SMALL_WHITE),

    wp101: new Waypoint('wp101', 'path2', 112, 590, CustomTemplates.WAYPOINT_SMALL_RED),
    wp102: new Waypoint('wp102', 'path2', 205, 570, CustomTemplates.WAYPOINT_SMALL_RED),
    wp103: new Waypoint('wp103', 'path2', 235, 490, CustomTemplates.WAYPOINT_SMALL_RED),
    wp104: new Waypoint('wp104', 'path2', 250, 410, CustomTemplates.WAYPOINT_SMALL_RED),
    wp105: new Waypoint('wp105', 'path2', 350, 400, CustomTemplates.WAYPOINT_SMALL_RED),
    bigcamp1: new Waypoint('bigcamp1', 'path2', 485, 370, CustomTemplates.WAYPOINT_GOLD),

    wp107: new Waypoint('wp107', 'path2', 550, 285, CustomTemplates.WAYPOINT_SMALL_RED),
    wp108: new Waypoint('wp108', 'path2', 620, 265, CustomTemplates.WAYPOINT_SMALL_RED),
    wp109: new Waypoint('wp109', 'path2', 680, 210, CustomTemplates.WAYPOINT_SMALL_RED),
    wp110: new Waypoint('wp110', 'path2', 700, 150, CustomTemplates.WAYPOINT_SMALL_RED),
    wp111: new Waypoint('wp111', 'path2', 710, 90, CustomTemplates.WAYPOINT_SMALL_RED),

    wp201: new Waypoint('wp201', 'path3', 425, 615, CustomTemplates.WAYPOINT_SMALL_RED),
    wp202: new Waypoint('wp202', 'path3', 483, 590, CustomTemplates.WAYPOINT_SMALL_RED),
    wp203: new Waypoint('wp203', 'path3', 545, 560, CustomTemplates.WAYPOINT_SMALL_RED),
    wp204: new Waypoint('wp204', 'path3', 600, 510, CustomTemplates.WAYPOINT_SMALL_RED),
    wp205: new Waypoint('wp205', 'path3', 625, 440, CustomTemplates.WAYPOINT_SMALL_RED),

    bigcamp2: new Waypoint('bigcamp2', 'path3', 650, 380, CustomTemplates.WAYPOINT_GOLD),

    wp207: new Waypoint('wp207', 'path3', 723, 335, CustomTemplates.WAYPOINT_SMALL_RED),
    wp208: new Waypoint('wp208', 'path3', 790, 320, CustomTemplates.WAYPOINT_SMALL_RED),
    wp209: new Waypoint('wp209', 'path3', 860, 300, CustomTemplates.WAYPOINT_SMALL_RED),
    wp210: new Waypoint('wp210', 'path3', 885, 240, CustomTemplates.WAYPOINT_SMALL_RED),
    wp211: new Waypoint('wp211', 'path3', 920, 190, CustomTemplates.WAYPOINT_SMALL_RED),

    wp301: new Waypoint('wp301', 'path4', 400, 350, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp302: new Waypoint('wp302', 'path4', 330, 325, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp303: new Waypoint('wp303', 'path4', 270, 270, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp304: new Waypoint('wp304', 'path4', 200, 215, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp305: new Waypoint('wp305', 'path4', 120, 230, CustomTemplates.WAYPOINT_SMALL_ORANGE),

    wp401: new Waypoint('wp401', 'path5', 723, 400, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp402: new Waypoint('wp402', 'path5', 790, 435, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp403: new Waypoint('wp403', 'path5', 860, 490, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp404: new Waypoint('wp404', 'path5', 940, 485, CustomTemplates.WAYPOINT_SMALL_ORANGE),
    wp405: new Waypoint('wp405', 'path5', 1010, 420, CustomTemplates.WAYPOINT_SMALL_ORANGE),
};

function connectWaypoints () {
    var paths = {};

    for (let k in waypoints) {
        var wp= waypoints[k];
        if (paths[wp.category] instanceof Array) {
            paths[wp.category].push(wp);
        } else {
            paths[wp.category]=[wp];
        }
    }

    Lib.connectWaypoints(paths['path1'], true);
    Lib.connectWaypoints(paths['path2'], true);
    Lib.connectWaypoints(paths['path3'], true);
    Lib.connectWaypoints(paths['path4'], true);
    Lib.connectWaypoints(paths['path5'], true);

    // connect paths
    Lib.connectWaypoints([waypoints.wp56, waypoints.start], true);
    Lib.connectWaypoints([waypoints.start, waypoints.wp101], true);
    Lib.connectWaypoints([waypoints.wp111, waypoints.peak], true);
    Lib.connectWaypoints([waypoints.wp305, waypoints.camp1], true);
    Lib.connectWaypoints([waypoints.bigcamp1, waypoints.wp301], true);
    Lib.connectWaypoints([waypoints.camp4, waypoints.wp201], true);
    Lib.connectWaypoints([waypoints.camp2, waypoints.wp211], true);
    Lib.connectWaypoints([waypoints.bigcamp2, waypoints.wp401], true);
    Lib.connectWaypoints([waypoints.wp405, waypoints.camp3], true);



}

var prompts = {
    choose_action : new Prompt('choose_action', 'Du bist dran!',
        '<p>Du kannst eine von folgenden Aktionen ausfürhen:</p>',
        null,
        {
            'Würfeln':{color:'olive', icon:'cube'},
            'Eine Frage beantworten':{color:'green', icon:'help'},
            'Eine Karte ziehen':{color:'teal',  icon:'clone'},
        }),
};

module.exports = {
    waypoints: waypoints,
    connectWaypoints: connectWaypoints,
    prompts: prompts,
};
