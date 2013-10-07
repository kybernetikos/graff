function List(head, tail) {
	this.head = head;
	this.tail = tail;
	this.length = tail.length + 1;
}

List.NIL = new List(undefined, {length: -1});
List.NIL.tail = List.NIL;

List.prototype.forEach = function(func) {
	var current = this;
	while (current !== List.NIL) {
		func(current.head);
		current = current.tail;
	}
};

List.prototype.drop = function(numberToDrop) {
	var current = this;
	while (numberToDrop-- > 0 && current !== List.NIL) {
		current = current.tail;
	}
	return current;
};

List.prototype.get = function(index) {
	return this.drop(index).head;
};

List.prototype.cons = function(value) {
	return new List(value, this);
};

module.exports = List;