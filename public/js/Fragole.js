/**
 * @Author: Michael Bauer
 * @Date:   2017-06-04T10:48:10+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-06-16T23:54:36+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */

// This module is the client API for the FragoleServer
// Functions within this module are called by the Server via RPC

var Fragole = Fragole || {};

var draw_methods = {
    CIRCLE : 'dc',
    RECTANGLE : 'dr',
    ROUNDED_RECTANGLE : 'rc',
    STAR : 'dp',
};

var rpc, rpcServer, gameboard;

// The GameBoard
// consists of two Layers
// Layer1: Canvas => Tokens, etc. are displayed here
// Layer2 (above Layer1): Div => Components are displayed here
Fragole.GameBoard = class GameBoard {
    constructor (id) {
        this.id = id;
        this.client_id = undefined;
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

        //createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener("tick", this.stage);
    }

    connectRpc(rpcServer) {
        this.rpcServer = rpcServer;
    }

    setClientId(clientId) {
        this.clientId = clientId;
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
    // XXX: check if this is actually used, if not remove
    drawComponent(name, src, pos_x, pos_y) {
        $(src).appendTo(this.board_div).css({position: 'absolute',
            left: pos_x,
            top: pos_y});
    }

    // add a Component to the DOM
    // checks if an object with the given id already exists. If so it replaces
    // the existing content
    //
    // src: html-code of the object that should be added
    // target: parent object => src will be appended to this
    // content_id: id of the new DOM object
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

    // remove an object from the DOM
    // target: id of the object that should be remove
    // fade: 0/1 fade the object out
    removeDomContent(target, fade = 0) {
        console.log('remove ' + target);
        if (fade) {
            $(target).fadeOut(fade, function() { $(target).remove(); });
        } else {
          $(target).remove();
          $(target).remove();
        }
    }

    // removes the content from the specified DOM-Object
    emptyDomContent(target) {
        console.log('empty ' + target);
        $(target).empty();
    }

    // set the background color of the gameboard canvas
    setBackgroundColor(color) {
        this.background_fill.style = color;
        this.stage.update();
    }

    // dispaly a background image on the canvas
    setBackgroundImage(img_src) {
        var img = new Image();
        var that = this;
        img.src = img_src;
        img.onload = function () {
            var sf;
            var matrix = new createjs.Matrix2D();
            if (img.width >= img.height) {
               sf = that.board_canvas.width / img.width;
            } else {
               sf = that.board_canvas.height / img.height;
            }
            matrix.scale(sf,sf);
            that.background.graphics.clear()
              .beginBitmapFill(img, 'no-repeat', matrix)
              .drawRect(0,0,that.board_canvas.width,that.board_canvas.height);
            that.background.cache(0,0,that.board_canvas.width,that.board_canvas.height);
            that.stage.update();
        };
    }

    // activate a Token => add click-handler
    activateToken(name, callback) {
        console.log('activateToken', arguments);
        var elem = this.childs[name];
        elem.on('click', function(evt, data) {console.log(name + ' clicked => ' + callback); rpcServer[callback](gameboard.clientId);});
    }

    // deactivate a Token => remove click-handler
    deactivateToken(name) {
        console.log('deactivateToken', arguments);
        var elem = this.childs[name];
        elem.removeAllEventListeners();
    }

    // add a looping pulsing animation to a Token
    highlightToken(name) {
        console.log('highlight ', arguments);
        var token = this.childs[name];
        var tween = createjs.Tween.get(token, {loop:true});
        tween.to({scaleX:1.3, scaleY:1.3, alpha:1}, 300,  createjs.Ease.bounceOut)
             .to({scaleX:1, scaleY:1, alpha:1}, 1000,  createjs.Ease.bounceOut);
    }

    // stop the highlighting animation
    unhighlightToken(name) {
        console.log(name);
        var token = this.childs[name];
        var tween = createjs.Tween.get(token, {override: true});
        tween.to({scaleX:1, scaleY:1, alpha:1}, 300);
    }

    // move a token along the points contained in path
    moveToken(name, path) {
        console.log(arguments);
        var callback = 'move_complete_' + name;
        var token = this.childs[name];
        var tween = createjs.Tween.get(token);
        for (let i in path) {
            console.log(path[i]);
            tween = tween.to(path[i], 1000);
        }
        tween.call(function(name) { rpcServer[callback](gameboard.clientId); });
    }


}

//
function init() {
    rpc = new Eureca.Client();

    // call the ready function on the server-sice
    rpc.ready(function (serverProxy) {
        serverProxy.ready();
        rpcServer = serverProxy;
        gameboard.connectRpc(rpcServer);
    });

    // setup the gameboard
    gameboard = new Fragole.GameBoard('board');

    // functions that are exposed for the server via RPC
    rpc.exports = {
        setClientId : function(clientId) { gameboard.setClientId(clientId); },
        setBackgroundColor : function(color) { gameboard.setBackgroundColor(color); },
        setBackgroundImage : function(img_src) { gameboard.setBackgroundImage(img_src);},
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
