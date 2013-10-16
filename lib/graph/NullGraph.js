"use strict";

var Map = require('../datastructures/RichMap'), Set = require('../datastructures/RichSet');
var BaseGraph = require('./BaseGraph');

module.exports = BaseGraph.extend({
	constructor: function NullGraph() {},

	allVertexes: function() {
		return new Set();
	},

	allEdges: function() {
		return new Set();
	},

	source: function() {
		return null;
	},

	target: function() {
		return null;
	}
});