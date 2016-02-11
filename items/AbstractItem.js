"use strict";

var WSListener = require('../libs/WSListener.js');

var AbstractItem = function(widget,platform,homebridge) {
    this.platform = platform;
    this.widget =  widget;
    this.homebridge = homebridge;

    this.label = this.widget.label;
    this.url = this.widget.link;
    this.state = this.widget.state;
    this.log = this.platform.log;
    this.itemType=this.widget.itemType;

    this.setInitialState = false;
    this.setFromOpenHAB = false;
    this.informationService = undefined;
    this.otherService = undefined;
    this.listener = undefined;
    this.ws = undefined;

    if (platform.user && platform.password) {
        this.url = this.url.replace('http://', 'http://' + encodeURIComponent(this.platform.user) + ":" + encodeURIComponent(this.platform.password) + "@");
    }
    this.name = this.platform.useLabelForName ? this.label : this.widget.name;

    AbstractItem.super_.call(this, this.name, homebridge.hap.uuid.generate(String(this.widget.name)));

};

AbstractItem.prototype.getServices = function() {
    this.initListener();
    this.setInitialState = true;
    this.informationService = this.getInformationServices();
    this.otherService = this.getOtherServices();
    return [this.informationService, this.otherService];
};

AbstractItem.prototype.getOtherServices = function() {
    return null;
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

AbstractItem.prototype.initListener = function() {
    if (typeof this.listener == 'undefined' || typeof this.ws == 'undefined') {
        this.listener = this.listenerFactory(this.name,this.url,this.ws,this.log, this.updateCharacteristics.bind(this));
    }
};

AbstractItem.prototype.listenerFactory = function(itemName,itemUrl,ws,log,callback) {
    return new WSListener(itemName,itemUrl,ws,log,callback.bind(this)).startListener();
};

module.exports = AbstractItem;