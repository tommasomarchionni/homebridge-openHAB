"use strict";
var exports = module.exports = {};
exports.AbstractItem = require('../items/AbstractItem.js');
exports.SwitchItem = require('../items/SwitchItem.js');
exports.LightbulbItem = require('../items/LightbulbItem.js');
exports.FanItem = require('../items/FanItem.js');
exports.DimmerItem = require('../items/DimmerItem.js');
exports.RollershutterItem = require('../items/RollershutterItem.js');
exports.TemperatureSensorItem = require('../items/TemperatureSensorItem.js');
exports.NumberItem = require('../items/NumberItem.js');

exports.Factory = function(OpenHABPlatform,homebridge) {
    this.platform = OpenHABPlatform;
    this.log = this.platform.log;
    this.homebridge = homebridge;
};

exports.Factory.prototype.sitemapUrl = function () {
    var serverString = this.platform.host;
    //TODO da verificare
    if (this.platform.user && this.platform.password) {
        serverString = this.platform.user + ":" + this.platform.password + "@" + serverString;
    }

    return this.platform.protocol + "://" + serverString + ":" + this.platform.port + "/rest/sitemaps/" + this.platform.sitemap + "?type=json";
};

exports.Factory.prototype.parseSitemap = function (jsonSitemap) {
    var widgets = [].concat(jsonSitemap.homepage.widget);

    var result = [];
    for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
        if (!widget.item) {
            //TODO to handle frame
            this.log("Platform - The widget '" + widget.label + "' is not an item.");
            continue;
        }
        var abstractItem = new exports.AbstractItem(widget,this.platform,this.homebridge);
        var accessory = abstractItem.getItem(exports);
        abstractItem = null;

        if (typeof accessory == 'undefined'){
            this.log("Platform - The widget '" + widget.label + "' of type "+widget.item.type+" is an item not handled.");
            continue;
        }

        this.log("Platform - Accessory Found: " + widget.label);
        result.push(accessory);
    }
    return result;
};