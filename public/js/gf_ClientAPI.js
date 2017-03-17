// XXX Namespace?

var gameboard;

// TODO: place in module
// use Tiny-API functions from easelJS.Graphic
var draw_methods = {
  CIRCLE : 'dc',
  RECTANGLE : 'dr',
  ROUNDED_RECTANGLE : 'rc',
  STAR : 'dp',
};

class GF_GameBoard {
  constructor (id) {
    this.id = id;
    this.board_div = $('#' + id + '_div');
    this.board_canvas = $('#' + id + '_canvas')[0];
    this.board_canvas.width = document.body.clientWidth;
    this.board_canvas.height = document.body.clientHeight;
    this.stage = new createjs.Stage(id + '_canvas');
    this.childs = {};
  }

  // Wrapper for easelJS Graphic.drawX methods
  // use type from draw_methods constant
  // parameters beyond pos_y are passed dynamically to account different shape prototypes
  drawShape(name, type, fill, stroke, pos_x, pos_y) {
    var shape = new createjs.Shape();
    var sg = shape.graphics;

    shape.name = name;
    sg.beginFill(fill);
    if (stroke)
      sg.beginStroke(stroke);
    try {
      var slicedArgs = Array.prototype.slice.call(arguments, 4);
      sg[type](...slicedArgs);
    } catch (err) {
      if (err instanceof TypeError) {
        console.error("GF_GameBoard.drawShape: " + type + " is not a valid method!");
      } else {
        console.error(err);
      }
    }
    this.stage.addChild(shape);
    this.stage.update();
    this.childs[name] = shape;
  }

  // Wrapper for drawing images into the canvas
  drawImage (name, src, pos_x, pos_y) {
      var img = new createjs.Bitmap(src);
      img.x = pos_x;
      img.y = pos_y;
      this.stage.addChild(img);
      this.stage.update();

  }

  // Wrapper for drawing components (Game-Object represented by HTML code)
  drawComponent(name, src, pos_x, pos_y) {
     $(src).appendTo(this.board_div).css({position: "absolute",
                                  left: pos_x,
                                  top: pos_y});
  }
}

// Just Testcode ATM
function init() {
  gameboard = new GF_GameBoard("board");
  gameboard.drawShape('circ', draw_methods.CIRCLE, 'Blue', 0,100,100,50);
  gameboard.drawShape('rect', draw_methods.RECTANGLE, 'Blue','Black',100,200,50,75);
  gameboard.drawShape('rrect', draw_methods.ROUNDED_RECTANGLE, 'Red', 0, 100,400, 50, 100, 15, 0, 15, 0);
  gameboard.drawShape('star', draw_methods.STAR, 'Green', 'Yellow', 100,600, 50, 5, 0.5, 0);

  // shape not supported
  gameboard.drawShape('xxx', 'drawX', 0,0,0,0);

  gameboard.drawComponent('test', '<image src="/assets/Pieces (Black)/pieceBlack_border00.png" />', 150,150);
  gameboard.drawImage("test_img", "assets/Pieces (Blue)/pieceBlue_border00.png", 100, 300);
  var circle = gameboard.stage.getChildByName('circ');

  createjs.Tween.get(circle)
  .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
  .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0, y: 225 }, 100)
  .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
  .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", gameboard.stage);


}
