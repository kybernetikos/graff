var DisjointSet = require('./datastructures/DisjointSet');

var ds = new DisjointSet();

ds.push("a", "b", "c", "d");

var aset = ds.find("a");
var bset = ds.find("b");

console.log(aset.set, bset.set);

ds.union(aset, bset);
console.log(String(aset.set), String(bset.set));

ds.union(aset, ds.find("c"));
console.log(String(bset.set));

console.log(aset.has("c"));