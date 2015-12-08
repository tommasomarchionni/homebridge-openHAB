"use strict";

var WebSocket = require('ws');

var WSListener = function(item, callback) {
    this.item = item;
    this.callback = callback;
};

WSListener.prototype.startListener = function () {
    var self = this;

    if (typeof this.item.ws == 'undefined') {
        this.item.ws = new WebSocket(this.item.url.replace('http:', 'ws:') + '/state?type=json');
    }

    this.item.ws.on('open', function() {
        self.item.log("OpenHAB WS - new connection for "+self.item.name);
        self.runForever(15000);
    });

    this.item.ws.on('message', function(message) {
        self.item.log("OpenHAB WS - message from " +self.item.name+": "+ message);
        self.callback(message);
    });

    this.item.ws.on('close', function close() {
        self.item.log("OpenHAB WS - closed connection for "+self.item.name);
        self.item.listener = undefined;
        self.item.ws = undefined;
    });
};

WSListener.prototype.runForever = function (interval) {
    var self = this;
    var intervalId = setInterval(function timeout() {
        if (typeof self.item.ws !== 'undefined'){
            self.item.ws.ping();
        } else {
            clearInterval(intervalId);
        }
    }, interval);
};

module.exports = WSListener;