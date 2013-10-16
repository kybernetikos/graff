"use strict";

var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
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

	addEdge: function(source, target, edgeData, weight) {
		edgeData = edgeData || "SimpleEdge#"+(edgeId++);
		weight = weight || 1;

		this._sgVertexes.add(source);
		this._sgVertexes.add(target);
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
	},

	incrementWeight: function(edge, amount) {
		this._sgWeights.set(edge, this._sgWeights.get(edge) + amount);
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