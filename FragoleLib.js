
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

            //    if (dist == depth+1) {
            //        console.log(distance);
            //        return res[depth-1];
            //    }
            }
        }
    }
    return res[depth-1];
}
module.exports.getWaypointsAtRange = getWaypointsAtRange;

/*
// move to unit tests
var wp1 = new Fragole.Waypoint('wp1', 'wp', 0, 0),
    wp2 = new Fragole.Waypoint('wp2', 'wp', 0, 0),
    wp3 = new Fragole.Waypoint('wp3', 'wp', 0, 0),
    wp4 = new Fragole.Waypoint('wp4', 'wp', 0, 0),
    wp5 = new Fragole.Waypoint('wp5', 'wp', 0, 0),
    wp6 = new Fragole.Waypoint('wp6', 'wp', 0, 0),
    wp7 = new Fragole.Waypoint('wp7', 'wp', 0, 0),
    wp8 = new Fragole.Waypoint('wp8', 'wp', 0, 0),
    wp9 = new Fragole.Waypoint('wp9', 'wp', 0, 0);

connectWaypoints([wp1, wp2, wp3, wp6, wp7, wp8, wp9, wp1]);
connectWaypoints([wp2, wp4, wp6]);
connectWaypoints([wp7, wp5, wp1]);
connectWaypoints([wp2, wp5]);
connectWaypoints([wp9, wp5]);

console.log(getWaypointsAtRange(wp1, 2));
*/
