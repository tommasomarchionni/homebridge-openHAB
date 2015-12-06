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
// Remember to add platform to config.json. Example:
// "platforms": [
//{
//    "platform": "openHAB",
//    "name": "openHAB",
//    "host": "PUT IP ADDRESS OF YOUR OPENHAB HERE (127.0.0.1)",
//    "port": "PUT PORT OF YOUR OPENHAB HERE (8080)",
//    "sitemap":"PUT SITEMAP OF YOUR OPENHAB HERE (demo)"
//}
//]
//
// Example of sitemap in OpenHAB:
// sitemap homekit label="HomeKit" {
//	   Switch item=Light_1 label="Light 1"
// }
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
    //Service = homebridge.hap.Service;
    //Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.hap.Accessory;
    //uuid = homebridge.hap.uuid;

    Homebridge = homebridge;

    Utility.addSupportTo(ItemFactory.AbstractItem, Accessory);
    Utility.addSupportTo(ItemFactory.SwitchItem, ItemFactory.AbstractItem);
    Utility.addSupportTo(ItemFactory.DimmerItem, ItemFactory.AbstractItem);

    homebridge.registerPlatform("homebridge-openhab", "openHAB", OpenHABPlatform);
};

//////// PLATFORM /////////

function OpenHABPlatform(log, config){
    this.log      = log;
    this.user     = config["user"];
    this.password = config["password"];
    this.host   = config["host"];
    this.port     = config["port"];
    this.protocol = "http";
    this.sitemap  = "demo";
    if (typeof config["sitemap"] != 'undefined') {
        this.sitemap = config["sitemap"];
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