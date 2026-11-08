
function svgFillElem(elem, d, styles = {}, { stretch = false } = {}) {
  /**
   * svgFillElem(elem, d, styles = {}, options = {}) -> { svg, path }
   *
   *   elem     the container (give it a width and height)
   *   d        path data
   *   styles   fill, stroke, stroke-width, ... as an object; camelCase works
   *            too (strokeWidth), and any value is allowed (e.g. fill: 'url(#tex)')
   *   options  stretch  false  false: keep the path's proportions, centred in elem
   *                            true:  stretch to touch all four sides (distorts)
   */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('preserveAspectRatio', stretch ? 'none' : 'xMidYMid meet');
  svg.style.display = 'block';                       // no inline-baseline gap under the svg

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  for (const [k, v] of Object.entries(styles)) {
    path.setAttribute(k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), v);
  }
  svg.appendChild(path);
  elem.appendChild(svg);                             // must be in the document to be measured

  const b = path.getBBox();
  if (!(b.width > 0 || b.height > 0)) throw new Error('svgFillElem: the path has no extent');
  const cs = getComputedStyle(path);
  const pad = cs.stroke !== 'none' ? (parseFloat(cs.strokeWidth) || 0) / 2 : 0;   // keep the stroke inside
  svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`);
  return { svg, path };
}



function viewBoxFromPath(pathOrD, svg = null, { padding = 0, includeStroke = true, responsive = false } = {}) {
  /**
   * viewBoxFromPath(pathOrD, svg, options) -> { x, y, w, h }
   *
   *   pathOrD  a <path> element (its parent svg is used), or a `d` string
   *   svg      the <svg> that gets the viewBox. Required for a d string; optional
   *            for an element (defaults to its own svg)
   *   options  padding        0      extra space around the box (user units)
   *            includeStroke  true   add half the path's stroke width
   *            responsive     false  remove width/height from the svg
   */
  const NS = 'http://www.w3.org/2000/svg';
  let path = pathOrD, temp = null;

  if (typeof pathOrD === 'string') {
    if (!svg) throw new Error('viewBoxFromPath: pass the target svg when giving a d string');
    path = document.createElementNS(NS, 'path');
    path.setAttribute('d', pathOrD);
    temp = path;
    svg.appendChild(path);                           // must be in the document to be measured
  }
  svg = svg || path.ownerSVGElement;
  if (!svg) throw new Error('viewBoxFromPath: the path is not inside an svg');

  try {
    const b = path.getBBox();                        // in the path's own coordinates
    let corners = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]];

    // map into the svg's user space (handles transform on the path / parent groups)
    const m = svg.getScreenCTM && path.getScreenCTM() && svg.getScreenCTM()
      ? svg.getScreenCTM().inverse().multiply(path.getScreenCTM()) : null;
    if (m) corners = corners.map(([x, y]) => { const p = new DOMPoint(x, y).matrixTransform(m); return [p.x, p.y]; });

    let pad = padding;
    if (includeStroke) {
      const cs = getComputedStyle(path);
      if (cs.stroke !== 'none') pad += ((parseFloat(cs.strokeWidth) || 0) / 2) * (m ? Math.hypot(m.a, m.b) : 1);
    }

    const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
    const box = {
      x: Math.min(...xs) - pad, y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad,
    };
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
    if (responsive) { svg.removeAttribute('width'); svg.removeAttribute('height'); }
    return box;
  } finally {
    if (temp) temp.remove();
  }
}


async function emojiSvgToShape(svg, options = {}) {
  const {
    box = { x: 20, y: 20, w: 360, h: 360 },
    resolution = 512,
    alphaThreshold = 16,
    closing = 3,
    maxPoints = 64,
    tolerance = 0.5,
    round = true,
  } = options;

  const root = toSvgRoot(svg);

  // ---- viewBox (fall back to the drawing's bounding box) -------------------
  const host = document.createElement('div');
  host.style.cssText =
    'position:absolute;left:-99999px;top:0;width:500px;height:500px;visibility:hidden;pointer-events:none';
  host.appendChild(root);
  document.body.appendChild(host);
  let vb;
  try {
    const b = root.viewBox && root.viewBox.baseVal;
    if (b && b.width > 0 && b.height > 0) vb = { x: b.x, y: b.y, w: b.width, h: b.height };
    else {
      const bb = root.getBBox();
      if (!(bb.width > 0 && bb.height > 0)) throw new Error('SVG has no drawable content');
      vb = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
      root.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    }
  } finally {
    host.remove();
  }

  // ---- rasterise -----------------------------------------------------------
  const aspect = vb.w / vb.h;
  const W = aspect >= 1 ? resolution : Math.max(1, Math.round(resolution * aspect));
  const H = aspect >= 1 ? Math.max(1, Math.round(resolution / aspect)) : resolution;
  root.setAttribute('width', W);
  root.setAttribute('height', H);
  root.removeAttribute('style');
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const xml = new XMLSerializer().serializeToString(root);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  await img.decode();

  const pad = Math.ceil(closing) + 2;          // room for the closing step
  const CW = W + 2 * pad, CH = H + 2 * pad;
  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, pad, pad, W, H);
  const rgba = ctx.getImageData(0, 0, CW, CH).data;

  let mask = new Uint8Array(CW * CH);
  let any = false;
  for (let i = 0; i < mask.length; i++) {
    if (rgba[i * 4 + 3] > alphaThreshold) { mask[i] = 1; any = true; }
  }
  if (!any) throw new Error('Nothing was drawn (fully transparent SVG)');

  // ---- morphological closing, largest blob, outer contour ------------------
  if (closing > 0) mask = erode(dilate(mask, CW, CH, closing), CW, CH, closing);
  mask = largestComponent(mask, CW, CH);
  const contour = traceOuter(mask, CW, CH);          // pixel coordinates
  if (contour.length < 3) throw new Error('Could not trace an outline');

  // ---- to output coordinates -----------------------------------------------
  // pixel -> viewBox units
  let pts = contour.map(([px, py]) => [
    vb.x + ((px - pad + 0.5) / W) * vb.w,
    vb.y + ((py - pad + 0.5) / H) * vb.h,
  ]);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  if (box) {
    const w = maxX - minX || 1, h = maxY - minY || 1;
    const s = Math.min(box.w / w, box.h / h);
    const tx = box.x + (box.w - w * s) / 2 - minX * s;
    const ty = box.y + (box.h - h * s) / 2 - minY * s;
    pts = pts.map(([x, y]) => [x * s + tx, y * s + ty]);
  }

  // ---- simplify to <= maxPoints --------------------------------------------
  let dx0 = Infinity, dy0 = Infinity, dx1 = -Infinity, dy1 = -Infinity;
  for (const [x, y] of pts) {
    dx0 = Math.min(dx0, x); dx1 = Math.max(dx1, x);
    dy0 = Math.min(dy0, y); dy1 = Math.max(dy1, y);
  }
  const diag = Math.hypot(dx1 - dx0, dy1 - dy0);
  let simple = simplifyRing(pts, tolerance);
  if (simple.length > maxPoints) {
    let lo = tolerance, hi = diag, best = simplifyRing(pts, hi);
    for (let i = 0; i < 40 && hi - lo > 1e-3; i++) {
      const mid = (lo + hi) / 2;
      const r = simplifyRing(pts, mid);
      if (r.length <= maxPoints) { hi = mid; best = r; } else lo = mid;
    }
    simple = best;
  }
  if (round) simple = cleanRounded(simple.map(([x, y]) => [Math.round(x), Math.round(y)]));
  if (simple.length < 3) throw new Error('Outline collapsed to fewer than 3 points');

  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const [x, y] of simple) {
    bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x);
    by0 = Math.min(by0, y); by1 = Math.max(by1, y);
  }
  return {
    //kind: 'points',
    data: simple,
    //label: 'SVG silhouette',
    bbox: { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 },
    //originalPoints: contour.length,
  };
}

function toSvgRoot(svg) {
  if (typeof svg === 'string') {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid SVG markup');
    return document.importNode(doc.documentElement, true);
  }
  if (svg instanceof Element) {
    const root = svg.matches('svg') ? svg : svg.ownerSVGElement || svg.querySelector('svg');
    if (!root) throw new Error('No <svg> found');
    return root.cloneNode(true);
  }
  throw new Error('Expected an SVG string or element');
}
function dilate(src, W, H, r) {
  // --- morphology (square structuring element, separable running max) --------
  const tmp = new Uint8Array(src.length), out = new Uint8Array(src.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(W - 1, x + r); k++) if (src[y * W + k]) { v = 1; break; }
      tmp[y * W + x] = v;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(H - 1, y + r); k++) if (tmp[k * W + x]) { v = 1; break; }
      out[y * W + x] = v;
    }
  }
  return out;
}
function erode(src, W, H, r) {            // outside the canvas counts as "shape"
  // --- morphology (square structuring element, separable running max) --------
  const inv = src.map(v => 1 - v);
  return dilate(inv, W, H, r).map(v => 1 - v);
}
function largestComponent(mask, W, H) {
  // --- keep only the biggest 8-connected blob ---------------------------------
  const label = new Int32Array(mask.length);
  const stack = new Int32Array(mask.length);
  let next = 0, bestId = 0, bestSize = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i]) continue;
    const id = ++next;
    let sp = 0, size = 0;
    stack[sp++] = i; label[i] = id;
    while (sp) {
      const p = stack[--sp];
      size++;
      const x = p % W, y = (p - x) / W;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const q = yy * W + xx;
          if (mask[q] && !label[q]) { label[q] = id; stack[sp++] = q; }
        }
      }
    }
    if (size > bestSize) { bestSize = size; bestId = id; }
  }
  return mask.map((_, i) => (label[i] === bestId ? 1 : 0));
}
function traceOuter(mask, W, H) {
  // --- Moore-neighbour outer contour tracing (pixel centres) -------------------
  const fg = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]; // clockwise on screen
  let sx = -1, sy = -1;
  outer: for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fg(x, y)) { sx = x; sy = y; break outer; }
  if (sx < 0) return [];

  const contour = [[sx, sy]];
  let cx = sx, cy = sy;
  let bi = 4;                         // background neighbour we came from: west
  let first = null;
  for (let guard = 0; guard < 4 * W * H; guard++) {
    let found = false;
    for (let k = 1; k <= 8; k++) {
      const i = (bi + k) % 8;
      const nx = cx + DIRS[i][0], ny = cy + DIRS[i][1];
      if (fg(nx, ny)) {
        const pi = (i + 7) % 8;       // previously examined (background) neighbour
        const px = cx + DIRS[pi][0], py = cy + DIRS[pi][1];
        if (!first) first = [nx, ny];
        else if (cx === sx && cy === sy && nx === first[0] && ny === first[1]) return contour;
        const dx = px - nx, dy = py - ny;
        bi = DIRS.findIndex(d => d[0] === dx && d[1] === dy);
        cx = nx; cy = ny;
        contour.push([cx, cy]);
        found = true;
        break;
      }
    }
    if (!found) return contour;       // isolated pixel
  }
  return contour;
}

// --- Douglas-Peucker on a closed ring ----------------------------------------
function lineDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dx * (a[1] - p[1]) - dy * (a[0] - p[0])) / len;
}
function simplifyOpen(pts, eps) {
  const last = pts.length - 1;
  if (last < 2) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[last] = 1;
  const stack = [[0, last]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = lineDist(pts[i], pts[s], pts[e]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx !== -1 && maxD > eps) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function simplifyRing(ring, eps) {
  if (ring.length <= 3) return ring.slice();
  let far = 0, farD = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > farD) { farD = d; far = i; }
  }
  const a = simplifyOpen(ring.slice(0, far + 1), eps);
  const b = simplifyOpen(ring.slice(far).concat([ring[0]]), eps);
  return a.concat(b.slice(1, -1));
}
function cleanRounded(pts) {
  let out = pts, changed = true;
  while (changed && out.length > 3) {
    changed = false;
    const next = [], n = out.length;
    for (let i = 0; i < n; i++) {
      const prev = out[(i + n - 1) % n], cur = out[i], nxt = out[(i + 1) % n];
      const dup = cur[0] === prev[0] && cur[1] === prev[1];
      const cross = (cur[0] - prev[0]) * (nxt[1] - cur[1]) - (cur[1] - prev[1]) * (nxt[0] - cur[0]);
      if (dup || cross === 0) { changed = true; continue; }
      next.push(cur);
    }
    if (next.length < 3) break;
    out = next;
  }
  return out;
}

//#region helpers
function emoKeyToFilename(key) {
  let o = M.emo[key]; //console.log('emoKeyToFilename',key,o);
  if (!o) return null;
  let part = stringBefore(o.uni, '_');
  //console.log(part);
  return `emoji_u${part}.svg`;

}
function emoFilenameToKey(filename) {
  function uniVariant(uni) {
    return stringBefore(uni, '_') + '_fe0f_' + stringAfter(uni, '_');
  }
  let part = stringBefore(stringAfter(filename, 'emoji_u'), '.svg');
  for (const [key, value] of Object.entries(M.emo)) {
    let uni = value.uni;
    if (uni.includes(part) || uni.includes(uniVariant(part))) return key;
  }
}
function drawClaude(layer, def, text = 'hallo', out) {
  //const def = shapes[$('shape').value];
  layer.replaceChildren();
  let shape;
  let el;
  if (def.kind === 'circle') {
    el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', def.data.cx); el.setAttribute('cy', def.data.cy); el.setAttribute('r', def.data.r);
    shape = def.data;
  } else if (def.kind === 'points' || nundef(def.kind)) {
    el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', def.data.map(p => p.join(',')).join(' '));
    shape = def.data;
  } else {
    el = document.createElementNS(NS, def.tag);
    for (const [k, v] of Object.entries(def.attrs)) el.setAttribute(k, v);
    shape = el;
  }


  //el.setAttribute('stroke', 'white');
  //el.setAttribute('stroke-width', '1.5');
  layer.appendChild(el);

  // el.setAttribute('fill', 'red');
  setTextureFill(el, '../assets/texwall/wood.png', { tile: 80 });         // repeating
  //setTextureFill(el, 'photo.jpg', { repeat: false });   // stretched to fit the shape


  const t0 = performance.now();
  const r = fitTextInShape(text, shape, {
    allowWordBreak: false,
    fontFamily: 'Arial',
    lineHeight: 1,
    padding: 12,
    align: 'center',
    curveSamples: 100,
  });
  const ms = performance.now() - t0;
  //console.log('duration', ms)

  out.setAttribute('fill', 'yellow');
  applyFitToSvgText(out, r);
  let info = r.fits
    ? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines, ${ms.toFixed(0)} ms`
    : 'Text does not fit even at the minimum font size.';
  return info;
}
function createStage(dParent, { size = '100%' } = {}) {
  const stage = mDom(dParent);
  Object.assign(stage.style, { width: size, height: size });      // fill the parent (or a fixed size)

  const svg = svgCreate(stage, {}, { id: 'svg', viewBox: '0 0 400 400' });
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  Object.assign(svg.style, { display: 'block', width: '100%', height: '100%' });  // scale to the stage

  const shapeLayer = svgGroup(svg, {}, { id: 'shapeLayer' });
  const out = svgText(svg, '', 0, 0, {}, { id: 'out' });

  return { stage, svg, shapeLayer, out };
}
// extrude and renderExtrusion must be in scope (import them, or paste extrude3D.mjs
// into your file and remove the `export` keywords)
function createStageX(dParent) {
  let svg = mSvg(dParent, { id: 'svg', viewBox: '0 0 400 400', width: '100%', height: '100%' });
  let g = mDom(svg, { tag: 'g', id: 'shapeLayer' });
  let text = mDom(svg, { tag: 'text', id: 'out' });
  return { svg, g, text };
}

function drawClaudeX(layer, def, text = 'hallo', out, opts = {}) {
  const {
    depth = 0,
    angle = 45,
    scale = 1,
    texture = '../assets/texwall/wood.png',   // null = no texture, plain color fill
    repeat = false,
    tile = null,
    color = null,             // tint for the texture (or plain fill if texture is null)
    blend = 'luminosity',     // 'multiply' | 'luminosity' | 'overlay' | 'color-dodge' ...
    stroke = 'none',
    strokeWidth = 1.5,
    textFill = 'yellow'
  } = opts;
  layer.replaceChildren();

  // 1. build the base element
  let shape, el;
  if (def.kind === 'circle') {
    el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', def.data.cx); el.setAttribute('cy', def.data.cy); el.setAttribute('r', def.data.r);
    shape = def.data;
  } else if (def.kind === 'points' || nundef(def.kind)) {
    el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', def.data.map(p => p.join(',')).join(' '));
    shape = def.data;
  } else {
    el = document.createElementNS(NS, def.tag);
    for (const [k, v] of Object.entries(def.attrs)) el.setAttribute(k, v);
    shape = el;
  }
  layer.appendChild(el);            // attach first (needed for sampling and textures)

  let front = el;
  let fitShape = shape;
  let ext = null;

  // 2. optional 3D
  if (depth > 0) {
    const vb = layer.ownerSVGElement.viewBox.baseVal;
    const box = vb && vb.width
      ? { x: vb.x + vb.width * 0.05, y: vb.y + vb.height * 0.05, w: vb.width * 0.9, h: vb.height * 0.9 }
      : { x: 20, y: 20, w: 360, h: 360 };

    const g = extrude(shape, depth, { angle, scale, box });
    el.remove();
    ext = renderExtrusion(layer, g, { fill: color || '#8aa', stroke, strokeWidth });
    front = ext.front;
    fitShape = g.front;
  } else {
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', strokeWidth);
  }

  // 3. paint: texture (optionally tinted) or plain color
  if (texture) {
    setTextureFill(front, texture, { tile, repeat, color, blend });
    if (ext) ext.setFill(front.getAttribute('fill'));
  } else {
    const paint = color || '#8aa';
    if (ext) ext.setFill(paint); else front.setAttribute('fill', paint);
  }

  // 4. fit the text
  // const t0 = performance.now();
  // const r = fitTextInShape(text, fitShape, {
  //   allowWordBreak: false,
  //   fontFamily: 'Arial',
  //   lineHeight: 1,
  //   padding: 12,
  //   align: 'center',
  //   curveSamples: 100,
  // });
  // const ms = performance.now() - t0;

  // out.setAttribute('fill', 'yellow');
  // applyFitToSvgText(out, r);
  // return {
  //   message: (r.fits
  //     ? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines, ${ms.toFixed(0)} ms`
  //     : 'Text does not fit even at the minimum font size.'), layer, front, fitShape, ext
  // };

  //out.setAttribute('fill', 'yellow');
  //const r = setText(fitShape, text, out);
  const r = text ? setText(fitShape, text, out, { fill: textFill }) : null;
  // const r = setText(fitShape, text, out, { fill: textFill });
  // const message = r ? (r.fits ? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines` : 'Text does not fit') : 'no text';
  return {
    message: (r && r.fits
      ? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines` //, ${ms.toFixed(0)} ms`
      : 'Text does not fit even at the minimum font size.'), layer, front, fitShape, ext
  };
}
//#region eye detection

async function placeEyes(layer, key, shape, emojiSvg, options = {}) {
  const { fill = 'black', radiusScale = 1, glint = false, skip = [], overrides = {} } = options;

  if (skip.some(s => (s instanceof RegExp ? s.test(key) : s === key))) return [];

  const sb = shapeBBox(shape);
  let eyes;
  if (overrides[key]) {
    eyes = overrides[key].map(e => ({ x: sb.x + e.x * sb.w, y: sb.y + e.y * sb.h, r: e.r * sb.w }));
  } else {
    const det = await claudeDetectEyes(emojiSvg, options);
    if (!det.eyes.length) return [];
    // emoji silhouette (largest part) -> shape's bounding box, aspect kept
    const sil = det.silhouette;
    const s = Math.min(sb.w / sil.w, sb.h / sil.h);
    const tx = sb.x + (sb.w - sil.w * s) / 2 - sil.x * s;
    const ty = sb.y + (sb.h - sil.h * s) / 2 - sil.y * s;
    eyes = det.eyes.map(e => ({ x: e.x * s + tx, y: e.y * s + ty, r: e.r * s }));
  }

  const NS = 'http://www.w3.org/2000/svg';
  for (const e of eyes) {
    const r = e.r * radiusScale;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', e.x); c.setAttribute('cy', e.y); c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    layer.appendChild(c);
    if (glint) {
      const g = document.createElementNS(NS, 'circle');
      g.setAttribute('cx', e.x - r * 0.3); g.setAttribute('cy', e.y - r * 0.3);
      g.setAttribute('r', r * 0.28);
      g.setAttribute('fill', 'white');
      layer.appendChild(g);
    }
  }
  return eyes;
}

function shapeBBox(shape) {
  if (shape && shape.kind && shape.data) return shapeBBox(shape.data);
  if (typeof SVGGraphicsElement !== 'undefined' && shape instanceof SVGGraphicsElement) {
    const b = shape.getBBox();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  }
  if (Array.isArray(shape)) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of shape) {
      const x = Array.isArray(p) ? p[0] : p.x, y = Array.isArray(p) ? p[1] : p.y;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  if (shape && typeof shape.r === 'number') {
    const { r, cx = 0, cy = 0 } = shape;
    return { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
  }
  throw new Error('Unsupported shape');
}

async function rasterize(svg, resolution) {
  let root;
  if (typeof svg === 'string') {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid SVG markup');
    root = document.importNode(doc.documentElement, true);
  } else if (svg instanceof Element) {
    const r = svg.matches('svg') ? svg : svg.ownerSVGElement || svg.querySelector('svg');
    if (!r) throw new Error('No <svg> found');
    root = r.cloneNode(true);
  } else throw new Error('Expected an SVG string or element');

  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;width:500px;height:500px;visibility:hidden';
  host.appendChild(root);
  document.body.appendChild(host);
  let vb;
  try {
    const b = root.viewBox && root.viewBox.baseVal;
    if (b && b.width > 0 && b.height > 0) vb = { w: b.width, h: b.height };
    else {
      const bb = root.getBBox();
      if (!(bb.width > 0 && bb.height > 0)) throw new Error('SVG has no drawable content');
      vb = { w: bb.width, h: bb.height };
      root.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    }
  } finally { host.remove(); }

  const aspect = vb.w / vb.h;
  const W = aspect >= 1 ? resolution : Math.max(1, Math.round(resolution * aspect));
  const H = aspect >= 1 ? Math.max(1, Math.round(resolution / aspect)) : resolution;
  root.setAttribute('width', W); root.setAttribute('height', H);
  root.removeAttribute('style');
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(root));
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  return { data: ctx.getImageData(0, 0, W, H).data, W, H };
}

function largestBlob(mask, W, H) {
  const label = new Int32Array(mask.length), stack = new Int32Array(mask.length);
  let next = 0, best = null;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i]) continue;
    const id = ++next;
    let sp = 0, area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
    stack[sp++] = i; label[i] = id;
    while (sp) {
      const p = stack[--sp];
      area++;
      const x = p % W, y = (p - x) / W;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= W) continue;
          const q = yy * W + xx;
          if (mask[q] && !label[q]) { label[q] = id; stack[sp++] = q; }
        }
      }
    }
    if (!best || area > best.area) best = { id, area, x0, y0, x1, y1 };
  }
  if (!best) return { area: 0 };
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = label[i] === best.id ? 1 : 0;
  return { ...best, mask: out };
}




