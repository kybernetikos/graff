;(function() {

	var measureSpan = document.createElement('span');
	measureSpan.setAttribute('style', 'position: absolute; display: block; margin: 0; padding: 0; border: 0; visibility: hidden; z-index: -10');
	document.body.insertBefore(measureSpan, document.body.firstChild);

	function Label(text, style, color, outline) {
		this.text = text;
		this.color = color || "#000000";
		this.outline = outline || null;
		this.style = style || "12px Verdana, sans-serif";
	}
	Label.prototype.render = function(ctx, position) {
		ctx.save();
		var size = this.getSize();

		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = this.style;

		if (this.outline !== null) {
			ctx.strokeStyle = this.outline;
			ctx.lineWidth = 3;
			ctx.strokeText(this.text, position.x - size.width / 2, position.y - size.height / 2);
		}

		ctx.fillStyle = this.color;
		ctx.fillText(this.text, position.x - size.width / 2, position.y - size.height / 2);
		ctx.restore();
	};
	Label.prototype.getSize = function() {
		measureSpan.innerHTML = this.text;
		measureSpan.style.font = this.style;
		return {
			width: measureSpan.offsetWidth,
			height: measureSpan.offsetHeight
		};
	};

	// helpers for figuring out where to draw arrows
	function intersect_line_line(p1, p2, p3, p4) {
		var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));

		// lines are parallel
		if (denom === 0) {
			return false;
		}

		var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
		var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

		if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			return false;
		}

		return new Springy.Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
	}

	function intersect_line_box(p1, p2, p3, w, h) {
		var tl = {x: p3.x, y: p3.y};
		var tr = {x: p3.x + w, y: p3.y};
		var bl = {x: p3.x, y: p3.y + h};
		var br = {x: p3.x + w, y: p3.y + h};

		var result;
		if (result = intersect_line_line(p1, p2, tl, tr)) { return result; } // top
		if (result = intersect_line_line(p1, p2, tr, br)) { return result; } // right
		if (result = intersect_line_line(p1, p2, br, bl)) { return result; } // bottom
		if (result = intersect_line_line(p1, p2, bl, tl)) { return result; } // left

		return false;
	}

	function roundRect(ctx, x, y, width, height, radius) {
		radius = radius || 5;
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	}

	function multVectors(v1, v2) {
		return new Springy.Vector(v1.x * v2.x, v1.y * v2.y);
	}
	function divVectors(v1, v2) {
		return new Springy.Vector(v1.x / v2.x, v1.y / v2.y);
	}

	function render(canvas, graph) {
		graph = graph || new Springy.Graph();

		var drawSize = new Springy.Vector(canvas.width - 20, canvas.height - 20);
		var position = new Springy.Vector(10, 10);
		var stiffness = canvas.width, repulsion = canvas.height, damping = 0.5;

		var layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping);

		function toScreen(p) {
			var currentBB = layout.getBoundingBox();
			var size = currentBB.topright.subtract(currentBB.bottomleft);
			var factor = divVectors(drawSize, size);
			var pZeroed = p.subtract(currentBB.bottomleft);

			return position.add(multVectors(pZeroed, factor));
		}

		var ctx = canvas.getContext("2d");

		Springy.Node.prototype.getRenderLabel = function() {
			if (!this._renderLabel) {
				var text = (this.data.label !== undefined) ? this.data.label : this.id;
				this._renderLabel = new Label(text, "12px Verdana, sans-serif");
			}
			return this._renderLabel;
		};

		Springy.Node.prototype.getWidth = function() {
			return this.getRenderLabel().getSize().width + 10;
		};

		Springy.Node.prototype.getHeight = function() {
			return this.getRenderLabel().getSize().height + 3;
		};

		var labels = [];
		var unrenderedLabels = false;
		function label(priority, ctx, text, position, style, color, background) {
			var l = new Label(text, style, color, background);
			var renderFunc = l.render.bind(l, ctx, position);
			if (priority) {
				labels.unshift(renderFunc);
			} else {
				labels.push(renderFunc);
			}
			unrenderedLabels = true;
		}

		function ensureLabelsRendered() {
			if (unrenderedLabels == false) {
				return;
			}
			var labelRenderer;
			while (labelRenderer = labels.shift()) {
				labelRenderer();
			}
		}

		var renderer = new Springy.Renderer(layout,
				function clear() {
					ctx.clearRect(0,0,canvas.width,canvas.height);
				},
				function drawEdge(edge, p1, p2) {
					var screenP1 = toScreen(p1), screenP2 = toScreen(p2);
					var direction = screenP2.subtract(screenP1);
					var normal = direction.normal().normalise();

					var from = graph.getEdges(edge.source, edge.target);
					var to = graph.getEdges(edge.target, edge.source);

					var total = from.length + to.length;

					// Figure out edge's position in relation to other edges between the same nodes
					var n = 0;
					for (var i=0; i<from.length; i++) {
						if (from[i].id === edge.id) {
							n = i;
						}
					}

					var spacing = 6.0;

					// Figure out how far off center the line should be drawn
					var offset = normal.multiply(-((total - 1) * spacing)/2.0 + (n * spacing));
					var s1 = screenP1.add(offset), s2 = screenP2.add(offset);

					var boxWidth = edge.target.getWidth();
					var boxHeight = edge.target.getHeight();

					var intersection = intersect_line_box(s1, s2, {x: screenP2.x-boxWidth/2.0, y: screenP2.y-boxHeight/2.0}, boxWidth, boxHeight) || s2;

					var stroke = (edge.data.color !== undefined) ? edge.data.color : '#000000';
					var weight = (edge.data.weight !== undefined) ? edge.data.weight : 1.0;

					ctx.lineWidth = Math.max(weight *  2, 0.1);
					var arrowWidth = 1 + ctx.lineWidth;
					var arrowLength = 8;
					var directional = (edge.data.directional !== undefined) ? edge.data.directional : true;

					// line
					var lineEnd = directional ? intersection.subtract(direction.normalise().multiply(arrowLength * 0.5)) : s2;

					ctx.strokeStyle = stroke;
					ctx.beginPath();
					ctx.moveTo(s1.x, s1.y);
					ctx.lineTo(lineEnd.x, lineEnd.y);
					ctx.stroke();

					// arrow
					if (directional) {
						ctx.save();
						ctx.fillStyle = stroke;
						ctx.translate(intersection.x, intersection.y);
						ctx.rotate(Math.atan2(screenP2.y - screenP1.y, screenP2.x - screenP1.x));
						ctx.beginPath();
						ctx.moveTo(-arrowLength, arrowWidth);
						ctx.lineTo(0, 0);
						ctx.lineTo(-arrowLength, -arrowWidth);
						ctx.lineTo(-arrowLength * 0.8, -0);
						ctx.closePath();
						ctx.fill();
						ctx.restore();
					}

					// label
					if (edge.data.label !== undefined) {
						var text = edge.data.label
						var centerPoint = screenP1.add(screenP2.subtract(screenP1).divide(2));
						label(false, ctx, text, centerPoint, "10px Helvetica, sans-serif", 'black', 'white');
						ctx.restore();
					}
				},
				function drawNode(node, p) {
					ensureLabelsRendered();

					var s = toScreen(p);

					var boxWidth = node.getWidth() ;
					var boxHeight = node.getHeight();
					// clear background
					ctx.clearRect(s.x - boxWidth/2, s.y - boxHeight/2, boxWidth, boxHeight);
					// fill background
					ctx.fillStyle = "#dedede";
					ctx.strokeStyle = "#999999";
					roundRect(ctx, s.x - boxWidth / 2, s.y - boxHeight / 2, boxWidth, boxHeight, 10);
					ctx.fill();
					ctx.stroke();

					node.getRenderLabel().render(ctx, s);
				}
		);

		renderer.start();
	}

	window.Label = Label;
	window.renderGraph = render;
})();