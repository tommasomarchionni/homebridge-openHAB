"use strict";

var request = require("request");

var LightbulbItem = function(widget,platform,homebridge) {
    LightbulbItem.super_.call(this, widget,platform,homebridge);
};

LightbulbItem.prototype.getServices = function() {

    this.checkListener();
    this.setInitialState = true;
    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.Lightbulb();
    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .setValue(this.state === 'ON');

    return [this.informationService, this.otherService];
};

module.exports = LightbulbItem;