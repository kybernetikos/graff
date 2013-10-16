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