var List = require('../lib/datastructures/LinkedList');

describe("List", function() {
	it('supports forEach', function() {
		var x = new List(10, 4, 8);
		var result = [];
		x.forEach(function(value) {
			result.push(value);
		});

		expect(result.length).toBe(3);
		expect(result[0]).toBe(10);
		expect(result[1]).toBe(4);
		expect(result[2]).toBe(8);
	});

	it('supports splice', function() {
		var x = new List(10, 5, 2, 11);
		var deleted = x.splice(1, 2, "hello", "world").toArray();
		var result = x.toArray();

		expect(x.length).toBe(4);
		expect(result[0]).toBe(10);
		expect(result[1]).toBe("hello");
		expect(result[2]).toBe("world");
		expect(result[3]).toBe(11);

		expect(deleted.length).toBe(2);
		expect(deleted[0]).toBe(5);
		expect(deleted[1]).toBe(2);
	});

	it('supports insert', function() {
		var x = List.fromArray([1, 2, 3, 4, 5]);
		x.insert(2, 100, 101);

		var result = x.toArray();
		expect(x.length).toBe(7);
		expect(result[1]).toBe(2);
		expect(result[2]).toBe(100);
		expect(result[3]).toBe(101);
		expect(result[4]).toBe(3);
	});

	it('supports lastIndexOf', function() {
		var x = List.fromArray([1, 2, 3, 4, 5, 4, 3, 2, 1]);
		expect(x.lastIndexOf(3)).toBe(6);
		expect(x.lastIndexOf("cabbage")).toBe(-1);
		expect(x.lastIndexOf(3, 5)).toBe(2);
		expect(x.lastIndexOf(1, 5)).toBe(0);
		expect(x.lastIndexOf(1, 100)).toBe(8);
	});

	it('supports insertListDestructive', function() {
		var x = List.fromArray([1, 2, 3]);
		var y = new List("hello", "world");

		x.insertListDestructive(1, y);
		var testX = x.toArray();
		var testY = y.toArray();

		expect(x.length).toBe(5);
		expect(y.length).toBe(0);

		expect(testX.length).toBe(5);
		expect(testX[0]).toBe(1);
		expect(testX[1]).toBe("hello");
		expect(testX[2]).toBe("world");
		expect(testX[3]).toBe(2);
		expect(testX[4]).toBe(3);

		expect(testY.length).toBe(0);
	});

	it('supports mergeDestructive', function() {
		var x = new List("a", "b", "c");
		var y = new List("d", "e", "f");

		x.mergeDestructive(y);

		expect(x.length).toBe(6);

		var xResult = x.toArray();
		expect(xResult.length).toBe(6);
		expect(xResult[0]).toBe("a");
		expect(xResult[3]).toBe("d");
	});
});