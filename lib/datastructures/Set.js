"use strict";

var defineProperties = require('../Utils').defineProperties;

var Map = require('./Map');

var SetShim = function Set() {
	if (!(this instanceof SetShim)) throw new TypeError('Set must be called with "new"');
	defineProperties(this, {'[[SetData]]': new Map()});
	Object.defineProperty(this, 'size', {
		configurable: true,
		enumerable: false,
		get: (function() {
			return this['[[SetData]]'].size;
		}).bind(this)
	});
};

defineProperties(SetShim.prototype, {
	has: function(key) {
		return this['[[SetData]]'].has(key);
	},

	add: function(key) {
		return this['[[SetData]]'].set(key, key);
	},

	'delete': function(key) {
		return this['[[SetData]]']['delete'](key);
	},

	clear: function() {
		return this['[[SetData]]'].clear();
	},

	keys: function() {
		return this['[[SetData]]'].keys();
	},

	values: function() {
		return this['[[SetData]]'].values();
	},

	entries: function() {
		return this['[[SetData]]'].entries();
	},

	forEach: function(callback) {
		var context = arguments.length > 1 ? arguments[1] : null;
		var entireSet = this;
		this['[[SetData]]'].forEach(function(value, key) {
			callback.call(context, key, key, entireSet);
		});
	}
});

var global = Function("return this")();
module.exports = global.Set || SetShim;