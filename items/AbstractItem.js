"use strict";

var WSListener = require('../libs/WSListener.js');

var AbstractItem = function(widget,platform,homebridge) {
    this.platform = platform;
    this.widget =  widget;
    this.homebridge = homebridge;

    this.label = this.widget.label;
    this.url = this.widget.item.link;
    this.state = this.widget.item.state;
    this.log = this.platform.log;

    this.setInitialState = false;
    this.setFromOpenHAB = false;
    this.informationService = undefined;
    this.otherService = undefined;
    this.listener = undefined;
    this.ws = undefined;
    this.manufacturer = "OpenHAB";
    this.model = this.constructor.name;
    this.serialNumber = "N/A";

    for (var key in this.platform.customAttrs) {
        if (this.platform.customAttrs.hasOwnProperty(key) && this.platform.customAttrs[key] === this.widget.item.name){
            if (typeof this.platform.customAttrs[key][itemManufacturer] !== 'undefined'){
                this.manufacturer=this.platform.customAttrs[key][itemManufacturer];
            }
            if (typeof this.platform.customAttrs[key][itemModel] !== 'undefined'){
                this.manufacturer=this.platform.customAttrs[key][itemModel];
            }
            if (typeof this.platform.customAttrs[key][itemSerialNumber] !== 'undefined'){
                this.manufacturer=this.platform.customAttrs[key][itemSerialNumber];
            }
        }
    }

    this.name = this.platform.useLabelForName ? this.label : this.widget.item.name;

    AbstractItem.super_.call(this, this.name, homebridge.hap.uuid.generate(String(this.name)));

};

AbstractItem.prototype.getInformationServices = function() {
    var informationService = new this.homebridge.hap.Service.AccessoryInformation();

    informationService
        .setCharacteristic(this.homebridge.hap.Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(this.homebridge.hap.Characteristic.Model, this.model)
        .setCharacteristic(this.homebridge.hap.Characteristic.SerialNumber, this.serialNumber)
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