/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-15T21:10:32+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

// normalize the target coordinates when moving a token
// this helps centering tokens upon each other
function nomalizeCoordinates(token, targ_x, targ_y) {
    var tpl = token.template,
        norm_x = targ_x,
        norm_y = targ_y;

    if (!token.template._radius) { // circular tokens are already nomralized
        norm_x = targ_x - tpl._width / 2;
        norm_y = targ_y - tpl._height /2;
    }
    return {x: norm_x, y: norm_y};
}
module.exports.nomalizeCoordinates = nomalizeCoordinates;

// connect a list of waypoint in order of the listen
// [wp1, wp2, wp3] results in wp1 => wp2 => wp3
// if bothWays is set:
// [wp1, wp2, wp3] results in wp1 <=> wp2 <=> wp3
function connectWaypoints( wpList, bothWays=false ) {
    var curr_wp = wpList.shift();
    for (let wp of wpList) {
        curr_wp.next.push(wp);
        if (bothWays) {
            wp.next.push(curr_wp);
        }
        curr_wp = wp;
    }
}
module.exports.connectWaypoints = connectWaypoints;

function getWaypointsAtRange(root, depth) {
    var curr_depth = 0;
    var unvisited_childs = {};
    var visited = new Set();
    var curr_wp = root;
    var temp_wp;
    var curr_path = [root];
    var res = new Set();

    while (curr_depth>=0) {
        visited.add(curr_wp.id);
        if (unvisited_childs[curr_wp.id] instanceof Array) {
            if(curr_depth == depth) {
                res.add(curr_wp);  // add wp to result
            }
            if (curr_depth == depth || curr_wp.next == [] || unvisited_childs[curr_wp.id].length == 0) {
                temp_wp = curr_path.pop(); // back-track
                if( temp_wp == curr_wp) {
                    //console.log('backtrack on self');
                    continue;
                }
                if(!temp_wp) {
                    ///console.log('cant backtrack');
                    break;
                }
                curr_wp = temp_wp;
                curr_depth--;
                //console.log('backtrack', curr_wp.id, curr_depth);
            } else {
                // forward to next unvisited child node
                temp_wp = unvisited_childs[curr_wp.id].pop();
                if(!temp_wp || visited.has(temp_wp.id)) {
                    //console.log('cont     ', curr_wp.id, curr_depth);
                    continue;
                }
                curr_wp = temp_wp;
                curr_depth++;
                //console.log('forward  ', curr_wp.id, curr_depth);
            }
        } else {
            // init unvisited child nodes
            unvisited_childs[curr_wp.id] = curr_wp.next.slice();
            //console.log('init     ', curr_wp.id);
            continue;
        }
        // add node to the current path
        //console.log('push     ', curr_wp.id, curr_depth);
        curr_path.push(curr_wp);
    }
    return res;
}
module.exports.getWaypointsAtRange = getWaypointsAtRange;

// get the shortest path between to waypoints
// unoptimized -> only gets first found path when multiple paths are possible
function getPath(wpStart, wpEnd) { // length) {
    var path= [wpStart],
        queue = [],
        res = [],
        min_path = null;

    queue.push(path);
    while(queue.length) {
        var curr_path = queue.pop();
        var last_node = curr_path[curr_path.length-1];
        if (last_node == wpEnd) { //&& curr_path.length == length) {
            res.push(curr_path);
        }
        for (let next of last_node.next) {
            if(curr_path.indexOf(next) < 0) {
                queue.push(curr_path.concat([next]));
            }
        }
    }

    for (let p of res) {
        if(!min_path || p.length < min_path.length) {
            min_path = p;
        }
    }
    return min_path;
}
module.exports.getPath = getPath;

// marge key/value pairs from addDict into targetDict if not present
// in targetDict
function mergeDicts(targetDict, addDict) {
    for(let addKey in addDict) {
        if(!targetDict[addKey]) {
            targetDict[addKey] = addDict[addKey];
        }
    }
    return targetDict;
}
module.exports.mergeDicts = mergeDicts;

// execute func_a with prob probability, else execute func b
function probably(prob, func_a, func_b) {
    var rand = Math.floor(Math.random() * 100 + 1);
    if (rand >= 100 - prob) {
        func_a();
    } else {
        func_b();
    }
}
module.exports.probably = probably;

/*
// move to unit tests
var Waypoint = require('./objects/Waypoint.js').Waypoint;
var wp1 = new Waypoint('wp1', 'wp', 0, 0),
    wp2 = new Waypoint('wp2', 'wp', 0, 0),
    wp3 = new Waypoint('wp3', 'wp', 0, 0),
    wp4 = new Waypoint('wp4', 'wp', 0, 0),
    wp5 = new Waypoint('wp5', 'wp', 0, 0),
    wp6 = new Waypoint('wp6', 'wp', 0, 0),
    wp7 = new Waypoint('wp7', 'wp', 0, 0),
    wp8 = new Waypoint('wp8', 'wp', 0, 0),
    wp9 = new Waypoint('wp9', 'wp', 0, 0);

connectWaypoints([wp1, wp2, wp3, wp6, wp7, wp8, wp9, wp1]);
connectWaypoints([wp2, wp4, wp6]);
connectWaypoints([wp7, wp5, wp1]);
connectWaypoints([wp2, wp5]);
connectWaypoints([wp9, wp5]);

//for (let wp of wp5.next) {
//    console.log(wp.id);
//}

for (let wp of naiveWaypoints(wp1, 2)) {
    console.log(wp.id);
}

*/
/*
for (let pth of getPath(wp1, wp3, 3)) {
    console.log('next');
    for (let wp of pth) {
        console.log(wp.id);
    }
}
*/
