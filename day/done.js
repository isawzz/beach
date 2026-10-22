
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
async function loadAssets() {
  M = await loadYaml('y/m.yaml');
  M.config = await loadYaml('y/config.yaml');
  M.emo = await loadYaml('y/diemo.yaml');
  M.emogroup = await loadYaml('y/digroup.yaml');
  M.emokeys = Object.keys(M.emo).sort();
  M.fa = await loadYaml('y/fadi.yaml');
  M.fakeys = Object.keys(M.fa).sort();
	Object.freeze(M);
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
	let res = await fetch(getDA('staticUrl') + path);
	if (!res.ok) throw new Error(`fetchText: ${res.status} ${path}`);
	return await res.text();
}
async function loadYaml(path) {
	let txt = await loadText(path);
	return YAML.parse(txt);
}
function showSvgAsImage(div, path) {
	// 1. as image: the browser loads the file, so no fetch is needed
	let img = document.createElement('img');
	img.src = path;
	div.appendChild(img);
	return img;
}
async function showSvgAsText(div, path) {
	// 2. as text: the svg markup is inserted into the DOM as an inline <svg>
	let text = await loadText(path);
	div.innerHTML = text;
	return div.firstElementChild; // the <svg> element
}
function showSvgTextAsImage(text, div, styles={}) {
	let img = mDom(div,styles,{tag:'img',src:'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text)});
	// let img = document.createElement('img');
	// img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
	// div.appendChild(img);
	return img;
}


