"use strict";

var request = require("request");

var OutletItem = function(widget,platform,homebridge) {
    OutletItem.super_.call(this, widget,platform,homebridge);
};

OutletItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.Outlet();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .setValue(this.state === 'ON');

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.OutletInUse)
        .on('get', this.getItemState.bind(this))
        .setValue(this.state === 'ON');

    return otherService;
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