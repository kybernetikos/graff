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

