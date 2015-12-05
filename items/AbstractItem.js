"use strict";

var WSListener = require('../libs/WSListener.js');

var AbstractItem = function(widget,platform) {
    AbstractItem.super_.call(this,widget,platform);

    this.widget =  widget;
    this.label = widget.label;
    this.name = widget.item.name;
    this.url = widget.item.link;
    this.state = widget.item.state;
    this.platform = platform;
    this.log = platform.log;

    this.setInitialState = false;
    this.setFromOpenHAB = false;
    this.informationService = undefined;
    this.otherService = undefined;
    this.listener = undefined;
    this.ws = undefined;
};

AbstractItem.prototype.getInformationServices = function() {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "OpenHAB")
        .setCharacteristic(Characteristic.Model, this.constructor.name)
        .setCharacteristic(Characteristic.SerialNumber, "N/A")
        .setCharacteristic(Characteristic.Name, this.name);
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