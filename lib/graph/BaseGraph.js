"use strict";

var global = Function('return this')();

var oo = require('topiary');
var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var NOOP = require('../Utils').NOOP;
var Graph = require('./Graph');

function BaseGraph() {}

// Required graph interface methods ////////////////////////////////////////////////////////////////

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

// Optional graph interface methods ////////////////////////////////////////////////////////////////

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

// Transformed view methods ////////////////////////////////////////////////////////////////////////

BaseGraph.prototype.transpose = function() {
	var TransposedGraph = require('./TransposedGraph');
	return new TransposedGraph(this);
};

BaseGraph.prototype.weightOriented = function() {
	var WeightOrientedGraph = require('./WeightOrientedGraph');
	return new WeightOrientedGraph(this);
};

// Filter methods //////////////////////////////////////////////////////////////////////////////////

BaseGraph.prototype.filter = function filter(edgeFilter, vertexFilter) {
	var FilteredGraph = require('./FilteredGraph');
	return new FilteredGraph(this, edgeFilter, vertexFilter);
};

BaseGraph.prototype.limitEdges = function(edgeSet) {
	var FilteredGraph = require('./FilteredGraph');
	return FilteredGraph.limitEdges(this, edgeSet);
};

BaseGraph.prototype.limitVertexes = function(reducedVertexSet) {
	var FilteredGraph = require('./FilteredGraph');
	return FilteredGraph.limitVertexes(this, reducedVertexSet);
};

BaseGraph.prototype.limitWeight = function(minWeight, maxWeight) {
	var FilteredGraph = require('./FilteredGraph');
	return FilteredGraph.limitWeight(this, minWeight, maxWeight);
};

// springy methods /////////////////////////////////////////////////////////////////////////////////

BaseGraph.prototype.springy = function springy() {
	var Springy = global.Springy || require('springy');
	var sGraph = new Springy.Graph();

	var springyNodes = new Map(function(vertex) {
		var nodeData = {
			data: vertex,
			label: String(vertex)
		};
		return sGraph.newNode(nodeData);
	});
	var springyEdges = new Map(function(edge) {
		var weight = this.weight(edge);
		var source = springyNodes.get(this.source(edge));
		var target = springyNodes.get(this.target(edge));
		var edgeData = {
			data: edge
		};
		if (edge && edge.color) {
			edgeData.color = edge.color;
		}
		if (edge && edge.label) {
			edgeData.label = edge.label;
		} else if (weight !== 1) {
			edgeData.label = weight;
		}
		return sGraph.newEdge(source, target, edgeData);
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
			sGraph.removeNode(springyVertex);
			springyNodes.remove(vertexData);
		});
		this.on('remove-edge', function(graph, a, b, edge, weight) {
			var springyEdge = springyEdges.get(edge);
			sGraph.removeEdge(springyEdge);
			springyEdges.remove(edge);
		});
	}
	return sGraph;
};

// Utility methods /////////////////////////////////////////////////////////////////////////////////

BaseGraph.prototype.weakestLinks = function() {
	var graph = this;
	return this.allEdges().allValues().map(function(edge) {
		return {edge: edge, weight: graph.weight(edge)};
	}).sort(function(a, b) {
		return a.weight - b.weight;
	}).filter(function(record, index, array) {
		return record.weight === array[0].weight
	}).map(function(record) {
		return record.edge;
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

		graph.edgesFrom(v).forEach(function(edge) {
			var neighbouringVertex = graph.target(edge);
			if (discovered.has(neighbouringVertex) === false) {
				discover(neighbouringVertex);
			} else if (explored.has(neighbouringVertex) == false) {
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

BaseGraph.prototype.stronglyConnected = function() {
	// by Tarjans algorithm.
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
		// on loop back to an unexplored but discovered vertex (i.e. one in this path)
		var loopIndex = vertexData.get(alreadyDiscoveredVertex).index;
		if (loopIndex < this.lowLink) {
			this.lowLink = loopIndex;
		}
	});

	var FilteredGraph = require('./FilteredGraph');
	var graph = this;
	return result.map(function(connectedVertexes) {
		return FilteredGraph.limitVertexes(graph, connectedVertexes);
	});
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