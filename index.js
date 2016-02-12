// OpenHAB 1 Platform for HomeBridge
// Written by Tommaso Marchionni
// Based on many of the other HomeBridge platform modules
//
// Revisions:
//
// 17 October 2015 [tommasomarchionni]
// - Initial release
//
// 25 October 2015 [tommasomarchionni]
// - Added WS listener and new OOP structure
//
// 5 December 2015 [tommasomarchionni]
// - Adapted for new plugin system
//
// 14 December 2015 [tommasomarchionni]
// - Added temperature sensor item
// - Added switch item,lightbulb item and fan item
//
// 16 December 2015 [tommasomarchionni]
// - Added the possibility to load every type of sitemap
// - Added skipItem in customAttr to avoid to load item in Homekit catalog
// - Added outlet item
//
// 17 December 2015 [tommasomarchionni]
// - Added contact item
//
// 11 February 2016 [tommasomarchionni]
// - Experimental support for Thermostat
//
// 12 February 2016 [tommasomarchionni]
// - Added support for humidity in Thermostat
//
// Rollershutter is tested with this binding in OpenHAB:
// command=SWITCH_MULTILEVEL,invert_percent=true,invert_state=false"
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.
//

'use strict';

//////// LIBS /////////

var Homebridge, Accessory;
var request = require("request");
var ItemFactory = require('./libs/ItemFactory.js');
var Utility = require('./libs/Utility.js');

//////// EXPORTS /////////

module.exports = function(homebridge) {
    Accessory = homebridge.hap.Accessory;
    Homebridge = homebridge;

    Utility.addSupportTo(ItemFactory.AbstractItem, Accessory);
    Utility.addSupportTo(ItemFactory.SwitchItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.LightbulbItem, ItemFactory.SwitchItem);
    Utility.addSupportTo(ItemFactory.FanItem, ItemFactory.SwitchItem);
    Utility.addSupportTo(ItemFactory.OutletItem, ItemFactory.SwitchItem);
    Utility.addSupportTo(ItemFactory.DimmerItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.RollershutterItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.TemperatureSensorItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.NumberItem, ItemFactory.TemperatureSensorItem);
    Utility.addSupportTo(ItemFactory.ContactItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.MotionSensorItem, ItemFactory.ContactItem);
    Utility.addSupportTo(ItemFactory.LightSensorItem, ItemFactory.TemperatureSensorItem); //TODO ricontrollare
    Utility.addSupportTo(ItemFactory.ThermostatItem, ItemFactory.AbstractItem);

    homebridge.registerPlatform("homebridge-openhab", "openHAB", OpenHABPlatform);
};

//////// PLATFORM /////////

function OpenHABPlatform(log, config){
    this.log      = log;
    this.user     = config["user"];
    this.password = config["password"];
    this.host     = config["host"];
    this.port     = config["port"];
    this.protocol = "http";
    this.sitemap  = "demo";
    if (typeof config["useLabelForName"] != 'undefined') {
        this.useLabelForName = config["useLabelForName"];
    }
    if (typeof config["sitemap"] != 'undefined') {
        this.sitemap = config["sitemap"];
    }
    if (typeof config["customAttrs"] != 'undefined') {
        this.customAttrs = config["customAttrs"];
    } else {
        this.customAttrs = [];
    }
}

OpenHABPlatform.prototype.accessories = function(callback) {
    var that = this;
    this.log("Platform - Fetching OpenHAB devices.");
    var itemFactory = new ItemFactory.Factory(this,Homebridge);
    var url = itemFactory.sitemapUrl();
    this.log("Platform - Connecting to " + url);
    request.get({
        url: url,
        json: true
    }, function(err, response, json) {
        if (!err && response.statusCode == 200) {
            callback(itemFactory.parseSitemap(json));
        } else {
            that.log("Platform - There was a problem connecting to OpenHAB.");
        }
    });
};