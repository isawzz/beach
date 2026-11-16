
const NO_UNIT = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'order', 'lineHeight']);

const STYLES = Object.freeze({
	// --- Flexbox Layout Generators ---
	center: () => ({ display: 'flex', justifyContent: 'center', alignItems: 'center' }),
	flexRow: (v) => ({ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: v ?? 8 }),
	flexCol: (v) => ({ display: 'flex', flexDirection: 'column', gap: v ?? 8 }),
	flexBetween: (v) => ({ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: v ?? 8 }),
	flexRowWrap: (v) => ({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: v ?? 8 }),
	flexRowStretch: (v) => ({ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: v ?? 8 }),
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
	flexCenterCenter: (v) => ({ gap: v ?? 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }),
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
	},
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
	border: (v) => {
		const parts = String(v).split(' ');
		if (parts.length > 2) return ['border', v];
		const num = parts.find(x => /^[\d.]/.test(x));
		const color = parts.find(x => x !== num);
		const width = !num ? '1px' : /^[\d.]+$/.test(num) ? `${num}px` : num;
		return ['border', `${width} solid ${clrX(color)}`];
	},

	// --- Background Shortcuts ---
	bgAttach: 'background-attachment',
	bgBlend: 'background-blend-mode',
	bgImage: 'background-image',
	bgRepeat: 'background-repeat',
	bgSize: 'background-size',
	bgSrc: (v) => ['background-image', `url(${v})`],

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

});
const SVG_TAGS = new Set([
	'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
	'ellipse', 'g', 'text', 'tspan', 'defs', 'use', 'clipPath', 'mask', 'image'
]);
async function dbPost(body) {
  let res = await fetch(getDA('dbUrl'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await res.json();
}
async function dbAddNewGameTable(table) {
  if (nundef(table)) table = { friendly: "mygame" + rWord(10), phase: "start", round: 1 };
  else addKeys({ phase: 'start', round: 1 }, table)
  return await dbPost({ cmd: "insert_row", table: "gametable", data: table });
}
async function dbDeleteAllTables() {
  return await dbPost({ cmd: "delete_all", table: "gametable" });
}
async function dbDeleteFinishedTables() {
  return await dbPost({ cmd: "delete_finished", table: "gametable" });
}
async function dbDeleteGameTable(id) {
  return await dbPost({ cmd: "delete_row", table: "gametable", id });
}
async function dbDropTable() {
  console.log(await dbPost({ cmd: "drop_table", table: "gametable" }));
}
async function dbFinalizeRound(table) {
  return await dbPost({ cmd: "finalize_round", table: "gametable", id: table.id, data: table });
}
async function dbGetDatabaseTables() {
  return await dbPost({ cmd: "get_database_tables" });
}
async function dbGetGameTable(id) {
  return await dbPost({ cmd: "get_table", id });
}
async function dbGetGameTables() {
  return await dbPost({ cmd: "get_game_tables", table: 'gametable' });
}
async function dbUpdateGameSync(uname, table, action) {
  return await dbPost({ cmd: "update_game_sync", id: table.id, player_id: uname, step: table.step, action });
}
async function dbUpdateGameTable(id, data) {
  return await dbPost({ cmd: "modify_row", table: "gametable", id, data });
}
async function dbUpdateGameTableFO(id, data) {
  data.expected = { step: data.step }
  return await dbPost({ cmd: "modify_row_fo", table: "gametable", id, data });
}
async function dbUpdateGameTableFS(id, data) {
  data.expected = { step: data.step } //not used anymore!
  return await dbPost({ cmd: "update_row_fs", table: "gametable", id, data });
}
function geoStar(n) {
	const points = n * 2;
	const angleStep = Math.PI / n;

	return Array.from({ length: points }, (_, i) => {
		const a = -Math.PI / 2 + i * angleStep;
		const r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});
}
function getDA(key) {
  if (isdef(DA[key])) return DA[key];
  let loc = window.location.href;
  DA.isMoxito = loc.includes('moxito.online');
  DA.isLocalhost = loc.startsWith('http:/' + '/localhost');
  DA.isLive = loc.startsWith('http:/' + '/127.');
  DA.isLocal = DA.isLocalhost || DA.isLive;
  DA.pageDir = loc.substring(0, loc.lastIndexOf('/') + 1);
  DA.serverRoot = DA.pageDir.replace(/[^/]+\/$/, '');
  DA.project = stringAfterLast(stringBeforeLast(loc, '/'), '/'); //console.log('project', DA.project);
  let phpdir = DA.project == 'day' ? 'common' : DA.project;
  DA.staticUrl = DA.isLocal ? `http://localhost/${SERVERDIR}/` : DA.serverRoot;
  DA.phpUrl = DA.isLocal ? `http://localhost/${SERVERDIR}/${phpdir}/ppph/` : (DA.pageDir + 'ppph/');
  DA.dbUrl = DA.isLocal ? `http://localhost/${SERVERDIR}/${phpdir}/ppph/api.php` : (DA.pageDir + 'ppph/api.php');
  DA.flaskUrl = (DA.isLocal ? 'http://localhost:5000/' : 'https://moxito.online/flaskgame0/');
  DA.nodeUrl = (DA.isLocal ? 'http://localhost:3000/' : 'https://games.moxito.online/');
  return DA[key];
}
async function getFiles(dir) {
  let res = await dbPost({ cmd: 'dir', dir });
  return res.files.filter(x => x != '.' && x != '..');
}
async function getTextures(dir = 'textures') { return await getFiles(`assets/${dir}`); }
function gtGame(name) { return (GT_GAMES.includes(name) && window[name] || gtDefault)(); }

function gtGameover(table) {
	const { winners } = table.fen, bg = U.color;
	const d = mDom('dMain', { fz: 30, pv: 20, align: 'center', w100: 1, background: `linear-gradient(45deg, ${bg}, #ffeedd, ${bg})` });
	mDom(d, { html: `GAME OVER - The winner${winners.length > 1 ? 's are' : ' is'} ${winners.join(', ')}!!!` });
	mDom(d, { tag: 'button', html: 'play again!', bg: '#00000080', fg: 'white', mtop: 10, onclick: () => gtStart(table) });
	mBy('dMain').prepend(d);
}
function gtSetToStarted(table) {
	gtGame(table.game).setup(table);
	Object.assign(table, { status: 'started', step: 0 });
	delete table.oldfen;
	return table;
}
async function gtShow() {
	const table = DA.tableDict?.[DA.tid], me = U.name;
	if (!table || table.status == 'open') {
		await DA.mainMenu('games');
		return showMessage(table ? 'table not started yet' : 'table missing', 4000);
	}
	mClear('dMain');
	T = table; F = table.fen;
	const game = DA.func = gtGame(table.game);
	const ui = DA.ui = await game.present(me, table);
	if (ui.refresh) mFall('dTable', 400);
	if (table.status == 'over') { pollSetMs(5000); gtGameover(table); }
	else {
		if (table.plorder.includes(me)) A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
		await game.activate(me, table, ui);
	}
}
async function gtStart(table) {
	gtSetToStarted(table);
	await (table.id ? tableSaveUpdate(table) : tableSaveNew(table));
	DA.tid = table.id;
	if (DA.menu == 'table') await updateMain(true); else await DA.mainMenu('table');
}
async function loadAssets() {
  if (M.config) return;
	let t = Date.now();
  M = await loadJson('y/m.json');
  M.config = await loadYaml('y/config.yaml');
  M.users = await loadYaml('y/users.yaml');
  M.images = await loadYaml('y/all_image_files.yaml');
  M.svgs = (await getFiles('assets/svg'));
  // M.emo = await loadYaml('y/diemo.yaml');
  M.emo = await loadJson('y/diemo.json'); Object.freeze(M.emo);
  M.emogroup = await loadYaml('y/digroup.yaml');
  M.emokeys = Object.keys(M.emo).sort();
  M.fa = await loadYaml('y/fadi.yaml'); Object.freeze(M.fa);
  M.fakeys = Object.keys(M.fa).sort();
	t = Date.now() - t; 
  // console.log('old assets',t);
	t = Date.now();
  M.shapes = await loadJson('y/eshapes.json');
	t = Date.now() - t; 
  // console.log('assets:shapes',t);
  t = Date.now();
	M.shapeKeys = Object.keys(M.shapes).sort();
	M.asciiCapitals = M.capital.filter(x => !x.includes('.') && !['Noum', 'Bras', 'Reykja'].some(y => x.startsWith(y))); // for generateTableName

  Object.freeze(M);
	t = Date.now() - t; 
  // console.log('sort keys',t);
}
async function loadJson(path) {
  let res = await fetch(getDA('staticUrl') + path);
  if (!res.ok) throw new Error(`fetchText: ${res.status} ${path}`);
  return await res.json();
}
async function loadImage(path) {
  return await new Promise((resolve, reject) => {
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight, img });
    img.onerror = (err) => reject(new Error('Failed to load image from src: ' + path));
    img.src = path;
  });
}
async function loadText(path) {
  //console.log(getDA('staticUrl') + path)
  let res = await fetch(getDA('staticUrl') + path);
  if (!res.ok) throw new Error(`fetchText: ${res.status} ${path}`);
  return await res.text();
}
async function loadYamlTimed(url) {
  let t = performance.now();
  const text = await (await fetch(getDA('staticUrl') + url)).text();
  const tFetch = performance.now() - t;
  t = performance.now();
  const obj = YAML.parse(text);                       // or whatever parser loadYaml uses
  console.log(url, `${(text.length / 1024).toFixed(0)} KB`, `fetch ${tFetch.toFixed(0)} ms`, `parse ${(performance.now() - t).toFixed(0)} ms`);
  return obj;
}
async function loadYaml(path) {
  let txt = await loadText(path);
  return YAML.parse(txt);
}
function mAppend(d, child) { toElem(d).appendChild(child); return child; }

function mBy(value, what, opts = {}) {
	//usage:
	// mBy(value, what, opts) finds elements by class, tag, name, attribute, query, or id.
	// value: the value to search for (string or array for attribute)
	// what: 'class', 'tag', 'name', 'attr', 'query', 'id'
	// opts: { root: element to search within, all: boolean to return all matches, value: attribute value for 'attr' }
	//examples:
	// mBy('info', 'id');                                 // first by ID
	// mBy('card', 'class', { all: true });               // all with class
	// mBy('svg', 'tag');                                 // first <svg>
	// mBy('email', 'name', { all: true });               // all with name
	// mBy('data-color', 'attr');                         // first with attribute
	// mBy(['data-color', '#ff0000'], 'attr', { all: true }); // matching value
	// mBy('card', 'class', { root: dParent, all: true }); // scoped lookup
	const { root = document, all = false } = opts;
	let found;

	switch (what) {
		case 'class':
			found = [...root.getElementsByClassName(value)];
			break;
		case 'tag':
			found = [...root.getElementsByTagName(value)];
			break;
		case 'name':
			found = [...root.querySelectorAll('[name]')].filter(el => el.getAttribute('name') === value);
			break;
		case 'attr': {
			const [key, attrValue] = Array.isArray(value) ? value : [value, opts.value];
			found = [...root.querySelectorAll('*')].filter(el => el.hasAttribute(key) && (attrValue === undefined || el.getAttribute(key) === String(attrValue)));
			break;
		}
		case 'query':
			found = [...root.querySelectorAll(value)];
			break;
		case 'id':
		default:
			found = [...root.querySelectorAll('[id]')].filter(el => el.id === value);
	}

	return all ? found : found[0] ?? null;
}
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
function mInputLine(dParent, onEnter, opts = {}) {
	return mDom(dParent, {
		tag: 'input', type: 'text', autocomplete: 'off',
		onclick: ev => ev.stopPropagation(),
		onkeydown: ev => { if (ev.key == 'Enter') onEnter(ev.target.value.trim().toLowerCase()); },
		...opts
	});
}
function mPlaceNear(elem, target, gap = 8) {
	const fw = elem.offsetWidth, fh = elem.offsetHeight, r = target.getBoundingClientRect();
	const vw = window.innerWidth, vh = window.innerHeight;
	const clamp = p => ({ left: Math.max(0, Math.min(p.left, vw - fw)), top: Math.max(0, Math.min(p.top, vh - fh)) });
	const sides = [
		{ fit: vh - r.bottom >= fh + gap, room: vh - r.bottom, pos: { left: r.left, top: r.bottom + gap } },
		{ fit: r.top >= fh + gap, room: r.top, pos: { left: r.left, top: r.top - gap - fh } },
		{ fit: vw - r.right >= fw + gap, room: vw - r.right, pos: { left: r.right + gap, top: r.top } },
		{ fit: r.left >= fw + gap, room: r.left, pos: { left: r.left - gap - fw, top: r.top } },
	];
	const overlaps = p => p.left < r.right && p.left + fw > r.left && p.top < r.bottom && p.top + fh > r.top;
	const free = sides.filter(s => s.fit).map(s => clamp(s.pos)).find(p => !overlaps(p));
	mStyle(elem, free ?? clamp(sides.reduce((a, b) => a.room >= b.room ? a : b).pos));
}
function mRadioFieldset(dParent, key, values, current, onchange) {
	const name = getUID();
	const fs = mDom(dParent, { tag: 'fieldset' }); //, bg: 'white', fg: 'black', rounding: 10}); //, m: 4, p: 14 });
	mDom(fs, { tag: 'legend', html: formatLegend(key) });
	for (const v of values) {
		const label = mDom(fs, { tag: 'label', display: 'block', cursor: 'pointer' });
		mDom(label, { tag: 'input', type: 'radio', name, checked: v == current, onchange: () => onchange(v) });
		label.append(` ${v}`);
	}
	return fs;
}
async function mShrinkTranslate(elem, dTarget, scale, ms = 800) {
	const [dx, dy] = getScreenDistance(elem, dTarget);
	const a = mAnimate(elem, 'transform', [`translate(${dx}px,${dy}px) scale(${scale})`], null, ms, 'ease', 0, 'forwards');
	await a.finished;
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
function mTitleButton(row, html, onclick) { return mDom(row, { tag: 'button', html, onclick, bg: 'silver', ptop: 4, mleft: 10 }); }
function mTitleRow(d, html) {
	const row = mDom(d, { display: 'flex', alignItems: 'baseline' });
	mDom(row, { html, fz: '150%', fw: 'bold', m: 12, mtop: 0 });
	return row;
}
function onclickGameMenuItem(ev) {
  const card = ev.target.closest('[gamename]');
  console.log("Clicked game menu item:", card);
  const gamename = card.getAttribute('gamename'), me = U.name;
  const { options = {}, ploptions = {} } = M.config.games[gamename];
  const choices = spec => spec.split(',').map(v => isNumber(v) ? Number(v) : v); // last choice is the default
  const all = Object.fromEntries(Object.keys(M.users).map(name => [name, userToPlayer(name, gamename)]));
  const opts = Object.fromEntries(Object.entries(options).map(([k, spec]) => [k, arrLast(choices(spec))]));
  const playing = new Set([me]), avatars = {};
  const setMode = mode => { for (const n in all) all[n].playmode = mode == 'solo' && n != me ? 'bot' : 'human'; };
  let shown = null; // player whose options are displayed
  if (opts.gamemode) setMode(opts.gamemode);

  document.querySelector('.framedPicture')?.classList.remove('framedPicture');
  card.classList.add('framedPicture');
  pollPause();
  mBy('dGameMenu')?.remove();
  const dMenu = mDom('dMain', { className: 'section', id: 'dGameMenu' });
  const head = mTitleRow(dMenu, 'game options');
  const dPlayers = mDom(dMenu, { flexCenterCenter: 8 });
  const dAllOpts = mDom(dMenu, { mtop: 6, flexRowStretch: 0 });
  const dPlayerOptions = mDom(dAllOpts);
  const dOptions = mDom(dAllOpts);

  const refresh = (name = shown) => {
    console.log("Refreshing options for player:", name);
    shown = name;
    for (const n in avatars) {
      mStyle(avatars[n], playing.has(n) ? { bfg: M.users[n].color } : { bg: 'transparent', fg: 'inherit' });
      mStyle(avatars[n].querySelector('img'), { borderRadius: all[n].playmode == 'bot' ? 2 : '50%' });
    }
    mClear(dPlayerOptions);
    if (!shown || !Object.keys(ploptions).length) return;
    const p = all[shown];
    const box = mDom(dPlayerOptions, { opacity: playing.has(shown) ? 1 : .5 });
    mDom(box, { bfg: M.users[shown].color, html: playing.has(shown) ? shown : `${shown} (not playing)`, pleft: 10 });
    const d = mDom(box, { flexRowStretch: 1 });
    for (const [key, spec] of Object.entries(ploptions)) mRadioFieldset(d, key, choices(spec), p[key], v => { p[key] = v; refresh(); });
  };
  for (const name in all) {
    const d = avatars[name] = showUser(name, dPlayers, 40, true);
    mStyle(d, { cursor: 'pointer', rounding: 6, p: 4 });
    d.onclick = () => { playing.has(name) && name != me ? playing.delete(name) : playing.add(name); refresh(name); };
  }
  const box = mDom(dOptions);
  mDom(box, { bfg: 'silver', pleft: 10, html: 'game' });
  const d = mDom(box, { flexRowStretch: 1 });
  for (const [key, spec] of Object.entries(options)) {
    mRadioFieldset(d, key, choices(spec), opts[key], v => { opts[key] = v; if (key == 'gamemode') setMode(v); refresh(); });
  }

  const saveUserOptions = async () => {
    let changed = false;
    for (const [name, p] of Object.entries(all)) {
      const saved = Object.fromEntries(Object.keys(ploptions).filter(k => k != 'playmode').map(k => [k, p[k]]));
      const user = M.users[name], old = user.games?.[gamename] ?? {};
      changed ||= Object.keys(saved).some(k => old[k] != saved[k]);
      (user.games ??= {})[gamename] = saved;
    }
    if (changed) await postUsers();
  };
  const newTable = async () => {
    await saveUserOptions();
    dMenu.remove();
    return tableCreate(gamename, Object.fromEntries([...playing].map(n => [n, all[n]])), opts, 'open');
  };
  const button = (html, onclick) => mTitleButton(head, html, onclick);
  button('Start', async () => {
    const table = gtSetToStarted(await newTable());
    await tableSaveNew(table);
    DA.tid = table.id;
    await DA.mainMenu('table');
    await pollResume();
  });
  button('Open to Join', async () => { await tableSaveNew(await newTable()); await pollResume(); });
  button('Clear Players', () => { playing.clear(); playing.add(me); refresh(null); });
  button('Cancel', () => { dMenu.remove(); pollResume(); });
  refresh(me);
}
function onclickMoreUsers() {
	const close = ev => { evNoBubble(ev); dPopup.remove(); };
	const dPopup = mDom('dPage', { position: 'absolute', top: 0, left: 0, wv: 1, hv: 1, z: 10000, bg: '#00000080', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', ptop: '25vh', animation: 'diamond-in-center .5s ease-in-out', onclick: close });
	const dUsers = mDom(dPopup, { center: 1, flexWrap: 'wrap', gap: 10, p: 20, r: 20, bg: 'white', w: '70%', maxWidth: 700, hmin: 200 });
	for (const name in M.users) {
		let d = showUser(name, dUsers);
		d.onclick = async ev => {
			evNoBubble(ev);
			await mShrinkTranslate(ev.currentTarget.querySelector('img'), 'dUser', .75, 700);
			dPopup.remove();
			switchToUser(name);
		};
	}
	mInputLine(dUsers, name => { dPopup.remove(); switchToUser(name); }, { mleft:10,placeholder: '<new user>', ph:4, border: '1 dimgray', r: 8, align: 'center' });
}
async function postConfig() { let res = await dbPost({ cmd: 'savey', file: 'config', o: M.config }); }
async function postUsers() { return await dbPoast({ cmd: 'savey', file: 'users', o: M.users }); }
async function reloadTables() {
	let tables = {};
	let res = await dbGetGameTables();
	tables = list2dict(res.tables, 'id');
	let moves = res.moves;
	for (const id in tables) {
		tables[id].pending = moves.filter(x => x.game_id == id && x.has_moved).map(x => x.player_id);
	}
	let hasChanges = nundef(DA.tableDict) || !sameList(Object.keys(DA.tableDict), Object.keys(tables)) || !isdef(mBy('game_menu'));
	DA.tableDict = tables;
	return hasChanges;
}
async function reloadTable() {
	const { table, movedPlayers, error } = await dbGetGameTable(DA.tid);
	if (error || !table) { DA.tid = null; return true; }
	table.pending = movedPlayers ?? [];
	DA.tableDict ??= {};
	const old = DA.tableDict[DA.tid];
	const hasChanges = !old || table.modified != old.modified || table.step != old.step || !sameList(table.pending, old.pending ?? []);
	if (hasChanges) {
		DA.oldTable = old;
		DA.tableDict[DA.tid] = table;
	}
	return hasChanges;
}
function showEmo(key, dParent, opts = {}) {
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
function showGamesAndTables() {
	const me = U.name;
	const tables = Object.values(DA.tableDict).sort((a, b) => b.modified - a.modified);
	const link = (d, html, onclick) => mDom(d, { tag: 'a', html, onclick, fg: 'blue', cursor: 'pointer', textDecoration: 'underline' });
	const open = id => { DA.tid = id; return DA.mainMenu('table'); };
	mClear('dMain'); // also drops an open game options menu

	const dTables = mDom('dMain', { className: 'section', id: 'dTableList' });
	const head = mTitleRow(dTables, 'tables');
	if (isEmpty(tables)) mDom(dTables, { html: 'no active game tables', mleft: 12, fg: 'blue' });
	else {
		const grid = mDom(dTables, { tag: 'table', className: 'table' });
		for (const t of tables) {
			const { id, status, owner, players } = t, tr = mDom(grid, { tag: 'tr' });
			const cell = (html, opts) => mDom(tr, { tag: 'td', html, ...opts });
			const act = (html, fn) => link(cell(), html, fn);
			if (status == 'open') cell(t.friendly, { fg: 'blue' }); else act(t.friendly, () => open(id));
			cell(M.config.games[t.game].friendly);
			cell(`(${status})`);
			cell(Object.keys(players).join(', '));
			if (t.prior == 1) cell(getWaitingHtml(24));
			if (status == 'open' && !(me in players)) act('join', () => onclickTableJoin(id));
			if (status == 'open' && me in players && owner != me) act('leave', () => onclickTableLeave(id));
			act('delete', () => onclickTableDelete(id));
			if (status == 'open' && owner == me) act('start', async () => { await tableSaveUpdate(gtSetToStarted(t)); await open(id); });
		}
		if (tables.some(t => t.status == 'over')) mTitleButton(head, 'delete finished', onclickDeleteFinished);
		mTitleButton(head, 'delete all', onclickDeleteAll);
	}

	const dGames = mDom('dMain', { className: 'section', id: 'dGameList' });
	mTitleRow(dGames, 'games');
	const cards = mDom(dGames, { flexCenterCenter: 1, id: 'game_menu' });
	for (const name of DA.gamelist ?? toWords('aristo reversi bluff ferro setgame spotit ttt')) {
		const g = M.config.games[name];
		showEmo(g.logo, cards, { w: 140, h: 120, label: capitalize(g.friendly), bfg: g.color, rounding: 10, m: 10, cursor: 'pointer', gamename: name, onclick: onclickGameMenuItem });
	}
}
function showIcons() {
	mClear('dMain');
	const dt = mDom('dMain', { flexRowWrap: 10 });
	for (const k in M.emo) {
		const d1 = showEmo(k, dt, { w: 50, h: 50 });
		d1.setAttribute('key', k);
		d1.onmouseover = showOneIcon;
	}
}
function showOneIcon(ev) {
	const box = mBy('floatingDivInfo') ?? mDom('dMain', {
		position: 'fixed', zIndex: 10000, bg: '#ffffffF0', fg: '#222',
		padding: 8, rounding: 8, border: '1px solid #aaa', fz: 13,
		wmin: 160, maxWidth: 320, boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
		pointerEvents: 'none', id: 'floatingDivInfo'
	});
	mStyle(box, { opacity: ev.ctrlKey ? 1 : 0 });
	const target = ev.target.closest('[key]');
	if (!ev.ctrlKey || !target) return;
	const k = target.getAttribute('key');
	const o = M.emo[k];
	const rows = isdef(o)
		? Object.entries(o).map(([m, v]) => `<span style="color:#888">${m}:</span> ${isObject(v) || isList(v) ? JSON.stringify(v) : v}<br>`).join('')
		: '<i style="color:#888">no M.emo entry</i><br>';
	const img = M.images.find(x => x.includes(k));
	const imgHtml = img ? `<span style="color:#888">img:</span> ${img}<br><img src="${img}" style="max-width:220px;max-height:220px;margin-top:4px;border-radius:4px;display:block">` : '';
	const svg = M.svgs.find(x => x.includes(k));
	const svgHtml = svg ? `<span style="color:#888">svg:</span> ${svg}<br><img src="../assets/svg/${svg}" style="max-width:220px;max-height:220px;margin-top:4px;border-radius:4px;display:block">` : '';
	box.innerHTML = `<b>${k}</b><br>${rows}${imgHtml}${svgHtml}`;
	box.style.display = 'block';
	mPlaceNear(box, target);
	box.querySelectorAll('img').forEach(im => { if (!im.complete) im.onload = im.onerror = () => mPlaceNear(box, target); });
}
function showMeeple(key, dParent, opts = {}) {
	const t = Date.now();
	addKeys({ w: '100%', h: '100%', depth: 20 }, opts);
	let d = mDom(dParent, opts);
	let sh = key.data ? key : M.shapes[key];
	let { g, text } = createStageX(d);
	res = drawClaudeX(g, sh, opts.label || '', text, opts);
	console.log('drawn shape in', Date.now() - t, 'ms');
	return d;
}
function showMenu(dParent, menus, onSwitch) {
	const buttons = {};
	for (const menu of menus) {
		buttons[menu] = mDom(dParent, { tag: 'button', html: capitalize(menu), onclick: () => switchMenu(menu) });
	}
	async function switchMenu(menu) {
		if (menu == DA.menu) return;
		for (const m in buttons) buttons[m].classList.toggle('active', m == menu);
		DA.menu = menu;
		localStorage.setItem('menu', menu);
		await onSwitch(menu);
	}
	switchMenu.buttons = buttons;
	return switchMenu;
}
function showUser(name, dParent, sz = 40, label = false) {
	//assertion(M.users[name], `Missing user for name: ${name}`);
	const user = M.users[name];
	let d = mDom(dParent, { center: 1, dir: 'column' });
	let src = user.imgKey.includes('/') ? user.imgKey : `../assets/img/users/${user.imgKey}.jpg`;
	let w = sz;
	let h = w, fz = Math.round(w / 3.3);
	let img = mDom(d, { tag: 'img', src, w, h, round: 1, border: `3 ${user.color}`, onerror: function () { this.onerror = null; this.src = `../assets/img/users/unknown_user.jpg`; } });
	if (label) mDom(d, { fz, html: name });
	return d;
}
async function switchToUser(name) {
	pollPause();
	name = normalizeString(name); if (isEmpty(name)) name = localStorage.getItem('username') || 'guest';
	U = M.users[name];
	if (!U) {
		let imgKey = M.images.find(x => x.includes(name));
		if (!imgKey) imgKey = rChoose(M.images);
		U = M.users[name] = { name, color: rColor(), imgKey };
		console.log('new user created', U, 'M.users', M.users);
		await postUsers();
	}
	let d = mBy('dUser');
	mClear(d);
	mStyle('dTopline', { bfg: U.color });
	mStyle(d, { ph: 12, cursor: 'pointer', flexCenterCenter: 1, gap: 10, onclick: onclickMoreUsers });
	mDom(d, { html: capitalize(name) });
	showUser(name, d);
	mDom(d, { html: '...' });
	localStorage.setItem('username', name);
	//if (DA.menu == 'table' && !DA.tid) DA.tid = localStorage.getItem('tid'); 
	DA.selectedItems = {};
	await pollResume();
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
async function updateData(table) {
	const DATA_LOADERS = { games: reloadTables, table: reloadTable };
	return await DATA_LOADERS[DA.menu]?.(table) ?? false;
}
async function updateMain(forceUI = false, table = null) {
	const hasChanges = await updateData(table);

	if (hasChanges || forceUI) await updateUI();
	return hasChanges || forceUI;
}
async function updateUI() {
	if (nundef(DA.menu)) return;
	mClassRemove('dMain', 'velvet');
	const UI_VIEWS = { games: showGamesAndTables, table: gtShow, settings: () => uiStub('settings', U), icons: showIcons };
	await (UI_VIEWS[DA.menu] ?? stubGames)();
}

//#region stubs: to be eliminated
function uiStub(title, data) {
	const stubGames = () => uiStub('games', DA.tableDict);
	const stubSettings = () => uiStub('settings', U);
	const stubIcons = showIcons; // () => uiStub('icons (first 50 keys)', Object.keys(M.emo).slice(0, 50));
	let dMain = mBy('dMain') ?? mDom('dPage', { id: 'dMain', w: '100%' });
	mClear(dMain);
	const pre = mDom(dMain, { tag: 'pre', fz: 12 });
	pre.textContent = `${title}\n${JSON.stringify(data, null, 2)}`;
}
//#endregion stubs

//#region Claude polling
const POLL_MENUS = ['games', 'table'];

function pollActive() { return POLL_MENUS.includes(DA.menu) && !DA.pollPaused && !document.hidden && !(DA.menu == 'table' && nundef(DA.tid)); }

async function pollTick() {
	if (DA.pollBusy || DA.isProcessingMove || !pollActive()) return;
	DA.pollBusy = true; mStyle('dLogo', { opacity: 0.5 });
	try { await updateMain(); } finally { DA.pollBusy = false; mStyle('dLogo', { opacity: 1 }); }
}

function pollSync() {
	clearInterval(DA.pollTimer);
	DA.pollTimer = pollActive() ? setInterval(pollTick, DA.pollMs ?? 2000) : null;
}

function pollSetMs(ms) { DA.pollMs = Math.max(ms, 500); pollSync(); }

function pollPause() { DA.pollPaused = true; pollSync(); }

async function pollResume() {
	DA.pollPaused = false;
	while (DA.pollBusy) await mSleep(50);
	if (POLL_MENUS.includes(DA.menu)) await updateMain(true);
	pollSync();
}

function pollInit(ms = 2000) {
	DA.pollMs = ms;
	document.addEventListener('visibilitychange', () => document.hidden || DA.pollPaused ? pollSync() : pollResume()); // a deliberate pause (e.g. open game menu) survives tab switches
	pollSync();
}

//#endregion Claude polling

