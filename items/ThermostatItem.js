"use strict";

var request = require("request");
const EventEmitter = require("events");

var ThermostatItem = function(widget,platform,homebridge) {
    //General
    this.thermostatItemEmitter = new EventEmitter();
    this.initEmitter();

    //CurrentTemperature
    this.itemCurrentTemperature = undefined;
    this.listenerCurrentTemperature = undefined;
    this.wsCurrentTemperature = undefined;

    //TargetTemperature
    this.itemTargetTemperature = undefined;
    this.setTargetTemperatureInitialState = false;
    this.targetTemperatureArr = [];
    this.targetTemperatureInProgress = false;
    this.targetTemperatureTimeout = 1000;

    ThermostatItem.super_.call(this, widget,platform,homebridge);
};

ThermostatItem.prototype.initEmitter = function() {
    var self=this;
    this.thermostatItemEmitter.on('TARGET_TEMPERATURE_UPDATE_EVENT', function() {
        self.setTargetTemperatureStateFromEmit();
    });
};

/**
 * Init all thermostat listener
 */
ThermostatItem.prototype.initListener = function() {
    if ((typeof this.itemCurrentTemperature) == 'undefined'){
        throw new Error(this.name + " needs CurrentTemperatureItem!");
    }
    this.listenerCurrentTemperature = this.listenerFactory(this.itemCurrentTemperature.name,this.itemCurrentTemperature.link,this.wsCurrentTemperature,this.log, this.updateCurrentTemperature.bind(this));
    if ((typeof this.itemTargetTemperature) == 'undefined'){
        throw new Error(this.name + " needs TargetTemperatureItem!");
    }
};

/**
 * Binding CurrentTemperatureItem from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setCurrentTemperatureItem = function(item){
    this.itemCurrentTemperature = item;
};

/**
 * Binding TargetTemperatureItem from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setTargetTemperatureItem = function(item){
    this.itemTargetTemperature = item;
};

/**
 * Initiialize Others Services needed for ThermostatItem
 * @returns {*}
 */
ThermostatItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.Thermostat();

    //Init CurrentTemperature Characteristic
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .on('get', this.getCurrentTemperatureState.bind(this))
        .setValue(this.checkTemperatureState(this.itemCurrentTemperature.state));

    this.setTargetTemperatureInitialState = true;

    //Init TargetTemperature Characteristic
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetTemperature)
        .on('set', this.setTargetTemperatureState.bind(this))
        .on('get', this.getTargetTemperatureState.bind(this))
        .setValue(this.checkTemperatureState(this.itemTargetTemperature.state));

    //TODO
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
        .on('get', this.getCurrentHeatingCoolingStateMock.bind(this))
        .setValue(1);

    //TODO
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TemperatureDisplayUnits)
        .on('get', this.getTemperatureDisplayUnitsMock.bind(this))
        .setValue(0);

    //TODO
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
        .on('set', this.setTargetHeatingCoolingStateMock.bind(this))
        .on('get', this.getTargetHeatingCoolingStateMock.bind(this))
        .setValue(1);

    return otherService;
};

/**
 * Set target temperature when receive emit
 */
ThermostatItem.prototype.setTargetTemperatureStateFromEmit = function(){
    var self=this;
    if (!this.targetTemperatureInProgress){
        this.targetTemperatureInProgress = true;
        setTimeout(function() {
            var value = self.targetTemperatureArr[self.targetTemperatureArr.length-1];
            self.log("iOS - send message to " + self.itemTargetTemperature.name + " (" + (self.name)+"): " + value);
            var command = "" + value;
            request.post(
                self.itemTargetTemperature.link,
                {
                    body: command,
                    headers: {'Content-Type': 'text/plain'}
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 201) {
                        self.log("OpenHAB HTTP - response from " + self.itemTargetTemperature.name + " (" + (self.name)+"): " + body);
                    } else {
                        self.log("OpenHAB HTTP - error from " + self.itemTargetTemperature.name + " (" + (self.name)+"): " + error);
                    }
                    self.targetTemperatureArr = [];
                    self.targetTemperatureInProgress = false;
                }
            );
        }, self.targetTemperatureTimeout);
    }
};

/**
 * Emit target temperature update
 * @param value
 * @param callback
 */
ThermostatItem.prototype.setTargetTemperatureState = function(value,callback){
    if (this.setTargetTemperatureInitialState) {
        this.setTargetTemperatureInitialState = false;
        callback();
        return;
    }
    this.targetTemperatureArr.push(value);
    this.thermostatItemEmitter.emit('TARGET_TEMPERATURE_UPDATE_EVENT');
    callback();
};

/**
 * TODO
 * @param callback
 */
ThermostatItem.prototype.getTargetHeatingCoolingStateMock = function(callback) {
    //TODO check se si può anche scrivere
    callback(undefined,1);
};

/**
 * TODO
 * @param value
 * @param callback
 */
ThermostatItem.prototype.setTargetHeatingCoolingStateMock = function(value,callback){
    callback();
};

/**
 * TODO
 * @param callback
 */
ThermostatItem.prototype.getTemperatureDisplayUnitsMock = function(callback) {
    //Characteristic.TemperatureDisplayUnits.CELSIUS = 0;
    //Characteristic.TemperatureDisplayUnits.FAHRENHEIT = 1;
    callback(undefined,this.homebridge.hap.Characteristic.TemperatureDisplayUnits.CELSIUS);
};

/**
 * TODO
 * @param callback
 */
ThermostatItem.prototype.getCurrentHeatingCoolingStateMock = function(callback) {
    //Characteristic.CurrentHeatingCoolingState.OFF = 0;
    //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
    //Characteristic.CurrentHeatingCoolingState.COOL = 2;
    callback(undefined,this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.HEAT);
};

/**
 * Parse temperature input value
 * @param state
 * @returns {number}
 */
ThermostatItem.prototype.checkTemperatureState = function(state) {
    if ('Unitialized' === state){
        return 0.0;
    }
    return +state;
};

/**
 * Set CurrentTemperature from OpenHAB
 * @param message
 */
ThermostatItem.prototype.updateCurrentTemperature = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature)
        .setValue(this.checkTemperatureState(message));
};

/**
 * Get CurrentTemperature requested from iOS
 * @param callback
 */
ThermostatItem.prototype.getCurrentTemperatureState = function(callback) {
    var self = this;
    this.log("iOS - request current temperature state from " + this.itemCurrentTemperature.name + " (" + (self.name)+")");
    request(self.itemCurrentTemperature.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemCurrentTemperature.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkTemperatureState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemCurrentTemperature.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * Get TargetTemperature requested from iOS
 * @param callback
 */
ThermostatItem.prototype.getTargetTemperatureState = function(callback) {
    var self = this;
    this.log("iOS - request target temperature state from " + this.itemTargetTemperature.name + " (" + (self.name)+")");
    request(self.itemTargetTemperature.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemTargetTemperature.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkTemperatureState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemTargetTemperature.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * Export ThermostatItem
 * @type {ThermostatItem}
 */
module.exports = ThermostatItem;