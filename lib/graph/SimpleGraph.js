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