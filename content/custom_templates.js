/**
 * @Author: Michael Bauer
 * @Date:   2017-06-06T08:21:49+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:40:42+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

const Templates = require('../lib/FragoleTemplates.js');

class WAYPOINT_GREEN extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'green', stroke:'black', layer:'back', radius:24});
    }
}

class WAYPOINT_ORANGE extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'orange', stroke:'black', layer:'back', radius:24});
    }
}

class WAYPOINT_LIGHT_BLUE extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'dodgerblue', stroke:'black', layer:'back', radius:16});
    }
}

class WAYPOINT_GOLD extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'gold', stroke:'black', layer:'back', radius:24});
    }
}

class WAYPOINT_SMALL_WHITE extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'white', stroke:'black', layer:'back', radius:12});
    }
}

class WAYPOINT_SMALL_RED extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'orangered', stroke:'black', layer:'back', radius:12});
    }
}

class WAYPOINT_SMALL_ORANGE extends Templates.ShapeTemplate {
    constructor() {
        super({shape:Templates.shapes.CIRCLE, fill:'orange', stroke:'black', layer:'back', radius:12});
    }
}


module.exports = {
    WAYPOINT_GREEN: WAYPOINT_GREEN,
    WAYPOINT_ORANGE: WAYPOINT_ORANGE,
    WAYPOINT_LIGHT_BLUE: WAYPOINT_LIGHT_BLUE,
    WAYPOINT_GOLD: WAYPOINT_GOLD,
    WAYPOINT_SMALL_WHITE: WAYPOINT_SMALL_WHITE,
    WAYPOINT_SMALL_RED: WAYPOINT_SMALL_RED,
    WAYPOINT_SMALL_ORANGE: WAYPOINT_SMALL_ORANGE,
};
