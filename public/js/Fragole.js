var Fragole = Fragole || {};
// TODO: place in module
// use Tiny-API functions from easelJS.Graphic
var draw_methods = {
  CIRCLE : 'dc',
  RECTANGLE : 'dr',
  ROUNDED_RECTANGLE : 'rc',
  STAR : 'dp',
};

var rpc;
var rpcServer;
var gameboard;

Fragole.GameBoard = class GameBoard {
  constructor (id) {
    this.id = id;
    this.rpcServer = undefined;
    this.board_div = $('#' + id + '_div');
    this.board_canvas = $('#' + id + '_canvas')[0];
    this.board_canvas.width = document.body.clientWidth;
    this.board_canvas.height = document.body.clientHeight;
    this.stage = new createjs.Stage(id + '_canvas');

    var background = new createjs.Shape();
    background.name = 'background';
    background.x = 0;
    background.y = 0;
    this.background_fill = background.graphics.beginFill('white').command;
    background.graphics.drawRect(0,0,this.board_canvas.width,this.board_canvas.height);
    this.stage.addChild(background);
    this.stage.setChildIndex(background, 0);
    this.childs = {};
  }

  connectRpc(rpcServer) {
      this.rpcServer = rpcServer;
  }

  // Wrapper for easelJS Graphic.drawX methods
  // use type from draw_methods constant
  // parameters beyond pos_y are passed dynamically to account different shape prototypes
  drawShape(name, type, fill, stroke, layer, pos_x, pos_y) {
      if (this.childs[name]) {
          this.stage.removeChild(this.childs[name]);
          this.stage.update();
      }

      console.log(arguments);
      var shape = new createjs.Shape();
      var sg = shape.graphics;

      shape.name = name;
      sg.beginFill(fill);
      if (stroke) {
          sg.beginStroke(stroke);
      }
      try {
          var slicedArgs = Array.prototype.slice.call(arguments, 5);
          sg[type](...slicedArgs);
      } catch (err) {
          if (err instanceof TypeError) {
              console.error("GF_GameBoard.drawShape: " + type + " is not a valid method!");
          } else {
              console.error(err);
          }
      }
      this.stage.addChild(shape);

      if (layer == 'front') {
          this.stage.setChildIndex(shape, this.stage.numChildren-1);
      } else {
          // index == 1 => just in front of background
          this.stage.setChildIndex(shape, 1);
      }

      this.stage.setChildIndex(shape, 1);
      this.stage.update();
      this.childs[name] = shape;
  }

  // Wrapper for drawing images into the canvas
  drawImage (name, src, layer, pos_x, pos_y) {
      if (this.childs[name]) {
          this.stage.removeChild(this.childs[name]);
          this.stage.update();
      }
      console.log(arguments);
      var img = new createjs.Bitmap(src);
      img.x = pos_x;
      img.y = pos_y;
      var child = this.stage.addChild(img);
      if (layer ==
           'front') {
          this.stage.setChildIndex(img, this.stage.numChildren-1);
      } else {
          // index == 1 => just in front of background
          this.stage.setChildIndex(img, 1);
      }

      img.image.onload = () => this.stage.update();
      this.childs[name] = img;

  }

  // Wrapper for drawing components (Game-Object represented by HTML code)
  drawComponent(name, src, pos_x, pos_y) {
     $(src).appendTo(this.board_div).css({position: "absolute",
                                  left: pos_x,
                                  top: pos_y});
  }


  addDomContent(src, target, content_id) {
    if ($(content_id).length) { // update existing content
       console.log('update ' + content_id + ' in ' + target);
       $(content_id).replaceWith(src);
    } else {
       console.log('add ' + content_id + ' to ' + target);
       $(target).append(src);
    }
  }

  removeDomContent(target) {
    console.log("remove from " + target);
    $(target).empty();
  }

    setBackgroundColor(color) {
        this.background_fill.style = color;
        this.stage.update();
    }

    activateToken(name, callback) {
        console.log(arguments);
        var elem = this.childs[name];
        elem.on('click', (evt, data) => {console.log(name + ' clicked => ' + callback); this.rpcServer[callback](callback);}, this);
    }

    moveToken(name, path) {
        console.log(arguments);
        var token = this.childs[name];
        var tween = createjs.Tween.get(token);
        for (let i in path) {
            console.log(path[i]);
            tween = tween.to(path[i], 1000);
        }
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", this.stage);
    }


}


// Just Testcode ATM
function test() {
  gameboard = new Fragole.GameBoard("board");
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

function init() {

  //gameboard.setBackgroundColor('#2F3F3F');

    rpc = new Eureca.Client();

    rpc.ready(function (serverProxy) {
        serverProxy.ready();
        rpcServer = serverProxy;
        gameboard.connectRpc(rpcServer);
    });

    var gameboard = new Fragole.GameBoard('board');

    rpc.exports = {
        setBackgroundColor : function(color) { gameboard.setBackgroundColor(color); },
        addDomContent :    function(src, target, content_id) { gameboard.addDomContent(src, target, content_id);},
        removeDomContent : function(target) { gameboard.removeDomContent(target);},
        drawShape : function(name, type, fill, stroke, layer, pos_x, pos_y) { gameboard.drawShape(...arguments);},
        drawImage : function(name, src, layer, pos_x, pos_y) { gameboard.drawImage(name, src, layer,    pos_x, pos_y);},
        activateToken : function(name, callback) { gameboard.activateToken(name, callback);},
        moveToken : function(name, pos) { gameboard.moveToken(name, pos);},
    };
}
