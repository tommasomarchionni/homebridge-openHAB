"use strict";

var WSListener = require('../libs/WSListener.js');

var AbstractItem = function(widget,platform,homebridge) {
    AbstractItem.super_.call(this, widget.item.name, homebridge.hap.uuid.generate(String(widget.item.name)));
    this.widget =  widget;
    this.label = widget.label;
    this.name = widget.item.name;
    this.url = widget.item.link;
    this.state = widget.item.state;
    this.platform = platform;
    this.log = platform.log;
    this.homebridge = homebridge;

    this.setInitialState = false;
    this.setFromOpenHAB = false;
    this.informationService = undefined;
    this.otherService = undefined;
    this.listener = undefined;
    this.ws = undefined;
};

AbstractItem.prototype.getInformationServices = function() {
    var informationService = new this.homebridge.hap.Service.AccessoryInformation();

    informationService
        .setCharacteristic(this.homebridge.hap.Characteristic.Manufacturer, "OpenHAB")
        .setCharacteristic(this.homebridge.hap.Characteristic.Model, this.constructor.name)
        .setCharacteristic(this.homebridge.hap.Characteristic.SerialNumber, "N/A")
        .setCharacteristic(this.homebridge.hap.Characteristic.Name, this.name);
    return informationService;
};

AbstractItem.prototype.checkListener = function() {

    if (typeof this.listener == 'undefined' || typeof this.ws == 'undefined') {
        this.ws = undefined;
        this.listener = new WSListener(this, this.updateCharacteristics.bind(this));
        this.listener.startListener();
    }
};

module.exports = AbstractItem;