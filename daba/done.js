function applyOpts(d, opts = {}) {
  const aliases = {
    classes: 'className',
    inner: 'innerHTML',
    html: 'innerHTML',
    w: 'width',
    h: 'height',
  };
  for (const opt in opts) {
    let name = valf(aliases[opt], opt);
    let val = opts[opt];
    if (name == 'recClick') { d.onclick = async (ev) => { recUserEvent(); await val(ev); } }
    else if (['id', 'style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
    else d.setAttribute(name, val);
  }
}
function createBgaLayout(dParent) {
  dParent.innerHTML = '';

  // Root Shell: Full height, flex column to isolate top prompt bar
  const root = mDom(dParent, {
    w: '100%',
    h: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bg: '#202020'
  });

  // 1. TOP PROMPT BAR (Always visible at the top)
  const promptBar = mDom(root, {
    minH: 48,
    bg: 'red',
    fg: '#ffffff',
    display: 'flex',
    align: 'center',
    justify: 'center',
    gap: 12,
    p: [6, 16],
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  });

  // Workspace Container: Split horizontally into Main Table Area + Sidebar
  const workspace = mDom(root, {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden'
  });

  // 2. MAIN COLUMN (Main board, Active Player, Opponents - Scrollable)
  const mainCol = mDom(workspace, {
    flex: 1,
    overflowY: 'auto',
    p: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  });

  // 2a. Main Table / Shared Area
  const mainTable = mDom(mainCol, {
    bg: '#2d5a3f',
    r: 8,
    p: 16,
    minH: 300,
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
  });

  // 2b. Active Player Area (My Hand / My Board)
  const myArea = mDom(mainCol, {
    bg: '#1e2836',
    r: 8,
    p: 16,
    border: '2px solid #3b82f6'
  });

  // 2c. Opponents Container (Scrollable section below active player)
  const opponentsArea = mDom(mainCol, {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  });

  // 3. RIGHT SIDEBAR (Stats & Game History Log)
  const sidebar = mDom(workspace, {
    w: 280,
    minW: 240,
    bg: '#181818',
    borderLeft: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  });

  // 3a. Stats Panel (Top half of sidebar)
  const statsPanel = mDom(sidebar, {
    flex: '0 0 auto',
    maxH: '40%',
    p: 12,
    overflowY: 'auto',
    borderBottom: '1px solid #333'
  });

  // 3b. History / Log Panel (Bottom half of sidebar)
  const historyLog = mDom(sidebar, {
    flex: 1,
    p: 12,
    overflowY: 'auto',
    fg: '#cccccc',
    fontSize: 13
  });

  return {
    root,
    promptBar,
    mainTable,
    myArea,
    opponentsArea,
    statsPanel,
    historyLog
  };
}
function findDuplicateValuesInDict(dict) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of Object.values(dict)) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }

  return [...duplicates];
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
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mDom(dParent, styles = {}, opts = {}) {
  let tag = valf(opts.tag, 'div');
  let d = document.createElement(tag);
  if (tag == 'textarea') styles.wrap = 'hard';
  mStyle(d, styles);
  applyOpts(d, opts);
  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}
function mStyle(elem, styles = {}) {
	elem = toElem(elem);
	const target = elem.style || elem;

	for (let key in styles) {
		let val = styles[key];
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

		if (prop in target) target[prop] = val;
		else if (elem.nodeType) elem.setAttribute(prop, val);
	}

	return elem;
}
function reverseDict(dict) {
  return Object.fromEntries(Object.entries(dict).map(([key, value]) => [value, key]));
}
function showPalette(d, colors, approximate = false) {
  let i = 0;
  for (var c of colors) {
    c = clrHex(c);
    let name = approximate ? clrName(c) : ColorByHex[c] ?? '';
    // let bg=c;
    // let fg=clrText(c); console.log(fg);
    // let fw=fg=='#000000'?'700':'400';
    // let dmini = mDom(d, { fw, bg, fg, wmin: 40, hmin: 40, padding: 2 }, { html: name + ' ' + c + ` (${i++})` });
    let dmini = mDom(d, { bf: c, wmin: 40, hmin: 40, padding: 2 }, { html: name + ' ' + c + ` (${i++})` });
  }
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
function showSvgTextAsImage(text, div, styles = {}) {
  let img = mDom(div, styles, { tag: 'img', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text) });
  // let img = document.createElement('img');
  // img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
  // div.appendChild(img);
  return img;
}
function sortColorsAsGradient(colors) {
  const toOklab = hex => clrRgbToOklab(...clrHexToRgb(hex));

  return [...colors]
    .map(hex => {
      const [L, a, b] = toOklab(hex);
      return { hex, L, hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
    })
    .sort((x, y) => x.hue - y.hue || x.L - y.L)
    .map(color => color.hex);
}
function sortColorsByLabDistance(colors) {
  if (colors.length < 2) return [...colors];

  const lab = colors.map(hex => clrRgbToLab(...clrHexToRgb(hex)));
  const distance = (a, b) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  const remaining = new Set(colors.map((_, i) => i));
  const sorted = [];
  let current = 0; // Start with the first input color

  while (remaining.size) {
    sorted.push(colors[current]);
    remaining.delete(current);

    if (!remaining.size) break;

    let nearest = -1;
    let minDistance = Infinity;

    for (const i of remaining) {
      const d = distance(lab[current], lab[i]);
      if (d < minDistance) {
        minDistance = d;
        nearest = i;
      }
    }

    current = nearest;
  }

  return sorted;
}
function toElem(d) { return isString(d) ? mBy(d) : d; }


