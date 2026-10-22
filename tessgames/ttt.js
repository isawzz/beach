function addKeys(ofrom, oto) {
  // tess.js references this helper, so it must be in scope before building a tessagon.
  for (const k in ofrom) if (!oto.hasOwnProperty(k)) oto[k] = ofrom[k];
  return oto;
}

const WIN = 3;

const COLORS = {
  empty: '#e9ecef',
  x: '#e76f51',
  o: '#2a9d8f',
  xHover: '#f2a48f',
  oHover: '#7fd1c7',
  stroke: '#3d5870',
  win: '#ffd166'
};

function hexPlane(h, v) {
  // HexTessagon's hv_ratio is 1/sqrt(3); scaling v by sqrt(3) makes the
  // hexagons regular so the board tiles cleanly.
  return [h, v * Math.sqrt(3), 0];
}

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  H: 4,
  V: 4,
  board: {},
  current: 'X',
  winner: null,
  moves: 0,
  totalCells: 0,
  centers: [],
  lines: [],
  polys: [],
  marks: []
};

function buildLines(faces, verts, neighborMap) {
  // Build the set of maximal straight lines on the board. A straight line is a
  // chain of edge-adjacent hexagons whose centers are collinear. Continuation is
  // the neighbor with (nearly) zero cross product with the current direction.
  const centers = faces.map(face => {
    let x = 0;
    let y = 0;
    for (const v of face) {
      x += verts[v][0];
      y += verts[v][1];
    }
    return [x / face.length, y / face.length];
  });

  const cross = (A, B, C) =>
    (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
  const EPS = 1e-6;

  const continuation = (A, B) => {
    let best = null;
    let bestCross = Infinity;
    for (const C of neighborMap[B]) {
      if (C === A) continue;
      const cr = Math.abs(cross(centers[A], centers[B], centers[C]));
      if (cr < bestCross) {
        bestCross = cr;
        best = C;
      }
    }
    return bestCross < EPS ? best : null;
  };

  const seen = new Set();
  const lines = [];
  for (let i = 0; i < faces.length; i++) {
    for (const j of neighborMap[i]) {
      const fwd = [j];
      let a = i;
      let b = j;
      let c;
      while ((c = continuation(a, b)) !== null) {
        fwd.push(c);
        a = b;
        b = c;
      }
      const bwd = [i];
      a = j;
      b = i;
      c = null;
      while ((c = continuation(a, b)) !== null) {
        bwd.push(c);
        a = b;
        b = c;
      }
      const line = bwd.reverse().concat(fwd);
      const key = line.slice().sort((x, y) => x - y).join(',');
      if (line.length >= WIN && !seen.has(key)) {
        seen.add(key);
        lines.push(line);
      }
    }
  }
  return { centers, lines };
}

function findWin() {
  // Find the longest run of WIN same-player cells on any line. Returns the run
  // (array of cell indices) or null.
  for (const line of state.lines) {
    let run = [];
    for (const idx of line) {
      const p = state.board[idx];
      if (p && (run.length === 0 || p === state.board[run[0]])) {
        run.push(idx);
      } else {
        if (run.length >= WIN) return run.slice();
        run = p ? [idx] : [];
      }
    }
    if (run.length >= WIN) return run.slice();
  }
  return null;
}

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

function setMark(idx, player) {
  state.polys[idx].setAttribute('fill', COLORS[player.toLowerCase()]);
  const mark = state.marks[idx];
  mark.textContent = player;
  mark.setAttribute('fill', '#ffffff');
}

function hoverCell(idx, on) {
  if (state.winner || state.board[idx]) return;
  const poly = state.polys[idx];
  if (on) {
    poly.setAttribute('fill', COLORS[state.current.toLowerCase() + 'Hover']);
  } else {
    poly.setAttribute('fill', COLORS.empty);
  }
}

function highlight(winLine) {
  const winSet = new Set(winLine);
  state.polys.forEach((poly, idx) => {
    if (winSet.has(idx)) {
      poly.setAttribute('stroke', COLORS.win);
      poly.setAttribute('stroke-width', '0.016');
    } else {
      poly.setAttribute('opacity', '0.35');
    }
  });
}

function handleClick(idx) {
  if (state.winner || state.board[idx]) return;
  state.board[idx] = state.current;
  state.moves++;
  setMark(idx, state.current);

  const winLine = findWin();
  if (winLine) {
    state.winner = state.current;
    highlight(winLine);
    setStatus(state.current + ' wins!');
  } else if (state.moves === state.totalCells) {
    setStatus('Draw!');
  } else {
    state.current = state.current === 'X' ? 'O' : 'X';
    setStatus(state.current + ' to move');
  }
}

function buildBoard(H, V) {
  const options = {
    function: hexPlane,
    h_range: [0, 1],
    v_range: [0, 1],
    h_num: H,
    v_num: V,
    h_cyclic: false,
    v_cyclic: false,
    adaptor_class: ListAdaptor
  };
  const tessagon = new CloverdaleTessagon(options);
  const mesh = tessagon.create_mesh();
  const faces = mesh.face_list;
  const verts = mesh.vert_list;

  const neighborMap = getFaceNeighbors(faces);
  const built = buildLines(faces, verts, neighborMap);

  Object.assign(state, {
    H,
    V,
    board: {},
    current: 'X',
    winner: null,
    moves: 0,
    totalCells: faces.length,
    centers: built.centers,
    lines: built.lines,
    polys: [],
    marks: []
  });

  const container = document.getElementById('board');
  container.innerHTML = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'board');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of verts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const pad = 0.02 * Math.max(maxX - minX, maxY - minY);
  svg.setAttribute(
    'viewBox',
    (minX - pad) + ' ' + (minY - pad) + ' ' + (maxX - minX + 2 * pad) + ' ' + (maxY - minY + 2 * pad)
  );

  faces.forEach((face, idx) => {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', face.map(v => verts[v][0] + ',' + verts[v][1]).join(' '));
    poly.setAttribute('fill', COLORS.empty);
    poly.setAttribute('stroke', COLORS.stroke);
    poly.setAttribute('stroke-width', '0.006');
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('class', 'cell');
    poly.dataset.idx = idx;
    state.polys[idx] = poly;

    const c = built.centers[idx];
    const mark = document.createElementNS(SVG_NS, 'text');
    mark.setAttribute('x', c[0]);
    mark.setAttribute('y', c[1]);
    mark.setAttribute('text-anchor', 'middle');
    mark.setAttribute('dominant-baseline', 'central');
    mark.setAttribute('font-family', 'Arial Black, Arial, sans-serif');
    mark.setAttribute('font-size', '0.12');
    mark.setAttribute('font-weight', 'bold');
    mark.setAttribute('pointer-events', 'none');
    mark.textContent = '';
    state.marks[idx] = mark;

    poly.addEventListener('click', () => handleClick(idx));
    poly.addEventListener('mouseenter', () => hoverCell(idx, true));
    poly.addEventListener('mouseleave', () => hoverCell(idx, false));

    svg.appendChild(poly);
    svg.appendChild(mark);
  });

  container.appendChild(svg);
  setStatus('X to move');
}

function boot() {
  const size = document.getElementById('size');
  const restart = document.getElementById('restart');

  size.addEventListener('change', () => {
    const n = parseInt(size.value, 10);
    buildBoard(n, n);
  });
  restart.addEventListener('click', () => {
    const n = parseInt(size.value, 10);
    buildBoard(n, n);
  });

  buildBoard(state.H, state.V);
}

if (typeof document !== 'undefined') {
  boot();
}
