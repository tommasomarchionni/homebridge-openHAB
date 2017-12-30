"use strict";
/**
 * @module ColorItem
 */

var request = require("request");
var Promise = require("promise");

/**
 * Class of a ColorItem entity
 * @class ColorItem
 * @constructor
 * @extends {AbstractItem} AbstractItem
 * @requires semaphore
 */
var ColorItem = function (widget, platform, homebridge) {
    ColorItem.super_.call(this, widget, platform, homebridge);
};

ColorItem.prototype.getServices = function () {

    /** @module semaphore */
    this.sem = require('semaphore')(1);

    this.initListener();

    this.informationService = this.getInformationServices();

    this.log("Initialization ColorItem - state: " + this.state);

    var colorState = this.parseState(this.state);

    let hue = colorState.hue;
    let saturation = colorState.saturation;
    let brightness = colorState.brightness;
    let power = false;

    if (brightness > 0) {
        power = true;
    }

    this.otherService = new this.homebridge.hap.Service.Lightbulb();

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setOpenHabPowerState.bind(this))
        .on('get', this.getOpenHabPowerState.bind(this))
        .setValue(power, function () {
        }, "init");


    this.otherService.addCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .on('set', this.setOpenHabBrightnessState.bind(this))
        .on('get', this.getOpenHabBrightnessState.bind(this))
        .setValue(brightness, function () {
        }, "init");

    this.otherService.addCharacteristic(this.homebridge.hap.Characteristic.Hue)
        .on('set', this.setOpenHabHueState.bind(this))
        .on('get', this.getOpenHabHueState.bind(this))
        .setValue(hue, function () {
        }, "init");

    this.otherService.addCharacteristic(this.homebridge.hap.Characteristic.Saturation)
        .on('set', this.setOpenHabSaturationState.bind(this))
        .on('get', this.getOpenHabSaturationState.bind(this))
        .setValue(saturation, function () {
        }, "init");

    return [this.informationService, this.otherService];
};

ColorItem.prototype.parseState = function (data) {

    let regex = /[.\d]+/g;
    let state = [];
    let result;

    while (result = regex.exec(data)) {
        state.push(result[0]);
    }

    return {
        hue: +state[0],
        saturation: +state[1],
        brightness: +state[2]
    };
};

/**
 * Procedure to update the ColorItems characteristics. This method is invoked by the
 * websocket listener
 *
 * @param message - The message the websocket listener received.
 * Example: "122,90,80"
 * 1st number represents the hue,
 * 2nd number represents the saturation,
 * 3rd number represents the brightness
 */
ColorItem.prototype.updateCharacteristics = function (message) {

    var state = this.parseState(message);


    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .setValue(state.brightness > 0, function () {
        }, "remote");

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .setValue(state.brightness, function () {
        }, "remote");

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Hue)
        .setValue(state.hue, function () {
        }, "remote");

    this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Saturation)
        .setValue(state.saturation, function () {
        }, "remote");
};

/**
 * Method to get the OpenHab state. It uses a GET request to retrieve the state from the REST api.
 * The callback method updateValues is called if the GET request succeeded.
 */
ColorItem.prototype.getOpenHabColorState = function () {

    return new Promise(function (resolve, reject) {

            request.get(
                this.url + '/state',
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {

                        this.log("OpenHAB HTTP GET <" + this.name + "> - " + body);
                        var state = this.parseState(body);
                        resolve(state);

                    } else {
                        this.log.error("OpenHAB HTTP ERROR <" + this.name + "> - " + error);
                        reject(error);
                    }
                }.bind(this)
            )
        }.bind(this)
    );
};

/**
 * Executes a post request to update the color state. The color state includes the hue, saturation and brightness.
 *
 * @param data - Data that is sent to the item
 */
ColorItem.prototype.setOpenHabColorState = function (data) {

    return new Promise(function (resolve, reject) {

            request.post(
                this.url,
                {
                    body: data,
                    headers: {'Content-Type': 'text/plain'}
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 201) {
                        this.log("OpenHAB HTTP RESP <" + this.name + "> - " + "OK");
                        resolve(body);
                    } else {
                        this.log.error("OpenHAB HTTP ERROR <" + this.name + "> - " + error);
                        reject(error);
                    }
                }.bind(this)
            );
        }.bind(this)
    );
};

/**
 * Executes a post request to update the switch state..
 *
 * @param data - Data that is sent to the item
 */
ColorItem.prototype.setOpenHabPowerSwitchState = function (data) {

    return new Promise(function (resolve, reject) {

            request.post(
                this.url,
                {
                    body: data,
                    headers: {'Content-Type': 'text/plain'}
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 201) {
                        this.log("OpenHAB HTTP RESP <" + this.name + "> - " + "OK");
                        resolve(body);
                    } else {
                        this.log.error("OpenHAB HTTP ERROR <" + this.name + "> - " + error);
                        reject(error);
                    }
                }.bind(this)
            );
        }.bind(this)
    );
};

/**
 * Processes a OpenHAB state update. This includes the color information (hue, saturation, brightness)
 * and the power state.
 *
 * @param {string} value - Value of the new state
 * @param {string} type - Type of the value. Possible types are "Power", "Brightness", "Saturation" and "Hue".
 * The types are case sensitive.
 * @returns Returns the promise of the executed POST request.
 */
ColorItem.prototype.processOpenHabState = function (value, type) {
    var command = "";

    if (type === "Power") {
        command = (value == true) ? "ON" : "OFF";

        this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Brightness).value = (value == true) ? 100 : 0;

        this.log("Update <" + this.name + "> <" + type + "> to: " + value + " Command: " + command);
        return this.setOpenHabPowerSwitchState(command);
    } else {


        var state = {
            "brightness": undefined,
            "hue": undefined,
            "saturation": undefined,
        };

        // Overwrite the received state because of inconsistencies when multiple commands are sent.
        state.brightness = this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Brightness).value;
        state.hue = this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Hue).value;
        state.saturation = this.otherService.getCharacteristic(this.homebridge.hap.Characteristic.Saturation).value;

        switch (type) {
            case "Power":
                //state.brightness = (value == true) ? 100 : 0;
                break;
            case "Brightness":
                if (value <= 1) {
                    value = "1";
                }
                state.brightness = value;
                break;
            case "Hue":
                state.hue = value;
                break;
            case "Saturation":
                state.saturation = value;
                break;
            default:
                this.log("Unknown type " + type);
        }
        command = +state.hue + "," + +state.saturation + "," + +state.brightness;
        this.log("Update <" + this.name + "> <" + type + "> to: " + value + " Command: " + command);

        return this.setOpenHabColorState(command);
    }
};

/*
* Updates the whole OpenHab state.
*
* @param {string} value - Value of the new state
* @param {string} type - Type of the value. Possible types are "Power", "Brightness", "Saturation" and "Hue".
* The types are case sensitive.
* @param callback - Callback of the HAP server to inform that the state update was executed.
* @param context - Defines the context of the state update. If the context is set to "remote" or "init" the update
* request is not sent to the OpenHab interface.
*/
ColorItem.prototype.updateOpenHabState = function (value, type, callback, context) {

    if (context == "remote" || context == "init") {
        callback(null);
        return;
    }

    this.sem.take(function () {

        this.log("Promise <" + this.name + "> -> " + "start");


        this.processOpenHabState(value, type)
            .then(function () {
                this.log("Promise <" + this.name + "> -> executed");
                callback(null);
                this.sem.leave();
            }.bind(this))
            .catch(function (e) {
                this.log.error(e);
                callback(e);
                this.sem.leave();
            }.bind(this));

    }.bind(this))
};


ColorItem.prototype.getOpenHabPowerState = function (callback) {
    this.getOpenHabColorState()
        .then(function (state) {
            callback(null, state.brightness > 0)
        });
};

ColorItem.prototype.getOpenHabBrightnessState = function (callback) {
    this.getOpenHabColorState()
        .then(function (state) {
            callback(null, state.brightness)
        });
};

ColorItem.prototype.getOpenHabHueState = function (callback) {
    this.getOpenHabColorState()
        .then(function (state) {
            callback(null, state.hue)
        });
};

ColorItem.prototype.getOpenHabSaturationState = function (callback) {
    this.getOpenHabColorState()
        .then(function (state) {
            callback(null, state.saturation)
        });
};


ColorItem.prototype.setOpenHabPowerState = function (value, callback, context) {
    this.updateOpenHabState(value, "Power", callback, context);
};

ColorItem.prototype.setOpenHabBrightnessState = function (value, callback, context) {
    this.updateOpenHabState(value, "Brightness", callback, context);
};

ColorItem.prototype.setOpenHabHueState = function (value, callback, context) {
    this.updateOpenHabState(value, "Hue", callback, context);
};

ColorItem.prototype.setOpenHabSaturationState = function (value, callback, context) {
    this.updateOpenHabState(value, "Saturation", callback, context);
};

module.exports = ColorItem;



