"use strict";

var defineProperties = require('../Utils').defineProperties;

var empty = {};

function MapEntry(key, value) {
	this.key = key;
	this.value = value;
	this.next = null;
}

MapEntry.prototype.isRemoved = function() {
	return this.key === empty;
};

function MapIterator(map, kind) {
	this.i = map._head;
	this.kind = kind;
}

MapIterator.prototype = {
	next: function() {
		var i = this.i;
		if (i !== null) {
			while (i.isRemoved()) {
				i = i.next;
			}
			i = i.next;
			this.i = i;
		}
		if (i === null) {
			throw new Error();
		}
		var kind = this.kind;
		if (kind === "key") {
			return i.key;
		}
		if (kind === "value") {
			return i.value;
		}
		return [i.key, i.value];
	}
};

function Map() {
	if (!(this instanceof Map)) throw new TypeError('Map must be called with "new"');

	var head = new MapEntry(null, null);

	defineProperties(this, {
		'_head': head,
		'_size': 0
	});

	Object.defineProperty(this, 'size', {
		configurable: true,
		enumerable: false,
		get: (function() {
			return this._size;
		}).bind(this)
	});
}

defineProperties(Map.prototype, {
	get: function(key) {
		var i = this._head;
		while ((i = i.next) !== null) {
			if (Object.is(i.key, key)) {
				return i.value;
			}
		}
		return undefined;
	},

	has: function(key) {
		var i = this._head;
		while ((i = i.next) !== null) {
			if (Object.is(i.key, key)) {
				return true;
			}
		}
		return false;
	},

	set: function(key, value) {
		var i = this._head;
		var p = i;
		while ((i = i.next) !== null) {
			if (Object.is(i.key, key)) {
				i.value = value;
				return;
			}
			p = i;
		}
		var entry = new MapEntry(key, value);
		p.next = entry;
		this._size += 1;
	},

	'delete': function(key) {
		var i = this._head;
		var p = i;
		while ((i = i.next) !== null) {
			if (Object.is(i.key, key)) {
				p.next = i.next;
				i.key = empty;
				i.value = empty;
				i.next = p;
				this._size -= 1;
				return true;
			}
			p = i;
		}
		return false;
	},

	clear: function() {
		var p = this._head;
		var i = p.next;
		this._size = 0;
		p.next = null;
		while (i !== null) {
			var x = i.next;
			i.key = empty;
			i.value = empty;
			i.next = p;
			i = x;
		}
	},

	keys: function() {
		return new MapIterator(this, "key");
	},

	values: function() {
		return new MapIterator(this, "value");
	},

	entries: function() {
		return new MapIterator(this, "key+value");
	},

	forEach: function(callback) {
		var context = arguments.length > 1 ? arguments[1] : null;
		var entireMap = this;

		var i = this._head;
		while ((i = i.next) !== null) {
			callback.call(context, i.value, i.key, entireMap);
			while (i.isRemoved()) {
				i = i.next;
			}
		}
	}
});

var global = Function("return this")();
module.exports = global.Map || Map;