"use strict";

var request = require("request");

var FanItem = function(widget,platform,homebridge) {
    FanItem.super_.call(this, widget,platform,homebridge);
};

FanItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.Fan();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .setValue(this.state === 'ON');

    return otherService;
};

module.exports = FanItem;