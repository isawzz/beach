// tess.js references this helper, so it must be in scope before building a tessagon.
function addKeys(ofrom, oto) {
  for (const k in ofrom) if (!oto.hasOwnProperty(k)) oto[k] = ofrom[k];
  return oto;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// HexTessagon tiles are regular only when v is scaled by sqrt(3) * V / U.
// When U equals V that is simply sqrt(3).
function hexPlane(u, v, scale) {
  return [u, v * scale, 0];
}

// The default plane for a generic tessellation maps uv space directly to xy.
function defaultPlane(u, v) {
  return [u, v, 0];
}

// Every tessagon type provided by alibs/tess.js.
const TessagonTypes = {
  BigHexTriTessagon,
  CloverdaleTessagon,
  DissectedHexQuadTessagon,
  DissectedHexTriTessagon,
  DissectedSquareTessagon,
  DissectedTriangleTessagon,
  DodecaTessagon,
  DodecaTriTessagon,
  FloretTessagon,
  HexBigTriTessagon,
  HexSquareTriTessagon,
  HexTriTessagon,
  IslamicHexStarsTessagon,
  IslamicStarsCrossesTessagon,
  OctoTessagon,
  PentaTessagon,
  Penta2Tessagon,
  PythagoreanTessagon,
  RhombusTessagon,
  SquareTessagon,
  SquareTriTessagon,
  SquareTri2Tessagon,
  StanleyParkTessagon,
  TriTessagon,
  ValemountTessagon,
  WeaveTessagon,
  ZigZagTessagon,
  HexTessagon,
  BrickTessagon,
  SimpleBoundaryTessagon,
  Simple2Tessagon,
  Simple1Tessagon,
  SquareStarTessagon
};

// Build a hexagonal board of side length `size` from a HexTessagon.
//
// A HexTessagon lays out tiles on a U x V grid. Each tile owns one hexagon,
// so the patch is a rectangle of hexagons. A hexagonal board is that
// rectangle with every hexagon lying outside the hexagon |q|,|r|,|q+r| <=
// size-1 discarded, where (q, r) are the axial coordinates of the hexagon
// center. Returns the kept cells, their centers, and their edge adjacency.
function buildHexBoard(size, options = {}) {
  const N = size;
  const U = options.U || 2 * N;
  const V = options.V || N;
  const scale = Math.sqrt(3) * V / U;

  const tessagon = new HexTessagon({
    function: (u, v) => hexPlane(u, v, scale),
    u_range: [0, 1],
    v_range: [0, 1],
    u_num: U,
    v_num: V,
    u_cyclic: false,
    v_cyclic: false,
    adaptor_class: ListAdaptor
  });
  const mesh = tessagon.create_mesh();
  const faces = mesh.face_list;
  const verts = mesh.vert_list;

  const centers = faces.map(face => {
    let x = 0;
    let y = 0;
    for (const v of face) {
      x += verts[v][0];
      y += verts[v][1];
    }
    return [x / face.length, y / face.length];
  });

  // The center cell is the one nearest the middle of the uv patch; it must
  // be a real hexagon center for the axial coordinates to land on integers.
  let origin = 0;
  let bestDist = Infinity;
  centers.forEach(([x, y], i) => {
    const d = (x - 0.5) * (x - 0.5) + (y / scale - 0.5) * (y / scale - 0.5);
    if (d < bestDist) {
      bestDist = d;
      origin = i;
    }
  });
  const u0 = centers[origin][0];
  const v0 = centers[origin][1] / scale;

  // Adjacent centers sit one tile apart horizontally (du) and half a tile
  // over and one row down on the diagonal (du/2, dv).
  const du = 1 / U;
  const dv = 1 / (2 * V);
  const axial = centers.map(([x, y]) => {
    const r = Math.round((y / scale - v0) / dv);
    const q = Math.round((x - u0 - r * du / 2) / du);
    return [q, r];
  });

  const inBoard = axial.map(([q, r]) =>
    Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= N - 1
  );

  const cellIds = [];
  const toNew = {};
  faces.forEach((face, i) => {
    if (inBoard[i]) {
      toNew[i] = cellIds.length;
      cellIds.push(i);
    }
  });

  const neighborMap = getFaceNeighbors(faces);
  const neighbors = cellIds.map(id =>
    neighborMap[id].filter(n => inBoard[n]).map(n => toNew[n])
  );

  return {
    size: N,
    U,
    V,
    faces: cellIds.map(i => faces[i]),
    verts,
    centers: cellIds.map(i => centers[i]),
    axial: cellIds.map(i => axial[i]),
    neighbors
  };
}

// Render a board built by buildHexBoard into an SVG container.
function renderHexBoard(board, container, options = {}) {
  const fill = options.fill || '#e9ecef';
  const stroke = options.stroke || '#3d5870';
  const strokeWidth = options.strokeWidth || '0.006';
  const hoverFill = options.hoverFill || '#ffd166';

  container.innerHTML = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', options.className || 'board');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const face of board.faces) {
    for (const v of face) {
      const [x, y] = board.verts[v];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const pad = 0.02 * Math.max(maxX - minX, maxY - minY);
  if (board.faces.length === 0) {
    svg.setAttribute('viewBox', '0 0 1 1');
  } else {
    svg.setAttribute(
      'viewBox',
      (minX - pad) + ' ' + (minY - pad) + ' ' + (maxX - minX + 2 * pad) + ' ' + (maxY - minY + 2 * pad)
    );
  }

  board.faces.forEach((face, idx) => {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', face.map(v => board.verts[v][0] + ',' + board.verts[v][1]).join(' '));
    poly.setAttribute('fill', fill);
    poly.setAttribute('stroke', stroke);
    poly.setAttribute('stroke-width', strokeWidth);
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('class', 'cell');
    if (options.onCellClick) {
      poly.addEventListener('click', () => options.onCellClick(idx, board));
    }
    poly.addEventListener('mouseenter', () => poly.setAttribute('fill', hoverFill));
    poly.addEventListener('mouseleave', () => poly.setAttribute('fill', fill));
    svg.appendChild(poly);
  });

  container.appendChild(svg);
  return svg;
}

// Add a street on every edge of the board: the edge shared by two adjacent
// hexes and the outer edges of the board's perimeter. Each street is a line
// centered on that edge. Returns the list of streets, each
// { i, j, outer, line } where i is the first adjacent cell and, for interior
// streets, j is the second adjacent cell (i < j).
function addStreets(board, svg, options = {}) {
  const color = options.color || 'red';
  const width = options.width || 10;
  const hoverColor = options.hoverColor || '#ff6b6b';

  const edges = new Map();
  const keyOf = (a, b) => (a < b ? a + ',' + b : b + ',' + a);

  board.faces.forEach((face, i) => {
    for (let k = 0; k < face.length; k++) {
      const a = face[k];
      const b = face[(k + 1) % face.length];
      const key = keyOf(a, b);
      if (edges.has(key)) {
        edges.get(key).j = i;
      } else {
        edges.set(key, { i, j: -1, a, b });
      }
    }
  });

  const streets = [];
  for (const e of edges.values()) {
    const pa = board.verts[e.a];
    const pb = board.verts[e.b];
    const outer = e.j < 0;
    const i = e.i;
    const j = outer ? null : e.j;

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', pa[0]);
    line.setAttribute('y1', pa[1]);
    line.setAttribute('x2', pb[0]);
    line.setAttribute('y2', pb[1]);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', width);
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('class', 'street');
    line.dataset.cells = i + (outer ? '' : ',' + j);

    const street = { i, j, outer, line, x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1] };
    if (options.onStreetClick) {
      line.addEventListener('click', () => options.onStreetClick(street, board));
    }
    line.addEventListener('mouseenter', () => {
      line.setAttribute('stroke', hoverColor);
      if (options.onStreetHover) options.onStreetHover(street, true, board);
    });
    line.addEventListener('mouseleave', () => {
      line.setAttribute('stroke', color);
      if (options.onStreetHover) options.onStreetHover(street, false, board);
    });

    streets.push(street);
    svg.appendChild(line);
  }
  return streets;
}

// Add a city (a filled circle) at every polygon corner of the board, drawn on
// top of the hexes and streets. Returns the list of cities, each
// { v, x, y, circle, cells } where v is the vertex index and cells are the
// hexes that meet at that corner.
function addCities(board, svg, options = {}) {
  const color = options.color || 'blue';
  const hoverColor = options.hoverColor || '#66b3ff';

  let radius = options.radius;
  if (!radius) {
    const viewBox = svg.getAttribute ? svg.getAttribute('viewBox') : null;
    const parts = viewBox ? viewBox.split(/[\s,]+/).map(Number) : null;
    radius = (parts && parts.length === 4 && parts[2] > 0) ? 0.02 * parts[2] : 0.02;
  }

  const usedVerts = new Set();
  board.faces.forEach(face => face.forEach(v => usedVerts.add(v)));

  const cities = [];
  for (const v of usedVerts) {
    const [x, y] = board.verts[v];
    const cells = [];
    board.faces.forEach((face, i) => {
      if (face.includes(v)) cells.push(i);
    });

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', '#14212e');
    circle.setAttribute('stroke-width', radius * 0.25);
    circle.setAttribute('vector-effect', 'non-scaling-stroke');
    circle.setAttribute('class', 'city');
    circle.dataset.vertex = v;

    const city = { v, x, y, circle, cells };
    if (options.onCityClick) {
      circle.addEventListener('click', () => options.onCityClick(city, board));
    }
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute('fill', hoverColor);
      if (options.onCityHover) options.onCityHover(city, true, board);
    });
    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('fill', color);
      if (options.onCityHover) options.onCityHover(city, false, board);
    });

    cities.push(city);
    svg.appendChild(circle);
  }
  return cities;
}

// Build the mesh of any tessagon. Accept a class, a name from TessagonTypes,
// or an already-built instance. Returns { faces, verts, U, V, tess }.
function buildTessellation(tessagon, options = {}) {
  const U = options.U || options.cols || 6;
  const V = options.V || options.rows || 6;

  const common = {
    function: options.function || defaultPlane,
    u_range: options.u_range || [0, 1],
    v_range: options.v_range || [0, 1],
    u_num: U,
    v_num: V,
    u_cyclic: options.u_cyclic === true,
    v_cyclic: options.v_cyclic === true,
    adaptor_class: options.adaptor_class || ListAdaptor
  };

  let tess;
  if (typeof tessagon === 'string') {
    const Tess = TessagonTypes[tessagon] || globalThis[tessagon];
    if (!Tess) throw new Error('Unknown tessagon: ' + tessagon);
    tess = new Tess(common);
  } else if (typeof tessagon === 'function') {
    tess = new tessagon(common);
  } else if (tessagon && typeof tessagon.create_mesh === 'function') {
    tess = tessagon;
  } else {
    throw new Error('Invalid tessagon: ' + tessagon);
  }

  const mesh = tess.create_mesh();
  return { faces: mesh.face_list, verts: mesh.vert_list, U, V, tess };
}

// Add streets (the shared edges between tiles) to the svg for any tessagon.
function addStreetsToTessellation(tessagon, svg, options = {}) {
  return addStreets(buildTessellation(tessagon, options), svg, options);
}

// Add cities (the corners where tiles meet) to the svg for any tessagon.
function addCitiesToTessellation(tessagon, svg, options = {}) {
  return addCities(buildTessellation(tessagon, options), svg, options);
}

function boot() {
  const container = document.getElementById('board');
  const board = buildHexBoard(4);
  const svg = renderHexBoard(board, container, {
    onCellClick: idx => {
      const [x, y] = board.centers[idx];
      const [col, row] = board.axial[idx];
      console.log(x, y, col, row);
    }
  });
  const streets = addStreets(board, svg, {
    onStreetClick: street => {
      const [xa, ya] = board.centers[street.i];
      const [xb, yb] = street.j === null ? [] : board.centers[street.j];
      console.log('street', street.i, street.j, street.outer, xa, ya, xb, yb);
    }
  });
  const cities = addCities(board, svg, {
    onCityClick: city => {
      console.log('city', city.v, city.x, city.y, 'cells', city.cells.join(','));
    }
  });

  const status = document.getElementById('status');
  if (status) {
    status.textContent = board.faces.length + ' cells, ' +
      streets.length + ' streets, ' + cities.length + ' cities built from a ' +
      board.U + ' x ' + board.V + ' HexTessagon patch.';
  }
}

if (typeof document !== 'undefined') {
  boot();
}
