"use strict";

var request = require("request");

var ContactItem = function(widget,platform,homebridge) {
    ContactItem.super_.call(this, widget,platform,homebridge);
};

ContactItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.ContactSensor();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.ContactSensorState)
        .on('get', this.getItemState.bind(this))
        .setValue(this.checkItemState(this.state));

    return otherService;
};

ContactItem.prototype.checkItemState = function(state) {
    if ('Unitialized' === state){
        return this.homebridge.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    } else if ('CLOSED' === state){
        return this.homebridge.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    } else {
        return this.homebridge.hap.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }
};

ContactItem.prototype.updateCharacteristics = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.ContactSensorState)
        .setValue(this.checkItemState(message));
};

ContactItem.prototype.getItemState = function(callback) {

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

module.exports = ContactItem;