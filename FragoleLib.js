
// nomalize the target coordinates when moving a token
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
    var distance = {};
    var visited = new Set();
    var queue =  [];
    var res = {};
    queue.push(root);
    visited.add(root);
    distance[root.id] = 0;
    depth += 1;
    while (queue.length) {
        var current = queue.pop();
        for (let next of current.next) {
            if(!visited.has(next)) {
                var dist;
                queue.push(next);
                visited.add(next);
                dist = distance[current.id] + 1;
                distance[next.id] = dist;

                if (res[dist]) {
                    res[dist].push(next);
                } else {
                    res[dist] = [next];
                }
            }
        }
    }
    return res[depth-1];
}
module.exports.getWaypointsAtRange = getWaypointsAtRange;

// get the shortest path between to waypoints
// unoptimized -> only gets first found path when multiple paths are possible
function getPath(wpStart, wpEnd) { // length) {
    var path= [wpStart],
        queue = [],
        res = [];

    queue.push(path);
    while(queue.length) {
        var curr_path = queue.pop();
        var last_node = curr_path[curr_path.length-1];
        if (last_node == wpEnd) { //&& curr_path.length == length) {
            return curr_path;
        }
        for (let next of last_node.next) {
            if(curr_path.indexOf(next) < 0) {
                queue.push(curr_path.concat([next]));
            }
        }
    }
    return res;
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

//for (let wp of getWaypointsAtRange(wp1, 2)) {
//    console.log(wp.id);
//}

for (let pth of getPath(wp1, wp3, 3)) {
    console.log('next');
    for (let wp of pth) {
        console.log(wp.id);
    }
}
*/
