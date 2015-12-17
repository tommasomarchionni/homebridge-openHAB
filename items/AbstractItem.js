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
    this.itemType=this.widget.type;

    this.setInitialState = false;
    this.setFromOpenHAB = false;
    this.informationService = undefined;
    this.otherService = undefined;
    this.listener = undefined;
    this.ws = undefined;
    this.manufacturer = "OpenHAB";
    this.model = this.constructor.name;
    this.serialNumber = "N/A";
    this.skipItem = false;

    for (var key in this.platform.customAttrs) {
        if (this.platform.customAttrs.hasOwnProperty(key) && this.platform.customAttrs[key]['itemName'] === this.widget.name){
            if (typeof this.platform.customAttrs[key]['itemLabel'] !== 'undefined'){
                this.label=this.platform.customAttrs[key]['itemLabel'];
            }
            if (typeof this.platform.customAttrs[key]['itemManufacturer'] !== 'undefined'){
                this.manufacturer=this.platform.customAttrs[key]['itemManufacturer'];
            }
            if (typeof this.platform.customAttrs[key]['itemModel'] !== 'undefined'){
                this.model=this.platform.customAttrs[key]['itemModel'];
            }
            if (typeof this.platform.customAttrs[key]['itemSerialNumber'] !== 'undefined'){
                this.serialNumber=this.platform.customAttrs[key]['itemSerialNumber'];
            }
            if (typeof this.platform.customAttrs[key]['itemType'] !== 'undefined'){
                this.itemType=this.platform.customAttrs[key]['itemType'];
            }
            if (typeof this.platform.customAttrs[key]['skipItem'] !== 'undefined'){
                this.skipItem=this.platform.customAttrs[key]['skipItem'];
            }
        }
    }

    this.name = this.platform.useLabelForName ? this.label : this.widget.name;
    AbstractItem.super_.call(this, this.name, homebridge.hap.uuid.generate(String(this.name)));

};

AbstractItem.prototype.getServices = function() {
    this.checkListener();
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

AbstractItem.prototype.checkListener = function() {

    if (typeof this.listener == 'undefined' || typeof this.ws == 'undefined') {
        this.ws = undefined;
        this.listener = new WSListener(this, this.updateCharacteristics.bind(this));
        this.listener.startListener();
    }
};

AbstractItem.prototype.getItem = function(exports) {

    if ((this.itemType in exports) && !this.skipItem)
        return new exports[this.itemType](this.widget,this.platform,this.homebridge);
    else
        return undefined;
};

module.exports = AbstractItem;