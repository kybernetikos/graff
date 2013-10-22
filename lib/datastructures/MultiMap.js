"use strict";

var RichMap = require('./RichMap');
var oo = require('topiary');
var defineProperties = require('../Utils').defineProperties;

function newArray() {
	return [];
}

function MultiMap() {
	RichMap.call(this, newArray);
}

oo.extend(MultiMap, RichMap);

defineProperties(MultiMap.prototype, {
	'flatValues': function getValues(key) {
		return this.allValues().reduce(function(accumulator, value) {
			for (var i = 0; i < value.length; ++i) {
				accumulator.push(value[i]);
			}
			return accumulator;
		}, []);
	},

	'add': function(key, value) {
		this.get(key).push(value);
	},

	'remove': function(key, value) {
		if (arguments.length < 2) {
			return this._richMapData.remove(key);
		}
		if (this.has(key)) {
			var values = this.get(key);
			var index = values.indexOf(value);
			if (index >= 0) {
				values.splice(index, 1);
				return true;
			}
		}
		return false;
	},

	'filter': function filter(key, filterFunction) {
		if (this.has(key) === false) { return; }

		var originalValues = this.get(key);
		var values = originalValues.filter(filterFunction);

		if (values.length === 0) {
			this.remove(key);
		} else {
			this.set(key, values);
		}
		return originalValues;
	},

	'filterAll': function(filterFunction) {
		this.forEach(function(value, key) {
			this.filter(key, filterFunction);
		}.bind(this));
	},

	'removeLastMatch': function removeLast(key, matchFunction) {
		if (this.has(key) === false) { return false; }

		var values = this.get(key);
		for (var i = values.length - 1; i >= 0; --i) {
			if (matchFunction(values[i])) {
				values.splice(i, 1);
				return true;
			}
		}
		return false;
	}
});

module.exports = MultiMap;