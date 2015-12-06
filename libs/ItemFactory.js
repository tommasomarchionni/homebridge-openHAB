"use strict";
var exports = module.exports = {};
var currentModule = this;
exports.AbstractItem = require('../items/AbstractItem.js');
exports.SwitchItem = require('../items/SwitchItem.js');
exports.DimmerItem = require('../items/DimmerItem.js');

exports.ItemFactory = function(OpenHABPlatform,homebridge) {
    this.platform = OpenHABPlatform;
    this.log = this.platform.log;
    this.homebridge = homebridge;
};

exports.ItemFactory.prototype.sitemapUrl = function () {
    var serverString = this.platform.host;
    //TODO da verificare
    if (this.platform.user && this.platform.password) {
        serverString = this.platform.user + ":" + this.platform.password + "@" + serverString;
    }

    return this.platform.protocol + "://" + serverString + ":" + this.platform.port + "/rest/sitemaps/" + this.platform.sitemap + "?type=json";
};

exports.ItemFactory.prototype.parseSitemap = function (jsonSitemap) {
    var widgets = [].concat(jsonSitemap.homepage.widget);

    var result = [];
    for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
        if (!widget.item) {
            //TODO to handle frame
            this.log("Platform - The widget '" + widget.label + "' is not an item.");
            continue;
        }

        //if ("SwitchItem" === widget.item.type){
        //    var accessory = new SwitchItem(widget,this.platform,this.homebridge);
        //} else {
        //    this.log("Platform - The widget '" + widget.label + "' of type "+widget.item.type+" is an item not handled.");
        //    continue;
        //}
        if (currentModule[widget.item.type] != undefined) {
            var accessory = new currentModule[widget.item.type](widget,this.platform,this.homebridge);
        } else {
            this.log("Platform - The widget '" + widget.label + "' of type "+widget.item.type+" is an item not handled.");
            continue;
        }

        this.log("Platform - Accessory Found: " + widget.label);
        result.push(accessory);
    }
    return result;
};