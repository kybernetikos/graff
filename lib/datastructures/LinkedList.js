"use strict";

var NO_VALUE_YET = {};

function id(x) {return x;}

function Node(value, previous, next) {
	this.value = value;
	this.previous = previous || this;
	this.next = next || this;
}


function List() {
	this.length = 0;
	this.data = new Node(undefined);
	this.push.apply(this, arguments);
}

List.fromArray = function(array) {
	var result = new List();
	return result.concat(array);
};

List.prototype.push = function(value) {
	for (var i = 0; i < arguments.length; ++i) {
		var newNode = new Node(arguments[i], this.data.previous, this.data);
		this.data.previous.next = newNode;
		this.data.previous = newNode;
		this.length++;
	}
	return this.length;
};

/** set add - actually add-if-not-already-in*/
List.prototype.add = function(value) {
	if (this.has(value) === false) {
		this.push(value);
	}
};

List.prototype.forEach = function(func, scope) {
	var current = this.data.next;
	while (current !== this.data) {
		func.call(scope, current.value);
		current = current.next;
	}
};

List.prototype.map = function(func, scope) {
	scope = scope;
	var result = new List();
	var current = this.data.next;
	var index = 0;
	while (current !== this.data) {
		result.push(func.call(scope, current.value, index++, this));
		current = current.next;
	}
	return result;
};

List.prototype.mergeDestructive = function(list) {
	// link the end of our list with the beginning of theirs
	this.data.previous.next = list.data.next;
	// reverse link the beginning of their list to the end of ours
	list.data.next.previous = this.data.previous;
	// link the end of their list with our stopper
	list.data.previous.next = this.data;
	// reverse link our stopper with the end of their list
	this.data.previous = list.data.previous;
	// copy our stopper to that list.
	list.data = this.data;
	// update the length of both.
	this.length += list.length;
	list.length = this.length;
};

List.prototype.insertListDestructive = function(position, list) {
	var nodeBeforeInsertion = getIndexNode(this, position - 1);

	list.data.previous.next = nodeBeforeInsertion.next;
	nodeBeforeInsertion.next.previous = list.data.previous;

	nodeBeforeInsertion.next = list.data.next;
	list.data.next.previous = nodeBeforeInsertion;

	this.length += list.length;

	list.clear();
};

List.prototype.clear = function() {
	this.length = 0;
	this.data = new Node(undefined);
};

List.prototype.concat = function() {
	var result = this.map(id);

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

List.prototype.every = function(fn, scope) {
	var current = this.data.next;
	var index = 0;
	while (current !== this.data) {
		if (fn.call(scope, current.value, index++, this) !== true) {
			return false;
		}
		current = current.next;
	}
	return true;
};

List.prototype.some = function(fn, scope) {
	var current = this.data.next;
	var index = 0;
	while (current !== this.data) {
		if (fn.call(scope, current.value, index++, this) !== false) {
			return true;
		}
		current = current.next;
	}
	return false;
};

List.prototype.filter = function(fn, scope) {
	var result = new List();

	var current = this.data.next;
	var index = 0;
	while (current !== this.data) {
		if (fn.call(scope, current.value, index++, this) === true) {
			result.push(current.value);
		}
		current = current.next;
	}
	return false;
};

function getIndexNode(list, searchIndex) {
	var index = 0;
	var current = list.data.next;
	while (index < searchIndex && current !== list.data) {
		current = current.next;
		index++;
	}
	return current;
}

List.prototype.indexOf = function(searchItem, fromIndex) {
	fromIndex = fromIndex || 0;
	var current = getIndexNode(this, fromIndex);
	var index = fromIndex;
	while (current !== this.data) {
		if (current.value === searchItem) {
			return index;
		}
		index++;
		current = current.next;
	}
	return -1;
};

List.prototype.has = function(value) {
	return this.indexOf(value) >= 0;
};

List.prototype.join = function(separator) {
	return this.toArray().join(separator);
};

List.prototype.toArray = function() {
	var result = [];
	this.forEach(function(value) {
		result.push(value);
	});
	return result;
};

List.prototype.allValues = List.prototype.toArray;

List.prototype.lastIndexOf = function(searchItem, fromIndex) {
	fromIndex = fromIndex == null ? this.length - 1 : Math.min(fromIndex, this.length - 1);
	var current = getIndexNode(this, fromIndex);
	var index = fromIndex;
	while (current !== this.data) {
		if (current.value === searchItem) {
			return index;
		}
		index--;
		current = current.previous;
	}
	return -1;
};

List.prototype.pop = function() {
	var node = this.data.previous;
	if (node === this.data) {
		return undefined;
	}
	this.data.previous = node.previous;
	node.previous.next = this.data;
	this.length--;
	return node.value;
};

List.prototype.reduce = function(fn, initalValue) {
	var currentValue = NO_VALUE_YET;
	if (arguments.length > 1) {
		currentValue = initialValue;
	}
	var current = this.data.next;
	var index = 0;
	while (current !== this.data) {
		if (currentValue === NO_VALUE_YET) {
			currentValue = current.value;
		} else {
			currentValue = fn(currentValue, current.value, index, this);
		}
		current = current.next;
		index++;
	}
	return currentValue !== NO_VALUE_YET ? currentValue : undefined;
};

List.prototype.reduceRight = function(fn, initalValue) {
	var currentValue = NO_VALUE_YET;
	if (arguments.length > 1) {
		currentValue = initialValue;
	}
	var current = this.data.previous;
	var index = this.length - 1;
	while (current !== this.data) {
		if (currentValue === NO_VALUE_YET) {
			currentValue = current.value;
		} else {
			currentValue = fn(currentValue, current.value, index, this);
		}
		current = current.previous;
		index--;
	}
	return currentValue !== NO_VALUE_YET ? currentValue : undefined;
};

List.prototype.reverse = function() {
	var current = this.data.next;
	while (current !== this.data) {
		var next = current.next;
		current.next = current.previous;
		current.previous = next;
		current = next;
	}
	var next = this.data.next;
	this.data.next = this.data.previous;
	this.data.previous = next;
};

List.prototype.shift = function() {
	var current = this.data.next;
	if (current === this.data) {
		return undefined;
	}
	this.data.next = current.next;
	current.next.previous = this.data;
	return current.value;
};

List.prototype.slice = function(start, end) {
	if (start < 0) {
		start = this.length + start;
	}
	if (end < 0) {
		end = this.length + end;
	}
	var result = new List();
	var current = getIndexNode(this, start);
	var index = start;
	while (current !== this.data && index < end) {
		result.push(current.value);
		current = current.next;
		index++;
	}
	return result;
};

List.prototype.insert = function(position, value) {
	var nodeBeforeInsertion = getIndexNode(this, position - 1);

	for (var i = 1; i < arguments.length; ++i) {
		var node = new Node(arguments[i], nodeBeforeInsertion, nodeBeforeInsertion.next);
		nodeBeforeInsertion.next = node;
		node.next.previous = node;

		nodeBeforeInsertion = node;
	}
	this.length += arguments.length - 1;
}

List.prototype.splice = function(start, deleteCount) {
	var tmp = new List();
	for (var i = 2; i < arguments.length; ++i) {
		tmp.push(arguments[i]);
	}
	var deleted = new List();
	var current = getIndexNode(this, start);
	var firstDeletedNode = current;
	var lastDeletedNode = current;
	var count = 0;
	while (current !== this.data && count < deleteCount) {
		deleted.push(current.value);
		lastDeletedNode = current;
		current = current.next;
		count++;
	}

	if (tmp.length > 0) {
		firstDeletedNode.previous.next = tmp.data.next;
		tmp.data.next.previous = firstDeletedNode.previous;

		tmp.data.previous.next = lastDeletedNode.next;
		lastDeletedNode.next.previous = tmp.data.previous;
	}

	this.length = this.length - deleted.length + tmp.length;
	return deleted;
};

List.prototype.sort = function(sortFunction) {
	var sortedValues = this.toArray().sort(sortFunction);
	var tmp = List.fromArray(sortedValues);
	this.data = tmp.data;
	return this;
};

List.prototype.toString = function() {
	return this.join();
};

module.exports = List;