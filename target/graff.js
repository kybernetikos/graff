!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.graff=e():"undefined"!=typeof global?global.graff=e():"undefined"!=typeof self&&(self.graff=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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
	// update the length.
	this.length += list.length;

	list.clear();
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
},{}],3:[function(require,module,exports){
"use strict";

var defineProperties = require('./Utils').defineProperties;

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
},{"./Utils":8}],4:[function(require,module,exports){
"use strict";

var RichMap = require('./RichMap');
var oo = require('topiary');
var defineProperties = require('./Utils').defineProperties;

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
},{"./RichMap":5,"./Utils":8,"topiary":19}],5:[function(require,module,exports){
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
},{"./Map":3,"./MultiMap":4,"./Utils":8}],6:[function(require,module,exports){
"use strict";

var Set = require('./Set');
var defineProperties = require('./Utils').defineProperties, id = require('./Utils').id;

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
},{"./Set":7,"./Utils":8}],7:[function(require,module,exports){
"use strict";

var defineProperties = require('./Utils').defineProperties;

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
},{"./Map":3,"./Utils":8}],8:[function(require,module,exports){
exports.defineProperties = function(object, map) {
	Object.keys(map).forEach(function(name) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			writable: true,
			value: map[name]
		});
	});
};

exports.id = function(x) {
	return x;
};

exports.call = function call() {
	var functionName = arguments[0];
	if (arguments.length === 0) {
		return call;
	} else if (arguments.length == 1) {
		return function() {
			var currentArgs = Array.prototype.slice.call(arguments);
			currentArgs.unshift(functionName);
			return call.apply(null, currentArgs);
		}
	}
	var scope = arguments[1];
	return scope[functionName].apply(scope, Array.prototype.slice.call(arguments, 2));
};

exports.get = function get() {
	var propertyName = arguments[0];
	if (arguments.length === 0) {
		return get;
	} else if (arguments.length == 1) {
		return function() {
			var currentArgs = Array.prototype.slice.call(arguments);
			currentArgs.unshift(propertyName);
			return get.apply(null, currentArgs);
		}
	}
	var scope = arguments[1];
	return scope[propertyName];
};
},{}],9:[function(require,module,exports){
"use strict";

var oo = require('topiary');
var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var Graph = require('./Graph');

function NOOP(){}

function BaseGraph() {}

// Graph interface implementation

BaseGraph.prototype.allVertexes = function() {
	throw new Error("Graph.allVertexes() must be implemented.");
};

BaseGraph.prototype.allEdges = function() {
	throw new Error("Graph.allEdges() must be implemented.");
};

BaseGraph.prototype.source = function(edge) {
	throw new Error("Graph.source(edge) must be implemented.");
};

BaseGraph.prototype.target = function(edge) {
	throw new Error("Graph.target(edge) must be implemented.");
};

BaseGraph.prototype.edge = function(sourceVertex, targetVertex) {
	var result = null;
	this.allEdges.forEach(function(edge) {
		if (this.source(edge) === sourceVertex && this.target(edge) === targetVertex) {
			result = edge;
		}
	}.bind(this));
	return result;
};

BaseGraph.prototype.edgesFrom = function(vertex) {
	return this.allEdges().filter(function(edge) {
		return this.source(edge) === vertex;
	}.bind(this));
};

BaseGraph.prototype.edgesTo = function(vertex) {
	return this.allEdges().filter(function(edge) {
		return this.target(edge) === vertex;
	}.bind(this));
};

BaseGraph.prototype.neighbours = function(vertex) {
	var graph = this;
	var edgesFrom = this.edgesFrom(vertex).allValues().sort(function(a, b) {
		return graph.weight(b) - graph.weight(a);
	});

	return edgesFrom.map(function(edge) {
		return graph.target(edge);
	});
};

BaseGraph.prototype.weight = function(edge) {
	return 1;
};

// Other Useful methods

BaseGraph.prototype.transpose = function() {
	var TransposedGraph = require('./TransposedGraph');
	return new TransposedGraph(this);
};

BaseGraph.prototype.weightOriented = function() {
	var WeightOrientedGraph = require('./WeightOrientedGraph');
	return new WeightOrientedGraph(this);
};

BaseGraph.prototype.stronglyConnected = function() {
	var currentIndex = 0;
	var stack = [];
	var result = [];

	function popUntil(element) {
		var idx = stack.lastIndexOf(element);
		return stack.splice(idx, stack.length - idx);
	}

	this.traverseDepthFirst(function(vertex) {
		// on discover
		this.lowLink = this.index = currentIndex++;
		stack.push(vertex);
	}, function(vertex, path, vertexData) {
		// on explored
		if (this.lowLink === this.index) {
			result.push(popUntil(vertex));
		}
		if (path.length > 0) {
			var parent = path[path.length - 1];
			var parentData = vertexData.get(parent);
			if (this.lowLink < parentData.lowLink) {
				parentData.lowLink = this.lowLink;
			}
		}
	}, function(vertex, alreadyDiscoveredVertex, path, vertexData) {
		// on loop back to an unexplored but discovered
		var loopIndex = vertexData.get(alreadyDiscoveredVertex).index;
		if (loopIndex < this.lowLink) {
			this.lowLink = loopIndex;
		}
	}, function(vertex, alreadyExploredVertex, path, vertexData) {
		// on loop back to an explored
		var loopLow = vertexData.get(alreadyExploredVertex).lowLink;
		if (loopLow < this.lowLink) {
			this.lowLink = loopLow;
		}
	});

	var FilteredGraph = require('./FilteredGraph');
	var graph = this;
	return result.map(function(connectedVertexes) {
		return FilteredGraph.limitVertexes(graph, connectedVertexes);
	});
};


BaseGraph.prototype.traverseDepthFirst = function(onDiscovery, onExplored, onUnexploredLoop, onExploredLoop) {
	onDiscovery = onDiscovery || NOOP;
	onExplored = onExplored || NOOP;
	onUnexploredLoop = onUnexploredLoop || NOOP;
	onExploredLoop = onExploredLoop || NOOP;

	var graph = this;
	var vertexData = new Map(function()  {return {};});
	var discovered = new Set();
	var explored = new Set();
	var stack = [];

	function discover(v) {
		discovered.add(v);
		onDiscovery.call(vertexData.get(v), v, stack, vertexData);
		stack.push(v);

		graph.neighbours(v).forEach(function(neighbouringVertex) {
			if (discovered.has(neighbouringVertex) === false) {
				discover(neighbouringVertex);
			} else if (explored.has(neighbouringVertex)) {
				onUnexploredLoop.call(vertexData.get(v), v,  neighbouringVertex, stack, vertexData);
			} else {
				onExploredLoop.call(vertexData.get(v), v, neighbouringVertex, stack, vertexData);
			}
		});

		explored.add(v);
		stack.pop();
		onExplored.call(vertexData.get(v), v, stack, vertexData);
	}

	graph.allVertexes().forEach(function(v) {
		if (discovered.has(v) === false) {
			discover(v);
		}
	});
};

BaseGraph.prototype.springy = function springy() {
	var global = Function('return this')();
	var Springy = global.Springy || require('springy');
	var graph = new Springy.Graph();

	var springyNodes = new Map(function(vertex) {
		var nodeData = {
			data: vertex,
			label: String(vertex)
		};
		return graph.newNode(nodeData);
	});
	var springyEdges = new Map(function(edge) {
		var weight = this.weight(edge);
		var source = springyNodes.get(this.source(edge));
		var target = springyNodes.get(this.target(edge));
		var edgeData = {
			data: edge
		};
		if (edge.color) {
			edgeData.color = edge.color;
		}
		if (edge.label) {
			edgeData.label = edge.label;
		} else if (weight !== 1) {
			edgeData.label = weight;
		}
		return graph.newEdge(source, target, edgeData);
	}.bind(this));

	this.allVertexes().forEach(function(vertex) {
		springyNodes.get(vertex);
	});
	this.allEdges().forEach(function(edge) {
		springyEdges.get(edge);
	});

	if ('on' in this) {
		this.on('added-edge', function(graph, source, target, edgeData, weight) {
			springyEdges.get(edgeData);
		});
		this.on('added-vertex', function(graph, vertexData) {
			springyNodes.get(vertexData);
		});
		this.on('remove-vertex', function(graph, vertexData) {
			var springyVertex = springyNodes.get(vertexData);
			graph.removeNode(springyVertex);
			springyNodes.remove(vertexData);
		});
		this.on('remove-edge', function(graph, edge) {
			var springyEdge = springyEdges.get(edge);
			graph.removeNode(springyEdge);
			springyEdges.remove(edge);
		});
	}
	return graph;
};


BaseGraph.prototype.toString = function() {
	var graph = this;
	return "Vertexes:\n\t"+
		graph.allVertexes().allValues().join("\n\t")+"\n"+
		"Edges:\n\t"+graph.allEdges().map(function(edge) {
			return String(graph.source(edge))+" -> "+String(graph.target(edge))+"\t\t"+String(edge)+"\t"+graph.weight(edge);
		}).allValues().join("\n\t");
};

oo.install(BaseGraph);
oo.implement(BaseGraph, Graph);

module.exports = BaseGraph;
},{"../datastructures/RichMap":5,"../datastructures/RichSet":6,"./FilteredGraph":10,"./Graph":11,"./TransposedGraph":15,"./WeightOrientedGraph":16,"springy":1,"topiary":19}],10:[function(require,module,exports){
"use strict";

var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var ProxyGraph = require('./ProxyGraph');

function FilteredGraph(parentGraph, edgeFilter, vertexFilter) {
	ProxyGraph.call(this, parentGraph);
	this._edgeFilter = edgeFilter;
	this._vertexFilter = vertexFilter;
}
ProxyGraph.extend(FilteredGraph);

FilteredGraph.limitVertexes = function(parentGraph, reducedVertexSet) {
	var _vertexes;

	if (Array.isArray(reducedVertexSet)) {
		_vertexes = new Set();
		reducedVertexSet.forEach(function(vertex) {
			_vertexes.add(vertex);
		});
	} else {
		_vertexes = reducedVertexSet;
	}
	var _vertexFilter = function(vertex) {
		return _vertexes.has(vertex);
	};

	var _edgeFilter = function(edge) {
		return _vertexFilter(parentGraph.source(edge)) && _vertexFilter(parentGraph.target(edge));
	};

	return new FilteredGraph(parentGraph, _edgeFilter, _vertexFilter);
};

FilteredGraph.limitEdges = function(parentGraph, edgeSet) {
	var allowedVertexes = new Set();
	edgeSet.forEach(function(edge) {
		allowedVertexes.add(parentGraph.source(edge));
		allowedVertexes.add(parentGraph.target(edge));
	});
	return new FilteredGraph(parentGraph, Utils.inSet(edgeSet), Utils.inSet(allowedVertexes));
};

FilteredGraph.limitWeight = function(parentGraph, minWeight, maxWeight) {
	return FilteredGraph.limitEdges(parentGraph, Utils.filterSet(parentGraph.allEdges(), function(edge) {
		var weight = parentGraph.weight(edge);
		if (minWeight != null && minWeight > weight) {
			return false;
		}

		return maxWeight == null || maxWeight >= weight;
	}));
};

FilteredGraph.prototype.allEdges = function() {
	return this._parentGraph.allEdges().filter(this._edgeFilter);
};

FilteredGraph.prototype.allVertexes = function() {
	return this._parentGraph.allVertexes().filter(this._vertexFilter);
};

FilteredGraph.prototype.source = function(edge) {
	if (this._edgeFilter(edge)) {
		return this._parentGraph.source(edge);
	}
	return null;
};

FilteredGraph.prototype.target = function(edge) {
	if (this._edgeFilter(edge)) {
		return this._parentGraph.target(edge);
	}
	return null;
};

FilteredGraph.prototype.weight = function(edge) {
	if (this._edgeFilter(edge)) {
		return this._parentGraph.weight(edge);
	}
	return null;
};

module.exports = FilteredGraph;
},{"../datastructures/RichMap":5,"../datastructures/RichSet":6,"./ProxyGraph":13}],11:[function(require,module,exports){
/**
 * @interface
 */
function Graph() {}

/**
 * Gets the edge between two different vertexes.
 *
 * @param sourceVertex
 * @param targetVertex
 */
Graph.prototype.edge = function(sourceVertex, targetVertex) {};

/**
 * Returns a set of all edges.
 */
Graph.prototype.allEdges = function() {};

/**
 * Returns a set of all edges from a particular vertex.
 * @param vertex
 */
Graph.prototype.edgesFrom = function(vertex) {};

/**
 * Returns a set of the vertexes that can be reached by traversing one edge from the provided vertex.
 * @param vertex
 */
Graph.prototype.neighbours = function(vertex) {};

/**
 * returns a set of the edges coming into the provided vertex.
 * @param vertex
 */
Graph.prototype.edgesTo = function(vertex) {};

/**
 * returns the source vertex of the provided edge.
 * @param edge
 */
Graph.prototype.source = function(edge) {};

/**
 * @returns the target vertex of the provided edge.
 * @param edge
 */
Graph.prototype.target = function(edge) {};

/**
 * @returns the weight of the provided vertex or 1.
 * @param edge
 */
Graph.prototype.weight = function(edge) {};

/**
 * @returns a set of all vertexes.
 */
Graph.prototype.allVertexes = function() {};

module.exports = Graph;
},{}],12:[function(require,module,exports){
"use strict";

var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var BaseGraph = require('./BaseGraph');

module.exports = BaseGraph.extend({
	constructor: function NullGraph() {},

	allVertexes: function() {
		return new Set();
	},

	allEdges: function() {
		return new Set();
	},

	source: function() {
		return null;
	},

	target: function() {
		return null;
	}
});
},{"../datastructures/RichMap":5,"../datastructures/RichSet":6,"./BaseGraph":9}],13:[function(require,module,exports){
var oo = require('topiary');
var BaseGraph = require('./BaseGraph');
var Graph = require('./Graph');

module.exports = BaseGraph.extend( {
	constructor: function ProxyGraph(parentGraph) {
		parentGraph = parentGraph || require('./NullGraph');

		if (oo.isA(parentGraph, Graph) === false) {
			throw new Error("Parent graph must be a graph.");
		}

		this._parentGraph = parentGraph;
	},

	allEdges: function() {
		return this._parentGraph.allEdges();
	},

	allVertexes: function() {
		return this._parentGraph.allVertexes();
	},

	source: function(edge) {
		return this._parentGraph.source(edge);
	},

	target: function(edge) {
		return this._parentGraph.target(edge);
	},

	weight: function(edge) {
		return this._parentGraph.weight(edge);
	}

});
},{"./BaseGraph":9,"./Graph":11,"./NullGraph":12,"topiary":19}],14:[function(require,module,exports){
"use strict";

var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var Emitter = require('emitter');
var BaseGraph = require('./BaseGraph');

var edgeId = 0;

module.exports = BaseGraph.extend({
	constructor: function SimpleGraph() {
		BaseGraph.call(this);
		this._sgVertexes = new Set();
		this._sgEdges = new Set();
		this._sgEdgeSource = new Map();
		this._sgEdgeTarget = new Map();
		this._sgSourceEdges = new Map();
		this._sgTargetEdges = new Map();
		this._sgWeights = new Map();
	},

	addVertex: function(vertexData) {
		if (this._sgVertexes.has(vertexData) !== false) {
			return false;
		}
		this._sgVertexes.add(vertexData);
		this.trigger('added-vertex', this, vertexData);
		this.trigger('changed', this);
		return true;
	},

	addEdge: function(source, target, weight, edgeData) {
		edgeData = edgeData || "SimpleEdge#"+(edgeId++);
		weight = weight || 1;

		this.addVertex(source);
		this.addVertex(target);
		if (!this._sgSourceEdges.has(source)) {
			this._sgSourceEdges.set(source, new Set());
		}
		if (!this._sgTargetEdges.has(target)) {
			this._sgTargetEdges.set(target, new Set());
		}
		this._sgSourceEdges.get(source).add(edgeData);
		this._sgTargetEdges.get(target).add(edgeData);
		this._sgEdgeSource.set(edgeData, source);
		this._sgEdgeTarget.set(edgeData, target);
		this._sgEdges.add(edgeData);
		this._sgWeights.set(edgeData, weight);

		this.trigger('added-edge', this, source, target, edgeData, weight);
		this.trigger('changed', this);
	},

	removeVertex: function(vertex) {
		if (this._sgVertexes.has(vertex) === false) {
			return false;
		}
		var graph = this;
		var edgesToRemove = new Set();
		edgesToRemove.addAll(this._sgSourceEdges.get(vertex));
		edgesToRemove.addAll(this._sgTargetEdges.get(vertex));
		edgesToRemove.forEach(function(edge) {
			graph.removeEdge(edge);
		});
		this._sgVertexes.remove(vertex);
		this.trigger('remove-vertex', this, vertex);
		this.trigger('changed', this);
		return true;
	},

	merge: function(graph) {
		graph.allVertexes().forEach(this.addVertex.bind(this));
		graph.allEdges().forEach(function(edge) {
			this.addEdge(graph.source(edge), graph.target(edge), graph.weight(edge), edge);
		}.bind(this));
		return this;
	},

	removeEdge: function(edgeData) {
		if (this._sgEdges.has(edgeData) === false) {
			return false;
		}
		var weight = this._sgWeights.get(edgeData);
		var source = this._sgSourceEdges.get(edgeData);
		var target = this._sgTargetEdges.get(edgeData);
		this._sgWeights.remove(edgeData);
		this._sgSourceEdges.remove(edgeData);
		this._sgTargetEdges.remove(edgeData);
		this._sgEdges.remove(edgeData);

		this.trigger('remove-edge', this, source, target, edgeData, weight);
		this.trigger('changed', this);
		return true;
	},

	incrementWeight: function(edge, amount) {
		if (this._sgEdges.has(edge) === false) {
			throw new Error('Edge '+edge+' not in graph, could not modify weight.');
		}
		this._sgWeights.set(edge, this._sgWeights.get(edge) + amount);
		this.trigger('modified-edge-weight', this, edge, this._sgWeights.get(edge), amount);
		this.trigger('changed', this);
	},

	/////////////////////////////////////////////////////////////////////////////////////////

	allVertexes: function() {
		return this._sgVertexes;
	},

	allEdges: function() {
		return this._sgEdges;
	},

	source: function(edge) {
		return this._sgEdgeSource.get(edge);
	},

	target: function(edge) {
		return this._sgEdgeTarget.get(edge);
	},

	weight: function(edge) {
		return this._sgWeights.get(edge);
	},

	/////////////////////////////////////////////////////////////////////////////////////////

	edge: function(from, to) {
		var result = null;
		var edgeTargetMap = this._sgEdgeTarget;
		this.edgesFrom(from).forEach(function(edge) {
			if (edgeTargetMap.get(edge) === to) {
				result = edge;
			}
		});
		return result;
	},

	edgesFrom: function(source) {
		return this._sgSourceEdges.get(source) || Set.EMPTY;
	},

	edgesTo: function(target) {
		return this._sgTargetEdges.get(target) || Set.EMPTY;
	}
});

Emitter.mixInto(module.exports);
},{"../datastructures/RichMap":5,"../datastructures/RichSet":6,"./BaseGraph":9,"emitter":18}],15:[function(require,module,exports){
"use strict";

var BaseGraph = require('./BaseGraph');
var ProxyGraph = require('./ProxyGraph');

module.exports = ProxyGraph.extend({
	edge: function(source, target) {
		return this._parentGraph.edge(target, source);
	},

	edgesFrom: function(vertex) {
		return this._parentGraph.edgesTo(vertex);
	},

	edgesTo: function(vertex) {
		return this._parentGraph.edgesFrom(vertex);
	},

	source: function(edge) {
		return this._parentGraph.target(edge);
	},

	target: function(edge) {
		return this._parentGraph.source(edge);
	},

	neighbours: BaseGraph.prototype.neighbours,

	transpose: function() {
		return this._parentGraph;
	}
});


},{"./BaseGraph":9,"./ProxyGraph":13}],16:[function(require,module,exports){
var FilteredGraph = require('./FilteredGraph');

function WeightOrientedGraph(parentGraph) {
	FilteredGraph.call(this, parentGraph, function(edge) {
		return this.weight(edge) != null;
	}.bind(this) , function() {return true;});
}

FilteredGraph.extend(WeightOrientedGraph);

WeightOrientedGraph.prototype.weight = function(edge) {
	var source = this._parentGraph.source(edge);
	var target = this._parentGraph.target(edge);
	var weight = this._parentGraph.weight(edge);
	var weightInOtherDirection = 0;

	var edgeInOtherDirection = this._parentGraph.edge(target, source);
	if (edgeInOtherDirection != null) {
		weightInOtherDirection = this._parentGraph.weight(edgeInOtherDirection);
	}

	var thisEdgeWeight = weight - weightInOtherDirection;

	return thisEdgeWeight >= 0 ? thisEdgeWeight : null;
};

module.exports = WeightOrientedGraph;
},{"./FilteredGraph":10}],17:[function(require,module,exports){
module.exports = {
	Graph: require('./graph/Graph'),
	SimpleGraph: require('./graph/SimpleGraph'),
	BaseGraph: require('./graph/BaseGraph'),
	Utils: require('./datastructures/Utils'),
	Set: require('./datastructures/RichSet'),
	Map: require('./datastructures/RichMap'),
	MultiMap: require('./datastructures/MultiMap'),
	LinkedList: require('./datastructures/LinkedList')
};
},{"./datastructures/LinkedList":2,"./datastructures/MultiMap":4,"./datastructures/RichMap":5,"./datastructures/RichSet":6,"./datastructures/Utils":8,"./graph/BaseGraph":9,"./graph/Graph":11,"./graph/SimpleGraph":14}],18:[function(require,module,exports){
/*global module, define*/
(function(definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(definition);
		} else {
			// some other define based function that needs the name.
			define('Emitter', definition);
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition();
	} else {
		// setting a global, as in e.g. a browser.
		this.Emitter = definition();
	}
})(function() {
	"use strict";

	var Emitter = null;
	var slice = Array.prototype.slice;
	var global = Function("return this;")();

	// Partial shim for es6 Map /////////////////////////////////////////////////////////////////////
	var Map = global.Map;

	// Uses a map for string keys and two arrays for nonstring keys.
	// Another alternative would have been to add a nonenumerable id to everything that was set.
	function MapShim() {
		this._map = [];
		this._keys = [];
		this._values = [];
	}
	MapShim.prototype = {
		'set': function set(key, value) {
			if (typeof key === 'string') {
				this._map[key] = value;
				return value;
			}
			var idx = this._keys.indexOf(key);
			if (idx < 0) {
				idx = this._keys.length;
				this._keys[idx] = key;
			}
			this._values[idx] = value;
			return value;
		},
		'get': function get(key) {
			if (typeof key === 'string') {
				return this._map[key];
			}
			return this._values[this._keys.indexOf(key)];
		},
		'delete': function(key) {
			if (typeof key === 'string') {
				delete this._map[key];
				return;
			}
			var idx = this._keys.indexOf(key);
			if (idx >= 0) {
				this._keys.splice(idx, 1);
				this._values.splice(idx, 1);
			}
		},
		'has': function(key) {
			return (typeof key === 'string' && key in this._map) || (this._keys.indexOf(key) >= 0);
		},
		'forEach': function(callback) {
			for (var key in this._map) {
				if (this._map.hasOwnProperty(key)) {
					callback(this._map[key], key, this);
				}
			}
			for (var i = this._keys.length - 1; i >= 0; --i) {
				callback(this._values[i], this._keys[i], this);
			}
		}
	};

	if (Map === undefined) {
		Map = MapShim;
	}

	// MultiMap implementation //////////////////////////////////////////////////////////////////////
	function MultiMap() {
		this._map = new Map();
	}
	MultiMap.prototype = {
		'getValues': function getValues(key) {
			var val;
			if (arguments.length === 0) {
				// return all values for all keys.
				val = [];
				this._map.forEach(function(values) {
					val.push.apply(val, values);
				});
			} else {
				// return all the values for the provided key.
				val = this._map.get(key);
				if (val === undefined) {
					val = [];
					this._map.set(key, val);
				}
			}
			return val;
		},
		'clear': function clear() {
			this._map = new Map();
		},
		'add': function add(key, value) {
			this.getValues(key).push(value);
		},
		'filter': function filter(key, filterFunction) {
			if (this._map.has(key) === false) { return; }
			var values = this._map.get(key).filter(filterFunction);

			if (values.length === 0) {
				this._map['delete'](key);
			} else {
				this._map.set(key, values);
			}
		},
		'filterAll': function(filterFunction) {
			this._map.forEach(function(values, key, map) {
				var newValues = values.filter(filterFunction);
				if (newValues.length === 0) {
					map['delete'](key);
				} else {
					map.set(key, newValues);
				}
			});
		},
		'removeLastMatch': function removeLast(key, matchFunction) {
			if (this._map.has(key) === false) { return false; }
			var values = this._map.get(key);
			for (var i = values.length - 1; i >= 0; --i) {
				if (matchFunction(values[i])) {
					values.splice(i, 1);
					return true;
				}
			}
			return false;
		},
		'hasAny': function has(key) {
			return this._map.has(key);
		},
		'delete': function del(key) {
			this._map['delete'](key);
		}
	};

	// Partial 'shams' to work around ie8s lack of es5 //////////////////////////////////////////////

	// These shams only cover the cases used within emitter.
	// When IE8 support is no longer needed, all these can be dropped in favour of the es5 methods.

	var defineProperty = function(obj, prop, descriptor) {
		obj[prop] = descriptor.value;
	};
	if (Object.defineProperty) {
		try {
			// IE8 throws an error here.
			Object.defineProperty({}, 'x', {});
			defineProperty = Object.defineProperty;
		} catch (e) {}
	}

	var create = Object.create ? Object.create : function(proto, descriptors) {
		var myConstructor = function() {};
		myConstructor.prototype = proto;

		var result = new myConstructor();

		var keys = Object.keys(descriptors);
		for (var i = 0; i < keys.length; ++i) {
			var key = keys[i];
			defineProperty(result, key, descriptors[key]);
		}

		return result;
	};

	function getPrototypeOf(obj) {
		if (Object.getPrototypeOf) {
			var proto = Object.getPrototypeOf(obj);

			// to avoid bad shams...
			if (proto !== obj) return proto;
		}

		// this is what most shams do, but sometimes it's wrong.
		if (obj.constructor && obj.constructor.prototype && obj.constructor.prototype !== obj) {
			return obj.constructor.prototype;
		}

		// this works only if we've been kind enough to supply a superclass property
		// (which we do when we extend classes).
		if (obj.constructor && obj.constructor.superclass) {
			return obj.constructor.superclass.prototype;
		}

		// can't find a good prototype.
		return null;
	}

	///////////////////////////////////////////////////////////////////////////
	var ONCE_FUNCTION_MARKER = {};

	function notify(listeners, args) {
		if (listeners.length === 0) { return false; }
		// take a copy in case one of the callbacks modifies the listeners array.
		listeners = listeners.slice();
		for (var i = 0, len = listeners.length; i < len; ++i) {
			var listener = listeners[i];
			listener.callback.apply(listener.context, args);
		}
		return true;
	}

	function notifyRemoves(emitter, listenerRecords) {
		for (var i = 0, len = listenerRecords.length; i < len; ++i) {
			var listenerRecord = listenerRecords[i];
			emitter.trigger(new RemoveListenerEvent(listenerRecord.eventIdentifier, listenerRecord.callback, listenerRecord.registeredContext));
		}
	}

	/**
	 * This constructor function can be used directly, but most commonly, you will
	 * call it from within your own constructor.
	 *
	 * e.g. <code>Emitter.call(this);</code>
	 *
	 * It will set up the emitter state if called, but it is optional.
	 *
	 * @constructor
	 * @class Emitter
	 * @classdesc
	 * Emitter provides event emitting capabilities, similar to Backbone.
	 * For more information see <a href="http://caplin.github.io/Emitter">the project page</a>.
	 */
	Emitter = function Emitter() {
		this._emitterListeners = new MultiMap();
		this._emitterMetaEventsOn = false;
	};

	Emitter.prototype = {
		/**
		 * Registers a listener for an event.
		 *
		 * If context is provided, then the <code>this</code> pointer will refer to it
		 * inside the callback.
		 *
		 * @param {*} eventIdentifier The identifier of the event that the callback should listen to.
		 * @param {function} callback The function that should be called whenever the event is triggered.  May not be null.
		 * @param {?Object} [context] An optional context that defines what 'this' should be inside the callback.
		 */
		on: function listen(eventIdentifier, callback, context) {
			if (typeof callback !== 'function') { throw new TypeError("on: Illegal Argument: callback must be a function, was " + (typeof callback)); }

			// This allows us to work even if the constructor hasn't been called.  Useful for mixins.
			if (this._emitterListeners === undefined) {
				this._emitterListeners = new MultiMap();
			}

			if (typeof eventIdentifier === 'function' && (eventIdentifier.prototype instanceof  MetaEvent || eventIdentifier === MetaEvent)) {
				// Since triggering meta events can be expensive, we only
				// do so if a listener has been added to listen to them.
				this._emitterMetaEventsOn = true;
			}

			this._emitterListeners.add(eventIdentifier, {
				eventIdentifier: eventIdentifier,
				callback: callback,
				registeredContext: context,
				context: context !== undefined ? context : this
			});

			if (this._emitterMetaEventsOn === true) {
				this.trigger(new AddListenerEvent(eventIdentifier, callback._onceFunctionMarker === ONCE_FUNCTION_MARKER ? callback._wrappedCallback : callback, context));
			}
		},

		/**
		 * Registers a listener to receive an event only once.
		 *
		 * If context is provided, then the <code>this</code> pointer will refer to it
		 * inside the callback.
		 *
		 * @param {*} eventIdentifier The identifier of the event that the callback should listen to.
		 * @param {function} callback The function that should be called the first time the event is triggered.  May not be null.
		 * @param {?Object} [context] An optional context that defines what 'this' should be inside the callback.
		 */
		once: function(eventIdentifier, callback, context) {
			if (typeof callback !== 'function') { throw new TypeError("onnce: Illegal Argument: callback must be a function, was " + (typeof callback)); }

			var off = this.off.bind(this), hasFired = false;

			function onceEventHandler() {
				if (hasFired === false) {
					hasFired = true;
					off(eventIdentifier, onceEventHandler, context);
					callback.apply(this, arguments);
				}
			}
			// We need this to enable us to remove the wrapping event handler
			// when off is called with the original callback.
			onceEventHandler._onceFunctionMarker = ONCE_FUNCTION_MARKER;
			onceEventHandler._wrappedCallback = callback;

			this.on(eventIdentifier, onceEventHandler, context);
		},

		/**
		 * Clear previously registered listeners.
		 *
		 * With no arguments, this clears all listeners from this Emitter.
		 *
		 * With one argument, this clears all listeners registered to a particular event.
		 *
		 * With two or three arguments, this clears a specific listener.
		 *
		 * @param {?*} eventIdentifier The identifier of the event to clear. If null, it will clear all events.
		 * @param {?function} callback The callback function to clear.
		 * @param {?Object} context The context object for the callback.
		 * @returns {boolean} true if any listeners were removed.  This is not finalised yet and may change (particularly if we want to enable chaining).
		 */
		off: function off(eventIdentifier, callback, context) {
			// not initialised - so no listeners of any kind
			if (this._emitterListeners == null) { return false; }

			if (arguments.length === 0) {
				// clear all listeners.
				if (this._emitterMetaEventsOn === true) {
					var allListeners = this._emitterListeners.getValues();
					notifyRemoves(this, allListeners);
				}
				this._emitterListeners.clear();
				return true;
			} else if (arguments.length === 1) {
				// clear all listeners for a particular eventIdentifier.
				if (this._emitterListeners.hasAny(eventIdentifier)) {
					var listeners = this._emitterListeners.getValues(eventIdentifier);
					this._emitterListeners['delete'](eventIdentifier);
					if (this._emitterMetaEventsOn === true) {
						notifyRemoves(this, listeners);
					}
					return true;
				}
				return false;
			} else if (eventIdentifier === null && callback === null) {
				// clear all listeners for a particular context.
				return this.clearListeners(context);
			} else {
				// clear a specific listener.
				if (typeof callback !== 'function') { throw new TypeError("off: Illegal Argument: callback must be a function, was " + (typeof callback)); }

				var removedAListener = this._emitterListeners.removeLastMatch(eventIdentifier, function(record) {
					var callbackToCompare = record.callback._onceFunctionMarker === ONCE_FUNCTION_MARKER ? record.callback._wrappedCallback : record.callback;
					var callbackMatches = callback === callbackToCompare;
					var contextMatches = record.registeredContext === context;
					return callbackMatches && contextMatches;
				});

				if (removedAListener && this._emitterMetaEventsOn === true) {
					this.trigger(new RemoveListenerEvent(eventIdentifier, callback, context));
				}
				return removedAListener;
			}
		},

		/**
		 * Fires an event, causing all the listeners registered for this event to be called.
		 *
		 * If the event is an object, this will also call any listeners registered for
		 * its class or any superclasses will also fire.
		 *
		 * @param {*} event The event to fire.
		 * @param {...*} [args] Optional arguments to pass to the listeners.
		 * @returns {boolean} true if any listeners were notified, false otherwise.  This is not finalised and may change (particularly if we want to allow chaining).
		 */
		trigger: function trigger(event) {
			var args;
			var anyListeners = false;
			if (this._emitterListeners != null) {
				args = slice.call(arguments, 1);
				if (this._emitterListeners.hasAny(event)) {
					anyListeners = true;
					notify(this._emitterListeners.getValues(event), args);
				}

				// navigate up the prototype chain emitting against the constructors.
				if (typeof event === 'object') {
					var last = event, proto = getPrototypeOf(event);
					while (proto !== null && proto !== last) {
						if (this._emitterListeners.hasAny(proto.constructor)) {
							anyListeners = true;
							notify(this._emitterListeners.getValues(proto.constructor), arguments);
						}
						last = proto;
						proto = getPrototypeOf(proto);
					}
				}
			}
			if (this._emitterMetaEventsOn === true && anyListeners === false && event instanceof DeadEvent === false) {
				this.trigger(new DeadEvent(event, args));
			}
			return anyListeners;
		},

		/**
		 * Clears all listeners registered for a particular context.
		 *
		 * @param {Object} context The context that all listeners should be removed for.  May not be null.
		 */
		clearListeners: function clearListeners(context) {
			if (context == null) { throw new Error('clearListeners: context must be provided.'); }
			// notify for every listener we throw out.
			var removedListeners, trackRemovals = false;
			if (this._emitterMetaEventsOn === true) {
				trackRemovals = true;
				removedListeners = [];
			}
			this._emitterListeners.filterAll(function(record) {
				var keepListener = record.registeredContext !== context;
				if (trackRemovals && keepListener === false) {
					removedListeners.push(record);
				}
				return keepListener;
			});
			if (trackRemovals && removedListeners.length > 0) {
				notifyRemoves(this, removedListeners);
			}
		}
	};

	/**
	 * Copies the Emitter methods onto the provided object.
	 *
	 * If the passed destination is a function, it copies the methods
	 * onto the prototype of the passed destination.
	 *
	 * @param {function|Object} destination the object to copy the Emitter
	 *    methods to or the constructor that should have its prototype
	 *    augmented with the Emitter methods.
	 */
	Emitter.mixInto = function(destination) {
		if (typeof destination === 'function') {
			destination = destination.prototype;
		}
		for (var key in Emitter.prototype) {
			// If in the future Emitter is changed to inherit from something,
			// we would want to copy those methods/properties too.
			//noinspection JSUnfilteredForInLoop
			if (destination.hasOwnProperty(key)) {
				throw new Error("Emitter.mixInto: Destination already has function " + key + " unable to mixin.");
			}
			//noinspection JSUnfilteredForInLoop
			destination[key] = Emitter.prototype[key];
		}
	};

	// Event and MetaEvent Hierarchy ///////////////////////////////////////////////////////

	/**
	 * Creates a base Event object.
	 * @constructor
	 * @memberOf Emitter
	 * @class Event
	 * @classdesc
	 * Event provides a convenient base class for events.
	 */
	var Event = function() {};

	/**
	 * Extend provides a shorthand for creating subclasses of the class
	 * whose constructor it is attached to.
	 *
	 * You can pass in an object that represents the things that
	 * should be added to the prototype (in which case, the special
	 * member 'constructor' if present will become the constructor),
	 * or a function that represents the constructor whose prototype
	 * should be modified, or nothing at all, in which case a new
	 * constructor will be created that calls the superclass constructor.
	 *
	 * @memberOf Emitter.Event
	 * @param {object|function} [properties] an object containing methods to be added to the prototype, or the constructor function, or nothing at all.
	 * @returns {function} a constructor function for the newly created subclass.
	 */
	Event.extend = function inlineExtend(properties) {
		var superclass = this, subclassConstructor;
		if (typeof superclass !== 'function') { throw new TypeError("extend: Superclass must be a constructor function, was a " + typeof superclass); }

		if (typeof properties === 'function') {
			subclassConstructor = properties;
		} else if (properties != null && properties.hasOwnProperty('constructor')) {
			subclassConstructor = properties.constructor;
		} else {
			subclassConstructor = function() {
				superclass.apply(this, arguments);
			};
		}
		subclassConstructor.superclass = superclass;
		subclassConstructor.prototype = create(superclass.prototype, {
			constructor: {
				enumerable: false, value: subclassConstructor
			}
		});

		if (typeof properties === 'object') {
			if (getPrototypeOf(properties) !== Object.prototype) {
				throw new Error("extend: Can't extend something that already has a prototype chain.");
			}
			for (var instanceProperty in properties) {
				if (instanceProperty !== 'constructor' && properties.hasOwnProperty(instanceProperty)) {
					subclassConstructor.prototype[instanceProperty] = properties[instanceProperty];
				}
			}
		}
		for (var staticProperty in superclass) {
			if (superclass.hasOwnProperty(staticProperty)) {
				subclassConstructor[staticProperty] = superclass[staticProperty];
			}
		}

		return subclassConstructor;
	};
	/**
	 * A simple toString is provided to aid in debuging.
	 * @returns {string} a representation of all the fields on the object.
	 */
	Event.prototype.toString = function() {
		var result = [];
		for (var key in this) {
			// toString should show inherited properties too.
			//noinspection JSUnfilteredForInLoop
			if (typeof result[key] !== 'function') {
				//noinspection JSUnfilteredForInLoop
				result.push(key + ": " + this[key] + ",");
			}
		}
		return result.join(" ");
	};

	Emitter.Event = Event;

	var MetaEvent = Event.extend(
		/**
		 * @memberOf Emitter.meta
		 * @class MetaEvent
		 * @param {*} event The event this MetaEvent is about
		 * @classdesc
		 * A parent class for all meta events.
		 */
		function(event) {
			/**
			 * Event provides the identifier of the event that this MetaEvent is about.
			 * @name Emitter.meta.MetaEvent#event
			 * @type {*}
			 */
			this.event = event;
		}
	);
	/**
	 * @memberOf Emitter.meta
	 * @extends Emitter.meta.MetaEvent
	 * @class ListenerEvent
	 * @classdesc
	 * A parent class for all MetaEvents about listeners.
	 */
	var ListenerEvent = MetaEvent.extend(
		function(event, listener, context) {
			MetaEvent.call(this, event);
			/**
			 * The listener this ListenerEvent is about.
			 * @name Emitter.meta.ListenerEvent#listener
			 * @type {function}
			 */
			this.listener = listener;
			/**
			 * The context associated with the listener.
			 * @name Emitter.meta.ListenerEvent#context
			 * @type {?object}
			 */
			this.context = context;
		}
	);
	/**
	 * @memberOf Emitter.meta
	 * @class AddListenerEvent
	 * @extends Emitter.meta.ListenerEvent
	 */
	var AddListenerEvent = ListenerEvent.extend();
	/**
	 * @memberOf Emitter.meta
	 * @class RemoveListenerEvent
	 * @extends Emitter.meta.ListenerEvent
	 */
	var RemoveListenerEvent = ListenerEvent.extend();
	/**
	 * @memberOf Emitter.meta
	 * @class DeadEvent
	 * @extends Emitter.meta.MetaEvent
	 */
	var DeadEvent = MetaEvent.extend(
		function(event, args) {
			MetaEvent.call(this, event);
			this.data = args;
		}
	);

	/**
	 * Where the meta events live.
	 * @memberOf Emitter
	 * @namespace meta
	 */
	Emitter.meta = {
		MetaEvent: MetaEvent,
		ListenerEvent: ListenerEvent,
		AddListenerEvent: AddListenerEvent,
		RemoveListenerEvent: RemoveListenerEvent,
		DeadEvent: DeadEvent
	};

	return Emitter;
});
},{}],19:[function(require,module,exports){
/**
 * @namespace
 * The topiary namespace contains a number of functions for
 * creating and querying a class hierarchy.
 * @name topiary
 */
;(function (definition) {
	// export mechanism that works in node, browser and some other places.
	if (typeof define === "function") {
		if (define.amd) {
			define(definition);
		} else {
			define('topiary', definition);
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition();
	} else {
		// setting a global, as in e.g. a browser.
		this.topiary = definition();
	}
})(function () {
	"use strict";

	var ERROR_MESSAGES = {
		SUBCLASS_NOT_CONSTRUCTOR: "Subclass was not a constructor.",
		SUPERCLASS_NOT_CONSTRUCTOR: "Superclass was not a constructor when extending {0}.",
		PROTOTYPE_NOT_CLEAN: 'Prototype must be clean to extend another class. {1} has already been defined on the prototype of {0}.',
		NOT_CONSTRUCTOR: '{0} definition for {1} must be a constructor, was {2}.',
		DOES_NOT_IMPLEMENT: "Class {0} does not implement the attributes '{1}' from protocol {2}.",
		PROPERTY_ALREADY_PRESENT: 'Could not copy {0} from {1} to {2} as it was already present.',
		NULL: "{0} for {1} must not be null or undefined.",
		ALREADY_PRESENT: 'Could not copy {0} from {1} to {2} as it was already present.',
		WRONG_TYPE: '{0} for {1} should have been of type {2}, was {3}.',
		TWO_CONSTRUCTORS: "Two different constructors provided for {0}, use only one of the classDefinition argument and extraProperties.constructor.",
		BAD_INSTALL: "Can only install to the global environment or a constructor, can't install to a {0}."
	};

	// Main API ////////////////////////////////////////////////////////////////////////////////////

	// only used for compatibility with shimmed, non es5 browsers.
	var internalUseNames = ["__multiparents__", "__interfaces__", "__assignable_from_cache__", "__id__"];

	/**
	 * Sets up the prototype chain for inheritance.
	 *
	 * <p>As well as setting up the prototype chain, this also copies so called 'class'
	 * definitions from the superclass to the subclass and makes sure that constructor
	 * will return the correct thing.</p>
	 *
	 * @throws Error if the prototype has been modified before extend is called.
	 *
	 * @memberOf topiary
	 * @param {?function} classDefinition The constructor of the subclass.
	 * @param {!function} superclass The constructor of the superclass.
	 * @param {?object} [extraProperties] An object of extra properties to add to the subclasses prototype.
	 */
	function extend(classDefinition, superclass, extraProperties) {
		var subclassName = className(classDefinition, "Subclass");

		// Find the right classDefinition - either the one provided, a new one or the one from extraProperties.
		var extraPropertiesHasConstructor = extraProperties !== undefined && extraProperties.hasOwnProperty("constructor") && typeof extraProperties.constructor === 'function';
		if (classDefinition != null) {
			if (extraPropertiesHasConstructor && classDefinition !== extraProperties.constructor) {
				throw new Error(msg(ERROR_MESSAGES.TWO_CONSTRUCTORS, subclassName));
			}
		} else if (extraPropertiesHasConstructor) {
			classDefinition = extraProperties.constructor;
		} else {
			classDefinition = function() {
				superclass.apply(this, arguments);
			};
		}

		// check arguments
		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.SUBCLASS_NOT_CONSTRUCTOR);
		assertArgumentOfType('function', superclass, ERROR_MESSAGES.SUPERCLASS_NOT_CONSTRUCTOR, subclassName);
		assertNothingInObject(classDefinition.prototype, ERROR_MESSAGES.PROTOTYPE_NOT_CLEAN, subclassName);

		// copy class properties
		for (var staticPropertyName in superclass) {
			if (superclass.hasOwnProperty(staticPropertyName)) {
				// this is because we shouldn't copy nonenumerables, but removing enumerability isn't
				// shimmable in ie8.  We need to make sure we don't inadvertently copy across any
				// of the 'internal' fields we are using to keep track of things.
				if (internalUseNames.indexOf(staticPropertyName) >= 0) {
					continue;
				}

				classDefinition[staticPropertyName] = superclass[staticPropertyName];
			}
		}

		// create the superclass property on the subclass constructor
		defineProperty(classDefinition, 'superclass', { enumerable: false, value: superclass });

		// create the prototype with a constructor function.
		classDefinition.prototype = create(superclass.prototype, {
			"constructor": { enumerable: false,	value: classDefinition }
		});

		// copy everything from extra properties.
		if (extraProperties != null) {
			for (var property in extraProperties) {
				if (extraProperties.hasOwnProperty(property) && property !== 'constructor') {
					classDefinition.prototype[property] = extraProperties[property];
				}
			}
		}

		// this is purely to work around a bad ie8 shim, when ie8 is no longer needed it can be deleted.
		if (classDefinition.prototype.hasOwnProperty("__proto__")) {
			delete classDefinition.prototype["__proto__"];
		}

		return classDefinition;
	}

	/**
	 * Mixes functionality in to a class.
	 *
	 * <p>Only functions are mixed in.</p>
	 *
	 * <p>Code in the mixin is sandboxed and only has access to a 'mixin instance' rather than
	 * the real instance.</p>
	 *
	 * @memberOf topiary
	 * @param {function} target
	 * @param {function|Object} mix
	 */
	function mixin(target, mix) {
		assertArgumentOfType('function', target, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Target', 'mixin');

		mix = toFunction(mix, new TypeError(msg(ERROR_MESSAGES.WRONG_TYPE, 'Mix', 'mixin', 'non-null object or function', mix === null ? 'null' : typeof mix)));
		var targetPrototype = target.prototype, mixinProperties = mix.prototype, resultingProperties = {};
		var mixins = nonenum(target, '__multiparents__', []);
		var myMixId = mixins.length;

		for (var property in mixinProperties) {
			// property might spuriously be 'constructor' if you are in ie8 and using a shim.
			if (typeof mixinProperties[property] === 'function' && property !== 'constructor') {
				if (property in targetPrototype === false) {
					resultingProperties[property] = getSandboxedFunction(myMixId, mix, mixinProperties[property]);
				} else if (targetPrototype[property].__original__ !== mixinProperties[property]) {
					throw new Error(msg(ERROR_MESSAGES.PROPERTY_ALREADY_PRESENT, property, className(mix, 'mixin'), className(target, 'target')));
				}
			} // we only mixin functions
		}

		copy(resultingProperties, targetPrototype);
		mixins.push(mix);
		return target;
	}

	/**
	 * Provides multiple inheritance through copying.
	 *
	 * <p>This is discouraged; you should prefer to use aggregation first,
	 * single inheritance (extends) second, mixins third and this as
	 * a last resort.</p>
	 *
	 * @memberOf topiary
	 * @param {function} target the class that should receive the functionality.
	 * @param {function|Object} parent the parent that provides the functionality.
	 */
	function inherit(target, parent) {
		assertArgumentOfType('function', target, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Target', 'inherit');
		parent = toFunction(parent, new TypeError(msg(ERROR_MESSAGES.WRONG_TYPE, 'Parent', 'inherit', 'non-null object or function', parent === null ? 'null' : typeof parent)));

		if (isAssignableFrom(target, parent)) {
			return target;
		}

		var resultingProperties = {};
		var targetPrototype = target.prototype;
		for (var propertyName in parent.prototype) {
			// These properties should be nonenumerable in modern browsers, but shims might
			// create them in ie8.
			if (propertyName === "constructor" || propertyName === "__proto__") continue;

			var notInTarget = targetPrototype[propertyName] === undefined;
			var parentHasNewerImplementation = notInTarget || isOverriderOf(propertyName, parent, target);
			if (parentHasNewerImplementation) {
				resultingProperties[propertyName] = parent.prototype[propertyName];
			} else {
				var areTheSame = targetPrototype[propertyName] === parent.prototype[propertyName];
				var targetIsUpToDate = areTheSame || isOverriderOf(propertyName, target, parent);
				if (targetIsUpToDate === false) {
					// target is not up to date, but we can't bring it up to date.
					throw new Error(msg(ERROR_MESSAGES.ALREADY_PRESENT, propertyName, className(parent, 'parent'), className(target, 'target')));
				}
				// otherwise we don't need to do anything.
			}
		}

		copy(resultingProperties, targetPrototype);
		var multiparents = nonenum(target, '__multiparents__', []);
		multiparents.push(parent);
		return target;
	}

	/**
	 * Declares that the provided class implements the provided protocol.
	 *
	 * <p>This involves checking that it does in fact implement the protocol and updating an
	 * internal list of interfaces attached to the class definition.</p>
	 *
	 * <p>It should be called after implementations are provided, i.e. at the end of the class definition.</p>
	 *
	 * @throws Error if there are any attributes on the protocol that are not matched on the class definition.
	 *
	 * @memberOf topiary
	 * @param {function} classDefinition A constructor that should create objects matching the protocol.
	 * @param {function} protocol A constructor representing an interface that the class should implement.
	 */
	function implement(classDefinition, protocol) {
		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Class', 'implement');
		assertArgumentOfType('function', protocol, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Protocol', 'implement');

		var interfaces = nonenum(classDefinition, '__interfaces__', []);
		var missing = missingAttributes(classDefinition, protocol);
		if (missing.length > 0) {
			throw new Error(msg(ERROR_MESSAGES.DOES_NOT_IMPLEMENT, className(classDefinition, "provided"), missing.join("', '"), className(protocol, "provided")));
		} else {
			interfaces.push(protocol);
		}
		return classDefinition;
	}

	/** @private */
	function fallbackIsAssignableFrom(classDefinition, parent) {
		if (classDefinition === parent || classDefinition.prototype instanceof parent) {
			return true;
		}
		var i, mixins = classDefinition.__multiparents__ || [], interfaces = classDefinition.__interfaces__ || [];

		// parent
		var superPrototype = (classDefinition.superclass && classDefinition.superclass.prototype) || getPrototypeOf(classDefinition.prototype);
		if (superPrototype != null && superPrototype !== classDefinition.prototype && isAssignableFrom(superPrototype.constructor, parent)) {
			return true;
		}

		// mixin chain
		for (i = 0; i < mixins.length; ++i) {
			if (isAssignableFrom(mixins[i], parent)) {
				return true;
			}
		}
		// interfaces chain
		for (i = 0; i < interfaces.length; ++i) {
			if (isAssignableFrom(interfaces[i], parent)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks to see if a class is a descendant of another class / interface / mixin.
	 *
	 * <ul><li>A class is a descendant of another class if the other class is in its prototype chain.
	 * </li><li>A class is a descendant of an interface if it has called implement that class or
	 * any class that this class is a descendant of has called implement for that class.
	 * </li><li>A class is a descendant of a mixin if it has called mixin for that mixin or
	 * any class that this class is a descendant of has called mixin for that mixin.
	 * </li></ul>
	 *
	 * @memberOf topiary
	 * @param {function} classDefinition the child class.
	 * @param {function} constructor the class to check if this class is a descendant of.
	 * @returns {boolean} true if the class is a descendant, false otherwise.
	 */
	function isAssignableFrom(classDefinition, constructor) {
		// sneaky edge case where we're checking against an object literal we've mixed in or against a prototype of something.
		if (typeof constructor === 'object' && constructor.hasOwnProperty('constructor')) { constructor = constructor.constructor; }

		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Class', 'isAssignableFrom');
		assertArgumentOfType('function', constructor, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Parent', 'isAssignableFrom');

		// This is just a caching wrapper around fallbackIsAssignableFrom.
		var cache = nonenum(classDefinition, '__assignable_from_cache__', {});
		var parentId = classId(constructor);
		if (cache[parentId] == null) {
			cache[parentId] = fallbackIsAssignableFrom(classDefinition, constructor);
		}
		return cache[parentId];
	}

	/**
	 * Checks to see if an instance is defined to be a child of a parent.
	 *
	 * @memberOf topiary
	 * @param {Object} instance An instance object to check.
	 * @param {function} parent A potential parent (see isAssignableFrom).
	 * @returns {boolean} true if this instance has been constructed from something that is assignable from the parent or is null, false otherwise.
	 */
	function isA(instance, parent) {
		// sneaky edge case where we're checking against an object literal we've mixed in or against a prototype of something.
		if (typeof parent == 'object' && parent.hasOwnProperty('constructor')) { parent = parent.constructor; }
		assertArgumentOfType('function', parent, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Parent', 'isA');
		if (instance == null) return false;
		if (instance instanceof parent) {
			return true;
		}
		return isAssignableFrom(instance.constructor, parent);
	}

	/**
	 * Does duck typing to determine if an instance object implements a protocol.
	 * <p>The protocol may be either an adhoc protocol, in which case it is an object
	 * or it can be a formal protocol in which case it's a function.</p>
	 *
	 * <p>In an adhoc protocol, you can use Number, Object, String and Boolean to indicate
	 * the type required on the instance.</p>
	 *
	 * @memberOf topiary
	 * @param {Object} instance the object to check.
	 * @param {function|Object} protocol the description of the properties that the object should have.
	 * @returns {boolean} true if all the properties on the protocol were on the instance and of the right type.
	 */
	function fulfills(instance, protocol) {
		assertArgumentNotNullOrUndefined(instance, ERROR_MESSAGES.NULL, 'Object', 'fulfills');
		assertArgumentNotNullOrUndefined(protocol, ERROR_MESSAGES.NULL, 'Protocol', 'fulfills');

		var protocolIsConstructor = typeof protocol === 'function';
		if (protocolIsConstructor && isA(instance, protocol)) {
			return true;
		}

		var requirement = protocolIsConstructor ? protocol.prototype : protocol;
		for (var item in requirement) {
			var type = typeof instance[item];
			var required = requirement[item];
			if (type !== typeof required) {
				if (type === 'number' && required === Number) {
					return true;
				} else if (type === 'object' && required === Object) {
					return true;
				} else if (type === 'string' && required === String) {
					return true;
				} else if (type === 'boolean' && required === Boolean) {
					return true;
				}
				return false;
			}
		}
		return true;
	}

	/**
	 * Checks that a class provides a prototype that will fulfil a protocol.
	 *
	 * @memberOf topiary
	 * @param {function} classDefinition
	 * @param {function|Object} protocol
	 * @returns {boolean}
	 */
	function classFulfills(classDefinition, protocol) {
		assertArgumentNotNullOrUndefined(classDefinition, ERROR_MESSAGES.NULL, 'Class', 'classFulfills');
		assertArgumentNotNullOrUndefined(protocol, ERROR_MESSAGES.NULL, 'Protocol', 'classFulfills');
		return fulfills(classDefinition.prototype, protocol);
	}

	// Auxillaries /////////////////////////////////////////////////////////////////////////////////

	var slice = Array.prototype.slice;

	function assertArgumentOfType(type, argument) {
		var actualType = typeof argument;
		if (actualType !== type) {
			var args = slice.call(arguments, 2);
			args.push(actualType);
			throw new TypeError(msg.apply(null, args));
		}
	}

	function assertNothingInObject(object) {
		for (var propertyName in object) {
			var args = slice.call(arguments, 1);
			args.push(propertyName);
			throw new Error(msg.apply(null, args));
		}
	}

	function assertArgumentNotNullOrUndefined(item) {
		if (item == null) {
			var args = slice.call(arguments, 1);
			throw new TypeError(msg.apply(null, args));
		}
	}

	function isOverriderOf(propertyName, sub, ancestor) {
		if (sub.prototype[propertyName] === ancestor.prototype[propertyName]) return false;
		var parents = getImmediateParents(sub);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents[i];
			if (parent.prototype[propertyName] === ancestor.prototype[propertyName]) return true;
			if (isOverriderOf(propertyName, parent, ancestor)) return true;
		}
		return false;
	}

	function getImmediateParents(sub) {
		var parents = (sub.__multiparents__ || []).slice();
		var parentPrototype = (sub.superclass && sub.superclass.prototype) || getPrototypeOf(sub.prototype);
		if (parentPrototype !== null && parentPrototype.constructor !== null && parentPrototype.constructor !== sub) {
			parents.push(parentPrototype.constructor);
		}
		return parents;
	}

	/**
	 * Interpolates a string with the arguments, used for error messages.
	 * @private **/
	function msg(str) {
		if (str == null) { return null; }
		for (var i = 1, len = arguments.length; i < len; ++i) {
			str = str.replace("{" + (i - 1) + "}", String(arguments[i]));
		}
		return str;
	}

	/**
	 * Returns a nonenumerable property if it exists, or creates one
	 * and returns that if it does not.
	 * @private
	 */
	function nonenum(object, propertyName, defaultValue) {
		var value = object[propertyName];
		if (value === undefined) {
			value = defaultValue;
			defineProperty(object, propertyName, {
				enumerable: false,
				value: value
			});
		}
		return value;
	}

	/**
	 * Easier for us if we treat everything as functions with prototypes.
	 * This function makes plain objects behave that way.
	 * @private
	 */
	function toFunction(obj, couldNotCastError) {
		if (obj == null) throw couldNotCastError;
		var result;
		if (typeof obj === 'object') {
			if (obj.hasOwnProperty('constructor')) {
				if (obj.constructor.prototype !== obj) throw couldNotCastError;
				result = obj.constructor;
			} else {
				var EmptyInitialiser = function () {};
				EmptyInitialiser.prototype = obj;
				defineProperty(obj, 'constructor', {
					enumerable: false, value: EmptyInitialiser
				});
				result = EmptyInitialiser;
			}
		} else if (typeof obj === 'function') {
			result = obj;
		} else {
			throw couldNotCastError;
		}
		return result;
	}

	/** @private */
	var currentId = 0;
	/**
	 * Returns the nonenumerable property __id__ of an object
	 * if it exists, otherwise adds one and returns that.
	 * @private
	 */
	function classId(func) {
		var result = func.__id__;
		if (result == null) {
			result = nonenum(func, '__id__', currentId++);
		}
		return result;
	}

	var nameFromToStringRegex = /^function\s?([^\s(]*)/;

	/**
	 * Gets the classname of an object or function if it can.  Otherwise returns the provided default.
	 *
	 * Getting the name of a function is not a standard feature, so while this will work in many
	 * cases, it should not be relied upon except for informational messages (e.g. logging and Error
	 * messages).
	 *
	 * @private
	 */
	function className(object, defaultName) {
		if (object == null) {
			return defaultName;
		}
		var result = "";
		if (typeof object === 'function') {
			if (object.name) {
				result = object.name;
			} else {
				var match = object.toString().match(nameFromToStringRegex);
				if (match !== null) {
					result = match[1];
				}
			}
		} else if (typeof object.constructor === 'function') {
			result = className(object.constructor, defaultName);
		}
		return result || defaultName;
	}

	/**
	 * Returns an array of all of the properties on a protocol that are not on classdef
	 * or are of a different type on classdef.
	 * @private
	 */
	function missingAttributes(classdef, protocol) {
		var result = [], obj = classdef.prototype, requirement = protocol.prototype;
		for (var item in requirement) {
			if (typeof obj[item] !== typeof requirement[item]) {
				result.push(item);
			}
		}
		for (var item in protocol) {
			if (protocol.hasOwnProperty(item) &&  typeof classdef[item] !== typeof protocol[item]) {
				result.push(item+" (class method)");
			}
		}
		return result;
	}

	/**
	 * Copies all properties from the source to the target (including inherited properties)
	 * and optionally makes them not enumerable.
	 * @private
	 */
	function copy(source, target, hidden) {
		for (var key in source) {
			defineProperty(target, key, {
				enumerable: hidden !== true,
				configurable: true, writable: true,
				value: source[key]
			});
		}
		return target;
	}

	/**
	 * Turns a function into a method by using 'this' as the first argument.
	 * @private
	 */
	function makeMethod(func) {
		return function () {
			var args = [this].concat(slice.call(arguments));
			return func.apply(null, args);
		};
	}

	/**
	 * Mixin functions are sandboxed into their own instance.
	 * @private
	 */
	function getSandboxedFunction(myMixId, mix, func) {
		var result = function () {
			var mixInstances = nonenum(this, '__multiparentInstances__', []);
			var mixInstance = mixInstances[myMixId];
			if (mixInstance == null) {
				if (typeof mix === 'function') {
					mixInstance = new mix();
				} else {
					mixInstance = create(mix);
				}
				// could add a nonenum pointer to __this__ or something if we wanted to
				// allow escape from the sandbox.
				mixInstances[myMixId] = mixInstance;
			}
			return func.apply(mixInstance, arguments);
		};
		nonenum(result, '__original__', func);
		nonenum(result, '__source__', mix);
		return result;
	}


	// Partial 'shams' to work around ie8s lack of es5 //////////////////////////////////////////////

	// These shams only cover the cases used within topiary.
	// When IE8 support is no longer needed, all these can be dropped in favour of the es5 methods.

	var defineProperty = function(obj, prop, descriptor) {
		obj[prop] = descriptor.value;
	};
	if (Object.defineProperty) {
		try {
			// IE8 throws an error here.
			Object.defineProperty({}, 'x', {});
			defineProperty = Object.defineProperty;
		} catch (e) {}
	}

	var create = Object.create ? Object.create : function(proto, descriptors) {
		var myConstructor = function() {};
		myConstructor.prototype = proto;

		var result = new myConstructor();

		var keys = Object.keys(descriptors);
		for (var i = 0; i < keys.length; ++i) {
			var key = keys[i];
			defineProperty(result, key, descriptors[key]);
		}

		return result;
	};

	function getPrototypeOf(obj) {
		if (Object.getPrototypeOf) {
			var proto = Object.getPrototypeOf(obj);

			// to avoid bad shams...
			if (proto !== obj) return proto;
		}

		// this is what most shams do, but sometimes it's wrong.
		if (obj.constructor && obj.constructor.prototype && obj.constructor.prototype !== obj) {
			return obj.constructor.prototype;
		}

		// this works only if we've been kind enough to supply a superclass property
		// (which we do when we extend classes).
		if (obj.constructor && obj.constructor.superclass) {
			return obj.constructor.superclass.prototype;
		}

		// can't find a good prototype.
		return null;
	}


	// Exporting ///////////////////////////////////////////////////////////////////////////////////

	var methods = {
		'extend': extend, 'inherit': inherit, 'mixin': mixin, 'implement': implement,
		'isAssignableFrom': isAssignableFrom, 'isA': isA, 'fulfills': fulfills,
		'classFulfills': classFulfills
	};

	/* jshint evil:true */
	var global = (new Function('return this;'))();

	var exporting = {
		'exportTo': function(to) {
			copy(methods, to || global, true);
		},
		'install': function(target) {
			if (arguments.length > 0 && typeof target !== 'function') {
				throw new Error(msg(ERROR_MESSAGES.BAD_INSTALL, typeof target));
			}
			var isGlobalInstall = arguments.length < 1

			copy({
				isA: makeMethod(methods.isA),
				fulfills: makeMethod(methods.fulfills)
			}, isGlobalInstall ? Object.prototype : target.prototype, true);

			var itemsToInstallToFunction = {
				'isAssignableFrom': makeMethod(methods.isAssignableFrom),
				'implements': makeMethod(methods.implement),
				'fulfills': makeMethod(methods.classFulfills),
				// we can 'extend' a superclass to make a subclass.
				'extend': function(properties) {
					if (typeof properties === 'function') {
						return extend(properties, this);
					}
					return extend(null, this, properties);
				},
				'mixin': makeMethod(methods.mixin),
				'inherits': makeMethod(methods.inherit)
			};
			if (isGlobalInstall) {
				// no point in having subclass.extends unless it's global.
				itemsToInstallToFunction.extends = makeMethod(methods.extend);
			}

			copy(itemsToInstallToFunction, isGlobalInstall ? Function.prototype : target, isGlobalInstall);

			return target;
		}
	};

	methods.Base = exporting.install(function BaseClass() {});

	copy(methods, exporting);

	// not sure if this works in node-jasmine....
	if ('jasmine' in global) {
		var err = {};
		var getErr = function (key) {
			return function () {
				var message = ERROR_MESSAGES[key];
				var args = slice.call(arguments);
				args.unshift(message);
				var result = msg.apply(null, args);
				if (result === null) {
					throw new Error("No such error message " + key);
				}
				return result;
			};
		};
		for (var key in ERROR_MESSAGES) {
			err[key] = getErr(key);
		}
		exporting._err = err;
	}

	return exporting;
});

},{}]},{},[17])
(17)
});
;