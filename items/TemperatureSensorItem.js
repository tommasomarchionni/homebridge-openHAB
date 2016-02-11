"use strict";

var request = require("request");

var TemperatureSensorItem = function(widget,platform,homebridge) {
    TemperatureSensorItem.super_.call(this, widget,platform,homebridge);
};

TemperatureSensorItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.TemperatureSensor();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .on('get', this.getItemState.bind(this))
        .setValue(this.checkItemState(this.state));

    return otherService;
};

TemperatureSensorItem.prototype.checkItemState = function(state) {
    if ('Unitialized' === state){
        return 0.0;
    }
    return +state;
};


TemperatureSensorItem.prototype.updateCharacteristics = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .setValue(this.checkItemState(message));
};

TemperatureSensorItem.prototype.getItemState = function(callback) {

    var self = this;

    this.log("iOS - request power state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,self.checkItemState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

module.exports = TemperatureSensorItem;