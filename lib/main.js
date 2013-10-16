var SimpleGraph = require('./graph/SimpleGraph');
var WeightOrientedGraph = require('./graph/WeightOrientedGraph');

var x = new SimpleGraph();

x.addEdge("fred", "bob");
x.addEdge("bob", "jim");
x.addEdge("jim", "fred");

//console.log(x.toString());


var a = new SimpleGraph();
a.addEdge("a", "f");
a.addEdge("a", "i");

a.addEdge("b", "h");

a.addEdge("c", "d");
a.addEdge("c", "f");
a.addEdge("c", "h");

a.addEdge("d", "c");
a.addEdge("d", "e");
a.addEdge("d", "h");

a.addEdge("e", "d");
a.addEdge("e", "g");
a.addEdge("e", "h");
a.addEdge("e", "i");

a.addEdge("f", "a");
a.addEdge("f", "c");
a.addEdge("f", "e");

a.addEdge("g", "e");

a.addEdge("h", "b");
a.addEdge("h", "c");
a.addEdge("h", "d");
a.addEdge("h", "e");
a.addEdge("h", "i");

a.addEdge("i", "a");
a.addEdge("i", "e");


//var a = new SimpleGraph();
//a.addEdge("a", "b", null, 4);
//a.addEdge("b", "c", null, 4);
//a.addEdge("c", "a", null, 4);
//a.addEdge("x", "b", null, 10);
//a.addEdge("b", "y", null, 10);
//a.addEdge("y", "x", null, 10);
//a.addEdge("c", "1", null, 4);
//a.addEdge("1", "2", null, 4);
//a.addEdge("2", "3", null, 10);
//a.addEdge("3", "2", null, 10);

//a.traverseDepthFirst(function(v){console.log('d: ', v);}, function(v){console.log('e: ', v);});
console.log(a.stronglyConnected().join("\n\n"));