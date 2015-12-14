"use strict";

var request = require("request");

var NumberItem = function(widget,platform,homebridge) {
    NumberItem.super_.call(this, widget,platform,homebridge);
};

module.exports = NumberItem;