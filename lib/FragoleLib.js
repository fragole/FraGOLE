/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:33:37+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

/**
* normalize the target coordinates when moving a token
* this helps centering tokens upon each other
* @param {Token} token - The Token whose coordinates should be normalizeCoordinates
* @param {number} targX - Target x-Position
* @param {number} targY - Target y-Position
*/
function normalizeCoordinates(token, targX, targY) {
    let tpl = token.template;
    let normX = targX;
    let normY = targY;

    if (!token.template._radius) { // circular tokens are already nomralized
        normX = targX - tpl._width / 2;
        normY = targY - tpl._height /2;
    }
    return {x: normX, y: normY};
}
module.exports.normalizeCoordinates = normalizeCoordinates;

/**
* connect a list of waypoint in order of the list
* [wp1, wp2, wp3] results in wp1 => wp2 => wp3
* if bothWays is set:
* [wp1, wp2, wp3] results in wp1 <=> wp2 <=> wp3
* @param {Array<Waypoint>} wpList - An Array containing the Waypoints that should be connected
* @param {boolean} bothWays - true = connect back an forth, false = connect only forwards
*/
function connectWaypoints(wpList, bothWays=false) {
    let currWp = wpList.shift();
    for (let wp of wpList) {
        currWp.next.push(wp);
        if (bothWays) {
            wp.next.push(currWp);
        }
        currWp = wp;
    }
}
module.exports.connectWaypoints = connectWaypoints;


/**
* Determine which Waypoints are reachable from a root Waypoint  with a give number of moves
* @param {Waypoint} root - the starting Waypoint
* @param {number} depth - number of moves
*/
function getWaypointsAtRange(root, depth) {
    let currDepth = 0;
    let unvisitedChilds = {};
    let visited = new Set();
    let currWp = root;
    let tempWp;
    let currPath = [root];
    let res = new Set();

    while (currDepth>=0) {
        visited.add(currWp.id);
        if (unvisitedChilds[currWp.id] instanceof Array) {
            if(currDepth === depth) {
                res.add(currWp);  // add wp to result
            }
            if (currDepth === depth || currWp.next === [] || unvisitedChilds[currWp.id].length === 0) {
                tempWp = currPath.pop(); // back-track
                if( tempWp === currWp) {
                    continue;
                }
                if(!tempWp) {
                    break;
                }
                currWp = tempWp;
                currDepth--;
            } else {
                tempWp = unvisitedChilds[currWp.id].pop();
                if(!tempWp || visited.has(tempWp.id)) {
                    continue;
                }
                currWp = tempWp;
                currDepth++;
            }
        } else {
            unvisitedChilds[currWp.id] = currWp.next.slice();
            continue;
        }
        // add node to the current path
        currPath.push(currWp);
    }
    return res;
}
module.exports.getWaypointsAtRange = getWaypointsAtRange;

/**
* get the shortest path between two waypoints
* @param {Waypoint} wpStart - starting Waypoint
* @param {Waypoint} wpEnd - ending Waypoint
*/
// unoptimized -> only gets first found path when multiple paths are possible
function getPath(wpStart, wpEnd) { // length) {
    let path= [wpStart];
    let queue = [];
    let res = [];
    let minPath = null;

    queue.push(path);
    while(queue.length) {
        let currPath = queue.pop();
        let lastNode = currPath[currPath.length-1];
        if (lastNode === wpEnd) { //&& currPath.length == length) {
            res.push(currPath);
        }
        for (let next of lastNode.next) {
            if(currPath.indexOf(next) < 0) {
                queue.push(currPath.concat([next]));
            }
        }
    }

    for (let p of res) {
        if(!minPath || p.length < minPath.length) {
            minPath = p;
        }
    }
    return minPath;
}
module.exports.getPath = getPath;

/**
* merge key/value pairs from addDict into targetDict if the key is not already present in targetDict
* @param {Object} targetDict - an object into which addDict should be mergeDicts
* @param {Object} addDict - the object which key/value pairs should be merged into targetDict
*/
function mergeDicts(targetDict, addDict) {
    for(let addKey in addDict) {
        if(!targetDict[addKey]) {
            targetDict[addKey] = addDict[addKey];
        }
    }
    return targetDict;
}
module.exports.mergeDicts = mergeDicts;

/**
* execute funcA with prob probability, else execute func b
* @param {number} prob - probability in percent (0-100)
* @param {function} funcA - execute this if random-number < prob
* @param {function} funcB - execute this if random-number > prob
*/
function probably(prob, funcA, funcB) {
    let rand = Math.floor(Math.random() * 100 + 1);
    if (rand >= 100 - prob) {
        funcA();
    } else {
        funcB();
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
