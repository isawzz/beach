

















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
function emoGetKeys(group='animals_nature',cond=null) {
  let res = [];

  for (const k in M.emogroup[group]) {
		if (cond && !cond(k)) continue;
    res = res.concat(M.emogroup[group][k]);
  }
  return res;
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
  if (M.config) return;
	let t = Date.now();
  M = await loadJson('y/m.json');
  M.config = await loadYaml('y/config.yaml');
  M.images = await loadYaml('y/all_image_files.yaml');
  // M.emo = await loadYaml('y/diemo.yaml');
  M.emo = await loadJson('y/diemo.json');
  M.emogroup = await loadYaml('y/digroup.yaml');
  M.emokeys = Object.keys(M.emo).sort();
  M.fa = await loadYaml('y/fadi.yaml');
  M.fakeys = Object.keys(M.fa).sort();
	t = Date.now() - t; 
  // console.log('old assets',t);
	t = Date.now();
  M.shapes = await loadJson('y/eshapes.json');
	t = Date.now() - t; 
  // console.log('assets:shapes',t);
  t = Date.now();
	M.shapeKeys = Object.keys(M.shapes).sort();

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
function logBoardObjectClicks(board, svg) {
  analyzeBoard(board);

  const getNeighbors = (item, kind) => {
    const neighbors = item.adj?.[kind] || [];
    return neighbors
      .map(({ id }) => board[kind].find(obj => obj.id === id))
      .filter(Boolean);
  };

  // Faces are rendered in the same order as board.cells.
  svg.querySelectorAll(".cell, .tess-face").forEach((element, index) => {
    const item = board.cells[index];
    if (!item) return;

    element.addEventListener("click", () => {
      console.log("cell", item);
      console.log("neighbor cells", getNeighbors(item, "cells"));
    });
  });

  svg.querySelectorAll(".street").forEach(element => {
    const item = board.streets.find(
      street => street.id === element.dataset.street
    );
    if (!item) return;

    element.addEventListener("click", () => {
      console.log("street", item);
      console.log("neighbor streets", getNeighbors(item, "streets"));
    });
  });

  svg.querySelectorAll(".city").forEach(element => {
    const item =
      board.cities.find(city => city.id === element.dataset.city) ||
      isolatedCities(board).find(city => city.id === element.dataset.city);

    if (!item) return;

    element.addEventListener("click", () => {
      console.log("city", item);
      console.log(
        "neighbor cities",
        item.isolated ? [] : getNeighbors(item, "cells")
      );
    });
  });
}
function reverseDict(dict) {
  return Object.fromEntries(Object.entries(dict).map(([key, value]) => [value, key]));
}
function showPalette(d, colors, labels = false, approximate = false) {
  let i = 0;
  for (var c of colors) {
    c = clrHex(c);
    let name = approximate ? clrName(c) : ColorByHex[c] ?? '';
    // let bg=c;
    // let fg=clrText(c); console.log(fg);
    // let fw=fg=='#000000'?'700':'400';
    // let dmini = mDom(d, { fw, bg, fg, wmin: 40, hmin: 40, padding: 2 }, { html: name + ' ' + c + ` (${i++})` });
    let dmini = mDom(d, { bf: c, wmin: 40, hmin: 40, padding: 2 }, { html: labels ? (name + ' ' + c + ` (${i++})`) : '' });
  }
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


