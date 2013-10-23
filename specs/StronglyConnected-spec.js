describe("The .stronglyConnected method on BaseGraph", function() {
	var global = Function('return this')();
	var graff = global.graff || require('..');
	var JsHamcrest = global.JsHamcrest || require('jshamcrest').JsHamcrest;
	JsHamcrest.Integration.jasmine();

	var BaseGraph = graff.BaseGraph;

	var TestGraphDef = BaseGraph.extend({
		constructor: function(vertexes, edges) {
			this.vertexes = new graff.Set();
			this.edges = new graff.Set();
			this.vertexes.addAll(vertexes);
			this.edges.addAll(edges);
		},
		allVertexes: function() { return this.vertexes; },
		allEdges: function() { return this.edges; },
		source: function(edge) {
			if (this.edges.has(edge) === false) return null;
			return edge.split('->')[0];
		},
		target: function(edge) {
			if (this.edges.has(edge) === false) return null;
			return edge.split('->')[1];
		}
	});

	function expectAllComponentsToBeOfSizeOne(components) {
		for (var i = 0; i < components.length; ++i) {
			expect(components[i].allVertexes().size).toBe(1);
		}
	}

	function vertexesAre(expectedVertexes) {
		return new JsHamcrest.SimpleMatcher({
			matches: function(actual) {
				var actualVertexes = actual.allVertexes();
				return expectedVertexes.equal(actualVertexes);
			},
			describeTo: function(description) {
				description.append("the graph to have vertexes ").appendLiteral(expectedVertexes);
			}
		});
	}

	function edgesAre(expectedEdges) {
		return new JsHamcrest.SimpleMatcher({
			matches: function(actual) {
				var actualVertexes = actual.allEdges();
				return expectedEdges.equal(actualVertexes);
			},
			describeTo: function(description) {
				description.append("the graph to have edges ").appendLiteral(expectedEdges);
			}
		});
	}

	function sameGraphAs(expectedGraph) {
		return JsHamcrest.Matchers.allOf(
				edgesAre(expectedGraph.allEdges()),
				vertexesAre(expectedGraph.allVertexes())
		);
	}

	function expectComponents(components, descriptions) {
		expect(components.length).toBe(descriptions.length);
		for (var i = 0; i < descriptions.length; ++i) {
			var description = descriptions[i];
			var expectedGraph = new TestGraphDef(description.vertexes, description.edges);
			assertThat(components, hasItem(sameGraphAs(expectedGraph)));
		}
	}

	it('finds no component bigger than one vertex in a triangle where the edge directions are not in a cycle', function() {
		var testGraph = new TestGraphDef(['a', 'b', 'c'], ['a->b', 'a->c', 'b->c']);
		var components = testGraph.stronglyConnected();
		expect(components.length).toBe(3);
		expectAllComponentsToBeOfSizeOne(components);

		// check this scenario with different definition orders of the edges
		testGraph = new TestGraphDef(['a', 'b', 'c'], ['a->c', 'b->c', 'a->b']);
		components = testGraph.stronglyConnected();
		expect(components.length).toBe(3);
		expectAllComponentsToBeOfSizeOne(components);

		testGraph = new TestGraphDef(['a', 'b', 'c'], ['b->c', 'a->b', 'a->c']);
		components = testGraph.stronglyConnected();
		expect(components.length).toBe(3);
		expectAllComponentsToBeOfSizeOne(components);
	});

	it('finds the cycle in a cyclic triangle', function() {
		var testGraph = new TestGraphDef(['a', 'b', 'c'], ['a->b', 'b->c', 'c->a']);
		var components = testGraph.stronglyConnected();
		expect(components.length).toBe(1);
		expect(components[0].allVertexes().allValues()).toEqual(['a', 'b', 'c']);
	});

	it('finds the non-cyclic components attached to a cyclic triangle', function() {
		var testGraph = new TestGraphDef(['a', 'b', 'c', 'd', 'e', 'f'], ['a->b', 'b->c', 'c->a', 'a->d', 'd->e', 'f->c']);
		var components = testGraph.stronglyConnected();

		expectComponents(components, [
			{vertexes: ['a', 'b', 'c'], edges: ['a->b', 'b->c', 'c->a']},
			{vertexes: ['e'], edges: []},
			{vertexes: ['d'], edges: []},
			{vertexes: ['f'], edges: []}
		]);
	});

	it('gets the right thing in a complex example', function() {
		var testGraph = new TestGraphDef([
			"alan", "bob", "clem", "xara", "yan", "one", "two", "three", "bing"
		],[
			"alan->bob", "bob->clem", "clem->alan", "xara->bob", "bob->yan", "yan->xara",
			"clem->one", "one->two", "two->three", "three->two", "one->bing", "bing->two"
		]);

		var components = testGraph.stronglyConnected();

		expectComponents(components, [
			{vertexes: ["one"], edges: []},
			{vertexes: ["bing"], edges: []},
			{vertexes: ["alan", "bob", "clem", "xara", "yan"],
				edges: ["alan->bob", "bob->clem", "clem->alan", "xara->bob", "bob->yan", "yan->xara"]},
			{vertexes: ["two", "three"], edges: ["two->three", "three->two"]}
		]);
	});

});
