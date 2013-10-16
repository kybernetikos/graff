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