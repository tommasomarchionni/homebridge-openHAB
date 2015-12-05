"use strict";

var ItemFactory = function(OpenHABPlatform,currentModule) {
    this.platform = OpenHABPlatform;
    this.log = this.platform.log;
    this.currentModule = currentModule;
};

ItemFactory.prototype.sitemapUrl = function () {
    var serverString = this.platform.host;
    //TODO da verificare
    if (this.platform.user && this.platform.password) {
        serverString = this.platform.user + ":" + this.platform.password + "@" + serverString;
    }

    return this.platform.protocol + "://" + serverString + ":" + this.platform.port + "/rest/sitemaps/" + this.platform.sitemap + "?type=json";
};

ItemFactory.prototype.parseSitemap = function (jsonSitemap) {
    var widgets = [].concat(jsonSitemap.homepage.widget);

    var result = [];
    for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
        if (!widget.item) {
            //TODO to handle frame
            this.log("Platform - The widget '" + widget.label + "' is not an item.");
            continue;
        }

        if (this.currentModule[widget.item.type] != undefined) {
            var accessory = new this.currentModule[widget.item.type](widget,this.platform);
        } else {
            this.log("Platform - The widget '" + widget.label + "' of type "+widget.item.type+" is an item not handled.");
            continue;
        }

        this.log("Platform - Accessory Found: " + widget.label);
        result.push(accessory);
    }
    return result;
};

module.exports = ItemFactory;