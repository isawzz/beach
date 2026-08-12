// cryptid2.js — a two-player Cryptid-style deduction game on a tessellation
// board. Each player holds two secret clues; the habitat is the single cell
// that matches all four clues. Terrain is drawn from the board's own colour
// pattern (buildTessellation's color_pattern -> color_list), with a fallback
// pattern for boards that carry none.
//
// Rules:
//  - On your turn select a cell and Test it (places one of your 4 markers).
//    The opponent must reveal one of their unrevealed clues that rules the
//    cell out, if any — that clue becomes public. If the opponent has no such
//    clue, the marker stays on the board.
//  - A surviving marker that matches every clue (public, yours, theirs) wins
//    immediately, because the habitat is the unique such cell.
//  - Search accuses a cell directly: right wins, wrong loses.
//  - Refuted markers are spent; with all 4 spent you must Search or concede.

const TERRAINS = [
  { name: 'plain',    color: '#e6d9a5' },
  { name: 'forest',   color: '#4d9e6f' },
  { name: 'water',    color: '#5b8fc0' },
  { name: 'mountain', color: '#a58263' },
  { name: 'swamp',    color: '#557a52' },
  { name: 'desert',   color: '#e0b057' }
];

const PLAYER_COLORS = ['#e63946', '#4895ef'];
const MARKERS_PER_PLAYER = 4;
const LANDMARK_LETTERS = 'ABCDEFGHIJ';

const CLUE_COLORS = ['#e76f51', '#2a9d8f', '#9b5de5', '#f4a261', '#00bbf9', '#f15bb5'];

const COMPASS_WORDS = { N: 'north', NE: 'northeast', E: 'east', SE: 'southeast', S: 'south', SW: 'southwest', W: 'west', NW: 'northwest' };

const COLORS = {
  stroke: '#3d5870',
  hoverStroke: '#ffd166',
  selectedStroke: '#ffd166',
  home: '#264653',
  homeStroke: '#ffd166',
  landmark: '#264653',
  landmarkStroke: '#ffffff'
};

const state = {
  board: null,
  home: null,
  clues: [],
  clueOwner: [],
  terrains: [],
  landmarks: [],
  polys: [],
  letters: [],
  markGroup: null,
  svg: null,
  chips: {},
  selected: null,
  toggled: [],
  revealed: [],
  turn: 0,
  markers: [],
  refuted: {},
  placed: [0, 0],
  pending: null,
  guesses: 0,
  tests: 0,
  over: false,
  won: false,
  winner: null
};

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

// ---------- topology analysis ----------

function bfsDists(adj, src) {
  const d = new Array(adj.length).fill(-1);
  d[src] = 0;
  const q = [src];
  while (q.length) {
    const u = q.shift();
    for (const v of adj[u]) if (d[v] < 0) { d[v] = d[u] + 1; q.push(v); }
  }
  return d;
}

function pickLandmarks(adj, centers, k) {
  const N = adj.length;
  const chosen = [];
  let mx = 0;
  let my = 0;
  for (const c of centers) { mx += c[0]; my += c[1]; }
  mx /= N;
  my /= N;
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < N; i++) {
    const dx = centers[i][0] - mx;
    const dy = centers[i][1] - my;
    const dd = dx * dx + dy * dy;
    if (dd < bd) { bd = dd; best = i; }
  }
  chosen.push(best);
  while (chosen.length < k) {
    let far = -1;
    let fd = -1;
    for (let i = 0; i < N; i++) {
      if (chosen.indexOf(i) >= 0) continue;
      let minD = Infinity;
      for (const c of chosen) {
        const dx = centers[i][0] - centers[c][0];
        const dy = centers[i][1] - centers[c][1];
        if (dx * dx + dy * dy < minD) minD = dx * dx + dy * dy;
      }
      if (minD > fd) { fd = minD; far = i; }
    }
    chosen.push(far);
  }
  return chosen;
}

function adjMatrix(board) {
  return board.cells.map(c => c.adj.cells.map(n => parseInt(n.id.slice(1), 10)));
}

function compassOf(centers, fromIdx, toIdx) {
  return bearing(centers[fromIdx], centers[toIdx]).compass;
}

function terrainList(board) {
  // Map each cell to a terrain index. Prefer the board's own colour pattern;
  // fall back to a deterministic band pattern when it has none.
  const cl = Array.isArray(board.color_list) && board.color_list.length === board.faces.length ? board.color_list : null;
  const list = new Array(board.faces.length);
  for (let i = 0; i < list.length; i++) {
    const v = cl ? cl[i] : undefined;
    list[i] = (typeof v === 'number' && isFinite(v)) ? v % TERRAINS.length : (i % TERRAINS.length);
  }
  return list;
}

// ---------- puzzle generation ----------

function generatePuzzle(board, perPlayer) {
  // Build 4 clues (2 per player) whose intersection is exactly {home}. The clue
  // assignment is chosen so each player's pair still leaves a real deduction
  // (pair intersection between ~3 and 60% of the board) and uses two different
  // clue types. Retries until a balanced split is found.
  const N = board.faces.length;
  const adj = adjMatrix(board);
  const centers = board.cells.map(c => c.center);
  const landmarks = pickLandmarks(adj, centers, 4);
  const dists = landmarks.map(l => bfsDists(adj, l));

  const feat = [];
  for (let i = 0; i < N; i++) {
    const f = { idx: i, deg: adj[i].length, flen: board.cells[i].face.length, color: state.terrains[i] % TERRAINS.length };
    for (let li = 0; li < landmarks.length; li++) {
      f['d' + li] = dists[li][i];
      f['c' + li] = compassOf(centers, landmarks[li], i);
    }
    feat.push(f);
  }
  for (let i = 0; i < N; i++) {
    const d = bfsDists(adj, i);
    feat[i].ring1 = d.filter(x => x >= 0 && x <= 1).length;
    feat[i].ring2 = d.filter(x => x >= 0 && x <= 2).length;
    feat[i].ring3 = d.filter(x => x >= 0 && x <= 3).length;
  }

  const isectSize = (a, b) => { let n = 0; for (const x of a) if (b.indexOf(x) >= 0) n++; return n; };
  const PAIRINGS = [[0, 1, 2, 3], [0, 2, 1, 3], [0, 3, 1, 2]];

  const intersectCells = (clueList) => {
    let inter = null;
    for (const cand of clueList) {
      const set = feat.filter(f => f[cand.type] === cand.value).map(f => f.idx);
      inter = inter === null ? set.slice() : inter.filter(x => set.indexOf(x) >= 0);
    }
    return inter || [];
  };

  const attempts = perPlayer === 2 ? 120 : 60;
  let fallback = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const home = Math.floor(Math.random() * N);
    const hf = feat[home];
    const cands = [];
    const addC = (type, value) => {
      const size = feat.filter(f => f[type] === value).length;
      if (size >= 3 && size < N) cands.push({ type, value, size });
    };
    addC('deg', hf.deg);
    addC('flen', hf.flen);
    addC('ring1', hf.ring1);
    addC('ring2', hf.ring2);
    addC('ring3', hf.ring3);
    addC('color', hf.color);
    for (let li = 0; li < landmarks.length; li++) {
      addC('d' + li, hf['d' + li]);
      addC('c' + li, hf['c' + li]);
    }
    for (let i = cands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = cands[i]; cands[i] = cands[j]; cands[j] = tmp;
    }

    let cur = new Set();
    for (let i = 0; i < N; i++) cur.add(i);
    let chosen = [];
    while (cur.size > 1 && cands.length) {
      const cand = cands.pop();
      const match = new Set(feat.filter(f => f[cand.type] === cand.value).map(f => f.idx));
      let reduced = 0;
      for (const x of cur) if (match.has(x)) reduced++;
      if (reduced < cur.size && match.has(home)) {
        cur = new Set([...cur].filter(x => match.has(x)));
        chosen.push(cand);
      }
    }
    if (cur.size !== 1) continue;

    // Normalize to exactly 4 clues while keeping the unique intersection.
    if (chosen.length < 4) {
      while (chosen.length < 4 && cands.length) chosen.push(cands.pop());
      if (chosen.length !== 4) continue;
    } else if (chosen.length > 4) {
      while (chosen.length > 4) {
        let trimmed = false;
        for (let i = chosen.length - 1; i >= 0; i--) {
          const rest = chosen.slice(0, i).concat(chosen.slice(i + 1));
          const inter = intersectCells(rest);
          if (inter.length === 1 && inter[0] === home) { chosen = rest; trimmed = true; break; }
        }
        if (!trimmed) break;
      }
      if (chosen.length !== 4) continue;
    }

    const regions = chosen.map(c => feat.filter(f => f[c.type] === c.value).map(f => f.idx));
    for (const p of PAIRINGS) {
      if (chosen[p[0]].type === chosen[p[1]].type || chosen[p[2]].type === chosen[p[3]].type) continue;
      const s1 = isectSize(regions[p[0]], regions[p[1]]);
      const s2 = isectSize(regions[p[2]], regions[p[3]]);
      const mn = Math.min(s1, s2);
      const mx = Math.max(s1, s2);
      if (mn >= 3 && mx <= 0.6 * N) {
        return makePuzzle(home, landmarks, feat, chosen, p);
      }
      if (!fallback || mn > fallback.mn || (mn === fallback.mn && mx < fallback.mx)) {
        fallback = { home, p, mn, mx, chosen };
      }
    }
  }

  if (fallback && fallback.mn >= 2) {
    return makePuzzle(fallback.home, landmarks, feat, fallback.chosen, fallback.p);
  }
  return { ok: false };
}

function makePuzzle(home, landmarks, feat, chosen, pairing) {
  const clues = [];
  for (let g = 0; g < 2; g++) {
    for (let k = 0; k < 2; k++) {
      clues.push(describeClue(LANDMARK_LETTERS, feat, landmarks, home, chosen[pairing[g * 2 + k]]));
    }
  }
  return { home, landmarks, clues, ok: true };
}

function article(word) {
  return (/^[aeiou]/i.test(word) ? 'an' : 'a') + ' ' + word;
}

function describeClue(letters, feat, landmarks, home, cand) {
  const type = cand.type;
  const value = cand.value;
  const cells = [];
  feat.forEach((f, idx) => { if (f[type] === value) cells.push(idx); });
  let text = '';
  if (type === 'deg') {
    text = 'The habitat touches exactly ' + value + ' other cells.';
  } else if (type === 'flen') {
    text = 'The habitat has exactly ' + value + ' sides.';
  } else if (type === 'ring1') {
    text = 'Exactly ' + value + ' cells (counting the habitat itself) are within 1 step of the habitat.';
  } else if (type === 'ring2') {
    text = 'Exactly ' + value + ' cells are within 2 steps of the habitat.';
  } else if (type === 'ring3') {
    text = 'Exactly ' + value + ' cells are within 3 steps of the habitat.';
  } else if (type === 'color') {
    text = 'The habitat is on ' + article(TERRAINS[value % TERRAINS.length].name) + ' cell.';
  } else if (type[0] === 'd') {
    const li = parseInt(type.slice(1), 10);
    text = 'The habitat is exactly ' + value + ' step' + (value === 1 ? '' : 's') + ' from landmark ' + letters[li] + '.';
  } else if (type[0] === 'c') {
    const li = parseInt(type.slice(1), 10);
    text = 'The habitat lies to the ' + (COMPASS_WORDS[value] || value) + ' of landmark ' + letters[li] + '.';
  } else {
    text = 'The habitat is ' + type + ' ' + value + '.';
  }
  return { type, value, cells, text, containsHome: cells.indexOf(home) >= 0 };
}

// ---------- game setup ----------

function newGame() {
  const name = document.getElementById('tessagon').value;
  const H = parseInt(document.getElementById('tcols').value, 10);
  const V = parseInt(document.getElementById('trows').value, 10);

  let board = null;
  try {
    board = buildTessellation(name, { H, V, color_pattern: 1 });
  } catch (e1) {
    try {
      board = buildTessellation(name, { H, V });
    } catch (e2) {
      setStatus('Could not build ' + name + ': ' + e2.message);
      return;
    }
  }

  state.terrains = terrainList(board);

  let puzzle = null;
  for (let i = 0; i < 12 && !puzzle; i++) puzzle = generatePuzzle(board, 2);
  if (!puzzle) {
    setStatus('Could not generate a balanced puzzle on this board — try another size.');
    return;
  }

  Object.assign(state, {
    board,
    home: puzzle.home,
    clues: puzzle.clues,
    clueOwner: [0, 0, 1, 1],
    landmarks: puzzle.landmarks,
    polys: [],
    letters: [],
    markGroup: null,
    svg: null,
    chips: { 0: [], 1: [], 2: [], 3: [] },
    selected: null,
    toggled: new Array(4).fill(false),
    revealed: new Array(4).fill(false),
    turn: 0,
    markers: [],
    refuted: {},
    placed: [0, 0],
    pending: null,
    guesses: 0,
    tests: 0,
    over: false,
    won: false,
    winner: null
  });

  renderBoard();
  renderLegend();
  renderHands();
  updateTurnBanner();
  setStatus('Player 1 — select a cell and Test it, or Search to accuse.');
}

// ---------- board rendering ----------

function viewBox() {
  const verts = state.board.verts;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const face of state.board.faces) {
    for (const v of face) {
      const [x, y] = verts[v];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const pad = 0.02 * Math.max(maxX - minX, maxY - minY);
  return (minX - pad) + ' ' + (minY - pad) + ' ' + (maxX - minX + 2 * pad) + ' ' + (maxY - minY + 2 * pad);
}

function fontSizeFor(vb) {
  const parts = vb.split(/[\s,]+/).map(Number);
  return parts.length === 4 ? 0.09 * parts[2] : 0.09;
}

function renderBoard() {
  const container = document.getElementById('board');
  container.innerHTML = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'board');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const vb = viewBox();
  svg.setAttribute('viewBox', vb);

  state.polys = [];
  state.letters = [];

  state.board.faces.forEach((face, idx) => {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', face.map(v => state.board.verts[v][0] + ',' + state.board.verts[v][1]).join(' '));
    poly.setAttribute('fill', TERRAINS[state.terrains[idx] % TERRAINS.length].color);
    poly.setAttribute('stroke', COLORS.stroke);
    poly.setAttribute('stroke-width', '0.006');
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('class', 'cell');
    poly.dataset.idx = idx;
    poly.addEventListener('click', () => onCellClick(idx));
    poly.addEventListener('mouseenter', () => onCellHover(idx, true));
    poly.addEventListener('mouseleave', () => onCellHover(idx, false));
    state.polys[idx] = poly;
    svg.appendChild(poly);
  });

  state.landmarks.forEach((lm, li) => {
    const c = state.board.cells[lm].center;
    const letter = document.createElementNS(SVG_NS, 'text');
    letter.setAttribute('x', c[0]);
    letter.setAttribute('y', c[1]);
    letter.setAttribute('text-anchor', 'middle');
    letter.setAttribute('dominant-baseline', 'central');
    letter.setAttribute('font-family', 'Arial Black, Arial, sans-serif');
    letter.setAttribute('font-size', fontSizeFor(vb));
    letter.setAttribute('font-weight', 'bold');
    letter.setAttribute('fill', COLORS.landmark);
    letter.setAttribute('paint-order', 'stroke');
    letter.setAttribute('stroke', COLORS.landmarkStroke);
    letter.setAttribute('stroke-width', fontSizeFor(vb) * 0.18);
    letter.setAttribute('stroke-linejoin', 'round');
    letter.setAttribute('pointer-events', 'none');
    letter.textContent = LANDMARK_LETTERS[li];
    state.letters[li] = letter;
    svg.appendChild(letter);
  });

  state.svg = svg;
  container.appendChild(svg);
  paintCells();
  renderMarks();
}

function renderLegend() {
  const el = document.getElementById('legend');
  el.innerHTML = '';
  const used = [];
  for (let i = 0; i < state.terrains.length; i++) {
    const t = state.terrains[i] % TERRAINS.length;
    if (used.indexOf(t) < 0) used.push(t);
  }
  used.sort((a, b) => a - b);
  for (const t of used) {
    const sw = document.createElement('span');
    sw.className = 'sw';
    const i = document.createElement('i');
    i.style.background = TERRAINS[t].color;
    const lbl = document.createElement('span');
    lbl.textContent = TERRAINS[t].name;
    sw.appendChild(i);
    sw.appendChild(lbl);
    el.appendChild(sw);
  }
}

function hexRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function mixColors(hexA, hexB, t) {
  const a = hexRgb(hexA);
  const b = hexRgb(hexB);
  return '#' + a.map((v, k) => Math.round(v * (1 - t) + b[k] * t).toString(16).padStart(2, '0')).join('');
}

function cellBase(idx) {
  const base = TERRAINS[state.terrains[idx] % TERRAINS.length].color;
  for (let i = 0; i < state.clues.length; i++) {
    if (state.toggled[i] && state.clues[i].cells.indexOf(idx) >= 0) {
      return { fill: mixColors(base, CLUE_COLORS[i % CLUE_COLORS.length], 0.45), opacity: '1' };
    }
  }
  return { fill: base, opacity: '1' };
}

function paintCells() {
  state.polys.forEach((poly, idx) => {
    const base = cellBase(idx);
    poly.setAttribute('fill', base.fill);
    poly.setAttribute('fill-opacity', base.opacity);
    if (state.over && idx !== state.home) {
      poly.setAttribute('opacity', '0.35');
    } else {
      poly.setAttribute('opacity', '1');
    }
    if (state.selected === idx) {
      poly.setAttribute('stroke', COLORS.selectedStroke);
      poly.setAttribute('stroke-width', '0.014');
    } else {
      poly.setAttribute('stroke', COLORS.stroke);
      poly.setAttribute('stroke-width', '0.006');
    }
  });
}

function renderMarks() {
  if (state.svg && state.markGroup) state.svg.removeChild(state.markGroup);
  state.markGroup = null;
  if (!state.svg) return;
  const g = document.createElementNS(SVG_NS, 'g');
  const vb = viewBox();
  const parts = vb.split(/[\s,]+/).map(Number);
  const size = Math.max(parts[2], parts[3]);
  const r = 0.032 * size;
  const fs = 0.06 * size;
  for (const m of state.markers) {
    const c = state.board.cells[m.cell].center;
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', c[0]);
    circle.setAttribute('cy', c[1]);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', PLAYER_COLORS[m.player]);
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', r * 0.4);
    circle.setAttribute('pointer-events', 'none');
    g.appendChild(circle);
  }
  for (const key of Object.keys(state.refuted)) {
    const cell = parseInt(key, 10);
    const c = state.board.cells[cell].center;
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', c[0]);
    t.setAttribute('y', c[1]);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('font-size', fs);
    t.setAttribute('font-weight', 'bold');
    t.setAttribute('fill', '#6b1f24');
    t.setAttribute('paint-order', 'stroke');
    t.setAttribute('stroke', '#ffffff');
    t.setAttribute('stroke-width', fs * 0.18);
    t.setAttribute('pointer-events', 'none');
    t.textContent = '\u2717';
    g.appendChild(t);
  }
  state.markGroup = g;
  state.svg.appendChild(g);
}

// ---------- interaction ----------

function onCellHover(idx, on) {
  if (state.over) return;
  if (state.selected === idx) return;
  const poly = state.polys[idx];
  if (on) {
    poly.setAttribute('stroke', COLORS.hoverStroke);
    poly.setAttribute('stroke-width', '0.012');
  } else {
    poly.setAttribute('stroke', COLORS.stroke);
    poly.setAttribute('stroke-width', '0.006');
  }
}

function onCellClick(idx) {
  if (state.over || state.pending) return;
  state.selected = state.selected === idx ? null : idx;
  paintCells();
  if (state.selected === null) {
    setStatus('Player ' + (state.turn + 1) + ' — select a cell and Test it, or Search to accuse.');
  } else {
    setStatus('Cell ' + idx + ' selected — press Test to place a marker, or Search to accuse it.');
  }
}

// ---------- clue hands & public panel ----------

function makeChip(i, mode, ownerTag) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'clue';
  chip.dataset.index = String(i);
  if (mode === 'back') chip.classList.add('clue-back');
  if (mode === 'revealed') chip.classList.add('clue-revealed');
  const dot = document.createElement('span');
  dot.className = 'clue-dot';
  if (mode !== 'back') dot.style.background = CLUE_COLORS[i % CLUE_COLORS.length];
  const text = document.createElement('span');
  if (mode === 'back') {
    text.textContent = '?';
  } else {
    text.textContent = (ownerTag ? ownerTag + ' — ' : '') + state.clues[i].text;
  }
  chip.appendChild(dot);
  chip.appendChild(text);
  if (mode === 'faceup') {
    chip.addEventListener('click', () => toggleClue(i));
    (state.chips[i] = state.chips[i] || []).push(chip);
    if (state.toggled[i]) chip.classList.add('active');
  }
  return chip;
}

function renderHands() {
  state.chips = { 0: [], 1: [], 2: [], 3: [] };
  const me = state.turn;
  const opp = 1 - me;

  const yourTitle = document.getElementById('yourtitle');
  yourTitle.innerHTML = '';
  const d1 = document.createElement('span');
  d1.className = 'dot';
  d1.style.background = PLAYER_COLORS[me];
  yourTitle.appendChild(d1);
  yourTitle.appendChild(document.createTextNode(' Your clues — Player ' + (me + 1)));
  yourTitle.style.borderColor = PLAYER_COLORS[me];

  const oppTitle = document.getElementById('opptitle');
  oppTitle.innerHTML = '';
  const d2 = document.createElement('span');
  d2.className = 'dot';
  d2.style.background = PLAYER_COLORS[opp];
  oppTitle.appendChild(d2);
  oppTitle.appendChild(document.createTextNode(' Opponent\'s clues — Player ' + (opp + 1)));
  oppTitle.style.borderColor = PLAYER_COLORS[opp];

  const yourPanel = document.getElementById('yourhand');
  yourPanel.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    if (state.clueOwner[i] !== me) continue;
    yourPanel.appendChild(makeChip(i, state.revealed[i] ? 'revealed' : 'faceup'));
  }

  const oppPanel = document.getElementById('opphand');
  oppPanel.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    if (state.clueOwner[i] !== opp) continue;
    oppPanel.appendChild(makeChip(i, state.revealed[i] ? 'revealed' : 'back'));
  }

  const pub = document.getElementById('publicclues');
  pub.innerHTML = '';
  let any = false;
  for (let i = 0; i < 4; i++) {
    if (state.revealed[i]) {
      pub.appendChild(makeChip(i, 'faceup', 'P' + (state.clueOwner[i] + 1)));
      any = true;
    }
  }
  if (!any) {
    const ph = document.createElement('span');
    ph.className = 'placeholder';
    ph.textContent = 'No clues revealed yet — revealed clues appear here and stay public.';
    pub.appendChild(ph);
  }

  const ym = document.getElementById('yourmarkers');
  ym.textContent = 'markers left: ' + (MARKERS_PER_PLAYER - state.placed[me]) +
    '  \u2022  on board: ' + state.markers.filter(m => m.player === me).length;
  const om = document.getElementById('oppmarkers');
  om.textContent = 'markers left: ' + (MARKERS_PER_PLAYER - state.placed[opp]) +
    '  \u2022  on board: ' + state.markers.filter(m => m.player === opp).length;
}

function toggleClue(i) {
  if (state.over) return;
  if (!state.revealed[i] && state.clueOwner[i] !== state.turn) return;
  state.toggled[i] = !state.toggled[i];
  for (const chip of state.chips[i] || []) chip.classList.toggle('active', state.toggled[i]);
  paintCells();
}

// ---------- turn logic ----------

function updateTurnBanner() {
  const el = document.getElementById('turn');
  el.innerHTML = '';
  if (state.over) {
    const d = document.createElement('span');
    d.className = 'dot';
    d.style.background = PLAYER_COLORS[state.winner === null ? 0 : state.winner];
    el.appendChild(d);
    el.appendChild(document.createTextNode(' Game over — Player ' + (state.winner === null ? 1 : state.winner + 1) + ' wins'));
  } else {
    const d = document.createElement('span');
    d.className = 'dot';
    d.style.background = PLAYER_COLORS[state.turn];
    el.appendChild(d);
    el.appendChild(document.createTextNode(' Player ' + (state.turn + 1) + "'s turn"));
  }
}

function passTurn() {
  state.turn = 1 - state.turn;
  state.selected = null;
  renderHands();
  renderMarks();
  paintCells();
  updateTurnBanner();
}

function isPublicExcluded(cell) {
  return state.clues.some((c, i) => state.revealed[i] && !c.cells.includes(cell));
}

function testCell() {
  if (state.over || state.pending) return;
  if (state.selected === null) {
    setStatus('Select a cell first, then Test it.');
    return;
  }
  const cell = state.selected;
  const me = state.turn;
  const opp = 1 - me;
  if (state.placed[me] >= MARKERS_PER_PLAYER) {
    setStatus('No markers left — you must Search or concede.');
    return;
  }
  if (isPublicExcluded(cell)) {
    setStatus('A revealed clue already rules out cell ' + cell + ' — pick another.');
    return;
  }

  state.placed[me]++;
  state.tests++;

  const opts = [];
  for (let i = 0; i < 4; i++) {
    if (state.clueOwner[i] === opp && !state.revealed[i] && state.clues[i].cells.indexOf(cell) < 0) opts.push(i);
  }

  if (opts.length) {
    state.pending = { cell, options: opts, opponent: opp };
    openRefute();
    return;
  }

  state.markers.push({ player: me, cell });
  renderMarks();
  if (state.clues.every(c => c.cells.includes(cell))) {
    winGame('survived');
    return;
  }
  passTurn();
  setStatus('Cell ' + cell + ' was not refuted — your marker stays, but it does not match every clue. Player ' + (state.turn + 1) + "'s turn.");
}

function openRefute() {
  const panel = document.getElementById('refute');
  panel.innerHTML = '';
  panel.classList.remove('hidden');
  const msg = document.createElement('div');
  msg.className = 'refute-msg';
  msg.textContent = 'Player ' + (state.pending.opponent + 1) +
    ', the habitat is NOT on cell ' + state.pending.cell + ' — rule it out with one of your clues. It becomes public:';
  panel.appendChild(msg);
  for (const i of state.pending.options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.index = String(i);
    btn.textContent = 'P' + (state.clueOwner[i] + 1) + ': ' + state.clues[i].text;
    btn.addEventListener('click', () => refuteWith(i));
    panel.appendChild(btn);
  }
}

function closeRefute() {
  const panel = document.getElementById('refute');
  panel.classList.add('hidden');
  panel.innerHTML = '';
}

function refuteWith(i) {
  const cell = state.pending.cell;
  const me = state.turn;
  const opp = 1 - me;
  state.pending = null;
  closeRefute();
  revealClue(i);
  state.refuted[cell] = true;
  killMarkers();
  renderMarks();
  paintCells();
  passTurn();
  setStatus('Player ' + (opp + 1) + ' revealed a clue ruling out cell ' + cell + '. Player ' + (state.turn + 1) + "'s turn.");
}

function revealClue(i) {
  state.revealed[i] = true;
  renderHands();
  if (state.revealed.every(Boolean)) {
    setStatus('All clues are now public — the habitat is the only cell matching every clue.');
  }
}

function killMarkers() {
  for (let k = state.markers.length - 1; k >= 0; k--) {
    const m = state.markers[k];
    if (state.clues.some((c, ci) => state.revealed[ci] && !c.cells.includes(m.cell))) {
      state.refuted[m.cell] = true;
      state.markers.splice(k, 1);
    }
  }
}

function searchCell() {
  if (state.over || state.pending) return;
  if (state.selected === null) {
    setStatus('Select a cell first, then Search.');
    return;
  }
  const cell = state.selected;
  if (isPublicExcluded(cell)) {
    setStatus('A revealed clue already rules out cell ' + cell + ' — pick another.');
    return;
  }
  state.guesses++;
  if (cell === state.home) {
    winGame('searched');
  } else {
    loseGame();
  }
}

function winGame(reason) {
  state.over = true;
  state.won = true;
  state.winner = state.turn;
  for (let i = 0; i < 4; i++) state.revealed[i] = true;
  paintCells();
  renderMarks();
  revealHome();
  renderHands();
  updateTurnBanner();
  const p = 'Player ' + (state.turn + 1);
  if (reason === 'searched') {
    setStatus(p + ' found the habitat on cell ' + state.home + ' by Search' +
      (state.guesses > 1 ? ' (after ' + state.guesses + ' searches)' : '') + '.');
  } else {
    setStatus(p + ' placed a marker the opponent could not refute — the habitat is cell ' + state.home + '.');
  }
}

function loseGame() {
  const accused = state.selected;
  state.over = true;
  state.won = false;
  state.winner = 1 - state.turn;
  for (let i = 0; i < 4; i++) state.revealed[i] = true;
  paintCells();
  renderMarks();
  revealHome();
  renderHands();
  updateTurnBanner();
  setStatus('Player ' + (state.turn + 1) + ' accused cell ' + accused + ' — wrong. The habitat was cell ' +
    state.home + ' (\u2605). Player ' + (state.winner + 1) + ' wins.');
}

function concedeGame() {
  if (state.over) return;
  state.over = true;
  state.won = false;
  state.winner = 1 - state.turn;
  for (let i = 0; i < 4; i++) state.revealed[i] = true;
  paintCells();
  renderMarks();
  revealHome();
  renderHands();
  updateTurnBanner();
  setStatus('Player ' + (state.turn + 1) + ' conceded. Player ' + (state.winner + 1) + ' wins. The habitat was cell ' + state.home + '.');
}

function revealHome() {
  state.polys[state.home].setAttribute('fill', COLORS.home);
  state.polys[state.home].setAttribute('fill-opacity', '1');
  state.polys[state.home].setAttribute('stroke', COLORS.homeStroke);
  state.polys[state.home].setAttribute('stroke-width', '0.016');
  const c = state.board.cells[state.home].center;
  const vb = viewBox();
  const mark = document.createElementNS(SVG_NS, 'text');
  mark.setAttribute('x', c[0]);
  mark.setAttribute('y', c[1]);
  mark.setAttribute('text-anchor', 'middle');
  mark.setAttribute('dominant-baseline', 'central');
  mark.setAttribute('font-family', 'Arial Black, Arial, sans-serif');
  mark.setAttribute('font-size', fontSizeFor(vb));
  mark.setAttribute('font-weight', 'bold');
  mark.setAttribute('fill', '#ffffff');
  mark.setAttribute('pointer-events', 'none');
  mark.textContent = '\u2605';
  state.polys[state.home].parentNode.appendChild(mark);
}

// ---------- boot ----------

function boot() {
  const select = document.getElementById('tessagon');
  for (const name of Object.keys(TessagonTypes).sort()) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.value = 'HexTessagon';

  document.getElementById('newgame').addEventListener('click', newGame);
  document.getElementById('test').addEventListener('click', testCell);
  document.getElementById('search').addEventListener('click', searchCell);
  document.getElementById('concede').addEventListener('click', concedeGame);
  select.addEventListener('change', newGame);
  document.getElementById('tcols').addEventListener('change', newGame);
  document.getElementById('trows').addEventListener('change', newGame);

  newGame();
}

if (typeof document !== 'undefined') {
  boot();
}
