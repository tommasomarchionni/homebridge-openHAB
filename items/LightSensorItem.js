"use strict";

var request = require("request");

var LightSensorItem = function(widget,platform,homebridge) {
    LightSensorItem.super_.call(this, widget,platform,homebridge);
};

LightSensorItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.LightSensor();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentAmbientLightLevel)
        .on('get', this.getItemState.bind(this))
        .setValue(this.checkItemState(this.state));

    return otherService;
};

LightSensorItem.prototype.checkItemState = function(state) {
    if ('Unitialized' === state){
        return 0.0;
    }
    return +state;
};

LightSensorItem.prototype.updateCharacteristics = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentAmbientLightLevel)
        .setValue(this.checkItemState(message));
};

LightSensorItem.prototype.getItemState = function(callback) {

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

module.exports = LightSensorItem;