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

exports.call = function call() {
	var functionName = arguments[0];
	if (arguments.length === 0) {
		return call;
	} else if (arguments.length == 1) {
		return function() {
			var currentArgs = Array.prototype.slice.call(arguments);
			currentArgs.unshift(functionName);
			return call.apply(null, currentArgs);
		}
	}
	var scope = arguments[1];
	return scope[functionName].apply(scope, Array.prototype.slice.call(arguments, 2));
};

exports.get = function get() {
	var propertyName = arguments[0];
	if (arguments.length === 0) {
		return get;
	} else if (arguments.length == 1) {
		return function() {
			var currentArgs = Array.prototype.slice.call(arguments);
			currentArgs.unshift(propertyName);
			return get.apply(null, currentArgs);
		}
	}
	var scope = arguments[1];
	return scope[propertyName];
};

exports.NOOP = function NOOP() {};