---
layout: main
permalink: /index.html
title: Graff
---

<script type="text/javascript" src="target/graff.js"></script>

graff
=====

Javascript Graph Theory.  If you're looking at the markdown version of this file, you can see it
rendered to html [here](http://kybernetikos.github.io/graff).

 * [source](https://github.com/kybernetikos/graff)
 * [demo](http://kybernetikos.github.io/graff/demo)
 * [specs](http://kybernetikos.github.io/graff/specs)

I've mainly build this around my own needs for working out the winner of condorcet elections, so it
comes with no guarantee that it'll be useful for anything else, however, the interface is based on
the same one that the [JGraphT](http://jgrapht.org/) library uses, so it should be easy to port
algorithms from there.

Other than the basic methods, I needed [Tarjan's strongly connected components algorithm](http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm),
so that's implemented.

The [demo](http://kybernetikos.github.io/graff/demo) makes use of [springy.js](http://getspringy.com/)
to layout the graph in a pleasant way.

I haven't focussed on performance, and in particular, I make use of maps and sets with object keys;
this means that if you aren't running in an engine that supports these, it will fallback and you
should expect it to be pretty slow.

Example
-------

```javascript
	// set up a graph.
	// SimpleGraph automatically creates new vertexes if they are referred to from .addEdge
	var myGraph = new graff.SimpleGraph();
	myGraph.addEdge("alan", "bob", 4);
	myGraph.addEdge("bob", "clem", 4);
	myGraph.addEdge("clem", "alan", 4);
	myGraph.addEdge("xara", "bob", 2);
	myGraph.addEdge("bob", "yan", 10);
	myGraph.addEdge("yan", "xara", 10);
	myGraph.addEdge("clem", "one", 4);
	myGraph.addEdge("one", "two", 4);
	myGraph.addEdge("two", "three", 10);
	myGraph.addEdge("three", "two", 10);
	myGraph.addEdge("one", "bing", 4);
	myGraph.addEdge("bing", "two", 4);

	// SimpleGraph has a useful toString, so you can do
	console.log(myGraph.toString());

	// SimpleGraph inherits from BaseGraph which provides many useful methods over the
	// basic graph interface.

	var transposed = myGraph.transpose();
	console.log(transposed.toString());

	var weakestEdges = myGraph.weakestLinks();
	console.log(weakestEdges);

	var cycles = myGraph.stronglyConnected();
	console.log(cycles.map(graff.Utils.call("toString")));

	function removeCycleLinks() {
		var components = a.stronglyConnected();
		var lastNumberOfComponents;
		do {
			lastNumberOfComponents = components.length;
			components.map(graff.Utils.call("weakestLinks"))
					.reduce(function(graph, links) {
						links.forEach(function(link) {
							graph.removeEdge(link);
						});
						return graph;
					}, a);
			components = a.stronglyConnected();
		} while (lastNumberOfComponents != components.length);
	}
```javascript