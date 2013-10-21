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
	var Springy = require('springy');
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