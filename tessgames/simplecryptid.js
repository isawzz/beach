// simplecryptid.js — a Cryptid-inspired deduction game whose clues are derived
// from the topology of whichever tessellation board is loaded.
//
// A creature's habitat (one cell) is hidden. Each clue is a topological rule
// (neighbour count, ring density, distance to a landmark, compass bearing, ...)
// and the intersection of all clue regions is exactly the habitat, so the
// player can deduce it. Clues are built from the board's cell-neighbour graph,
// so the same generator works on any tessagon in TessagonTypes.

// tess.js references this helper and hexboard.js defines both addKeys and
// SVG_NS at the top level, so this file reuses them rather than redeclaring.

const COLORS = {
  empty: '#e9ecef',
  stroke: '#3d5870',
  hoverStroke: '#ffd166',
  selected: '#264653',
  selectedStroke: '#ffd166',
  home: '#264653',
  homeStroke: '#ffd166',
  landmark: '#264653',
  landmarkStroke: '#ffffff'
};

// One color per clue so toggled regions are distinguishable on the board.
const CLUE_COLORS = ['#e76f51', '#2a9d8f', '#9b5de5', '#f4a261', '#00bbf9', '#f15bb5'];

const COMPASS_WORDS = { N: 'north', NE: 'northeast', E: 'east', SE: 'southeast', S: 'south', SW: 'southwest', W: 'west', NW: 'northwest' };

const state = {
  board: null,
  home: null,
  clues: [],
  landmarks: [],
  landmarkLetters: 'ABCDEFGHIJ',
  polys: [],
  letters: [],
  selected: null,
  toggled: [],
  guesses: 0,
  over: false,
  won: false,
  revealedHome: false
};

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

// ---------- topology analysis ----------

function bfsDists(adj, src) {
  // BFS distance from `src` to every cell over the edge-adjacency graph.
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
  // Choose `k` well-spread landmark cells: the cell nearest the centroid, then
  // repeatedly the cell farthest from the already-chosen landmarks.
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
  const b = bearing(centers[fromIdx], centers[toIdx]);
  return b.compass;
}

function generatePuzzle(board, minClues) {
  // Generate a puzzle: pick a home cell and build clues whose intersection is
  // exactly {home}. Retries with fresh random homes until the greedy selection
  // collapses the candidate set to a single cell.
  const N = board.faces.length;
  const adj = adjMatrix(board);
  const centers = board.cells.map(c => c.center);
  const landmarks = pickLandmarks(adj, centers, 4);
  const dists = landmarks.map(l => bfsDists(adj, l));
  const hasColor = Array.isArray(board.color_list) && board.color_list.length === N;

  const feat = [];
  for (let i = 0; i < N; i++) {
    const f = { idx: i, deg: adj[i].length, flen: board.cells[i].face.length, color: hasColor ? board.color_list[i] : null };
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

  for (let attempt = 0; attempt < 40; attempt++) {
    const home = Math.floor(Math.random() * N);
    const hf = feat[home];
    const cands = [];
    const addC = (type, value) => {
      const size = feat.filter(f => f[type] === value).length;
      // A region of one cell would hand the player the answer; require a
      // region that is non-trivial but not the whole board.
      if (size >= 3 && size < N) cands.push({ type, value, size });
    };
    addC('deg', hf.deg);
    addC('flen', hf.flen);
    addC('ring1', hf.ring1);
    addC('ring2', hf.ring2);
    addC('ring3', hf.ring3);
    if (hasColor) addC('color', hf.color);
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
    const chosen = [];
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
    while (chosen.length < minClues && cands.length) {
      chosen.push(cands.pop());
    }
    return {
      home,
      landmarks,
      clues: chosen.map(cand => describeClue(board, feat, landmarks, home, cand)),
      ok: true
    };
  }
  return { ok: false };
}

function describeClue(board, feat, landmarks, home, cand) {
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
    text = 'The habitat is on a ' + value + ' cell.';
  } else if (type[0] === 'd') {
    const li = parseInt(type.slice(1), 10);
    text = 'The habitat is exactly ' + value + ' step' + (value === 1 ? '' : 's') + ' from landmark ' + state.landmarkLetters[li] + '.';
  } else if (type[0] === 'c') {
    const li = parseInt(type.slice(1), 10);
    text = 'The habitat lies to the ' + (COMPASS_WORDS[value] || value) + ' of landmark ' + state.landmarkLetters[li] + '.';
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

  let board;
  try {
    board = buildTessellation(name, { H, V });
  } catch (e) {
    setStatus('Could not build ' + name + ': ' + e.message);
    return;
  }

  let puzzle = null;
  for (let i = 0; i < 10 && !puzzle; i++) {
    puzzle = generatePuzzle(board, 3);
  }
  if (!puzzle) {
    setStatus('Could not generate a solvable puzzle on this board — try another size.');
    return;
  }

  Object.assign(state, {
    board,
    home: puzzle.home,
    clues: puzzle.clues,
    landmarks: puzzle.landmarks,
    selected: null,
    toggled: new Array(puzzle.clues.length).fill(false),
    guesses: 0,
    over: false,
    won: false,
    revealedHome: false
  });

  renderBoard();
  renderClues();
  setStatus('Find the habitat. Click a clue to light up its region, then search a cell.');
}

function renderClues() {
  const panel = document.getElementById('clues');
  panel.innerHTML = '';
  state.clues.forEach((clue, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'clue';
    chip.dataset.index = i;

    const dot = document.createElement('span');
    dot.className = 'clue-dot';
    dot.style.background = CLUE_COLORS[i % CLUE_COLORS.length];

    const text = document.createElement('span');
    text.textContent = clue.text;

    chip.appendChild(dot);
    chip.appendChild(text);
    chip.addEventListener('click', () => toggleClue(i, chip));
    panel.appendChild(chip);
  });
}

function toggleClue(i, chip) {
  state.toggled[i] = !state.toggled[i];
  chip.classList.toggle('active', state.toggled[i]);
  paintCells();
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
    poly.setAttribute('fill', COLORS.empty);
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

  // Landmark letters, drawn on top of their cells.
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
    letter.textContent = state.landmarkLetters[li];
    state.letters[li] = letter;
    svg.appendChild(letter);
  });

  container.appendChild(svg);
  paintCells();
}

function cellBase(idx) {
  // The displayed fill of a cell: the (first) toggled clue that covers it, or the
  // empty colour. Overlapping clues blend through a reduced fill-opacity.
  for (let i = 0; i < state.clues.length; i++) {
    if (state.toggled[i] && state.clues[i].cells.indexOf(idx) >= 0) {
      return { fill: CLUE_COLORS[i % CLUE_COLORS.length], opacity: '0.45' };
    }
  }
  return { fill: COLORS.empty, opacity: '1' };
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
  if (state.over) return;
  state.selected = state.selected === idx ? null : idx;
  paintCells();
  if (state.selected !== null) {
    setStatus('Cell ' + idx + ' selected — press Search to accuse it as the habitat.');
  } else {
    setStatus('Find the habitat. Click a clue to light up its region, then search a cell.');
  }
}

function revealHome() {
  state.revealedHome = true;
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

function search() {
  if (state.over) return;
  if (state.selected === null) {
    setStatus('First click a cell to select it, then Search.');
    return;
  }
  state.guesses++;
  if (state.selected === state.home) {
    state.over = true;
    state.won = true;
    revealHome();
    setStatus('You found the habitat in ' + state.guesses + ' guess' + (state.guesses === 1 ? '' : 'es') + '.');
  } else {
    state.over = true;
    state.won = false;
    paintCells();
    revealHome();
    setStatus('Not the habitat. The creature lives on the cell marked \u2605.');
  }
}

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
  document.getElementById('search').addEventListener('click', search);
  document.getElementById('reveal').addEventListener('click', () => {
    if (state.over) return;
    state.over = true;
    state.won = false;
    paintCells();
    revealHome();
    setStatus('Given up. The habitat was the cell marked \u2605.');
  });
  select.addEventListener('change', newGame);
  document.getElementById('tcols').addEventListener('change', newGame);
  document.getElementById('trows').addEventListener('change', newGame);

  newGame();
}

if (typeof document !== 'undefined') {
  boot();
}
