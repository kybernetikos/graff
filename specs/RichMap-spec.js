describe("RichMap", function() {
	var global = Function('return this')();
	var graff = global.graff || require('..');
	var RichMap = graff.Map;

	describe("reduce", function() {
		it('operates like an array reduce.', function() {
			// order is assumed to be insertion order.

			var r = new RichMap();

			r.set("key1", 10);
			r.set("key2", -5);

			var result = r.reduce(function(current, value) {
				return current - value;
			}, 9);

			expect(result).toBe(4);
		});
	});

	describe("can have a factory function set", function() {
		it("creates a new value if there isn't one.", function() {
			var r = new RichMap(function(key) {
				return {};
			});

			r.set("ninety-nine", 99);

			expect(r.has("bob")).toBe(false);
			var jim = r.get("bob");
			expect(r.has("bob")).toBe(true);
			expect(r.get("bob")).toBe(jim);
			expect(r.get("otherThing")).not.toBe(jim);

			expect(r.get("ninety-nine")).toBe(99);
		});

		it("which is transformed in a mapped richmap.", function() {
			var r = new RichMap(function(key) {
				return 10;
			});

			r.set("a", 5);
			r.set("b", 10);
			r.get("c");

			var mapped = r.map(function(value, key) {
				return value * 2;
			});

			// did not modify original
			expect(r.size).toBe(3);
			expect(r.get("a")).toBe(5);
			expect(r.get("b")).toBe(10);
			expect(r.get("c")).toBe(10);
			expect(r.get("not-got-before")).toBe(10);

			expect(mapped.size).toBe(3);
			expect(mapped.get("a")).toBe(10);
			expect(mapped.get("b")).toBe(20);
			expect(mapped.get("c")).toBe(20);
			expect(mapped.get("not-got-before-2")).toBe(20);
		});

		it('receives extra arguments to get.', function() {

			var mapWithDefaults = new RichMap(function(key, defaultValue) {
				return defaultValue;
			});

			var jim = mapWithDefaults.get("jim", 22);
			var alf = mapWithDefaults.get("alf", 5);

			expect(jim).toBe(22);
			expect(alf).toBe(5);

			expect(mapWithDefaults.get("jim", 99)).toBe(jim);
			expect(mapWithDefaults.get("alf")).toBe(alf);
		});
	});

});