
function svgMeasure(el) {
  if (!el || typeof el.getBBox !== 'function') { assertion(false); return null; }

  const bbox = el.getBBox();

  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
    cx: bbox.x + bbox.width / 2,  // Center X
    cy: bbox.y + bbox.height / 2  // Center Y
  };
}
function svgMeasureFromString(elemStr) {
  /**
   * Measures an SVG element from its raw markup string.
   * 
   * @param {string} elemStr - The raw SVG element markup string (e.g., '<path d="..." />').
   * @returns {{ x: number, y: number, width: number, height: number, cx: number, cy: number, w: number, h: number }|null}
   * example: 	
   * let x=svgMeasureFromString(`<path style="fill:#2D2B33;" d="M50.2,20.77c-0.42,1.75-1.61,3.12-3.94,2.75c-2.18-0.35-3.24-2.6-2.6-4.79	c0.5-1.73,1.79-2.9,3.97-2.53C50.13,16.62,50.6,19.08,50.2,20.77z"/>`);
   */
  if (!elemStr || typeof elemStr !== 'string') return null;

  // 1. Parse element string into an SVG DOM node
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${elemStr.trim()}</svg>`,
    'image/svg+xml'
  );

  const elem = doc.querySelector('svg').firstElementChild;
  if (!elem || doc.querySelector('parsererror')) return null;

  // 2. Offscreen DOM container to enable getBBox calculation
  const hidden = mDom(document.body, {
    position: 'absolute',
    left: -9999,
    top: -9999,
    op: 0,
    pointerEvents: 'none'
  });

  const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgWrapper.appendChild(elem);
  hidden.appendChild(svgWrapper);

  let result = null;

  try {
    const bbox = elem.getBBox();
    result = {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      w: bbox.width,
      h: bbox.height,
      cx: bbox.x + bbox.width / 2,
      cy: bbox.y + bbox.height / 2
    };
  } catch (e) {
    result = null;
  } finally {
    hidden.remove();
  }

  return result;
}
function svgGetFillColorsFromText(text) {
  let colors = new Set();
  // fill="#abc" attributes, and fill:#abc inside style="" or <style> blocks
  for (let m of text.matchAll(/fill\s*[=:]\s*["']?\s*([^"';}\s>]+)/gi)) {
    colors.add(m[1].toLowerCase());
  }
  colors.delete('none');
  return [...colors];
}

function svgFromText(text, styles = {}, opts = {}) {
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.innerHTML = text;
	applyOpts(svg, opts);
	mStyle(svg, styles);
	return svg;
}

function svgAddClipPath(svg, id, shape) {
	const clip = svgElem(null, 'clipPath', {}, {
		id, clipPathUnits: 'objectBoundingBox'
	});
	const match = PolyClips[shape]?.match(/^polygon\((.+)\)$/i);
	if (!match) throw new Error(`PolyClips.${shape} is not a polygon() shape`);

	const points = [...match[1].matchAll(/(-?[\d.]+)%\s+(-?[\d.]+)%/g)]
		.map(([, x, y]) => `${x / 100},${y / 100}`)
		.join(' ');

	svgElem(clip, 'polygon', {}, { points });
	svgAddDef(svg, clip);
	return clip;
}

function svgAddDef(svg, elem) {
	let defs = [...svg.children].find(el => el.tagName === 'defs');
	if (!defs) defs = document.createElementNS(SVG_NS, 'defs');
	if (svg.firstElementChild !== defs) svg.prepend(defs);
	defs.appendChild(elem);
	return elem;
}

function svgAddFilter(svg, filter) {
	return svgAddDef(svg, filter);
}

function svgCircle(dParent, cx, cy, r, styles = {}, opts = {}) {
	return svgElem(dParent, 'circle', styles, { cx, cy, r, ...opts });
}

function svgClippedRect(dParent, shape, styles = {}, opts = {}) {
	const clipPath = PolyClips[shape];
	if (!clipPath) throw new Error(`Unknown PolyClips shape: ${shape}`);
	return svgElem(dParent, 'rect', { ...styles, clipPath }, opts);
}

function svgCreate(dParent, styles = {}, opts = {}) {
	return svgElem(dParent, 'svg', styles, opts);
}

function svgCreateFilter(id, opts = {}) {
	const filter = svgElem(null, 'filter', {}, {
		id, x: '-25%', y: '-25%', width: '150%', height: '160%', ...opts
	});

	svgElem(filter, 'feDropShadow', {}, {
		dx: 0, dy: 4, stdDeviation: 4,
		'flood-color': '#000', 'flood-opacity': 0.3
	});
	return filter;
}

function svgEllipse(dParent, cx, cy, rx, ry, styles = {}, opts = {}) {
	return svgElem(dParent, 'ellipse', styles, { cx, cy, rx, ry, ...opts });
}

function svgElem(dParent, tag, styles = {}, opts = {}) {
	const el = document.createElementNS(SVG_NS, tag);
	const attrs = { ...opts };

	if (attrs.className) {
		attrs.class = attrs.className;
		delete attrs.className;
	}

	applyOpts(el, attrs);
	mStyle(el, styles);
	if (dParent) dParent.appendChild(el);
	return el;
}

function svgGroup(dParent, styles = {}, opts = {}) {
	return svgElem(dParent, 'g', styles, opts);
}

function svgLine(dParent, x1, y1, x2, y2, styles = {}, opts = {}) {
	return svgElem(dParent, 'line', styles, { x1, y1, x2, y2, ...opts });
}

function svgLinearGradient(id, stops, opts = {}) {
	const grad = svgElem(null, 'linearGradient', {}, {
		id, x1: '0%', y1: '0%', x2: '100%', y2: '100%', ...opts
	});

	for (const [offset, color] of stops) {
		svgElem(grad, 'stop', {}, { offset, 'stop-color': color });
	}
	return grad;
}

function svgPath(dParent, d, styles = {}, opts = {}) {
	return svgElem(dParent, 'path', styles, { d, ...opts });
}

function svgPolygon(dParent, points, styles = {}, opts = {}) {
	const pointsAttr = points
		.map(p => Array.isArray(p) ? p.join(',') : p)
		.join(' ');
	return svgElem(dParent, 'polygon', styles, { points: pointsAttr, ...opts });
}

function svgRect(dParent, x, y, width, height, styles = {}, opts = {}) {
	return svgElem(dParent, 'rect', styles, { x, y, width, height, ...opts });
}

function svgText(dParent, text, x, y, styles = {}, opts = {}) {
	const el = svgElem(dParent, 'text', styles, { x, y, ...opts });
	el.textContent = text;
	return el;
}

function svgTextPath(dParent, text, pathId, styles = {}, opts = {}) {
	const textEl = svgElem(dParent, 'text', styles, opts);
	const pathEl = svgElem(textEl, 'textPath', {}, { href: `#${pathId}` });
	pathEl.textContent = text;
	return textEl;
}

function svgUse(dParent, id, x = 0, y = 0, styles = {}, opts = {}) {
	return svgElem(dParent, 'use', styles, { href: `#${id}`, x, y, ...opts });
}

