"use strict";

var request = require("request");

var FanItem = function(widget,platform,homebridge) {
    FanItem.super_.call(this, widget,platform,homebridge);
};

FanItem.prototype.getServices = function() {

    this.checkListener();
    this.setInitialState = true;
    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.Fan();
    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .setValue(this.state === 'ON');

    return [this.informationService, this.otherService];
};

module.exports = FanItem;