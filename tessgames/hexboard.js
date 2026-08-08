function addKeys(ofrom, oto) {
  // tess.js references this helper, so it must be in scope before building a tessagon.
  for (const k in ofrom) if (!oto.hasOwnProperty(k)) oto[k] = ofrom[k];
  return oto;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function hexPlane(u, v, scale) {
  // HexTessagon tiles are regular only when v is scaled by sqrt(3) * V / U.
  // When U equals V that is simply sqrt(3).
  return [u, v * scale, 0];
}

function defaultPlane(u, v) {
  // The default plane for a generic tessellation maps uv space directly to xy.
  return [u, v, 0];
}

const TessagonTypes = {
  // Every tessagon type provided by alibs/tess.js.
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
  SquareStarTessagon,
  VoronoiTessagon
};

function buildHexBoard(size, options = {}) {
  // Build a hexagonal board of side length `size` from a HexTessagon.
  //
  // A HexTessagon lays out tiles on a U x V grid. Each tile owns one hexagon,
  // so the patch is a rectangle of hexagons. A hexagonal board is that
  // rectangle with every hexagon lying outside the hexagon |q|,|r|,|q+r| <=
  // size-1 discarded, where (q, r) are the axial coordinates of the hexagon
  // center. Returns the kept cells, their centers, and their edge adjacency.
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

  const board = {
    size: N,
    U,
    V,
    faces: cellIds.map(i => faces[i]),
    verts,
    centers: cellIds.map(i => centers[i]),
    axial: cellIds.map(i => axial[i]),
    neighbors
  };
  analyzeBoard(board);
  return board;
}

function renderHexBoard(board, container, options = {}) {
  // Render a board built by buildHexBoard into an SVG container.
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

function addStreets(board, svg, options = {}) {
  // Add a street on every edge of the board: the edge shared by two adjacent
  // hexes and the outer edges of the board's perimeter. Each street is a line
  // centered on that edge. Returns board.streets, each entry
  // { id, a, b, i, j, outer, cells, x1, y1, x2, y2, mid, len, line } where a and
  // b are the vertex indices of its endpoints, i is the first adjacent cell and,
  // for interior streets, j is the second adjacent cell (i < j).
  analyzeBoard(board);
  const color = options.color || 'red';
  const width = options.width || 10;
  const hoverColor = options.hoverColor || '#ff6b6b';

  for (const street of board.streets) {
    const pa = board.verts[street.a];
    const pb = board.verts[street.b];

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
    line.dataset.street = street.id;
    line.dataset.cells = street.cells.join(',');

    street.line = line;
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

    svg.appendChild(line);
  }
  return board.streets;
}

function addCities(board, svg, options = {}) {
  // Add a city (a filled circle) at every polygon corner of the board, drawn on
  // top of the hexes and streets. Returns board.cities, each entry
  // { id, v, x, y, cells, circle } where v is the vertex index and cells are the
  // ids of the hexes that meet at that corner.
  analyzeBoard(board);
  const color = options.color || 'blue';
  const hoverColor = options.hoverColor || '#66b3ff';

  let radius = options.radius;
  if (!radius) {
    const viewBox = svg.getAttribute ? svg.getAttribute('viewBox') : null;
    const parts = viewBox ? viewBox.split(/[\s,]+/).map(Number) : null;
    radius = (parts && parts.length === 4 && parts[2] > 0) ? 0.02 * parts[2] : 0.02;
  }

  for (const city of board.cities) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', city.x);
    circle.setAttribute('cy', city.y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', '#14212e');
    circle.setAttribute('stroke-width', radius * 0.25);
    circle.setAttribute('vector-effect', 'non-scaling-stroke');
    circle.setAttribute('class', 'city');
    circle.dataset.city = city.id;
    circle.dataset.vertex = city.v;

    city.circle = circle;
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

    svg.appendChild(circle);
  }
  return board.cities;
}

function analyzeBoard(board) {
  // Build the complete adjacency map of a board. From { faces, verts } this
  // derives board.cells, board.cities, board.streets and board.adj:
  //
  //   board.cells[i]    { id, idx, face, center, adj }   (face.id === cell.id)
  //   board.streets[i]  { id, a, b, i, j, outer, cells, x1, y1, x2, y2, mid,
  //                       len, adj }
  //   board.cities[i]   { id, v, x, y, cells, adj }
  //   board.adj[id]     { cells: [...], streets: [...], cities: [...] }
  //
  // Every entry of an adj list is { id, deg, compass } where deg is the bearing
  // of the neighbor from this element's reference point (east = 0, south = 90,
  // degrees measured clockwise in the SVG y-down plane) and compass is the
  // nearest of N, NE, E, SE, S, SW, W, NW. Reference points are the cell center,
  // the street midpoint and the city position. City-to-city neighbours are the
  // cities one street away, street-to-street neighbours share a city, and
  // cell-to-cell neighbours share a street.
  //
  // Idempotent: calling it again on a board that already has board.adj does
  // nothing.
  if (board.adj) {
    return board;
  }
  const faces = board.faces;
  const verts = board.verts;

  const cells = faces.map((face, idx) => {
    face.id = 'c' + idx;
    let sx = 0;
    let sy = 0;
    for (const v of face) {
      sx += verts[v][0];
      sy += verts[v][1];
    }
    return { id: 'c' + idx, idx, face, center: [sx / face.length, sy / face.length] };
  });

  const edgeMap = new Map();
  const vertexFaces = new Map();
  faces.forEach((face, i) => {
    const seen = new Set();
    for (const v of face) {
      if (seen.has(v)) {
        continue;
      }
      seen.add(v);
      if (!vertexFaces.has(v)) {
        vertexFaces.set(v, []);
      }
      vertexFaces.get(v).push(i);
    }
    for (let k = 0; k < face.length; k++) {
      const a = face[k];
      const b = face[(k + 1) % face.length];
      if (a === b) {
        continue;
      }
      const key = a < b ? a + ',' + b : b + ',' + a;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { a, b, cells: [] });
      }
      edgeMap.get(key).cells.push(i);
    }
  });

  const streets = [];
  for (const e of edgeMap.values()) {
    const i = e.cells[0];
    const j = e.cells.length > 1 ? e.cells[1] : null;
    const pa = verts[e.a];
    const pb = verts[e.b];
    streets.push({
      id: 's' + streets.length,
      a: e.a,
      b: e.b,
      i,
      j,
      outer: j === null,
      cells: j === null ? ['c' + i] : ['c' + i, 'c' + j],
      x1: pa[0],
      y1: pa[1],
      x2: pb[0],
      y2: pb[1],
      mid: [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2],
      len: Math.hypot(pb[0] - pa[0], pb[1] - pa[1])
    });
  }

  const cities = [];
  for (const v of vertexFaces.keys()) {
    const [x, y] = verts[v];
    cities.push({
      id: 'v' + cities.length,
      v,
      x,
      y,
      cells: vertexFaces.get(v).map(i => 'c' + i)
    });
  }

  board.cells = cells;
  board.cities = cities;
  board.streets = streets;
  board.adj = buildAdjacency(board);
  return board;
}

function bearing(from, to) {
  // Bearing of `to` from `from` in the y-down plane: east = 0, south = 90,
  // west = 180, north = 270, plus the nearest 8-point compass label.
  let deg = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
  if (deg < 0) {
    deg += 360;
  }
  const compass = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'][Math.round(deg / 45) % 8];
  return { deg: Math.round(deg * 100) / 100, compass };
}

function buildAdjacency(board) {
  // Derive board.adj from board.cells/streets/cities (see analyzeBoard). Each
  // element's adj entry is also attached to the element itself.
  const { cells, cities, streets } = board;
  const adj = {};

  const refOf = {};
  for (const c of cells) {
    refOf[c.id] = c.center;
  }
  for (const s of streets) {
    refOf[s.id] = s.mid;
  }
  for (const t of cities) {
    refOf[t.id] = [t.x, t.y];
  }
  const rel = (fromId, toId) => Object.assign({ id: toId }, bearing(refOf[fromId], refOf[toId]));

  const vertexStreetIds = new Map();
  for (const s of streets) {
    for (const v of [s.a, s.b]) {
      if (!vertexStreetIds.has(v)) {
        vertexStreetIds.set(v, []);
      }
      vertexStreetIds.get(v).push(s.id);
    }
  }
  const vertexCityId = new Map();
  for (const t of cities) {
    vertexCityId.set(t.v, t.id);
  }
  const streetCityIds = new Map();
  for (const s of streets) {
    streetCityIds.set(s.id, [vertexCityId.get(s.a), vertexCityId.get(s.b)]);
  }

  for (const c of cells) {
    const entry = { cells: [], streets: [], cities: [] };
    const seenCells = new Set();
    const seenStreets = new Set();
    const seenCities = new Set();
    const push = (arr, set, toId) => {
      if (set.has(toId)) {
        return;
      }
      set.add(toId);
      arr.push(rel(c.id, toId));
    };
    for (const s of streets) {
      if (s.i === c.idx || s.j === c.idx) {
        push(entry.streets, seenStreets, s.id);
        const other = s.i === c.idx ? s.j : s.i;
        if (other !== null) {
          push(entry.cells, seenCells, 'c' + other);
        }
      }
    }
    for (const v of c.face) {
      push(entry.cities, seenCities, vertexCityId.get(v));
    }
    adj[c.id] = entry;
    c.adj = entry;
  }

  for (const s of streets) {
    const entry = { cells: [], streets: [], cities: [] };
    const seenCells = new Set();
    const seenStreets = new Set();
    const seenCities = new Set();
    const push = (arr, set, toId) => {
      if (set.has(toId)) {
        return;
      }
      set.add(toId);
      arr.push(rel(s.id, toId));
    };
    for (const id of s.cells) {
      push(entry.cells, seenCells, id);
    }
    for (const id of streetCityIds.get(s.id)) {
      push(entry.cities, seenCities, id);
    }
    for (const v of [s.a, s.b]) {
      for (const id of vertexStreetIds.get(v) || []) {
        if (id !== s.id) {
          push(entry.streets, seenStreets, id);
        }
      }
    }
    adj[s.id] = entry;
    s.adj = entry;
  }

  for (const t of cities) {
    const entry = { cells: [], streets: [], cities: [] };
    const seenCells = new Set();
    const seenStreets = new Set();
    const seenCities = new Set();
    const push = (arr, set, toId) => {
      if (set.has(toId)) {
        return;
      }
      set.add(toId);
      arr.push(rel(t.id, toId));
    };
    for (const id of t.cells) {
      push(entry.cells, seenCells, id);
    }
    for (const id of vertexStreetIds.get(t.v) || []) {
      push(entry.streets, seenStreets, id);
    }
    for (const sid of vertexStreetIds.get(t.v) || []) {
      for (const id of streetCityIds.get(sid)) {
        if (id !== t.id) {
          push(entry.cities, seenCities, id);
        }
      }
    }
    adj[t.id] = entry;
    t.adj = entry;
  }

  return adj;
}

function serializeBoard(board) {
  // Serialize a board to a plain JSON-able object: the vertex positions and the
  // faces (each cell as an ordered list of vertex indices). Streets, cities and
  // all adjacencies are derived again on load, so the serialized form carries
  // positions and deduces structure.
  analyzeBoard(board);
  return {
    verts: board.verts,
    faces: board.faces,
    U: board.U || null,
    V: board.V || null
  };
}

function deserializeBoard(data) {
  // Rebuild a board from serializeBoard() output (or any object with the same
  // { verts, faces, U, V } shape). Returns a board with cells, cities, streets
  // and the full adjacency map, ready for addStreets/addCities to draw.
  const board = {
    faces: data.faces.map(f => f.slice()),
    verts: data.verts.map(v => v.slice()),
    U: data.U || null,
    V: data.V || null
  };
  analyzeBoard(board);
  return board;
}

function buildTessellation(tessagon, options = {}) {
  // Build the mesh of any tessagon. Accept a class, a name from TessagonTypes,
  // or an already-built instance. An already-built mesh ({ faces, verts }) is
  // passed through unchanged, so streets and cities can be added to exactly the
  // mesh that was rendered (important for random tessagons like Voronoi).
  // Returns { faces, verts, U, V, tess }.
  if (tessagon && Array.isArray(tessagon.faces) && Array.isArray(tessagon.verts)) {
    analyzeBoard(tessagon);
    return tessagon;
  }
  if (tessagon && Array.isArray(tessagon.face_list) && Array.isArray(tessagon.vert_list)) {
    const board = {
      faces: tessagon.face_list,
      verts: tessagon.vert_list,
      U: null,
      V: null,
      tess: tessagon
    };
    analyzeBoard(board);
    return board;
  }
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
  for (const k of ['random', 'min_spacing', 'border_fraction', 'iterations', 'merge_factor', 'seeds']) {
    if (k in options) {
      common[k] = options[k];
    }
  }

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
  const board = { faces: mesh.face_list, verts: mesh.vert_list, U, V, tess };
  analyzeBoard(board);
  return board;
}

function addStreetsToTessellation(tessagon, svg, options = {}) {
  // Add streets (the shared edges between tiles) to the svg for any tessagon.
  return addStreets(buildTessellation(tessagon, options), svg, options);
}

function addCitiesToTessellation(tessagon, svg, options = {}) {
  // Add cities (the corners where tiles meet) to the svg for any tessagon.
  return addCities(buildTessellation(tessagon, options), svg, options);
}

