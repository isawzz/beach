
const NO_UNIT = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'order', 'lineHeight']);

const STYLES = Object.freeze({
	// --- Direct Attribute Setters (return null to skip remaining mStyle checks) ---
	fill: (v, el) => { el.setAttribute('fill', clrX(v)); return null; },
	stroke: (v, el) => { el.setAttribute('stroke', clrX(v)); return null; },
	thickness: (v, el) => { el.setAttribute('stroke-width', v); return null; },
	d: (v, el) => { el.setAttribute('d', v); return null; },
	viewBox: (v, el) => { el.setAttribute('viewBox', v); return null; },
	classes: (v, el) => { el.setAttribute('class', v); return null; },
	className: (v, el) => { el.setAttribute('class', v); return null; },

	// --- Content & DOM Property Aliases ---
	html: 'innerHTML',
	inner: 'innerHTML',

	// --- Sizing & Layout ---
	w: 'width',
	h: 'height',
	wmin: 'minWidth',
	hmin: 'minHeight',
	w100: () => ['width', '100%'],
	h100: () => ['height', '100%'],
	wv: () => ['width', '100vw'],
	hv: () => ['height', '100vh'],
	sz: (v) => (typeof v === 'object'
		? { width: Array.isArray(v) ? v[0] : v.w, height: Array.isArray(v) ? v[1] : v.h }
		: { width: v, height: v }),

	// --- Typography & Colors ---
	fw: 'fontWeight',
	fz: 'fontSize',
	family: 'fontFamily',
	bg: (v) => ['backgroundColor', clrX(v)],
	fg: (v) => ['color', clrX(v)],
	bf: (v) => {
		let c = clrX(v);
		let ct = clrText(v);
		if (ct == '#000000') {
			return { backgroundColor: c, color: ct, fontFamily: 'roboto', fontWeight: '550', fontStretch: '75%' };
		}
		return { backgroundColor: c, color: ct };
	},
	bfg: (v) => ({
		backgroundColor: clrX(v),
		color: clrText(v)
	}),

	// --- Background Shortcuts ---
	bgAttach: 'background-attachment',
	bgBlend: 'background-blend-mode',
	bgImage: 'background-image',
	bgRepeat: 'background-repeat',
	bgSize: 'background-size',
	bgSrc: (v) => ['background-image', `url(${v})`],
	border: (v) => {
		let parts = v.split(' ');
		if (parts.length == 1) return `1px solid ${clrX(v)}`;
		else if (parts.length == 2) {
			let n = parts.find((x) => isNumber(x[0]));
			let i = parts.indexOf(n);
			let color = i == 0 ? parts[1] : parts[0];
			n = n.includes('px') || n.includes('%') ? n : `${n}px`;
			return `${n} solid ${clrX(color)}`;
		} else return v;
	},

	// --- Margins & Padding ---
	m: 'margin',
	mtop: 'marginTop',
	mright: 'marginRight',
	mbottom: 'marginBottom',
	mleft: 'marginLeft',
	mh: (v) => ['margin', `0px ${v}px`],
	mv: (v) => ['margin', `${v}px 0px`],
	p: 'padding',
	ptop: 'paddingTop',
	pright: 'paddingRight',
	pbottom: 'paddingBottom',
	pleft: 'paddingLeft',
	ph: (v) => ['padding', `0px ${v}px`],
	pv: (v) => ['padding', `${v}px 0px`],

	// --- Visual & Flex Shortcuts ---
	op: 'opacity',
	r: 'borderRadius',
	rounding: 'borderRadius',
	round: () => ({ borderRadius: '50%' }),
	wrap: (v) => (v == 'hard' ? ['wrap', 'hard'] : ['flexWrap', 'wrap']),
	z: 'zIndex',
	dir: 'flexDirection',
	align: 'textAlign',
	justify: 'justifyContent',
	gap: 'gap',

	// --- Flexbox Layout Generators ---
	center: () => ({ display: 'flex', justifyContent: 'center', alignItems: 'center' }),
	flexRow: (v) => ({ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: v ?? 8 }),
	flexCol: (v) => ({ display: 'flex', flexDirection: 'column', gap: v ?? 8 }),
	flexBetween: (v) => ({ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: v ?? 8 }),
	flexRowWrap: (v) => ({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: v ?? 8 }),
	flexRowStretch: (v) => ({ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: v ?? 8 }),
	flexColStretch: (v) => ({ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: v ?? 8 }),
	flexEnd: (dir = 'row') => ({
		display: 'flex',
		flexDirection: dir === 'col' ? 'column' : 'row',
		justify: 'flex-end',
		alignItems: dir === 'col' ? 'flex-end' : 'center'
	}),
	flexbox: (v) => {
		let [hor, vert, gap, dir, wrap] = v.split(' ');
		console.log(hor, vert, gap, dir, wrap);
		//console.log(hor, vert, gap, dir, wrap);
		return { display: 'flex', justifyContent: hor, alignItems: vert, gap: Number(gap), flexDirection: dir, flexWrap: wrap };
	},
	flexCenterCenter: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }),
	flexCenterTop: () => ({ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }),
	flexColumnCenter: () => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }),
	flexLeftCenter: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }),
	flexLeftTop: () => ({ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexWrap: 'wrap' }),
	flexSpaceBetween: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }),

	// --- Grid Layout Generators ---
	grid: (v) => {
		let [rows, cols, gap, hor, vert] = v.split(' ');
		return { display: 'grid', gridTemplateRows: `repeat(${rows},1fr)`, gridTemplateColumns: `repeat(${cols},1fr)`, gap: Number(gap), justifyItems: hor, alignItems: vert };
	},
	gridCols: (v) => {
		let [cols, gap] = Array.isArray(v) ? v : [v, 8];
		return { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gap };
	},
	gridCards: (minWidth = 150, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
		gap: gap
	}),
	gridCenter: () => ({ display: 'grid', placeItems: 'center' }),
	gridSidebar: (v = [250, '1fr'], gap = 12) => {
		const left = typeof v[0] === 'number' ? `${v[0]}px` : v[0];
		const right = typeof v[1] === 'number' ? `${v[1]}px` : v[1];
		return { display: 'grid', gridTemplateColumns: `${left} ${right}`, gap: gap };
	},
	gridStretch: (cols = 2, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(${cols}, 1fr)`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),
	gridCardsStretch: (minWidth = 150, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),
	selfStretch: () => ({ justifySelf: 'stretch', alignSelf: 'stretch', w: '100%', h: '100%' }),
	gridAuto: (minWidth = 120, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),
	gridUniform: (itemCount = 1, gap = 8) => {
		const cols = Math.ceil(Math.sqrt(itemCount)) || 1;
		return { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, alignItems: 'stretch', justifyItems: 'stretch', gap: gap };
	}
});
const SVG_TAGS = new Set([
	'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
	'ellipse', 'g', 'text', 'tspan', 'defs', 'use', 'clipPath', 'mask', 'image'
]);
function mAppend(d, child) { toElem(d).appendChild(child); return child; }

function mDom(dParent, opts = {}) {
	const tag = opts.tag || 'div';
	const parent = isdef(dParent) ? toElem(dParent) : null;

	// Instantiates via createElementNS if it's an SVG tag or child of an SVG element
	const isSvg = SVG_TAGS.has(tag) || (parent && parent instanceof SVGElement);
	const d = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);

	if (tag === 'textarea' && !opts.wrap) opts.wrap = 'hard';

	mStyle(d, opts);

	if (parent) mAppend(parent, d);
	return d;
}
function mStyle(elem, opts = {}) {
	elem = toElem(elem);
	const styleObj = elem.style;

	for (let key in opts) {
		let val = opts[key];
		if (val == null || key === 'tag') continue;

		let prop = STYLES[key] || key;

		// 1. Handle Functions (passes val AND elem)
		if (typeof prop === 'function') {
			const res = prop(val, elem);

			// Direct attribute/DOM handler executed and returned null -> skip remaining checks
			if (res == null) continue;

			// Functional generator returned style object (e.g., bfg, flexRow, center)
			if (typeof res === 'object' && !Array.isArray(res)) {
				mStyle(elem, res);
				continue;
			}

			// Tuple transformer returned [prop, val] (e.g., bg -> ['backgroundColor', '#fff'])
			if (Array.isArray(res)) [prop, val] = res;
		}

		// 2. Deletions (clears inline style or attribute)
		if (val === null || val === undefined) {
			if (styleObj && prop in styleObj) styleObj[prop] = '';
			if (elem.removeAttribute) elem.removeAttribute(prop);
			continue;
		}

		// 3. Special Event Handlers (e.g., recClick)
		if (prop === 'recClick') {
			elem.onclick = async (ev) => {
				if (typeof recUserEvent === 'function') recUserEvent();
				await val(ev);
			};
			continue;
		}

		// 4. Direct DOM Object Properties & Standard Event Listeners
		if (['id', 'innerHTML', 'className', 'checked', 'value', 'src'].includes(prop) || prop.startsWith('on')) {
			elem[prop] = val;
			continue;
		}

		// 5. Standard Inline CSS Properties
		if (styleObj && prop in styleObj) {
			if (typeof val === 'number' && !NO_UNIT.has(prop)) val += 'px';
			styleObj[prop] = val;
			continue;
		}

		// 6. Fallback for SVG & HTML Attributes (transform, cx, cy, data-*, etc.)
		if (typeof elem.setAttribute === 'function') {
			elem.setAttribute(prop, val);
		}
	}

	return elem;
}
function mSvg(dParent, opts = {}) {
	const svg = document.createElementNS(NS, 'svg');
	mStyle(svg, opts);
	dParent?.appendChild(svg);
	return svg;
}
function msEmo(key, dParent, opts = {}) {
	let { label, w, h, ...styles } = opts;
	assertion(M.emo[key], `Missing emoji for key: ${key}`);
	const emo = M.emo[key];
	let d = mDom(dParent, { w, h, center: 1, dir: 'column', ...styles });
	if (opts.round) { h *= .8; }
	if (h < 64 || !label) {
		let e = mDom(d, { fz: h * .7, family: 'emoNoto', html: emo.emo });
		return d;
	}
	let e = mDom(d, { fz: h * .6, family: 'emoNoto', html: emo.emo });
	let t = mDom(d, { fz: h * .125, w: w - 20, align: 'center', overflow: 'hidden', whiteSpace: 'nowrap', html: label });
	if (t.scrollWidth > t.clientWidth) {
		mStyle(t, { textOverflow: 'ellipsis', title: label });
	}
	return d;
}
function msMeeple(key, dParent, opts = {}) {
	const t = Date.now();
	addKeys({ w: '100%', h: '100%', depth: 20 }, opts);
	let d = mDom(dParent, opts);
	let sh = key.data ? key : M.shapes[key];
	let { g, text } = createStageX(d);
	res = drawClaudeX(g, sh, opts.label || '', text, opts);
	console.log('drawn shape in', Date.now() - t, 'ms');
	return d;
}
