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

    //CurrentHeatingCooling
    this.itemCurrentHeatingCooling = undefined;
    this.listenerCurrentHeatingCooling = undefined;
    this.wsCurrentHeatingCooling = undefined;

    //TargetHeatingCooling
    this.itemTargetHeatingCooling = undefined;
    this.setTargetHeatingCoolingInitialState = false;
    this.targetHeatingCoolingArr = [];
    this.targetHeatingCoolingInProgress = false;
    this.targetHeatingCoolingTimeout = 1000;

    ThermostatItem.super_.call(this, widget,platform,homebridge);
};

ThermostatItem.prototype.initEmitter = function() {
    var self=this;
    this.thermostatItemEmitter.on('TARGET_TEMPERATURE_UPDATE_EVENT', function() {
        self.setTargetTemperatureStateFromEmit();
    });
    this.thermostatItemEmitter.on('TARGET_HEATING_COOLING_UPDATE_EVENT', function() {
        self.setTargetHeatingCoolingStateFromEmit();
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

    //TODO verificare anche le altre proprietà
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

    if ((typeof this.itemCurrentHeatingCooling) !== 'undefined'){
        this.listenerCurrentHeatingCooling = this.listenerFactory(
            this.itemCurrentHeatingCooling.name,
            this.itemCurrentHeatingCooling.link,
            this.wsCurrentHeatingCooling,
            this.log,
            this.updateCurrentHeatingCooling.bind(this)
        );
    }
};

/**
 * Binding CurrentHeatingCoolingItem from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setCurrentHeatingCoolingItem = function(item){
    this.itemCurrentHeatingCooling = item;
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
 * Binding TargetHeatingCoolingItem from ItemFactory
 * @param item
 */
ThermostatItem.prototype.setTargetHeatingCoolingItem = function(item){
    this.itemTargetHeatingCooling = item;
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

    //Init CurrentHeatingCoolingState Characteristic
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
        .on('get', this.getCurrentHeatingCoolingState.bind(this))
        .setValue(this.checkHeatingCoolingState(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.HEAT));

    //Init TemperatureDisplayUnits Characteristic
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TemperatureDisplayUnits)
        .on('get', this.getTemperatureDisplayUnits.bind(this))
        .setValue(this.temperatureDisplayUnits);

    this.setTargetHeatingCoolingInitialState = true;

    //Init TargetHeatingCoolingState Characteristic
    otherService.getCharacteristic(this.homebridge.hap.Characteristic.TargetHeatingCoolingState)
        .on('set', this.setTargetHeatingCoolingState.bind(this))
        .on('get', this.getTargetHeatingCoolingState.bind(this))
        .setValue(this.homebridge.hap.Characteristic.TargetHeatingCoolingState.HEAT);

    //Init CurrentRelativeHumidity Characteristic
    if (this.itemCurrentRelativeHumidity) {
        otherService.addCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity)
            .on('get', this.getCurrentRelativeHumidityState.bind(this))
            .setValue(this.checkRelativeHumidityState(0));
    }

    return otherService;
};

/**
 * Set target heating cooling when receive emit
 */
ThermostatItem.prototype.setTargetHeatingCoolingStateFromEmit = function(){
    var self=this;

    if (typeof self.itemTargetHeatingCoolin === 'undefined'){
        return;
    }

    if (!this.targetHeatingCoolingInProgress){
        this.targetHeatingCoolingInProgress = true;
        setTimeout(function() {
            var value = self.targetHeatingCoolingArr[self.targetHeatingCoolingArr.length-1];
            self.log("iOS - send message to " + self.itemTargetHeatingCooling.name + " (" + (self.name)+"): " + value);
            var command = "" + value;
            request.post(
                self.itemTargetHeatingCooling.link,
                {
                    body: command,
                    headers: {'Content-Type': 'text/plain'}
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 201) {
                        self.log("OpenHAB HTTP - response from " + self.itemTargetHeatingCooling.name + " (" + (self.name)+"): " + body);
                    } else {
                        self.log("OpenHAB HTTP - error from " + self.itemTargetHeatingCooling.name + " (" + (self.name)+"): " + error);
                    }
                    self.targetHeatingCoolingArr = [];
                    self.targetHeatingCoolingInProgress = false;
                }
            );
        }, self.targetHeatingCoolingTimeout);
    }
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
ThermostatItem.prototype.getTargetHeatingCoolingState = function(callback) {
    var self = this;

    if (typeof (self.itemTargetHeatingCooling) === 'undefined'){
        this.log("iOS - request target heating cooling state from " +self.name);
        //default is Characteristic.CurrentHeatingCoolingState.HEAT
        callback(undefined,this.homebridge.hap.Characteristic.TargetHeatingCoolingState.HEAT);
        return;
    }

    this.log("iOS - request target heating cooling state from " + this.itemTargetHeatingCooling.name + " (" + (self.name)+")");
    request(self.itemTargetHeatingCooling.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemTargetHeatingCooling.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkHeatingCoolingState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemTargetHeatingCooling.name + " (" + (self.name)+"): " + error);
        }
    })
};

/**
 * TODO
 * @param value
 * @param callback
 */
ThermostatItem.prototype.setTargetHeatingCoolingState = function(value,callback){
    if (this.setTargetHeatingCoolingInitialState) {
        this.setTargetHeatingCoolingInitialState = false;
        callback();
        return;
    }

    this.targetHeatingCoolingArr.push(value);
    this.thermostatItemEmitter.emit('TARGET_HEATING_COOLING_UPDATE_EVENT');
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
 * Get CurrentHeatingCooling requested from iOS
 * @param callback
 */
ThermostatItem.prototype.getCurrentHeatingCoolingState = function(callback) {
    var self = this;

    if (typeof (self.itemCurrentHeatingCooling) === 'undefined'){
        this.log("iOS - request current heating cooling state from " +self.name);
        //default is Characteristic.CurrentHeatingCoolingState.HEAT
        callback(undefined,this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.HEAT);
        return;
    }

    this.log("iOS - request current heating cooling state from " + this.itemCurrentHeatingCooling.name + " (" + (self.name)+")");
    request(self.itemCurrentHeatingCooling.link + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.itemCurrentHeatingCooling.name + " (" + (self.name)+"): " + body);
            callback(undefined,self.checkHeatingCoolingState(body));
        } else {
            self.log("OpenHAB HTTP - error from " + self.itemCurrentHeatingCooling.name + " (" + (self.name)+"): " + error);
        }
    });
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
 * Parse heating cooling input value
 * @param state
 * @returns {number}
 */
ThermostatItem.prototype.checkHeatingCoolingState = function(state) {
    if ('Unitialized' === state){
        return 0;
    }
    switch (state){
        case 0:
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.OFF;
        case 1:
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.HEAT;
        case 2:
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.COOL;
        case 3:
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.AUTO;
        case "heat":
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.HEAT;
        case "cool":
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.COOL;
        case "heat-cool":
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.AUTO;
        case "off":
            return this.homebridge.hap.Characteristic.CurrentHeatingCoolingState.OFF;
    }
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
 * Set CurrentHeatingCooling from OpenHAB
 * @param message
 */
ThermostatItem.prototype.updateCurrentHeatingCooling = function(message) {
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.CurrentHeatingCoolingState)
        .setValue(this.checkHeatingCoolingState(message));
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