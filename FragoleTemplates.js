var pug = require('pug');

// shapes
const CIRCLE = 'dc';
const RECTANGLE = 'dr';
const ROUNDED_RECTANGLE = 'rc';
const STAR = 'dp';

// This File contains Templates for graphical UI-Elements

// BaseTemplate represents the minimal subset of attributes
// for an UI-Elemtent => basic dimensons of the Element
// x,y represents the weight-center of the element
class BaseTemplate {
    constructor (layer='front', x=0, y=0, width=0, height=0) {
        this._layer = layer;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }

    layer(layer) {
        this._layer = layer;
        return this;
    }

    x(x) {
        this._x = x;
        return this;
    }

    y(y) {
        this._y = y;
        return this;
    }

    width(width) {
        this._width = width;
        return this;
    }

    height(height) {
        this._height = height;
        return this;
    }

}

// ShapeTemplate: Attributes for Shapes that will be drawn into the
// canvas on the client-side
class ShapeTemplate extends BaseTemplate {
    constructor ({shape=null, fill='', stroke='' , layer='front', x=0, y=0, radius=0, width=0, height=0, sides=0, angle=0, pointsize=0}) {
        super(layer, x, y, width, height);
        this._shape = shape;
        this._fill = fill;
        this._stroke = stroke;
        this._radius = radius;
        this._sides = sides;
        this._angle = angle;
        this._pointsize = pointsize;
        this._x = this.x(x);
        this._y = this.y(y);
        return this;
    }

    shape(shape) {
        this._shape = shape;
        return this;
    }

    x(x) {
        if (this.shape == CIRCLE || this.shape == STAR) {
            this._x = x;
        } else {
            this._x = x - (this._width / 2);
        }
        return this;
    }

    y(y) {
        if (this.shape == CIRCLE || this.shape == STAR) {
            this._y = y;
        } else {
            this._y = y - (this._height / 2);
        }
        return this;
    }


    stroke(stroke) {
        this._stroke = stroke;
        return this;
    }

    fill(fill) {
        this._fill = fill;
        return this;
    }

    radius(radius) {
        this._radius = radius;
        return this;
    }

}

class ImageTemplate extends BaseTemplate {
    constructor({src='', layer='front', x=0, y=0, width=0, height=0}) {
        super(layer, x, y, width, height);
        this._src = src;
        this._x = this.x(x);
        this._y = this.y(y);
        return this;
    }

    x(x) {
        this._x = x - (this._width / 2);
        return this;
    }

    y(y) {
        this._y = y - (this._height / 2);
        return this;
    }

    src(src) {
        this._src = src;
        return this;
    }
}

class WAYPOINT_DEFAULT extends ShapeTemplate {
    constructor () {
        super({shape:CIRCLE, fill:'white', stroke:'black', layer:'back', radius:20});
    }
}

class PLAYER_TOKEN_DEFAULT extends ImageTemplate {
    constructor () {
        var srcList = [
            'assets/Pieces (Red)/meeple1.png',
            'assets/Pieces (Green)/meeple1.png',
            'assets/Pieces (Blue)/meeple1.png',
            'assets/Pieces (Yellow)/meeple1.png',
            'assets/Pieces (Purple)/meeple1.png',
            'assets/Pieces (Black)/meeple1.png',
            'assets/Pieces (White)/meeple1.png',];

        super({src:srcList[PLAYER_TOKEN_DEFAULT.counter % 6], layer:'front', width:64, height:64});
        PLAYER_TOKEN_DEFAULT.counter++;
    }
}
PLAYER_TOKEN_DEFAULT.counter = 0;

class ComponentTemplate {
    constructor(content, parent) {
        this.parent = parent;
        this.content = pug.compileFile(content);
    }
}

class DICE_DEFAULT extends ComponentTemplate {
    constructor () {
        super('./components/dice.pug', 'board_div');
    }
}

module.exports.ShapeTemplate = ShapeTemplate;
module.exports.ImageTemplate = ImageTemplate;
module.exports.WAYPOINT_DEFAULT = WAYPOINT_DEFAULT;
module.exports.PLAYER_TOKEN_DEFAULT = PLAYER_TOKEN_DEFAULT;
module.exports.DICE_DEFAULT = DICE_DEFAULT;
module.exports.shapes = {CIRCLE : CIRCLE};
