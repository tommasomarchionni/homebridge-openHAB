"use strict";

var request = require("request");
const EventEmitter = require("events");

var ThermostatItem = function(widget,platform,homebridge) {
    //General
    this.temperatureDisplayUnits = homebridge.hap.Characteristic.TemperatureDisplayUnits.CELSIUS;
    this.thermostatItemEmitter = new EventEmitter();
    this.initEmitter();

    //CurrentTemperature
    this.itemCurrentTemperature = undefined;
    this.listenerCurrentTemperature = undefined;
    this.wsCurrentTemperature = undefined;

    //CurrentRelativeHumidity
    this.itemCurrentRelativeHumidity = undefined;
    this.listenerCurrentRelativeHumidity = undefined;
    this.wsCurrentRelativeHumidity = undefined;

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

    this.listenerCurrentTemperature = this.listenerFactory(
        this.itemCurrentTemperature.name,
        this.itemCurrentTemperature.link,
        this.wsCurrentTemperature,
        this.log,
        this.updateCurrentTemperature.bind(this)
    );

    if ((typeof this.itemTargetTemperature) == 'undefined'){
        throw new Error(this.name + " needs TargetTemperatureItem!");
    }

    if ((typeof this.itemCurrentRelativeHumidity) !== 'undefined'){
        this.listenerCurrentRelativeHumidity = this.listenerFactory(
            this.itemCurrentRelativeHumidity.name,
            this.itemCurrentRelativeHumidity.link,
            this.wsCurrentRelativeHumidity,
            this.log,
            this.updateCurrentRelativeHumidity.bind(this)
        );
    }
};

/**
 * Binding CurrentTemperatureItem in Celsius from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setCurrentTemperatureCItem = function(item){
    this.itemCurrentTemperature = item;
    this.temperatureDisplayUnits = this.homebridge.hap.Characteristic.TemperatureDisplayUnits.CELSIUS;
};

/**
 * Binding CurrentTemperatureItem in Fahrenheit from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setCurrentTemperatureFItem = function(item){
    this.itemCurrentTemperature = item;
    this.temperatureDisplayUnits = this.homebridge.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
};

/**
 * Binding TargetTemperatureItem in Celsius from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setTargetTemperatureCItem = function(item){
    this.itemTargetTemperature = item;
    this.temperatureDisplayUnits = this.homebridge.hap.Characteristic.TemperatureDisplayUnits.CELSIUS;
};

/**
 * Binding TargetTemperatureItem in Fahrenheit from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setTargetTemperatureFItem = function(item){
    this.itemTargetTemperature = item;
    this.temperatureDisplayUnits = this.homebridge.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
};

/**
 * Binding CurrentRelativeHumidityItem from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setCurrentRelativeHumidityItem = function(item){
    this.itemCurrentRelativeHumidity = item;
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
        .on('get', this.getTemperatureDisplayUnits.bind(this))
        .setValue(this.temperatureDisplayUnits);

    //TODO
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
        .on('set', this.setTargetHeatingCoolingStateMock.bind(this))
        .on('get', this.getTargetHeatingCoolingStateMock.bind(this))
        .setValue(1);

    if (this.itemCurrentRelativeHumidity) {
        otherService.addCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity)
            .on('get', this.getCurrentRelativeHumidityState.bind(this))
            .setValue(this.checkRelativeHumidityState(this.itemCurrentRelativeHumidity.state));
    }

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
 * Get display unit from temperatureDisplayUnits
 * @param callback
 */
ThermostatItem.prototype.getTemperatureDisplayUnits = function(callback) {
    callback(undefined,this.temperatureDisplayUnits);
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
 * Parse relative humidity input value
 * @param state
 * @returns {number}
 */
ThermostatItem.prototype.checkRelativeHumidityState = function(state) {
    if ('Unitialized' === state){
        return 0;
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
 * Set CurrentRelativeHumidity from OpenHAB
 * @param message
 */
ThermostatItem.prototype.updateCurrentRelativeHumidity = function(message) {
    this.otherService
        .addCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity)
        .setValue(this.checkRelativeHumidityState(message));
};

/**
 * Get CurrentRelativeHumidity requested from iOS
 * @param callback
 */
ThermostatItem.prototype.getCurrentRelativeHumidityState = function(callback) {
    var self = this;
    this.log("iOS - request Current relative humidity state from " + this.itemCurrentRelativeHumidity.name + " (" + (self.name)+")");
    request(self.itemCurrentRelativeHumidity.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemCurrentRelativeHumidity.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkRelativeHumidityState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemCurrentRelativeHumidity.name + " (" + (self.name)+"): " + error);
        }
    })
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