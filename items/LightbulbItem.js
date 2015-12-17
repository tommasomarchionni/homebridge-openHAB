"use strict";

var request = require("request");

var LightbulbItem = function(widget,platform,homebridge) {
    LightbulbItem.super_.call(this, widget,platform,homebridge);
};

LightbulbItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.Lightbulb();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .setValue(this.state === 'ON');

    return otherService;
};

module.exports = LightbulbItem;