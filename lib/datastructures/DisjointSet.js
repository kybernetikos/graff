"use strict";

var List = require('./LinkedList');
var Map = require('./RichMap');
var Set = require('./RichSet');

function Node(disjointSet, value, sameSet) {
	this.disjointSet = disjointSet;
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
Node.prototype.has = function(value) {
	return this.disjointSet.has(this, value);
};

function wrapInList(disjointSet, value) {
	var list = new List();
	var node = new Node(disjointSet, value, list);
	disjointSet._disjointSetLookup.set(value, node);
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
		this._disjointSetData.push(wrapInList(this, arguments[i]));
	}
};

DisjointSet.prototype.addAll = function(collection) {
	var disjointSet = this;
	this._disjointSetData = this._disjointSetData.concat(collection.map(function(value) {
		wrapinList(disjointSet, value);
	}));
};

DisjointSet.prototype.has = function(setNode, value) {
	return this.find(value).set === setNode.set;
};

DisjointSet.prototype.find = function(value) {
	var node = this._disjointSetLookup.get(value);
	return node ? node : undefined;
};

DisjointSet.prototype.union = function(setNode1, setNode2) {
	var set1 = setNode1.set;
	var set2 = setNode2.set;

	set2.forEach(function(node) {
		node.set = set1;
	});

	set1.mergeDestructive(set2);
};

module.exports = DisjointSet;