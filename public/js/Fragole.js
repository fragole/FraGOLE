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

        this.background = new createjs.Shape();
        this.background.name = 'background';
        this.background.x = 0;
        this.background.y = 0;
        this.background_fill = this.background.graphics.beginFill('white').command;
        this.background.graphics.drawRect(0,0,this.board_canvas.width,this.board_canvas.height);
        this.stage.addChild(this.background);
        this.stage.setChildIndex(this.background, 0);
        this.childs = {};

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", this.stage);
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
            sg.setStrokeStyle(3, 'round', 'round');
            sg.beginStroke(stroke);
        }
        try {
            var slicedArgs = Array.prototype.slice.call(arguments, 5);
            sg[type](...slicedArgs);
        } catch (err) {
            if (err instanceof TypeError) {
                console.error('GF_GameBoard.drawShape: ' + type + ' is not a valid method!');
            } else {
                console.error(err);
            }
        }

        if (type == draw_methods.CIRCLE) {
            console.log(arguments);
            var radius = arguments[7];
            shape.setBounds(-radius, -radius, radius * 2, radius * 2);
            shape.regX = pos_x;
            shape.regY = pos_y;
            shape.x = pos_x;
            shape.y = pos_y;
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
        if (layer == 'front') {
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
        $(src).appendTo(this.board_div).css({position: 'absolute',
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

        // execute post insert function - then remove it
        try {
            afterAddDomContent();
            afterAddDomContent = undefined;
        } catch (e)  {}
    }

    removeDomContent(target, fade = 0) {
        console.log('remove from ' + target);
        if (fade) {
            $(target).fadeOut(fade, function() { $(target).remove(); });
        } else {
            $(target).remove();
        }
    }

    emptyDomContent(target) {
        console.log('empty ' + target);
        $(target).empty();
    }

    setBackgroundColor(color) {
        this.background_fill.style = color;
        this.stage.update();
    }

    setBackgroundImage(img_src) {
        var img = new Image();
        var that = this;
        img.src = img_src;
        img.onload = function () {
            console.log(that.background);
            that.background.graphics.clear()
              .beginBitmapFill(img)
              .drawRect(0,0,that.board_canvas.width,that.board_canvas.height);
            that.background.cache(0,0,that.board_canvas.width,that.board_canvas.height);
            that.stage.update();
        };
    }

    activateToken(name, callback) {
        console.log('activateToken', arguments);
        var elem = this.childs[name];
        elem.on('click', function(evt, data) {console.log(name + ' clicked => ' + callback); rpcServer[callback](callback);});
    }

    deactivateToken(name) {
        console.log('deactivateToken', arguments);
        var elem = this.childs[name];
        elem.removeAllEventListeners();
    }

    highlightToken(name) {
        console.log('highlight ', arguments);
        var token = this.childs[name];
        var tween = createjs.Tween.get(token, {loop:true});
        tween.to({scaleX:1.2, scaleY:1.2, alpha:0.5}, 300,  createjs.Ease.bounceOut)
             //.to({scaleX:0.9, scaleY:0.9, alpha:1}, 500,  createjs.Ease.bounceOut)
             .to({scaleX:1, scaleY:1, alpha:1}, 1000,  createjs.Ease.bounceOut);
             //.to({scaleX:0.9, scaleY:0.9}, 1000)
             //.to({scaleX:1, scaleY:1}, 1000)
    }

    unhighlightToken(name) {
        console.log(name);
        var token = this.childs[name];
        var tween = createjs.Tween.get(token, {override: true});
        tween.to({scaleX:1, scaleY:1, alpha:1}, 300);
        //var tween = createjs.Tween.get(token);
        //createjs.Tween.removeTweens(token);

    }

    moveToken(name, path) {
        console.log(arguments);
        var callback = 'move_complete_' + name;
        var token = this.childs[name];
        var tween = createjs.Tween.get(token);
        for (let i in path) {
            console.log(path[i]);
            tween = tween.to(path[i], 1000);
        }
        tween.call(function(name) { rpcServer[callback](); });
    }


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
        setBackgroundImage : function(img_src) { gameboard.setBackgroundImage(img_src)},
        addDomContent :    function(src, target, content_id) { gameboard.addDomContent(src, target, content_id);},
        removeDomContent : function(target, fade) { gameboard.removeDomContent(target, fade);},
        emptyDomContent : function(target) { gameboard.emptyDomContent(target);},
        drawShape : function(name, type, fill, stroke, layer, pos_x, pos_y) { gameboard.drawShape(...arguments);},
        drawImage : function(name, src, layer, pos_x, pos_y) { gameboard.drawImage(name, src, layer,    pos_x, pos_y);},
        activateToken : function(name, callback) { gameboard.activateToken(name, callback);},
        deactivateToken : function(name) { gameboard.deactivateToken(name);},
        moveToken : function(name, pos) { gameboard.moveToken(name, pos);},
        highlightToken : function(name) { gameboard.highlightToken(name);},
        unhighlightToken : function(name) { gameboard.unhighlightToken(name);},
    };
}
