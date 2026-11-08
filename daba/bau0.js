
function mCircle(gParent, cx, cy, r, clr, styles = {}, opts = {}) {
  const parent = typeof gParent === 'string' ? document.getElementById(gParent) : gParent;
  return svgCircle(gParent, cx, cy, r, styles = {}, opts = {})
}
function showDice(n, m, dParent, boxStyles = {}, diceStyles = {}) {
  return new Promise(resolve => {
    dParent = toElem(dParent);

    // Create the tray and its flexbox layout container.
    const tray = mDom(dParent, boxStyles);
    const diceContainer = mDom(tray, {
      p: 24,
      flexbox: 'center center 20 row wrap'
    });
    diceContainer.style.perspective = '1200px';

    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    function createFaceSVG(val, parent) {
      const id = getUID('dieFace');
      const gradientId = getUID('grad');
      const filterId = `${id}Bevel`;
      const fillColor = diceStyles.fg ?? '#1e293b';

      const svg = svgCreate(parent, {
        w: '100%',
        h: '100%',
        display: 'block',
        overflow: 'visible'
      }, {
        viewBox: '0 0 100 100'
      });

      svgAddDef(svg, svgLinearGradient(gradientId, [
        ['0%', '#ffffff'],
        ['100%', '#f1f5f9']
      ]));

      svgAddDef(svg, svgCreateFilter(filterId));

      svgRect(svg, 2, 2, 96, 96, {
        fill: `url(#${gradientId})`,
        stroke: '#cbd5e1',
        strokeWidth: 2,
        filter: `url(#${filterId})`
      }, {
        rx: 18,
        ry: 18
      });

      const isPipType = m <= 6 && pipPositions[val];

      if (isPipType) {
        for (const [x, y] of pipPositions[val]) {
          svgCircle(svg, x, y, 8.5, { fill: fillColor });
        }
      } else {
        const text = String(val);
        const fontSize = text.length >= 3 ? 32 : text.length === 2 ? 40 : 48;

        svgText(svg, text, '50%', '50%', {
          fill: fillColor,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize,
          fontWeight: 700
        }, {
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'alignment-baseline': 'central'
        });
      }

      return svg;
    }

    const diceList = [];
    const finalResults = [];

    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      Object.assign(outer.style, {
        width: '72px',
        height: '72px',
        position: 'relative',
        perspective: '600px'
      });

      const inner = document.createElement('div');
      Object.assign(inner.style, {
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)'
      });

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      createFaceSVG(Math.floor(Math.random() * m) + 1, inner);
      outer.appendChild(inner);
      diceContainer.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        isFinal: false
      });
    }

    const duration = 1100;
    const startTime = performance.now();

    function cubicOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function bounceOut(t) {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        t -= 1.5 / d1;
        return n1 * t * t + 0.75;
      } else if (t < 2.5 / d1) {
        t -= 2.25 / d1;
        return n1 * t * t + 0.9375;
      } else {
        t -= 2.625 / d1;
        return n1 * t * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function setFace(die, value) {
      die.el.replaceChildren();
      createFaceSVG(value, die.el);
    }

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const spinProgress = cubicOut(progress);
      const bounceProgress = bounceOut(progress);

      if (progress < 0.85 && currentTime - lastValChange > 40 + progress * 120) {
        for (const die of diceList) {
          setFace(die, Math.floor(Math.random() * m) + 1);
        }
        lastValChange = currentTime;
      }

      for (const die of diceList) {
        if (progress >= 0.85 && !die.isFinal) {
          die.isFinal = true;
          setFace(die, die.targetValue);
        }

        const rotX = die.rotX * (1 - spinProgress);
        const rotY = die.rotY * (1 - spinProgress);
        const rotZ = die.rotZ * (1 - spinProgress);

        const arcHeight = -45 * Math.sin(progress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const y = progress < 0.7 ? arcHeight : bounceOffset;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.15;

        die.el.style.transform =
          `translate3d(0, ${y}px, 0) ` +
          `rotateX(${rotX}deg) rotateY(${rotY}deg) ` +
          `rotateZ(${rotZ}deg) scale(${scale})`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        for (const die of diceList) {
          die.el.style.transform = 'none';
        }
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
function showShape(sh,dParent){
  	console.log(sh)
	color = clrRand();
	let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });
	let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: 'bug' });
	let d1 = mDom(d, { flex: 'none', w: 300, hmin: 300 });
	let { shapeLayer, out } = createStage(d1);
	//let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
	const o = drawClaudeX(shapeLayer, sh, 'hallo', out, { textFill: 'red', depth: 20, color });   // draws the shape once

}
function svgFit(svg, parent = svg.parentElement, { stretch = false, includeStroke = true, scale = 1 } = {}) {
  if (!svg.isConnected) throw new Error('svgFit: append the svg to the document first');
  if (!parent) throw new Error('svgFit: no parent');

  svg.style.display = 'block';                       // no inline-baseline gap under the svg
  svg.style.margin = '0'; svg.style.padding = '0';

  // 1. tight viewBox
  const b = svg.getBBox();                           // union of everything drawn, in user units
  if (!(b.width > 0 || b.height > 0)) throw new Error('svgFit: nothing drawn in the svg');
  let pad = 0;
  if (includeStroke) {
    for (const el of svg.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.stroke && cs.stroke !== 'none') pad = Math.max(pad, (parseFloat(cs.strokeWidth) || 0) / 2);
    }
  }
  const vb = { x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad };
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.setAttribute('preserveAspectRatio', stretch ? 'none' : 'xMidYMid meet');

  // 2. does the parent have a size of its own? measure it without the svg
  svg.style.display = 'none';
  const cs = getComputedStyle(parent);
  const cw = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ch = parent.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  svg.style.display = 'block';
  const sized = cw > 0 && ch > 0;

  if (sized) {
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  } else {
    svg.setAttribute('width', vb.w * scale);
    svg.setAttribute('height', vb.h * scale);
  }
  return { mode: sized ? 'fit' : 'tight', viewBox: vb };
}

async function detectEyesInEmoji(k, dParent) {
  if (nundef(dParent)) dParent = document.body;
  let fname = emoKeyToFilename(k);
  let svgText = await loadText(`assets/svg/${fname}`);
  let svg = svgFromText(svgText);
  mAppend(dParent, svg);
  //svg.style.visibility = 'hidden';

  let fills = svgGetFillColorsFromText(svgText).map(x => x.startsWith('#') ? x.toLowerCase() : null).filter(x => !!x);
  let cDarkest = clrDarkest(fills);
  if (!cDarkest) { svg.remove(); return { svg, svgText, eyes: [] }; }
  // console.log(k, fills, cDarkest);

  let elems = mFindElemsWithTags(svg, ['path', 'ellipse', 'circle']);
  //console.log('found elems:', elems);
  let list = mFindElemsWithColor(elems, cDarkest);

  //console.log('found darkest elems:', list);
  let eyes = [];
  for (const o of list) {
    let m = svgMeasure(o.el);
    let { x, y, width, height, cx, cy } = m;
    //if (k == 'kangaroo') console.log('kangaroo', k, m, list);

    if ((width > 5 && width < 11 && height > 5 && height < 11) || list.length <= 2) {
      addKeys(m, o);
      //this could be eyes
      eyes.push(o);
    }
  }

  svg.remove(); //optional

  return { svg, svgText, eyes };
}


function setTextureFill(el, imageUrl, { tile = 64, repeat = true, color = 'navy', blend = 'color-dodge' } = {}) {
  const svg = el.ownerSVGElement;
  if (!svg) throw new Error('setTextureFill: append the element to the <svg> before calling');
  let defs = svg.querySelector('defs');
  if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.prepend(defs); }

  // one pattern per (image, size, colour, blend)
  const key = `${imageUrl}|${repeat ? tile : 'fit'}|${color || ''}|${blend}`;
  const id = 'tex_' + [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  if (!defs.querySelector('#' + id)) {
    const pattern = document.createElementNS(NS, 'pattern');
    pattern.setAttribute('id', id);
    const image = document.createElementNS(NS, 'image');
    image.setAttribute('href', imageUrl);
    const u = repeat ? tile : 1;
    if (repeat) {
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      image.setAttribute('preserveAspectRatio', 'none');
    } else {
      pattern.setAttribute('patternUnits', 'objectBoundingBox');
      pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    }
    for (const e of [pattern, image]) { e.setAttribute('width', u); e.setAttribute('height', u); }

    if (color) {                                   // colour layer under the texture
      const bg = document.createElementNS(NS, 'rect');
      bg.setAttribute('width', u); bg.setAttribute('height', u);
      bg.setAttribute('fill', color);
      pattern.appendChild(bg);
      image.style.mixBlendMode = blend;
    }
    pattern.appendChild(image);
    defs.appendChild(pattern);
  }
  el.setAttribute('fill', `url(#${id})`);
}

function extrude(shape, depth, options = {}) {
  const {
    angle = 45, scale = 1, box = null, light = 135, samples = 120,
    minDark = 0.05, maxDark = 0.55, backDark = 0.6,
  } = options;

  let front = dedupe(toPoints(shape, samples));
  if (front.length < 3) throw new Error('Shape needs at least 3 points');

  const rad = a => (a * Math.PI) / 180;
  const off = [depth * Math.cos(rad(angle)), -depth * Math.sin(rad(angle))];

  const bb0 = bboxOf(front);
  const c = [bb0.x + bb0.w / 2, bb0.y + bb0.h / 2];
  let back = front.map(([x, y]) => [c[0] + (x - c[0]) * scale + off[0], c[1] + (y - c[1]) * scale + off[1]]);

  if (box) {
    const all = bboxOf(front.concat(back));
    const s = Math.min(box.w / (all.w || 1), box.h / (all.h || 1));
    const tx = box.x + (box.w - all.w * s) / 2 - all.x * s;
    const ty = box.y + (box.h - all.h * s) / 2 - all.y * s;
    const T = ([x, y]) => [x * s + tx, y * s + ty];
    front = front.map(T);
    back = back.map(T);
    off[0] *= s; off[1] *= s;
  }

  // outward normals depend on the winding order
  let area = 0;
  for (let i = 0, n = front.length; i < n; i++) {
    const [x1, y1] = front[i], [x2, y2] = front[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  const sign = area >= 0 ? 1 : -1;
  const L = [Math.cos(rad(light)), -Math.sin(rad(light))];

  const walls = [];
  const n = front.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = front[j][0] - front[i][0], dy = front[j][1] - front[i][1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const nx = (sign * dy) / len, ny = (-sign * dx) / len;      // outward normal
    // shift of this edge's midpoint from front to back
    const mx = (back[i][0] + back[j][0] - front[i][0] - front[j][0]) / 2;
    const my = (back[i][1] + back[j][1] - front[i][1] - front[j][1]) / 2;
    if (nx * mx + ny * my <= 1e-9 * Math.hypot(mx, my)) continue; // hidden wall
    const lit = nx * L[0] + ny * L[1];                              // -1 .. 1
    const dark = minDark + (maxDark - minDark) * (1 - lit) / 2;
    walls.push({ points: [front[i], front[j], back[j], back[i]], dark });
  }

  return { front, back, walls, backDark, bbox: bboxOf(front.concat(back)), offset: off };
}
function renderExtrusion(layer, g, options = {}) {
  const { fill = '#8aa', stroke = 'white', strokeWidth = 1.5 } = options;
  const NS = 'http://www.w3.org/2000/svg';
  const pts = p => p.map(q => q.join(',')).join(' ');
  const mk = (points, attrs) => {
    const el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', pts(points));
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  const group = document.createElementNS(NS, 'g');
  const fillTargets = [];   // elements that take the base paint
  const strokeTargets = []; // underlay walls: stroke = fill hides seams between walls

  const back = mk(g.back, { fill });
  fillTargets.push(back);
  group.appendChild(back);
  group.appendChild(mk(g.back, { fill: 'black', 'fill-opacity': g.backDark }));

  // underlay (plain paint, slightly stroked to avoid hairline gaps) ...
  for (const w of g.walls) {
    const e = mk(w.points, { fill, stroke: fill, 'stroke-width': 1, 'stroke-linejoin': 'round' });
    fillTargets.push(e); strokeTargets.push(e);
    group.appendChild(e);
  }
  // ... then shading on top
  for (const w of g.walls) {
    group.appendChild(mk(w.points, { fill: 'black', 'fill-opacity': w.dark }));
  }

  const front = mk(g.front, { fill, stroke, 'stroke-width': strokeWidth, 'stroke-linejoin': 'round' });
  fillTargets.push(front);
  group.appendChild(front);
  layer.appendChild(group);

  return {
    group, front,
    setFill(paint) {
      for (const e of fillTargets) e.setAttribute('fill', paint);
      for (const e of strokeTargets) e.setAttribute('stroke', paint);
    },
  };
}
function toPoints(shape, samples) {
  if (shape && shape.kind && shape.data) return toPoints(shape.data, samples);
  if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
    const len = shape.getTotalLength(), out = [];
    for (let i = 0; i < samples; i++) {
      const p = shape.getPointAtLength((len * i) / samples);
      out.push([p.x, p.y]);
    }
    return out;
  }
  if (Array.isArray(shape)) return shape.map(p => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]));
  if (shape && typeof shape.r === 'number') {
    const { r, cx = 0, cy = 0 } = shape, out = [];
    for (let i = 0; i < samples; i++) {
      const a = (2 * Math.PI * i) / samples;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return out;
  }
  throw new Error('Unsupported shape');
}
function dedupe(pts) {
  const out = pts.filter((p, i) => {
    const q = pts[(i + pts.length - 1) % pts.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9;
  });
  return out;
}
function bboxOf(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}


function setText(fitShape, text, out, opts = {}) {
  const { fill, ...fitOpts } = opts;                 // fill is for the <text>, the rest is for fitting
  if (fill) out.setAttribute('fill', fill);
  if (!text) { out.replaceChildren(); return null; }

  const r = fitTextInShape(text, fitShape, {
    allowWordBreak: false, fontFamily: 'Arial', lineHeight: 1, padding: 12,
    align: 'center', curveSamples: 100, verticalSteps: 12, precision: 0.5,
    ...fitOpts,
  });
  applyFitToSvgText(out, r);
  return r;
}

function butterflyFromTo(dParent, shape, x1, y1, x2, y2, speed = 120, opts = {}) {
  /**
   * flyFromTo(dParent, shape, x1, y1, x2, y2, speed = 120, opts = {})
   *
   * Makes the silhouette `shape` flap its wings and fly in a gently wavy line
   * from (x1, y1) to (x2, y2), heading in the direction of travel. On arrival the
   * wings stop, it turns upright and stays at (x2, y2) as the original shape.
   *
   *   dParent  HTML element the butterfly is added to (coordinates are in px,
   *            relative to its top-left; it is set to position:relative if it is
   *            position:static)
   *   shape    [[x,y],...] | [{x,y},...] | {kind:'points', data}
   *   speed    px per second
   *   opts     size      64     width of the butterfly in px
   *            flapHz    5      wing beats per second
   *            wobble    0.15   sideways wave amplitude as a fraction of size (0 = straight)
   *            fill      orange gradient   any SVG paint
   *            stroke    '#6b2a10'
   *            settle    300    ms it takes to turn upright after landing
   *            remove    false  remove the element on arrival instead of leaving it
   *
   * returns { el, animation, finished }
   *   el         the <svg> element
   *   animation  Web Animations object (pause(), play(), cancel(), ...)
   *   finished   Promise resolved with `el` once it has landed (null if cancelled)
   *
   * The wing rig is written for a front-view butterfly silhouette whose body
   * runs top to bottom, head at the top (as in your 64-point shape). Its
   * settings are derived from the shape's bounding box.
   */

  const { size = 64, flapHz = 5, wobble = 0.15, stroke = '#6b2a10', remove = false, settle = 300 } = opts;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  };
  const pts = (shape && shape.data ? shape.data : shape).map(p => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]));

  // ---- bounding box and wing-beat frames ---------------------------------
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const [x, y] of pts) {
    bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x);
    by0 = Math.min(by0, y); by1 = Math.max(by1, y);
  }
  const w = bx1 - bx0, h = by1 - by0;
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const headX = bx0 + 0.52 * w, headY = by0 + 0.29 * h;
  const axis = y => headX + (y - headY) * 0.15;                 // slightly tilted body axis
  const bodyHalf = 0.056 * w, ramp = 0.07 * w, minWing = 0.4, lift = 0.12;
  const ant = { x0: bx0 + 0.25 * w, x1: bx0 + 0.67 * w, y1: by0 + 0.3 * h };   // antennae: no flap

  const N = 12, frames = [], bob = [];
  for (let f = 0; f < N; f++) {
    const t = f / N, open = (1 + Math.cos(2 * Math.PI * t)) / 2;
    const s = minWing + (1 - minWing) * open, ph = 2 * Math.PI * t;
    frames.push(pts.map(([x, y]) => {
      if (x >= ant.x0 && x <= ant.x1 && y <= ant.y1) {
        const dist = Math.hypot(x - headX, y - headY), amp = 0.011 * w * Math.pow(dist / (0.25 * w), 1.5);
        return [x + amp * Math.sin(ph + (dist * 14.3) / w), y + amp * 0.5 * Math.cos(ph)];
      }
      const cx = axis(y), d = x - cx, k = smooth(bodyHalf, bodyHalf + ramp, Math.abs(d));
      return [cx + d * (1 + (s - 1) * k), y - (1 - s) * k * Math.abs(d) * lift];
    }));
    bob.push(-0.022 * w * (1 - open));
  }
  const str = p => p.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const dur = (1 / flapHz).toFixed(3) + 's';

  // ---- the svg -----------------------------------------------------------
  const m = 0.12 * Math.max(w, h);
  const W = size, H = (size * (h + 2 * m)) / (w + 2 * m);
  const svg = mk('svg', { viewBox: `${bx0 - m} ${by0 - m} ${w + 2 * m} ${h + 2 * m}`, width: W, height: H }, null);
  Object.assign(svg.style, { position: 'absolute', left: -W / 2 + 'px', top: -H / 2 + 'px', overflow: 'visible', pointerEvents: 'none' });

  let paint = opts.fill;
  if (!paint) {
    const id = 'bf' + Math.random().toString(36).slice(2, 8);
    const g = mk('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, mk('defs', {}, svg));
    mk('stop', { offset: 0, 'stop-color': '#ffb347' }, g);
    mk('stop', { offset: 1, 'stop-color': '#e2552d' }, g);
    paint = `url(#${id})`;
  }
  const bobG = mk('g', {}, svg);
  const poly = mk('polygon', { points: str(frames[0]), fill: paint, stroke, 'stroke-width': 0.012 * Math.max(w, h) * 2, 'stroke-linejoin': 'round' }, bobG);
  mk('animate', { attributeName: 'points', values: frames.concat([frames[0]]).map(str).join(';'), dur, repeatCount: 'indefinite' }, poly);
  mk('animateTransform', { attributeName: 'transform', type: 'translate', values: bob.concat([bob[0]]).map(v => `0,${v.toFixed(2)}`).join(';'), dur, repeatCount: 'indefinite' }, bobG);

  if (getComputedStyle(dParent).position === 'static') dParent.style.position = 'relative';
  dParent.appendChild(svg);

  // ---- the flight: wavy line, heading follows the path ---------------------
  const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy);
  const duration = speed > 0 ? (dist / speed) * 1000 : 0;
  const n = Math.max(8, Math.ceil(dist / 15));
  const nx = dist ? -dy / dist : 0, ny = dist ? dx / dist : 0;
  const cycles = Math.max(1, Math.round(dist / (size * 2.5)));
  const P = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, off = wobble * size * Math.sin(2 * Math.PI * cycles * s) * Math.sin(Math.PI * s); // 0 at both ends
    P.push([x1 + dx * s + nx * off, y1 + dy * s + ny * off]);
  }
  let prev = null, rot = [];
  for (let i = 0; i <= n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)];
    let ang = dist ? Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 90 : 0;   // head points along travel
    if (prev !== null) while (ang - prev > 180) ang -= 360; while (prev !== null && ang - prev < -180) ang += 360;
    rot.push(prev = ang);
  }
  const keyframes = P.map((p, i) => ({ transform: `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) rotate(${rot[i].toFixed(1)}deg)` }));

  const animation = svg.animate(keyframes, { duration, easing: 'linear', fill: 'forwards' });
  const finished = animation.finished.then(
    async () => {
      // landed: stop flapping and show the original shape
      poly.querySelectorAll('animate').forEach(a => a.remove());
      bobG.querySelectorAll('animateTransform').forEach(a => a.remove());
      bobG.removeAttribute('transform');
      poly.setAttribute('points', str(pts));

      const end = `translate(${x2}px,${y2}px)`;
      let last = ((rot[n] % 360) + 360) % 360;      // final heading, as -180..180
      if (last > 180) last -= 360;
      if (settle > 0 && last !== 0) {               // turn upright
        const a2 = svg.animate(
          [{ transform: `${end} rotate(${last}deg)` }, { transform: `${end} rotate(0deg)` }],
          { duration: settle, easing: 'ease-out', fill: 'forwards' });
        await a2.finished.catch(() => { });
        a2.cancel();
      }
      animation.cancel();
      svg.style.transform = `${end} rotate(0deg)`;  // keep the final pose without an animation
      if (remove) svg.remove();
      return svg;
    },
    () => { svg.remove(); return null; }            // cancelled
  );
  return { el: svg, animation, finished };
}

async function bTess(dParent, type = 'HexTessagon', H = 4, V = 3, palette = palettes.beach) {
	let colorPattern = 0;

	dParent.innerHTML = '';//`<div id="tboard"></div>`;
	// mDom(dPage,{w100:true,h:200, flexbox:'row no-wrap 4 center start',justifyContent:'center'},{id:'tboard'});
	const container = dParent; //mDom(dParent, { p: 20, wv: 1, hv: 1, flexbox: 'row wrap 4 center start' }, { id: 'tboard' });
	const buildOpts = { H, V, h_cyclic: false, v_cyclic: false };
	if (colorPattern > 0) buildOpts.color_pattern = colorPattern;

	const board = buildTessellation(type, buildOpts);
	//const container = document.getElementById("tboard");
	const svg = renderHexBoard1(board, container, {
		strokeWidth: "0.004",
		palette
	});

	addStreetsToTessellation(board, svg, { color: palette[4] });
	addCitiesToTessellation(board, svg, { color: palette[3], hoverColor: palette[4] });

	addLabels(board, svg, {
		labelCells: true,
		labelStreets: false,
		labelCities: false,
		showIsolatedCities: true
	});
	removeIsolatedCities(board, svg);

	//console.log(board, svg);
	logBoardObjectClicks(board, svg);
	return { board, svg };
}
function renderHexBoard1(board, container, options = {}) {
	// Render a board built by buildHexBoard into an SVG container.
	//
	// With options.palette (an array of css colors) and a board that carries a
	// color_list (buildTessellation keeps it from the tessagon's mesh when a
	// color_pattern is set), each cell is filled with
	// palette[color_list[cell] % palette.length] instead of the single `fill`
	// color; the per-cell color is restored on mouseleave.
	const fill = options.fill || '#e9ecef';
	const stroke = options.stroke || '#3d5870';
	const strokeWidth = options.strokeWidth || '0.006';
	const hoverFill = options.hoverFill || '#ffd166';
	const colorList = Array.isArray(board.color_list) && board.color_list.length === board.faces.length ? board.color_list : null;
	const palette = Array.isArray(options.palette) && colorList ? options.palette : null;

	container.innerHTML = '';
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('class', options.className || 'board');
	//svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
	svg.setAttribute('preserveAspectRatio', 'none');
	svg.setAttribute('width', '100%');
	svg.setAttribute('height', '100%');
	svg.style.display = 'block';
	svg.style.width = '100%';
	svg.style.height = '100%';
	svg.style.maxWidth = '100%';
	svg.style.maxHeight = '100%';
	svg.style.display = 'block';
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
		const baseFill = palette ? palette[colorList[idx] % palette.length] : fill;
		poly.setAttribute('fill', baseFill);
		poly.setAttribute('stroke', stroke);
		poly.setAttribute('stroke-width', strokeWidth);
		poly.setAttribute('stroke-linejoin', 'round');
		poly.setAttribute('class', 'cell');
		poly.dataset.boardId = board.cells[idx].id;
		poly.dataset.boardKind = "cell";
		if (options.onCellClick) {
			poly.addEventListener('click', () => options.onCellClick(idx, board));
		}
		poly.addEventListener('mouseenter', () => poly.setAttribute('fill', hoverFill));
		poly.addEventListener('mouseleave', () => poly.setAttribute('fill', baseFill));
		svg.appendChild(poly);
	});

	container.appendChild(svg);
	return svg;
}
async function fromTextToDraw(text) {
	let sh = await emojiSvgToShape(text);
	console.log(sh)

	await loadAssets();
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	// sh = M.shapes.bug;
	color = clrRand();
	let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });
	let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: 'bug' });
	let d1 = mDom(d, { flex: 'none', w: 400, hmin: 400 });
	let { shapeLayer, out } = createStage(d1);
	//let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
	const o = drawClaudeX(shapeLayer, sh, 'hallo', out, { textFill: 'red', depth: 20, color });   // draws the shape once
	return o;
}

function fitTextInShape(text, shape, options = {}) {
	/**
	 * fitTextInShape(text, shape, options)
	 *
	 * Finds the largest font size at which `text` can be wrapped into lines that
	 * all lie inside `shape`, and returns the line breaks and line positions.
	 *
	 * shape (one of):
	 *   - polygon:  [[x, y], ...]  or  [{x, y}, ...]
	 *   - circle:   { r, cx = 0, cy = 0 }
	 *   - SVG element: any SVGGeometryElement (path, circle, ellipse, rect,
	 *     polygon, ...). It is sampled with getPointAtLength(), so results are in
	 *     the element's own local coordinate space (put your <text> in the same
	 *     parent with the same `transform` and it lines up).
	 *     Only the first subpath / outline is used (no holes).
	 *
	 * options:
	 *   allowWordBreak  false  break only between words (a word that cannot fit on
	 *                          any line makes that font size infeasible).
	 *                          true: break anywhere, filling each line fully.
	 *   fontFamily      'sans-serif'
	 *   fontWeight      'normal'
	 *   fontStyle       'normal'
	 *   lineHeight      1.2    multiple of font size
	 *   padding         0      approximate inset from the shape boundary
	 *   align           'center' | 'left' | 'right'
	 *   minFontSize     1
	 *   maxFontSize     Infinity (capped by shape height)
	 *   precision       0.1    font size resolution of the search
	 *   verticalSteps   40     how many vertical block offsets are tried per size
	 *   curveSamples    256    points used to approximate curves / circles
	 *   measure         (str) => width of str at font-size 1. Optional; defaults to
	 *                   canvas measureText (make sure the font is loaded first,
	 *                   e.g. `await document.fonts.ready`).
	 *
	 * returns {
	 *   fits, fontSize, lineHeight (px), fontFamily, fontWeight, fontStyle, align,
	 *   lines: [{ text, x, y, width }]   // x = anchor point, y = baseline
	 *   textAnchor: 'start' | 'middle' | 'end'
	 * }
	 */
	const {
		allowWordBreak = false,
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		fontStyle = 'normal',
		lineHeight = 1.2,
		padding = 0,
		align = 'center',
		minFontSize = 1,
		maxFontSize = Infinity,
		precision = 0.1,
		verticalSteps = 40,
		curveSamples = 256,
		measure: customMeasure,
	} = options;

	const poly = toPolygon(shape, curveSamples);
	if (poly.length < 3) throw new Error('Shape needs at least 3 points');

	// ---- geometry helpers ---------------------------------------------------
	const ysAll = poly.map(p => p[1]);
	const minY = Math.min(...ysAll), maxY = Math.max(...ysAll);
	const H = maxY - minY;
	const eps = Math.max(1e-9, H * 1e-7);
	const vertexYs = [...new Set(ysAll)].sort((a, b) => a - b);
	const centroidY = polygonCentroidY(poly) ?? (minY + maxY) / 2;

	// Widest horizontal interval that is inside the polygon for the *whole*
	// vertical extent [top, bottom]. Interval endpoints are piecewise linear in
	// y with breakpoints at vertices, so sampling at the band edges and just
	// around every vertex inside the band is exact.
	function bandInterval(top, bottom) {
		top -= padding; bottom += padding;
		const ys = [top + eps, bottom - eps];
		for (const vy of vertexYs) {
			if (vy > top + eps && vy < bottom - eps) ys.push(vy - eps, vy + eps);
		}
		let cur = null;
		for (const y of ys) {
			const iv = gCrossings(poly, y);
			cur = cur ? gIntersect(cur, iv) : iv;
			if (!cur.length) return { x0: 0, x1: 0, width: 0 };
		}
		let best = cur[0];
		for (const iv of cur) if (iv[1] - iv[0] > best[1] - best[0]) best = iv;
		const x0 = best[0] + padding, x1 = best[1] - padding;
		return { x0, x1, width: Math.max(0, x1 - x0) };
	}

	// ---- text measurement ---------------------------------------------------
	const { M, ascent, descent } = makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily);

	// ---- layout for a given font size and starting y -------------------------
	const paragraphs = String(text).split(/\r?\n/);

	function tryLayout(f, y0) {
		const L = f * lineHeight;
		const lines = [];
		let b = 0;
		const next = () => {
			const top = y0 + b * L; b++;
			if (top + L > maxY + eps) return null;
			return { top, ...bandInterval(top, top + L) };
		};

		for (const para of paragraphs) {
			const tokens = para.split(/\s+/).filter(Boolean);
			let band = next();
			if (!band) return null;
			if (!tokens.length) { lines.push({ text: '', band }); continue; }

			let cur = '', i = 0;
			while (i < tokens.length) {
				const avail = band.width / f;           // available width at font-size 1
				const word = tokens[i];
				const cand = cur ? cur + ' ' + word : word;

				if (M(cand) <= avail) { cur = cand; i++; continue; }

				if (allowWordBreak) {
					const prefix = cur ? cur + ' ' : '';
					let k = 0;
					while (k < word.length && M(prefix + word.slice(0, k + 1)) <= avail) k++;
					if (k > 0) {
						lines.push({ text: prefix + word.slice(0, k), band });
						tokens[i] = word.slice(k);
						cur = '';
						band = next();
						if (!band) return null;
						continue;
					}
				}
				// word doesn't fit on this line: finish the line (if any), go down.
				// If the line is empty this band is simply skipped (too narrow).
				if (cur) { lines.push({ text: cur, band }); cur = ''; }
				band = next();
				if (!band) return null;
			}
			if (cur) lines.push({ text: cur, band });
		}
		return lines;
	}

	// Try several vertical offsets, prefer the block centred on the centroid.
	function bestLayout(f) {
		const L = f * lineHeight;
		if (L > H) return null;
		let best = null, bestScore = Infinity;
		for (let s = 0; s <= verticalSteps; s++) {
			const y0 = minY + ((H - L) * s) / verticalSteps;
			const lines = tryLayout(f, y0);
			if (!lines || !lines.length) continue;
			const top = lines[0].band.top;
			const bottom = lines[lines.length - 1].band.top + L;
			const score = Math.abs((top + bottom) / 2 - centroidY);
			if (score < bestScore) { bestScore = score; best = lines; }
		}
		return best;
	}

	// ---- search for the largest font size ------------------------------------
	let lo = minFontSize;
	let hi = Math.min(maxFontSize, H / lineHeight);
	let bestF = null, bestLines = null;

	const top = hi >= lo ? bestLayout(hi) : null;
	if (top) { bestF = hi; bestLines = top; }
	else {
		const atLo = bestLayout(lo);
		if (atLo) {
			bestF = lo; bestLines = atLo;
			while (hi - lo > precision) {
				const mid = (lo + hi) / 2;
				const r = bestLayout(mid);
				if (r) { lo = mid; bestF = mid; bestLines = r; } else hi = mid;
			}
		}
	}

	const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
	if (!bestLines) {
		return {
			fits: false, fontSize: minFontSize, lines: [], textAnchor: anchor,
			lineHeight: minFontSize * lineHeight, fontFamily, fontWeight, fontStyle, align
		};
	}

	const f = bestF, L = f * lineHeight;
	return {
		fits: true,
		fontSize: f,
		lineHeight: L,
		fontFamily, fontWeight, fontStyle, align,
		textAnchor: anchor,
		lines: bestLines.map(({ text, band }) => ({
			text,
			width: M(text) * f,
			x: align === 'left' ? band.x0 : align === 'right' ? band.x1 : (band.x0 + band.x1) / 2,
			// baseline so that the glyph box is centred in the line box
			y: band.top + (L - (ascent + descent) * f) / 2 + ascent * f,
		})),
	};
}

function applyFitToSvgText(textEl, result) {
	/**
	 * Convenience: write a fitTextInShape() result into an existing SVG <text>.
	 * Place the <text> in the same coordinate space as the shape.
	 */
	const NS = 'http://www.w3.org/2000/svg';
	while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
	textEl.setAttribute('font-size', result.fontSize);
	textEl.setAttribute('font-family', result.fontFamily);
	textEl.setAttribute('font-weight', result.fontWeight);
	textEl.setAttribute('font-style', result.fontStyle);
	textEl.setAttribute('text-anchor', result.textAnchor);
	textEl.setAttribute('xml:space', 'preserve');
	for (const ln of result.lines) {
		const t = document.createElementNS(NS, 'tspan');
		t.setAttribute('x', ln.x);
		t.setAttribute('y', ln.y);
		t.textContent = ln.text;
		textEl.appendChild(t);
	}
	return textEl;
}

function toPolygon(shape, samples) {
	if (typeof SVGGeometryElement !== 'undefined' && shape instanceof SVGGeometryElement) {
		const len = shape.getTotalLength();
		const pts = [];
		for (let i = 0; i < samples; i++) {
			const p = shape.getPointAtLength((len * i) / samples);
			pts.push([p.x, p.y]);
		}
		return pts;
	}
	if (Array.isArray(shape)) {
		return shape.map(p => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]));
	}
	if (shape && Array.isArray(shape.points)) return toPolygon(shape.points, samples);
	if (shape && typeof shape.r === 'number') {
		const { r, cx = 0, cy = 0 } = shape;
		const pts = [];
		for (let i = 0; i < samples; i++) {
			const a = (2 * Math.PI * i) / samples;
			pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
		return pts;
	}
	throw new Error('Unsupported shape: use a point list, {r, cx, cy}, or an SVG geometry element');
}

function gCrossings(poly, y) {
	const xs = [];
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i], [xj, yj] = poly[j];
		if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
	}
	xs.sort((a, b) => a - b);
	const out = [];
	for (let k = 0; k + 1 < xs.length; k += 2) out.push([xs[k], xs[k + 1]]);
	return out;
}

function gIntersect(A, B) {
	const out = [];
	let i = 0, j = 0;
	while (i < A.length && j < B.length) {
		const lo = Math.max(A[i][0], B[j][0]);
		const hi = Math.min(A[i][1], B[j][1]);
		if (hi > lo) out.push([lo, hi]);
		if (A[i][1] < B[j][1]) i++; else j++;
	}
	return out;
}

function polygonCentroidY(poly) {
	let a = 0, cy = 0;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i], [xj, yj] = poly[j];
		const c = xj * yi - xi * yj;
		a += c;
		cy += (yi + yj) * c;
	}
	return Math.abs(a) < 1e-12 ? null : cy / (3 * a);
}

function makeMeasure(customMeasure, fontStyle, fontWeight, fontFamily) {
	const cache = new Map();
	let raw, ascent = 0.8, descent = 0.2;

	if (customMeasure) {
		raw = customMeasure;
	} else {
		const canvas = typeof OffscreenCanvas !== 'undefined'
			? new OffscreenCanvas(1, 1)
			: document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.font = `${fontStyle} ${fontWeight} 100px ${fontFamily}`;
		raw = s => ctx.measureText(s).width / 100;
		const m = ctx.measureText('Mg');
		if (m.fontBoundingBoxAscent != null) {
			ascent = m.fontBoundingBoxAscent / 100;
			descent = m.fontBoundingBoxDescent / 100;
		}
	}
	const M = s => {
		let w = cache.get(s);
		if (w === undefined) { w = raw(s); cache.set(s, w); }
		return w;
	};
	return { M, ascent, descent };
}

//#region paths from svgs

function svgToShape(svg, options = {}) {
	const {
		box = { x: 20, y: 20, w: 360, h: 360 },
		samples = 600,
		selector = 'path',
	} = options;

	const root = toSvgRoot(svg);

	// Must be attached and rendered for getScreenCTM / path measuring to work.
	const host = document.createElement('div');
	host.style.cssText =
		'position:absolute;left:-99999px;top:0;width:500px;height:500px;visibility:hidden;pointer-events:none';
	root.style.width = '500px';
	root.style.height = '500px';
	host.appendChild(root);
	document.body.appendChild(host);

	try {
		const rootCTM = root.getScreenCTM();
		if (!rootCTM) throw new Error('SVG could not be rendered');
		const toRoot = rootCTM.inverse();

		let best = null; // { pts, length }

		for (const el of root.querySelectorAll(selector)) {
			if (!(el instanceof SVGGeometryElement)) continue;
			if (el.closest('defs, clipPath, mask, marker, symbol, pattern')) continue;
			if (!el.getScreenCTM()) continue;

			for (const d of splitSubpaths(el)) {
				const tmp = el.cloneNode(false);
				tmp.setAttribute('d', d);
				el.after(tmp);
				try {
					const len = tmp.getTotalLength();
					if (!(len > 0)) continue;
					const m = toRoot.multiply(tmp.getScreenCTM());
					const pts = [];
					let polyLen = 0;
					for (let i = 0; i <= samples; i++) {
						const p = tmp.getPointAtLength((len * i) / samples);
						const q = new DOMPoint(p.x, p.y).matrixTransform(m);
						if (pts.length) {
							const prev = pts[pts.length - 1];
							polyLen += Math.hypot(q.x - prev[0], q.y - prev[1]);
						}
						pts.push([q.x, q.y]);
					}
					if (!best || polyLen > best.length) best = { pts, length: polyLen };
				} finally {
					tmp.remove();
				}
			}
		}

		if (!best) throw new Error(`No usable <${selector}> element found in the SVG`);

		// drop the duplicated closing point of closed paths
		const pts = best.pts;
		const f = pts[0], l = pts[pts.length - 1];
		if (pts.length > 3 && Math.hypot(f[0] - l[0], f[1] - l[1]) < 1e-6) pts.pop();

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const [x, y] of pts) {
			if (x < minX) minX = x; if (x > maxX) maxX = x;
			if (y < minY) minY = y; if (y > maxY) maxY = y;
		}

		let data = pts;
		if (box) {
			const w = maxX - minX || 1, h = maxY - minY || 1;
			const s = Math.min(box.w / w, box.h / h);
			const tx = box.x + (box.w - w * s) / 2 - minX * s;
			const ty = box.y + (box.h - h * s) / 2 - minY * s;
			data = pts.map(([x, y]) => [x * s + tx, y * s + ty]);
			[minX, maxX] = [minX * s + tx, maxX * s + tx];
			[minY, maxY] = [minY * s + ty, maxY * s + ty];
		}

		return {
			kind: 'points',
			data,
			label: 'Longest path from SVG',
			length: best.length,
			bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
		};
	} finally {
		host.remove();
	}
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
	throw new Error('svgToShape expects an SVG string or element');
}
function splitSubpaths(el) {
	// Split a path's `d` into subpaths. A subpath that starts with a relative `m`
	// depends on the previous current point, so it is prefixed with an absolute
	// `M x y` to make it standalone.
	const d = el.getAttribute('d') || '';
	const parts = d.match(/[Mm][^Mm]*/g) || [];
	if (parts.length <= 1) return [d];

	const scratch = el.cloneNode(false);
	el.after(scratch);
	const out = [];
	let acc = '';
	try {
		parts.forEach((part, i) => {
			let sub = part;
			if (i > 0 && part[0] === 'm') {
				scratch.setAttribute('d', acc);
				const p = scratch.getPointAtLength(scratch.getTotalLength());
				sub = `M${p.x} ${p.y}${part}`;
			}
			out.push(sub);
			acc += part;
		});
	} finally {
		scratch.remove();
	}
	return out;
}

//#endregion

//#region PolyClips
const BOX = { x: 20, y: 20, w: 360, h: 360 };
function clipToShape(css) {
	const num = (tok, ref) => tok.endsWith('%') ? parseFloat(tok) / 100 * ref : parseFloat(tok);
	let m = css.trim().match(/^polygon\((.*)\)$/);
	if (m) {
		const pts = m[1].split(',').map(s => {
			const [x, y] = s.trim().split(/\s+/);
			return (x && y) ? [BOX.x + num(x, BOX.w), BOX.y + num(y, BOX.h)] : null;
		});
		return pts.every(Boolean) && pts.length >= 3 ? { kind: 'points', data: pts } : null;
	}
	m = css.trim().match(/^inset\(\s*(.*?)\s*(?:round\s+(.*?))?\s*\)$/);
	if (m) {
		const v = m[1].split(/\s+/);
		if (v.length < 1 || v.length > 4) return null;        // invalid CSS (max 4 offsets)
		const [t, r, b, l] = [v[0], v[1] ?? v[0], v[2] ?? v[0], v[3] ?? v[1] ?? v[0]];
		const top = num(t, BOX.h), right = num(r, BOX.w), bottom = num(b, BOX.h), left = num(l, BOX.w);
		const w = BOX.w - left - right, h = BOX.h - top - bottom;
		if (!(w > 0 && h > 0)) return null;
		const rx = m[2] ? num(m[2].split(/\s+/)[0], Math.min(w, h)) : 0;
		return {
			kind: 'element', tag: 'rect',
			attrs: { x: BOX.x + left, y: BOX.y + top, width: w, height: h, rx, ry: rx }
		};
	}
	return null;
}

//#endregion

//#region simple svg to shape
function svgToShapeSimple(svg, options = {}) {
	const {
		maxPoints = 49,
		tolerance = 0.5,
		samples = 2000,
		box,
		selector,
	} = options;

	const base = svgToShape(svg, {
		samples,
		...(box !== undefined && { box }),
		...(selector !== undefined && { selector }),
	});
	const ring = base.data;

	let simple = simplifyRing(ring, tolerance);
	if (simple.length > maxPoints) {
		let lo = tolerance;
		let hi = Math.hypot(base.bbox.w, base.bbox.h);
		let best = simplifyRing(ring, hi);
		for (let i = 0; i < 40 && hi - lo > 1e-3; i++) {
			const mid = (lo + hi) / 2;
			const r = simplifyRing(ring, mid);
			if (r.length <= maxPoints) { hi = mid; best = r; } else lo = mid;
		}
		simple = best;
	}

	const data = cleanRounded(simple.map(([x, y]) => [Math.round(x), Math.round(y)]));
	if (data.length < 3) throw new Error('Outline collapsed to fewer than 3 points');

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	for (const [x, y] of data) {
		minX = Math.min(minX, x); maxX = Math.max(maxX, x);
		minY = Math.min(minY, y); maxY = Math.max(maxY, y);
	}

	return {
		kind: 'points',
		data,
		label: 'Longest path from SVG (simplified)',
		length: base.length,
		bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
		originalPoints: ring.length,
	};
}
// Distance from p to the line through a and b.
function lineDist(p, a, b) {
	const dx = b[0] - a[0], dy = b[1] - a[1];
	const len = Math.hypot(dx, dy);
	if (len < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
	return Math.abs(dx * (a[1] - p[1]) - dy * (a[0] - p[0])) / len;
}

// Douglas-Peucker on an open polyline.
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
		if (idx !== -1 && maxD > eps) {
			keep[idx] = 1;
			stack.push([s, idx], [idx, e]);
		}
	}
	return pts.filter((_, i) => keep[i]);
}

// Douglas-Peucker on a closed ring: split at the point farthest from point 0
// so both halves have well-defined end points.
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

// After rounding: drop consecutive duplicates and exactly collinear points.
function cleanRounded(pts) {
	let out = pts;
	let changed = true;
	while (changed && out.length > 3) {
		changed = false;
		const next = [];
		const n = out.length;
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

function mSvgFromText(dParent, opts = {}) {
  const { text, pad = 0, ...rest } = opts;
  if (!text) return { viewBox: '0 0 100 100', items: [], svg: null };

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const shapeElements = [...doc.querySelectorAll('path, rect, circle, polygon, polyline, ellipse, line')];

  const items = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  const round2 = (num) => parseFloat(Number(num).toFixed(2));

  const trackX = (x) => {
    if (!isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  };

  const trackY = (y) => {
    if (!isNaN(y)) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };

  // Extract presentation attributes (fill, stroke, opacity, style, etc.)
  const extractAttributes = (elem) => {
    const attrOpts = {};
    for (const attr of elem.attributes) {
      let key = attr.name;
      if (key === 'stroke-width') key = 'thickness';
      attrOpts[key] = attr.value;
    }
    return attrOpts;
  };

  shapeElements.forEach(elem => {
    const tagName = elem.tagName.toLowerCase();
    const itemOpts = extractAttributes(elem);
    itemOpts.tag = tagName;

    if (tagName === 'path') {
      const rawD = elem.getAttribute('d');
      if (!rawD) return;

      let isX = true;
      itemOpts.d = rawD.replace(/([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+))/g, (match, cmd, num) => {
        if (cmd) {
          if (/[MLCSQTA]/.test(cmd)) isX = true;
          return cmd;
        }
        
        const val = round2(num);
        if (isX) {
          trackX(val);
        } else {
          trackY(val);
        }
        isX = !isX;
        
        return val;
      });
    } 
    else if (tagName === 'polygon' || tagName === 'polyline') {
      const pts = (elem.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      const roundedPts = [];
      for (let i = 0; i < pts.length; i += 2) {
        if (!isNaN(pts[i]) && !isNaN(pts[i + 1])) {
          const rx = round2(pts[i]);
          const ry = round2(pts[i + 1]);
          trackX(rx);
          trackY(ry);
          roundedPts.push(`${rx},${ry}`);
        }
      }
      itemOpts.points = roundedPts.join(' ');
    } 
    else if (tagName === 'rect') {
      const x = round2(elem.getAttribute('x') || 0);
      const y = round2(elem.getAttribute('y') || 0);
      const w = round2(elem.getAttribute('width') || 0);
      const h = round2(elem.getAttribute('height') || 0);
      trackX(x); trackX(x + w);
      trackY(y); trackY(y + h);
      itemOpts.x = x; itemOpts.y = y; itemOpts.w = w; itemOpts.h = h;
    }
    else if (tagName === 'circle') {
      const cx = round2(elem.getAttribute('cx') || 0);
      const cy = round2(elem.getAttribute('cy') || 0);
      const r = round2(elem.getAttribute('r') || 0);
      trackX(cx - r); trackX(cx + r);
      trackY(cy - r); trackY(cy + r);
      itemOpts.cx = cx; itemOpts.cy = cy; itemOpts.r = r;
    }

    items.push(itemOpts);
  });

  // Calculate final viewBox
  let viewBox = '0 0 100 100';
  if (minX !== Infinity && minY !== Infinity) {
    const vbX = round2(minX - pad);
    const vbY = round2(minY - pad);
    const vbW = round2((maxX - minX) + (pad * 2));
    const vbH = round2((maxY - minY) + (pad * 2));
    viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;
  }

  // Render to DOM via mDom if dParent is supplied
  let svgNode = null;
  if (typeof dParent !== 'undefined' && dParent !== null) {
    svgNode = mDom(dParent, {
      tag: 'svg',
      w100: true,
      h100: true,
      viewBox: viewBox,
      ...rest
    });

    items.forEach(item => {
      mDom(svgNode, item);
    });
  }

  return { viewBox, items, svg: svgNode };
}

function mFindElemsWithTags(svg, tags) {
	let elems = {};
	for (const tag of tags) {
		let list = [...svg.querySelectorAll(tag)];
		elems[tag] = list;
	}
	return elems;
}
function mFindElemsWithColor(elsByTag, hexcolor) {
	let list = [];
	for (const tag in elsByTag) {
		for (const el of elsByTag[tag]) {
			let text = el.outerHTML;
			let yes = text.toLowerCase().includes(hexcolor.toLowerCase());
			if (yes) list.push({ el, tag, text });
		}
	}
	return list;
}


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


function mSvg(dParent, opts = {}) {
	/**
	 * Creates an SVG root element scaled 100% to fill dParent.
	 * Automatically computes viewBox from explicit bounds, path(s), or points.
	 * 
	 * @param {HTMLElement|string} dParent - Parent DOM node or ID.
	 * @param {Object} [opts={}] - Configuration options.
	 * @param {number} [opts.x] - Custom viewBox X origin.
	 * @param {number} [opts.y] - Custom viewBox Y origin.
	 * @param {number} [opts.w] - Custom viewBox width.
	 * @param {number} [opts.h] - Custom viewBox height.
	 * @param {string} [opts.path] - A single path d-string to draw and bound.
	 * @param {string[]} [opts.pathlist] - Array of path d-strings to draw and bound.
	 * @param {Array<number[]>|Array<{x,y}>|string} [opts.points] - Point list for polygon.
	 * @param {number} [opts.pad=0] - Padding around computed bounding box.
	 * @returns {SVGSVGElement}
	 */

	// if (opts.text) {
	// 	return mSvgFromText(dParent, opts).svg;
	// }
	// Extract custom parameters while passing remaining properties to mDom
	let { x, y, w, h, path, pathlist, points, pad = 0, ...rest } = opts;

	let vbX = x, vbY = y, vbW = w, vbH = h;
	const pathsToDraw = [];
	let pointsToDraw = null;

	// 1. Normalize Path Inputs
	if (path) pathsToDraw.push(path);
	if (Array.isArray(pathlist)) pathsToDraw.push(...pathlist);

	// 2. Parse and Compute Bounds for Points (if provided)
	let ptMinX = Infinity, ptMaxX = -Infinity, ptMinY = Infinity, ptMaxY = -Infinity;
	if (points) {
		let ptArray = [];
		if (typeof points === 'string') {
			// Parse string format "x1,y1 x2,y2 ..." or "x1 y1 x2 y2"
			const nums = points.trim().split(/[\s,]+/).map(Number);
			for (let i = 0; i < nums.length; i += 2) {
				if (!isNaN(nums[i]) && !isNaN(nums[i + 1])) {
					ptArray.push([nums[i], nums[i + 1]]);
				}
			}
			pointsToDraw = points;
		} else if (Array.isArray(points)) {
			ptArray = points.map(pt => Array.isArray(pt) ? pt : [pt.x, pt.y]);
			pointsToDraw = ptArray.map(pt => `${pt[0]},${pt[1]}`).join(' ');
		}

		ptArray.forEach(([px, py]) => {
			if (px < ptMinX) ptMinX = px;
			if (px > ptMaxX) ptMaxX = px;
			if (py < ptMinY) ptMinY = py;
			if (py > ptMaxY) ptMaxY = py;
		});
	}

	// 3. Compute Bounds from Paths (if coordinates not explicitly passed)
	if ((vbW == null || vbH == null) && pathsToDraw.length > 0) {
		let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;

		pathsToDraw.forEach(dStr => {
			// Extract numbers following path commands
			const matches = dStr.match(/[-+]?(?:\d*\.\d+|\d+)/g);
			if (matches) {
				for (let i = 0; i < matches.length; i += 2) {
					const px = parseFloat(matches[i]);
					const py = parseFloat(matches[i + 1]);
					if (!isNaN(px) && !isNaN(py)) {
						if (px < pMinX) pMinX = px;
						if (px > pMaxX) pMaxX = px;
						if (py < pMinY) pMinY = py;
						if (py > pMaxY) pMaxY = py;
					}
				}
			}
		});

		// Merge Path Bounds into overall bounding box calculation
		if (pMinX !== Infinity) {
			ptMinX = Math.min(ptMinX, pMinX);
			ptMaxX = Math.max(ptMaxX, pMaxX);
			ptMinY = Math.min(ptMinY, pMinY);
			ptMaxY = Math.max(ptMaxY, pMaxY);
		}
	}

	// 4. Resolve Final ViewBox Dimensions
	if (vbW == null || vbH == null) {
		if (ptMinX !== Infinity) {
			vbX = ptMinX - pad;
			vbY = ptMinY - pad;
			vbW = (ptMaxX - ptMinX) + (pad * 2);
			vbH = (ptMaxY - ptMinY) + (pad * 2);
		} else {
			// Default fallback if no coordinates, paths, or points given
			vbX = 0; vbY = 0; vbW = 100; vbH = 100;
		}
	} else {
		vbX = vbX ?? 0;
		vbY = vbY ?? 0;
	}

	// 5. Construct SVG Root using unified mDom
	const svg = mDom(dParent, {
		tag: 'svg',
		w100: true,
		h100: true,
		viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
		...rest
	});

	// 6. Append Child Polygon (if points provided)
	if (pointsToDraw) {
		mDom(svg, {
			tag: 'polygon',
			points: pointsToDraw,
			fill: rest.fill,
			stroke: rest.stroke,
			thickness: rest.thickness
		});
	}

	// 7. Append Child Paths (if paths provided)
	pathsToDraw.forEach(dStr => {
		mDom(svg, {
			tag: 'path',
			d: dStr,
			fill: rest.fill,
			stroke: rest.stroke,
			thickness: rest.thickness
		});
	});

	return svg;
}
function mCleanSvg(svgCode, options = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const preserveAspectRatio =
    options.preserveAspectRatio ?? 'xMidYMid meet';

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const source = doc.documentElement;

  if (
    source.localName !== 'svg' ||
    doc.querySelector('parsererror')
  ) {
    throw new Error('mExtractShapes expects valid SVG markup.');
  }

  const excludedRootAttrs = new Set([
    'width',
    'height',
    'viewBox',
    'preserveAspectRatio',
    'xmlns',
    'xml',
    'version',
  ]);

  function copyAttributes(from, to, exclude = new Set()) {
    for (const attr of from.attributes) {
      let elim = false;
      for (const x of exclude) {
        if (attr.name.startsWith(x)) {
          // console.log('excluded:', attr);
          elim = true;
        }
      }
      if (!elim) to.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
    }
  }

  function cloneSvgNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = document.createElementNS(ns, node.localName);
      copyAttributes(node, clone);

      for (const child of node.childNodes) {
        clone.appendChild(cloneSvgNode(child));
      }

      return clone;
    }

    return document.importNode(node, true);
  }

  function appendChildren(from, to) {
    for (const child of from.childNodes) {
      to.appendChild(cloneSvgNode(child));
    }
  }

  function roundNumber(value) {
    return parseFloat(Number(value).toFixed(2));
  }

  function roundPoints(points) {
    return points.replace(
      /[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g,
      roundNumber
    );
  }

  function roundPathData(d) {
    const arity = {
      M: 2, L: 2, H: 1, V: 1,
      C: 6, S: 4, Q: 4, T: 2, A: 7
    };

    const tokens = d.match(
      /[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g
    ) || [];

    let command = '';
    let argIndex = 0;

    return tokens.map(token => {
      if (/^[a-zA-Z]$/.test(token)) {
        command = token;
        argIndex = 0;
        return token;
      }

      const upper = command.toUpperCase();
      const count = arity[upper];

      if (!count) return token;

      // Arc flags must remain exactly 0 or 1.
      const isArcFlag =
        upper === 'A' && (argIndex === 3 || argIndex === 4);

      argIndex = (argIndex + 1) % count;
      return isArcFlag ? token : roundNumber(token);
    }).join(' ');
  }

  function roundShapeCoordinates(root) {
    for (const el of root.querySelectorAll('path, polygon, polyline')) {
      if (el.hasAttribute('d')) {
        el.setAttribute('d', roundPathData(el.getAttribute('d')));
      }

      if (el.hasAttribute('points')) {
        el.setAttribute('points', roundPoints(el.getAttribute('points')));
      }
    }
  }

  roundShapeCoordinates(source);

  const measureSvg = document.createElementNS(ns, 'svg');
  const measureGroup = document.createElementNS(ns, 'g');

  Object.assign(measureSvg.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    opacity: '0',
    overflow: 'visible',
    pointerEvents: 'none',
  });

  measureSvg.setAttribute('width', '1000');
  measureSvg.setAttribute('height', '1000');
  measureSvg.setAttribute('viewBox', '0 0 1000 1000');

  copyAttributes(source, measureSvg, excludedRootAttrs);
  appendChildren(source, measureGroup);
  measureSvg.appendChild(measureGroup);
  document.body.appendChild(measureSvg);

  try {
    let box;

    try {
      box = measureGroup.getBBox({ fill: true, stroke: true });
    } catch {
      box = measureGroup.getBBox();
    }

    if (
      !Number.isFinite(box.x) ||
      !Number.isFinite(box.y) ||
      !Number.isFinite(box.width) ||
      !Number.isFinite(box.height)
    ) {
      throw new Error('Could not measure the SVG shapes.');
    }

    // Round outward to two decimals so rounding does not clip the shapes.
    const minX = Math.floor(box.x * 100) / 100;
    const minY = Math.floor(box.y * 100) / 100;
    const maxX = Math.ceil((box.x + box.width) * 100) / 100;
    const maxY = Math.ceil((box.y + box.height) * 100) / 100;
    const width = Math.max(maxX - minX, 0.01);
    const height = Math.max(maxY - minY, 0.01);

    const result = document.createElementNS(ns, 'svg');
    result.setAttribute('width', '100%');
    result.setAttribute('height', '100%');
    result.setAttribute(
      'viewBox',
      `${roundNumber(minX)} ${roundNumber(minY)} ${roundNumber(width)} ${roundNumber(height)}`
    );
    //result.setAttribute('preserveAspectRatio', preserveAspectRatio);
    result.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    //copyAttributes(source, result, excludedRootAttrs);
    appendChildren(source, result);

    return result;
  } finally {
    measureSvg.remove();
  }
}
function svgFromCode(code, { sanitize = false } = {}) {
  if (typeof code !== 'string') throw new Error('svgFromCode: expected a string');
  const tpl = document.createElement('template');
  tpl.innerHTML = code.replace(/^\s*<\?xml[^>]*\?>/i, '').trim();   // the HTML parser puts <svg> in the SVG namespace

  let svg = tpl.content.querySelector('svg');
  if (!svg) {                                                       // a fragment without a root: wrap it
    tpl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${code}</svg>`;
    svg = tpl.content.querySelector('svg');
    if (!svg || !svg.children.length) throw new Error('svgFromCode: no svg elements found in the code');
  }

  if (sanitize) {
    svg.querySelectorAll('script').forEach(s => s.remove());
    for (const el of [svg, ...svg.querySelectorAll('*')]) {
      for (const a of [...el.attributes]) {
        const bad = a.name.toLowerCase().startsWith('on') || /^\s*javascript:/i.test(a.value);
        if (bad) el.removeAttribute(a.name);
      }
    }
  }
  svg.remove();                                                     // detach from the template
  return svg;
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


