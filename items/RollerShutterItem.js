"use strict";

var request = require("request");

var RollershutterItem = function(widget,platform,homebridge) {
    RollershutterItem.super_.call(this, widget,platform,homebridge);
    this.positionState = this.homebridge.hap.Characteristic.PositionState.STOPPED;
    this.currentPosition = 100;
    this.targetPosition = 100;
    this.startedPosition = 100;
};

RollershutterItem.prototype.getServices = function() {

    this.initListener();

    this.informationService = this.getInformationServices();

    this.otherService = new this.homebridge.hap.Service.WindowCovering();

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentPosition)
        .on('get', this.getItemCurrentPosition.bind(this))
        .setValue(this.currentPosition);

    this.setInitialState = true;

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetPosition)
        .on('set', this.setItem.bind(this))
        .on('get', this.getItemTargetPosition.bind(this))
        .setValue(this.currentPosition);

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.PositionState)
        .on('get', this.getItemPositionState.bind(this))
        .setValue(this.positionState);

    return [this.informationService, this.otherService];
};

RollershutterItem.prototype.updateCharacteristics = function(message) {

    if (parseInt(message) == this.targetPosition) {
        var ps = this.homebridge.hap.Characteristic.PositionState.STOPPED;
        var cs = parseInt(message);
    } else if (parseInt(message) > this.targetPosition){
        var ps = this.homebridge.hap.Characteristic.PositionState.INCREASING;
        var cs = this.startedPosition;
    } else {
        var ps = this.homebridge.hap.Characteristic.PositionState.DECREASING;
        var cs = this.startedPosition;
    }

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.PositionState)
        .setValue(ps);

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentPosition)
        .setValue(parseInt(cs));
    this.currentPosition = parseInt(cs);
};

RollershutterItem.prototype.setItem = function(value, callback) {

    var self = this;

    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }

    this.startedPosition = this.currentPosition;

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
                self.targetPosition = parseInt(value);
            } else {
                self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
            }
            callback();
        }
    );
};

RollershutterItem.prototype.getItemPositionState = function(callback) {
    this.log("iOS - request position state from " + this.name);
    this.log("Platform - response from " + this.name + ": " + this.positionState);
    callback(undefined,this.positionState);
};

RollershutterItem.prototype.getItemTargetPosition = function(callback) {
    this.log("iOS - get target position state from " + this.name);
    this.log("Platform - response from " + this.name + ": " + this.targetPosition);
    callback(undefined,this.targetPosition);
};

RollershutterItem.prototype.getItemCurrentPosition = function(callback) {
    var self = this;
    this.log("iOS - request current position state from " + this.name);

    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {

            self.log("OpenHAB HTTP - response from " + self.name + ": " +body);
            self.currentPosition = parseInt(body);
            callback(undefined,parseInt(body));

        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

module.exports = RollershutterItem;