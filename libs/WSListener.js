"use strict";
var request = require('request');

var WSListener = function(itemName,itemUrl,ws,log,plattform,callback) {
    this.itemName = itemName;
    this.itemUrl = itemUrl;
    this.log = log;
    this.ws = ws;
	this.plattform = plattform;
    this.callback = callback;
};

WSListener.prototype.startListener = function () {
    var self = this;
    if (typeof this.ws == 'undefined') {
		this.ws = this.itemUrl + '/state?type=json';		
    }
	self.runForever(this.plattform.pollingInterval);
};

WSListener.prototype.runForever = function (interval) {
    var self = this;
    var intervalId = setInterval(function timeout() {
        if (typeof self.ws !== 'undefined'){
			request(self.ws, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				self.callback(body)
			  }
			})
        } else {
            clearInterval(intervalId);
        }
    }, interval);
};

module.exports = WSListener;