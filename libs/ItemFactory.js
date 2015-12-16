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

exports.Factory = function(OpenHABPlatform,homebridge) {
    this.platform = OpenHABPlatform;
    this.log = this.platform.log;
    this.homebridge = homebridge;
    this.itemList = [];
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

    exports.Factory.prototype.traverseSitemap(jsonSitemap,this);

    console.log(this.itemList);

    var accessoryList = [];
    for (var key in this.itemList) {
        if (this.itemList.hasOwnProperty(key)){
            var abstractItem = new exports.AbstractItem(this.itemList[key], this.platform,this.homebridge);
            var accessory = abstractItem.getItem(exports);
            abstractItem = null;

            if (typeof accessory == 'undefined'){
                this.log("Platform - The widget '" + this.itemList[key].label + "' of type "+this.itemList[key].type+" is an item not handled.");
                continue;
            }

            this.log("Platform - Accessory Found: " + this.itemList[key].label);
            accessoryList.push(accessory);
        }
    }
    return accessoryList;
};

exports.Factory.prototype.traverseSitemap = function(jsonSitmap,factory) {
    for (var key in jsonSitmap) {
        if (jsonSitmap.hasOwnProperty(key)){
            if (typeof(jsonSitmap[key].item) !== 'undefined'){

                var name = jsonSitmap[key].item.name;
                var label = (jsonSitmap[key].label.trim() === "") ? name : jsonSitmap[key].label;
                var type = jsonSitmap[key].item.type;
                var state = jsonSitmap[key].item.state;
                var link = jsonSitmap[key].item.link;

                var item = {
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