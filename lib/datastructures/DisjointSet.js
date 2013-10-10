"use strict";

var List = require('./LinkedList');
var Map = require('./RichMap');
var Set = require('./RichSet');

function Node(value, sameSet) {
	this.value = value;
	this.set = sameSet;
}
Node.prototype.toString = function() {
	return this.value;
};
Node.prototype.values = function() {
	return this.set.map(unwrap);
};
Node.prototype.forEach = function(fn, scope) {
	this.set.forEach(fn, scope);
};

function wrapInList(lookup, value) {
	var list = new List();
	var node = new Node(value, list);

	node.has = function(value) {
		var node = lookup.get(value);
		return node ? node.set.data === list.data : false;
	};
	lookup.set(value, node);
	list.push(node);
	return list;
}

function unwrap(node) {
	return node.value;
}

function DisjointSet() {
	this._disjointSetData = [];
	this._disjointSetLookup = new Map();
	this.push.apply(this, arguments);
}

DisjointSet.prototype.push = function(value) {
	for (var i = 0; i < arguments.length; ++i) {
		this._disjointSetData.push(wrapInList(this._disjointSetLookup, arguments[i]));
	}
};

DisjointSet.prototype.addAll = function(collection) {
	var lookup = this._disjointSetLookup;
	this._disjointSetData = this._disjointSetData.concat(collection.map(function(value) {
		wrapinList(lookup, value);
	}));
};

DisjointSet.prototype.has = function(setNode, value) {
	return this.find(value).set.data === setNode.set.data;
};

DisjointSet.prototype.find = function(value) {
	var node = this._disjointSetLookup.get(value);
	return node ? node : undefined;
};

DisjointSet.prototype.union = function(setNode1, setNode2) {
	var set1 = setNode1.set;
	var set2 = setNode2.set;

	set1.mergeDestructive(set2);
};

module.exports = DisjointSet;