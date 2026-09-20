function applyOpts(d, opts = {}) {
	const aliases = { classes: 'className', inner: 'innerHTML', html: 'innerHTML' };
	for (const opt in opts) {
		let name = valf(aliases[opt], opt);
		let val = opts[opt];
		if (['id', 'style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
		else d.setAttribute(name, val);
	}
}
function arrNext(list, el) {
	let i = list.indexOf(el);
	return list[(i + 1) % list.length];
}
function arrShuffle(arr) {
	let a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
	return a;
}
function getUID(prefix = 'u') {
	if (nundef(window.UID)) window.UID = 0;
	window.UID += 1;
	return prefix + window.UID;
}
function isDict(x) { return typeof x === 'object' && x !== null && !Array.isArray(x); }
function isEmpty(x) {
	if (nundef(x)) return true;
	if (isString(x)) return x === '';
	if (Array.isArray(x)) return x.length === 0;
	if (isDict(x)) return Object.keys(x).length === 0;
	return false;
}
function isList(x) { return Array.isArray(x); }
function isNumber(x) { return typeof x === 'number' && !isNaN(x); }
function isString(x) { return typeof x === 'string'; }
function isdef(x) { return x !== null && x !== undefined && x !== 'undefined'; }
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function lookup(dict, keys) {
	if (nundef(dict)) return null;
	let d = dict;
	for (let i = 0; i < keys.length; i++) {
		if (nundef(keys[i])) break;
		if (nundef(d[keys[i]])) return null;
		d = d[keys[i]];
		if (i === keys.length - 1) return d;
	}
	return d;
}
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mButton(caption, handler, dParent, styles, classes, id) {
	let x = document.createElement('button');
	x.innerHTML = caption;
	x.type = 'button';
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) toElem(dParent).appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) x.className = classes;
	if (isdef(id)) x.id = id;
	return x;
}
function mBy(id, what, elem) {
	if (nundef(elem)) elem = document;
	if (nundef(what)) return elem.getElementById(id);
	switch (what) {
		case 'class': return Array.from(elem.getElementsByClassName(id));
		case 'tag': return Array.from(elem.getElementsByTagName(id));
		case 'name': return Array.from(elem.getElementsByName(id));
		case 'query': return Array.from(elem.querySelectorAll(id));
		default: return elem.getElementById(id);
	}
}
function mByX(sel, elem) {
	// Improvement over mBy: single entry point that fully replaces querySelector(All).
	// Plain ids still use the fast getElementById path, everything else goes to querySelectorAll.
	if (nundef(elem)) elem = document;
	if (/^[A-Za-z][\w-]*$/.test(sel)) {
		let byId = elem.getElementById ? elem.getElementById(sel) : document.getElementById(sel);
		if (isdef(byId)) return byId;
	}
	let list = Array.from(elem.querySelectorAll(sel));
	if (list.length === 1) return list[0];
	return list;
}
function mClear(d) { d = toElem(d); if (d) d.innerHTML = ''; }
function mCreate(tag, styles, id) {
	let d = document.createElement(tag);
	if (isdef(id)) d.id = id;
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mDom(dParent, styles = {}, opts = {}) {
	let tag = valf(opts.tag, 'div');
	let d = document.createElement(tag);
	mStyle(d, styles);
	applyOpts(d, opts);
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function mKey(key, dParent, styles = {}, opts = {}) {
	let d = mDom(dParent, styles, opts);
	d.textContent = key;
	return d;
}
function mRemove(d) {
	d = toElem(d);
	if (isdef(d)) d.remove();
}
function mSleep(ms = 1000) {
	// Simplified vs legacy: plain promise without a shared TO timeout, so parallel sleeps no longer cancel each other.
	return new Promise(res => setTimeout(res, ms));
}
function mStyle(elem, styles = {}, opts = {}) {
	elem = toElem(elem);
	let resolved = mStyles(styles);
	for (const k in resolved) elem.style.setProperty(k, resolved[k]);
	applyOpts(elem, opts);
}
function mStyles(styles) {
	let res = {};
	for (const k in styles) {
		let key = valf(STYLES[k], k);
		let val = styles[k];
		if (isNumber(val) && !NO_UNIT_STYLES.some(x => key.startsWith(x))) val = '' + val + 'px';
		res[key] = val;
	}
	return res;
}
function nundef(x) { return x === null || x === undefined || x === 'undefined'; }
function rChoose(arr, n = 1) {
	if (isDict(arr)) arr = Object.values(arr);
	if (n === 1) return arr[Math.floor(Math.random() * arr.length)];
	return arrShuffle(arr.map((_, i) => i)).slice(0, n).map(i => arr[i]);
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
