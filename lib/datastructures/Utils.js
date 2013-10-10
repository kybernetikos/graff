exports.defineProperties = function(object, map) {
	Object.keys(map).forEach(function(name) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			writable: true,
			value: map[name]
		});
	});
};

exports.id = function(x) {
	return x;
};