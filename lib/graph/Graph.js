/**
 * @interface
 */
function Graph() {}

/**
 * Gets the edge between two different vertexes.
 *
 * @param sourceVertex
 * @param targetVertex
 */
Graph.prototype.edge = function(sourceVertex, targetVertex) {};

/**
 * Returns a set of all edges.
 */
Graph.prototype.allEdges = function() {};

/**
 * Returns a set of all edges from a particular vertex.
 * @param vertex
 */
Graph.prototype.edgesFrom = function(vertex) {};

/**
 * Returns a set of the vertexes that can be reached by traversing one edge from the provided vertex.
 * @param vertex
 */
Graph.prototype.neighbours = function(vertex) {};

/**
 * returns a set of the edges coming into the provided vertex.
 * @param vertex
 */
Graph.prototype.edgesTo = function(vertex) {};

/**
 * returns the source vertex of the provided edge.
 * @param edge
 */
Graph.prototype.source = function(edge) {};

/**
 * @returns the target vertex of the provided edge.
 * @param edge
 */
Graph.prototype.target = function(edge) {};

/**
 * @returns the weight of the provided vertex or 1.
 * @param edge
 */
Graph.prototype.weight = function(edge) {};

/**
 * @returns a set of all vertexes.
 */
Graph.prototype.allVertexes = function() {};

module.exports = Graph;