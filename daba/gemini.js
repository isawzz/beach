//const NS = 'http://www.w3.org/2000/svg';

/* ==========================================================================
	 MAIN FUNCTIONS (ALPHABETICAL)
	 ========================================================================== */

function createStageX(dParent) {
	let svg = mSvg(dParent, { id: 'svg', viewBox: '0 0 400 400', width: '100%', height: '100%' });
	let g = mDom(svg, { tag: 'g', id: 'shapeLayer' });
	let text = mDom(svg, { tag: 'text', id: 'out' });
	return { svg, g, text };
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

	let shape, el;
	if (def.kind === 'circle') {
		el = document.createElementNS(NS, 'circle');
		el.setAttribute('cx', def.data.cx); el.setAttribute('cy', def.data.cy); el.setAttribute('r', def.data.r);
		shape = def.data;
	} else if (def.kind === 'points' || typeof def.kind === 'undefined') {
		el = document.createElementNS(NS, 'polygon');
		el.setAttribute('points', def.data.map(p => p.join(',')).join(' '));
		shape = def.data;
	} else {
		el = document.createElementNS(NS, def.tag);
		for (const [k, v] of Object.entries(def.attrs)) el.setAttribute(k, v);
		shape = el;
	}
	layer.appendChild(el);

	let front = el;
	let fitShape = shape;
	let ext = null;

	if (depth > 0) {
		const vb = layer.ownerSVGElement.viewBox.baseVal;
		const box = vb && vb.width
			? { x: vb.x + vb.width * 0.05, y: vb.y + vb.height * 0.05, w: vb.width * 0.9, h: vb.height * 0.9 }
			: { x: 20, y: 20, w: 360, h: 360 };

		const g = extrude(shape, depth, { angle, scale, box });
		el.remove();
		ext = renderExtrusion(layer, g, { fill: color || '#8aa', stroke, strokeWidth });
		front = ext.front;
		fitShape = g.front;
	} else {
		el.setAttribute('stroke', stroke);
		el.setAttribute('stroke-width', strokeWidth);
	}

	if (texture) {
		setTextureFill(front, texture, { tile, repeat, color, blend });
		if (ext) ext.setFill(front.getAttribute('fill'));
	} else {
		const paint = color || '#8aa';
		if (ext) ext.setFill(paint); else front.setAttribute('fill', paint);
	}

	const r = text ? setText(fitShape, text, out, { fill: textFill }) : null;
	return {
		message: (r && r.fits
			? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines`
			: 'Text does not fit even at the minimum font size.'), layer, front, fitShape, ext
	};
}

async function emojiSvgToShape(svg, options = {}) {
	const {
		box = { x: 20, y: 20, w: 360, h: 360 },
		resolution = 512,
		alphaThreshold = 16,
		closing = 3,
		maxPoints = 64,
		tolerance = 0.5,
		round = true,
	} = options;

	const root = toSvgRoot(svg);

	const host = document.createElement('div');
	host.style.cssText = 'position:absolute;left:-99999px;top:0;width:500px;height:500px;visibility:hidden;pointer-events:none';
	host.appendChild(root);
	document.body.appendChild(host);
	let vb;
	try {
		const b = root.viewBox && root.viewBox.baseVal;
		if (b && b.width > 0 && b.height > 0) vb = { x: b.x, y: b.y, w: b.width, h: b.height };
		else {
			const bb = root.getBBox();
			if (!(bb.width > 0 && bb.height > 0)) throw new Error('SVG has no drawable content');
			vb = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
			root.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
		}
	} finally {
		host.remove();
	}

	const aspect = vb.w / vb.h;
	const W = aspect >= 1 ? resolution : Math.max(1, Math.round(resolution * aspect));
	const H = aspect >= 1 ? Math.max(1, Math.round(resolution / aspect)) : resolution;
	root.setAttribute('width', W);
	root.setAttribute('height', H);
	root.removeAttribute('style');
	root.setAttribute('preserveAspectRatio', 'xMidYMid meet');

	const xml = new XMLSerializer().serializeToString(root);
	const img = new Image();
	img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
	await img.decode();

	const pad = Math.ceil(closing) + 2;
	const CW = W + 2 * pad, CH = H + 2 * pad;
	const canvas = document.createElement('canvas');
	canvas.width = CW; canvas.height = CH;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(img, pad, pad, W, H);
	const rgba = ctx.getImageData(0, 0, CW, CH).data;

	let mask = new Uint8Array(CW * CH);
	let any = false;
	for (let i = 0; i < mask.length; i++) {
		if (rgba[i * 4 + 3] > alphaThreshold) { mask[i] = 1; any = true; }
	}
	if (!any) throw new Error('Nothing was drawn (fully transparent SVG)');

	if (closing > 0) mask = erode(dilate(mask, CW, CH, closing), CW, CH, closing);
	mask = largestComponent(mask, CW, CH);
	const contour = traceOuter(mask, CW, CH);
	if (contour.length < 3) throw new Error('Could not trace an outline');

	let pts = contour.map(([px, py]) => [
		vb.x + ((px - pad + 0.5) / W) * vb.w,
		vb.y + ((py - pad + 0.5) / H) * vb.h,
	]);

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	for (const [x, y] of pts) {
		if (x < minX) minX = x; if (x > maxX) maxX = x;
		if (y < minY) minY = y; if (y > maxY) maxY = y;
	}
	if (box) {
		const w = maxX - minX || 1, h = maxY - minY || 1;
		const s = Math.min(box.w / w, box.h / h);
		const tx = box.x + (box.w - w * s) / 2 - minX * s;
		const ty = box.y + (box.h - h * s) / 2 - minY * s;
		pts = pts.map(([x, y]) => [x * s + tx, y * s + ty]);
	}

	let dx0 = Infinity, dy0 = Infinity, dx1 = -Infinity, dy1 = -Infinity;
	for (const [x, y] of pts) {
		dx0 = Math.min(dx0, x); dx1 = Math.max(dx1, x);
		dy0 = Math.min(dy0, y); dy1 = Math.max(dy1, y);
	}
	const diag = Math.hypot(dx1 - dx0, dy1 - dy0);
	let simple = simplifyRing(pts, tolerance);
	if (simple.length > maxPoints) {
		let lo = tolerance, hi = diag, best = simplifyRing(pts, hi);
		for (let i = 0; i < 40 && hi - lo > 1e-3; i++) {
			const mid = (lo + hi) / 2;
			const r = simplifyRing(pts, mid);
			if (r.length <= maxPoints) { hi = mid; best = r; } else lo = mid;
		}
		simple = best;
	}
	if (round) simple = cleanRounded(simple.map(([x, y]) => [Math.round(x), Math.round(y)]));
	if (simple.length < 3) throw new Error('Outline collapsed to fewer than 3 points');

	let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
	for (const [x, y] of simple) {
		bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x);
		by0 = Math.min(by0, y); by1 = Math.max(by1, y);
	}
	return {
		data: simple,
		bbox: { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 },
	};
}

function mCleanSvg(svgCode, options = {}) {
	const preserve = options.preserveRatio ?? options.preserveAspectRatio;
	const ratioMode = preserve === true ? 'xMidYMid meet' : (typeof preserve === 'string' ? preserve : 'none');

	const doc = new DOMParser().parseFromString(svgCode, 'image/svg+xml');
	const source = doc.documentElement;

	const roundNum = (v) => {
		const n = parseFloat(v);
		if (isNaN(n)) return v;
		return Number.isInteger(n) ? n : parseFloat(n.toFixed(2));
	};

	const roundStr = (str) => str.replace(/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g, (m, idx, full) => {
		const prevChar = full.slice(0, idx).trim().slice(-1).toUpperCase();
		if (prevChar === 'A') return m;
		return roundNum(m);
	});

	for (const el of source.querySelectorAll('path, polygon, polyline, rect, circle, ellipse, line')) {
		if (el.hasAttribute('d')) el.setAttribute('d', roundStr(el.getAttribute('d')));
		if (el.hasAttribute('points')) el.setAttribute('points', roundStr(el.getAttribute('points')));
		for (const attr of ['x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2']) {
			if (el.hasAttribute(attr)) el.setAttribute(attr, roundNum(el.getAttribute(attr)));
		}
	}

	const measureContainer = document.createElement('div');
	Object.assign(measureContainer.style, { position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' });
	measureContainer.appendChild(source);
	document.body.appendChild(measureContainer);

	let b;
	try {
		b = source.getBBox();
	} finally {
		measureContainer.remove();
	}

	const vbX = roundNum(b.x);
	const vbY = roundNum(b.y);
	const vbW = roundNum(b.width);
	const vbH = roundNum(b.height);

	source.setAttribute('width', '100%');
	source.setAttribute('height', '100%');
	source.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
	source.setAttribute('preserveAspectRatio', ratioMode);
	source.style.display = 'block';

	return source;
}

function svgFromCode(code) {
	const tpl = document.createElement('template');
	tpl.innerHTML = code.replace(/^\s*<\?xml[^>]*\?>/i, '').trim();
	let svg = tpl.content.querySelector('svg');
	if (!svg) {
		tpl.innerHTML = `<svg xmlns="${NS}">${code}</svg>`;
		svg = tpl.content.querySelector('svg');
	}
	return svg;
}

/* ==========================================================================
	 INTERNAL HELPER FUNCTIONS (ALPHABETICAL)
	 ========================================================================== */

function applyFitToSvgText(textEl, result) {
	while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
	textEl.setAttribute('font-size', result.fontSize);
	textEl.setAttribute('font-family', result.fontFamily);
	textEl.setAttribute('font-weight', result.fontWeight);
	textEl.setAttribute('font-style', result.fontStyle);
	textEl.setAttribute('text-anchor', result.textAnchor);
	textEl.setAttribute('xml:space', 'preserve');
	for (const ln of result.lines) {
		const t = document.createElementNS(NS, 'tspan');
		t.setAttribute('x', ln.x); t.setAttribute('y', ln.y);
		t.textContent = ln.text;
		textEl.appendChild(t);
	}
	return textEl;
}

function bboxOf(pts) {
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (const [x, y] of pts) {
		if (x < x0) x0 = x; if (x > x1) x1 = x;
		if (y < y0) y0 = y; if (y > y1) y1 = y;
	}
	return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function cleanRounded(pts) {
	let out = pts, changed = true;
	while (changed && out.length > 3) {
		changed = false;
		const next = [], n = out.length;
		for (let i = 0; i < n; i++) {
			const prev = out[(i + n - 1) % n], cur = out[i], nxt = out[(i + 1) % n];
			const dup = cur[0] === prev[0] && cur[1] === prev[1];
			const cross = (cur[0] - prev[0]) * (nxt[1] - cur[1]) - (cur[1] - prev[1]) * (nxt[0] - cur[0]);
			if (dup || cross === 0) { changed = true; continue; }
			next.push(cur);
		}
		if (next.length < 3) break;
		out = next;
	}
	return out;
}

function dedupe(pts) {
	return pts.filter((p, i) => {
		const q = pts[(i + pts.length - 1) % pts.length];
		return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9;
	});
}

function dilate(src, W, H, r) {
	const tmp = new Uint8Array(src.length), out = new Uint8Array(src.length);
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			let v = 0;
			for (let k = Math.max(0, x - r); k <= Math.min(W - 1, x + r); k++) if (src[y * W + k]) { v = 1; break; }
			tmp[y * W + x] = v;
		}
	}
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			let v = 0;
			for (let k = Math.max(0, y - r); k <= Math.min(H - 1, y + r); k++) if (tmp[k * W + x]) { v = 1; break; }
			out[y * W + x] = v;
		}
	}
	return out;
}

function erode(src, W, H, r) {
	const inv = src.map(v => 1 - v);
	return dilate(inv, W, H, r).map(v => 1 - v);
}

function extrude(shape, depth, options = {}) {
	const { angle = 45, scale = 1, box = null, light = 135, samples = 120, minDark = 0.05, maxDark = 0.55, backDark = 0.6 } = options;
	let front = dedupe(toPoints(shape, samples));
	if (front.length < 3) throw new Error('Shape needs at least 3 points');
	const rad = a => (a * Math.PI) / 180;
	const off = [depth * Math.cos(rad(angle)), -depth * Math.sin(rad(angle))];
	const bb0 = bboxOf(front);
	const c = [bb0.x + bb0.w / 2, bb0.y + bb0.h / 2];
	let back = front.map(([x, y]) => [c[0] + (x - c[0]) * scale + off[0], c[1] + (y - c[1]) * scale + off[1]]);

	if (box) {
		const all = bboxOf(front.concat(back));
		const s = Math.min(box.w / (all.w || 1), box.h / (all.h || 1));
		const tx = box.x + (box.w - all.w * s) / 2 - all.x * s;
		const ty = box.y + (box.h - all.h * s) / 2 - all.y * s;
		const T = ([x, y]) => [x * s + tx, y * s + ty];
		front = front.map(T); back = back.map(T);
		off[0] *= s; off[1] *= s;
	}

	let area = 0;
	for (let i = 0, n = front.length; i < n; i++) {
		const [x1, y1] = front[i], [x2, y2] = front[(i + 1) % n];
		area += x1 * y2 - x2 * y1;
	}
	const sign = area >= 0 ? 1 : -1;
	const L = [Math.cos(rad(light)), -Math.sin(rad(light))];
	const walls = [], n = front.length;
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const dx = front[j][0] - front[i][0], dy = front[j][1] - front[i][1];
		const len = Math.hypot(dx, dy);
		if (len < 1e-9) continue;
		const nx = (sign * dy) / len, ny = (-sign * dx) / len;
		const mx = (back[i][0] + back[j][0] - front[i][0] - front[j][0]) / 2;
		const my = (back[i][1] + back[j][1] - front[i][1] - front[j][1]) / 2;
		if (nx * mx + ny * my <= 1e-9 * Math.hypot(mx, my)) continue;
		const lit = nx * L[0] + ny * L[1];
		const dark = minDark + (maxDark - minDark) * (1 - lit) / 2;
		walls.push({ points: [front[i], front[j], back[j], back[i]], dark });
	}

	return { front, back, walls, backDark, bbox: bboxOf(front.concat(back)), offset: off };
}

function fitTextInShape(text, shape, options = {}) {
	const {
		allowWordBreak = false, fontFamily = 'sans-serif', fontWeight = 'normal', fontStyle = 'normal',
		lineHeight = 1.2, padding = 0, align = 'center', minFontSize = 1, maxFontSize = Infinity,
		precision = 0.1, verticalSteps = 40, curveSamples = 256, measure: customMeasure,
	} = options;
	const poly = toPolygon(shape, curveSamples);
	if (poly.length < 3) throw new Error('Shape needs at least 3 points');
	const ysAll = poly.map(p => p[1]);
	const minY = Math.min(...ysAll), maxY = Math.max(...ysAll), H = maxY - minY;
	const eps = Math.max(1e-9, H * 1e-7);
	const vertexYs = [...new Set(ysAll)].sort((a, b) => a - b);
	const centroidY = polygonCentroidY(poly) ?? (minY + maxY) / 2;

	function bandInterval(top, bottom) {
		top -= padding; bottom += padding;
		const ys = [top + eps, bottom - eps];
		for (const vy of vertexYs) if (vy > top + eps && vy < bottom - eps) ys.push(vy - eps, vy + eps);
		let cur = null;
		for (const y of ys) {
			const iv = gCrossings(poly, y);
			cur = cur ? gIntersect(cur, iv) : iv;
			if (!cur.length) return { x0: 0, x1: 0, width: 0 };
		}
		let best = cur[0];
		for (const iv of cur) if (iv[1] - iv[0] > best[1] - best[0]) best = iv;
		const x0 = best[0] + padding, x1 = best[1] - padding;
		return { x0, x1, width: Math.max(0, x1 - x0) };
	}

	const { M, ascent, descent } = makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily);
	const paragraphs = String(text).split(/\r?\n/);

	function tryLayout(f, y0) {
		const L = f * lineHeight, lines = [];
		let b = 0;
		const next = () => {
			const top = y0 + b * L; b++;
			if (top + L > maxY + eps) return null;
			return { top, ...bandInterval(top, top + L) };
		};
		for (const para of paragraphs) {
			const tokens = para.split(/\s+/).filter(Boolean);
			let band = next();
			if (!band) return null;
			if (!tokens.length) { lines.push({ text: '', band }); continue; }
			let cur = '', i = 0;
			while (i < tokens.length) {
				const avail = band.width / f, word = tokens[i], cand = cur ? cur + ' ' + word : word;
				if (M(cand) <= avail) { cur = cand; i++; continue; }
				if (allowWordBreak) {
					const prefix = cur ? cur + ' ' : '';
					let k = 0;
					while (k < word.length && M(prefix + word.slice(0, k + 1)) <= avail) k++;
					if (k > 0) {
						lines.push({ text: prefix + word.slice(0, k), band });
						tokens[i] = word.slice(k); cur = ''; band = next();
						if (!band) return null;
						continue;
					}
				}
				if (cur) { lines.push({ text: cur, band }); cur = ''; }
				band = next();
				if (!band) return null;
			}
			if (cur) lines.push({ text: cur, band });
		}
		return lines;
	}

	function bestLayout(f) {
		const L = f * lineHeight;
		if (L > H) return null;
		let best = null, bestScore = Infinity;
		for (let s = 0; s <= verticalSteps; s++) {
			const y0 = minY + ((H - L) * s) / verticalSteps;
			const lines = tryLayout(f, y0);
			if (!lines || !lines.length) continue;
			const top = lines[0].band.top, bottom = lines[lines.length - 1].band.top + L;
			const score = Math.abs((top + bottom) / 2 - centroidY);
			if (score < bestScore) { bestScore = score; best = lines; }
		}
		return best;
	}

	let lo = minFontSize, hi = Math.min(maxFontSize, H / lineHeight);
	let bestF = null, bestLines = null;
	const top = hi >= lo ? bestLayout(hi) : null;
	if (top) { bestF = hi; bestLines = top; }
	else {
		const atLo = bestLayout(lo);
		if (atLo) {
			bestF = lo; bestLines = atLo;
			while (hi - lo > precision) {
				const mid = (lo + hi) / 2;
				const r = bestLayout(mid);
				if (r) { lo = mid; bestF = mid; bestLines = r; } else hi = mid;
			}
		}
	}

	const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
	if (!bestLines) return { fits: false, fontSize: minFontSize, lines: [], textAnchor: anchor, lineHeight: minFontSize * lineHeight, fontFamily, fontWeight, fontStyle, align };

	const f = bestF, L = f * lineHeight;
	return {
		fits: true, fontSize: f, lineHeight: L, fontFamily, fontWeight, fontStyle, align, textAnchor: anchor,
		lines: bestLines.map(({ text, band }) => ({
			text, width: M(text) * f,
			x: align === 'left' ? band.x0 : align === 'right' ? band.x1 : (band.x0 + band.x1) / 2,
			y: band.top + (L - (ascent + descent) * f) / 2 + ascent * f,
		})),
	};
}

function gCrossings(poly, y) {
	const xs = [];
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i], [xj, yj] = poly[j];
		if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
	}
	xs.sort((a, b) => a - b);
	const out = [];
	for (let k = 0; k + 1 < xs.length; k += 2) out.push([xs[k], xs[k + 1]]);
	return out;
}

function gIntersect(A, B) {
	const out = [];
	let i = 0, j = 0;
	while (i < A.length && j < B.length) {
		const lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]);
		if (hi > lo) out.push([lo, hi]);
		if (A[i][1] < B[j][1]) i++; else j++;
	}
	return out;
}

function largestComponent(mask, W, H) {
	const label = new Int32Array(mask.length), stack = new Int32Array(mask.length);
	let next = 0, bestId = 0, bestSize = 0;
	for (let i = 0; i < mask.length; i++) {
		if (!mask[i] || label[i]) continue;
		const id = ++next;
		let sp = 0, size = 0;
		stack[sp++] = i; label[i] = id;
		while (sp) {
			const p = stack[--sp]; size++;
			const x = p % W, y = (p - x) / W;
			for (let dy = -1; dy <= 1; dy++) {
				const yy = y + dy; if (yy < 0 || yy >= H) continue;
				for (let dx = -1; dx <= 1; dx++) {
					const xx = x + dx; if (xx < 0 || xx >= W) continue;
					const q = yy * W + xx;
					if (mask[q] && !label[q]) { label[q] = id; stack[sp++] = q; }
				}
			}
		}
		if (size > bestSize) { bestSize = size; bestId = id; }
	}
	return mask.map((_, i) => (label[i] === bestId ? 1 : 0));
}

function lineDist(p, a, b) {
	const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
	if (len < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
	return Math.abs(dx * (a[1] - p[1]) - dy * (a[0] - p[0])) / len;
}

function makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily) {
	const cache = new Map();
	let raw, ascent = 0.8, descent = 0.2;
	if (customMeasure) {
		raw = customMeasure;
	} else {
		const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.font = `${fontStyle} ${fontWeight} 100px ${fontFamily}`;
		raw = s => ctx.measureText(s).width / 100;
		const m = ctx.measureText('Mg');
		if (m.fontBoundingBoxAscent != null) {
			ascent = m.fontBoundingBoxAscent / 100;
			descent = m.fontBoundingBoxDescent / 100;
		}
	}
	const M = s => {
		let w = cache.get(s);
		if (w === undefined) { w = raw(s); cache.set(s, w); }
		return w;
	};
	return { M, ascent, descent };
}

function polygonCentroidY(poly) {
	let a = 0, cy = 0;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i], [xj, yj] = poly[j];
		const c = xj * yi - xi * yj;
		a += c; cy += (yi + yj) * c;
	}
	return Math.abs(a) < 1e-12 ? null : cy / (3 * a);
}

function renderExtrusion(layer, g, options = {}) {
	const { fill = '#8aa', stroke = 'white', strokeWidth = 1.5 } = options;
	const pts = p => p.map(q => q.join(',')).join(' ');
	const mk = (points, attrs) => {
		const el = document.createElementNS(NS, 'polygon');
		el.setAttribute('points', pts(points));
		for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
		return el;
	};
	const group = document.createElementNS(NS, 'g');
	const fillTargets = [], strokeTargets = [];
	const back = mk(g.back, { fill });
	fillTargets.push(back); group.appendChild(back);
	group.appendChild(mk(g.back, { fill: 'black', 'fill-opacity': g.backDark }));
	for (const w of g.walls) {
		const e = mk(w.points, { fill, stroke: fill, 'stroke-width': 1, 'stroke-linejoin': 'round' });
		fillTargets.push(e); strokeTargets.push(e); group.appendChild(e);
	}
	for (const w of g.walls) group.appendChild(mk(w.points, { fill: 'black', 'fill-opacity': w.dark }));
	const front = mk(g.front, { fill, stroke, 'stroke-width': strokeWidth, 'stroke-linejoin': 'round' });
	fillTargets.push(front); group.appendChild(front);
	layer.appendChild(group);

	return {
		group, front,
		setFill(paint) {
			for (const e of fillTargets) e.setAttribute('fill', paint);
			for (const e of strokeTargets) e.setAttribute('stroke', paint);
		},
	};
}

function setText(fitShape, text, out, opts = {}) {
	const { fill, ...fitOpts } = opts;
	if (fill) out.setAttribute('fill', fill);
	if (!text) { out.replaceChildren(); return null; }
	const r = fitTextInShape(text, fitShape, {
		allowWordBreak: false, fontFamily: 'Arial', lineHeight: 1, padding: 12,
		align: 'center', curveSamples: 100, verticalSteps: 12, precision: 0.5, ...fitOpts,
	});
	applyFitToSvgText(out, r);
	return r;
}

function setTextureFill(el, imageUrl, { tile = 64, repeat = true, color = 'navy', blend = 'color-dodge' } = {}) {
	const svg = el.ownerSVGElement;
	if (!svg) throw new Error('setTextureFill: append element to <svg> first');
	let defs = svg.querySelector('defs');
	if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.prepend(defs); }

	const key = `${imageUrl}|${repeat ? tile : 'fit'}|${color || ''}|${blend}`;
	const id = 'tex_' + [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

	if (!defs.querySelector('#' + id)) {
		const pattern = document.createElementNS(NS, 'pattern');
		pattern.setAttribute('id', id);
		const image = document.createElementNS(NS, 'image');
		image.setAttribute('href', imageUrl);
		const u = repeat ? tile : 1;
		if (repeat) {
			pattern.setAttribute('patternUnits', 'userSpaceOnUse');
			image.setAttribute('preserveAspectRatio', 'none');
		} else {
			pattern.setAttribute('patternUnits', 'objectBoundingBox');
			pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
			image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
		}
		for (const e of [pattern, image]) { e.setAttribute('width', u); e.setAttribute('height', u); }

		if (color) {
			const bg = document.createElementNS(NS, 'rect');
			bg.setAttribute('width', u); bg.setAttribute('height', u);
			bg.setAttribute('fill', color);
			pattern.appendChild(bg);
			image.style.mixBlendMode = blend;
		}
		pattern.appendChild(image);
		defs.appendChild(pattern);
	}
	el.setAttribute('fill', `url(#${id})`);
}

function simplifyOpen(pts, eps) {
	const last = pts.length - 1;
	if (last < 2) return pts.slice();
	const keep = new Uint8Array(pts.length);
	keep[0] = keep[last] = 1;
	const stack = [[0, last]];
	while (stack.length) {
		const [s, e] = stack.pop();
		let maxD = 0, idx = -1;
		for (let i = s + 1; i < e; i++) {
			const d = lineDist(pts[i], pts[s], pts[e]);
			if (d > maxD) { maxD = d; idx = i; }
		}
		if (idx !== -1 && maxD > eps) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
	}
	return pts.filter((_, i) => keep[i]);
}

function simplifyRing(ring, eps) {
	if (ring.length <= 3) return ring.slice();
	let far = 0, farD = -1;
	for (let i = 1; i < ring.length; i++) {
		const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
		if (d > farD) { farD = d; far = i; }
	}
	const a = simplifyOpen(ring.slice(0, far + 1), eps);
	const b = simplifyOpen(ring.slice(far).concat([ring[0]]), eps);
	return a.concat(b.slice(1, -1));
}

function toPoints(shape, samples) {
	if (shape && shape.kind && shape.data) return toPoints(shape.data, samples);
	if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
		const len = shape.getTotalLength(), out = [];
		for (let i = 0; i < samples; i++) {
			const p = shape.getPointAtLength((len * i) / samples);
			out.push([p.x, p.y]);
		}
		return out;
	}
	if (Array.isArray(shape)) return shape.map(p => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]));
	if (shape && typeof shape.r === 'number') {
		const { r, cx = 0, cy = 0 } = shape, out = [];
		for (let i = 0; i < samples; i++) {
			const a = (2 * Math.PI * i) / samples;
			out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
		return out;
	}
	throw new Error('Unsupported shape');
}

function toPolygon(shape, samples) {
	if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
		const len = shape.getTotalLength(), pts = [];
		for (let i = 0; i < samples; i++) {
			const p = shape.getPointAtLength((len * i) / samples);
			pts.push([p.x, p.y]);
		}
		return pts;
	}
	if (Array.isArray(shape)) return shape.map(p => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]));
	if (shape && Array.isArray(shape.points)) return toPolygon(shape.points, samples);
	if (shape && typeof shape.r === 'number') {
		const { r, cx = 0, cy = 0 } = shape, pts = [];
		for (let i = 0; i < samples; i++) {
			const a = (2 * Math.PI * i) / samples;
			pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
		return pts;
	}
	throw new Error('Unsupported shape');
}

function toSvgRoot(svg) {
	if (typeof svg === 'string') {
		const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
		if (doc.querySelector('parsererror')) throw new Error('Invalid SVG markup');
		return document.importNode(doc.documentElement, true);
	}
	if (svg instanceof Element) {
		const root = svg.matches('svg') ? svg : svg.ownerSVGElement || svg.querySelector('svg');
		if (!root) throw new Error('No <svg> found');
		return root.cloneNode(true);
	}
	throw new Error('Expected an SVG string or element');
}

function traceOuter(mask, W, H) {
	const fg = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
	const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
	let sx = -1, sy = -1;
	outer: for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fg(x, y)) { sx = x; sy = y; break outer; }
	if (sx < 0) return [];
	const contour = [[sx, sy]];
	let cx = sx, cy = sy, bi = 4, first = null;
	for (let guard = 0; guard < 4 * W * H; guard++) {
		let found = false;
		for (let k = 1; k <= 8; k++) {
			const i = (bi + k) % 8, nx = cx + DIRS[i][0], ny = cy + DIRS[i][1];
			if (fg(nx, ny)) {
				const pi = (i + 7) % 8, px = cx + DIRS[pi][0], py = cy + DIRS[pi][1];
				if (!first) first = [nx, ny];
				else if (cx === sx && cy === sy && nx === first[0] && ny === first[1]) return contour;
				const dx = px - nx, dy = py - ny;
				bi = DIRS.findIndex(d => d[0] === dx && d[1] === dy);
				cx = nx; cy = ny;
				contour.push([cx, cy]);
				found = true;
				break;
			}
		}
		if (!found) return contour;
	}
	return contour;
}