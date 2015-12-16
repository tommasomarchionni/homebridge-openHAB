"use strict";

var request = require("request");

var OutletItem = function(widget,platform,homebridge) {
    OutletItem.super_.call(this, widget,platform,homebridge);
};

OutletItem.prototype.getServices = function() {

    this.checkListener();
    this.setInitialState = true;
    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.Outlet();
    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .setValue(this.state === 'ON');

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.OutletInUse)
        .on('get', this.getItemPowerState.bind(this))
        .setValue(this.state === 'ON');

    return [this.informationService, this.otherService];
};

OutletItem.prototype.updateCharacteristics = function(message) {

    this.setFromOpenHAB = true;
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .setValue(message === 'ON',
            function() {
                this.setFromOpenHAB = false;
            }.bind(this)
        );

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.OutletInUse)
        .setValue(message === 'ON',
            function() {
                this.setFromOpenHAB = false;
            }.bind(this)
        );
};

module.exports = OutletItem;