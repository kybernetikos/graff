var Map = require('../datastructures/RichMap');
var Set = require('../datastructures/RichSet');
var Graph = require('./Graph');

var oo = require('topiary');

function NullGraph() {}

NullGraph.prototype.transpose = function() {
	return this;
};

NullGraph.prototype.addEdge = function(source, target, edge, weight) {
	var AddEdgeGraph = require('./AddEdgeGraph')
	return new AddEdgeGraph(source, target, edge, weight, this);
};

NullGraph.prototype.edge = function(sourceVertex, targetVertex) {
	return null;
};
NullGraph.prototype.neighbours = function(vertex) {
	return new Set();
};
NullGraph.prototype.allEdges = function() {
	return new Set();
};
NullGraph.prototype.edgesFrom = function(vertex) {
	return new Set();
};
NullGraph.prototype.edgesTo = function(vertex) {
	return new Set();
};
NullGraph.prototype.source = function(edge) {
	return null;
};
NullGraph.prototype.target = function(edge) {
	return null;
};
NullGraph.prototype.weight = function(edge) {
	return null;
};
NullGraph.prototype.allVertexes = function() {
	return new Set();
};
NullGraph.prototype.toString = function() {
	return "<<Empty Graph>>";
};

oo.implement(NullGraph, Graph);

module.exports = new NullGraph();