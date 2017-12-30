"use strict";

var request = require("request");

var GarageDoorOpenerItem = function(widget,platform,homebridge) {

    // Current door State
    this.itemCurrentDoorState = undefined;
    this.listenerCurrentDoorState = undefined;
    this.wsCurrentDoorState = undefined;

    // Target door state
    this.itemTargetDoorState = undefined;
    this.listenerTargetDoorState = undefined;
    this.wsTargetDoorState = undefined;

    // Obstruction Detected
    this.itemObstructionDetected = undefined;
    this.listenerObstructionDetected = undefined;
    this.wsObstructionDetected = undefined;

    this.setFromOpenHAB = false;
    this.setInitialState = true;

    GarageDoorOpenerItem.super_.call(this, widget,platform,homebridge);
};

/**
 * Binding CurrentDoorStateItem
 * @param item
 */
GarageDoorOpenerItem.prototype.setCurrentDoorStateItem = function(item){
    this.itemCurrentDoorState = item;
};

/**
 * Binding TargetDoorStateItem
 * @param item
 */
GarageDoorOpenerItem.prototype.setTargetDoorStateItem = function(item){
    this.itemTargetDoorState = item;
};

/**
 * Binding ObstructionDetectedItem
 * @param item
 */
GarageDoorOpenerItem.prototype.setObstructionDetectedItem = function(item){
    this.itemObstructionDetectedState = item;
};

/**
 * Init all thermostat listener
 */
GarageDoorOpenerItem.prototype.initListener = function() {
    if ((typeof this.itemCurrentDoorState) == 'undefined'){
        throw new Error(this.name + " needs CurrentDoorState!");
    }

    if ((typeof this.itemTargetDoorState) == 'undefined'){
        throw new Error(this.name + " needs TargetDoorState!");
    }

    this.listenerCurrentDoorState = this.listenerFactory(
        this.itemCurrentDoorState.name,
        this.itemCurrentDoorState.link,
        this.wsCurrentDoorState,
        this.log,
        this.updateCurrentDoorState.bind(this)
    );

    this.listenerTargetDoorState = this.listenerFactory(
        this.itemTargetDoorState.name,
        this.itemTargetDoorState.link,
        this.wsTargetDoorState,
        this.log,
        this.updateTargetDoorState.bind(this)
    );

    if ((typeof this.itemObstructionDetectedState) !== 'undefined'){
        this.listenerObstructionDetectedState = this.listenerFactory(
            this.itemObstructionDetectedState.name,
            this.itemObstructionDetectedState.link,
            this.wsObstructionDetectedState,
            this.log,
            this.updateObstructionDetectedState.bind(this)
        );
    }
};

GarageDoorOpenerItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.GarageDoorOpener();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentDoorState)
        .on('get', this.getCurrentDoorState.bind(this))
        .setValue(this.checkCurrentDoorState(this.itemCurrentDoorState.state));

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetDoorState)
        .on('get', this.getTargetDoorState.bind(this))
        .on('set', this.setTargetDoorState.bind(this))
        .setValue(this.checkTargetDoorState(this.itemTargetDoorState.state));

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.ObstructionDetected)
        .on('get', this.getObstructionDetected.bind(this))
        .setValue((typeof this.itemObstructionDetectedState) !== 'undefined' && 
                  this.itemObstructionDetectedState.state === 'ON');

    return otherService;
};

GarageDoorOpenerItem.prototype.checkCurrentDoorState = function(state) {
    switch (state){
        case 'OPEN':
            return this.homebridge.hap.Characteristic.CurrentDoorState.OPEN;
        case 'CLOSED':
            return this.homebridge.hap.Characteristic.CurrentDoorState.CLOSED;
        case 'CLOSING':
            return this.homebridge.hap.Characteristic.CurrentDoorState.CLOSING;
        case 'OPENING':
            return this.homebridge.hap.Characteristic.CurrentDoorState.OPENING;
        case 'STOPPED':
        default:
            return this.homebridge.hap.Characteristic.CurrentDoorState.STOPPED;
    }
};

GarageDoorOpenerItem.prototype.checkTargetDoorState = function(state) {
    switch (state){
        case 'OPEN':
            return this.homebridge.hap.Characteristic.TargetDoorState.OPEN;
        case 'CLOSE':
        default:
            return this.homebridge.hap.Characteristic.TargetDoorState.CLOSED;
    }
};

/**
 * Get CurrentDoorState requested from iOS
 * @param callback
 */
GarageDoorOpenerItem.prototype.getCurrentDoorState = function(callback) {
    var self = this;
    this.log("iOS - request current door state state from " + this.itemCurrentDoorState.name + " (" + (self.name)+")");
    request(self.itemCurrentDoorState.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemCurrentDoorState.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkCurrentDoorState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemCurrentDoorState.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * Get TargetDoorState requested from iOS
 * @param callback
 */
GarageDoorOpenerItem.prototype.getTargetDoorState = function(callback) {
    var self = this;
    this.log("iOS - request target door state state from " + this.itemTargetDoorState.name + " (" + (self.name)+")");
    request(self.itemTargetDoorState.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemTargetDoorState.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkTargetDoorState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemTargetDoorState.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * Get ObstructionDetected requested from iOS
 * @param callback
 */
GarageDoorOpenerItem.prototype.getObstructionDetected = function(callback) {
    var self = this;

    if ((typeof self.itemObstructionDetectedState) === 'undefined')
    {
        callback(undefined, false);
        return;
    }

    this.log("iOS - request target door state state from " + this.itemObstructionDetectedState.name + " (" + (self.name)+")");
    request(self.itemObstructionDetectedState.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemObstructionDetectedState.name + " (" + (self.name)+"): " + body);
            callback(undefined,body === "ON");
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemObstructionDetectedState.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * Set CurrentDoorState from OpenHAB
 * @param message
 */
GarageDoorOpenerItem.prototype.updateCurrentDoorState = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentDoorState)
        .setValue(this.checkCurrentDoorState(message));
};

/**
 * Set TargetDoorState from OpenHAB
 * @param message
 */
GarageDoorOpenerItem.prototype.updateTargetDoorState = function(message) {
    this.setFromOpenHAB = true;
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.TargetDoorState)
        .setValue(this.checkTargetDoorState(message),
            function() {
                this.setFromOpenHAB = false;
            }.bind(this)
        );
};

/**
 * Set ObstructionDetected from OpenHAB
 * @param message
 */
GarageDoorOpenerItem.prototype.updateObstructionDetectedState = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.ObstructionDetected)
        .setValue(message === 'ON');
};

/**
 * Set TargetDoorState
 * @param value
 * @param callback
 */
GarageDoorOpenerItem.prototype.setTargetDoorState = function(value, callback){
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

    this.log("iOS - send message to " + this.itemTargetDoorState.name + ": " + value);
    var command = value === this.homebridge.hap.Characteristic.TargetDoorState.OPEN ? 'ON' : 'OFF';
    request.post(
        this.itemTargetDoorState.link,
        { 
            body: command,
            headers: {'Content-Type': 'text/plain'}
        },
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                self.log("OpenHAB HTTP - response from " + self.itemTargetDoorState.name + ": " + body);
            } else {
                self.log("OpenHAB HTTP - error from " + self.itemTargetDoorState.name + ": " + error);
            }
            callback();
        }
    );
};


module.exports = GarageDoorOpenerItem;
