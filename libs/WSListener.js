"use strict";

var WebSocket = require('ws');

var WSListener = function(itemName,itemUrl,ws,log,callback) {
    this.itemName = itemName;
    this.itemUrl = itemUrl;
    this.log = log;
    this.ws = ws;
    this.callback = callback;
};

WSListener.prototype.startListener = function () {
    var self = this;

    if (typeof this.ws == 'undefined') {
        this.ws = new WebSocket(this.itemUrl.replace('http:', 'ws:') + '/state?type=json');
    }

    this.ws.on('open', function() {
        self.log("OpenHAB WS - new connection for "+self.itemName);
        self.runForever(15000);
    });

    this.ws.on('message', function(message) {
        self.log("OpenHAB WS - message from " +self.itemName+": "+ message);
        self.callback(message);
    });

    this.ws.on('close', function close() {
        self.log("OpenHAB WS - closed connection for "+self.itemName);
        self.ws = undefined;
        self = undefined;
    });
};

WSListener.prototype.runForever = function (interval) {
    var self = this;
    var intervalId = setInterval(function timeout() {
        if (typeof self.ws !== 'undefined'){
            self.ws.ping();
        } else {
            clearInterval(intervalId);
        }
    }, interval);
};

module.exports = WSListener;