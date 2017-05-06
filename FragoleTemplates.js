// shapes
const CIRCLE = 'dc';
const RECTANGLE = 'dr';
const ROUNDED_RECTANGLE = 'rc';
const STAR = 'dp';

class FragoleShapeTemplate {
    constructor ({shape=null, fill='', stroke='' , x=0, y=0, radius=0, width=0, height=0, sides=0, angle=0, pointsize=0}) {
        this._shape = shape;
        this._fill = fill;
        this._stroke = stroke;
        this._x = x;
        this._y = y;
        this._radius = radius;
        this._width = width;
        this._height = height;
        this._sides = sides;
        this._angle = angle;
        this._pointsize = pointsize;
        return this;
    }

    shape(shape) {
        this._shape = shape;
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

    x(x) {
        this._x = x;
        return this;
    }

    y(y) {
        this._y = y;
        return this;
    }

    radius(radius) {
        this._radius = radius;
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

class WAYPOINT_DEFAULT extends FragoleShapeTemplate {
    constructor () {
        super({shape:CIRCLE, fill:'white', stroke:'black', radius:20});
    }
}

module.exports.WAYPOINT_DEFAULT = WAYPOINT_DEFAULT;
module.exports.shapes = {CIRCLE : CIRCLE};
