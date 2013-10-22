"use strict";

var Set = require('./Set');
var defineProperties = require('../Utils').defineProperties, id = require('../Utils').id;

var NO_VALUE_YET = {};

function RichSet() {
	var data = new Set();

	for (var i = 0; i < arguments.length; ++i) {
		data.add(arguments[i]);
	}

	defineProperties(this, {
		'_richSetData': data
	});

	Object.defineProperty(this, 'size', {
		configurable: true,
		enumerable: false,
		get: (function() {
			return data.size;
		})
	});
}

defineProperties(RichSet.prototype, {
	has: function(key) {
		return this._richSetData.has(key);
	},

	add: function(key) {
		return this._richSetData.add(key);
	},

	remove: function(key) {
		return this._richSetData['delete'](key);
	},

	clear: function() {
		return this._richSetData.clear();
	},

	allValues: function() {
		var result = [];
		this._richSetData.forEach(function(value) {
			result.push(value);
		});
		return result;
	},

	forEach: function(callback) {
		return this._richSetData.forEach(callback);
	},

	map: function(func) {
		var result = new RichSet();
		this._richSetData.forEach(function(value) {
			result.add(func(value));
		});
		return result;
	},

	filter: function(filterFunction) {
		var result = new RichSet();
		this._richSetData.forEach(function(value) {
			if (filterFunction(value) === true) {
				result.add(value);
			}
		});
		return result;
	},

	reduce: function(func, startingValue) {
		var currentValue = NO_VALUE_YET;
		if (arguments.length > 1) {
			currentValue = startingValue;
		}
		this._richMapData.forEach(function(value) {
			if (currentValue === NO_VALUE_YET) {
				currentValue = value;
			} else {
				currentValue = func(currentValue, value);
			}
		});
		return currentValue;
	},

	addAll: function(otherSet) {
		otherSet.forEach(function(value) {
			this.add(value);
		}.bind(this));
	},

	removeAll: function(otherSet) {
		otherSet.forEach(function(value) {
			this.remove(value);
		}.bind(this));
	},

	clone: function() {
		return this.map(id);
	},

	toString: function() {
		return "[[ " + this.allValues().join(", ") + " ]]";
	}
});

RichSet.EMPTY = new RichSet();
RichSet.EMPTY.add = RichSet.EMPTY.remove = function() {throw new Error("This set is the immutable empty set.")};

module.exports = RichSet;