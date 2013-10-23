---
layout: main
permalink: /index.html
title: Graff
---

<script type="text/javascript" src="target/graff.js"></script>

graff
=====

Javascript Graph Theory

 * [source](https://github.com/kybernetikos/graff)
 * [demo](http://kybernetikos.github.io/graff/demo)
 * [specs](http://kybernetikos.github.io/graff/specs)

I've mainly build this around my needs for working out the winner of condorcet elections, so it
comes with no guarantee that it'll be useful for anything else, however, the interface is based on
the same one that the JGraphT library uses, so it should be easy to port algorithms from there.

Other than the basic methods, I needed [Tarjan's strongly connected components algorithm](http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm),
so that's implemented.

The demo makes use of [springy.js](http://getspringy.com/).