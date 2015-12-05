'use strict';

var inherits = require("util").inherits;
var exports = module.exports = {};

exports.addInheritance = function(subclass, superclass) {
    var proto = subclass.prototype;
    inherits(subclass, superclass);
    subclass.prototype.parent = superclass.prototype;
    for (var a in proto) {
        subclass.prototype[a] = proto[a];
    }
};

exports.addSupportTo = function(subclass, superclass) {
    exports.addInheritance(subclass,superclass);
};