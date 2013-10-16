var FilteredGraph = require('./FilteredGraph');

function WeightOrientedGraph(parentGraph) {
	FilteredGraph.call(this, parentGraph, function(edge) {
		return this.weight(edge) != null;
	}.bind(this) , function() {return true;});
}

FilteredGraph.extend(WeightOrientedGraph);

WeightOrientedGraph.prototype.weight = function(edge) {
	var source = this._parentGraph.source(edge);
	var target = this._parentGraph.target(edge);
	var weight = this._parentGraph.weight(edge);
	var weightInOtherDirection = 0;

	var edgeInOtherDirection = this._parentGraph.edge(target, source);
	if (edgeInOtherDirection != null) {
		weightInOtherDirection = this._parentGraph.weight(edgeInOtherDirection);
	}

	var thisEdgeWeight = weight - weightInOtherDirection;

	return thisEdgeWeight >= 0 ? thisEdgeWeight : null;
};

module.exports = WeightOrientedGraph;