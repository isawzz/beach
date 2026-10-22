const NO_UNIT = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'order', 'lineHeight']);
const STYLES = Object.freeze({
	w: 'width',
	h: 'height',
	fw: 'fontWeight',
	fz: 'fontFamily',
	bg: (v) => ['backgroundColor', clrHex(v)],
	fg: (v) => ['color', clrHex(v)],
	bf: (v) => {
		let c = clrHex(v);
		let ct = clrText(v);
		let ff = 'opensans', fw = '400', fs = '100%';
		if (ct == '#000000') {
			ff = 'roboto'; //'Bahnschrift';
			fw = '550';
			fs = '75%';
			return { backgroundColor: c, color: ct, fontFamily: ff, fontWeight: fw, fontStretch: fs };
		}
		// let fontStretch = ct == '#000000' ? '86%' : '100%';
		// let fontFamily = ct == '#000000' ? 'Bahnschrift' : 'opensans';
		// let fontWeight = ct == '#000000' ? '550' : '400';
		return { backgroundColor: c, color: ct };
	},
	bfg: (v) => ({
		backgroundColor: clrHex(v),
		color: clrText(v)
	}),
	p: 'padding',
	m: 'margin',
	op: 'opacity',
	r: 'borderRadius',
	z: 'zIndex',

	// --- Flexbox & Alignment Shortcuts ---
	flex: 'flex',
	dir: 'flexDirection',
	align: 'alignItems',
	justify: 'justifyContent',
	gap: 'gap',

	// --- Quick Layout Bundles (Returns flat style objects) ---
	center: () => ({ display: 'flex', justifyContent: 'center', alignItems: 'center' }),
	flexCol: () => ({ display: 'flex', flexDirection: 'column' }),
	flexRow: () => ({ display: 'flex', flexDirection: 'row' }),
	pos: (v) => {
		// Allows passing array [top, right, bottom, left] or single offset value
		if (Array.isArray(v)) {
			return { position: 'absolute', top: v[0], right: v[1], bottom: v[2], left: v[3] };
		}
		return { position: 'absolute', top: v, left: v };
	},

	// --- Dynamic Transformers (Returns [propertyName, computedValue]) ---
	sz: (v) => {
		// If array [w, h], mStyle can recurse or accept object; if scalar, sets both width and height
		return typeof v === 'object'
			? { width: Array.isArray(v) ? v[0] : v.w, height: Array.isArray(v) ? v[1] : v.h }
			: { width: v, height: v };
	},

	// Standard Row (Items side-by-side, vertically centered)
	flexRow: (v) => ({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: v ?? 8
	}),

	// Standard Column (Items stacked vertically)
	flexCol: (v) => ({
		display: 'flex',
		flexDirection: 'column',
		gap: v ?? 8
	}),

	// Perfect Dead-Center (Horizontal & Vertical)
	center: () => ({
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}),

	// Navigation / Header Row (Items spaced out to ends, vertically centered)
	flexBetween: (v) => ({
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: v ?? 8
	}),

	// Wrapping Card/Tile Row (Items wrap naturally to next line)
	flexWrap: (v) => ({
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: v ?? 8
	}),

	// Pin/Align Content to Right/Bottom
	flexEnd: (dir = 'row') => ({
		display: 'flex',
		flexDirection: dir === 'col' ? 'column' : 'row',
		justifyContent: 'flex-end',
		alignItems: dir === 'col' ? 'flex-end' : 'center'
	}),

	// Fixed N-Column Grid (e.g., gridCols: 3 creates 3 equal columns)
	gridCols: v => {
		let [cols, gap] = Array.isArray(v) ? v : [v, 8];
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${cols}, 1fr)`,
			gap: gap
		};
	},

	// Responsive Auto-Fit Cards (Columns auto-fill based on min width in px)
	// Usage: { gridCards: 200 } -> Cards never shrink below 200px
	gridCards: (minWidth = 150, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
		gap: gap
	}),

	// Board Game Cell Center (Centers content inside a grid cell)
	gridCenter: () => ({
		display: 'grid',
		placeItems: 'center'
	}),

	// Sidebar + Main Area (e.g., gridSidebar: [250, '1fr'] or gridSidebar: ['200px', 'auto'])
	gridSidebar: (v = [250, '1fr'], gap = 12) => {
		const left = typeof v[0] === 'number' ? `${v[0]}px` : v[0];
		const right = typeof v[1] === 'number' ? `${v[1]}px` : v[1];
		return {
			display: 'grid',
			gridTemplateColumns: `${left} ${right}`,
			gap: gap
		};
	},

	// Forces all items in a grid to stretch fully across both axes of their cell
	gridStretch: (cols = 2, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(${cols}, 1fr)`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),

	// Responsive grid cards where every item stretches vertically & horizontally to fill its cell
	gridCardsStretch: (minWidth = 150, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),

	// Target an individual grid item to span the full width/height of its cell
	selfStretch: () => ({
		justifySelf: 'stretch',
		alignSelf: 'stretch',
		w: '100%',
		h: '100%'
	}),

	// Flex row where children match each other's height across the full row
	flexRowStretch: (v) => ({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'stretch',
		gap: v ?? 8
	}),

	// Flex column where children fill the full width of the container
	flexColStretch: (v) => ({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: v ?? 8
	}),

	gridAuto: (minWidth = 120, gap = 8) => ({
		display: 'grid',
		gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
		alignItems: 'stretch',
		justifyItems: 'stretch',
		gap: gap
	}),

	// 2. Fixed Total Item Count (Auto-Calculated Equal Grid):
	// Given N total items, calculates columns/rows to form a square/uniform layout.
	gridUniform: (itemCount = 1, gap = 8) => {
		const cols = Math.ceil(Math.sqrt(itemCount)) || 1;
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${cols}, 1fr)`,
			alignItems: 'stretch',
			justifyItems: 'stretch',
			gap: gap
		};
	}
});


function mStyle(elem, styles = {}) {
	elem = toElem(elem);
	const target = elem.style || elem;

	for (let key in styles) {
		let val = styles[key];

		// Resolve shorthand or functional properties first
		let prop = STYLES[key] || key;
		if (typeof prop === 'function') {
			const res = prop(val);
			// Handles functional generators that return flat style objects (e.g., bfg, center)
			if (res && typeof res === 'object' && !Array.isArray(res)) {
				mStyle(elem, res);
				continue;
			}
			if (Array.isArray(res)) [prop, val] = res;
		}

		// If val is null or undefined, delete/remove the property or attribute
		if (val == null) {
			if (prop in target) {
				target[prop] = ''; // Clears inline CSS rule
			} else if (elem.nodeType) {
				elem.removeAttribute(prop); // Removes DOM attribute
			}
			continue;
		}

		// Auto-append 'px' for numeric values
		if (typeof val === 'number' && !NO_UNIT.has(prop)) val += 'px';

		// Single assignment branch
		if (prop in target) target[prop] = val;
		else if (elem.nodeType) elem.setAttribute(prop, val);
	}

	return elem;
}