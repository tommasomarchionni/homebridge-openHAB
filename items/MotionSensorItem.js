"use strict";

var request = require("request");

var MotionSensorItem = function(widget,platform,homebridge) {
    MotionSensorItem.super_.call(this, widget,platform,homebridge);
};

MotionSensorItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.MotionSensor();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.MotionDetected)
        .on('get', this.getItemState.bind(this))
        .setValue(this.checkItemState(this.state));

    return otherService;
};

MotionSensorItem.prototype.checkItemState = function(state) {
    return !('Unitialized' === state || 'CLOSED' === state || false === state || 'false' === state.toLowerCase());
};

MotionSensorItem.prototype.updateCharacteristics = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.MotionDetected)
        .setValue(this.checkItemState(message));
};

MotionSensorItem.prototype.getItemState = function(callback) {
    var self = this;

    this.log("iOS - request state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,self.checkItemState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

module.exports = MotionSensorItem;