"use strict";
var exports = module.exports = {};
exports.AbstractItem = require('../items/AbstractItem.js');
exports.SwitchItem = require('../items/SwitchItem.js');
exports.LightbulbItem = require('../items/LightbulbItem.js');
exports.FanItem = require('../items/FanItem.js');
exports.OutletItem = require('../items/OutletItem.js');
exports.DimmerItem = require('../items/DimmerItem.js');
exports.RollershutterItem = require('../items/RollershutterItem.js');
exports.TemperatureSensorItem = require('../items/TemperatureSensorItem.js');
exports.NumberItem = require('../items/NumberItem.js');
exports.ContactItem = require('../items/ContactItem.js');
exports.MotionSensorItem = require('../items/MotionSensorItem.js');
exports.LightSensorItem = require('../items/LightSensorItem.js');
exports.ThermostatItem = require('../items/ThermostatItem.js');

exports.Factory = function(OpenHABPlatform,homebridge) {
    this.platform = OpenHABPlatform;
    this.log = this.platform.log;
    this.homebridge = homebridge;
    this.itemList = [];
    this.uniqueIds = [];
};

exports.Factory.prototype.sitemapUrl = function () {
    var serverString = this.platform.host;
    //TODO da verificare
    if (this.platform.user && this.platform.password) {
        serverString = encodeURIComponent(this.platform.user) + ":" + encodeURIComponent(this.platform.password) + "@" + serverString;
    }

    return this.platform.protocol + "://" + serverString + ":" + this.platform.port + "/rest/sitemaps/" + this.platform.sitemap + "?type=json";
};

exports.Factory.prototype.parseSitemap = function (jsonSitemap) {
    exports.Factory.prototype.traverseSitemap(jsonSitemap,this);

    var accessoryList = [];
    for (var key in this.itemList) {
        if (this.itemList.hasOwnProperty(key)){

            this.itemList[key] = exports.Factory.prototype.checkCustomAttrs(this.itemList[key],this.platform);
            if (!(this.itemList[key].itemType in exports)){
                this.log("Platform - The widget '" + this.itemList[key].label + "' of type "+this.itemList[key].type+" is an item not handled.");
                continue;
            }
            if (this.itemList[key].skipItem) {
                this.log("Platform - The widget '" + this.itemList[key].label + "' of type "+this.itemList[key].type+" was skipped.");
                continue;
            }

            //If itemUniqueAggregationId is definited in the item configuration
            if (typeof this.itemList[key].itemUniqueAggregationId !== 'undefined') {
                if (typeof this.uniqueIds[this.itemList[key].itemUniqueAggregationId] !== 'undefined') {
                    this.log("Platform - New attribute found for " + this.itemList[key].label);
                    this.uniqueIds[this.itemList[key].itemUniqueAggregationId]['set'+this.itemList[key].itemSubType](this.itemList[key]);
                    this.log("Platform - The attribute " + this.itemList[key].itemSubType + " is attached to " +this.itemList[key].label);
                    continue;
                }
            }

            var accessory = new exports[this.itemList[key].itemType](this.itemList[key], this.platform, this.homebridge);
            this.log("Platform - Accessory Found: " + this.itemList[key].label);

            if (typeof this.itemList[key].itemUniqueAggregationId !== 'undefined') {
                this.uniqueIds[this.itemList[key].itemUniqueAggregationId] = accessory;
                this.log("Platform - New attribute found for " + this.itemList[key].label);
                this.uniqueIds[this.itemList[key].itemUniqueAggregationId]['set'+this.itemList[key].itemSubType](this.itemList[key]);
                this.log("Platform - The attribute " + this.itemList[key].itemSubType + " is attached to " +this.itemList[key].label);
            }
            accessoryList.push(accessory);
        }
    }
    return accessoryList;
};

exports.Factory.prototype.checkCustomAttrs = function(widget,platform) {
    widget.manufacturer = "OpenHAB";
    widget.model = widget.type;
    widget.itemType = widget.type;
    widget.serialNumber = widget.name;
    widget.skipItem = false;

    //cicle customAttrs
    if ('customAttrs' in platform){
        for (var key in platform.customAttrs) {
            if (platform.customAttrs.hasOwnProperty(key) && platform.customAttrs[key]['itemName'] === widget.name){
                if (typeof platform.customAttrs[key]['itemLabel'] !== 'undefined'){
                    widget.label=platform.customAttrs[key]['itemLabel'];
                }
                if (typeof platform.customAttrs[key]['itemManufacturer'] !== 'undefined'){
                    widget.manufacturer=platform.customAttrs[key]['itemManufacturer'];
                }
                if (typeof platform.customAttrs[key]['itemSerialNumber'] !== 'undefined'){
                    widget.serialNumber=platform.customAttrs[key]['itemSerialNumber'];
                }
                if (typeof platform.customAttrs[key]['itemType'] !== 'undefined'){
                    widget.itemType=platform.customAttrs[key]['itemType'];
                    widget.model = widget.itemType;
                }
                if (typeof platform.customAttrs[key]['itemModel'] !== 'undefined'){
                    widget.model=platform.customAttrs[key]['itemModel'];
                }
                if (typeof platform.customAttrs[key]['skipItem'] !== 'undefined'){
                    widget.skipItem=platform.customAttrs[key]['skipItem'];
                }
                if (typeof platform.customAttrs[key]['itemUniqueAggregationId'] !== 'undefined'){
                    widget.itemUniqueAggregationId=platform.customAttrs[key]['itemUniqueAggregationId'];
                }
                if (typeof platform.customAttrs[key]['itemSubType'] !== 'undefined'){
                    widget.itemSubType=platform.customAttrs[key]['itemSubType'];
                }
            }
        }
    }
    return widget;
};

exports.Factory.prototype.traverseSitemap = function(jsonSitmap,factory) {

    //initialize variables
    var lastLabel="";

    for (var key in jsonSitmap) {

        var name = "";
        var label = "";
        var type = "";
        var state = "";
        var link = "";
        var item = undefined;

        if (jsonSitmap.hasOwnProperty(key)){

            if (key == "label"){
                lastLabel = jsonSitmap[key];
            }

            if (key == "item" && typeof(jsonSitmap[key].type) !== 'undefined'){
                name = jsonSitmap[key].name;
                label = (lastLabel.trim() === "") ? name : lastLabel;
                type = jsonSitmap[key].type;
                state = jsonSitmap[key].state;
                link = jsonSitmap[key].link;
            } else if (typeof(jsonSitmap[key].item) !== 'undefined'){
                name = jsonSitmap[key].item.name;
                label = (jsonSitmap[key].label.trim() === "") ? name : jsonSitmap[key].label;
                type = jsonSitmap[key].item.type;
                state = jsonSitmap[key].item.state;
                link = jsonSitmap[key].item.link;
            }

            if (name !== ""){
                item = {
                    name:name,
                    label:label,
                    type:type,
                    state:state,
                    link:link
                };

                //avoid duplicate items
                if (!(name in factory.itemList)) factory.itemList[name] = item;
            }

            if ((typeof(jsonSitmap[key].widget) !== 'undefined') || (typeof(jsonSitmap[key].linkedPage) !== 'undefined') || key === 'widget'){
                if (typeof(jsonSitmap[key].widget) !== 'undefined'){
                    exports.Factory.prototype.traverseSitemap(jsonSitmap[key].widget,factory);
                } else if(key === 'widget')  {
                    exports.Factory.prototype.traverseSitemap(jsonSitmap[key],factory);
                } else  {
                    exports.Factory.prototype.traverseSitemap(jsonSitmap[key].linkedPage,factory);
                }
            }
        }
    }
};