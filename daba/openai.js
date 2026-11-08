const SVG_NS_LOCAL = 'http://www.w3.org/2000/svg';

function applyFitToSvgText(textEl, result) {
	textEl.replaceChildren();
	textEl.setAttribute('font-size', result.fontSize);
	textEl.setAttribute('font-family', result.fontFamily);
	textEl.setAttribute('font-weight', result.fontWeight);
	textEl.setAttribute('font-style', result.fontStyle);
	textEl.setAttribute('text-anchor', result.textAnchor);
	textEl.setAttribute('xml:space', 'preserve');

	for (const line of result.lines) {
		const tspan = document.createElementNS(SVG_NS_LOCAL, 'tspan');
		tspan.setAttribute('x', line.x);
		tspan.setAttribute('y', line.y);
		tspan.textContent = line.text;
		textEl.appendChild(tspan);
	}
}

function bboxOf(points) {
	const xs = points.map(p => p[0]);
	const ys = points.map(p => p[1]);
	const x = Math.min(...xs);
	const y = Math.min(...ys);
	return {
		x, y,
		w: Math.max(...xs) - x,
		h: Math.max(...ys) - y
	};
}

function cleanRounded(points) {
	let result = points;
	let changed = true;

	while (changed && result.length > 3) {
		changed = false;
		const next = [];

		for (let i = 0; i < result.length; i++) {
			const prev = result[(i + result.length - 1) % result.length];
			const cur = result[i];
			const following = result[(i + 1) % result.length];

			const duplicate = cur[0] === prev[0] && cur[1] === prev[1];
			const cross =
				(cur[0] - prev[0]) * (following[1] - cur[1]) -
				(cur[1] - prev[1]) * (following[0] - cur[0]);

			if (duplicate || cross === 0) changed = true;
			else next.push(cur);
		}

		if (next.length < 3) break;
		result = next;
	}

	return result;
}

function createStageX(dParent) {
	const svg = document.createElementNS(SVG_NS_LOCAL, 'svg');
	svg.setAttribute('id', 'svg');
	svg.setAttribute('viewBox', '0 0 400 400');
	svg.setAttribute('width', '100%');
	svg.setAttribute('height', '100%');
	svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
	svg.style.display = 'block';

	const g = document.createElementNS(SVG_NS_LOCAL, 'g');
	g.setAttribute('id', 'shapeLayer');
	svg.appendChild(g);

	const text = document.createElementNS(SVG_NS_LOCAL, 'text');
	text.setAttribute('id', 'out');
	svg.appendChild(text);

	dParent.appendChild(svg);
	return { svg, g, text };
}

function dedupePoints(points) {
	return points.filter((p, i) => {
		const prev = points[(i + points.length - 1) % points.length];
		return Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-9;
	});
}

function dilate(source, width, height, radius) {
	const temp = new Uint8Array(source.length);
	const result = new Uint8Array(source.length);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius); k++) {
				if (source[y * width + k]) {
					temp[y * width + x] = 1;
					break;
				}
			}
		}
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius); k++) {
				if (temp[k * width + x]) {
					result[y * width + x] = 1;
					break;
				}
			}
		}
	}

	return result;
}

function drawClaudeX(layer, def, text = 'hallo', out, opts = {}) {
	const {
		depth = 0,
		angle = 45,
		scale = 1,
		texture = '../assets/texwall/wood.png',
		repeat = false,
		tile = null,
		color = null,
		blend = 'luminosity',
		stroke = 'none',
		strokeWidth = 1.5,
		textFill = 'yellow'
	} = opts;

	layer.replaceChildren();

	let el;
	let shape;

	if (def.kind === 'circle') {
		el = document.createElementNS(SVG_NS_LOCAL, 'circle');
		el.setAttribute('cx', def.data.cx);
		el.setAttribute('cy', def.data.cy);
		el.setAttribute('r', def.data.r);
		shape = def.data;
	} else if (def.kind === 'points' || !def.kind) {
		el = document.createElementNS(SVG_NS_LOCAL, 'polygon');
		el.setAttribute('points', def.data.map(p => p.join(',')).join(' '));
		shape = def.data;
	} else {
		el = document.createElementNS(SVG_NS_LOCAL, def.tag);
		for (const [key, value] of Object.entries(def.attrs)) {
			el.setAttribute(key, value);
		}
		shape = el;
	}

	layer.appendChild(el);

	let front = el;
	let fitShape = shape;
	let ext = null;

	if (depth > 0) {
		const vb = layer.ownerSVGElement.viewBox.baseVal;
		const box = vb.width
			? {
				x: vb.x + vb.width * 0.05,
				y: vb.y + vb.height * 0.05,
				w: vb.width * 0.9,
				h: vb.height * 0.9
			}
			: { x: 20, y: 20, w: 360, h: 360 };

		const geometry = extrude(shape, depth, { angle, scale, box });
		el.remove();
		ext = renderExtrusion(layer, geometry, {
			fill: color || '#8aa',
			stroke,
			strokeWidth
		});
		front = ext.front;
		fitShape = geometry.front;
	} else {
		el.setAttribute('stroke', stroke);
		el.setAttribute('stroke-width', strokeWidth);
	}

	if (texture) {
		setTextureFill(front, texture, { tile, repeat, color, blend });
		if (ext) ext.setFill(front.getAttribute('fill'));
	} else {
		const paint = color || '#8aa';
		if (ext) ext.setFill(paint);
		else front.setAttribute('fill', paint);
	}

	const fit = text ? setText(fitShape, text, out, { fill: textFill }) : null;

	return {
		message: fit?.fits
			? `font size ${fit.fontSize.toFixed(1)}px, ${fit.lines.length} lines`
			: 'Text does not fit or was omitted.',
		layer,
		front,
		fitShape,
		ext
	};
}

function erode(source, width, height, radius) {
	const inverse = source.map(value => 1 - value);
	return dilate(inverse, width, height, radius).map(value => 1 - value);
}

function extrude(shape, depth, {
	angle = 45,
	scale = 1,
	box = null,
	light = 135,
	samples = 120,
	minDark = 0.05,
	maxDark = 0.55,
	backDark = 0.6
} = {}) {
	let front = dedupePoints(toPoints(shape, samples));
	const rad = a => a * Math.PI / 180;
	const offset = [depth * Math.cos(rad(angle)), -depth * Math.sin(rad(angle))];
	const bounds = bboxOf(front);
	const center = [bounds.x + bounds.w / 2, bounds.y + bounds.h / 2];

	let back = front.map(([x, y]) => [
		center[0] + (x - center[0]) * scale + offset[0],
		center[1] + (y - center[1]) * scale + offset[1]
	]);

	if (box) {
		const all = bboxOf(front.concat(back));
		const s = Math.min(box.w / (all.w || 1), box.h / (all.h || 1));
		const tx = box.x + (box.w - all.w * s) / 2 - all.x * s;
		const ty = box.y + (box.h - all.h * s) / 2 - all.y * s;
		const transform = ([x, y]) => [x * s + tx, y * s + ty];
		front = front.map(transform);
		back = back.map(transform);
		offset[0] *= s;
		offset[1] *= s;
	}

	let area = 0;
	for (let i = 0; i < front.length; i++) {
		const [x1, y1] = front[i];
		const [x2, y2] = front[(i + 1) % front.length];
		area += x1 * y2 - x2 * y1;
	}

	const sign = area >= 0 ? 1 : -1;
	const lightVector = [Math.cos(rad(light)), -Math.sin(rad(light))];
	const walls = [];

	for (let i = 0; i < front.length; i++) {
		const j = (i + 1) % front.length;
		const dx = front[j][0] - front[i][0];
		const dy = front[j][1] - front[i][1];
		const length = Math.hypot(dx, dy);
		if (length < 1e-9) continue;

		const nx = sign * dy / length;
		const ny = -sign * dx / length;
		const mx = (back[i][0] + back[j][0] - front[i][0] - front[j][0]) / 2;
		const my = (back[i][1] + back[j][1] - front[i][1] - front[j][1]) / 2;
		if (nx * mx + ny * my <= 1e-9 * Math.hypot(mx, my)) continue;

		const lit = nx * lightVector[0] + ny * lightVector[1];
		const dark = minDark + (maxDark - minDark) * (1 - lit) / 2;
		walls.push({ points: [front[i], front[j], back[j], back[i]], dark });
	}

	return { front, back, walls, backDark };
}

function fitTextInShape(text, shape, options = {}) {
	const {
		allowWordBreak = false,
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		fontStyle = 'normal',
		lineHeight = 1.2,
		padding = 0,
		align = 'center',
		minFontSize = 1,
		maxFontSize = Infinity,
		precision = 0.1,
		verticalSteps = 40,
		curveSamples = 256,
		measure: customMeasure
	} = options;

	const polygon = toPolygon(shape, curveSamples);
	const ys = polygon.map(p => p[1]);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const height = maxY - minY;
	const eps = Math.max(1e-9, height * 1e-7);
	const vertexYs = [...new Set(ys)].sort((a, b) => a - b);
	const centroidY = polygonCentroidY(polygon) ?? (minY + maxY) / 2;
	const { measure, ascent, descent } =
		makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily);
	const paragraphs = String(text).split(/\r?\n/);

	function crossings(y) {
		const xs = [];
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const [xi, yi] = polygon[i];
			const [xj, yj] = polygon[j];
			if ((yi > y) !== (yj > y)) {
				xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
			}
		}
		xs.sort((a, b) => a - b);
		const intervals = [];
		for (let i = 0; i + 1 < xs.length; i += 2) {
			intervals.push([xs[i], xs[i + 1]]);
		}
		return intervals;
	}

	function intersect(a, b) {
		const out = [];
		let i = 0, j = 0;
		while (i < a.length && j < b.length) {
			const lo = Math.max(a[i][0], b[j][0]);
			const hi = Math.min(a[i][1], b[j][1]);
			if (hi > lo) out.push([lo, hi]);
			if (a[i][1] < b[j][1]) i++;
			else j++;
		}
		return out;
	}

	function bandInterval(top, bottom) {
		top -= padding;
		bottom += padding;
		const sampleYs = [top + eps, bottom - eps];

		for (const y of vertexYs) {
			if (y > top + eps && y < bottom - eps) {
				sampleYs.push(y - eps, y + eps);
			}
		}

		let intervals = null;
		for (const y of sampleYs) {
			const current = crossings(y);
			intervals = intervals ? intersect(intervals, current) : current;
			if (!intervals.length) return { x0: 0, x1: 0, width: 0 };
		}

		const widest = intervals.reduce(
			(best, item) => item[1] - item[0] > best[1] - best[0] ? item : best,
			intervals[0]
		);
		const x0 = widest[0] + padding;
		const x1 = widest[1] - padding;
		return { x0, x1, width: Math.max(0, x1 - x0) };
	}

	function tryLayout(fontSize, y0) {
		const lineHeightPx = fontSize * lineHeight;
		const lines = [];
		let lineIndex = 0;

		function nextBand() {
			const top = y0 + lineIndex++ * lineHeightPx;
			if (top + lineHeightPx > maxY + eps) return null;
			return { top, ...bandInterval(top, top + lineHeightPx) };
		}

		for (const paragraph of paragraphs) {
			const words = paragraph.split(/\s+/).filter(Boolean);
			let band = nextBand();
			if (!band) return null;
			if (!words.length) {
				lines.push({ text: '', band });
				continue;
			}

			let line = '';
			let i = 0;

			while (i < words.length) {
				const available = band.width / fontSize;
				const candidate = line ? `${line} ${words[i]}` : words[i];

				if (measure(candidate) <= available) {
					line = candidate;
					i++;
					continue;
				}

				if (allowWordBreak) {
					const prefix = line ? `${line} ` : '';
					let count = 0;
					while (
						count < words[i].length &&
						measure(prefix + words[i].slice(0, count + 1)) <= available
					) count++;

					if (count) {
						lines.push({ text: prefix + words[i].slice(0, count), band });
						words[i] = words[i].slice(count);
						line = '';
						band = nextBand();
						if (!band) return null;
						continue;
					}
				}

				if (line) {
					lines.push({ text: line, band });
					line = '';
				}
				band = nextBand();
				if (!band) return null;
			}

			if (line) lines.push({ text: line, band });
		}

		return lines;
	}

	function bestLayout(fontSize) {
		const lineHeightPx = fontSize * lineHeight;
		if (lineHeightPx > height) return null;

		let best = null;
		let bestScore = Infinity;

		for (let i = 0; i <= verticalSteps; i++) {
			const y0 = minY + ((height - lineHeightPx) * i) / verticalSteps;
			const lines = tryLayout(fontSize, y0);
			if (!lines?.length) continue;

			const top = lines[0].band.top;
			const bottom = lines[lines.length - 1].band.top + lineHeightPx;
			const score = Math.abs((top + bottom) / 2 - centroidY);

			if (score < bestScore) {
				bestScore = score;
				best = lines;
			}
		}

		return best;
	}

	let lo = minFontSize;
	let hi = Math.min(maxFontSize, height / lineHeight);
	let bestFont = null;
	let bestLines = bestLayout(hi);

	if (bestLines) {
		bestFont = hi;
	} else if (hi >= lo) {
		bestLines = bestLayout(lo);
		if (bestLines) {
			bestFont = lo;
			while (hi - lo > precision) {
				const mid = (lo + hi) / 2;
				const lines = bestLayout(mid);
				if (lines) {
					lo = mid;
					bestFont = mid;
					bestLines = lines;
				} else {
					hi = mid;
				}
			}
		}
	}

	const textAnchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
	if (!bestLines) {
		return {
			fits: false,
			fontSize: minFontSize,
			lines: [],
			textAnchor,
			lineHeight: minFontSize * lineHeight,
			fontFamily,
			fontWeight,
			fontStyle,
			align
		};
	}

	const fontSize = bestFont;
	const lineHeightPx = fontSize * lineHeight;

	return {
		fits: true,
		fontSize,
		lineHeight: lineHeightPx,
		fontFamily,
		fontWeight,
		fontStyle,
		align,
		textAnchor,
		lines: bestLines.map(({ text, band }) => ({
			text,
			width: measure(text) * fontSize,
			x: align === 'left' ? band.x0 : align === 'right' ? band.x1 : (band.x0 + band.x1) / 2,
			y: band.top + (lineHeightPx - (ascent + descent) * fontSize) / 2 + ascent * fontSize
		}))
	};
}

function largestComponent(mask, width, height) {
	const labels = new Int32Array(mask.length);
	const stack = new Int32Array(mask.length);
	let nextId = 0;
	let bestId = 0;
	let bestSize = 0;

	for (let i = 0; i < mask.length; i++) {
		if (!mask[i] || labels[i]) continue;

		const id = ++nextId;
		let top = 0;
		let size = 0;
		stack[top++] = i;
		labels[i] = id;

		while (top) {
			const index = stack[--top];
			size++;
			const x = index % width;
			const y = (index - x) / width;

			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const xx = x + dx;
					const yy = y + dy;
					if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;

					const neighbor = yy * width + xx;
					if (mask[neighbor] && !labels[neighbor]) {
						labels[neighbor] = id;
						stack[top++] = neighbor;
					}
				}
			}
		}

		if (size > bestSize) {
			bestSize = size;
			bestId = id;
		}
	}

	return mask.map((_, i) => labels[i] === bestId ? 1 : 0);
}

function lineDistance(point, a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const length = Math.hypot(dx, dy);
	if (length < 1e-12) return Math.hypot(point[0] - a[0], point[1] - a[1]);
	return Math.abs(dx * (a[1] - point[1]) - dy * (b[0] - point[0])) / length;
}

function makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily) {
	const cache = new Map();
	let ascent = 0.8;
	let descent = 0.2;
	let rawMeasure;

	if (customMeasure) {
		rawMeasure = customMeasure;
	} else {
		const canvas = typeof OffscreenCanvas !== 'undefined'
			? new OffscreenCanvas(1, 1)
			: document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.font = `${fontStyle} ${fontWeight} 100px ${fontFamily}`;
		rawMeasure = text => ctx.measureText(text).width / 100;

		const metrics = ctx.measureText('Mg');
		if (metrics.fontBoundingBoxAscent != null) {
			ascent = metrics.fontBoundingBoxAscent / 100;
			descent = metrics.fontBoundingBoxDescent / 100;
		}
	}

	const measure = text => {
		if (!cache.has(text)) cache.set(text, rawMeasure(text));
		return cache.get(text);
	};

	return { measure, ascent, descent };
}

function mCleanSvg(svgCode, { preserveAspectRatio = 'xMidYMid meet' } = {}) {
	const svg = svgFromCode(svgCode);
	const geometricAttrs = new Set([
		'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
		'width', 'height', 'dx', 'dy', 'stroke-width',
		'stroke-dasharray', 'stroke-dashoffset', 'font-size', 'viewBox'
	]);

	svg.removeAttribute('width');
	svg.removeAttribute('height');
	svg.removeAttribute('viewBox');
	svg.removeAttribute('preserveAspectRatio');
	svg.removeAttribute('version');
	svg.removeAttribute('xml:space');

	for (const el of [svg, ...svg.querySelectorAll('*')]) {
		for (const attr of [...el.attributes]) {
			if (/^(inkscape|sodipodi|adobe|dc|rdf):/.test(attr.name)) {
				el.removeAttribute(attr.name);
			}
		}

		if (el.hasAttribute('d')) {
			el.setAttribute('d', roundSvgPath(el.getAttribute('d')));
		}

		for (const attr of ['points', 'transform', ...geometricAttrs]) {
			if (el.hasAttribute(attr)) {
				el.setAttribute(attr, roundSvgNumbers(el.getAttribute(attr)));
			}
		}
	}

	const measureSvg = document.createElementNS(SVG_NS_LOCAL, 'svg');
	const group = document.createElementNS(SVG_NS_LOCAL, 'g');

	for (const attr of svg.attributes) {
		if (!['xmlns', 'width', 'height', 'viewBox', 'preserveAspectRatio'].includes(attr.name)) {
			measureSvg.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
		}
	}

	for (const child of svg.childNodes) {
		group.appendChild(child.cloneNode(true));
	}

	measureSvg.setAttribute('width', '1000');
	measureSvg.setAttribute('height', '1000');
	measureSvg.style.cssText =
		'position:fixed;left:-10000px;top:0;width:1000px;height:1000px;opacity:0;overflow:visible;pointer-events:none';

	measureSvg.appendChild(group);
	document.body.appendChild(measureSvg);

	const box = group.getBBox({ fill: true, stroke: true });
	measureSvg.remove();

	const x = Math.floor(box.x * 100) / 100;
	const y = Math.floor(box.y * 100) / 100;
	const right = Math.ceil((box.x + box.width) * 100) / 100;
	const bottom = Math.ceil((box.y + box.height) * 100) / 100;

	svg.setAttribute('width', '100%');
	svg.setAttribute('height', '100%');
	svg.setAttribute('viewBox', [
		svgNumber(x),
		svgNumber(y),
		svgNumber(Math.max(right - x, 0.01)),
		svgNumber(Math.max(bottom - y, 0.01))
	].join(' '));
	svg.setAttribute('preserveAspectRatio', preserveAspectRatio);
	svg.style.display = 'block';
	svg.style.width = '100%';
	svg.style.height = '100%';

	return svg;
}

function polygonCentroidY(points) {
	let area = 0;
	let cy = 0;

	for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
		const [xi, yi] = points[i];
		const [xj, yj] = points[j];
		const cross = xj * yi - xi * yj;
		area += cross;
		cy += (yi + yj) * cross;
	}

	return Math.abs(area) < 1e-12 ? null : cy / (3 * area);
}

function renderExtrusion(layer, geometry, {
	fill = '#8aa',
	stroke = 'white',
	strokeWidth = 1.5
} = {}) {
	const pointsText = points => points.map(p => p.join(',')).join(' ');
	const polygon = (points, attrs) => {
		const el = document.createElementNS(SVG_NS_LOCAL, 'polygon');
		el.setAttribute('points', pointsText(points));
		for (const [key, value] of Object.entries(attrs)) {
			el.setAttribute(key, value);
		}
		return el;
	};

	const group = document.createElementNS(SVG_NS_LOCAL, 'g');
	const fillTargets = [];
	const strokeTargets = [];
	const back = polygon(geometry.back, { fill });

	fillTargets.push(back);
	group.appendChild(back);
	group.appendChild(polygon(geometry.back, {
		fill: 'black',
		'fill-opacity': geometry.backDark
	}));

	for (const wall of geometry.walls) {
		const el = polygon(wall.points, {
			fill,
			stroke: fill,
			'stroke-width': 1,
			'stroke-linejoin': 'round'
		});
		fillTargets.push(el);
		strokeTargets.push(el);
		group.appendChild(el);
	}

	for (const wall of geometry.walls) {
		group.appendChild(polygon(wall.points, {
			fill: 'black',
			'fill-opacity': wall.dark
		}));
	}

	const front = polygon(geometry.front, {
		fill,
		stroke,
		'stroke-width': strokeWidth,
		'stroke-linejoin': 'round'
	});
	fillTargets.push(front);
	group.appendChild(front);
	layer.appendChild(group);

	return {
		group,
		front,
		setFill(paint) {
			for (const el of fillTargets) el.setAttribute('fill', paint);
			for (const el of strokeTargets) el.setAttribute('stroke', paint);
		}
	};
}

function roundSvgNumbers(text) {
	return text.replace(
		/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g,
		svgNumber
	);
}

function roundSvgPath(d) {
	const arity = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
	const tokens = d.match(
		/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g
	) || [];

	let command = '';
	let arg = 0;

	return tokens.map(token => {
		if (/^[a-zA-Z]$/.test(token)) {
			command = token;
			arg = 0;
			return token;
		}

		const cmd = command.toUpperCase();
		const count = arity[cmd];
		if (!count) return token;

		const arcFlag = cmd === 'A' && (arg === 3 || arg === 4);
		arg = (arg + 1) % count;
		return arcFlag ? token : svgNumber(token);
	}).join(' ');
}

function setText(shape, text, out, opts = {}) {
	const { fill, ...fitOpts } = opts;
	if (fill) out.setAttribute('fill', fill);
	if (!text) {
		out.replaceChildren();
		return null;
	}

	const fit = fitTextInShape(text, shape, {
		allowWordBreak: false,
		fontFamily: 'Arial',
		lineHeight: 1,
		padding: 12,
		align: 'center',
		curveSamples: 100,
		verticalSteps: 12,
		precision: 0.5,
		...fitOpts
	});

	applyFitToSvgText(out, fit);
	return fit;
}

function setTextureFill(el, imageUrl, {
	tile = 64,
	repeat = true,
	color = 'navy',
	blend = 'color-dodge'
} = {}) {
	const svg = el.ownerSVGElement;
	let defs = svg.querySelector('defs');

	if (!defs) {
		defs = document.createElementNS(SVG_NS_LOCAL, 'defs');
		svg.prepend(defs);
	}

	const key = `${imageUrl}|${repeat ? tile : 'fit'}|${color || ''}|${blend}`;
	const id = 'tex_' + [...key].reduce(
		(hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
		7
	);

	if (!defs.querySelector(`#${id}`)) {
		const pattern = document.createElementNS(SVG_NS_LOCAL, 'pattern');
		const image = document.createElementNS(SVG_NS_LOCAL, 'image');
		const size = repeat ? tile : 1;

		pattern.setAttribute('id', id);
		pattern.setAttribute('width', size);
		pattern.setAttribute('height', size);
		image.setAttribute('href', imageUrl);
		image.setAttribute('width', size);
		image.setAttribute('height', size);

		if (repeat) {
			pattern.setAttribute('patternUnits', 'userSpaceOnUse');
			image.setAttribute('preserveAspectRatio', 'none');
		} else {
			pattern.setAttribute('patternUnits', 'objectBoundingBox');
			pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
			image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
		}

		if (color) {
			const background = document.createElementNS(SVG_NS_LOCAL, 'rect');
			background.setAttribute('width', size);
			background.setAttribute('height', size);
			background.setAttribute('fill', color);
			pattern.appendChild(background);
			image.style.mixBlendMode = blend;
		}

		pattern.appendChild(image);
		defs.appendChild(pattern);
	}

	el.setAttribute('fill', `url(#${id})`);
}

function simplifyOpen(points, epsilon) {
	const last = points.length - 1;
	if (last < 2) return points.slice();

	const keep = new Uint8Array(points.length);
	keep[0] = keep[last] = 1;
	const stack = [[0, last]];

	while (stack.length) {
		const [start, end] = stack.pop();
		let maxDistance = 0;
		let index = -1;

		for (let i = start + 1; i < end; i++) {
			const distance = lineDistance(points[i], points[start], points[end]);
			if (distance > maxDistance) {
				maxDistance = distance;
				index = i;
			}
		}

		if (index >= 0 && maxDistance > epsilon) {
			keep[index] = 1;
			stack.push([start, index], [index, end]);
		}
	}

	return points.filter((_, i) => keep[i]);
}

function simplifyRing(points, epsilon) {
	if (points.length <= 3) return points.slice();

	let farthest = 0;
	let farthestDistance = -1;

	for (let i = 1; i < points.length; i++) {
		const distance = Math.hypot(
			points[i][0] - points[0][0],
			points[i][1] - points[0][1]
		);
		if (distance > farthestDistance) {
			farthestDistance = distance;
			farthest = i;
		}
	}

	const a = simplifyOpen(points.slice(0, farthest + 1), epsilon);
	const b = simplifyOpen(points.slice(farthest).concat([points[0]]), epsilon);
	return a.concat(b.slice(1, -1));
}

function svgFromCode(code) {
	const template = document.createElement('template');
	template.innerHTML = code.replace(/^\s*<\?xml[^>]*\?>/i, '').trim();

	const svg = template.content.querySelector('svg');
	svg.remove();
	return svg;
}

function svgNumber(value) {
	const n = Number(value);
	const integer = Math.round(n);
	return Math.abs(n - integer) < 1e-8
		? String(integer)
		: String(Number(n.toFixed(2)));
}

function toPoints(shape, samples) {
	if (shape?.kind && shape.data) return toPoints(shape.data, samples);

	if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
		const length = shape.getTotalLength();
		return Array.from({ length: samples }, (_, i) => {
			const p = shape.getPointAtLength((length * i) / samples);
			return [p.x, p.y];
		});
	}

	if (Array.isArray(shape)) {
		return shape.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]);
	}

	if (typeof shape?.r === 'number') {
		const { r, cx = 0, cy = 0 } = shape;
		return Array.from({ length: samples }, (_, i) => {
			const a = (2 * Math.PI * i) / samples;
			return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
		});
	}

	return [];
}

function toPolygon(shape, samples) {
	if (shape?.kind && shape.data) return toPolygon(shape.data, samples);

	if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
		const length = shape.getTotalLength();
		return Array.from({ length: samples }, (_, i) => {
			const p = shape.getPointAtLength((length * i) / samples);
			return [p.x, p.y];
		});
	}

	if (Array.isArray(shape)) {
		return shape.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]);
	}

	if (shape && Array.isArray(shape.points)) return toPolygon(shape.points, samples);

	if (typeof shape?.r === 'number') {
		const { r, cx = 0, cy = 0 } = shape;
		return Array.from({ length: samples }, (_, i) => {
			const a = 2 * Math.PI * i / samples;
			return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
		});
	}

	return [];
}

function traceOuter(mask, width, height) {
	const directions = [
		[1, 0], [1, 1], [0, 1], [-1, 1],
		[-1, 0], [-1, -1], [0, -1], [1, -1]
	];
	const isFilled = (x, y) =>
		x >= 0 && y >= 0 && x < width && y < height &&
		mask[y * width + x] === 1;

	let startX = -1;
	let startY = -1;

	for (let y = 0; y < height && startX < 0; y++) {
		for (let x = 0; x < width; x++) {
			if (isFilled(x, y)) {
				startX = x;
				startY = y;
				break;
			}
		}
	}

	if (startX < 0) return [];

	const contour = [[startX, startY]];
	let x = startX;
	let y = startY;
	let backgroundIndex = 4;
	let first = null;

	for (let guard = 0; guard < 4 * width * height; guard++) {
		let found = false;

		for (let k = 1; k <= 8; k++) {
			const i = (backgroundIndex + k) % 8;
			const nx = x + directions[i][0];
			const ny = y + directions[i][1];

			if (!isFilled(nx, ny)) continue;

			const previous = directions[(i + 7) % 8];
			const px = x + previous[0] - nx;
			const py = y + previous[1] - ny;

			if (!first) first = [nx, ny];
			else if (x === startX && y === startY &&
				nx === first[0] && ny === first[1]) return contour;

			backgroundIndex = directions.findIndex(
				d => d[0] === px && d[1] === py
			);
			x = nx;
			y = ny;
			contour.push([x, y]);
			found = true;
			break;
		}

		if (!found) return contour;
	}

	return contour;
}