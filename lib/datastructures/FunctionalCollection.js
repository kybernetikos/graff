"use strict";

var NO_VALUE_YET = {};
function id(x) {return x;}

function FunctionalCollection(newCollection, add) {
	this._fnCollConstructor = newCollection;
	this._fnCollAdd = add;
}

FunctionalCollection.prototype.clone = function() {
	return this.map(id);
};

FunctionalCollection.prototype.map = function(func) {
	var Constructor = this._fnCollConstructor;
	var add = this._fnCollAdd;

	var result = new Constructor();

	this.forEach(function(value, key) {
		add(result, func(value), key, this);
	});
	return result;
};

FunctionalCollection.prototype.reduce = function(func, starting) {
	var Constructor = this._fnCollConstructor;
	var add = this._fnCollAdd;

	var result = NO_VALUE_YET;
	if (arguments.length > 1) {
		result = starting;
	}

	this.forEach(function(value, key) {
		if (result === NO_VALUE_YET) {
			result = value;
		} else {
			result = func(result, value);
		}
	});
	return result;
};

FunctionalCollection.prototype.concat = function(other) {
	var Constructor = this._fnCollConstructor;
	var add = this._fnCollAdd;
	var result = new Constructor();

	this.forEach(function(value, key) {
		add(result, value, key, this);
	});

	other.forEach(function(value, key) {
		add(result, value, key, this);
	});

	return result;
};

FunctionalCollection.prototype.filter = function(func) {
	var Constructor = this._fnCollConstructor;
	var add = this._fnCollAdd;

	var result = new Constructor();
	this.forEach(function(value, key) {
		if (func(value, key, this) === true) {
			add(result, value, key, this);
		}
	});
	return result;
};

module.exports = FunctionalCollection;