"use strict";

var Map = require('./Map');
var defineProperties = require('./Utils').defineProperties, id = require('./Utils').id;

var NO_VALUE_YET = {};

function RichMap(factoryFunction) {
	if (factoryFunction !== undefined && typeof factoryFunction !== 'function') {
		throw new Error('Factory function must be be a function.');
	}

	var data = new Map();
	defineProperties(this, {
		'_richMapData': data,
		'_richMapFactoryFunction': factoryFunction
	});

	Object.defineProperty(this, 'size', {
		configurable: true,
		enumerable: false,
		get: (function() {
			return data.size;
		})
	});
}

defineProperties(RichMap.prototype, {
	get: function(key) {
		if (this._richMapFactoryFunction !== undefined && this._richMapData.has(key) == false) {
			this._richMapData.set(key, this._richMapFactoryFunction.apply(this, arguments));
		}
		return this._richMapData.get(key);
	},

	has: function(key) {
		return this._richMapData.has(key);
	},

	set: function(key, value) {
		var oldValue = this._richMapData.get(key);
		this._richMapData.set(key, value);
		return oldValue;
	},

	remove: function(key) {
		var oldValue = this._richMapData.get(key);
		this._richMapData['delete'](key);
		return oldValue;
	},

	clear: function() {
		return this._richMapData.clear();
	},

	allKeys: function() {
		var result = [];
		this._richMapData.forEach(function(value, key) {
			result.push(key);
		});
		return result;
	},

	allValues: function() {
		var result = [];
		this._richMapData.forEach(function(value) {
			result.push(value);
		});
		return result;
	},

	map: function(func) {
		var result;
		var factoryFunction = this._richMapFactoryFunction;
		if (factoryFunction !== undefined) {
			result = new RichMap(function() {
				return func(factoryFunction.apply(this, arguments));
			});
		} else {
			result = new RichMap();
		}

		this._richMapData.forEach(function(value, key) {
			result.set(key, func(this.get(key), key, this));
		}.bind(this));

		return result;
	},

	reduce: function(func, startingValue) {
		var currentValue = NO_VALUE_YET;
		if (arguments.length > 1) {
			currentValue = startingValue;
		}
		this._richMapData.forEach(function(value, key) {
			if (currentValue === NO_VALUE_YET) {
				currentValue = value;
			} else {
				currentValue = func(currentValue, value);
			}
		});
		return currentValue;
	},

	clone: function() {
		return this.map(id);
	},

	forEach: function(callback) {
		return this._richMapData.forEach(callback);
	},

	invert: function() {
		var MultiMap = require('./MultiMap');
		var result = new MultiMap();
		this.forEach(function(value, key) {
			result.add(value, key);
		});
		return result;
	},

	toString: function() {
		var result = [];
		this._richMapData.forEach(function(value, key) {
			result.push(key+": "+value);
		});
		return "{{\n\t" + result.join("\n\t") + "\n}}";
	}
});

module.exports = RichMap;