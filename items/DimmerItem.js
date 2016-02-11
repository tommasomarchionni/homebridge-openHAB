"use strict";

var request = require("request");

var DimmerItem = function(widget,platform,homebridge) {
    DimmerItem.super_.call(this, widget,platform,homebridge);
};

DimmerItem.prototype.getServices = function() {

    this.initListener();
    this.setInitialState = true;

    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.Lightbulb();
    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemPowerState.bind(this))
        .setValue(+this.state > 0);

    this.setInitialState = true;

    this.otherService.addCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemBrightnessState.bind(this))
        .setValue(+this.state);

    return [this.informationService, this.otherService];
};

DimmerItem.prototype.updateCharacteristics = function(message) {

    this.setFromOpenHAB = true;
    var brightness = +message;
    var steps = 2;
    if (brightness >= 0) {
        this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
            .setValue(brightness,
                function() {
                    steps--;
                    if (!steps) {
                        this.setFromOpenHAB = false;
                    }
                }.bind(this));
        this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
            .setValue(brightness > 0,
                function() {
                    steps--;
                    if (!steps) {
                        this.setFromOpenHAB = false;
                    }
                }.bind(this));
    }
};

DimmerItem.prototype.getItemPowerState = function(callback) {

    var self = this;

    this.log("iOS - request power state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,+body > 0);
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

DimmerItem.prototype.setItem = function(value, callback) {

    var self = this;

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
    var command = 0;
    if (typeof value === 'boolean') {
        command = value ? '100' : '0';
    } else {
        command = "" + value;
    }
    request.post(
        this.url,
        {
            body: command,
            headers: {'Content-Type': 'text/plain'}
        },
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

DimmerItem.prototype.getItemBrightnessState = function(callback) {

    var self = this;

    this.log("iOS - request brightness state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            callback(undefined,+body);
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

module.exports = DimmerItem;