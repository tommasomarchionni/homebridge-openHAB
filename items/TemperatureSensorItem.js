"use strict";

var request = require("request");

var TemperatureSensorItem = function(widget,platform,homebridge) {
    TemperatureSensorItem.super_.call(this, widget,platform,homebridge);
};

TemperatureSensorItem.prototype.getServices = function() {

    this.checkListener();
    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.TemperatureSensor();
    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .on('get', this.getItemTemperatureState.bind(this))
        .setValue(this.checkState(this.state));

    return [this.informationService, this.otherService];
};

TemperatureSensorItem.prototype.checkState = function(state) {
    if ('Unitialized' === state){
        return 0.0;
    }
    return +state;
};


TemperatureSensorItem.prototype.updateCharacteristics = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .setValue(this.checkState(message));
};

TemperatureSensorItem.prototype.getItemTemperatureState = function(callback) {

    var self = this;
    this.checkListener();

    this.log("iOS - request power state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,+body);
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

module.exports = TemperatureSensorItem;