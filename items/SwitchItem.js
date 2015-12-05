"use strict";

var SwitchItem = function(widget,platform,homebridge) {
    SwitchItem.super_.call(this, widget,platform,homebridge);
};

SwitchItem.prototype.getServices = function() {

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

SwitchItem.prototype.updateCharacteristics = function(message) {

    this.setFromOpenHAB = true;
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .setValue(message === 'ON',
            function() {
                this.setFromOpenHAB = false;
            }.bind(this)
        );
};

SwitchItem.prototype.getItemPowerState = function(callback) {

    var self = this;
    this.checkListener();

    this.log("iOS - request power state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,body === "ON");
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

SwitchItem.prototype.setItem = function(value, callback) {

    var self = this;
    this.checkListener();

    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }

    if (this.setFromOpenHAB) {
        callback();
        return;
    }

    this.log("iOS - send message to " + this.name + ": " + value);
    var command = value ? 'ON' : 'OFF';
    request.post(
        this.url,
        { body: command },
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            } else {
                self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
            }
            callback();
        }
    );
};

module.exports = SwitchItem;