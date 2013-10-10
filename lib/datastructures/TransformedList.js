"use strict";

function TransformedList(base, transformFn) {
	this.base = base;
	this.transformFn = transformFn;
}

TransformedList.prototype.push = function(value) {
	throw new Error("This list is immutable");
};

/** set add - actually add-if-not-already-in*/
TransformedList.prototype.add = function(value) {
	throw new Error("This list is immutable");
};

TransformedList.prototype.forEach = function(func, scope) {
	var transformFn = this.transformFn;

	this.base.forEach(function(value) {
		func.call(scope, transformFn(value));
	}, scope)
};

TransformedList.prototype.map = function(func, scope) {
	return this.base.map(this.trasnformFn).map(func, scope);
};

TransformedList.prototype.insertTransformedListDestructive = function(position, TransformedList) {
	throw new Error("This list is immutable");
};

TransformedList.prototype.clear = function() {
	throw new Error("This list is immutable");
};

TransformedList.prototype.concat = function() {
	var result = this.map(this.transformFn);

	for (var i = 0; i < arguments.length; ++i) {
		var valueToConcat = arguments[i];
		if (typeof valueToConcat.forEach === 'function') {
			valueToConcat.forEach(function(value) {
				result.push(value);
			});
		} else {
			result.push(valueToConcat);
		}
	}
	return result;
};

TransformedList.prototype.every = function(fn, scope) {
	var list = this;
	var transformFn = this.transformFn;
	return this.base.every(function(value, index) {
		return fn.call(scope, transformFn(value), index, list);
	});
};

TransformedList.prototype.some = function(fn, scope) {
	var list = this;
	var transformFn = this.transformFn;
	return this.base.some(function(value, index) {
		return fn.call(scope, transformFn(value), index, list);
	});
};

TransformedList.prototype.filter = function(fn, scope) {
	var list = this;
	var transformFn = this.transformFn;

	return this.base.filter(function(value, index) {
		return fn.call(scope, transformFn(value), index, list);
	});
};

TransformedList.prototype.indexOf = function(searchItem, fromIndex) {
	var resultIndex = -1;
	return this.base.some(function(value, index) {
		resultIndex++;
		return index >= fromIndex && value === searchItem;
	}) ? resultIndex : -1;
};

TransformedList.prototype.has = function(value) {
	return this.indexOf(value) >= 0;
};

TransformedList.prototype.join = function(separator) {
	return this.toArray().join(separator);
};

TransformedList.prototype.toArray = function() {
	var result = [];
	this.forEach(function(value) {
		result.push(value);
	});
	return result;
};

TransformedList.prototype.allValues = TransformedList.prototype.toArray;

TransformedList.prototype.lastIndexOf = function(searchItem, fromIndex) {
	return this.reduceRight(function(accumulator, value, index) {
		if (value === searchItem) {
			return index;
		}
		return accumulator;
	}, -1);
};

TransformedList.prototype.pop = function() {
	throw new Error("This list is immutable");
};

TransformedList.prototype.reduce = function(fn, initalValue) {
	var list = this;
	var transformFn = this.transformFn;

	return this.base.reduce(function(accumulator, current, index, base) {
		return fn.call(null, accumulator, transformFn(current), index, list);
	});
};

TransformedList.prototype.reduceRight = function(fn, initalValue) {
	var list = this;
	var transformFn = this.transformFn;

	return this.base.reduceRight(function(accumulator, current, index, base) {
		return fn.call(null, accumulator, transformFn(current), index, list);
	});
};

TransformedList.prototype.reverse = function() {
	throw new Error("This list is immutable");
};

TransformedList.prototype.shift = function() {
	throw new Error("This list is immutable");
};

TransformedList.prototype.slice = function(start, end) {
	return this.base.slice(start, end).map(this.transformFn);
};

TransformedList.prototype.insert = function(position, value) {
	throw new Error("This list is immutable");
};

TransformedList.prototype.splice = function(start, deleteCount) {
	throw new Error("This list is immutable");
};

TransformedList.prototype.sort = function(sortFunction) {
	throw new Error("This list is immutable");
};

TransformedList.prototype.toString = function() {
	return this.join();
};

module.exports = TransformedList;