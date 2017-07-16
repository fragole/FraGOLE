/**
 * @Author: Michael Bauer
 * @Date:   2017-05-11T18:24:26+02:00
 * @Email:  mb@bauercloud.de
 * @Project: Fragole - FrAmework for Gamified Online Learning Environments
 * @Last modified by:   Michael Bauer
 * @Last modified time: 2017-07-13T19:44:39+02:00
 * @License: MIT
 * @Copyright: Michael Bauer
 */



var Fragole = require('../FragoleObjects.js');
var Lib = require('../FragoleLib.js');

exports.testLib = {

    setUp: function( callback ) {
        this.wp1 = new Fragole.Waypoint('wp1', 'wp', 0, 0),
        this.wp2 = new Fragole.Waypoint('wp2', 'wp', 0, 0),
        this.wp3 = new Fragole.Waypoint('wp3', 'wp', 0, 0),
        this.wp4 = new Fragole.Waypoint('wp4', 'wp', 0, 0),
        this.wp5 = new Fragole.Waypoint('wp5', 'wp', 0, 0);
        callback();
    },

    connectWps: function(test) {
        Lib.connectWaypoints([this.wp1, this.wp2, this.wp3, this.wp4, this.wp5]);
        test.deepEqual(this.wp1.next, [this.wp2]);
        test.deepEqual(this.wp2.next, [this.wp3]);
        test.deepEqual(this.wp3.next, [this.wp4]);
        test.deepEqual(this.wp4.next, [this.wp5]);
        test.deepEqual(this.wp5.next, []);
        test.done();
    } ,

    connectWpsBothWays: function(test) {
        Lib.connectWaypoints([this.wp1, this.wp2, this.wp3, this.wp4, this.wp5], true);
        test.deepEqual(this.wp1.next, [this.wp2]);
        test.deepEqual(this.wp2.next, [this.wp1, this.wp3]);
        test.deepEqual(this.wp3.next, [this.wp2, this.wp4]);
        test.deepEqual(this.wp4.next, [this.wp3, this.wp5]);
        test.deepEqual(this.wp5.next, [this.wp4]);
        test.done();
    } ,

};
