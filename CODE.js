
function mSvg(dParent, opts = {}) {
  let { x, y, w, h, path, pathlist, points, pad = 0, ...rest } = opts;

  let vbX = x, vbY = y, vbW = w, vbH = h;
  const pathsToDraw = [];
  let pointsToDraw = null;

  if (path) pathsToDraw.push(path);
  if (Array.isArray(pathlist)) pathsToDraw.push(...pathlist);

  let ptMinX = Infinity, ptMaxX = -Infinity, ptMinY = Infinity, ptMaxY = -Infinity;
  if (points) {
    let ptArray = [];
    if (typeof points === 'string') {
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

  if ((vbW == null || vbH == null) && pathsToDraw.length > 0) {
    let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;

    pathsToDraw.forEach(dStr => {
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

    if (pMinX !== Infinity) {
      ptMinX = Math.min(ptMinX, pMinX);
      ptMaxX = Math.max(ptMaxX, pMaxX);
      ptMinY = Math.min(ptMinY, pMinY);
      ptMaxY = Math.max(ptMaxY, pMaxY);
    }
  }

  if (vbW == null || vbH == null) {
    if (ptMinX !== Infinity) {
      vbX = ptMinX - pad;
      vbY = ptMinY - pad;
      vbW = (ptMaxX - ptMinX) + (pad * 2);
      vbH = (ptMaxY - ptMinY) + (pad * 2);
    } else {
      vbX = 0; vbY = 0; vbW = 100; vbH = 100;
    }
  } else {
    vbX = vbX ?? 0;
    vbY = vbY ?? 0;
  }

  const svg = mDom(dParent, {
    tag: 'svg',
    w100: true,
    h100: true,
    viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
    ...rest
  });

  if (pointsToDraw) {
    mDom(svg, {
      tag: 'polygon',
      points: pointsToDraw,
      fill: rest.fill,
      stroke: rest.stroke,
      thickness: rest.thickness
    });
  }

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

function mSvg(svgCode, opts = {}) {
  const svg = svgFromCode(svgCode);
  for (const [key, value] of Object.entries(opts)) {
    svg.setAttribute(key, value);
  }
  return svg;
}


function msShape(key, dParent, opts = {}, outer = {}) {
  // t = Date.now();
  addKeys({ w: '100%', h: '100%' }, opts);
  let d = mDom(dParent, opts);
  let res;
  if (key == 'circle' || key == 'ellipse') {
    mStyle(d, { rounding: '50%' });
  } else if (PolyClips[key]) {
    mStyle(d, { clipPath: PolyClips[key] });
  } else {
    let sh = key.data ? key : M.shapes[key];
    let { g, text } = createStageX(d);
    res = drawClaudeX(g, sh, opts.label || '', text, opts); //{ textFill, depth: opts.depth||20, color, blend: 'multiply' });   // draws the shape once
  }
  return d;
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

  // M.shapes = await loadJson('y/emoshapes.json');
  // // kind: 'circle' | 'points' | 'element'
  // t = Date.now();
  // let shapes = {
  // 	circle: { kind: 'circle', data: { r: 180, cx: 200, cy: 200 } },
  // 	triangle: { kind: 'points', data: [[200, 20], [385, 375], [15, 375]] },
  // 	star4: { kind: 'points', data: geoStar(4) },
  // 	star5: { kind: 'points', data: geoStar(5) },
  // 	star6: { kind: 'points', data: geoStar(6) },
  // 	star7: { kind: 'points', data: geoStar(7) },
  // 	star8: { kind: 'points', data: geoStar(8) },
  // 	star9: { kind: 'points', data: geoStar(9) },
  // 	heart: {
  // 		kind: 'element', tag: 'path',
  // 		attrs: { d: 'M200 360 C60 260 20 180 20 125 C20 65 65 30 115 30 C155 30 185 50 200 85 C215 50 245 30 285 30 C335 30 380 65 380 125 C380 180 340 260 200 360 Z' }
  // 	},
  // 	ellipse: { kind: 'element', tag: 'ellipse', attrs: { cx: 200, cy: 200, rx: 185, ry: 120 } },
  // 	hourglass: { kind: 'element', tag: 'polygon', attrs: { points: '30,20 370,20 230,200 370,380 30,380 170,200' } },
  // };
  // for (const [name, css] of Object.entries(PolyClips)) {
  // 	const def = clipToShape(css);
  // 	if (!def) { console.warn(`PolyClips.${name} is not valid CSS, skipped:`, css); continue; }
  // 	def.sig = css;                       // identical clip strings share one dropdown entry
  // 	shapes[name] = def;
  // }
  // for(const k in shapes) {
  //   M.shapes[k] = shapes[k];
  // }
  // t = Date.now() - t; console.log('polyclips',t);

  // t = Date.now();
  // let sh = await emojiSvgToShape(svgGetMeepleText());
  // M.shapes.meeple = sh;
  // t = Date.now() - t; console.log('emoToShape meeple',t);

  t = Date.now();
  M.shapeKeys = Object.keys(M.shapes).sort();

  Object.freeze(M);
  t = Date.now() - t;
  // console.log('sort keys',t);
}

function mKey_orig(imgKey, d, styles = {}, opts = {}) {
  if (nundef(opts.prefer)) { opts.prefer = 'emoji'; }
  styles = jsCopy(styles);
  if (!isString(imgKey)) { imgKey = imgKey.toString(); opts.prefer = 'plain'; }
  let o = opts.prefer == 'emoji' ? M.emo[imgKey] : imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(type) && nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0 = mDom(d, styles, opts);
  let [w, h] = mSizeSuccession(styles, 100);
  if (type.startsWith('ani')) {
    o = M.emo[imgKey];
    if (!isdef(o.ani)) type = 'emoji';
    else {
      let astyles = { display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
      mStyle(d0, astyles);
      let img = mDom(d0, { h, fit: 'contain', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }, { tag: 'img' });
      if (type == 'anihover') {
        let path = img.src = stringBefore(o.ani, '.webp') + '.png';
        img.onmouseenter = () => img.src = o.ani;
        img.onmouseleave = () => img.src = path;
      } else {
        img.src = o.ani;
      }
      if (isdef(opts.label)) {
        let x = mDom(d0, { w: '80%', maleft: '10%', matop: 4 })
        mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
      }
      return d0;
    }
  }
  if (type == 'emoji') {
    let family = styles.family || 'emoNoto';
    let fz = styles.fz || 50;
    let cursor = styles.cursor || 'default';
    let astyles = { html: o.html, hline: 1, cursor, fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    mStyle(d0, astyles);
  } else if (['img', 'src', 'photo'].includes(type)) {
    let szi = isdef(opts.szImage) ? opts.szImage : styles.sz;
    let w1, h1;
    if (szi != h) { w1 = szi; h1 = szi; mFlex(d0, true, 'center'); } else { w1 = w; h1 = h; }
    let astyle = { w: w1, h: h1, fit: styles.fit ? styles.fit : o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' };
    mDom(d0, astyle, { ...opts, tag: 'img', src: o[type], alt: imgKey });
  } else if (type == 'plain') {
    let [family, fz] = [valf(styles.family, 'opensans'), valf(styles.fz, 12)]; //console.log('fz', fz)
    mStyle(d0, { family, fz }, { html: o[type] });
    let x = mDom(d0, { family, fz }, { ...opts, html: o[type] }); //console.log(x)
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    let fz = styles.fz;
    let astyles = { fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    mStyle(d0, astyles, { html: text });
  }
  if (isdef(opts.label)) {
    let x = mDom(d0, { w: '80%', matop: 4 })
    mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
  }
  return d0;
}

//mist
function _mKey(value, d, opts = {}) {
  const {
    prefer,
    label,
    szImage,
    color,
    ...styles
  } = opts;

  const root = mDom(d, { ...styles });

  let content = value;
  let type = prefer;
  if (type == 'shape') {
    content = M.shapes[content];
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.alignItems = 'center';
    drawShape(content, root, { label: '', w: '80%', h: '80%', depth: 0, texture: null, color });
    addLabel(root, label);
    return root;
  }
  if (type == 'meeple') {
    content = M.shapes[content];
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.alignItems = 'center';
    drawShape(content, root, { label: '', w: '80%', h: '80%', depth: 20, color });
    addLabel(root, label);
    return root;
  }

  // An object with a requested field displays that field.
  // Other objects and lists are shown as YAML.
  else if (value !== null && typeof value === 'object') {
    if (prefer && !Array.isArray(value) && prefer in value) {
      content = value[prefer];
      type = prefer;
    } else {
      root.style.overflow = 'auto';
      const pre = mDom(root, { tag: 'pre', margin: 0, whiteSpace: 'pre-wrap' });
      pre.textContent = YAML.stringify(value);
      return root;
    }
  }

  if (typeof content !== 'string') { content = String(content); }

  // Choose a display type automatically when none was requested.
  if (!type) {
    if (M.emo?.[content]) {
      type = 'emoji';
    } else if (
      M.images?.includes(content) ||
      /^(https?:|data:|\/|\.\/|\.\.\/)/i.test(content) ||
      /\.(svg|png|jpe?g|gif|webp|avif)(?:[?#].*)?$/i.test(content)
    ) {
      type = 'img';
    } else {
      type = 'plain';
    }
  }

  if (type.startsWith('ani')) {
    const emoji = M.emo?.[content];

    if (emoji?.ani) {
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      root.style.alignItems = 'center';

      const img = mDom(root, {
        tag: 'img',
        w: '100%',
        h: label ? 'calc(100% - 22px)' : '100%',
        fit: 'contain',
        flex: '1 1 auto',
        minHeight: 0,
        cursor: 'pointer'
      });

      const still = emoji.ani.replace(/\.webp([?#].*)?$/i, '.png$1');
      img.src = type === 'anihover' ? still : emoji.ani;

      if (type === 'anihover') {
        img.onmouseenter = () => { img.src = emoji.ani; };
        img.onmouseleave = () => { img.src = still; };
      }
    } else {
      type = 'emoji';
    }
  }

  if (type === 'emoji') {
    const emoji = M.emo?.[content];
    mStyle(root, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fz: styles.fz || 50,
      family: styles.family || 'emoNoto',
      html: emoji?.html || content
    });
  } else if (['img', 'src', 'photo'].includes(type)) {
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.alignItems = 'center';

    const img = mDom(root, {
      tag: 'img',
      w: '100%',
      h: label ? 'calc(100% - 22px)' : '100%',
      fit: styles.fit || 'contain',
      flex: '1 1 auto',
      minHeight: 0,
      alt: content
    });

    // Set the property directly so mDom/mStyle cannot treat src as CSS.
    img.src = content;
  } else {
    const span = mDom(root, { tag: 'span' });
    span.textContent = content;
  }

  if (label) {
    const caption = mDom(root, {
      tag: 'div',
      h: 22,
      flex: '0 0 22px',
      align: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    });
    caption.textContent = label;
  }

  // addLabel(root, label);	
  return root;
}
function addLabel(parent, text = label) {
  if (!text) return;

  const caption = mDom(parent, {
    tag: 'div',
    w: '100%',
    h: 22,
    flex: '0 0 22px',
    align: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: 0
  });

  caption.textContent = text;

  requestAnimationFrame(() => {
    if (caption.scrollWidth > caption.clientWidth) {
      caption.title = text;
    }
  });
}
function _mKey(value, d, opts = {}) {
  const {
    prefer,
    label,
    ...styles
  } = opts;

  const root = mDom(d, styles);

  function addLabel(parent, text = label) {
    if (!text) return;

    const caption = mDom(parent, {
      tag: 'div',
      w: '100%',
      h: 22,
      flex: '0 0 22px',
      align: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      minWidth: 0
    });

    caption.textContent = text;

    requestAnimationFrame(() => {
      if (caption.scrollWidth > caption.clientWidth) {
        caption.title = text;
      }
    });
  }
  function renderShape(shape, key, mode) {
    if (mode === 'meeple') {
      const { g, text } = createStageX(root);
      const color = opts.color || rColor();

      drawClaudeX(
        g,
        shape,
        label || (typeof key === 'string' ? key : ''),
        text,
        {
          textFill: clrText(color),
          depth: 20,
          color,
          blend: 'multiply'
        }
      );
      return;
    }

    const points = shape.data.map(point =>
      Array.isArray(point)
        ? [Number(point[0]), Number(point[1])]
        : [Number(point.x), Number(point.y)]
    );

    if (points.length < 3) {
      throw new Error('Shape needs at least three points.');
    }

    const xs = points.map(point => point[0]);
    const ys = points.map(point => point[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = Math.max(maxX - minX, 0.01);
    const height = Math.max(maxY - minY, 0.01);

    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.alignItems = 'center';

    const svg = mDom(root, {
      tag: 'svg',
      w: '100%',
      h: label ? 'calc(100% - 22px)' : '100%',
      viewBox: `${minX} ${minY} ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      flex: '1 1 auto',
      minHeight: 0
    });

    const polygon = mDom(svg, {
      tag: 'polygon',
      points: points.map(([x, y]) => `${x},${y}`).join(' ')
    });
    polygon.setAttribute('fill', opts.color || '#333');

    addLabel(root);
  }

  function loadShape(key, mode) {
    const existing = M.shapes?.[key];

    if (existing?.data) {
      renderShape(existing, key, mode);
      return root;
    }

    return loadText(`assets/svg/${key}.svg`)
      .then(svgText => emojiSvgToShape(svgText))
      .then(shape => {
        M.shapes ??= {};
        M.shapes[key] = shape;
        renderShape(shape, key, mode);
        return root;
      });
  }

  let content = value;
  let type = prefer;

  // A shape object can be passed directly.
  if (value && typeof value === 'object' && !Array.isArray(value) && value.data) {
    renderShape(value, value.key, prefer === 'meeple' ? 'meeple' : 'shape');
    return root;
  }

  // An object may select a field with opts.prefer.
  if (value !== null && typeof value === 'object') {
    if (prefer && !Array.isArray(value) && prefer in value) {
      content = value[prefer];
    } else {
      root.style.overflow = 'auto';
      const pre = mDom(root, {
        tag: 'pre',
        margin: 0,
        whiteSpace: 'pre-wrap'
      });
      pre.textContent = jsyaml.dump(value);
      return root;
    }
  }

  if (typeof content !== 'string') {
    content = String(content);
  }

  // Shape modes look for a cached shape, then load and convert its SVG.
  if (type === 'shape' || type === 'meeple') {
    return loadShape(content, type);
  }

  // Choose a display type automatically when none was requested.
  if (!type) {
    if (M.emo?.[content]) {
      type = 'emoji';
    } else if (
      M.images?.includes(content) ||
      /^(https?:|data:|\/|\.\/|\.\.\/)/i.test(content) ||
      /\.(svg|png|jpe?g|gif|webp|avif)(?:[?#].*)?$/i.test(content)
    ) {
      type = 'img';
    } else {
      type = 'plain';
    }
  }

  if (type.startsWith('ani')) {
    const emoji = M.emo?.[content];

    if (emoji?.ani) {
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      root.style.alignItems = 'center';

      const img = mDom(root, {
        tag: 'img',
        w: '100%',
        h: label ? 'calc(100% - 22px)' : '100%',
        fit: 'contain',
        flex: '1 1 auto',
        minHeight: 0,
        cursor: 'pointer'
      });

      const still = emoji.ani.replace(/\.webp([?#].*)?$/i, '.png$1');
      img.src = type === 'anihover' ? still : emoji.ani;

      if (type === 'anihover') {
        img.onmouseenter = () => { img.src = emoji.ani; };
        img.onmouseleave = () => { img.src = still; };
      }
    } else {
      type = 'emoji';
    }
  } else if (type === 'emoji') {
    const emoji = M.emo?.[content];
    mStyle(root, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fz: styles.fz || 50,
      family: styles.family || 'emoNoto',
      html: emoji?.html || content
    });
  } else if (['img', 'src', 'photo'].includes(type)) {
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.alignItems = 'center';

    const img = mDom(root, {
      tag: 'img',
      w: '100%',
      h: label ? 'calc(100% - 22px)' : '100%',
      fit: styles.fit || 'contain',
      flex: '1 1 auto',
      minHeight: 0,
      alt: content
    });
    img.src = content;
  } else {
    const span = mDom(root, { tag: 'span' });
    span.textContent = content;
  }

  addLabel(root);
  return root;
}


function drawShape(dParent, key, sh, { w = 200, h = 200, bg = 'blue' } = {}) {
  t = Date.now();
  let ds1 = mDom(dParent, { w, h, bg });
  let o1 = createStageX(ds1);
  o1 = drawClaudeX(o1.g, sh, key, o1.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once
  console.log('drawn shape in', Date.now() - t, 'ms');

}

function _mKey(value, d, opts = {}) {
  const { prefer, label, ...styles } = opts;
  const root = mDom(d, styles);

  let type = prefer;
  let content = value;

  if (value && typeof value === 'object') {
    // For example: mKey({ img: 'animals/elephant.png' }, d, { prefer: 'img' })
    if (prefer && !Array.isArray(value) && prefer in value) {
      content = value[prefer];
      type = prefer;
    } else {
      const pre = mDom(root, {
        tag: 'pre',
        margin: 0,
        whiteSpace: 'pre-wrap'
      });
      pre.textContent = jsyaml.dump(value);
      return root;
    }
  }

  if (typeof content === 'string' && !type) {
    if (M.emo?.[content]) {
      type = 'emoji';
    } else if (
      M.images?.includes(content) ||
      /^(https?:|data:|\/|\.\/|\.\.\/)/i.test(content) ||
      /\.(svg|png|jpe?g|gif|webp|avif)(?:[?#].*)?$/i.test(content)
    ) {
      type = 'img';
    } else {
      type = 'plain';
    }
  }

  if (type?.startsWith('ani')) {
    const emoji = M.emo?.[content];

    if (emoji?.ani) {
      const img = mDom(root, {
        tag: 'img',
        h: '100%',
        fit: 'contain',
        cursor: 'pointer'
      });

      const still = emoji.ani.replace(/\.webp([?#].*)?$/i, '.png$1');
      img.src = type === 'anihover' ? still : emoji.ani;

      if (type === 'anihover') {
        img.onmouseenter = () => { img.src = emoji.ani; };
        img.onmouseleave = () => { img.src = still; };
      }
    } else {
      type = 'emoji';
    }
  }

  if (type === 'emoji') {
    const emoji = M.emo?.[content];
    mStyle(root, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fz: styles.fz || 50,
      family: styles.family || 'emoNoto',
      html: emoji?.html || content
    });
  } else if (['img', 'src', 'photo'].includes(type)) {
    mDom(root, {
      tag: 'img',
      src: content,
      alt: String(value),
      w: '100%',
      h: '100%',
      fit: styles.fit || 'contain'
    });
  } else {
    const text = type === 'plain' ? content : String(content);
    const span = mDom(root, { tag: 'span' });
    span.textContent = text;
  }

  if (label) {
    const caption = mDom(root, { tag: 'div', align: 'center' });
    caption.textContent = label;
  }

  return root;
}


function mKey(imgKey, d, styles = {}, opts = {}) {
  if (nundef(opts.prefer)) opts.prefer = 'emoji';

  styles = jsCopy(styles);

  if (!isString(imgKey)) {
    imgKey = imgKey.toString();
    opts.prefer = 'plain';
  }

  let o = opts.prefer == 'emoji'
    ? M.emo[imgKey]
    : imgKey.includes('.')
      ? { src: imgKey }
      : opts.prefer == 'plain'
        ? { plain: imgKey }
        : lookup(M.superdi, [imgKey]);

  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];

  if (nundef(type) && nundef(o[type])) {
    type = types.find(x => isdef(o[x]));
  }

  let d0 = mDom(d, { ...styles, ...opts });
  let [w, h] = mSizeSuccession(styles, 100);

  if (type.startsWith('ani')) {
    o = M.emo[imgKey];

    if (!o.ani) {
      type = 'emoji';
    } else {
      let astyles = {
        display: 'flex',
        dir: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      };

      mStyle(d0, astyles);

      let img = mDom(d0, {
        h,
        fit: 'contain',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        tag: 'img'
      });

      if (type == 'anihover') {
        let path = img.src = stringBefore(o.ani, '.webp') + '.png';
        img.onmouseenter = () => img.src = o.ani;
        img.onmouseleave = () => img.src = path;
      } else {
        img.src = o.ani;
      }

      if (isdef(opts.label)) {
        let x = mDom(d0, { w: '80%', maleft: '10%', matop: 4 });
        mDom(x, {
          fz: 18,
          family: 'opensans',
          align: 'center',
          className: 'ellipsis',
          html: opts.label
        });
      }

      return d0;
    }
  }

  if (type == 'emoji') {
    let family = styles.family || 'emoNoto';
    let fz = styles.fz || 50;
    let cursor = styles.cursor || 'default';
    let astyles = {
      hline: 1,
      cursor,
      fz,
      family,
      display: 'flex',
      dir: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    };

    mStyle(d0, astyles, { html: o.html });
  } else if (['img', 'src', 'photo'].includes(type)) {
    let szi = isdef(opts.szImage) ? opts.szImage : styles.sz;
    let w1, h1;

    if (szi != h) {
      w1 = szi;
      h1 = szi;
      mFlex(d0, true, 'center');
    } else {
      w1 = w;
      h1 = h;
    }

    let astyle = {
      w: w1,
      h: h1,
      fit: styles.fit
        ? styles.fit
        : o && o.cats.includes('card')
          ? 'contain'
          : 'cover',
      'object-position': 'center center',
      ...opts,
      tag: 'img',
      src: o[type],
      alt: imgKey
    };

    mDom(d0, astyle);
  } else if (type == 'plain') {
    let [family, fz] = [
      valf(styles.family, 'opensans'),
      valf(styles.fz, 12)
    ];

    mStyle(d0, { family, fz }, { html: o.plain });
    mDom(d0, { family, fz, ...opts, html: o.plain });
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type)
      ? `&#x${o[type]};`
      : o[type];
    let fz = styles.fz;
    let astyles = {
      fz,
      family,
      display: 'flex',
      dir: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    };

    mStyle(d0, astyles, { html: text });
  }

  if (isdef(opts.label)) {
    let x = mDom(d0, { w: '80%', matop: 4 });
    mDom(x, {
      fz: 18,
      family: 'opensans',
      align: 'center',
      className: 'ellipsis',
      html: opts.label
    });
  }

  return d0;
}
function mKey(imgKey, d, styles = {}, opts = {}) {
  if (nundef(opts.prefer)) { opts.prefer = 'emoji'; }
  styles = jsCopy(styles);
  if (!isString(imgKey)) { imgKey = imgKey.toString(); opts.prefer = 'plain'; }
  let o = opts.prefer == 'emoji' ? M.emo[imgKey] : imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(type) && nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0 = mDom(d, styles, opts);
  let [w, h] = mSizeSuccession(styles, 100);
  if (type.startsWith('ani')) {
    o = M.emo[imgKey];
    if (!isdef(o.ani)) type = 'emoji';
    else {
      let astyles = { display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
      mStyle(d0, astyles);
      let img = mDom(d0, { h, fit: 'contain', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }, { tag: 'img' });
      if (type == 'anihover') {
        let path = img.src = stringBefore(o.ani, '.webp') + '.png';
        img.onmouseenter = () => img.src = o.ani;
        img.onmouseleave = () => img.src = path;
      } else {
        img.src = o.ani;
      }
      if (isdef(opts.label)) {
        let x = mDom(d0, { w: '80%', maleft: '10%', matop: 4 })
        mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
      }
      return d0;
    }
  }
  if (type == 'emoji') {
    let family = styles.family || 'emoNoto';
    let fz = styles.fz || 50;
    let cursor = styles.cursor || 'default';
    let astyles = { hline: 1, cursor, fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    mStyle(d0, astyles, { html: o.html });
  } else if (['img', 'src', 'photo'].includes(type)) {
    let szi = isdef(opts.szImage) ? opts.szImage : styles.sz;
    let w1, h1;
    if (szi != h) { w1 = szi; h1 = szi; mFlex(d0, true, 'center'); } else { w1 = w; h1 = h; }
    let astyle = { w: w1, h: h1, fit: styles.fit ? styles.fit : o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' };
    mDom(d0, astyle, { ...opts, tag: 'img', src: o[type], alt: imgKey });
  } else if (type == 'plain') {
    let [family, fz] = [valf(styles.family, 'opensans'), valf(styles.fz, 12)]; //console.log('fz', fz)
    mStyle(d0, { family, fz }, { html: o[type] });
    let x = mDom(d0, { family, fz }, { ...opts, html: o[type] }); //console.log(x)
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    let fz = styles.fz;
    let astyles = { fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    mStyle(d0, astyles, { html: text });
  }
  if (isdef(opts.label)) {
    let x = mDom(d0, { w: '80%', matop: 4 })
    mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
  }
  return d0;
}


function mExtractShapes(svgCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const source = doc.documentElement;

  if (source.localName !== 'svg' || doc.querySelector('parsererror')) {
    throw new Error('mExtractShapes expects valid SVG markup.');
  }

  const ns = 'http://www.w3.org/2000/svg';
  const measureSvg = document.createElementNS(ns, 'svg');
  measureSvg.setAttribute('xmlns', ns);

  // Keep it measurable while preventing it from appearing in the page.
  Object.assign(measureSvg.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    visibility: 'hidden',
    overflow: 'visible'
  });

  measureSvg.append(...Array.from(source.childNodes, node =>
    document.importNode(node, true)
  ));
  document.body.appendChild(measureSvg);

  try {
    const box = measureSvg.getBBox();

    if (!box.width || !box.height) {
      throw new Error('The SVG has no measurable visible shapes.');
    }

    const result = document.createElementNS(ns, 'svg');
    result.setAttribute('width', '100%');
    result.setAttribute('height', '100%');
    result.setAttribute(
      'viewBox',
      `${box.x} ${box.y} ${box.width} ${box.height}`
    );
    result.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    for (const attr of source.attributes) {
      if (!['width', 'height', 'viewBox', 'preserveAspectRatio', 'xmlns'].includes(attr.name)) {
        result.setAttribute(attr.name, attr.value);
      }
    }

    result.append(...Array.from(source.childNodes, node =>
      document.importNode(node, true)
    ));

    return result;
  } finally {
    measureSvg.remove();
  }
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

  const trackBounds = (x, y) => {
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };

  // Helper to copy all presentation attributes (fill, stroke, opacity, style, etc.)
  const extractAttributes = (elem) => {
    const attrOpts = {};
    for (const attr of elem.attributes) {
      let key = attr.name;
      if (key === 'stroke-width') key = 'thickness'; // maps to mStyle thickness shortcut
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

      // Match path command letters (M, L, C, S, Q, T, A, Z) or numeric values
      let isX = true;
      itemOpts.d = rawD.replace(/([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+))/g, (match, cmd, num) => {
        if (cmd) {
          if (/[MLCSQTA]/.test(cmd)) isX = true;
          return cmd;
        }

        const val = round2(num);

        if (isX) {
          trackBounds(val, minY);
        } else {
          trackBounds(minX, val);
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
          trackBounds(rx, ry);
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
      trackBounds(x, y);
      trackBounds(x + w, y + h);
      itemOpts.x = x; itemOpts.y = y; itemOpts.w = w; itemOpts.h = h;
    }
    else if (tagName === 'circle') {
      const cx = round2(elem.getAttribute('cx') || 0);
      const cy = round2(elem.getAttribute('cy') || 0);
      const r = round2(elem.getAttribute('r') || 0);
      trackBounds(cx - r, cy - r);
      trackBounds(cx + r, cy + r);
      itemOpts.cx = cx; itemOpts.cy = cy; itemOpts.r = r;
    }

    items.push(itemOpts);
  });

  // Calculate final viewBox
  let viewBox = '0 0 100 100';
  if (minX !== Infinity) {
    const vbX = round2(minX - pad);
    const vbY = round2(minY - pad);
    const vbW = round2((maxX - minX) + (pad * 2));
    const vbH = round2((maxY - minY) + (pad * 2));
    viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;
  }

  // Render to DOM via mDom if dParent is supplied
  let svgNode = null;
  if (isdef(dParent)) {
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

/**
 * Processes SVG text: preserves shape tags, commands, and attributes,
 * formats numeric coordinates to fixed 2-decimal numbers, computes the tight viewBox,
 * and appends to dParent.
 */

function mSvgFromText(dParent, opts = {}) {
  /**
   * Processes SVG text/string: extracts paths, rounds numbers, downsamples long paths (>50 pts),
   * and returns calculated viewBox and simplified pathlist (or appends to dParent).
   * 
   * @param {HTMLElement|string|null} dParent - Parent element or null for pure data output.
   * @param {Object} opts - Options object.
   * @param {string} opts.text - Raw SVG XML text.
   * @param {number} [opts.maxPoints=50] - Maximum point threshold before downsampling.
   * @param {number} [opts.decimals=2] - Decimal places for rounding path coordinates.
   * @param {number} [opts.pad=0] - Padding around the viewBox.
   * @returns {{ viewBox: string, paths: string[], svg: SVGSVGElement|null }}
   */
  const { text, maxPoints = 50, decimals = 2, pad = 0, ...rest } = opts;
  if (!text) return { viewBox: '0 0 100 100', paths: [], svg: null };

  // 1. Parse SVG XML String
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const pathElements = [...doc.querySelectorAll('path')];

  const round = (num) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const simplifiedPaths = [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  pathElements.forEach(pathEl => {
    const rawD = pathEl.getAttribute('d');
    if (!rawD) return;

    // 2. Tokenize Path Commands & Coordinates
    // Matches command letters (M, L, C, Z, etc.) or individual numeric values
    const tokens = rawD.match(/([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+))/g);
    if (!tokens) return;

    let commands = [];
    let currentCmd = null;

    tokens.forEach(token => {
      if (/^[a-zA-Z]$/.test(token)) {
        currentCmd = { cmd: token, args: [] };
        commands.push(currentCmd);
      } else if (currentCmd) {
        currentCmd.args.push(parseFloat(token));
      }
    });

    // 3. Round Numbers & Track Bounding Box
    commands.forEach(c => {
      c.args = c.args.map((val, idx) => {
        const roundedVal = round(val);
        // Track X coordinates (even indices) and Y coordinates (odd indices)
        if (idx % 2 === 0) {
          if (roundedVal < minX) minX = roundedVal;
          if (roundedVal > maxX) maxX = roundedVal;
        } else {
          if (roundedVal < minY) minY = roundedVal;
          if (roundedVal > maxY) maxY = roundedVal;
        }
        return roundedVal;
      });
    });

    // 4. Downsample Dense Points if Coordinate Count Exceeds maxPoints
    const totalPoints = commands.reduce((acc, c) => acc + Math.floor(c.args.length / 2), 0);

    if (totalPoints > maxPoints) {
      const step = Math.ceil(totalPoints / maxPoints);
      let pointCount = 0;

      commands = commands.filter((c, idx) => {
        // Always preserve start/end commands (M, Z, z)
        if (idx === 0 || c.cmd.toUpperCase() === 'Z' || c.cmd.toUpperCase() === 'M') return true;

        pointCount++;
        return pointCount % step === 0;
      });
    }

    // 5. Reconstruct Simplified Path String
    const simplifiedD = commands.map(c => `${c.cmd}${c.args.join(',')}`).join(' ');
    simplifiedPaths.push(simplifiedD);
  });

  // 6. Compute Final ViewBox
  let viewBox = '0 0 100 100';
  if (minX !== Infinity) {
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = (maxX - minX) + (pad * 2);
    const vbH = (maxY - minY) + (pad * 2);
    viewBox = `${round(vbX)} ${round(vbY)} ${round(vbW)} ${round(vbH)}`;
  }

  // 7. Render SVG via mSvg if dParent is Provided
  let svgNode = null;
  if (isdef(dParent)) {
    svgNode = mSvg(dParent, {
      viewBox: viewBox,
      pathlist: simplifiedPaths,
      ...rest
    });
  }

  return { viewBox, paths: simplifiedPaths, svg: svgNode };
}
/**
 * Processes SVG text: extracts shapes/paths with their attributes (fill, stroke, etc.),
 * rounds path numbers, downsamples long paths (>maxPoints), calculates tight viewBox,
 * and appends to dParent or returns pure data.
 * 
 * @param {HTMLElement|string|null} dParent - Parent element or null for data output.
 * @param {Object} opts - Options object.
 * @param {string} opts.text - Raw SVG XML text string.
 * @param {number} [opts.maxPoints=50] - Maximum coordinate count before downsampling.
 * @param {number} [opts.decimals=2] - Decimal places for rounding numbers.
 * @param {number} [opts.pad=0] - Padding around the computed viewBox.
 * @returns {{ viewBox: string, items: Array<{tag: string, opts: Object}>, svg: SVGSVGElement|null }}
 */
function mSvgFromText(dParent, opts = {}) {
  const { text, maxPoints = 50, decimals = 2, pad = 0, ...rest } = opts;
  if (!text) return { viewBox: '0 0 100 100', items: [], svg: null };

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const shapeElements = [...doc.querySelectorAll('path, rect, circle, polygon, polyline, ellipse')];

  const round = (num) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const items = [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  const trackBounds = (x, y) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  // Helper to extract all existing attributes from a DOM node into a clean opts object
  const extractAttributes = (elem) => {
    const attrOpts = {};
    for (const attr of elem.attributes) {
      // Map standard attributes; handle camelCase aliases as needed
      let key = attr.name;
      if (key === 'stroke-width') key = 'thickness'; // maps to mStyle thickness shortcut
      attrOpts[key] = attr.value;
    }
    return attrOpts;
  };

  shapeElements.forEach(elem => {
    const tagName = elem.tagName.toLowerCase();
    const itemOpts = extractAttributes(elem);

    if (tagName === 'path') {
      const rawD = elem.getAttribute('d');
      if (!rawD) return;

      // Tokenize Path Commands & Coordinates
      const tokens = rawD.match(/([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+))/g);
      if (!tokens) return;

      let commands = [];
      let currentCmd = null;

      tokens.forEach(token => {
        if (/^[a-zA-Z]$/.test(token)) {
          currentCmd = { cmd: token, args: [] };
          commands.push(currentCmd);
        } else if (currentCmd) {
          currentCmd.args.push(parseFloat(token));
        }
      });

      // Round numbers & calculate bounding box
      commands.forEach(c => {
        c.args = c.args.map((val, idx) => {
          const roundedVal = round(val);
          if (idx % 2 === 0) trackBounds(roundedVal, minY); // temporary check
          return roundedVal;
        });
      });

      // Track precise X/Y pairs
      commands.forEach(c => {
        for (let i = 0; i < c.args.length; i += 2) {
          if (i + 1 < c.args.length) {
            trackBounds(c.args[i], c.args[i + 1]);
          }
        }
      });

      // Downsample dense points if coordinates exceed maxPoints
      const totalPoints = commands.reduce((acc, c) => acc + Math.floor(c.args.length / 2), 0);
      if (totalPoints > maxPoints) {
        const step = Math.ceil(totalPoints / maxPoints);
        let pointCount = 0;
        commands = commands.filter((c, idx) => {
          if (idx === 0 || c.cmd.toUpperCase() === 'Z' || c.cmd.toUpperCase() === 'M') return true;
          pointCount++;
          return pointCount % step === 0;
        });
      }

      itemOpts.tag = 'path';
      itemOpts.d = commands.map(c => `${c.cmd}${c.args.join(',')}`).join(' ');
    }
    else if (tagName === 'polygon' || tagName === 'polyline') {
      itemOpts.tag = tagName;
      const pts = (elem.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      const roundedPts = [];
      for (let i = 0; i < pts.length; i += 2) {
        if (!isNaN(pts[i]) && !isNaN(pts[i + 1])) {
          const rx = round(pts[i]);
          const ry = round(pts[i + 1]);
          trackBounds(rx, ry);
          roundedPts.push(`${rx},${ry}`);
        }
      }
      itemOpts.points = roundedPts.join(' ');
    }
    else if (tagName === 'rect') {
      itemOpts.tag = 'rect';
      const x = round(parseFloat(elem.getAttribute('x') || 0));
      const y = round(parseFloat(elem.getAttribute('y') || 0));
      const w = round(parseFloat(elem.getAttribute('width') || 0));
      const h = round(parseFloat(elem.getAttribute('height') || 0));
      trackBounds(x, y);
      trackBounds(x + w, y + h);
      itemOpts.x = x; itemOpts.y = y; itemOpts.w = w; itemOpts.h = h;
    }
    else if (tagName === 'circle') {
      itemOpts.tag = 'circle';
      const cx = round(parseFloat(elem.getAttribute('cx') || 0));
      const cy = round(parseFloat(elem.getAttribute('cy') || 0));
      const r = round(parseFloat(elem.getAttribute('r') || 0));
      trackBounds(cx - r, cy - r);
      trackBounds(cx + r, cy + r);
      itemOpts.cx = cx; itemOpts.cy = cy; itemOpts.r = r;
    }

    items.push(itemOpts);
  });

  // Compute final ViewBox
  let viewBox = '0 0 100 100';
  if (minX !== Infinity) {
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = (maxX - minX) + (pad * 2);
    const vbH = (maxY - minY) + (pad * 2);
    viewBox = `${round(vbX)} ${round(vbY)} ${round(vbW)} ${round(vbH)}`;
  }

  // Render SVG via unified mDom if dParent is provided
  let svgNode = null;
  if (isdef(dParent)) {
    svgNode = mDom(dParent, {
      tag: 'svg',
      w100: true,
      h100: true,
      viewBox: viewBox,
      ...rest
    });

    items.forEach(item => {
      // Create each shape child, passing along all original fill/stroke attributes
      mDom(svgNode, item);
    });
  }

  return { viewBox, items, svg: svgNode };
}

/**
 * Processes SVG text: preserves ALL original shape tags, commands, and attributes (fill, stroke, etc.),
 * rounds all numeric coordinates to integers, calculates the exact viewBox,
 * and appends to dParent or returns pure data.
 * 
 * @param {HTMLElement|string|null} dParent - Parent DOM element or null for data output.
 * @param {Object} opts - Options object.
 * @param {string} opts.text - Raw SVG XML text string.
 * @param {number} [opts.pad=0] - Optional padding added around the computed viewBox.
 * @returns {{ viewBox: string, items: Array<{tag: string, opts: Object}>, svg: SVGSVGElement|null }}
 */
function mSvgFromText(dParent, opts = {}) {
  const { text, pad = 0, ...rest } = opts;
  if (!text) return { viewBox: '0 0 100 100', items: [], svg: null };

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const shapeElements = [...doc.querySelectorAll('path, rect, circle, polygon, polyline, ellipse, line')];

  const items = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  const trackBounds = (x, y) => {
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };

  // Helper to copy all presentation attributes (fill, stroke, opacity, style, etc.)
  const extractAttributes = (elem) => {
    const attrOpts = {};
    for (const attr of elem.attributes) {
      let key = attr.name;
      if (key === 'stroke-width') key = 'thickness'; // maps to mStyle thickness shortcut
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

      // Match path command letters (M, L, C, S, Q, T, A, Z) or numeric values
      let isX = true;
      itemOpts.d = rawD.replace(/([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+))/g, (match, cmd, num) => {
        if (cmd) {
          // Reset coordinate pairing state on new absolute commands
          if (/[MLCSQTA]/.test(cmd)) isX = true;
          return cmd;
        }

        const intVal = Math.round(parseFloat(num));

        // Track integer coordinates for the bounding box
        if (isX) {
          trackBounds(intVal, minY);
        } else {
          trackBounds(minX, intVal);
        }
        isX = !isX;

        return intVal;
      });
    }
    else if (tagName === 'polygon' || tagName === 'polyline') {
      const pts = (elem.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      const roundedPts = [];
      for (let i = 0; i < pts.length; i += 2) {
        if (!isNaN(pts[i]) && !isNaN(pts[i + 1])) {
          const rx = Math.round(pts[i]);
          const ry = Math.round(pts[i + 1]);
          trackBounds(rx, ry);
          roundedPts.push(`${rx},${ry}`);
        }
      }
      itemOpts.points = roundedPts.join(' ');
    }
    else if (tagName === 'rect') {
      const x = Math.round(parseFloat(elem.getAttribute('x') || 0));
      const y = Math.round(parseFloat(elem.getAttribute('y') || 0));
      const w = Math.round(parseFloat(elem.getAttribute('width') || 0));
      const h = Math.round(parseFloat(elem.getAttribute('height') || 0));
      trackBounds(x, y);
      trackBounds(x + w, y + h);
      itemOpts.x = x; itemOpts.y = y; itemOpts.w = w; itemOpts.h = h;
    }
    else if (tagName === 'circle') {
      const cx = Math.round(parseFloat(elem.getAttribute('cx') || 0));
      const cy = Math.round(parseFloat(elem.getAttribute('cy') || 0));
      const r = Math.round(parseFloat(elem.getAttribute('r') || 0));
      trackBounds(cx - r, cy - r);
      trackBounds(cx + r, cy + r);
      itemOpts.cx = cx; itemOpts.cy = cy; itemOpts.r = r;
    }

    items.push(itemOpts);
  });

  // Calculate final viewBox
  let viewBox = '0 0 100 100';
  if (minX !== Infinity) {
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = (maxX - minX) + (pad * 2);
    const vbH = (maxY - minY) + (pad * 2);
    viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;
  }

  // Render to DOM via mDom if dParent is supplied
  let svgNode = null;
  if (isdef(dParent)) {
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
/**
 * Processes SVG text: preserves ALL original shape tags, commands, and attributes (fill, stroke, etc.),
 * formats all numeric coordinates to fixed 2-decimal numbers, calculates the exact viewBox,
 * and appends to dParent or returns pure data.
 * 
 * @param {HTMLElement|string|null} dParent - Parent DOM element or null for data output.
 * @param {Object} opts - Options object.
 * @param {string} opts.text - Raw SVG XML text string.
 * @param {number} [opts.pad=0] - Optional padding added around the computed viewBox.
 * @returns {{ viewBox: string, items: Array<{tag: string, opts: Object}>, svg: SVGSVGElement|null }}
 */


//before eliminating mSvg
function mDom(dParent, opts = {}) {
  let tag = opts.tag || 'div';
  let d = document.createElement(tag);
  if (tag === 'textarea' && !opts.wrap) opts.wrap = 'hard';

  mStyle(d, opts);

  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}

function mSvg(dParent, opts = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const tag = opts.tag || 'svg';
  const svg = document.createElementNS(ns, tag);

  mStyle(svg, opts);

  if (isdef(dParent)) mAppend(dParent, svg);
  return svg;
}



//before styles param (everything is not just opts)
function mDom(dParent, styles = {}, opts = {}) {
  let tag = opts.tag || 'div';
  let d = document.createElement(tag);
  if (tag === 'textarea' && !styles.wrap) styles.wrap = 'hard';

  mStyle(d, styles);
  mStyle(d, opts);

  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}

function mSvg(dParent, styles = {}, opts = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const tag = opts.tag || 'svg';
  const svg = document.createElementNS(ns, tag);

  mStyle(svg, styles);
  mStyle(svg, opts);

  if (isdef(dParent)) mAppend(dParent, svg);
  return svg;
}

//#region m.js GOOD old version

const NO_UNIT = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'order', 'lineHeight']);

const STYLES = Object.freeze({
  w: 'width',
  h: 'height',
  wmin: 'minWidth',
  hmin: 'minHeight',
  w100: (v) => ['width', '100%'],
  h100: (v) => ['height', '100%'],
  wv: (v) => ['width', '100vw'],
  hv: (v) => ['height', '100vh'],
  fw: 'fontWeight',
  fz: 'fontFamily',
  bg: (v) => ['backgroundColor', clrX(v)],
  fg: (v) => ['color', clrX(v)],
  bf: (v) => {
    let c = clrX(v);
    let ct = clrText(v);
    let ff = 'opensans', fw = '400', fs = '100%';
    if (ct == '#000000') {
      ff = 'roboto'; //'Bahnschrift';
      fw = '550';
      fs = '75%';
      return { backgroundColor: c, color: ct, fontFamily: ff, fontWeight: fw, fontStretch: fs };
    }
    // let fontStretch = ct == '#000000' ? '86%' : '100%';
    // let fontFamily = ct == '#000000' ? 'Bahnschrift' : 'opensans';
    // let fontWeight = ct == '#000000' ? '550' : '400';
    return { backgroundColor: c, color: ct };
  },
  bfg: (v) => ({
    backgroundColor: clrX(v),
    color: clrText(v)
  }),
  bgAttach: 'background-attachment',
  bgBlend: 'background-blend-mode',
  bgImage: 'background-image',
  bgRepeat: 'background-repeat',
  bgSize: 'background-size',
  bgSrc: v => ['background-image', `url(${v})`],
  border: v => {
    let parts = v.split(' ');
    if (parts.length == 1) return `1px solid ${clrX(v)}`;
    else if (parts.length == 2) {
      let n = parts.find(x => isNumber(x[0]));
      let i = parts.indexOf(n);
      let color = i == 0 ? parts[1] : parts[0];
      n = n.includes('px') || n.includes('%') ? n : `${n}px`;
      return `${n} solid ${clrX(color)}`;
    } else return v;
  },
  fill: (v) => ['fill', clrX(v)],
  stroke: (v) => ['stroke', clrX(v)],
  thickness: (v) => ['stroke-width', v],
  m: 'margin',
  mtop: 'marginTop',
  mright: 'marginRight',
  mbottom: 'marginBottom',
  mleft: 'marginLeft',
  mh: v => ['margin', `0px ${v}px`],
  mv: v => ['margin', `${v}px 0px`],
  p: 'padding',
  ptop: 'paddingTop',
  pright: 'paddingRight',
  pbottom: 'paddingBottom',
  pleft: 'paddingLeft',
  ph: v => ['padding', `0px ${v}px`],
  pv: v => ['padding', `${v}px 0px`],

  op: 'opacity',
  r: 'borderRadius',
  rounding: 'borderRadius',
  wrap: (v) => v == 'hard' ? ['wrap', 'hard'] : ['flexWrap', 'wrap'],
  z: 'zIndex',

  // --- Flexbox & Alignment Shortcuts ---
  dir: 'flexDirection',
  align: 'textAlign',
  justify: 'justifyContent',
  gap: 'gap',

  // pos: (v) => {
  // 	// Allows passing array [top, right, bottom, left] or single offset value
  // 	if (Array.isArray(v)) {
  // 		return { position: 'absolute', top: v[0], right: v[1], bottom: v[2], left: v[3] };
  // 	}
  // 	return { position: 'absolute', top: v, left: v };
  // },

  // --- Dynamic Transformers (Returns [propertyName, computedValue]) ---
  sz: (v) => {
    // If array [w, h], mStyle can recurse or accept object; if scalar, sets both width and height
    return typeof v === 'object'
      ? { width: Array.isArray(v) ? v[0] : v.w, height: Array.isArray(v) ? v[1] : v.h }
      : { width: v, height: v };
  },
  //start end center stretch baseline space-around space-between
  //place-items: center stretch;  /* center vertically, stretch horizontally */
  //justifyItems: hor;
  //alignItems: vert;
  grid: (v) => {
    let [rows, cols, gap, hor, vert] = v.split(' ');
    console.log(rows, cols, gap, hor, vert);
    return { display: 'grid', gridTemplateRows: `repeat(${rows},1fr)`, gridTemplateColumns: `repeat(${cols},1fr)`, gap: Number(gap), justifyItems: hor, alignItems: vert };
  },
  flexbox: (v) => {
    let [hor, vert, gap, dir, wrap] = v.split(' ');
    //console.log(hor, vert, gap, dir, wrap);
    return { display: 'flex', justifyContent: hor, alignItems: vert, gap: Number(gap), flexDirection: dir, flexWrap: wrap };
  },

  center: () => ({ display: 'flex', justifyContent: 'center', alignItems: 'center' }),
  _flexCol: () => ({ display: 'flex', flexDirection: 'column' }),
  _flexRow: () => ({ display: 'flex', flexDirection: 'row' }),

  // Standard Row (Items side-by-side, vertically centered)
  flexRow: (v) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: v ?? 8
  }),

  // Standard Column (Items stacked vertically)
  flexCol: (v) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: v ?? 8
  }),

  // Perfect Dead-Center (Horizontal & Vertical)
  center: () => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }),

  // Navigation / Header Row (Items spaced out to ends, vertically centered)
  flexBetween: (v) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: v ?? 8
  }),

  // Wrapping Card/Tile Row (Items wrap naturally to next line)
  flexRowWrap: (v) => ({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: v ?? 8
  }),

  // Pin/Align Content to Right/Bottom
  flexEnd: (dir = 'row') => ({
    display: 'flex',
    flexDirection: dir === 'col' ? 'column' : 'row',
    justifyContent: 'flex-end',
    alignItems: dir === 'col' ? 'flex-end' : 'center'
  }),

  // Fixed N-Column Grid (e.g., gridCols: 3 creates 3 equal columns)
  gridCols: v => {
    let [cols, gap] = Array.isArray(v) ? v : [v, 8];
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: gap
    };
  },

  // Responsive Auto-Fit Cards (Columns auto-fill based on min width in px)
  // Usage: { gridCards: 200 } -> Cards never shrink below 200px
  gridCards: (minWidth = 150, gap = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    gap: gap
  }),

  // Board Game Cell Center (Centers content inside a grid cell)
  gridCenter: () => ({
    display: 'grid',
    placeItems: 'center'
  }),

  // Sidebar + Main Area (e.g., gridSidebar: [250, '1fr'] or gridSidebar: ['200px', 'auto'])
  gridSidebar: (v = [250, '1fr'], gap = 12) => {
    const left = typeof v[0] === 'number' ? `${v[0]}px` : v[0];
    const right = typeof v[1] === 'number' ? `${v[1]}px` : v[1];
    return {
      display: 'grid',
      gridTemplateColumns: `${left} ${right}`,
      gap: gap
    };
  },

  // Forces all items in a grid to stretch fully across both axes of their cell
  gridStretch: (cols = 2, gap = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    gap: gap
  }),

  // Responsive grid cards where every item stretches vertically & horizontally to fill its cell
  gridCardsStretch: (minWidth = 150, gap = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    gap: gap
  }),

  // Target an individual grid item to span the full width/height of its cell
  selfStretch: () => ({
    justifySelf: 'stretch',
    alignSelf: 'stretch',
    w: '100%',
    h: '100%'
  }),

  // Flex row where children match each other's height across the full row
  flexRowStretch: (v) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: v ?? 8
  }),

  // Flex column where children fill the full width of the container
  flexColStretch: (v) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: v ?? 8
  }),

  gridAuto: (minWidth = 120, gap = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    gap: gap
  }),

  // 2. Fixed Total Item Count (Auto-Calculated Equal Grid):
  // Given N total items, calculates columns/rows to form a square/uniform layout.
  gridUniform: (itemCount = 1, gap = 8) => {
    const cols = Math.ceil(Math.sqrt(itemCount)) || 1;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      alignItems: 'stretch',
      justifyItems: 'stretch',
      gap: gap
    };
  }
});

function applyOpts(d, opts = {}) {
  const aliases = {
    classes: 'class',
    className: 'class',
    inner: 'innerHTML',
    html: 'innerHTML',
    w: 'width',
    h: 'height',
  };
  for (const opt in opts) {
    let name = aliases[opt] || opt;
    let val = opts[opt];
    if (name == 'recClick') { d.onclick = async (ev) => { recUserEvent(); await val(ev); } }
    else if (['id', 'style', 'tag', 'innerHTML', 'class', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
    else d.setAttribute(name, val);
  }
}
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
function mSvg(dParent, styles = {}, opts = {}) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, opts.tag || "svg");
  mStyle(svg, styles);
  applyOpts(svg, opts);
  if (isdef(dParent)) mAppend(dParent, svg);
  return svg;
}

//#endregion

const star = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 90 : 190;
  return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
});

//#region claude
function drawClaudeX(layer, def, text = 'hallo', out, opts = {}) {
  const {
    depth = 0,
    angle = 45,
    scale = 1,
    texture = '../assets/texwall/wood.png',
    tile = 80 } = opts;
  layer.replaceChildren();

  // 1. build the base element as before
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

  let front = el;                   // the element that gets the texture
  let fitShape = shape;             // the geometry the text is fitted into
  let ext = null;

  // 2. optional 3D
  if (depth > 0) {
    // keep the whole figure (front + back) inside the stage's viewBox, with a 5% margin
    const vb = layer.ownerSVGElement.viewBox.baseVal;
    const box = vb && vb.width
      ? { x: vb.x + vb.width * 0.05, y: vb.y + vb.height * 0.05, w: vb.width * 0.9, h: vb.height * 0.9 }
      : { x: 20, y: 20, w: 360, h: 360 };

    const g = extrude(shape, depth, { angle, scale, box });
    el.remove();                    // the flat element is replaced by the 3D group
    ext = renderExtrusion(layer, g, { fill: 'red', stroke: 'none' }); //clrX('middle_yellow_red'), strokeWidth: 1.5 });
    front = ext.front;
    fitShape = g.front;             // text goes on the front face
  } else {
    // el.setAttribute('stroke', 'white');
    // el.setAttribute('stroke-width', '1.5');
  }

  // 3. texture (front first, then copy the paint to the walls and back face)
  setTextureFill(front, texture, { tile });
  if (ext) ext.setFill(front.getAttribute('fill'));

  // 4. fit the text
  const t0 = performance.now();
  const r = fitTextInShape(text, fitShape, {
    allowWordBreak: false,
    fontFamily: 'Arial',
    lineHeight: 1,
    padding: 12,
    align: 'center',
    curveSamples: 100,
  });
  const ms = performance.now() - t0;

  out.setAttribute('fill', 'yellow');
  applyFitToSvgText(out, r);
  return {
    message: (r.fits
      ? `font size ${r.fontSize.toFixed(1)}px, ${r.lines.length} lines, ${ms.toFixed(0)} ms`
      : 'Text does not fit even at the minimum font size.'), layer, front, fitShape, ext
  };
}
function setTextureFill(el, imageUrl, { tile = 64, repeat = true } = {}) {
  const svg = el.ownerSVGElement;
  let defs = svg.querySelector('defs');
  if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.prepend(defs); }

  const id = getUID('tex'); //`tex${++patternCount}`;
  const pattern = document.createElementNS(NS, 'pattern');
  pattern.setAttribute('id', id);

  const image = document.createElementNS(NS, 'image');
  image.setAttribute('href', imageUrl);

  if (repeat) {
    // like background-repeat: repeat; tile is the tile size in user units
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', tile);
    pattern.setAttribute('height', tile);
    image.setAttribute('width', tile);
    image.setAttribute('height', tile);
    image.setAttribute('preserveAspectRatio', 'none');
  } else {
    // like background-size: cover; background-repeat: no-repeat
    // the pattern is sized relative to the shape's bounding box
    pattern.setAttribute('patternUnits', 'objectBoundingBox');
    pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
    pattern.setAttribute('width', 1);
    pattern.setAttribute('height', 1);
    image.setAttribute('width', 1);
    image.setAttribute('height', 1);
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice'); // 'meet' = contain
  }

  pattern.appendChild(image);
  defs.appendChild(pattern);
  el.setAttribute('fill', `url(#${id})`);
  return pattern;
}
function __mMeeple(gParent, x, y, sz, clr, styles = {}) {
  /**
   * Appends a classic meeple path to an SVG container (<svg> or <g>).
   * 
   * @param {SVGElement|string} gParent - Target SVG container element or ID.
   * @param {number} x - Center X position.
   * @param {number} y - Center Y position.
   * @param {number} sz - Width/height size box.
   * @param {string} clr - Fill color.
   * @param {Object} [styles={}] - Additional custom styles/attributes.
   * @returns {SVGPathElement}
   */
  const parent = typeof gParent === 'string' ? document.getElementById(gParent) : gParent;
  const half = sz / 2;
  const scale = sz / 100;

  // Normalized 100x100 path centered at (0,0)
  const d = `
    M 0 ${-40 * scale} 
    C ${6 * scale} ${-40 * scale} ${11 * scale} ${-35 * scale} ${11 * scale} ${-29 * scale} 
    C ${11 * scale} ${-25 * scale} ${9 * scale} ${-22 * scale} ${6 * scale} ${-20 * scale} 
    C ${16 * scale} ${-17 * scale} ${28 * scale} ${-10 * scale} ${35 * scale} ${-2 * scale} 
    C ${38 * scale} ${1 * scale} ${36 * scale} ${6 * scale} ${31 * scale} ${6 * scale} 
    C ${26 * scale} ${6 * scale} ${22 * scale} ${-1 * scale} ${17 * scale} ${-4 * scale} 
    L ${17 * scale} ${12 * scale} 
    L ${30 * scale} ${38 * scale} 
    C ${32 * scale} ${42 * scale} ${28 * scale} ${46 * scale} ${24 * scale} ${46 * scale} 
    L ${9 * scale} ${46 * scale} 
    L 0 ${28 * scale} 
    L ${-9 * scale} ${46 * scale} 
    L ${-24 * scale} ${46 * scale} 
    C ${-28 * scale} ${46 * scale} ${-32 * scale} ${42 * scale} ${-30 * scale} ${38 * scale} 
    L ${-17 * scale} ${12 * scale} 
    L ${-17 * scale} ${-4 * scale} 
    C ${-22 * scale} ${-1 * scale} ${-26 * scale} ${6 * scale} ${-31 * scale} ${6 * scale} 
    C ${-36 * scale} ${6 * scale} ${-38 * scale} ${1 * scale} ${-35 * scale} ${-2 * scale} 
    C ${-28 * scale} ${-10 * scale} ${-16 * scale} ${-17 * scale} ${-6 * scale} ${-20 * scale} 
    C ${-9 * scale} ${-22 * scale} ${-11 * scale} ${-25 * scale} ${-11 * scale} ${-29 * scale} 
    C ${-11 * scale} ${-35 * scale} ${-6 * scale} ${-40 * scale} 0 ${-40 * scale} Z
  `;

  return mDom(parent, {
    d: d,
    transform: `translate(${x}, ${y})`,
    fill: typeof clrHex === 'function' ? clrHex(clr) : clr,
    ...styles
  }, {
    tag: 'path'
  });
}

async function claudeDetectEyes(svg, options = {}) {
  const {
    resolution = 256, alphaThreshold = 16, colorTolerance = 40,
    minContrast = 0.12, maxEyeLum = 0.5, minArea = 0.0008, maxArea = 0.05,
    maxAxisRatio = 2.4, minFit = 0.75, maxYRel = 0.7, symmetryTolerance = 0.2,
    pairThreshold = 0.3, singleThreshold = 0.5, debug = false,
  } = options;

  const { data, W, H } = await rasterize(svg, resolution);
  console.log('data', data, W, H);

  let res = findDarkestColorPosition(data, W);
  console.log('darkest position', res);
  return;

  const N = W * H;

  // ---- figure = largest connected opaque blob ------------------------------
  const opaque = new Uint8Array(N);
  for (let i = 0; i < N; i++) opaque[i] = data[i * 4 + 3] > alphaThreshold ? 1 : 0;
  const sil = largestBlob(opaque, W, H);
  if (!sil.area) return { eyes: [], silhouette: { x: 0, y: 0, w: W, h: H }, size: { W, H } };
  const silBox = { x: sil.x0, y: sil.y0, w: sil.x1 - sil.x0 + 1, h: sil.y1 - sil.y0 + 1 };
  const inSil = sil.mask;

  // ---- flat colour regions (seed-based flood fill) ---------------------------
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  }
  const label = new Int32Array(N);
  const stack = new Int32Array(N);
  const tol2 = colorTolerance * colorTolerance;
  const regions = [];
  for (let p = 0; p < N; p++) {
    if (!inSil[p] || label[p]) continue;
    const id = regions.length + 1;
    const sr = data[p * 4], sg = data[p * 4 + 1], sb = data[p * 4 + 2];
    const R = { id, area: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0, lum: 0, edge: 0 };
    let sp = 0;
    stack[sp++] = p; label[p] = id;
    while (sp) {
      const q = stack[--sp];
      const x = q % W, y = (q - x) / W;
      R.area++; R.sx += x; R.sy += y; R.sxx += x * x; R.syy += y * y; R.sxy += x * y; R.lum += lum[q];
      const nb = [x > 0 ? q - 1 : -1, x < W - 1 ? q + 1 : -1, y > 0 ? q - W : -1, y < H - 1 ? q + W : -1];
      for (const n of nb) {
        if (n < 0 || !inSil[n]) { R.edge++; continue; }       // touches background
        if (label[n]) continue;
        const dr = data[n * 4] - sr, dg = data[n * 4 + 1] - sg, db = data[n * 4 + 2] - sb;
        if (dr * dr + dg * dg + db * db <= tol2) { label[n] = id; stack[sp++] = n; }
      }
    }
    regions.push(R);
  }

  // ---- candidates ----------------------------------------------------------
  const cands = [];
  const silCx = silBox.x + silBox.w / 2;
  for (const R of regions) {
    const frac = R.area / sil.area;
    if (frac < minArea || frac > maxArea || R.area < 10) continue;
    if (R.edge > 0.15 * Math.sqrt(R.area) * 4) continue;       // touches the outside
    const mx = R.sx / R.area, my = R.sy / R.area;
    const cxx = R.sxx / R.area - mx * mx, cyy = R.syy / R.area - my * my, cxy = R.sxy / R.area - mx * my;
    const t = Math.sqrt(((cxx - cyy) / 2) ** 2 + cxy * cxy);
    const l1 = (cxx + cyy) / 2 + t, l2 = (cxx + cyy) / 2 - t;
    if (l2 <= 1e-6) continue;
    const ratio = Math.sqrt(l1 / l2);
    if (ratio > maxAxisRatio) continue;
    const ellArea = 4 * Math.PI * Math.sqrt(l1 * l2);
    const fit = Math.min(R.area / ellArea, ellArea / R.area);
    if (fit < minFit) continue;

    const eyeLum = R.lum / R.area;
    if (eyeLum > maxEyeLum) continue;

    const rEq = Math.sqrt(R.area / Math.PI);
    const yRel = (my - silBox.y) / silBox.h;
    if (yRel > maxYRel) continue;

    // brightness of the surroundings: sample a ring around the blob
    const off = 3 + 0.4 * rEq, ring = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * 2 * Math.PI, dx = Math.cos(a), dy = Math.sin(a);
      let d = 0;                                               // walk to the blob's edge
      while (d < rEq * 3) {
        const xx = Math.round(mx + dx * d), yy = Math.round(my + dy * d);
        if (xx < 0 || yy < 0 || xx >= W || yy >= H || label[yy * W + xx] !== R.id) break;
        d += 0.5;
      }
      const xx = Math.round(mx + dx * (d + off)), yy = Math.round(my + dy * (d + off));
      if (xx >= 0 && yy >= 0 && xx < W && yy < H && inSil[yy * W + xx]) ring.push(lum[yy * W + xx]);
    }
    if (ring.length < 10) continue;                            // mostly outside the figure
    ring.sort((a, b) => a - b);
    const around = ring[ring.length >> 1];
    const contrast = around - eyeLum;
    if (contrast < minContrast) continue;

    const sDark = clamp(contrast / 0.5);
    const sRound = clamp(1 - (ratio - 1) / (maxAxisRatio - 1));
    const sFit = clamp((fit - minFit) / (1 - minFit));
    const q = 0.45 * sDark + 0.3 * sRound + 0.25 * sFit;
    cands.push({ x: mx + 0.5, y: my + 0.5, r: rEq, area: R.area, quality: q, yRel, contrast, ratio, fit });
  }

  // ---- choose a pair, else a single convincing eye ----------------------------
  let eyes = [], bestScore = 0;
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const a = cands[i], b = cands[j];
      const sim = Math.min(a.area, b.area) / Math.max(a.area, b.area);
      if (sim < 0.5) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 1.2) continue;           // overlapping
      if (Math.abs(a.y - b.y) > 0.2 * silBox.h) continue;                           // not level
      if (Math.abs((a.x + b.x) / 2 - silCx) > symmetryTolerance * silBox.w) continue; // not symmetric
      const pos = 1 - 0.6 * ((a.yRel + b.yRel) / 2);
      const score = ((a.quality + b.quality) / 2) * sim * pos;
      if (score > bestScore) { bestScore = score; eyes = [a, b]; }
    }
  }
  if (bestScore < pairThreshold) {
    eyes = [];
    let bestSingle = 0;
    for (const c of cands) {
      const score = c.quality * (1 - 0.6 * c.yRel);
      if (score > bestSingle && score >= singleThreshold) { bestSingle = score; eyes = [c]; }
    }
  }

  const out = {
    eyes: eyes.map(({ x, y, r }) => ({ x, y, r })),
    silhouette: silBox,
    size: { W, H },
  };
  if (debug) out.candidates = cands;
  return out;
}


function findSvgPartWithColor(svgText, hexcolor) {
  /**
   * Searches an SVG string for elements matching a specific hex color (in fill or stroke)
   * and returns the matching element along with its center coordinate (x, y).
   * 
   * @param {string} svgText - The raw SVG string or markup.
   * @param {string} hexcolor - The target hex color string (e.g., "#ff0000", "f00", "#FF0000").
   * @returns {{ elem: SVGElement, center: {x: number, y: number}, bbox: SVGRect }|null}
   */
  if (!svgText || !hexcolor) return null;

  // 1. Normalize target color to lowercase 6-digit hex (#rrggbb)
  function normalizeHex(hex) {
    let c = String(hex).trim().toLowerCase().replace(/^#/, '');
    if (c.length === 3) {
      c = c.split('').map(ch => ch + ch).join('');
    }
    return `#${c}`;
  }

  const targetColor = normalizeHex(hexcolor);

  // Helper to extract normalized color from inline styles or attributes
  function parseColor(val) {
    if (!val || val === 'none' || val === 'transparent') return null;
    if (val.startsWith('#')) return normalizeHex(val);
    if (typeof clrHex === 'function') return normalizeHex(clrHex(val));
    return val.toLowerCase();
  }

  // 2. Parse SVG string into a temporary DOM tree
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElem = doc.querySelector('svg');

  if (!svgElem || doc.querySelector('parsererror')) return null;

  // Render temporarily in an offscreen container to compute precise BBox geometries
  const hiddenContainer = mDom(document.body, {
    position: 'absolute',
    left: -9999,
    top: -9999,
    op: 0,
    pointerEvents: 'none'
  });
  hiddenContainer.appendChild(svgElem);

  // 3. Find matching elements by inspecting fill, stroke, and inline styles
  const allElements = svgElem.querySelectorAll('*');
  let matchedElem = null;

  for (const el of allElements) {
    const styleAttr = el.getAttribute('style') || '';
    const styleFill = styleAttr.match(/fill\s*:\s*([^;]+)/i)?.[1];
    const styleStroke = styleAttr.match(/stroke\s*:\s*([^;]+)/i)?.[1];

    const fillVal = parseColor(styleFill || el.getAttribute('fill'));
    const strokeVal = parseColor(styleStroke || el.getAttribute('stroke'));

    if (fillVal === targetColor || strokeVal === targetColor) {
      matchedElem = el;
      break;
    }
  }

  if (!matchedElem) {
    hiddenContainer.remove();
    return null;
  }

  // 4. Calculate center coordinates (x, y) using getBBox
  let center = { x: 0, y: 0 };
  let bbox = null;

  try {
    bbox = matchedElem.getBBox();
    center = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
  } catch (e) {
    // Fallback for shapes lacking getBBox in unrendered states
    const cx = matchedElem.getAttribute('cx') || matchedElem.getAttribute('x');
    const cy = matchedElem.getAttribute('cy') || matchedElem.getAttribute('y');
    if (cx && cy) {
      center = { x: parseFloat(cx), y: parseFloat(cy) };
    }
  }

  // Clean up temporary DOM container
  hiddenContainer.remove();

  return {
    elem: matchedElem,
    center: center,
    bbox: bbox
  };
}
function findDarkestColorPosition(data, width) {
  /**
   * Finds the (x, y) coordinates of the darkest pixel in a 2D image pixel array.
   * 
   * @param {Uint8ClampedArray} data - The RGBA pixel data (e.g. from canvas ctx.getImageData().data).
   * @param {number} width - The width of the image in pixels.
   * @returns {{x: number, y: number, brightness: number}|null} Coordinates and luminance of the darkest pixel.
   */
  if (!data || data.length === 0 || !width) return null;

  let minLuminance = Infinity;
  let darkestX = 0;
  let darkestY = 0;

  // Process RGBA pixels in 4-byte steps [R, G, B, A]
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Ignore fully transparent pixels
    if (a === 0) continue;

    // Perceptual luminance calculation (BT.601)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance < minLuminance) {
      minLuminance = luminance;
      const pixelIndex = i / 4;
      darkestX = pixelIndex % width;
      darkestY = Math.floor(pixelIndex / width);

      // Early exit if pure black (0) is reached
      if (minLuminance === 0) break;
    }
  }

  return { x: darkestX, y: darkestY, brightness: minLuminance };
}
function findSvgPartsWithColor(svgText, hexcolor) {
  if (!svgText || !hexcolor) return [];

  const normalize = color => {
    let c = String(color).trim().toLowerCase().replace(/^#/, '');
    if (c.length === 3) c = [...c].map(ch => ch + ch).join('');
    return `#${c}`;
  };

  const target = normalize(hexcolor);
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg || doc.querySelector('parsererror')) return [];

  const container = mDom(document.body, {
    position: 'absolute', left: -9999, top: -9999, visibility: 'hidden'
  });
  container.appendChild(svg);

  try {
    return [...svg.querySelectorAll('*')]
      .filter(el => {
        const fill = el.style.fill || el.getAttribute('fill');
        if (!fill) return false;

        try {
          return normalize(typeof clrHex === 'function' ? clrHex(fill) : fill) === target;
        } catch {
          return normalize(fill) === target;
        }
      })
      .map(elem => {
        const bbox = elem.getBBox();
        return {
          elem,
          bbox,
          center: {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
          }
        };
      });
  } finally {
    container.remove();
  }
}

function svgTextFindFill(elem, hex) {
  // const normalize = color => color?.trim().toLowerCase().replace(/^#/, '');
  // const target = normalize(hex);

  return [elem, ...elem.querySelectorAll('*')]
    .find(el => (el.getAttribute('fill') || el.style.fill).toLowerCase() == hex.toLowerCase()) ?? null;
}

function svgDarkestPath(paths) {
  const luminance = color => {
    const hex = color?.trim().replace(/^#/, '');
    if (!hex || !/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return Infinity;

    const fullHex = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex;
    const [r, g, b] = [0, 2, 4].map(i => parseInt(fullHex.slice(i, i + 2), 16) / 255);
    const linear = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  };

  return paths.reduce((darkest, path) =>
    !darkest || luminance(path.getAttribute('fill')) < luminance(darkest.getAttribute('fill'))
      ? path
      : darkest,
    null
  );
}

function createStage(dParent, styles = {}) {
  const stage = mDom(dParent, styles);
  const svg = svgCreate(stage, {}, { id: 'svg', viewBox: '0 0 400 400' });
  const shapeLayer = svgGroup(svg, {}, { id: 'shapeLayer' });
  const out = svgText(svg, '', 0, 0, {}, { id: 'out' });
  //const info = mDom(stage, {}, { classes: 'info', id: 'info' });

  return { stage, svg, shapeLayer, out }; //, info };
}
function setText(fitShape, text, out, opts = {}) {
  if (!text) { out.replaceChildren(); return null; }       // empty text: just clear it

  const r = fitTextInShape(text, fitShape, {
    allowWordBreak: false,
    fontFamily: 'Arial',
    lineHeight: 1,
    padding: 12,
    align: 'center',
    curveSamples: 100,
    verticalSteps: 12,
    precision: 0.5,
    ...opts,                                               // override any of the above
  });
  applyFitToSvgText(out, r);                               // clears the old tspans and writes the new ones
  return r;                                                // r.fits, r.fontSize, r.lines
}


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
function fitTextInShape(text, shape, options = {}) {
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
      const iv = crossings(poly, y);
      cur = cur ? intersect(cur, iv) : iv;
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

/**
 * Convenience: write a fitTextInShape() result into an existing SVG <text>.
 * Place the <text> in the same coordinate space as the shape.
 */
function applyFitToSvgText(textEl, result) {
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

// ===========================================================================
// internals
// ===========================================================================

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

// Even-odd scanline: list of [xStart, xEnd] inside the polygon at height y.
function crossings(poly, y) {
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

function intersect(A, B) {
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

//example:
import { fitTextInShape, applyFitToSvgText } from './fitTextInShape.mjs';

await document.fonts.ready;

const r = fitTextInShape('Some long text to fit', { r: 100, cx: 100, cy: 100 }, {
  allowWordBreak: false,
  fontFamily: 'Georgia',
  lineHeight: 1.2,
  padding: 4,
});
// r.fontSize, r.lines = [{ text, x, y (baseline), width }], r.textAnchor

applyFitToSvgText(svgTextEl, r); // optional helper that writes tspans

//#endregion

//#region chatgpt





function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;
  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror'))
      throw new Error('svgFitContent: invalid SVG content.');
  }

  const shape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(shape, box, shapeEl)
    : { box, shape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const words = text.split(/\s+/).filter(Boolean);
  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Math.max(0, Number(opts.padding ?? 8));
  const minSize = Math.max(1, Math.floor(Number(opts.minFontSize ?? 10)));
  const maxSize = Math.max(minSize, Math.floor(Number(opts.fontSize ?? 48)));
  const lineRatio = Math.max(0.8, Number(opts.lineHeight ?? 1.15));
  const baseY = area.box.y + area.box.height / 2 + Number(opts.textOffsetY ?? 0);
  const ctx = document.createElement('canvas').getContext('2d');
  const fitAlgorithm = opts.fitAlgorithm ?? opts.fitMethod ?? 'balanced';
  const flowMode = ['flow', 'hourglass', 'original', 'greedy'].includes(fitAlgorithm);
  let best = null;

  // Largest font wins. At that size, search vertical placement and all
  // possible whole-word line groupings, then choose the most balanced fit.
  for (let size = maxSize; size >= minSize && !best; size--) {
    const lineHeight = size * lineRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    if (flowMode) {
      const flow = svgFlowLayout(text, ctx, area.box, area.shape, padding, lineHeight, size, opts.breakWords ?? true);
      if (flow) best = { lines: flow.lines, ys: flow.ys, size, lineHeight, centerY: area.box.y + area.box.height / 2 };
      continue;
    }
    const maxLines = Math.min(words.length,
      Math.floor((area.box.height - 2 * padding) / lineHeight));
    const maxShift = Math.max(0, (area.box.height - 2 * padding - size) / 2);
    if (!maxLines) continue;

    let atSize = null;
    const shifts = new Set([0, -maxShift, maxShift]);
    const step = Math.max(1, Math.min(3, lineHeight / 5));
    for (let d = step; d < maxShift; d += step) {
      shifts.add(-d);
      shifts.add(d);
    }

    for (const shift of shifts) {
      const centerY = baseY + shift;
      for (let count = 1; count <= maxLines; count++) {
        const half = ((count - 1) * lineHeight + size) / 2;
        if (centerY - half < area.box.y + padding ||
          centerY + half > area.box.y + area.box.height - padding) continue;

        const wrap = fitAlgorithm === 'greedy' ? svgWrapForShapeGreedy : svgWrapForShape;
        const lines = wrap(text, ctx, area.box, area.shape,
          padding, lineHeight, count, centerY);
        if (!lines) continue;

        const score = lines.score + Math.abs(shift) * 0.0001;
        if (!atSize || score < atSize.score)
          atSize = { lines, score, size, lineHeight, centerY };
      }
    }
    best = atSize;
  }

  if (!best) return;
  const x = area.box.x + area.box.width / 2;
  const textEl = svgElem(parent, 'text', {
    fill: color, fontFamily: family, fontSize: best.size, fontWeight: weight,
    textAnchor: 'middle', dominantBaseline: 'central'
  }, {
    x, y: best.ys ? best.ys[0] : best.centerY - ((best.lines.length - 1) * best.lineHeight) / 2
  });

  best.lines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, best.ys ? { x, y: best.ys[i] } : { x, dy: i ? best.lineHeight : 0 });
    tspan.textContent = line;
  });
}

function svgWrapForShape(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (lineCount < 1 || lineCount > words.length) return null;

  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const widths = [];

  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    // Use the narrowest cross-section across each line's glyph height.
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    widths.push(Math.max(0, Math.min(...samples.map(yy =>
      svgWidthAt(shape, box, yy) - 2 * padding
    ))));
  }

  // Dynamic programming chooses contiguous whole-word groups for each row.
  const dp = Array.from({ length: lineCount + 1 },
    () => Array(words.length + 1).fill(null));
  dp[0][0] = { score: 0, lines: [] };

  for (let row = 0; row < lineCount; row++) {
    for (let start = 0; start < words.length; start++) {
      const prev = dp[row][start];
      if (!prev) continue;
      let line = '';

      for (let end = start; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > widths[row]) break;

        const slack = widths[row] ? (widths[row] - measured) / widths[row] : 1;
        const candidate = {
          score: prev.score + slack * slack,
          lines: [...prev.lines, line]
        };
        const next = end + 1;
        if (!dp[row + 1][next] || candidate.score < dp[row + 1][next].score)
          dp[row + 1][next] = candidate;
      }
    }
  }

  const result = dp[lineCount][words.length];
  if (!result) return null;
  result.lines.score = result.score;
  return result.lines;
}

function svgCenteredWidthAt(shape, box, y, cx) {
  if (shape.type === 'circle') {
    const dy = y - shape.cy;
    const half = Math.sqrt(Math.max(0, shape.r * shape.r - dy * dy));
    const left = shape.cx - half, right = shape.cx + half;
    return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
  }
  if (shape.points?.length) {
    const xs = [];
    for (let i = 0; i < shape.points.length; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[(i + 1) % shape.points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (cx >= xs[i] && cx <= xs[i + 1])
        return 2 * Math.min(cx - xs[i], xs[i + 1] - cx);
    }
    return 0;
  }
  const left = box.x, right = box.x + box.width;
  return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
}



function svgWrapForShapeGreedy(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || lineCount < 1) return null;
  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const lines = [];
  let wordIndex = 0, score = 0;
  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    const width = Math.max(0, Math.min(...samples.map(yy =>
      svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
    )));
    let line = '';
    while (wordIndex < words.length) {
      const candidate = line ? line + ' ' + words[wordIndex] : words[wordIndex];
      if (ctx.measureText(candidate).width > width) break;
      line = candidate;
      wordIndex++;
    }
    if (!line) return null;
    const slack = width ? (width - ctx.measureText(line).width) / width : 1;
    score += slack * slack;
    lines.push(line);
  }
  if (wordIndex !== words.length) return null;
  lines.score = score;
  return lines;
}


function svgFlowLayoutOld(text, ctx, box, shape, padding, lineHeight, fontSize) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const firstY = box.y + padding + fontSize / 2;
  const lastY = box.y + box.height - padding - fontSize / 2;
  const slots = [];

  for (let y = firstY; y <= lastY; y += lineHeight) {
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    const width = Math.max(0, Math.min(...samples.map(yy =>
      svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
    )));
    slots.push({ y, width });
  }
  if (!slots.length) return null;

  const dp = Array.from({ length: slots.length + 1 }, () => new Map());
  dp[0].set(0, { score: 0, lines: [], ys: [] });
  function save(row, wordIndex, state) {
    const old = dp[row].get(wordIndex);
    if (!old || state.score < old.score) dp[row].set(wordIndex, state);
  }

  for (let row = 0; row < slots.length; row++) {
    for (const [wordIndex, state] of dp[row]) {
      save(row + 1, wordIndex, state); // Skip narrow rows around a waist.
      if (wordIndex >= words.length) continue;
      let line = '';

      for (let end = wordIndex; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > slots[row].width) break;
        const slack = slots[row].width
          ? (slots[row].width - measured) / slots[row].width : 1;
        save(row + 1, end + 1, {
          score: state.score + slack * slack,
          lines: [...state.lines, line],
          ys: [...state.ys, slots[row].y]
        });
      }
    }
  }

  const result = dp[slots.length].get(words.length);
  if (!result || !result.lines.length) return null;
  const meanY = result.ys.reduce((sum, y) => sum + y, 0) / result.ys.length;
  result.score += Math.abs(meanY - (box.y + box.height / 2)) / box.height * 0.01;
  return result;
}

function svgFlowLayout(text, ctx, box, shape, padding, lineHeight, fontSize, breakWords = true) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const top = box.y + padding + fontSize / 2;
  const bottom = box.y + box.height - padding - fontSize / 2;
  const pitch = lineHeight;
  const searchStep = Math.max(1, pitch / 4);
  let best = null;

  for (let shift = 0; shift < pitch; shift += searchStep) {
    let y = top + shift;
    let wordIndex = 0;
    let remainder = '';
    const lines = [], ys = [];
    let score = 0;

    while (y <= bottom && wordIndex < words.length) {
      const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
      const width = Math.max(0, Math.min(...samples.map(yy =>
        svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
      )));

      const pending = remainder || words[wordIndex];
      const minChar = Math.min(...Array.from(pending, ch => ctx.measureText(ch).width));
      if (width < minChar) {
        y += pitch;
        continue;
      }

      let line = '';
      while (wordIndex < words.length) {
        const word = remainder || words[wordIndex];
        const candidate = line ? line + ' ' + word : word;

        if (ctx.measureText(candidate).width <= width) {
          line = candidate;
          remainder = '';
          wordIndex++;
          continue;
        }

        if (line) break;
        if (!breakWords) break;

        let cut = word.length;
        while (cut > 1 && ctx.measureText(word.slice(0, cut)).width > width) cut--;
        if (ctx.measureText(word.slice(0, cut)).width > width) break;

        line = word.slice(0, cut);
        remainder = word.slice(cut);
        if (!remainder) wordIndex++;
        break;
      }

      if (line) {
        const slack = (width - ctx.measureText(line).width) / Math.max(1, width);
        score += slack * slack;
        lines.push(line);
        ys.push(y);
      }
      y += pitch;
    }

    if (wordIndex !== words.length || remainder) continue;
    const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
    score += Math.abs(meanY - (box.y + box.height / 2)) / box.height * 0.01;
    if (!best || score < best.score) best = { lines, ys, score };
  }

  return best;
}




function svgInscribedCircleArea(shape, box, shapeEl) {
  const strokeWidth = parseFloat(
    shapeEl.getAttribute('stroke-width') ||
    shapeEl.style.strokeWidth ||
    0
  ) || 0;

  let circle;

  if (shape.type === 'circle') {
    circle = {
      cx: shape.cx,
      cy: shape.cy,
      r: shape.r - strokeWidth / 2
    };
  } else if (shape.type === 'polygon' && shape.points.length >= 3) {
    circle = svgLargestInscribedCircle(shape.points);
    circle.r -= strokeWidth / 2;
  } else {
    circle = {
      cx: box.x + box.width / 2,
      cy: box.y + box.height / 2,
      r: Math.min(box.width, box.height) / 2 - strokeWidth / 2
    };
  }

  circle.r = Math.max(0, circle.r);

  const diameter = circle.r * 2;
  const circleBox = {
    x: circle.cx - circle.r,
    y: circle.cy - circle.r,
    width: diameter,
    height: diameter
  };

  const squareSize = circle.r * Math.SQRT2;
  const svgBox = {
    x: circle.cx - squareSize / 2,
    y: circle.cy - squareSize / 2,
    width: squareSize,
    height: squareSize
  };

  return {
    box: circleBox,
    shape: { type: 'circle', ...circle },
    svgBox
  };
}
function svgLargestInscribedCircle(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  function clearance(x, y) {
    if (!svgPointInPolygon(x, y, points)) return -1;

    let nearest = Infinity;
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.max(0, Math.min(1,
        ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
      ));
      nearest = Math.min(nearest, Math.hypot(x - x1 - t * dx, y - y1 - t * dy));
    }
    return nearest;
  }

  let best = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, r: -1 };
  const steps = 32;

  for (let iy = 0; iy <= steps; iy++) {
    for (let ix = 0; ix <= steps; ix++) {
      const cx = minX + (maxX - minX) * ix / steps;
      const cy = minY + (maxY - minY) * iy / steps;
      const r = clearance(cx, cy);
      if (r > best.r) best = { cx, cy, r };
    }
  }

  return best;
}
function svgPointInPolygon(x, y, points) {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];

    if ((yi > y) !== (yj > y) &&
      x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}
function svgGravityCenterY(shape, box, sections = 32) {
  const sectionHeight = box.height / sections;
  let totalArea = 0;
  let weightedY = 0;

  for (let i = 0; i < sections; i++) {
    const y = box.y + (i + 0.5) * sectionHeight;
    const area = svgWidthAt(shape, box, y) * sectionHeight;
    totalArea += area;
    weightedY += y * area;
  }

  return totalArea ? weightedY / totalArea : box.y + box.height / 2;
}


function svgContentIn(shapeEl, content, styles = {}, opts = {}) {
  mStyle(shapeEl, styles);

  const root = shapeEl.ownerSVGElement;
  if (!root) throw new Error('svgContentIn expects an SVG shape element.');

  const box = shapeEl.getBBox();
  const group = svgElem(shapeEl.parentNode, 'g', {}, {
    transform: shapeEl.getAttribute('transform') || ''
  });

  // Clip overlay content to the existing shape.
  if (!shapeEl.id) shapeEl.id = getUID('shape');
  const clipId = getUID('clip');
  const clip = svgElem(null, 'clipPath', {}, {
    id: clipId,
    clipPathUnits: 'userSpaceOnUse'
  });
  const clipShape = shapeEl.cloneNode(false);
  clipShape.removeAttribute('id');
  clipShape.removeAttribute('transform');
  clip.appendChild(clipShape);
  svgAddDef(root, clip);
  group.setAttribute('clip-path', `url(#${clipId})`);

  svgFitContent(group, content, box, shapeEl, opts);
  return group;
}

function svgShapeBox(shape, content, parent, styles = {}, opts = {}) {
  const svg = svgCreate(parent, {
    w: '100%',
    h: '100%',
    display: 'block',
    overflow: 'visible'
  }, {
    viewBox: '0 0 100 100'
  });

  let shapeEl;
  let points = Array.isArray(shape) ? shape : svgPolyClipPoints(shape);

  if (shape === 'circle') {
    shapeEl = svgCircle(svg, 50, 50, 48, styles);
  } else if (points) {
    //shapeEl = svgPolygon(svg, points, styles);
    const strokeWidth = Number(styles.thickness ?? styles.strokeWidth ?? 0);
    shapeEl = svgPolygon(svg, svgInsetPoints(points, strokeWidth), styles);
  } else if (PolyClips[shape]) {
    // Handles CSS shapes such as inset(...).
    svg.style.clipPath = PolyClips[shape];
    shapeEl = svgRect(svg, 0, 0, 100, 100, styles);
  } else {
    shapeEl = svgRect(svg, 2, 2, 96, 96, styles, { rx: 18, ry: 18 });
  }

  svgContentIn(shapeEl, content, {}, opts);
  return svg;
}

function svgWidthAt(shape, box, y) {
  if (shape.type === 'circle') {
    const dy = y - shape.cy;
    const half = Math.sqrt(Math.max(0, shape.r * shape.r - dy * dy));
    return half * 2;
  }

  if (shape.points?.length) {
    const xs = [];
    for (let i = 0; i < shape.points.length; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[(i + 1) % shape.points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
      }
    }
    if (xs.length >= 2) return Math.max(...xs) - Math.min(...xs);
  }

  return box.width;
}

function svgTextShapeInfo(el) {
  const tag = el.tagName.toLowerCase();

  if (tag === 'circle') {
    return {
      type: 'circle',
      cx: Number(el.getAttribute('cx')),
      cy: Number(el.getAttribute('cy')),
      r: Number(el.getAttribute('r'))
    };
  }

  if (tag === 'polygon') {
    const points = (el.getAttribute('points') || '')
      .trim().split(/\s+/)
      .map(p => p.split(/[ ,]+/).map(Number))
      .filter(p => p.length === 2 && p.every(Number.isFinite));
    return { type: 'polygon', points };
  }

  return { type: 'rect' };
}

function svgPolyClipPoints(shape) {
  const match = PolyClips[shape]?.match(/^polygon\((.+)\)$/i);
  if (!match) return null;

  return [...match[1].matchAll(/(-?[\d.]+)%\s+(-?[\d.]+)%/g)]
    .map(([, x, y]) => [Number(x), Number(y)]);
}

function svgFitSvg(parent, source, box) {
  const values = (source.getAttribute('viewBox') || '0 0 100 100')
    .trim().split(/[ ,]+/).map(Number);
  const [x, y, width, height] = values;
  if (!(width > 0 && height > 0)) throw new Error('SVG needs a valid viewBox.');

  const scale = Math.min(box.width / width, box.height / height);
  const group = svgElem(parent, 'g', {}, {
    transform: `translate(${box.x + (box.width - width * scale) / 2 - x * scale} ${box.y + (box.height - height * scale) / 2 - y * scale}) scale(${scale})`
  });

  for (const child of source.children) {
    const copy = document.importNode(child, true);
    if (copy.tagName.toLowerCase() === 'defs') svgAddDef(parent.ownerSVGElement, copy);
    else group.appendChild(copy);
  }
}

function svgInsetPoints(points, strokeWidth = 0) {
  if (!strokeWidth) return points;

  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const sx = (Math.max(...xs) - Math.min(...xs) - strokeWidth) /
    (Math.max(...xs) - Math.min(...xs));
  const sy = (Math.max(...ys) - Math.min(...ys) - strokeWidth) /
    (Math.max(...ys) - Math.min(...ys));

  return points.map(([x, y]) => [
    cx + (x - cx) * sx,
    cy + (y - cy) * sy
  ]);
}
//#endregion

//#region gem


/**
 * Fits text inside any SVG shape element by maximizing font size and wrapping lines.
 * 
 * @param {SVGElement} shapeElem - Any SVG shape element (<path>, <polygon>, <circle>, <rect>, <ellipse>).
 * @param {string} text - The text string to fit inside the shape.
 * @param {Object} [opts={}] - Configuration options.
 * @param {boolean} [opts.breakWord=false] - If true, breaks anywhere; if false, breaks at word boundaries.
 * @param {string} [opts.fontFamily='sans-serif'] - CSS font-family for rendering.
 * @param {string} [opts.fontWeight='bold'] - CSS font-weight.
 * @param {string} [opts.fill='#000000'] - Text fill color.
 * @param {number} [opts.padding=4] - Inset padding in SVG units from the shape border.
 * @param {number} [opts.minFontSize=6] - Minimum font size threshold.
 * @param {number} [opts.maxFontSize=200] - Maximum font size ceiling.
 * @returns {SVGTextElement|null} The generated <text> element appended inside the SVG parent.
 */
function fitTextToShape(shapeElem, text, opts = {}) {
  const {
    breakWord = false,
    fontFamily = 'sans-serif',
    fontWeight = 'bold',
    fill = '#000000',
    padding = 4,
    minFontSize = 6,
    maxFontSize = 200
  } = opts;

  const svg = shapeElem.ownerSVGElement || shapeElem;
  if (!svg) return null;

  // 1. Convert shape boundary into discrete horizontal collision segments
  const bbox = shapeElem.getBBox();
  const totalLen = shapeElem.getTotalLength ? shapeElem.getTotalLength() : 0;

  // Sample perimeter points along the shape
  const points = [];
  if (totalLen > 0) {
    const numSamples = Math.max(120, Math.floor(totalLen / 2));
    for (let i = 0; i < numSamples; i++) {
      const pt = shapeElem.getPointAtLength((i / numSamples) * totalLen);
      points.push([pt.x, pt.y]);
    }
  } else {
    // Fallback for shapes lacking getTotalLength (e.g. basic rects)
    points.push(
      [bbox.x, bbox.y],
      [bbox.x + bbox.width, bbox.y],
      [bbox.x + bbox.width, bbox.y + bbox.height],
      [bbox.x, bbox.y + bbox.height]
    );
  }

  // Raycasting helper to find min/max X boundaries of shape at a specific Y line
  function getHorizontalSpanAtY(y) {
    const xIntersects = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      if ((p1[1] <= y && p2[1] > y) || (p2[1] <= y && p1[1] > y)) {
        const t = (y - p1[1]) / (p2[1] - p1[1]);
        const x = p1[0] + t * (p2[0] - p1[0]);
        xIntersects.push(x);
      }
    }
    if (xIntersects.length < 2) return null;
    xIntersects.sort((a, b) => a - b);

    // Filter out spans that are too narrow due to inner padding
    const minX = xIntersects[0] + padding;
    const maxX = xIntersects[xIntersects.length - 1] - padding;
    return maxX > minX ? { left: minX, right: maxX, width: maxX - minX } : null;
  }

  // Offscreen SVG canvas context for precise text measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Tokens breakdown
  const tokens = breakWord ? text.split('') : text.split(/\s+/);

  /**
   * Evaluates if text can fit at a specific font size and returns line layout.
   */
  function checkFit(fontSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 1.15;

    // Test overall height fit
    const maxYLines = Math.floor((bbox.height - padding * 2) / lineHeight);
    if (maxYLines <= 0) return null;

    let tokenIdx = 0;
    const lines = [];

    // Center vertical placement inside shape BBox
    const startY = bbox.y + padding + lineHeight * 0.8;

    for (let currentY = startY; currentY <= bbox.y + bbox.height - padding; currentY += lineHeight) {
      const span = getHorizontalSpanAtY(currentY);
      if (!span) continue;

      let lineStr = '';
      let lineValid = false;

      while (tokenIdx < tokens.length) {
        const token = tokens[tokenIdx];
        const testStr = lineStr ? (breakWord ? lineStr + token : lineStr + ' ' + token) : token;
        const metrics = ctx.measureText(testStr);

        if (metrics.width <= span.width) {
          lineStr = testStr;
          lineValid = true;
          tokenIdx++;
        } else {
          break; // Line limit reached for current horizontal segment
        }
      }

      if (lineValid) {
        lines.push({
          text: lineStr,
          x: span.left + span.width / 2, // Center alignment per line
          y: currentY
        });
      }

      if (tokenIdx >= tokens.length) {
        return lines; // All text fitted successfully
      }
    }

    return null; // Could not fit all tokens
  }

  // 2. Binary search for maximum font size that successfully fits text
  let low = minFontSize;
  let high = maxFontSize;
  let bestFontSize = null;
  let bestLayout = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const layout = checkFit(mid);

    if (layout) {
      bestFontSize = mid;
      bestLayout = layout;
      low = mid + 1; // Try larger font size
    } else {
      high = mid - 1; // Try smaller font size
    }
  }

  console.log(bestLayout)
  if (!bestLayout) return null;

  // 3. Render SVG <text> element with <tspan> lines
  const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  mStyle(textElem, {
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    fontSize: bestFontSize,
    fill: fill,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  });

  bestLayout.forEach(line => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    mStyle(tspan, {
      x: line.x,
      y: line.y
    });
    tspan.textContent = line.text;
    textElem.appendChild(tspan);
  });

  shapeElem.parentNode.appendChild(textElem);
  return textElem;
}


/**
 * Fits text inside any SVG shape element by maximizing font size and wrapping lines.
 * 
 * @param {SVGElement} shapeElem - Any SVG shape element (<path>, <polygon>, <circle>, <rect>, <ellipse>).
 * @param {string} text - The text string to fit inside the shape.
 * @param {Object} [opts={}] - Configuration options.
 * @param {boolean} [opts.breakWord=false] - If true, breaks anywhere; if false, breaks at word boundaries.
 * @param {string} [opts.fontFamily='sans-serif'] - CSS font-family for rendering.
 * @param {string} [opts.fontWeight='bold'] - CSS font-weight.
 * @param {string} [opts.fill='#ffffff'] - Text fill color.
 * @param {number} [opts.padding=8] - Inset padding in SVG units from the shape border.
 * @param {number} [opts.minFontSize=8] - Minimum font size threshold.
 * @param {number} [opts.maxFontSize=160] - Maximum font size ceiling.
 * @returns {SVGTextElement|null} The generated <text> element.
 */
function fitTextToShape(shapeElem, text, opts = {}) {
  const {
    breakWord = false,
    fontFamily = 'sans-serif',
    fontWeight = 'bold',
    fill = '#ffffff',
    padding = 8,
    minFontSize = 8,
    maxFontSize = 160
  } = opts;

  // 1. Get precise shape bounding box in SVG local coordinates
  const bbox = shapeElem.getBBox();
  const totalLen = typeof shapeElem.getTotalLength === 'function' ? shapeElem.getTotalLength() : 0;

  // Sample perimeter points along the shape boundary
  const points = [];
  if (totalLen > 0) {
    const numSamples = Math.max(120, Math.floor(totalLen / 2));
    for (let i = 0; i < numSamples; i++) {
      const pt = shapeElem.getPointAtLength((i / numSamples) * totalLen);
      points.push([pt.x, pt.y]);
    }
  } else {
    // Fallback for shapes like <rect>
    points.push(
      [bbox.x, bbox.y],
      [bbox.x + bbox.width, bbox.y],
      [bbox.x + bbox.width, bbox.y + bbox.height],
      [bbox.x, bbox.y + bbox.height]
    );
  }

  // Calculate left and right horizontal bounds inside the shape for a given Y
  function getHorizontalSpanAtY(y) {
    const xIntersects = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      if ((p1[1] <= y && p2[1] > y) || (p2[1] <= y && p1[1] > y)) {
        const t = (y - p1[1]) / (p2[1] - p1[1]);
        const x = p1[0] + t * (p2[0] - p1[0]);
        xIntersects.push(x);
      }
    }
    if (xIntersects.length < 2) return null;
    xIntersects.sort((a, b) => a - b);

    const minX = xIntersects[0] + padding;
    const maxX = xIntersects[xIntersects.length - 1] - padding;
    return maxX > minX ? { left: minX, right: maxX, width: maxX - minX } : null;
  }

  // Canvas context for word measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tokens = breakWord ? text.split('') : text.split(/\s+/);

  function checkFit(fontSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 1.15;

    // Total vertical space check
    const maxAvailableHeight = bbox.height - padding * 2;
    if (lineHeight > maxAvailableHeight) return null;

    let tokenIdx = 0;
    const lines = [];

    // Test line layouts starting from the upper region of the shape BBox
    const startY = bbox.y + padding + lineHeight * 0.75;
    const endY = bbox.y + bbox.height - padding;

    for (let currentY = startY; currentY <= endY; currentY += lineHeight) {
      const span = getHorizontalSpanAtY(currentY);
      if (!span) continue;

      let lineStr = '';
      let lineValid = false;

      while (tokenIdx < tokens.length) {
        const token = tokens[tokenIdx];
        const testStr = lineStr ? (breakWord ? lineStr + token : lineStr + ' ' + token) : token;
        const metrics = ctx.measureText(testStr);

        if (metrics.width <= span.width) {
          lineStr = testStr;
          lineValid = true;
          tokenIdx++;
        } else {
          break;
        }
      }

      if (lineValid) {
        lines.push({
          text: lineStr,
          x: span.left + span.width / 2, // Centered horizontal X
          y: currentY
        });
      }

      if (tokenIdx >= tokens.length) {
        // Vertical centering adjustment for all fitted lines
        const totalBlockHeight = (lines.length - 1) * lineHeight;
        const blockStartY = bbox.y + (bbox.height - totalBlockHeight) / 2;
        const yOffset = blockStartY - lines[0].y;

        return lines.map(line => ({
          ...line,
          y: line.y + yOffset
        }));
      }
    }

    return null;
  }

  // Binary search for maximum font size
  let low = minFontSize;
  let high = maxFontSize;
  let bestFontSize = minFontSize;
  let bestLayout = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const layout = checkFit(mid);

    if (layout) {
      bestFontSize = mid;
      bestLayout = layout;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Remove previous generated text if re-running on same shape
  const existingText = shapeElem.parentNode.querySelector(`[data-fitted-for="${shapeElem.id || 'shape'}"]`);
  if (existingText) existingText.remove();

  if (!bestLayout) return null;

  // Create SVG <text> element positioned inside the shape
  const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  if (shapeElem.id) textElem.setAttribute('data-fitted-for', shapeElem.id);

  mStyle(textElem, {
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    fontSize: bestFontSize,
    fill: fill,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    pointerEvents: 'none'
  });

  bestLayout.forEach(line => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    mStyle(tspan, {
      x: line.x,
      y: line.y
    });
    tspan.textContent = line.text;
    textElem.appendChild(tspan);
  });

  // Append inside shape's parent container directly after the shape
  shapeElem.parentNode.appendChild(textElem);
  return textElem;
}





function svgShape(shape, parent, styles = {}, opts = {}) {
  const svg = svgCreate(parent, {
    w: '100%',
    h: '100%',
    display: 'block',
    overflow: 'visible'
  }, {
    viewBox: '0 0 100 100'
  });

  let shapeEl;
  let points = Array.isArray(shape) ? shape : svgPolyClipPoints(shape);

  if (shape === 'circle') {
    shapeEl = svgCircle(svg, 50, 50, 48, styles);
  } else if (points) {
    //shapeEl = svgPolygon(svg, points, styles);
    const strokeWidth = Number(styles.thickness ?? styles.strokeWidth ?? 0);
    shapeEl = svgPolygon(svg, svgInsetPoints(points, strokeWidth), styles);
  } else if (PolyClips[shape]) {
    // Handles CSS shapes such as inset(...).
    svg.style.clipPath = PolyClips[shape];
    shapeEl = svgRect(svg, 0, 0, 100, 100, styles);
  } else {
    shapeEl = svgRect(svg, 2, 2, 96, 96, styles, { rx: 18, ry: 18 });
  }

  return svg;
}

























//#endregion

function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;
  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror'))
      throw new Error('svgFitContent: invalid SVG content.');
  }

  const shape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(shape, box, shapeEl)
    : { box, shape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const words = text.split(/\s+/).filter(Boolean);
  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Math.max(0, Number(opts.padding ?? 8));
  const minSize = Math.max(1, Math.floor(Number(opts.minFontSize ?? 10)));
  const maxSize = Math.max(minSize, Math.floor(Number(opts.fontSize ?? 48)));
  const lineRatio = Math.max(0.8, Number(opts.lineHeight ?? 1.15));
  const baseY = area.box.y + area.box.height / 2 + Number(opts.textOffsetY ?? 0);
  const ctx = document.createElement('canvas').getContext('2d');
  const fitAlgorithm = opts.fitAlgorithm ?? opts.fitMethod ?? 'balanced';
  const flowMode = ['flow', 'hourglass', 'original', 'greedy'].includes(fitAlgorithm);
  let best = null;

  // Largest font wins. At that size, search vertical placement and all
  // possible whole-word line groupings, then choose the most balanced fit.
  for (let size = maxSize; size >= minSize && !best; size--) {
    const lineHeight = size * lineRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    if (flowMode) {
      const flow = svgFlowLayout(text, ctx, area.box, area.shape, padding, lineHeight, size);
      if (flow) best = { lines: flow.lines, ys: flow.ys, size, lineHeight, centerY: area.box.y + area.box.height / 2 };
      continue;
    }
    const maxLines = Math.min(words.length,
      Math.floor((area.box.height - 2 * padding) / lineHeight));
    const maxShift = Math.max(0, (area.box.height - 2 * padding - size) / 2);
    if (!maxLines) continue;

    let atSize = null;
    const shifts = new Set([0, -maxShift, maxShift]);
    const step = Math.max(1, Math.min(3, lineHeight / 5));
    for (let d = step; d < maxShift; d += step) {
      shifts.add(-d);
      shifts.add(d);
    }

    for (const shift of shifts) {
      const centerY = baseY + shift;
      for (let count = 1; count <= maxLines; count++) {
        const half = ((count - 1) * lineHeight + size) / 2;
        if (centerY - half < area.box.y + padding ||
          centerY + half > area.box.y + area.box.height - padding) continue;

        const wrap = fitAlgorithm === 'greedy' ? svgWrapForShapeGreedy : svgWrapForShape;
        const lines = wrap(text, ctx, area.box, area.shape,
          padding, lineHeight, count, centerY);
        if (!lines) continue;

        const score = lines.score + Math.abs(shift) * 0.0001;
        if (!atSize || score < atSize.score)
          atSize = { lines, score, size, lineHeight, centerY };
      }
    }
    best = atSize;
  }

  if (!best) return;
  const x = area.box.x + area.box.width / 2;
  const textEl = svgElem(parent, 'text', {
    fill: color, fontFamily: family, fontSize: best.size, fontWeight: weight,
    textAnchor: 'middle', dominantBaseline: 'central'
  }, {
    x, y: best.ys ? best.ys[0] : best.centerY - ((best.lines.length - 1) * best.lineHeight) / 2
  });

  best.lines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, best.ys ? { x, y: best.ys[i] } : { x, dy: i ? best.lineHeight : 0 });
    tspan.textContent = line;
  });
}

function svgWrapForShape(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (lineCount < 1 || lineCount > words.length) return null;

  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const widths = [];

  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    // Use the narrowest cross-section across each line's glyph height.
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    widths.push(Math.max(0, Math.min(...samples.map(yy =>
      svgWidthAt(shape, box, yy) - 2 * padding
    ))));
  }

  // Dynamic programming chooses contiguous whole-word groups for each row.
  const dp = Array.from({ length: lineCount + 1 },
    () => Array(words.length + 1).fill(null));
  dp[0][0] = { score: 0, lines: [] };

  for (let row = 0; row < lineCount; row++) {
    for (let start = 0; start < words.length; start++) {
      const prev = dp[row][start];
      if (!prev) continue;
      let line = '';

      for (let end = start; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > widths[row]) break;

        const slack = widths[row] ? (widths[row] - measured) / widths[row] : 1;
        const candidate = {
          score: prev.score + slack * slack,
          lines: [...prev.lines, line]
        };
        const next = end + 1;
        if (!dp[row + 1][next] || candidate.score < dp[row + 1][next].score)
          dp[row + 1][next] = candidate;
      }
    }
  }

  const result = dp[lineCount][words.length];
  if (!result) return null;
  result.lines.score = result.score;
  return result.lines;
}

function svgCenteredWidthAt(shape, box, y, cx) {
  if (shape.type === 'circle') {
    const dy = y - shape.cy;
    const half = Math.sqrt(Math.max(0, shape.r * shape.r - dy * dy));
    const left = shape.cx - half, right = shape.cx + half;
    return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
  }
  if (shape.points?.length) {
    const xs = [];
    for (let i = 0; i < shape.points.length; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[(i + 1) % shape.points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (cx >= xs[i] && cx <= xs[i + 1])
        return 2 * Math.min(cx - xs[i], xs[i + 1] - cx);
    }
    return 0;
  }
  const left = box.x, right = box.x + box.width;
  return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
}



function svgWrapForShapeGreedy(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || lineCount < 1) return null;
  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const lines = [];
  let wordIndex = 0, score = 0;
  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    const width = Math.max(0, Math.min(...samples.map(yy =>
      svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
    )));
    let line = '';
    while (wordIndex < words.length) {
      const candidate = line ? line + ' ' + words[wordIndex] : words[wordIndex];
      if (ctx.measureText(candidate).width > width) break;
      line = candidate;
      wordIndex++;
    }
    if (!line) return null;
    const slack = width ? (width - ctx.measureText(line).width) / width : 1;
    score += slack * slack;
    lines.push(line);
  }
  if (wordIndex !== words.length) return null;
  lines.score = score;
  return lines;
}


function svgFlowLayout(text, ctx, box, shape, padding, lineHeight, fontSize) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const firstY = box.y + padding + fontSize / 2;
  const lastY = box.y + box.height - padding - fontSize / 2;
  const slots = [];

  for (let y = firstY; y <= lastY; y += lineHeight) {
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    const width = Math.max(0, Math.min(...samples.map(yy =>
      svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
    )));
    slots.push({ y, width });
  }
  if (!slots.length) return null;

  const dp = Array.from({ length: slots.length + 1 }, () => new Map());
  dp[0].set(0, { score: 0, lines: [], ys: [] });
  function save(row, wordIndex, state) {
    const old = dp[row].get(wordIndex);
    if (!old || state.score < old.score) dp[row].set(wordIndex, state);
  }

  for (let row = 0; row < slots.length; row++) {
    for (const [wordIndex, state] of dp[row]) {
      save(row + 1, wordIndex, state); // Skip narrow rows around a waist.
      if (wordIndex >= words.length) continue;
      let line = '';

      for (let end = wordIndex; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > slots[row].width) break;
        const slack = slots[row].width
          ? (slots[row].width - measured) / slots[row].width : 1;
        save(row + 1, end + 1, {
          score: state.score + slack * slack,
          lines: [...state.lines, line],
          ys: [...state.ys, slots[row].y]
        });
      }
    }
  }

  const result = dp[slots.length].get(words.length);
  if (!result || !result.lines.length) return null;
  const meanY = result.ys.reduce((sum, y) => sum + y, 0) / result.ys.length;
  result.score += Math.abs(meanY - (box.y + box.height / 2)) / box.height * 0.01;
  return result;
}


function svgWrapForShapeGreedy(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || lineCount < 1) return null;
  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const lines = [];
  let wordIndex = 0, score = 0;
  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    const width = Math.max(0, Math.min(...samples.map(yy =>
      svgCenteredWidthAt(shape, box, yy, box.x + box.width / 2) - 2 * padding
    )));
    let line = '';
    while (wordIndex < words.length) {
      const candidate = line ? line + ' ' + words[wordIndex] : words[wordIndex];
      if (ctx.measureText(candidate).width > width) break;
      line = candidate;
      wordIndex++;
    }
    if (!line) return null;
    const slack = width ? (width - ctx.measureText(line).width) / width : 1;
    score += slack * slack;
    lines.push(line);
  }
  if (wordIndex !== words.length) return null;
  lines.score = score;
  return lines;
}


function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;
  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror'))
      throw new Error('svgFitContent: invalid SVG content.');
  }

  const shape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(shape, box, shapeEl)
    : { box, shape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const words = text.split(/\s+/).filter(Boolean);
  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Math.max(0, Number(opts.padding ?? 8));
  const minSize = Math.max(1, Math.floor(Number(opts.minFontSize ?? 10)));
  const maxSize = Math.max(minSize, Math.floor(Number(opts.fontSize ?? 48)));
  const lineRatio = Math.max(0.8, Number(opts.lineHeight ?? 1.15));
  const baseY = area.box.y + area.box.height / 2 + Number(opts.textOffsetY ?? 0);
  const ctx = document.createElement('canvas').getContext('2d');
  const fitAlgorithm = opts.fitAlgorithm ?? opts.fitMethod ?? 'balanced';
  let best = null;

  // Largest font wins. At that size, search vertical placement and all
  // possible whole-word line groupings, then choose the most balanced fit.
  for (let size = maxSize; size >= minSize && !best; size--) {
    const lineHeight = size * lineRatio;
    ctx.font = `${weight} ${size}px ${family}`;
    const maxLines = Math.min(words.length,
      Math.floor((area.box.height - 2 * padding) / lineHeight));
    const maxShift = Math.max(0, (area.box.height - 2 * padding - size) / 2);
    if (!maxLines) continue;

    let atSize = null;
    const shifts = new Set([0, -maxShift, maxShift]);
    const step = Math.max(1, Math.min(3, lineHeight / 5));
    for (let d = step; d < maxShift; d += step) {
      shifts.add(-d);
      shifts.add(d);
    }

    for (const shift of shifts) {
      const centerY = baseY + shift;
      for (let count = 1; count <= maxLines; count++) {
        const half = ((count - 1) * lineHeight + size) / 2;
        if (centerY - half < area.box.y + padding ||
          centerY + half > area.box.y + area.box.height - padding) continue;

        const wrap = fitAlgorithm === 'greedy' ? svgWrapForShapeGreedy : svgWrapForShape;
        const lines = wrap(text, ctx, area.box, area.shape,
          padding, lineHeight, count, centerY);
        if (!lines) continue;

        const score = lines.score + Math.abs(shift) * 0.0001;
        if (!atSize || score < atSize.score)
          atSize = { lines, score, size, lineHeight, centerY };
      }
    }
    best = atSize;
  }

  if (!best) return;
  const x = area.box.x + area.box.width / 2;
  const textEl = svgElem(parent, 'text', {
    fill: color, fontFamily: family, fontSize: best.size, fontWeight: weight,
    textAnchor: 'middle', dominantBaseline: 'central'
  }, {
    x, y: best.centerY - ((best.lines.length - 1) * best.lineHeight) / 2
  });

  best.lines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, { x, dy: i ? best.lineHeight : 0 });
    tspan.textContent = line;
  });
}

function svgWrapForShape(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (lineCount < 1 || lineCount > words.length) return null;

  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const widths = [];

  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    // Use the narrowest cross-section across each line's glyph height.
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    widths.push(Math.max(0, Math.min(...samples.map(yy =>
      svgWidthAt(shape, box, yy) - 2 * padding
    ))));
  }

  // Dynamic programming chooses contiguous whole-word groups for each row.
  const dp = Array.from({ length: lineCount + 1 },
    () => Array(words.length + 1).fill(null));
  dp[0][0] = { score: 0, lines: [] };

  for (let row = 0; row < lineCount; row++) {
    for (let start = 0; start < words.length; start++) {
      const prev = dp[row][start];
      if (!prev) continue;
      let line = '';

      for (let end = start; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > widths[row]) break;

        const slack = widths[row] ? (widths[row] - measured) / widths[row] : 1;
        const candidate = {
          score: prev.score + slack * slack,
          lines: [...prev.lines, line]
        };
        const next = end + 1;
        if (!dp[row + 1][next] || candidate.score < dp[row + 1][next].score)
          dp[row + 1][next] = candidate;
      }
    }
  }

  const result = dp[lineCount][words.length];
  if (!result) return null;
  result.lines.score = result.score;
  return result.lines;
}

function svgCenteredWidthAt(shape, box, y, cx) {
  if (shape.type === 'circle') {
    const dy = y - shape.cy;
    const half = Math.sqrt(Math.max(0, shape.r * shape.r - dy * dy));
    const left = shape.cx - half, right = shape.cx + half;
    return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
  }
  if (shape.points?.length) {
    const xs = [];
    for (let i = 0; i < shape.points.length; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[(i + 1) % shape.points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (cx >= xs[i] && cx <= xs[i + 1])
        return 2 * Math.min(cx - xs[i], xs[i + 1] - cx);
    }
    return 0;
  }
  const left = box.x, right = box.x + box.width;
  return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
}



//multiple fittins
function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;
  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror'))
      throw new Error('svgFitContent: invalid SVG content.');
  }

  const shape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(shape, box, shapeEl)
    : { box, shape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const words = text.split(/\s+/).filter(Boolean);
  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Math.max(0, Number(opts.padding ?? 8));
  const minSize = Math.max(1, Math.floor(Number(opts.minFontSize ?? 10)));
  const maxSize = Math.max(minSize, Math.floor(Number(opts.fontSize ?? 48)));
  const lineRatio = Math.max(0.8, Number(opts.lineHeight ?? 1.15));
  const baseY = area.box.y + area.box.height / 2 + Number(opts.textOffsetY ?? 0);
  const ctx = document.createElement('canvas').getContext('2d');
  let best = null;

  // Largest font wins. At that size, search vertical placement and all
  // possible whole-word line groupings, then choose the most balanced fit.
  for (let size = maxSize; size >= minSize && !best; size--) {
    const lineHeight = size * lineRatio;
    ctx.font = `${weight} ${size}px ${family}`;
    const maxLines = Math.min(words.length,
      Math.floor((area.box.height - 2 * padding) / lineHeight));
    const maxShift = Math.max(0, (area.box.height - 2 * padding - size) / 2);
    if (!maxLines) continue;

    let atSize = null;
    const shifts = new Set([0, -maxShift, maxShift]);
    const step = Math.max(1, Math.min(3, lineHeight / 5));
    for (let d = step; d < maxShift; d += step) {
      shifts.add(-d);
      shifts.add(d);
    }

    for (const shift of shifts) {
      const centerY = baseY + shift;
      for (let count = 1; count <= maxLines; count++) {
        const half = ((count - 1) * lineHeight + size) / 2;
        if (centerY - half < area.box.y + padding ||
          centerY + half > area.box.y + area.box.height - padding) continue;

        const lines = svgWrapForShape(text, ctx, area.box, area.shape,
          padding, lineHeight, count, centerY);
        if (!lines) continue;

        const score = lines.score + Math.abs(shift) * 0.0001;
        if (!atSize || score < atSize.score)
          atSize = { lines, score, size, lineHeight, centerY };
      }
    }
    best = atSize;
  }

  if (!best) return;
  const x = area.box.x + area.box.width / 2;
  const textEl = svgElem(parent, 'text', {
    fill: color, fontFamily: family, fontSize: best.size, fontWeight: weight,
    textAnchor: 'middle', dominantBaseline: 'central'
  }, {
    x, y: best.centerY - ((best.lines.length - 1) * best.lineHeight) / 2
  });

  best.lines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, { x, dy: i ? best.lineHeight : 0 });
    tspan.textContent = line;
  });
}

function svgWrapForShape(text, ctx, box, shape, padding, lineHeight, lineCount, centerY) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (lineCount < 1 || lineCount > words.length) return null;

  const fontSize = Number((ctx.font.match(/([\d.]+)px/) || [])[1]) || lineHeight / 1.15;
  const firstY = centerY - ((lineCount - 1) * lineHeight) / 2;
  const widths = [];

  for (let row = 0; row < lineCount; row++) {
    const y = firstY + row * lineHeight;
    // Use the narrowest cross-section across each line's glyph height.
    const samples = [y - fontSize * 0.38, y, y + fontSize * 0.38];
    widths.push(Math.max(0, Math.min(...samples.map(yy =>
      svgWidthAt(shape, box, yy) - 2 * padding
    ))));
  }

  // Dynamic programming chooses contiguous whole-word groups for each row.
  const dp = Array.from({ length: lineCount + 1 },
    () => Array(words.length + 1).fill(null));
  dp[0][0] = { score: 0, lines: [] };

  for (let row = 0; row < lineCount; row++) {
    for (let start = 0; start < words.length; start++) {
      const prev = dp[row][start];
      if (!prev) continue;
      let line = '';

      for (let end = start; end < words.length; end++) {
        line = line ? line + ' ' + words[end] : words[end];
        const measured = ctx.measureText(line).width;
        if (measured > widths[row]) break;

        const slack = widths[row] ? (widths[row] - measured) / widths[row] : 1;
        const candidate = {
          score: prev.score + slack * slack,
          lines: [...prev.lines, line]
        };
        const next = end + 1;
        if (!dp[row + 1][next] || candidate.score < dp[row + 1][next].score)
          dp[row + 1][next] = candidate;
      }
    }
  }

  const result = dp[lineCount][words.length];
  if (!result) return null;
  result.lines.score = result.score;
  return result.lines;
}

function svgCenteredWidthAt(shape, box, y, cx) {
  if (shape.type === 'circle') {
    const dy = y - shape.cy;
    const half = Math.sqrt(Math.max(0, shape.r * shape.r - dy * dy));
    const left = shape.cx - half, right = shape.cx + half;
    return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
  }
  if (shape.points?.length) {
    const xs = [];
    for (let i = 0; i < shape.points.length; i++) {
      const [x1, y1] = shape.points[i];
      const [x2, y2] = shape.points[(i + 1) % shape.points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (cx >= xs[i] && cx <= xs[i + 1])
        return 2 * Math.min(cx - xs[i], xs[i + 1] - cx);
    }
    return 0;
  }
  const left = box.x, right = box.x + box.width;
  return cx >= left && cx <= right ? 2 * Math.min(cx - left, right - cx) : 0;
}

//some other one
function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, box);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;
  const ctx = document.createElement('canvas').getContext('2d');
  const shape = svgTextShapeInfo(shapeEl);

  let fittedLines;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    // Recalculate line widths using the expected vertical positions.
    for (let pass = 0; pass < 10; pass++) {
      lines = svgWrapForShape(
        text, ctx, box, shape, padding, lineHeight, lineCount, breakWords
      );

      if (!lines) break;
      if (lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    // Verify wrapping once more using the actual line count.
    lines = svgWrapForShape(
      text, ctx, box, shape, padding, lineHeight, lines.length, breakWords
    );

    if (!lines || lines.length * lineHeight > box.height - padding * 2) continue;
    // if (!lines) continue;

    // const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
    // const lastY = centerY + ((lines.length - 1) * lineHeight) / 2;
    // const textTop = firstY - size / 2;
    // const textBottom = lastY + size / 2;

    // if (
    //   textTop < box.y + padding ||
    //   textBottom > box.y + box.height - padding
    // ) {
    //   continue; // Try a smaller font size.
    // }
    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2 + Number(opts.textOffsetY ?? fittedSize * 0.08);

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: centerX,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: centerX,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}
function svgWrapForShape(
  text,
  ctx,
  box,
  shape,
  padding,
  lineHeight,
  lineCount,
  breakWords = true
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const y = box.y + box.height / 2 +
      (lineIndex - (lineCount - 1) / 2) * lineHeight;
    return Math.max(0, svgWidthAt(shape, box, y) - 2 * padding);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      // The word itself does not fit on an empty line.
      if (!breakWords) return null;

      // Split only as much of the word as fits, then continue on a new line.
      let cut = remaining.length;
      while (cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null; // Even one character cannot fit at this font size.
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines;
}



//#region svg
//version with optional fitUsingCircle
function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' ||
      source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  const originalShape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(originalShape, box, shapeEl)
    : { box, shape: originalShape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;
  const ctx = document.createElement('canvas').getContext('2d');

  let fittedLines = null;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    for (let pass = 0; pass < 12; pass++) {
      lines = svgWrapForShape(
        text, ctx, area.box, area.shape, padding,
        lineHeight, lineCount, breakWords, 0
      );

      if (!lines || lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    lines = svgWrapForShape(
      text, ctx, area.box, area.shape, padding,
      lineHeight, lines.length, breakWords, 0
    );

    if (!lines || lines.length * lineHeight > area.box.height - padding * 2) {
      continue;
    }

    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const centerX = area.box.x + area.box.width / 2;
  const centerY = area.box.y + area.box.height / 2 +
    Number(opts.textOffsetY ?? 0);

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: centerX,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: centerX,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}
function svgWrapForShape(
  text,
  ctx,
  box,
  shape,
  padding,
  lineHeight,
  lineCount,
  breakWords = true,
  centerOffsetY = 0
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const y = box.y + box.height / 2 + centerOffsetY +
      (lineIndex - (lineCount - 1) / 2) * lineHeight;

    return Math.max(0, svgWidthAt(shape, box, y) - 2 * padding);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      // Keep words intact when breakWords is false.
      if (!breakWords) return null;

      // Otherwise split the word into the largest fitting chunks.
      let cut = remaining.length;
      while (
        cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available
      ) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null;
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines;
}

//version with optional bottomUp
function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' ||
      source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  const shape = svgTextShapeInfo(shapeEl);
  const area = opts.fitUsingCircle
    ? svgInscribedCircleArea(shape, box, shapeEl)
    : { box, shape, svgBox: box };

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, area.svgBox);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;
  const topDown = opts.topDown ?? true;
  const offsetY = Number(opts.textOffsetY ?? 0);
  const ctx = document.createElement('canvas').getContext('2d');

  let fittedLines = null;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    for (let pass = 0; pass < 12; pass++) {
      lines = svgWrapForShape(
        text, ctx, area.box, area.shape, padding,
        lineHeight, lineCount, breakWords, topDown
      );

      if (!lines || lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    // Recheck using the final line count.
    lines = svgWrapForShape(
      text, ctx, area.box, area.shape, padding,
      lineHeight, lines.length, breakWords, topDown
    );

    if (!lines) continue;

    const centerY = area.box.y + area.box.height / 2 + offsetY;
    const halfTextHeight =
      ((lines.length - 1) * lineHeight + size) / 2;

    if (
      centerY - halfTextHeight < area.box.y + padding ||
      centerY + halfTextHeight > area.box.y + area.box.height - padding
    ) {
      continue;
    }

    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const centerX = area.box.x + area.box.width / 2;
  const centerY = area.box.y + area.box.height / 2 + offsetY;

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: centerX,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: centerX,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}

function svgWrapForShape(
  text,
  ctx,
  box,
  shape,
  padding,
  lineHeight,
  lineCount,
  breakWords = true,
  topDown = true
) {
  let words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  if (!topDown) words = words.reverse();

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const row = lineIndex - (lineCount - 1) / 2;
    const y = box.y + box.height / 2 + (topDown ? row : -row) * lineHeight;
    return Math.max(0, svgWidthAt(shape, box, y) - 2 * padding);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      if (!breakWords) return null;

      let cut = remaining.length;
      while (
        cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available
      ) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null;
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);

  if (!topDown) {
    return lines
      .reverse()
      .map(line => line.split(/\s+/).reverse().join(' '));
  }

  return lines;
}





function _svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, box);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;

  const ctx = document.createElement('canvas').getContext('2d');
  const shape = svgTextShapeInfo(shapeEl);
  const middleY = box.y + box.height / 2;
  const centerY = (opts.gravityCenter === false ? middleY : svgGravityCenterY(shape, box)) + Number(opts.textOffsetY ?? 0);
  const centerOffsetY = centerY - middleY;

  let fittedLines = null;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    // Recalculate wrapping as the number and vertical positions of lines change.
    for (let pass = 0; pass < 12; pass++) {
      lines = svgWrapForShape(
        text, ctx, box, shape, padding, lineHeight, lineCount,
        breakWords, centerOffsetY
      );

      if (!lines) break;
      if (lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    // Confirm the lines still fit using the final line count.
    lines = svgWrapForShape(
      text, ctx, box, shape, padding, lineHeight, lines.length,
      breakWords, centerOffsetY
    );

    //if (!lines || lines.length * lineHeight > box.height - padding * 2) { continue; }
    if (!lines) continue;

    const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
    const lastY = centerY + ((lines.length - 1) * lineHeight) / 2;
    const textTop = firstY - size / 2;
    const textBottom = lastY + size / 2;

    if (
      textTop < box.y + padding ||
      textBottom > box.y + box.height - padding
    ) {
      continue; // Try a smaller font size.
    }

    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: box.x + box.width / 2,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: box.x + box.width / 2,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}

function _svgWrapForShape(
  text, ctx, box, shape, padding, lineHeight, lineCount,
  breakWords = true, centerOffsetY = 0
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const y = box.y + box.height / 2 + centerOffsetY +
      (lineIndex - (lineCount - 1) / 2) * lineHeight;
    return Math.max(0, svgWidthAt(shape, box, y) - padding * 2);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      if (!breakWords) return null;

      let cut = remaining.length;
      while (cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null;
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines;
}

function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, box);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;
  const ctx = document.createElement('canvas').getContext('2d');
  const shape = svgTextShapeInfo(shapeEl);

  let fittedLines;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    // Recalculate line widths using the expected vertical positions.
    for (let pass = 0; pass < 10; pass++) {
      lines = svgWrapForShape(
        text, ctx, box, shape, padding, lineHeight, lineCount, breakWords
      );

      if (!lines) break;
      if (lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    // Verify wrapping once more using the actual line count.
    lines = svgWrapForShape(
      text, ctx, box, shape, padding, lineHeight, lines.length, breakWords
    );

    if (!lines || lines.length * lineHeight > box.height - padding * 2) continue;
    // if (!lines) continue;

    // const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
    // const lastY = centerY + ((lines.length - 1) * lineHeight) / 2;
    // const textTop = firstY - size / 2;
    // const textBottom = lastY + size / 2;

    // if (
    //   textTop < box.y + padding ||
    //   textBottom > box.y + box.height - padding
    // ) {
    //   continue; // Try a smaller font size.
    // }
    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2 + Number(opts.textOffsetY ?? fittedSize * 0.08);

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: centerX,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: centerX,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}
function svgWrapForShape(
  text,
  ctx,
  box,
  shape,
  padding,
  lineHeight,
  lineCount,
  breakWords = true
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const y = box.y + box.height / 2 +
      (lineIndex - (lineCount - 1) / 2) * lineHeight;
    return Math.max(0, svgWidthAt(shape, box, y) - 2 * padding);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      // The word itself does not fit on an empty line.
      if (!breakWords) return null;

      // Split only as much of the word as fits, then continue on a new line.
      let cut = remaining.length;
      while (cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null; // Even one character cannot fit at this font size.
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines;
}



function svgFitContent(parent, content, box, shapeEl, opts = {}) {
  let source = content;

  if (typeof source === 'string' && /^\s*<svg[\s>]/i.test(source)) {
    source = new DOMParser()
      .parseFromString(source, 'image/svg+xml')
      .documentElement;

    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('svgFitContent: invalid SVG content.');
    }
  }

  if (source?.nodeType === 1 && source.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, source, box);
    return;
  }

  const text = String(content).trim();
  if (!text) return;

  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight ?? 700;
  const color = opts.fg || opts.color || '#1e293b';
  const padding = Number(opts.padding ?? 8);
  const minSize = Number(opts.minFontSize ?? 10);
  const maxSize = Number(opts.fontSize ?? 48);
  const lineHeightRatio = Number(opts.lineHeight ?? 1.15);
  const breakWords = opts.breakWords ?? true;
  const ctx = document.createElement('canvas').getContext('2d');
  const shape = svgTextShapeInfo(shapeEl);

  let fittedLines;
  let fittedSize;
  let fittedLineHeight;

  for (let size = maxSize; size >= minSize; size--) {
    const lineHeight = size * lineHeightRatio;
    ctx.font = `${weight} ${size}px ${family}`;

    let lineCount = 1;
    let lines = null;

    // Recalculate line widths using the expected vertical positions.
    for (let pass = 0; pass < 10; pass++) {
      lines = svgWrapForShape(
        text, ctx, box, shape, padding, lineHeight, lineCount, breakWords
      );

      if (!lines) break;
      if (lines.length === lineCount) break;
      lineCount = lines.length;
    }

    if (!lines) continue;

    // Verify wrapping once more using the actual line count.
    lines = svgWrapForShape(
      text, ctx, box, shape, padding, lineHeight, lines.length, breakWords
    );

    //if (!lines || lines.length * lineHeight > box.height - padding * 2) continue;
    if (!lines) continue;

    const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
    const lastY = centerY + ((lines.length - 1) * lineHeight) / 2;
    const textTop = firstY - size / 2;
    const textBottom = lastY + size / 2;

    if (
      textTop < box.y + padding ||
      textBottom > box.y + box.height - padding
    ) {
      continue; // Try a smaller font size.
    }
    fittedLines = lines;
    fittedSize = size;
    fittedLineHeight = lineHeight;
    break;
  }

  if (!fittedLines) return;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2 + Number(opts.textOffsetY ?? fittedSize * 0.08);

  const textEl = svgElem(parent, 'text', {
    fill: color,
    fontFamily: family,
    fontSize: fittedSize,
    fontWeight: weight,
    textAnchor: 'middle',
    dominantBaseline: 'central'
  }, {
    x: centerX,
    y: centerY - ((fittedLines.length - 1) * fittedLineHeight) / 2
  });

  fittedLines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: centerX,
      dy: i === 0 ? 0 : fittedLineHeight
    });
    tspan.textContent = line;
  });
}
function svgWrapForShape(
  text,
  ctx,
  box,
  shape,
  padding,
  lineHeight,
  lineCount,
  breakWords = true
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let line = '';

  function maxWidthAt(lineIndex) {
    const y = box.y + box.height / 2 +
      (lineIndex - (lineCount - 1) / 2) * lineHeight;
    return Math.max(0, svgWidthAt(shape, box, y) - 2 * padding);
  }

  for (const word of words) {
    let remaining = word;

    while (remaining) {
      const available = maxWidthAt(lines.length);
      const candidate = line ? `${line} ${remaining}` : remaining;

      if (ctx.measureText(candidate).width <= available) {
        line = candidate;
        remaining = '';
        continue;
      }

      if (line) {
        lines.push(line);
        line = '';
        continue;
      }

      // The word itself does not fit on an empty line.
      if (!breakWords) return null;

      // Split only as much of the word as fits, then continue on a new line.
      let cut = remaining.length;
      while (cut > 1 &&
        ctx.measureText(remaining.slice(0, cut)).width > available) {
        cut--;
      }

      if (ctx.measureText(remaining.slice(0, cut)).width > available) {
        return null; // Even one character cannot fit at this font size.
      }

      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines;
}
function svgGravityCenterY(shape, box, sections = 32) {
  const sectionHeight = box.height / sections;
  let totalArea = 0;
  let weightedY = 0;

  for (let i = 0; i < sections; i++) {
    const y = box.y + (i + 0.5) * sectionHeight;
    const area = svgWidthAt(shape, box, y) * sectionHeight;

    totalArea += area;
    weightedY += y * area;
  }

  return totalArea ? weightedY / totalArea : box.y + box.height / 2;
}


function _svgFitContent(parent, content, box, shapeEl, opts = {}) {
  if (content?.nodeType === 1 && content.tagName.toLowerCase() === 'svg') {
    svgFitSvg(parent, content, box);
    return;
  }

  if (typeof content === 'string' && /^\s*<svg[\s>]/i.test(content)) {
    const source = new DOMParser().parseFromString(content, 'image/svg+xml').documentElement;
    if (source.tagName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('Invalid SVG content.');
    }
    svgFitSvg(parent, source, box);
    return;
  }

  const text = String(content);
  const family = opts.fontFamily || 'system-ui, sans-serif';
  const weight = opts.fontWeight || 700;
  const color = opts.fg || opts.color || '#1e293b';
  const ctx = document.createElement('canvas').getContext('2d');
  const shapeInfo = svgTextShapeInfo(shapeEl);
  const padding = opts.padding ?? 8;
  const maxSize = opts.fontSize ?? 48;
  const minSize = opts.minFontSize ?? 10;

  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lineHeight = size * (opts.lineHeight ?? 1.15);
    let guess = 1;
    let lines = [];

    // Rewrap using each line's actual vertical position in the shape.
    for (let pass = 0; pass < 4; pass++) {
      lines = svgWrapForShape(text, ctx, box, shapeInfo, padding, lineHeight, guess, opts.breakWords ?? true);
      //if (lines.length === guess) break;
      if (!lines) break;
      guess = lines.length;
    }

    if (lines.length * lineHeight <= box.height - padding * 2) {
      const textEl = svgElem(parent, 'text', {
        fill: color,
        fontFamily: family,
        fontSize: size,
        fontWeight: weight,
        textAnchor: 'middle',
        dominantBaseline: 'middle'
      }, {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2 - ((lines.length - 1) * lineHeight) / 2 + (opts.textOffsetY ?? size * 0.08)
        //y: box.y + box.height / 2 - ((lines.length - 1) * lineHeight) / 2
      });

      lines.forEach((line, i) => {
        svgElem(textEl, 'tspan', {}, {
          x: box.x + box.width / 2,
          dy: i === 0 ? 0 : lineHeight
        }).textContent = line;
      });
      return;
    }
  }
}
function _svgWrapForShape(text, ctx, box, shape, padding, lineHeight, lineCount, breakWords) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  if (breakWords === undefined) breakWords = words.length <= 1;
  let line = '';

  for (const word of words) {
    const y = box.y + box.height / 2 +
      (lines.length - (lineCount - 1) / 2) * lineHeight;
    const maxWidth = Math.max(0, svgWidthAt(shape, box, y) - padding * 2);
    const candidate = line ? `${line} ${word}` : word;

    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;

      // Break an overlong word into characters if needed.
      while (line && ctx.measureText(line).width > maxWidth) {
        let cut = line.length;
        while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}



function svgContentIn(shapeEl, content, styles = {}, opts = {}) {
  mStyle(shapeEl, styles);

  const svg = shapeEl.ownerSVGElement;
  if (!svg) throw new Error('svgContentIn: shape must be inside an <svg>.');

  const box = shapeEl.getBBox();
  const clipId = getUID('clip');

  if (!shapeEl.id) shapeEl.id = getUID('shape');

  // Clip the added content to the existing shape.
  const clip = svgElem(null, 'clipPath', {}, {
    id: clipId,
    clipPathUnits: 'userSpaceOnUse'
  });
  const clipShape = shapeEl.cloneNode(false);
  clipShape.removeAttribute('id');
  clipShape.removeAttribute('transform');
  clip.appendChild(clipShape);
  svgAddDef(svg, clip);

  const group = svgElem(shapeEl.parentNode, 'g', {}, {
    'clip-path': `url(#${clipId})`,
    transform: shapeEl.getAttribute('transform') || ''
  });

  if (isSvgValue(content)) {
    svgBoxAddSvg(group, content, box);
  } else {
    svgBoxAddText(group, content, box, shapeEl, opts.contentStyles || {}, opts);
  }

  return group;
}

function svgShapeBox(shapeName, content, parent, styles = {}, opts = {}) {
  const svg = svgCreate(parent, {
    w: opts.w ?? 100,
    h: opts.h ?? 100,
    display: 'block',
    overflow: 'visible'
  }, {
    viewBox: opts.viewBox || '0 0 100 100'
  });

  let shape;
  const points = Array.isArray(shapeName)
    ? shapeName
    : svgPolyClipPoints(PolyClips[shapeName]);

  if (shapeName === 'circle') {
    shape = svgCircle(svg, 50, 50, 48, styles, {
      id: getUID('shape')
    });
  } else if (points) {
    shape = svgPolygon(svg, points, styles, {
      id: getUID('shape')
    });
  } else if (PolyClips[shapeName]) {
    // Supports CSS clip shapes such as inset(...).
    svg.style.clipPath = PolyClips[shapeName];
    shape = svgRect(svg, 2, 2, 96, 96, styles, {
      id: getUID('shape')
    });
  } else {
    shape = svgRect(svg, 2, 2, 96, 96, styles, {
      id: getUID('shape'),
      rx: 18,
      ry: 18
    });
  }

  svgContentIn(shape, content, {}, opts);
  return svg;
}

function svgBoxAddText(parent, value, box, shape, styles = {}, opts = {}) {
  const text = String(value);
  const family = styles.fontFamily || 'system-ui, sans-serif';
  const weight = styles.fontWeight || 700;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let size = opts.fontSize || 48;
  const minSize = opts.minFontSize || 10;
  const lineHeight = opts.lineHeight || 1.15;
  let lines;

  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = svgWrapLines(text, ctx, box, shape, size, lineHeight);
    if (lines.length * size * lineHeight <= box.height * 0.82) break;
    size *= 0.9;
  }
  size = Math.max(size, minSize);

  const lineStep = size * lineHeight;
  const startY = box.y + box.height / 2 - (lines.length - 1) * lineStep / 2;

  const textEl = svgElem(parent, 'text', {
    fill: styles.fill || styles.fg || '#1e293b',
    fontFamily: family,
    fontSize: size,
    fontWeight: weight
  }, {
    x: box.x + box.width / 2,
    y: startY,
    'text-anchor': 'middle',
    'dominant-baseline': 'central'
  });

  lines.forEach((line, i) => {
    const tspan = svgElem(textEl, 'tspan', {}, {
      x: box.x + box.width / 2,
      dy: i === 0 ? 0 : lineStep
    });
    tspan.textContent = line;
  });
}

function svgWrapLines(text, ctx, box, shape, fontSize, lineHeight) {
  const words = text.trim().split(/\s+/);
  const centerY = box.y + box.height / 2;
  const step = fontSize * lineHeight;
  let lines = [''];

  // Iterate because the available width depends on each line's vertical position.
  for (let pass = 0; pass < 4; pass++) {
    const count = Math.max(1, lines.length);
    const next = [''];

    for (const word of words) {
      let i = next.length - 1;
      const y = centerY + (i - (count - 1) / 2) * step;
      const maxWidth = svgShapeWidthAt(shape, box, y) - 8;
      const candidate = next[i] ? `${next[i]} ${word}` : word;

      if (ctx.measureText(candidate).width <= maxWidth) {
        next[i] = candidate;
      } else {
        next.push(word);
      }
    }

    lines = next.filter(Boolean);
  }
  return lines;
}

function svgShapeWidthAt(shape, box, y) {
  const tag = shape.tagName.toLowerCase();

  if (tag === 'circle') {
    const cx = Number(shape.getAttribute('cx') || box.x + box.width / 2);
    const cy = Number(shape.getAttribute('cy') || box.y + box.height / 2);
    const r = Number(shape.getAttribute('r') || Math.min(box.width, box.height) / 2);
    const dy = y - cy;
    return Math.abs(dy) >= r ? 0 : 2 * Math.sqrt(r * r - dy * dy);
  }

  if (tag === 'polygon') {
    const points = svgReadPoints(shape.getAttribute('points'));
    const xs = [];

    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
      }
    }

    return xs.length < 2 ? 0 : Math.max(...xs) - Math.min(...xs);
  }

  return box.width;
}

function svgPolyClipPoints(clip) {
  const match = clip?.match(/^polygon\((.+)\)$/i);
  if (!match) return null;

  return [...match[1].matchAll(/(-?[\d.]+)%\s+(-?[\d.]+)%/g)]
    .map(([, x, y]) => [Number(x), Number(y)]);
}

function svgReadPoints(value = '') {
  return value.trim().split(/\s+/).map(pair =>
    pair.split(/[,\s]+/).map(Number)
  );
}

function svgBoxAddSvg(parent, value, box) {
  const source = value?.nodeType === 1
    ? value
    : new DOMParser().parseFromString(value, 'image/svg+xml').documentElement;

  if (source.tagName.toLowerCase() !== 'svg') {
    throw new Error('Expected SVG markup or an <svg> element.');
  }

  const viewBox = (source.getAttribute('viewBox') || '0 0 100 100')
    .split(/[ ,]+/).map(Number);
  const [x, y, width, height] = viewBox;
  const scale = Math.min(box.width / width, box.height / height);
  const group = svgElem(parent, 'g', {}, {
    transform:
      `translate(${box.x + box.width / 2} ${box.y + box.height / 2}) ` +
      `scale(${scale}) translate(${-x - width / 2} ${-y - height / 2})`
  });

  for (const child of source.children) {
    if (child.tagName.toLowerCase() !== 'defs') {
      group.appendChild(document.importNode(child, true));
    }
  }
}











function svgElem(parent, tag, styles = {}, opts = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  const attrs = { ...opts };

  // applyOpts assigns className as a property; SVG elements should use the class attribute.
  if (attrs.className) {
    attrs.class = attrs.className;
    delete attrs.className;
  }

  applyOpts(el, attrs);
  mStyle(el, styles);
  if (parent) parent.appendChild(el);
  return el;
}

function svgCreate(parent, styles = {}, opts = {}) {
  return svgElem(parent, 'svg', styles, opts);
}

function svgAddDef(svg, elem) {
  let defs = [...svg.children].find(el => el.tagName === 'defs');
  if (!defs) defs = document.createElementNS(SVG_NS, 'defs');
  if (svg.firstElementChild !== defs) svg.prepend(defs);
  defs.appendChild(elem);
  return elem;
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

function svgRect(parent, x, y, width, height, styles = {}, opts = {}) {
  return svgElem(parent, 'rect', styles, { x, y, width, height, ...opts });
}

function svgCircle(parent, cx, cy, r, styles = {}, opts = {}) {
  return svgElem(parent, 'circle', styles, { cx, cy, r, ...opts });
}

function svgEllipse(parent, cx, cy, rx, ry, styles = {}, opts = {}) {
  return svgElem(parent, 'ellipse', styles, { cx, cy, rx, ry, ...opts });
}

function svgLine(parent, x1, y1, x2, y2, styles = {}, opts = {}) {
  return svgElem(parent, 'line', styles, { x1, y1, x2, y2, ...opts });
}

function svgPolygon(parent, points, styles = {}, opts = {}) {
  const pointsAttr = points.map(p => Array.isArray(p) ? p.join(',') : p).join(' ');
  return svgElem(parent, 'polygon', styles, { points: pointsAttr, ...opts });
}

function svgPath(parent, d, styles = {}, opts = {}) {
  return svgElem(parent, 'path', styles, { d, ...opts });
}

function svgText(parent, text, x, y, styles = {}, opts = {}) {
  const el = svgElem(parent, 'text', styles, { x, y, ...opts });
  el.textContent = text;
  return el;
}

function svgTextPath(parent, text, pathId, styles = {}, opts = {}) {
  const el = svgElem(parent, 'text', styles, opts);
  const textPath = svgElem(el, 'textPath', {}, { href: `#${pathId}` });
  textPath.textContent = text;
  return el;
}

function svgAddFilter(svg, filter) {
  return svgAddDef(svg, filter);
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

function svgClippedRect(parent, shape, styles = {}, opts = {}) {
  const clip = PolyClips[shape];
  if (!clip) throw new Error(`Unknown PolyClips shape: ${shape}`);
  return svgElem(parent, 'rect', { ...styles, clipPath: clip }, opts);
}

function svgUse(parent, id, x = 0, y = 0, styles = {}, opts = {}) {
  return svgElem(parent, 'use', styles, { href: `#${id}`, x, y, ...opts });
}

function svgMake(parent, tag, styles = {}, opts = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  mStyle(el, styles);
  applyOpts(el, opts);
  if (parent) parent.appendChild(el);
  return el;
}

function svgGroup(parent, styles = {}, opts = {}) {
  return svgMake(parent, 'g', styles, opts);
}

function svgLine(parent, x1, y1, x2, y2, styles = {}, opts = {}) {
  return svgMake(parent, 'line', styles, { x1, y1, x2, y2, ...opts });
}

function svgPolygon(parent, points, styles = {}, opts = {}) {
  const pointsAttr = points
    .map(p => Array.isArray(p) ? p.join(',') : p)
    .join(' ');
  return svgMake(parent, 'polygon', styles, { points: pointsAttr, ...opts });
}

function svgPath(parent, d, styles = {}, opts = {}) {
  return svgMake(parent, 'path', styles, { d, ...opts });
}

function svgEllipse(parent, cx, cy, rx, ry, styles = {}, opts = {}) {
  return svgMake(parent, 'ellipse', styles, { cx, cy, rx, ry, ...opts });
}

function svgTextPath(parent, text, pathId, styles = {}, opts = {}) {
  const textEl = svgMake(parent, 'text', styles, opts);
  const pathEl = svgMake(textEl, 'textPath', {}, { href: `#${pathId}` });
  pathEl.textContent = text;
  return textEl;
}

function svgAddClipPath(parent, shape, styles = {}, opts = {}) {
  const clip = svgMake(parent, 'rect', {
    ...styles,
    clipPath: PolyClips[shape]
  }, opts);
  return clip;
}

function svgAddFilter(svg, filter) {
  return svgAddDef(svg, filter);
}

function svgUse(parent, id, x = 0, y = 0, styles = {}, opts = {}) {
  return svgMake(parent, 'use', styles, {
    href: `#${id}`,
    x, y,
    ...opts
  });
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

function svgCircle(parent, cx, cy, r, styles = {}, opts = {}) {
  return svgElem(parent, 'circle', styles, { cx, cy, r, ...opts });
}

function svgClippedRect(parent, shape, styles = {}, opts = {}) {
  const clipPath = PolyClips[shape];
  if (!clipPath) throw new Error(`Unknown PolyClips shape: ${shape}`);
  return svgElem(parent, 'rect', { ...styles, clipPath }, opts);
}

function svgCreate(parent, styles = {}, opts = {}) {
  return svgElem(parent, 'svg', styles, opts);
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

function svgEllipse(parent, cx, cy, rx, ry, styles = {}, opts = {}) {
  return svgElem(parent, 'ellipse', styles, { cx, cy, rx, ry, ...opts });
}

function svgElem(parent, tag, styles = {}, opts = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  const attrs = { ...opts };

  if (attrs.className) {
    attrs.class = attrs.className;
    delete attrs.className;
  }

  applyOpts(el, attrs);
  mStyle(el, styles);
  if (parent) parent.appendChild(el);
  return el;
}

function svgGroup(parent, styles = {}, opts = {}) {
  return svgElem(parent, 'g', styles, opts);
}

function svgLine(parent, x1, y1, x2, y2, styles = {}, opts = {}) {
  return svgElem(parent, 'line', styles, { x1, y1, x2, y2, ...opts });
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

function svgPath(parent, d, styles = {}, opts = {}) {
  return svgElem(parent, 'path', styles, { d, ...opts });
}

function svgPolygon(parent, points, styles = {}, opts = {}) {
  const pointsAttr = points
    .map(p => Array.isArray(p) ? p.join(',') : p)
    .join(' ');
  return svgElem(parent, 'polygon', styles, { points: pointsAttr, ...opts });
}

function svgRect(parent, x, y, width, height, styles = {}, opts = {}) {
  return svgElem(parent, 'rect', styles, { x, y, width, height, ...opts });
}

function svgText(parent, text, x, y, styles = {}, opts = {}) {
  const el = svgElem(parent, 'text', styles, { x, y, ...opts });
  el.textContent = text;
  return el;
}

function svgTextPath(parent, text, pathId, styles = {}, opts = {}) {
  const textEl = svgElem(parent, 'text', styles, opts);
  const pathEl = svgElem(textEl, 'textPath', {}, { href: `#${pathId}` });
  pathEl.textContent = text;
  return textEl;
}

function svgUse(parent, id, x = 0, y = 0, styles = {}, opts = {}) {
  return svgElem(parent, 'use', styles, { href: `#${id}`, x, y, ...opts });
}

//#region dice
function showDice(n, m, dParent, boxStyles = {}, diceStyles = {}) {
  return new Promise((resolve) => {

    dParent = toElem(dParent);

    // 1. Reset container with flexbox layout & 3D perspective
    dParent = mDom(dParent, boxStyles);
    dParent = mDom(dParent, { p: 24, flexbox: 'center center 20 row wrap' });
    dParent.style.perspective = '1200px';

    // Standard pip geometry (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    function createFaceSVG(val) {
      /**
       * Generates clean SVG dice face markup.
       * Guarantees precise geometric centering using standard SVG text-anchor and dominant-baseline.
       */
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      let fillColor = diceStyles.fg ?? '#1e293b';
      console.log(fillColor);
      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${fillColor}" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="${fillColor}"
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // 2. Instantiate dice wrappers and inner 3D tumbling cards
    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      outer.style.width = '72px';
      outer.style.height = '72px';
      outer.style.position = 'relative';
      outer.style.perspective = '600px';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.position = 'relative';
      inner.style.transformStyle = 'preserve-3d';
      inner.style.borderRadius = '16px';
      inner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      inner.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
      outer.appendChild(inner);
      dParent.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        transY: 0
      });
    }

    // 3. Smooth cubic-bezier physics animation loop using cubic easing
    const duration = 1100; // ms
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
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Eased progress curves
      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      // Periodically update face values during rotation, slowing frequency near the end
      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      // Apply smooth transformation matrix to each die
      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        // Arc jump height that converts into a landing bounce
        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;

        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        d.el.style.transform = `
          translate3d(0, ${currentY}px, 0)
          rotateX(${currentRotX}deg) 
          rotateY(${currentRotY}deg) 
          rotateZ(${currentRotZ}deg)
          scale(${scale})
        `;
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset transform cleanup on completion
        diceList.forEach(d => {
          d.el.style.transform = 'none';
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}

function showDice(n, m, dParent, boxStyles = {}, diceStyles = {}) {
  return new Promise((resolve) => {

    dParent = toElem(dParent);

    // 1. Reset container with flexbox layout & 3D perspective
    dParent = mDom(dParent, boxStyles);
    dParent = mDom(dParent, { p: 24, flexbox: 'center center 20 row wrap' });
    dParent.style.perspective = '1200px';

    // Standard pip geometry (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    let dieFaceSvgId = 0;

    function createFaceSVG(val, dParent = null) {
      const id = `dieFace${++dieFaceSvgId}`;
      const gradientId = `${id}Grad`;
      const filterId = `${id}Bevel`;

      const svg = svgCreate(dParent, {
        w: '100%',
        h: '100%',
        display: 'block',
        overflow: 'visible'
      }, {
        viewBox: '0 0 100 100'
      });

      const gradient = svgLinearGradient(gradientId, [
        ['0%', '#ffffff'],
        ['100%', '#f1f5f9']
      ]);
      svgAddDef(svg, gradient);
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

      const fillColor = diceStyles.fg ?? '#1e293b';
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

    // 2. Instantiate dice wrappers and inner 3D tumbling cards
    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      outer.style.width = '72px';
      outer.style.height = '72px';
      outer.style.position = 'relative';
      outer.style.perspective = '600px';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.position = 'relative';
      inner.style.transformStyle = 'preserve-3d';
      inner.style.borderRadius = '16px';
      inner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      inner.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
      outer.appendChild(inner);
      dParent.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        transY: 0
      });
    }

    // 3. Smooth cubic-bezier physics animation loop using cubic easing
    const duration = 1100; // ms
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
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Eased progress curves
      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      // Periodically update face values during rotation, slowing frequency near the end
      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      // Apply smooth transformation matrix to each die
      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        // Arc jump height that converts into a landing bounce
        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;

        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        d.el.style.transform = `
          translate3d(0, ${currentY}px, 0)
          rotateX(${currentRotX}deg) 
          rotateY(${currentRotY}deg) 
          rotateZ(${currentRotZ}deg)
          scale(${scale})
        `;
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset transform cleanup on completion
        diceList.forEach(d => {
          d.el.style.transform = 'none';
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}

function _showDice(n, m, dParent) {
  return new Promise((resolve) => {
    // 1. Reset container with flexbox layout & 3D perspective
    dParent.innerHTML = '';
    dParent.style.display = 'flex';
    dParent.style.flexWrap = 'wrap';
    dParent.style.gap = '20px';
    dParent.style.justifyContent = 'center';
    dParent.style.alignItems = 'center';
    dParent.style.padding = '24px';
    dParent.style.perspective = '1200px';

    // Standard pip geometry (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Generates clean SVG dice face markup.
     * Guarantees precise geometric centering using standard SVG text-anchor and dominant-baseline.
     */
    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // 2. Instantiate dice wrappers and inner 3D tumbling cards
    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      outer.style.width = '72px';
      outer.style.height = '72px';
      outer.style.position = 'relative';
      outer.style.perspective = '600px';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.position = 'relative';
      inner.style.transformStyle = 'preserve-3d';
      inner.style.borderRadius = '16px';
      inner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      inner.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
      outer.appendChild(inner);
      dParent.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        transY: 0
      });
    }

    // 3. Smooth cubic-bezier physics animation loop using cubic easing
    const duration = 1100; // ms
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
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Eased progress curves
      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      // Periodically update face values during rotation, slowing frequency near the end
      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      // Apply smooth transformation matrix to each die
      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        // Arc jump height that converts into a landing bounce
        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;

        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        d.el.style.transform = `
          translate3d(0, ${currentY}px, 0)
          rotateX(${currentRotX}deg) 
          rotateY(${currentRotY}deg) 
          rotateZ(${currentRotZ}deg)
          scale(${scale})
        `;
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset transform cleanup on completion
        diceList.forEach(d => {
          d.el.style.transform = 'none';
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
function showDice(n, m, dParent, styles = {}) {
  return new Promise((resolve) => {

    dParent = toElem(dParent);


    // 1. Reset container with flexbox layout & 3D perspective
    dParent = mDom(dParent, { position: 'absolute', w100: true, top: 0, left: 0 });
    dParent = mDom(dParent, { bg: 'green', p: 24, flexbox: 'center center 20 row wrap' });
    // dParent.innerHTML = '';
    // dParent.style.display = 'flex';
    // dParent.style.flexWrap = 'wrap';
    // dParent.style.gap = '20px';
    // dParent.style.justifyContent = 'center';
    // dParent.style.alignItems = 'center';
    // dParent.style.padding = '24px';
    dParent.style.perspective = '1200px';

    // Standard pip geometry (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Generates clean SVG dice face markup.
     * Guarantees precise geometric centering using standard SVG text-anchor and dominant-baseline.
     */
    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // 2. Instantiate dice wrappers and inner 3D tumbling cards
    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      outer.style.width = '72px';
      outer.style.height = '72px';
      outer.style.position = 'relative';
      outer.style.perspective = '600px';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.position = 'relative';
      inner.style.transformStyle = 'preserve-3d';
      inner.style.borderRadius = '16px';
      inner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      inner.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
      outer.appendChild(inner);
      dParent.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        transY: 0
      });
    }

    // 3. Smooth cubic-bezier physics animation loop using cubic easing
    const duration = 1100; // ms
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
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Eased progress curves
      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      // Periodically update face values during rotation, slowing frequency near the end
      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      // Apply smooth transformation matrix to each die
      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        // Arc jump height that converts into a landing bounce
        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;

        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        d.el.style.transform = `
          translate3d(0, ${currentY}px, 0)
          rotateX(${currentRotX}deg) 
          rotateY(${currentRotY}deg) 
          rotateZ(${currentRotZ}deg)
          scale(${scale})
        `;
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset transform cleanup on completion
        diceList.forEach(d => {
          d.el.style.transform = 'none';
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
function _showDice(n, m, dParent) {
  return new Promise((resolve) => {
    // Retrieve parent DOM element if passed as an ID string
    const parent = typeof dParent === 'string' ? document.getElementById(dParent) : dParent;
    parent.innerHTML = '';

    // Set up container styling using STYLES shortcuts (flexRowWrap, p, center layout)
    mStyle(parent, {
      flexRowWrap: 20,
      justify: 'center',
      align: 'center',
      p: 24,
      perspective: 1200
    });

    // Standard pip positions (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Generates clean SVG dice face markup.
     */
    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // Create n dice structures using mDom and mStyle
    for (let i = 0; i < n; i++) {
      // Outer perspective card wrapper
      const outer = mDom(parent, {
        sz: 72,
        position: 'relative',
        perspective: 600
      });

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      // Inner 3D spinning container created via mDom
      const inner = mDom(outer, {
        sz: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        r: 16,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)'
      }, {
        html: createFaceSVG(Math.floor(Math.random() * m) + 1)
      });

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360
      });
    }

    // Smooth physics animation loop
    const duration = 1100;
    const startTime = performance.now();

    function cubicOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function bounceOut(t) {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;
        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        mStyle(d.el, {
          transform: `translate3d(0, ${currentY}px, 0) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) rotateZ(${currentRotZ}deg) scale(${scale})`
        });
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        diceList.forEach(d => {
          mStyle(d.el, { transform: 'none' });
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
function showDice(n, m, dParent, styles = {}) {
  /**
   * Rolls n dice of m faces with smooth 3D spatial rotation and centered digits.
   * 
   * @param {number} n - Number of dice to roll.
   * @param {number} m - Number of faces per die.
   * @param {HTMLElement|string} dParent - Container element (or element ID) where dice will be rendered.
   * @param {Object} [styles={}] - Optional custom styles for the individual dice (e.g. { sz: 80, bg: 'gold', r: 20 }).
   * @returns {Promise<number[]>} Resolves with the rolled values array when complete.
   */
  return new Promise((resolve) => {
    const parent = typeof dParent === 'string' ? document.getElementById(dParent) : dParent;
    parent.innerHTML = '';

    // Parent layout wrapper
    mStyle(parent, {
      bg: 'yellow',
      flexRowWrap: 20,
      justify: 'center',
      align: 'center',
      p: 24,
      perspective: 1200
    });

    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      let fillColor = styles.fg ?? '#1e293b';
      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${fillColor}" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="${fillColor}"
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      let dieBg = styles.bg ?? 'white';
      let stop2 = styles.bg2 ?? '#f1f5f9';
      let [stroke, thickness] = styles.border ? styles.border.split(' ') : ['#cbd5e1', 2];//let stroke
      console.log(stroke, thickness);
      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${dieBg}" />
              <stop offset="100%" stop-color="${stop2}" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="${stroke}" stroke-width="${thickness}}" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // Extract size from styles or default to 72px
    const dieSize = styles.sz || styles.w || 72;

    for (let i = 0; i < n; i++) {
      // Outer perspective wrapper matching the die size
      const outer = mDom(parent, {
        //bg:'grey',
        sz: dieSize,
        position: 'relative',
        perspective: 600
      });

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      // Default inner base styles merged with custom user styles
      //delete styles.bg;
      const innerStyle = {
        sz: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        r: 16,
        //overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
        ...styles
      };

      const inner = mDom(outer, innerStyle, {
        html: createFaceSVG(Math.floor(Math.random() * m) + 1)
      });

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360
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
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;
        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        mStyle(d.el, {
          transform: `translate3d(0, ${currentY}px, 0) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) rotateZ(${currentRotZ}deg) scale(${scale})`
        });
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        diceList.forEach(d => {
          mStyle(d.el, { transform: 'none' });
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
function _showDice(n, m, dParent) {
  return new Promise((resolve) => {
    // 1. Reset container with flexbox layout & 3D perspective
    dParent.innerHTML = '';
    dParent.style.display = 'flex';
    dParent.style.flexWrap = 'wrap';
    dParent.style.gap = '20px';
    dParent.style.justifyContent = 'center';
    dParent.style.alignItems = 'center';
    dParent.style.padding = '24px';
    dParent.style.perspective = '1200px';

    // Standard pip geometry (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Generates clean SVG dice face markup.
     * Guarantees precise geometric centering using standard SVG text-anchor and dominant-baseline.
     */
    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // 2. Instantiate dice wrappers and inner 3D tumbling cards
    for (let i = 0; i < n; i++) {
      const outer = document.createElement('div');
      outer.style.width = '72px';
      outer.style.height = '72px';
      outer.style.position = 'relative';
      outer.style.perspective = '600px';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.position = 'relative';
      inner.style.transformStyle = 'preserve-3d';
      inner.style.borderRadius = '16px';
      inner.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      inner.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
      outer.appendChild(inner);
      dParent.appendChild(outer);

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360,
        transY: 0
      });
    }

    // 3. Smooth cubic-bezier physics animation loop using cubic easing
    const duration = 1100; // ms
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
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      // Eased progress curves
      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      // Periodically update face values during rotation, slowing frequency near the end
      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      // Apply smooth transformation matrix to each die
      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        // Arc jump height that converts into a landing bounce
        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;

        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        d.el.style.transform = `
          translate3d(0, ${currentY}px, 0)
          rotateX(${currentRotX}deg) 
          rotateY(${currentRotY}deg) 
          rotateZ(${currentRotZ}deg)
          scale(${scale})
        `;
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset transform cleanup on completion
        diceList.forEach(d => {
          d.el.style.transform = 'none';
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
/**
 * Rolls n dice of m faces with smooth 3D spatial rotation and centered digits.
 * 
 * @param {number} n - Number of dice to roll.
 * @param {number} m - Number of faces per die.
 * @param {HTMLElement|string} dParent - Container element (or element ID) where dice will be rendered.
 * @param {Object} [styles={}] - Optional custom styles for the individual dice (e.g. { sz: 80, bg: 'gold', r: 20 }).
 * @returns {Promise<number[]>} Resolves with the rolled values array when complete.
 */
function showDice(n, m, dParent, styles = {}) {
  return new Promise((resolve) => {
    const parent = typeof dParent === 'string' ? document.getElementById(dParent) : dParent;
    parent.innerHTML = '';

    // Parent layout wrapper
    mStyle(parent, {
      flexRowWrap: 20,
      justify: 'center',
      align: 'center',
      p: 24,
      perspective: 1200
    });

    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // Extract size from styles or default to 72px
    const dieSize = styles.sz || styles.w || 72;

    for (let i = 0; i < n; i++) {
      // Outer perspective wrapper matching the die size
      const outer = mDom(parent, {
        sz: dieSize,
        position: 'relative',
        perspective: 600
      });

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      // Default inner base styles merged with custom user styles
      const innerStyle = {
        sz: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        r: 16,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
        ...styles
      };

      const inner = mDom(outer, innerStyle, {
        html: createFaceSVG(Math.floor(Math.random() * m) + 1)
      });

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360
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
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;
        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        mStyle(d.el, {
          transform: `translate3d(0, ${currentY}px, 0) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) rotateZ(${currentRotZ}deg) scale(${scale})`
        });
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        diceList.forEach(d => {
          mStyle(d.el, { transform: 'none' });
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}
/**
 * Rolls n dice of m faces with smooth 3D spatial rotation and centered digits,
 * using mDom and mStyle DOM/styling helpers.
 * 
 * @param {number} n - Number of dice to roll.
 * @param {number} m - Number of faces per die.
 * @param {HTMLElement|string} dParent - Container element (or element ID) where dice will be rendered.
 * @returns {Promise<number[]>} Resolves with the rolled values array when complete.
 */
function showDice(n, m, dParent) {
  return new Promise((resolve) => {
    // Retrieve parent DOM element if passed as an ID string
    const parent = typeof dParent === 'string' ? document.getElementById(dParent) : dParent;
    parent.innerHTML = '';

    // Set up container styling using STYLES shortcuts (flexRowWrap, p, center layout)
    mStyle(parent, {
      flexRowWrap: 20,
      justify: 'center',
      align: 'center',
      p: 24,
      perspective: 1200
    });

    // Standard pip positions (0-100 coordinate space)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Generates clean SVG dice face markup.
     */
    function createFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1e293b" />`)
          .join('');
      } else {
        const textStr = String(val);
        const fontSize = textStr.length >= 3 ? '32' : textStr.length === 2 ? '40' : '48';

        content = `
          <text x="50%" y="50%" 
                font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                fill="#1e293b" 
                text-anchor="middle" 
                dominant-baseline="central"
                alignment-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; overflow: visible;">
          <defs>
            <linearGradient id="dieFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f1f5f9" />
            </linearGradient>
            <filter id="subtleBevel" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1" />
            </filter>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="18" ry="18" 
                fill="url(#dieFaceGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#subtleBevel)" />
          ${content}
        </svg>
      `;
    }

    const diceList = [];
    const finalResults = [];

    // Create n dice structures using mDom and mStyle
    for (let i = 0; i < n; i++) {
      // Outer perspective card wrapper
      const outer = mDom(parent, {
        sz: 72,
        position: 'relative',
        perspective: 600
      });

      const targetValue = Math.floor(Math.random() * m) + 1;
      finalResults.push(targetValue);

      // Inner 3D spinning container created via mDom
      const inner = mDom(outer, {
        sz: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        r: 16,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)'
      }, {
        html: createFaceSVG(Math.floor(Math.random() * m) + 1)
      });

      diceList.push({
        el: inner,
        targetValue: targetValue,
        rotX: (Math.random() - 0.5) * 720,
        rotY: (Math.random() - 0.5) * 720,
        rotZ: (Math.random() - 0.5) * 360
      });
    }

    // Smooth physics animation loop
    const duration = 1100;
    const startTime = performance.now();

    function cubicOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function bounceOut(t) {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }

    let lastValChange = 0;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);

      const spinProgress = cubicOut(linearProgress);
      const bounceProgress = bounceOut(linearProgress);

      if (linearProgress < 0.85 && currentTime - lastValChange > 40 + linearProgress * 120) {
        diceList.forEach(d => {
          d.el.innerHTML = createFaceSVG(Math.floor(Math.random() * m) + 1);
        });
        lastValChange = currentTime;
      }

      diceList.forEach((d) => {
        if (linearProgress >= 0.85 && !d.isFinal) {
          d.isFinal = true;
          d.el.innerHTML = createFaceSVG(d.targetValue);
        }

        const currentRotX = d.rotX * (1 - spinProgress);
        const currentRotY = d.rotY * (1 - spinProgress);
        const currentRotZ = d.rotZ * (1 - spinProgress);

        const arcHeight = -45 * Math.sin(linearProgress * Math.PI);
        const bounceOffset = (1 - bounceProgress) * -15;
        const currentY = linearProgress < 0.7 ? arcHeight : bounceOffset;
        const scale = 1 + Math.sin(linearProgress * Math.PI) * 0.15;

        mStyle(d.el, {
          transform: `translate3d(0, ${currentY}px, 0) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) rotateZ(${currentRotZ}deg) scale(${scale})`
        });
      });

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        diceList.forEach(d => {
          mStyle(d.el, { transform: 'none' });
        });
        resolve(finalResults);
      }
    }

    requestAnimationFrame(animate);
  });
}

function _showDice(n, m, dParent) {
  return new Promise((resolve) => {
    // 1. Clear previous content and set up responsive flex container
    dParent.innerHTML = '';
    dParent.style.display = 'flex';
    dParent.style.flexWrap = 'wrap';
    dParent.style.gap = '16px';
    dParent.style.justifyContent = 'center';
    dParent.style.alignItems = 'center';
    dParent.style.padding = '20px';
    dParent.style.perspective = '1000px';

    // Ensure inject keyframe animations exist in document
    if (!document.getElementById('dice-anim-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'dice-anim-styles';
      styleEl.textContent = `
        @keyframes dieShake {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-12px) rotate(-8deg) scale(1.05); }
          50% { transform: translateY(6px) rotate(6deg) scale(0.98); }
          75% { transform: translateY(-4px) rotate(-3deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes dieSettle {
          0% { transform: scale(1.15) rotate(-5deg); }
          60% { transform: scale(0.95) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Standard 6-dot layouts mapped to SVG coordinates (unit scale 0-100)
    const pipPositions = {
      1: [[50, 50]],
      2: [[28, 28], [72, 72]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]],
      5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
    };

    /**
     * Renders SVG face content for a given face value.
     * Uses classic pips for m <= 6, and crisp modern typography for m > 6.
     */
    function createDieFaceSVG(val) {
      const isPipType = m <= 6 && pipPositions[val];
      let content = '';

      if (isPipType) {
        content = pipPositions[val]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#222222" />`)
          .join('');
      } else {
        content = `
          <text x="50" y="58" 
                font-family="system-ui, -apple-system, sans-serif" 
                font-size="${val > 99 ? '32' : val > 9 ? '40' : '48'}" 
                font-weight="700" 
                fill="#222222" 
                text-anchor="middle" 
                dominant-baseline="central">${val}</text>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
          <defs>
            <linearGradient id="dieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#ededed" />
            </linearGradient>
            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood flood-color="black" flood-opacity="0.15" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>
          <rect x="3" y="3" width="94" height="94" rx="18" ry="18" 
                fill="url(#dieGrad)" stroke="#dcdcdc" stroke-width="2.5" />
          <rect x="3" y="3" width="94" height="94" rx="18" ry="18" 
                fill="none" filter="url(#innerShadow)" />
          ${content}
        </svg>
      `;
    }

    const diceElements = [];
    const finalValues = [];

    // 2. Build DOM elements for all n dice
    for (let i = 0; i < n; i++) {
      const dieEl = document.createElement('div');
      dieEl.style.width = '68px';
      dieEl.style.height = '68px';
      dieEl.style.borderRadius = '14px';
      dieEl.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)';
      dieEl.style.cursor = 'pointer';
      dieEl.style.userSelect = 'none';
      dieEl.style.transformOrigin = 'center center';
      dieEl.style.animation = 'dieShake 0.18s infinite linear';

      // Pick final random value between 1 and m
      const finalVal = Math.floor(Math.random() * m) + 1;
      finalValues.push(finalVal);

      dieEl.innerHTML = createDieFaceSVG(Math.floor(Math.random() * m) + 1);
      dParent.appendChild(dieEl);

      diceElements.push({
        el: dieEl,
        finalVal: finalVal,
        settled: false
      });
    }

    // 3. Animate rapid face cycling with staggered deceleration per die
    const duration = 1200; // Total roll duration in ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;

      diceElements.forEach((die, idx) => {
        // Stagger stopping times across dice for sequential settling effect
        const dieStopTime = duration - (n - 1 - idx) * (Math.min(300 / n, 80));

        if (elapsed < dieStopTime) {
          // Rapidly cycle random faces while rolling
          const tempVal = Math.floor(Math.random() * m) + 1;
          die.el.innerHTML = createDieFaceSVG(tempVal);
        } else if (!die.settled) {
          // Freeze on final value and play landing pop animation
          die.settled = true;
          die.el.innerHTML = createDieFaceSVG(die.finalVal);
          die.el.style.animation = 'dieSettle 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
          die.el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        }
      });

      if (elapsed < duration + 100) {
        requestAnimationFrame(step);
      } else {
        resolve(finalValues);
      }
    }

    requestAnimationFrame(step);
  });
}

function _showDice(n, m, dParent) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  dParent.replaceChildren();

  const tray = mDom(dParent, {
    flexRowWrap: 16,
    justify: "center",
    align: "center",
    p: 20
  });

  const results = [];
  const edge = "#aebbd0";

  for (let i = 0; i < n; i++) {
    const result = 1 + Math.floor(Math.random() * m);
    results.push(result);

    const svg = `
      <svg viewBox="0 0 120 120" width="110" height="110"
           role="img" aria-label="Die showing ${result}">
        <path d="M60 8 L109 25 L109 82 L60 109 L11 82 L11 25 Z"
              fill="${edge}" stroke="${edge}" stroke-width="4"
              stroke-linejoin="round"/>
        <path d="M60 8 L109 25 L60 44 L11 25 Z"
              fill="#fff" stroke="${edge}" stroke-width="3"
              stroke-linejoin="round"/>
        <path d="M11 25 L60 44 L60 108 L11 82 Z"
              fill="#e3eaf5" stroke="${edge}" stroke-width="3"
              stroke-linejoin="round"/>
        <path d="M60 44 L109 25 L109 82 L60 108 Z"
              fill="#f8fafc" stroke="${edge}" stroke-width="3"
              stroke-linejoin="round"/>
        <text x="83" y="70" text-anchor="middle" dominant-baseline="central"
              fill="#18253a" font-family="system-ui, sans-serif"
              font-size="28" font-weight="800">${result}</text>
      </svg>`;

    mDom(tray, { sz: 110, center: true }, { html: svg });
  }

  return results;
}
function _showDice(n, m, dParent) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  dParent.replaceChildren();

  const tray = mDom(dParent, {
    flexRowWrap: 16,
    justify: "center",
    align: "center",
    p: 20
  });

  const results = [];
  const borderColor = "#ff0000";

  for (let i = 0; i < n; i++) {
    const result = 1 + Math.floor(Math.random() * m);
    results.push(result);

    const holder = mDom(tray, { sz: 110, center: true });
    const svg = mDom(holder, {}, {
      tag: "svg",
      viewBox: "0 0 120 120",
      role: "img",
      "aria-label": `Die showing ${result}`
    });

    svg.innerHTML = `
      <!-- Border-colored silhouette fills the joined corners -->
      <path
        d="M60 7 L111 25 L111 81 L60 109 L9 81 L9 25 Z"
        fill="${borderColor}"
        stroke="${borderColor}"
        stroke-width="4"
        stroke-linejoin="round"
      />

      <!-- Top face -->
      <path
        d="M60 9 L110 27 L60 46 L10 27 Z"
        fill="#ffffff"
        stroke="${borderColor}"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <!-- Left face -->
      <path
        d="M10 27 L60 46 L60 106 L10 82 Z"
        fill="#e3eaf5"
        stroke="${borderColor}"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <!-- Front face -->
      <path
        d="M60 46 L110 27 L110 82 L60 106 Z"
        fill="#f8fafc"
        stroke="${borderColor}"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <text
        x="84" y="70"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#18253a"
        font-family="system-ui, sans-serif"
        font-size="28"
        font-weight="800"
      >${result}</text>
    `;
  }

  return results;
}

function _showDice(n, m, dParent) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  const borderColor = "#aebbd0";
  dParent.replaceChildren();

  const tray = mDom(dParent, {
    flexRowWrap: 18,
    justify: "center",
    align: "center",
    perspective: "700px",
    p: 20
  });

  const results = [];
  const sides = [
    ["#f8fafc", "translateZ(32px)"],
    ["#dbe5f2", "rotateY(180deg) translateZ(32px)"],
    ["#c4d2e5", "rotateY(90deg) translateZ(32px)"],
    ["#e5edf7", "rotateY(-90deg) translateZ(32px)"],
    ["#ffffff", "rotateX(90deg) translateZ(32px)"],
    ["#aebed4", "rotateX(-90deg) translateZ(32px)"]
  ];

  for (let i = 0; i < n; i++) {
    const result = 1 + Math.floor(Math.random() * m);
    results.push(result);

    const holder = mDom(tray, { sz: 100, center: true });
    const cube = mDom(holder, {
      sz: 64,
      position: "relative",
      transform: "rotateX(-25deg) rotateY(35deg)",
      transformStyle: "preserve-3d",
      bg: borderColor,
      r: 8
    });

    sides.forEach(([faceColor, transform], faceIndex) => {
      const backing = mDom(cube, {
        sz: 64,
        position: "absolute",
        top: 0,
        left: 0,
        bg: borderColor,
        transformStyle: "preserve-3d",
        transform
      });

      mDom(backing, {
        position: "absolute",
        top: 2,
        left: 2,
        sz: 60,
        center: true,
        r: 8,
        bg: faceColor,
        fg: "#18253a",
        fw: "800",
        fontSize: 28,
        transform: "translateZ(1px)"
      }, { html: faceIndex === 0 ? result : "" });
    });
  }

  return results;
}
function _showDice(n, m, dParent) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  const borderColor = "#aebed4";
  dParent.replaceChildren();

  const tray = mDom(dParent, {
    flexRowWrap: 18,
    justify: "center",
    align: "center",
    perspective: "700px",
    p: 20
  });

  const results = [];

  for (let i = 0; i < n; i++) {
    const result = 1 + Math.floor(Math.random() * m);
    results.push(result);

    const holder = mDom(tray, { sz: 100, center: true });
    const cube = mDom(holder, {
      sz: 64,
      position: "relative",
      transform: "rotateX(-25deg) rotateY(35deg)",
      transformStyle: "preserve-3d",
      backgroundColor: borderColor,
      borderRadius: 8,
    });

    const sides = [
      ["#f8fafc", "translateZ(32px)"],
      ["#dbe5f2", "rotateY(180deg) translateZ(32px)"],
      ["#c4d2e5", "rotateY(90deg) translateZ(32px)"],
      ["#e5edf7", "rotateY(-90deg) translateZ(32px)"],
      ["#ffffff", "rotateX(90deg) translateZ(32px)"],
      ["#aebed4", "rotateX(-90deg) translateZ(32px)"]
    ];

    sides.forEach(([color, transform], sideIndex) => {
      mDom(cube, {
        sz: 64,
        position: "absolute",
        top: 0,
        left: 0,
        center: true,
        r: 8,
        bg: color,
        fg: "#18253a",
        fw: "800",
        fontSize: 28,
        border: `1px solid ${borderColor}`,
        backfaceVisibility: "hidden",
        transform
      }, { html: sideIndex === 0 ? result : "" });
    });
  }

  return results;
}
function _showDice(n, m, dParent) {
  dParent = toElem(dParent);
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  dParent.replaceChildren();

  const tray = mDom(dParent, {
    flexRowWrap: 18,
    justify: "center",
    align: "center",
    perspective: "700px",
    p: 20
  });

  const results = [];

  for (let i = 0; i < n; i++) {
    const result = 1 + Math.floor(Math.random() * m);
    results.push(result);

    const holder = mDom(tray, { sz: 100, center: true });
    const cube = mDom(holder, {
      sz: 64,
      position: "relative",
      transform: "rotateX(-15deg) rotateY(-18deg)",
      transformStyle: "preserve-3d"
    });

    const sides = [
      ["#f8fafc", "", "translateZ(32px)"],
      ["#dbe5f2", "", "rotateY(180deg) translateZ(32px)"],
      ["#c4d2e5", "", "rotateY(90deg) translateZ(32px)"],
      ["#e5edf7", "", "rotateY(-90deg) translateZ(32px)"],
      ["#ffffff", "", "rotateX(90deg) translateZ(32px)"],
      ["#aebed4", "", "rotateX(-90deg) translateZ(32px)"]
    ];

    sides.forEach(([color, , transform], sideIndex) => {
      const face = mDom(cube, {
        sz: 64,
        position: "absolute",
        top: 0,
        left: 0,
        center: true,
        r: 8,
        bg: color,
        fg: "#18253a",
        fw: "800",
        fontSize: 28,
        //border: "1px solid #8394ad",
        border: "1px solid red",
        backfaceVisibility: "hidden",
        transform
      }, { html: sideIndex === 0 ? result : "" });
    });
  }

  return results;
}
async function aniDice(n, m, easing = "linear", totalTime = 1400) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  const overlay = mDom(document.body, {
    position: "fixed", top: 0, right: 0, bottom: 0, left: 0,
    z: 99999, center: true,
    backgroundColor: "rgba(16,24,39,.75)"
  });

  const panel = mDom(overlay, {
    center: true, dir: "column", gap: 12, p: 24, r: 20,
    bg: "#1e3347", boxShadow: "0 16px 50px #0008"
  });

  const tray = mDom(panel, { flexRowWrap: 16 });
  const faceNames = [
    ["front", ""], ["back", "rotateY(180deg)"],
    ["right", "rotateY(90deg)"], ["left", "rotateY(-90deg)"],
    ["top", "rotateX(90deg)"], ["bottom", "rotateX(-90deg)"]
  ];

  const dice = Array.from({ length: n }, () => {
    const holder = mDom(tray, {
      width: 82, height: 82, center: true, perspective: "600px",
      filter: "drop-shadow(0 10px 8px #0008)"
    });

    const cube = mDom(holder, {
      sz: 64, position: "relative", transformStyle: "preserve-3d"
    });

    const faces = faceNames.map(([, rotation]) => {
      const face = mDom(cube, {
        position: "absolute", top: 0, left: 0, sz: 64,
        center: true, r: 12,
        border: "2px solid white",
        background: "linear-gradient(145deg, #fff, #b8c8df)",
        color: "#18253a", fontSize: 30, fw: "800",
        backfaceVisibility: "hidden",
        transform: `${rotation} translateZ(32px)`
      }, { html: "–" });

      return face;
    });
    return { faces };
    cube.animate(
      [
        { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)" },
        { transform: "rotateX(720deg) rotateY(1080deg) rotateZ(720deg)" }
      ],
      { duration: totalTime, easing, fill: "forwards" }
    );

    return { faces };
  });

  const results = await Promise.all(dice.map(({ faces }) =>
    new Promise(resolve => {
      const timer = setInterval(() => {
        const value = 1 + Math.floor(Math.random() * m);
        faces.forEach(face => { face.textContent = value; });
      }, 55);

      setTimeout(() => {
        clearInterval(timer);
        const result = 1 + Math.floor(Math.random() * m);
        faces.forEach(face => { face.textContent = result; });
        resolve(result);
      }, totalTime);
    })
  ));

  //setTimeout(() => overlay.remove(), 800);
  return results;
}
async function _aniDice(n, m, easing = "linear", totalTime = 1400) {
  const overlay = mDom(document.body, {
    position: "fixed", top: 0, right: 0, bottom: 0, left: 0,
    z: 99999, center: true,
    //backgroundColor: "rgba(255,24,39,.75)"
  });

  const panel = mDom(overlay, {
    center: true, dir: "column", gap: 12, p: 24, r: 20,
    bg: "#1e3347", boxShadow: "0 16px 50px #0008"
  });

  const tray = mDom(panel, { flexRowWrap: 16 });

  const dice = Array.from({ length: n }, () => {
    const die = mDom(tray, {
      center: true, sz: 72, r: 18,
      bg: "#eaf0fa", fg: "#18253a", fw: '800', fontSize: 36,
      border: "3px solid white",
      boxShadow: "inset 0 -5px #a5b5d0, 0 8px 14px #0006"
    }, { html: "–" });

    die.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(1080deg)" }],
      { duration: totalTime, easing, fill: "forwards" }
    );

    return die;
  });

  const results = await Promise.all(dice.map(die => new Promise(resolve => {
    const timer = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * m);
    }, 55);

    setTimeout(() => {
      clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * m);
      die.textContent = result;
      resolve(result);
    }, totalTime);
  })));

  //setTimeout(() => overlay.remove(), 800);
  return results;
}
async function _aniDice(n, m, easing = "linear", totalTime = 1400) {
  const overlay = mDom(document.body, {
    position: "fixed", inset: "0", zIndex: "99999",
    display: "grid", placeItems: "center",
    bg: "#101827bb"
  });

  const tray = mDom(overlay, {
    flexWrap: 16, padding: "24px", borderRadius: "20px",
    bg: "#1e3347", boxShadow: "0 16px 50px #0008"
  });

  const dice = Array.from({ length: n }, () => {
    const die = mDom(tray, {
      width: "72px", height: "72px", display: "grid", placeItems: "center",
      border: "3px solid white", borderRadius: "18px",
      background: "linear-gradient(145deg, white, #c9d7ef)",
      color: "#18253a", fontSize: "36px", fontWeight: "800",
      boxShadow: "inset 0 -5px #a5b5d0, 0 8px 14px #0006"
    }, { html: "–" });

    die.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(1440deg)" }],
      { duration: totalTime, easing, fill: "forwards" }
    );

    return die;
  });

  const results = await Promise.all(dice.map(die => new Promise(resolve => {
    const timer = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * m);
    }, 55);

    setTimeout(() => {
      clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * m);
      die.textContent = result;
      resolve(result);
    }, totalTime);
  })));

  setTimeout(() => overlay.remove(), 800);
  return results;
}
async function _aniDiceRoll(n, m, easing = "linear", totalTime = 1400) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }
  if (!Number.isFinite(totalTime) || totalTime < 1) {
    throw new RangeError("totalTime must be a positive number of milliseconds");
  }

  if (!document.getElementById("ani-dice-style")) {
    const style = document.createElement("style");
    style.id = "ani-dice-style";
    // style.textContent = `
    //   @keyframes dice-spin {
    //     0%   { transform: rotate(0turn); }
    //     25%  { transform: rotate(1turn); }
    //     50%  { transform: rotate(2turn); }
    //     75%  { transform: rotate(3turn); }
    //     100% { transform: rotate(4turn); }
    //   }`;
    // style.textContent = `
    //     @keyframes dice-spin {
    //     from { transform: rotate(0deg); }
    //     to   { transform: rotate(1440deg); }
    //   }`;
    style.textContent = `
      @keyframes dice-spin {
        0%   { transform: rotate(3turn); }
      }`;

    style.textContent += `
      .ani-dice-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: grid; place-items: center;
        background: #101827bb; backdrop-filter: blur(5px);
      }
      .ani-dice-panel {
        padding: 28px; border: 1px solid #ffffff35; border-radius: 24px;
        background: linear-gradient(145deg, #263a58, #111a2a);
        box-shadow: 0 24px 80px #0009; color: white; text-align: center;
        font: 600 16px system-ui, sans-serif;
      }
      .ani-dice-tray {
        display: flex; flex-wrap: wrap; justify-content: center;
        gap: 18px; max-width: min(80vw, 700px); padding: 12px;
      }
      .ani-die {
        width: 78px; height: 78px; display: grid; place-items: center;
        border: 3px solid white; border-radius: 19px;
        background: linear-gradient(145deg, white, #c9d7ef);
        color: #18253a; font: 800 36px system-ui, sans-serif;
        box-shadow: inset 0 -5px 0 #a5b5d0, 0 10px 18px #0006;
        animation-name: pulseInfinite;
        animation-fill-mode: both;
        backface-visibility: hidden;
      }
      @media (prefers-reduced-motion: reduce) {
        .ani-die { animation-duration: .01ms !important; }
      }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement("div");
  overlay.className = "ani-dice-overlay";

  const panel = document.createElement("div");
  panel.className = "ani-dice-panel";
  panel.textContent = `Rolling ${n}d${m}`;

  const tray = document.createElement("div");
  tray.className = "ani-dice-tray";
  panel.appendChild(tray);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const dice = Array.from({ length: n }, () => {
    const die = document.createElement("div");
    die.className = "ani-die";
    die.textContent = "–";
    die.style.animationDuration = `${totalTime}ms`;
    die.style.animationTimingFunction = easing;
    die.style.animationDirection = 'normal';
    tray.appendChild(die);
    return die;
  });

  const results = await Promise.all(dice.map(die => new Promise(resolve => {
    const timer = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * m);
    }, 50);

    setTimeout(() => {
      clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * m);
      die.textContent = result;
      resolve(result);
    }, totalTime);
  })));

  //setTimeout(() => overlay.remove(), 1500);
  return results;
}
async function aniDiceRoll1(n, m) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(m) || m < 2) {
    throw new RangeError("n must be at least 1 and m must be at least 2");
  }

  if (!document.getElementById("ani-dice-style")) {
    const style = document.createElement("style");
    style.id = "ani-dice-style";
    style.textContent = `
      @keyframes dice-tumble {
        0%   { transform: translateY(-50px) rotateX(0) rotateY(0) rotateZ(-18deg) scale(.7); }
        45%  { transform: translateY(-18px) rotateX(420deg) rotateY(250deg) rotateZ(12deg) scale(1.12); }
        75%  { transform: translateY(5px) rotateX(700deg) rotateY(520deg) rotateZ(-5deg) scale(.96); }
        100% { transform: translateY(0) rotateX(720deg) rotateY(720deg) rotateZ(0) scale(1); }
      }
      .ani-dice-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: grid; place-items: center;
        background: #101827bb; backdrop-filter: blur(5px);
      }
      .ani-dice-panel {
        padding: 28px; border: 1px solid #ffffff35; border-radius: 24px;
        background: linear-gradient(145deg, #263a58, #111a2a);
        box-shadow: 0 24px 80px #0009; color: white; text-align: center;
        font: 600 16px system-ui, sans-serif;
      }
      .ani-dice-tray {
        display: flex; flex-wrap: wrap; justify-content: center;
        gap: 18px; max-width: min(80vw, 700px); padding: 12px;
        perspective: 800px;
      }
      .ani-die {
        width: 78px; height: 78px; display: grid; place-items: center;
        border: 3px solid #fff; border-radius: 19px;
        background: linear-gradient(145deg, #fff, #c9d7ef);
        color: #18253a; font: 800 36px system-ui, sans-serif;
        box-shadow: inset 0 -5px 0 #a5b5d0, 0 10px 18px #0006;
        text-shadow: 0 1px 0 white;
        animation: dice-tumble 1.25s cubic-bezier(.18,.8,.25,1) both;
      }
      .ani-dice-close {
        margin-top: 14px; padding: 8px 18px; border: 0; border-radius: 99px;
        background: #ffffff20; color: white; font: inherit; cursor: pointer;
      }
      @media (prefers-reduced-motion: reduce) {
        .ani-die { animation-duration: .01ms !important; }
      }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement("div");
  overlay.className = "ani-dice-overlay";
  overlay.innerHTML = `
    <div class="ani-dice-panel" role="status" aria-live="polite">
      <div>Rolling ${n}d${m}</div>
      <div class="ani-dice-tray"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const tray = overlay.querySelector(".ani-dice-tray");
  const dice = Array.from({ length: n }, () => {
    const die = document.createElement("div");
    die.className = "ani-die";
    die.textContent = "–";
    tray.appendChild(die);
    return die;
  });

  const results = await Promise.all(dice.map((die, i) => new Promise(resolve => {
    const duration = 1000 + i * 130;
    const timer = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * m);
    }, 55);

    setTimeout(() => {
      clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * m);
      die.textContent = result;
      resolve(result);
    }, duration);
  })));

  // const close = document.createElement("button");
  // close.className = "ani-dice-close";
  // close.textContent = "Continue";
  // close.onclick = () => overlay.remove();
  // overlay.querySelector(".ani-dice-panel").appendChild(close);

  return results;
}


//#endregion dice

//#region colors
var ColorByHex = Object.freeze({
  "#00000d": "rich_black_fog",
  "#000000": "black",
  "#000202": "rich_black_fog2",
  "#002395": "imperial_blue",
  "#0247fe": "blue_ryb",
  "#004a7c": "dark_cerulean",
  "#0047ab": "blue",
  "#004d40": "bluegreen",
  "#00468c": "midnight_blue2",
  "#004f98": "usafa_blue",
  "#006666": "medium_teal",
  "#0067a5": "medium_persian_blue",
  "#00703c": "dartmouth_green",
  "#0072b1": "linkedin_blue",
  "#0072bb": "french_blue",
  "#007689": "metallic_seaweed",
  "#0076c6": "ocean_boat_blue",
  "#01796f": "pine_green",
  "#008543": "philippine_green",
  "#059033": "north_texas_green",
  "#00897b": "teal_green",
  "#008c9a": "boy_red",
  "#00a2ed": "microsoft_blue",
  "#008ec9": "rich_electric_blue",
  "#009b7d": "paolo_veronese_green",
  "#009999": "strong_cyan",
  "#0093af": "blue_munsell",
  "#0099ff": "spring_sky",
  "#00ad43": "green_pantone",
  "#00bcd4": "turquoise_surf",
  "#00bfa5": "vivid_teal",
  "#00b7eb": "cyan_process",
  "#00c1e9": "hawaii_blue",
  "#00cc00": "dark_lime",
  "#00ccff": "vivid_sky_blue",
  "#00f5d4": "bright_aqua",
  "#00ffff": "aqua",
  "#0040be": "panasonic_blue",
  "#0048ba": "absolute_zero",
  "#008001": "green",
  "#007fff": "azure",
  "#00a693": "persian_green",
  "#02aea8": "tiffany_blue",
  "#003171": "prussian_blue_color_konjo_iro",
  "#0088dc": "blue_cola",
  "#007f66": "generic_viridian",
  "#04c1ea": "blue_raspberry",
  "#00cc99": "caribbean_green",
  "#0665b2": "green_blue",
  "#044f67": "light_blue_silk",
  "#06d6a0": "vibrant_green",
  "#0066cc": "dodger_blue",
  "#091238": "navy_blue_bellflower",
  "#003153": "greenblue",
  "#002e63": "cool_black",
  "#062a78": "catalina_blue",
  "#0a7c1f": "xbox_green",
  "#00a877": "green_munsell",
  "#100c08": "smoky_black",
  "#1974d2": "bright_navy_blue",
  "#003399": "dark_powder_blue",
  "#0d98ba": "blue_green",
  "#002147": "oxford_blue",
  "#0fcaff": "spiro_disco_ball",
  "#10203d": "yankees_blue",
  "#002366": "royal_blue_dark",
  "#171412": "black_kokushoku",
  "#143c7c": "lapis_lazuli_japan",
  "#0f4d92": "yale_blue",
  "#1560bd": "denim",
  "#1492c4": "cyan_cornflower_blue",
  "#20b2aa": "lightseagreen",
  "#164aca": "new_car",
  "#1e90ff": "dodgerblue",
  "#00147e": "dark_imperial_blue",
  "#172b86": "dark_cornflower_blue",
  "#2096f3": "weebly_blue",
  "#1034a6": "egyptian_blue",
  "#2962ff": "summer_sky",
  "#0073cf": "true_blue1",
  "#009933": "jungle_green",
  "#264653": "greengrey",
  "#035096": "medium_electric_blue",
  "#1a191e": "mate_black",
  "#23297a": "saint_patricks_blue",
  "#1b2e35": "goryeo_storeroom",
  "#1b5e20": "mughal_green",
  "#007f5c": "spanish_viridian",
  "#1d44b3": "denim_blue",
  "#246bce": "celtic_blue",
  "#1f0b08": "licorice",
  "#252321": "black_chestnut",
  "#2e7d32": "japanese_laurel",
  "#006994": "sea_blue",
  "#24a0ed": "button_blue",
  "#000080": "bright_navy",
  "#2167a1": "lapis_lazuli",
  "#21b249": "asda_green_2002",
  "#2262dd": "flickr_blue",
  "#234096": "facebook_blue",
  "#3399ff": "brilliant_azure",
  "#232b2b": "charleston_green",
  "#319177": "illuminating_emerald",
  "#1f75fe": "blue_crayola",
  "#2a3439": "gunmetal",
  "#2887c8": "green_blue_crayola",
  "#26a69a": "keppel",
  "#26bfff": "light_sky_blue",
  "#281010": "legal_dye",
  "#303f9f": "blue_pigment",
  "#33b64b": "pleasant_green",
  "#2a2f23": "pine_tree",
  "#27221f": "ink_color_sumi_iro",
  "#2a898b": "celadon_green",
  "#353535": "dark_gray",
  "#353839": "onyx",
  "#351f19": "scorched_brown",
  "#4166f5": "ultramarine_blue",
  "#2b2028": "blue_violet",
  "#2d383a": "outer_space_crayola",
  "#36454f": "charcoal",
  "#2f502a": "horsetail",
  "#317589": "thousand_herb",
  "#354e4b": "silk_crepe",
  "#33251f": "betel_nut",
  "#335e68": "deep_space_sparkle",
  "#195905": "lincoln_green",
  "#3cb371": "mediumseagreen",
  "#296e01": "metallic_green",
  "#367588": "teal_blue",
  "#4997d0": "celestial_blue",
  "#34a9ae": "verdigris",
  "#26a7de": "twitter_blue",
  "#3a0ca3": "vivid_blue_violet",
  "#2c1608": "zinnwaldite_brown",
  "#3b2f2f": "black_coffee",
  "#36747d": "ming",
  "#1b03a3": "neon_blue",
  "#3b3c36": "black_olive",
  "#4c721d": "green_cola",
  "#2d68c4": "true_blue",
  "#4c9141": "may_green",
  "#364141": "onando",
  "#344d56": "iron_head_flower",
  "#40e0d0": "turquoise",
  "#393432": "indigo_ink_brown",
  "#324ab2": "violet_blue",
  "#1dacd6": "battery_charged_blue",
  "#3a6f8a": "jelly_bean_blue",
  "#3c3024": "cola",
  "#4285f4": "google_chrome_blue",
  "#45b1e8": "picton_blue",
  "#3e2230": "disappearing_purple",
  "#43302e": "old_burgundy",
  "#3d2b1f": "bistre",
  "#4f3320": "cafe_noir",
  "#3a403b": "rusty_storeroom",
  "#414a4c": "outer_space",
  "#410bd3": "interdimensional_blue",
  "#391802": "american_bronze",
  "#2a8000": "napier_green",
  "#4a261f": "acajou",
  "#3e8ede": "tufts_blue",
  "#39a78e": "zomp",
  "#42a5f5": "bleu_de_france",
  "#3d4c51": "kimono_storage",
  "#4396a9": "winter_sky",
  "#339933": "forest_green",
  "#4d646c": "opposite_flower",
  "#45f9ff": "sky_blue",
  "#466b7d": "dark_electric_blue",
  "#4169e1": "royal_blue_light",
  "#470344": "american_purple",
  "#455859": "rusty_storage",
  "#4b5320": "army_green",
  "#484e27": "pine_needle",
  "#4c3d30": "simmered_seaweed_mirucha",
  "#3aa8c1": "moonstone",
  "#4a251a": "boiled_red_bean_brown",
  "#4f4944": "dull_blue_aonibi",
  "#51484f": "quartz",
  "#48929b": "light_blue",
  "#34b334": "american_green",
  "#4bc5fc": "light_azure",
  "#39ff14": "neon_green",
  "#330066": "deep_violet",
  "#483c32": "dark_lava",
  "#503430": "royal_brown",
  "#4cb7a5": "blue_lagoon",
  "#4dc6e1": "maximum_blue",
  "#4dd0e1": "sea_serpent",
  "#4b3c39": "brown_rat_grey",
  "#4e9226": "maximum_green",
  "#55b4b0": "dark_turquoise",
  "#534b4f": "dark_liver",
  "#5a7247": "military_green",
  "#506d73": "cadet",
  "#563c5c": "english_violet",
  "#528d30": "fresh_onion_moegi",
  "#446ccf": "han_blue",
  "#541e69": "imperial",
  "#543121": "weathered_bamboo",
  "#543630": "dark_liver_horses",
  "#54626f": "black_coral",
  "#4f666a": "stormcloud",
  "#6666ff": "very_light_blue",
  "#5731a5": "plump_purple",
  "#4424d6": "violetblue",
  "#586214": "antique_bronze",
  "#586415": "mustard_green",
  "#6b8e23": "olivedrab",
  "#66b032": "green_ryb",
  "#58bf4e": "mantis",
  "#696969": "dimgray",
  "#59702c": "darkolivegreen",
  "#5fc9bf": "bayside",
  "#669999": "desaturated_cyan",
  "#5a96a8": "crystal_blue",
  "#614e6e": "dark_indigo",
  "#5c6bc0": "violet_blue_crayola",
  "#5218fa": "han_purple",
  "#5d4037": "liver",
  "#5d423c": "umber",
  "#6699ff": "light_royal_blue",
  "#64e986": "very_light_malachite_green",
  "#645452": "wenge",
  "#5f9ea0": "cadetblue",
  "#5fb2de": "carolina_blue",
  "#600f58": "palatinate_purple",
  "#603c24": "dark_brown",
  "#604338": "contemplation",
  "#5f8a8b": "steel_teal",
  "#60c14e": "apple",
  "#5dadec": "blue_jeans",
  "#61de9f": "medium_aquamarine",
  "#592b1f": "sumac_dyed_korozen",
  "#63351e": "van_dyke_brown",
  "#633d35": "painite",
  "#5d8aa8": "air_force_blue",
  "#50c878": "pale_emerald",
  "#708090": "slategray",
  "#64dac1": "mediumaquamarine",
  "#58a813": "lawn_green",
  "#66361f": "aloewood",
  "#6ab2ca": "delicate_girl_blue",
  "#66bb6a": "iguana_green",
  "#66c0e8": "sky_blue_crayola",
  "#727472": "nickel",
  "#660066": "purple",
  "#6a5445": "quincy",
  "#689f38": "palm_leaf",
  "#6e81a0": "slate_blue",
  "#6d9a79": "oxley",
  "#669900": "olive_drab",
  "#73a9c2": "moonstone_blue",
  "#6d291a": "liver_organ",
  "#6d4238": "deep_coffee",
  "#6d94a5": "weldon_blue",
  "#7b68ee": "mediumslateblue",
  "#507d2a": "sap_green",
  "#77dd77": "pastel_green",
  "#6fe8fd": "electric_sky",
  "#706c66": "dark_silver",
  "#70853b": "moss_green",
  "#713604": "philippine_bronze",
  "#6e7f80": "aurometalsaurus",
  "#8d9440": "khaki",
  "#723f22": "golden_grey_bamboo",
  "#778899": "lightslategray",
  "#79443b": "bole",
  "#7350d3": "slateblue",
  "#867e36": "old_moss_green",
  "#738613": "siskin_sprout_yellow",
  "#87d3f8": "pale_cyan",
  "#751c00": "kenyan_copper",
  "#87a96b": "asparagus",
  "#7600b3": "dark_purple",
  "#765f57": "dove_feather_grey",
  "#836fff": "medium_slate_blue",
  "#73c2fb": "maya_blue",
  "#77381f": "cypress_bark_color",
  "#7dc242": "asda_green",
  "#785e49": "color_of_an_undried_wall",
  "#7cb9e8": "aero",
  "#792d85": "maximum_purple",
  "#966fd6": "dark_pastel_purple",
  "#808080": "gray",
  "#808000": "heart_gold",
  "#7986cb": "ceil",
  "#720b98": "chinese_purple",
  "#824b35": "green_tea",
  "#9966cc": "amethyst",
  "#77b5fe": "french_sky_blue",
  "#7b5b52": "lye",
  "#7e5e60": "deep_taupe",
  "#7eb6ff": "parakeet_blue",
  "#7cb23f": "guacamole",
  "#7d8e5f": "pale_blue_usuao",
  "#69359c": "purple_heart",
  "#7eaab3": "pewter_blue",
  "#7ec8ee": "baby_blue",
  "#7c0a02": "barn_red",
  "#80461b": "russet",
  "#836953": "pastel_brown",
  "#7db700": "microsoft_green",
  "#7fce1a": "kiwi",
  "#8b352d": "red_brown1",
  "#878681": "titanium",
  "#9999ff": "pale_lilac",
  "#7fcdcd": "light_cyan",
  "#8fd400": "sheen_green",
  "#80ddd2": "middle_blue_green",
  "#80daeb": "medium_sky_blue",
  "#8cbed6": "dark_sky_blue",
  "#81d7ff": "lightskyblue",
  "#801818": "falu_red",
  "#823e00": "chocolate_traditional",
  "#88654e": "dark_brown_tangelo",
  "#825e1d": "finch_brown",
  "#826b58": "sen_no_rikyus_tea_rikyucha",
  "#9acd32": "yellowgreen",
  "#82e8d7": "pearl_aqua",
  "#83622f": "yellow_sea_pine_brown",
  "#848482": "battleship_grey",
  "#7c4848": "tuscan_red",
  "#8b5f4d": "spicy_mix",
  "#99e6b3": "teal_deer",
  "#905d5d": "rose_taupe",
  "#871e0c": "kobe",
  "#8c5939": "brushwood_dyed_fushizome",
  "#84563c": "milk_chocolate",
  "#875d00": "bistre_brown",
  "#8b8589": "taupe_gray",
  "#87a194": "morning_blue",
  "#880e4f": "french_plum",
  "#817b69": "willow_grey",
  "#8b8680": "middle_grey",
  "#8db255": "pale_young_green_onion",
  "#893f2e": "sparrow_brown",
  "#8f583c": "clove_brown",
  "#8954ff": "medium_violet",
  "#996633": "medium_brown",
  "#838996": "roman_silver",
  "#933709": "citrine_brown",
  "#8e4585": "plum",
  "#8a460a": "saddlebrown",
  "#8bbe1b": "dark_lemon_lime",
  "#8a0303": "blood1",
  "#8c1d0b": "deep_dumpling",
  "#8cc2ea": "cornflower",
  "#911eb4": "violet",
  "#993399": "dark_magenta",
  "#985538": "polished_brown",
  "#98817b": "cinereous",
  "#8a795d": "shadow",
  "#875f9a": "wisteria_purple",
  "#903eb3": "purple_plum",
  "#91a3b0": "cadet_grey",
  "#99ccff": "pale_sky_blue",
  "#922724": "vivid_auburn",
  "#91674d": "italian_roast",
  "#925849": "plum_blossom_mouse",
  "#9fa91f": "citron",
  "#8ab9f1": "jordy_blue",
  "#880085": "mardi_gras",
  "#a4dded": "non_photo_blue",
  "#92000a": "sangria",
  "#964b00": "brown_traditional",
  "#987456": "liver_chestnut",
  "#a8e4a0": "granny_smith_apple",
  "#965a3e": "coconut",
  "#a19d94": "iron",
  "#96a53c": "pomelo",
  "#9f8170": "beaver",
  "#a0a0a0": "darkgray",
  "#98a8be": "cadet_blue_crayola",
  "#b0bf1a": "acid_green",
  "#98b4d4": "pale_blue",
  "#99130d": "spartan_crimson",
  "#9a4eae": "purpureus",
  "#a0785a": "chamoisee",
  "#9aa7ed": "light_cobalt_blue",
  "#93c572": "pistachio",
  "#9d2b22": "red_birch",
  "#9b6a57": "walnut_dyed",
  "#986960": "dark_chestnut",
  "#a17917": "rapeseed_oil",
  "#9b782c": "metallic_sunburst",
  "#a7d8de": "crystal",
  "#9c3c25": "red_brown",
  "#afd7e9": "lightblue",
  "#9f5233": "red_ochre",
  "#996600": "gamboge_orange_brown",
  "#9b7653": "dirt",
  "#b2ec5d": "inchworm",
  "#9f00c5": "purple_munsell",
  "#9fa4aa": "chrome_aluminum",
  "#a52a2a": "auburn",
  "#a65f46": "copper_brown",
  "#a97142": "metallic_bronze",
  "#a08ccf": "light_pastel_purple",
  "#a0c7e8": "pale_cerulean",
  "#bdda57": "june_bud",
  "#9ab973": "olivine",
  "#a1c23c": "margarita",
  "#a1c5cb": "pastel_blue",
  "#a22911": "chinese_red",
  "#ab381f": "chinese_brown",
  "#9932cc": "darkorchid",
  "#a2672b": "dark_gold",
  "#a2764a": "cafe_au_lait",
  "#a281d0": "lenurple",
  "#a6e7ff": "fresh_air",
  "#a30042": "dark_crimson",
  "#a83731": "sweet_brown",
  "#a38e7a": "grullo",
  "#a41313": "blood",
  "#a57164": "blast_off_bronze",
  "#a50b5e": "jazzberry_jam",
  "#ac4313": "metallic_brown",
  "#967bb6": "lavender_purple",
  "#a7571f": "clove_dyed_chojizome",
  "#a7ffeb": "celeste",
  "#a40000": "dark_candy_apple_red",
  "#a81c07": "rufous",
  "#a8ce5f": "yellow_green_crayola",
  "#ab6134": "loquat_tree_brown",
  "#ab2c5e": "amaranth_deep_purple",
  "#ab3f2e": "medium_carmine",
  "#ab47bc": "deep_fuchsia",
  "#ab580f": "light_brown",
  "#ab7cf7": "vibrant_lavender",
  "#ab872e": "pale_fallen_leaves",
  "#abb9bb": "ash_gray",
  "#a3c1ad": "cambridge_blue",
  "#ad1414": "carnelian",
  "#ac5813": "dirty_brown",
  "#ad3900": "rust",
  "#af6e4d": "brown_sugar",
  "#a0d6b4": "turquoise_green",
  "#ae111f": "upsdell_red",
  "#b0927a": "faded_rikyus_tea",
  "#aaa9ad": "silver_metallic",
  "#afb1ae": "silver_foil",
  "#ff0000": "red",
  "#c51162": "raspberry",
  "#ae0c00": "mordant_red_19",
  "#b22222": "firebrick",
  "#bd33a4": "byzantine",
  "#a75502": "windsor_tan",
  "#af6300": "philippine_gold",
  "#af7464": "copper_penny",
  "#bb5d42": "spicy_red_brown",
  "#b38b6d": "light_taupe",
  "#b2d732": "lime_green",
  "#b0f2f7": "blizzard_blue",
  "#b87333": "dark_copper",
  "#b56c60": "water_persimmon",
  "#b27e18": "university_of_california_gold",
  "#ba8759": "deer",
  "#b08d57": "bronze_metallic",
  "#b391ff": "pale_violet",
  "#bcd4e6": "beau_blue",
  "#b9f2ff": "diamond",
  "#b41301": "tomato_sauce",
  "#b8860b": "darkgoldenrod",
  "#9dc209": "limerick",
  "#b4ddfa": "pale_cornflower_blue",
  "#b574c3": "african_violet",
  "#b7702d": "chinese_yellow_tea",
  "#b65500": "alloy_orange",
  "#b6d401": "bitter_lemon",
  "#b0e0e6": "powderblue",
  "#b14a30": "birch_brown_kabacha",
  "#b8dade": "columbia_blue",
  "#bc987e": "pale_taupe",
  "#bba46d": "pale_oak",
  "#c0c0c0": "silver",
  "#b62020": "red_cola",
  "#bb8141": "golden_oak",
  "#c19a6b": "camel",
  "#c83f49": "strawberry_red",
  "#c66b27": "light_golden_brown",
  "#c48e69": "white_tea",
  "#bc2a16": "dark_pastel_red",
  "#bc6f00": "asda_orange_1968",
  "#bea493": "mocha",
  "#c4aead": "silver_pink",
  "#bbd0c9": "jet_stream",
  "#bd90e6": "bright_lavender",
  "#c6c2b6": "inside_of_a_bottle",
  "#be0576": "mediumvioletred",
  "#b666d2": "rich_lilac",
  "#bedc9d": "gin",
  "#bf1a1a": "pure_crimson",
  "#bd3000": "lemon_iced_tea",
  "#bc2d29": "greyed_red",
  "#bf8302": "caramel",
  "#bb9351": "maple_syrup",
  "#c9c0bb": "pale_silver",
  "#bfccd2": "aluminum_foil",
  "#c9dc87": "medium_spring_bud",
  "#c0711f": "mulberry_orange",
  "#bcb58c": "underside_of_willow_leaves",
  "#b64925": "cattail_color",
  "#be7f51": "dark_ochre",
  "#c0362c": "dark_international_orange",
  "#c04000": "mahogany",
  "#cb6d51": "copper_red",
  "#c2dd1f": "pear",
  "#ccffff": "very_pale_cyan",
  "#c80815": "venetian_red",
  "#bb6528": "ruddy_brown",
  "#cccccc": "lightgray",
  "#ccffcc": "very_pale_green",
  "#c8ad7f": "light_french_beige",
  "#bfc1c2": "silver_sand",
  "#cd9575": "antique_brass",
  "#c5cbe1": "light_periwinkle",
  "#c67260": "electric_brown",
  "#cd7a00": "mustard_brown",
  "#cc9966": "brown_yellow",
  "#c6d856": "chinese_green",
  "#c6e4f7": "water",
  "#c71fff": "bright_orchid",
  "#c4c3d0": "lavender_gray",
  "#cc3333": "persian_red",
  "#cfcfc4": "pastel_gray",
  "#ca1837": "amaranth_red",
  "#ca2c31": "madder_lake",
  "#cabeff": "palelavender",
  "#ca6924": "amber_japan",
  "#d68a59": "raw_sienna",
  "#cc26a1": "medium_red_violet",
  "#cf3a24": "scarlet1",
  "#cc7722": "ochre1",
  "#dbe9f4": "azureish_white",
  "#ccff99": "very_light_green",
  "#cc3300": "carrot",
  "#d2b48c": "tan",
  "#ce843a": "peru",
  "#d99a6c": "tan_crayola",
  "#ce93d8": "medium_lavender_magenta",
  "#dc143c": "crimson",
  "#c95a49": "cedar_chest",
  "#d2691e": "cinnamon",
  "#cfb0ea": "tropical_violet",
  "#cb410b": "sinopia",
  "#da8a67": "copper",
  "#d6cadd": "languid_lavender",
  "#d34e36": "glazed_persimmon",
  "#d1593f": "dark_coral",
  "#d57835": "decaying_leaves",
  "#cc9900": "chinese_gold",
  "#db7093": "palevioletred",
  "#d28333": "chinese_bronze",
  "#ce9f6f": "white_oak",
  "#cc0000": "jolly_red",
  "#d73b3e": "jasper",
  "#c3447a": "berry_pink",
  "#d9603b": "medium_vermilion",
  "#d36600": "orange_brown",
  "#da614e": "jelly_bean",
  "#cd040b": "verizon_red1",
  "#ce2029": "fire_engine_red",
  "#d55113": "vivid_red_tangelo",
  "#d55e00": "metallic_orange",
  "#d9b611": "patrinia_flowers",
  "#d5ccc2": "timberwolf",
  "#e3ff00": "lemon_lime",
  "#d99058": "persian_orange",
  "#cb7e1f": "gold_brown_yamabukicha",
  "#e29c45": "golden_fallen_leaves",
  "#deaa88": "tumbleweed",
  "#d65076": "blush",
  "#da3287": "deep_cerise",
  "#dd4124": "rust_red",
  "#e25822": "flame",
  "#d853c9": "orchid",
  "#d89852": "sand",
  "#e2b13c": "japanese_triandra_grass",
  "#da9100": "harvest_gold",
  "#dcd0ff": "pale_lavender",
  "#d40000": "rosso_corsa",
  "#e68364": "brewed_mustard_brown",
  "#deb887": "burlywood",
  "#d9baa5": "dark_vanilla",
  "#dfcfbe": "beige_grey",
  "#dcdcdc": "gainsboro",
  "#e9ffdb": "nyanza",
  "#da0a23": "strong_carmine",
  "#e03c31": "cg_red",
  "#e08a1e": "sumac_dyed_hajizome",
  "#de8f4e": "jasper_orange",
  "#e3dac9": "bone",
  "#dc3023": "orangered",
  "#e86100": "spanish_orange",
  "#dba010": "urobilin",
  "#dd2c00": "microsoft_red",
  "#e08d3c": "tigers_eye",
  "#e2be9f": "eggshell_paper",
  "#ec5800": "persimmon",
  "#ec8254": "washed_out_persimmon",
  "#e5aa70": "fawn",
  "#ebc2af": "zinnwaldite",
  "#df86ac": "middle_purple",
  "#ebf6f7": "indigo_white",
  "#e12c2c": "permanent_geranium_lake",
  "#e34234": "cinnabar",
  "#e4717a": "candy_pink",
  "#e7968b": "salmon_rose",
  "#e7c9a9": "manila",
  "#e5e4e2": "platinum",
  "#f0e891": "green_yellow_crayola",
  "#e7feff": "bubbles",
  "#ed9121": "carrot_orange",
  "#e1e7ea": "bright_gray",
  "#dc5349": "lychee",
  "#e27406": "beer",
  "#e49b0f": "gamboge",
  "#e2defa": "lavender_mist",
  "#e1ede9": "very_pale_grey",
  "#e34b44": "google_chrome_red",
  "#ed872d": "cadmium_orange",
  "#eee0b1": "cookies_and_cream",
  "#eee8aa": "palegoldenrod",
  "#e3e0aa": "pale_spring_bud",
  "#e2e5de": "chinese_white",
  "#eb6123": "halloween_orange",
  "#e48400": "fulvous",
  "#e6be8a": "gold_crayola",
  "#e6e0d4": "white_coffee",
  "#e3f988": "mindaro",
  "#e62020": "lust",
  "#eaa221": "marigold",
  "#e6194b": "deep_raspberry",
  "#fb4f14": "orioles_orange",
  "#e6508f": "raspberry_pink",
  "#ec956c": "sawtooth_oak",
  "#eb593d": "orange_soda1",
  "#ffffbf": "very_pale_yellow",
  "#e35c38": "refreshed_red_brown",
  "#f39998": "peach_burst",
  "#e8a631": "rape_blossom_brown",
  "#e8ad00": "mustard_yellow",
  "#e6d0ab": "durian_white",
  "#e9f6ef": "italian_ice",
  "#e8f6ff": "aliceblue",
  "#ff4e20": "ochre",
  "#e94196": "barbie_pink",
  "#fcffa4": "calamansi",
  "#f88379": "congo_pink",
  "#e9692c": "deep_carrot_orange",
  "#e97451": "burnt_sienna",
  "#ff80ff": "light_magenta",
  "#eaab57": "indian_yellow",
  "#efc050": "goldenrod",
  "#e1a95f": "earth_yellow",
  "#f35336": "blood_red",
  "#ef476f": "pale_red",
  "#f46036": "vibrant_orangered",
  "#f07427": "vivid_tangelo",
  "#f77fbe": "persian_pink",
  "#f58f84": "ibis_wing_color",
  "#f37042": "chinese_orange",
  "#f4a460": "sandybrown",
  "#eda600": "spanish_yellow",
  "#f7c58e": "douban_light_yellow",
  "#efcc00": "yellow_munsell",
  "#ede6d6": "white_chocolate",
  "#eb4c42": "carmine_pink",
  "#ee5b4a": "fire_opal",
  "#ee8cff": "bubblegum",
  "#f5bd1f": "orange_yellow",
  "#ff6699": "light_red_violet",
  "#f7665a": "thrice_dyed_crimson",
  "#fe4eda": "purple_pizzazz",
  "#ef87b2": "orchid_pink",
  "#fa9258": "plum_dyed_umezome",
  "#ffa812": "dark_tangerine",
  "#ecb176": "middle_yellow_red",
  "#fbceb1": "apricot",
  "#f4f0ec": "isabelline",
  "#f5f5f5": "whitesmoke",
  "#fb9902": "orange_ryb",
  "#f8b878": "mellow_apricot",
  "#f6eabe": "lemon_meringue",
  "#f0f4f5": "anti_flash_white",
  "#f77f00": "university_of_tennessee_orange",
  "#fb9912": "kumquat",
  "#faa945": "corn_japan",
  "#f2ba49": "maximum_yellow_red",
  "#f5f3ef": "penguin_white",
  "#f2b400": "american_yellow",
  "#f2ab47": "turmeric",
  "#f7bb7d": "light_yellow_asagi",
  "#f2c649": "maize_crayola",
  "#ffb347": "pastel_orange",
  "#f8de7e": "jasmine",
  "#fae6fa": "pale_purple_pantone",
  "#fd5240": "ogre_odor",
  "#f58025": "princeton_orange",
  "#ffa631": "egg",
  "#ffb94e": "floral_leaf",
  "#ffc34d": "chickadee",
  "#fad6a5": "deep_champagne",
  "#f5deb3": "wheat",
  "#fbab60": "rajah",
  "#ffb61e": "gamboge_bright",
  "#ffb6c1": "lightpink",
  "#ffc87c": "topaz",
  "#f5e1d1": "champagne_pink",
  "#f7e7ce": "champagne",
  "#f5f3e7": "alabaster",
  "#f8f8ff": "ghostwhite",
  "#f63bbe": "frostbite",
  "#ff99cc": "pale_magenta_pink",
  "#ff9933": "deep_saffron",
  "#ffcba4": "deep_peach",
  "#f5c71a": "deep_lemon",
  "#f5fffa": "mintcream",
  "#f70d1a": "vivid_red",
  "#f72e26": "huawei_red",
  "#f772db": "pale_magenta",
  "#ff7800": "safety_orange",
  "#ffcc66": "light_orange",
  "#fccc1a": "bright_yellow",
  "#ffd59a": "caramel_creme",
  "#ffdb58": "mustard",
  "#f7e98e": "flavescent",
  "#f84ab2": "strong_boy_pink",
  "#ff7952": "rinsed_out_red",
  "#fdd9b5": "sandy_tan",
  "#fadfad": "peach_yellow",
  "#fe2712": "red_ryb",
  "#ff6fff": "shocking_pink_crayola",
  "#ffc922": "sunset_yellow",
  "#ffd1dc": "pale_blush_pink",
  "#ffdac1": "peach_puff",
  "#f4ca16": "jonquil",
  "#ffe4c4": "bisque",
  "#ffe9d1": "flesh",
  "#ffffff": "white",
  "#ff6e4a": "outrageous_orange",
  "#ff9966": "atomic_tangerine",
  "#ff9505": "yellow_orange_wheel",
  "#ffa700": "chrome_yellow",
  "#ffae42": "yellow_orange",
  "#ffc40c": "mikado_yellow",
  "#f8d568": "orange_yellow_crayola",
  "#ffe119": "sunshine_yellow",
  "#ffdfbf": "very_pale_orange",
  "#ffe4b5": "moccasin",
  "#ffe4cd": "lumber",
  "#fada5e": "naples_yellow",
  "#fae9ae": "banana_mania",
  "#ffebcd": "blanchedalmond",
  "#fb3028": "coral_red",
  "#ff631c": "brave_orange",
  "#ff8c00": "darkorange",
  "#ffb95a": "cape_jasmine",
  "#fdbe02": "mango",
  "#ffcc33": "sunglow",
  "#ffe670": "shandy",
  "#fff5ee": "seashell",
  "#fbf0b4": "medium_champagne",
  "#fefdfa": "lotion",
  "#ff7f50": "coral",
  "#fb8136": "red_bronze",
  "#f28500": "satsuma",
  "#fdb900": "microsoft_yellow",
  "#ffbe0b": "bright_yellow_orange",
  "#ffc324": "ripe_mango",
  "#fcc4bf": "spanish_pink",
  "#fdd5b1": "feldspar",
  "#fddb6d": "dandelion_crayola",
  "#fee440": "electric_yellow",
  "#fff0f5": "lavenderblush",
  "#fffff0": "ivory",
  "#fefefa": "baby_powder",
  "#ff6961": "pastel_red",
  "#ff681f": "orange_red",
  "#ff6d3a": "smashed_pumpkin",
  "#ff878d": "tulip",
  "#ff8243": "mango_tango",
  "#f99245": "royal_orange",
  "#ffb3de": "light_hot_pink",
  "#ffd32d": "vibrant_bright_yellow",
  "#fcc9b9": "cherry_blossom",
  "#fddb3a": "child_banana",
  "#fe05a2": "fashion_fuchsia",
  "#fb5607": "bright_orange_red",
  "#ff6666": "dark_salmon",
  "#fc600a": "tangerine",
  "#fd5e53": "sunset_orange",
  "#ff8b00": "american_orange",
  "#fe8e6e": "meat_color",
  "#ff9900": "vivid_gamboge",
  "#ffb3a7": "washed_out_crimson",
  "#ffaa1d": "bright_yellow_crayola",
  "#fea8a7": "light_blush",
  "#ffb300": "ucla_gold",
  "#ffba00": "selective_yellow",
  "#ffbf00": "amber",
  "#ffd166": "vibrant_sunny_yellow",
  "#ffd8b1": "peach",
  "#ffdab9": "peachpuff",
  "#ffe5b4": "pale_peach",
  "#ffefd5": "papayawhip",
  "#fef3c0": "blond",
  "#fce883": "yellow_crayola",
  "#fff8dc": "cornsilk",
  "#fff8e7": "cosmic_latte",
  "#fdfff5": "milk",
  "#ff0066": "hot_pink",
  "#fc0fc0": "shocking_pink",
  "#ff0800": "candy_apple_red",
  "#ff2d8a": "barbie_pink_1999",
  "#ff4200": "taobao_orange",
  "#ff4081": "rose_bonbon",
  "#ff4c2a": "portland_orange",
  "#ff5050": "strawberry",
  "#ff5f00": "vivid_orange",
  "#ff61a9": "hotpink",
  "#ff7518": "pumpkin",
  "#ff6f61": "watermelon",
  "#ff6c75": "begonia",
  "#ff7300": "philippine_orange",
  "#ff732d": "papaya",
  "#ff7759": "coral_color",
  "#ff7b78": "salmon",
  "#ff9aa2": "soft_coral",
  "#ff9d83": "vivid_tangerine",
  "#ffa000": "vivid_orange_peel",
  "#ffa565": "pale_incense_usuko",
  "#ffa500": "ora_orange",
  "#ff9f1c": "vibrant_orange",
  "#ffa996": "poppy_petal",
  "#ffb077": "very_light_tangelo",
  "#ffb200": "chinese_yellow",
  "#ffbd88": "macaroni_and_cheese",
  "#fcc200": "golden_poppy",
  "#febaad": "melon",
  "#fecb00": "philippine_yellow",
  "#ffcc00": "tangerine_yellow",
  "#ffcce1": "classic_rose",
  "#ffce44": "google_chrome_yellow",
  "#ffcccc": "pale_pink",
  "#ffd662": "banana",
  "#ffddca": "unbleached_silk",
  "#ffd700": "golden",
  "#ffdf00": "golden_yellow",
  "#ffe02e": "banana_yellow",
  "#ffdead": "navajowhite",
  "#ffe959": "minion_yellow",
  "#ffeb00": "middle_yellow",
  "#ffea5c": "corn",
  "#ffead9": "antiquewhite",
  "#ffeb3b": "vibrant_electric_yellow",
  "#fff620": "buttercup_yellow",
  "#ffff9f": "lemon_yellow_crayola",
  "#fff7eb": "oldlace",
  "#fff891": "pastel_yellow",
  "#fffafa": "snow",
  "#ffff00": "yellow",
  "#000066": "navy",
  "#000075": "deep_blue",
  "#00008b": "darkblue",
  "#000099": "dark_blue",
  "#00009c": "duke_blue",
  "#0000cc": "medium_blue",
  "#0000cd": "mediumblue",
  "#0000ff": "primary_blue",
  "#000f89": "phthalo_blue",
  "#001440": "cetacean_blue",
  "#0014a8": "zaffre",
  "#0018a8": "blue_pantone",
  "#002387": "resolution_blue",
  "#00308f": "air_force_blue_usaf",
  "#003300": "dark_green",
  "#003366": "dark_midnight_blue",
  "#0033aa": "ua_blue",
  "#0033cc": "bright_blue",
  "#0038a7": "philippine_blue",
  "#0038a8": "royal_azure",
  "#003a6c": "ateneo_blue",
  "#003b6f": "tardis_blue",
  "#004040": "rich_black",
  "#00416a": "dark_imperial_blue_green",
  "#004225": "british_racing_green",
  "#004242": "warm_black",
  "#004346": "dark_cyan",
  "#004953": "midnight_green",
  "#004b49": "deep_jungle_green",
  "#00563f": "castleton_green",
  "#005f73": "deep_cyan",
  "#006400": "dark_green_x11",
  "#006442": "green_bamboo",
  "#006600": "pakistan_green",
  "#006699": "sea_bluegreen",
  "#0066ff": "brilliant_blue",
  "#006a4e": "bangladesh_green",
  "#006b3c": "cadmium_green",
  "#006c7f": "new_bridge",
  "#006db0": "honolulu_blue",
  "#0070b8": "spanish_blue",
  "#0070ff": "brandeis_blue",
  "#007474": "skobeloff",
  "#00755e": "tropical_rain_forest",
  "#0077be": "ocean_boat_blue",
  "#0078d7": "microsoft_edge_blue",
  "#007aa5": "cg_blue",
  "#007ba7": "celadon_blue",
  "#007bb8": "star_command_blue",
  "#008000": "ao_english",
  "#008080": "teal",
  "#00827f": "teal_green",
  "#0087bd": "blue_ncs",
  "#008b8b": "darkcyan",
  "#009000": "islamic_green",
  "#009150": "spanish_green",
  "#0095b6": "bondi_blue",
  "#009698": "viridian_green",
  "#009900": "strong_green",
  "#009966": "green_cyan",
  "#0099cc": "deep_sky_blue",
  "#009b77": "seaglass",
  "#009e60": "shamrock_green",
  "#009f6b": "green_ncs",
  "#00a550": "green_pigment",
  "#00a86b": "jade",
  "#00a870": "sesame_street_green",
  "#00aaee": "vivid_cerulean",
  "#00ab66": "go_green",
  "#00b8a9": "vivid_teal",
  "#00b9fb": "blue_bolt",
  "#00bbf9": "bright_sky_blue",
  "#00bfff": "capri",
  "#00c3e3": "hawaii_blue",
  "#00c5cd": "turquoise_surf",
  "#00cc33": "vivid_malachite",
  "#00cc66": "medium_spring_green",
  "#00cccc": "robin_egg_blue",
  "#00ced1": "darkturquoise",
  "#00dea4": "asda_green_1985",
  "#00fa9a": "mediumspringgreen",
  "#00ff00": "primary_green",
  "#00ff7f": "guppie_green",
  "#00ff99": "spring_green",
  "#00ffcc": "aquagreen",
  "#00ffcd": "sea_green_crayola",
  "#00ffef": "turquoise_blue",
  "#010203": "rich_black_fog2",
  "#010b13": "rich_black_fog",
  "#013220": "emerald",
  "#014421": "forest_green_traditional",
  "#02075d": "dark_navy",
  "#03c03c": "dark_pastel_green",
  "#043927": "sacramento_state_green",
  "#046307": "emerald_green",
  "#056608": "deep_green",
  "#064e40": "bluegreen",
  "#073b4c": "dark_teal",
  "#08415c": "dark_cyan_blue",
  "#08457e": "dark_cerulean",
  "#0892d0": "rich_electric_blue",
  "#08e8de": "bright_turquoise",
  "#091f92": "indigo_dye",
  "#0a1195": "cadmium_blue",
  "#0a7e8c": "metallic_seaweed",
  "#0abab5": "tiffany_blue",
  "#0b132b": "blue_black",
  "#0bda51": "malachite",
  "#0cbfe9": "blue_raspberry",
  "#0e7a0d": "xbox_green",
  "#0e7c61": "deep_green_cyan",
  "#0e9ca5": "boy_red",
  "#0f52ba": "sapphire",
  "#0fc0fc": "spiro_disco_ball",
  "#10002b": "midnight_purple",
  "#101820": "eerie_black",
  "#1164b4": "green_blue",
  "#118ab2": "vibrant_blue",
  "#12279e": "samsung_blue",
  "#123524": "phthalo_green",
  "#126180": "blue_sapphire",
  "#136207": "royal_green",
  "#138808": "india_green",
  "#15f2fd": "lotion_blue",
  "#15f4ee": "fluorescent_blue",
  "#17182b": "elderberry",
  "#177245": "dark_spring_green",
  "#181b26": "coarse_wool",
  "#18453b": "msu_green",
  "#18880d": "verse_green",
  "#188bc2": "cyan_cornflower_blue",
  "#191970": "midnightblue",
  "#191f45": "navy_blue_bellflower",
  "#192236": "dark_blue_kon",
  "#1a1110": "licorice",
  "#1a1423": "raisin_black",
  "#1a2421": "dark_jungle_green",
  "#1aa260": "google_chrome_green",
  "#1ac1dd": "caribbean_blue",
  "#1b1811": "black_chocolate",
  "#1b263b": "prussian_blue",
  "#1b294b": "dark_blue_lapis_lazuli",
  "#1b4d3e": "brunswick_green",
  "#1c1cf0": "bluebonnet",
  "#1c2841": "yankees_blue",
  "#1c352d": "medium_jungle_green",
  "#1c39bb": "persian_blue",
  "#1ca9c9": "pacific_blue",
  "#1cac78": "green_crayola",
  "#1d2951": "space_cadet",
  "#1d697c": "light_blue_flower",
  "#1e4d2b": "pomona_green",
  "#1f262a": "dark_gunmetal",
  "#1f4788": "lapis_lazuli_japan",
  "#1f8eed": "weebly_blue",
  "#203838": "goryeo_storeroom",
  "#214fc6": "new_car",
  "#216bd6": "flickr_blue",
  "#21abcd": "ball_blue",
  "#2243b6": "denim_blue",
  "#224634": "velvet_birodo",
  "#228b22": "forestgreen",
  "#230c33": "blackcurrant",
  "#23191e": "dark_red_kurobeni",
  "#233067": "indigo_rainbow",
  "#240046": "very_dark_violet",
  "#242124": "mate_black",
  "#2496cd": "douban_blue",
  "#253529": "black_leather_jacket",
  "#26428b": "dark_cornflower_blue",
  "#264348": "japanese_indigo",
  "#26547c": "winter_blue",
  "#26619c": "lapis_lazuli",
  "#273be2": "palatinate_blue",
  "#283618": "dark_olive",
  "#28589c": "cyan_cobalt_blue",
  "#290e05": "root_beer",
  "#299617": "slimy_green",
  "#29ab87": "jungle_cyan",
  "#2a52be": "cerulean_blue",
  "#2a603b": "green_midori",
  "#2b2d42": "gun_grey",
  "#2b3733": "iron_tetsu",
  "#2b3736": "iron_storage",
  "#2d4436": "insect_screen",
  "#2e211b": "legal_dye",
  "#2e2d88": "cosmic_cobalt",
  "#2e372e": "indigo_codium",
  "#2e5090": "yinmn_blue",
  "#2e5894": "bdazzled_blue",
  "#2e8b57": "seagreen",
  "#2e963d": "douban_green",
  "#2ec4b6": "vibrant_turquoise",
  "#2f4f4f": "darkslategray",
  "#2f7532": "japanese_laurel",
  "#2f847c": "celadon_green",
  "#301934": "darkpurple",
  "#306030": "mughal_green",
  "#30b21a": "yellow_green",
  "#30ba8f": "mountain_meadow",
  "#30bfbf": "maximum_blue_green",
  "#317873": "myrtle_green",
  "#318ce7": "bleu_de_france",
  "#32127a": "persian_indigo",
  "#32174d": "russian_violet",
  "#32527b": "metallic_blue",
  "#32ad61": "asda_green_2002",
  "#32cd32": "limegreen",
  "#333300": "very_dark_olive",
  "#333366": "deep_koamaru",
  "#333399": "blue_pigment",
  "#3333cc": "indigo_sky",
  "#3333ff": "electric_blue",
  "#336600": "young_olive",
  "#336699": "dark_slate_blue",
  "#3366cc": "royal_blue",
  "#3366ff": "summer_sky",
  "#339966": "sea_green",
  "#33cc33": "light_green",
  "#33cccc": "sea_sky",
  "#33ccff": "light_sky_blue",
  "#347c98": "steel_blue",
  "#34b233": "wageningen_green",
  "#351e1c": "black_kite",
  "#352925": "betel_nut",
  "#354230": "kombu_green",
  "#355e3b": "deep_moss_green",
  "#35654d": "poker_green",
  "#360ccc": "interdimensional_blue",
  "#365194": "chinese_blue",
  "#374231": "thousand_year_old_green",
  "#38a32a": "vine_green",
  "#391285": "pixie_powder",
  "#39569c": "facebook_blue",
  "#3a243b": "deeppurple",
  "#3a6960": "blue_green_seiheki",
  "#3a86ff": "vivid_blue",
  "#3ab09e": "keppel",
  "#3b331c": "pullman_green",
  "#3b3429": "thousand_year_old_brown",
  "#3b3b6d": "american_blue",
  "#3b7a57": "amazon",
  "#3c1414": "dark_sienna",
  "#3c1874": "deep_indigo",
  "#3c341f": "dark_olive_drab",
  "#3cb44b": "pleasant_green",
  "#3cd070": "ufo_green",
  "#3d0c02": "black_bean",
  "#3d325d": "jacarta",
  "#3d4035": "storeroom_brown",
  "#3d5d42": "horsetail",
  "#3eb489": "mint",
  "#3f00ff": "electric_ultramarine",
  "#3f313a": "disappearing_purple",
  "#3f3351": "dark_lavender",
  "#3fff00": "harlequin",
  "#407a52": "patina_rokusho",
  "#40826d": "deep_aquamarine",
  "#413628": "jacko_bean",
  "#423629": "dark_taupe",
  "#42d4f4": "sky_blue",
  "#431c53": "american_purple",
  "#4363d8": "cobalt_blue",
  "#436b95": "queen_blue",
  "#43b3ae": "verdigris",
  "#444c38": "rifle_green",
  "#44798e": "jelly_bean_blue",
  "#44d7a8": "eucalyptus",
  "#450920": "burgundy_velvet",
  "#454d32": "pine_needle",
  "#45b8ac": "medium_turquoise",
  "#462255": "aubergine",
  "#465945": "gray_asparagus",
  "#4682b4": "steelblue",
  "#4682bf": "cyan_blue_azure",
  "#469990": "light_teal",
  "#46cb18": "harlequin_green",
  "#473f2d": "flirtatious_indigo_tea",
  "#47abcc": "maximum_blue",
  "#480607": "bulgarian_rose",
  "#483d8b": "darkslateblue",
  "#48bf84": "light_emerald",
  "#48bf91": "ocean_green",
  "#48d1cc": "mediumturquoise",
  "#490206": "dark_chocolate",
  "#491e3c": "rabbit_ear_iris",
  "#49796b": "hookers_green",
  "#4a2c2a": "brown_coffee",
  "#4a4e69": "independence2",
  "#4a5d23": "dark_moss_green",
  "#4a646c": "deep_space_sparkle",
  "#4aff00": "chlorophyll_green",
  "#4b0082": "indigo",
  "#4b3621": "cafe_noir",
  "#4bc7cf": "sea_serpent",
  "#4c2882": "spanish_violet",
  "#4c2f27": "acajou",
  "#4c516d": "independence",
  "#4c8bf5": "google_chrome_blue",
  "#4cbb17": "kelly_green",
  "#4d1a7f": "blue_violet_color_wheel",
  "#4d3b3c": "wisteria_and_burnt_bamboo",
  "#4d4b3a": "sooty_willow_bamboo",
  "#4d5d53": "feldgrau",
  "#4d8c57": "middle_green",
  "#4d8fac": "winter_sky",
  "#4e1609": "french_puce",
  "#4e5180": "purple_navy",
  "#4e82b4": "cyan_azure",
  "#4f284b": "purple_murasaki",
  "#4f42b5": "ocean_blue",
  "#4f7942": "fern_green",
  "#4f86f7": "blueberry",
  "#50404d": "purple_taupe",
  "#5072a7": "blue_yonder",
  "#512888": "ksu_purple",
  "#514100": "dark_bronze_coin",
  "#522d80": "regalia",
  "#523b35": "royal_brown",
  "#524b2a": "codium_fragile_seaweed",
  "#52593b": "blue_black_crayfish",
  "#534a32": "rikan_brown_rikancha",
  "#536872": "cadet",
  "#536878": "dark_electric_blue",
  "#536895": "ucla_blue",
  "#540b0e": "dark_maroon",
  "#542d24": "boiled_red_bean_brown",
  "#543d37": "dark_liver_horses",
  "#545a2c": "soldier_green",
  "#545aa7": "liberty",
  "#551b8c": "american_violet",
  "#553592": "blue_magenta_violet",
  "#555d50": "ebony",
  "#556b2f": "darkolivegreen",
  "#563c0d": "pineapple",
  "#568203": "avocado",
  "#56887d": "wintergreen_dream",
  "#56a0d3": "carolina_blue",
  "#577590": "airforce_greyblue",
  "#58427c": "cyber_grape",
  "#59260b": "seal_brown",
  "#592720": "caput_mortuum",
  "#59292c": "mulberry_dye",
  "#593a27": "weathered_bamboo",
  "#5946b2": "plump_purple",
  "#5a4f74": "safflower",
  "#5a4fcf": "iris",
  "#5a6457": "aloeswood_brown",
  "#5b0a91": "metallic_violet",
  "#5b3256": "japanese_violet",
  "#5b5ea6": "blue_lavender",
  "#5b8930": "fresh_onion_moegi",
  "#5b92e5": "united_nations_blue",
  "#5c4827": "nightingale_brown",
  "#5c544e": "mousy_indigo",
  "#5cff67": "lemon_lime_blue",
  "#5d1916": "philippine_brown",
  "#5d3954": "dark_byzantium",
  "#5d3a1a": "earthtone",
  "#5d3f6a": "bellflower",
  "#5d89ba": "silver_lake_blue",
  "#5d8cae": "storm_blue",
  "#5da493": "polished_pine",
  "#5e2824": "maroon",
  "#5e3d26": "dark_brown",
  "#5e5545": "iwai_brown_iwaicha",
  "#5e644f": "old_bamboo",
  "#5e8c31": "maximum_green",
  "#5fa777": "forest_green_crayola",
  "#5fa778": "shiny_shamrock",
  "#60281e": "chestnut_leather_brown",
  "#602f6b": "imperial",
  "#6050dc": "majorelle_blue",
  "#6082b6": "glaucous",
  "#614051": "eggplant",
  "#630f0f": "blood_organ",
  "#635147": "umber",
  "#635a52": "italian_leather",
  "#63775b": "axolotl",
  "#644117": "pullman_brown_ups_brown",
  "#6495ed": "cornflowerblue",
  "#650d1b": "claret_red",
  "#656255": "greyish_dark_green",
  "#65ff00": "green_slime",
  "#660000": "blood_red1",
  "#660033": "dark_red",
  "#6600cc": "deep_purple",
  "#6600ff": "vivid_violet",
  "#66023c": "imperial_purple",
  "#66033c": "spanish_purple",
  "#6622cc": "deepviolet",
  "#663300": "darkbrown",
  "#663399": "rebeccapurple",
  "#663854": "halaya_pink",
  "#664228": "van_dyke_brown",
  "#665343": "contemplation",
  "#665d1e": "antique_bronze",
  "#666633": "dark_olive_green",
  "#666699": "dark_lavenderblue",
  "#6699cc": "blue_gray",
  "#66b447": "apple",
  "#66c992": "asda_green_1999",
  "#66ccff": "light_azure",
  "#66cdaa": "mediumaquamarine",
  "#66ddaa": "medium_aquamarine",
  "#66ff00": "bright_green",
  "#66ff33": "spring_leaf",
  "#66ff66": "screamin_green",
  "#66ff99": "spearmint",
  "#66ffcc": "light_aqua",
  "#66ffff": "bleach",
  "#672422": "red_bean_color",
  "#674403": "violin_brown",
  "#674846": "rose_ebony",
  "#674c47": "liver",
  "#679267": "russian_green",
  "#682860": "palatinate_purple",
  "#68a0b0": "crystal_blue",
  "#6a040f": "red_oxide",
  "#6a0dad": "bright_purple",
  "#6a432d": "aloewood",
  "#6a5acd": "slateblue",
  "#6a7f7a": "rusted_light_blue",
  "#6b4423": "brown_nose",
  "#6b4947": "painite",
  "#6b5b95": "blue_purple",
  "#6b9362": "young_bamboo",
  "#6c2e1f": "liver_organ",
  "#6c3082": "eminence",
  "#6c541e": "field_drab",
  "#6ca0dc": "little_boy_blue",
  "#6d2b50": "vine_grape_ebizome",
  "#6d9bc3": "cerulean_frost",
  "#6e3a07": "philippine_bronze",
  "#6e5f57": "plain_mouse",
  "#6e6e30": "mustard_green",
  "#6eaea1": "green_sheen",
  "#6f00ff": "electric_indigo",
  "#6f2da8": "grape",
  "#6f3028": "cypress_bark_red",
  "#6f4e37": "coffee",
  "#6f9940": "palm_leaf",
  "#701c1c": "persian_plum",
  "#702670": "midnight",
  "#702963": "byzantium",
  "#704214": "sepia",
  "#704241": "deep_coffee",
  "#70543e": "mud",
  "#716675": "rum",
  "#71706e": "dark_silver",
  "#71a6d2": "iceberg",
  "#71bc78": "iguana_green",
  "#7209b7": "dark_purple",
  "#72a0c1": "air_superiority_blue",
  "#733380": "maximum_purple",
  "#733635": "garnet",
  "#734f96": "dark_lilac",
  "#7366bd": "blue_violet_crayola",
  "#737000": "bronze_yellow",
  "#738276": "smoke",
  "#738678": "xanadu",
  "#746cc0": "toolbox",
  "#749f8d": "pale_green_onion",
  "#74bbfb": "very_light_azure",
  "#74c365": "mantis",
  "#752e23": "cypress_bark_color",
  "#755d5b": "dove_feather_grey",
  "#757d75": "harbor_rat",
  "#763568": "iris_purple",
  "#766980": "mousy_wisteria",
  "#766ec8": "violet_blue_crayola",
  "#76d7ea": "sky_blue_crayola",
  "#774d8e": "pale_purple",
  "#777696": "rhythm",
  "#778ba5": "shadow_blue",
  "#779ecb": "periwinkle",
  "#78184a": "pansy_purple",
  "#7851a9": "royal_purple",
  "#78779b": "stained_red",
  "#78866b": "camouflage_green",
  "#796878": "old_lavender",
  "#7a942e": "siskin_sprout_yellow",
  "#7b1113": "up_maroon",
  "#7b3b3a": "deep_scarlet",
  "#7b3f00": "chocolate_traditional",
  "#7bb661": "bud_green",
  "#7c1c05": "kenyan_copper",
  "#7c98ab": "weldon_blue",
  "#7c9ed9": "vista_blue",
  "#7cfc00": "lawngreen",
  "#7d4e2d": "golden_grey_bamboo",
  "#7df9ff": "electric_sky",
  "#7ed4e6": "middle_blue",
  "#7f00ff": "violet_color_wheel",
  "#7f3e98": "cadmium_violet",
  "#7f5d3b": "japanese_iris",
  "#7f6b5d": "lye",
  "#7fff00": "chartreuse",
  "#7fffd4": "aquamarine",
  "#800000": "red_maroon",
  "#800080": "patriarch",
  "#804040": "american_brown",
  "#804a00": "dark_bronze",
  "#807532": "spanish_bistre",
  "#80c197": "asda_green_1994",
  "#81007f": "philippine_violet",
  "#811453": "french_plum",
  "#81613c": "coyote_brown",
  "#819c8b": "celadon_seiji",
  "#820000": "deep_maroon",
  "#826644": "raw_umber",
  "#828e84": "dolphin_gray",
  "#832a0d": "smokey_topaz",
  "#8338ec": "vibrant_purple",
  "#8366f4": "violets_are_blue",
  "#83781b": "brass_yellow",
  "#841617": "ou_crimson_red",
  "#850101": "deep_red",
  "#856088": "chinese_violet",
  "#856d4d": "french_bistre",
  "#85754e": "gold_fusion",
  "#857c55": "baiko_brown",
  "#85bb65": "dollar_bill",
  "#8601af": "violet_ryb",
  "#86608e": "french_lilac",
  "#86aba5": "aqua_blue",
  "#872657": "dark_raspberry",
  "#873260": "boysenberry",
  "#87413f": "brandy",
  "#87ceeb": "skyblue",
  "#87cefa": "lightskyblue",
  "#87ff2a": "spring_frost",
  "#8806ce": "french_violet",
  "#882d17": "kobe",
  "#88540b": "bronze1",
  "#8878c3": "ube",
  "#88ace0": "light_cobalt_blue",
  "#88b04b": "guacamole",
  "#88d8c0": "pearl_aqua",
  "#896c39": "yellow_sea_pine_brown",
  "#89729e": "wisteria_fuji",
  "#898a74": "rusty_celadon",
  "#89cff0": "baby_blue",
  "#8a2be2": "blueviolet",
  "#8a3324": "burnt_umber",
  "#8a496b": "twilight_lavender",
  "#8a9a5b": "moss_green",
  "#8b0000": "darkred",
  "#8b008b": "darkmagenta",
  "#8b171a": "strawberry_jam",
  "#8b4513": "saddlebrown",
  "#8b72be": "middle_blue_purple",
  "#8b7d3a": "moss_color",
  "#8ba8b7": "pewter_blue",
  "#8c4736": "sparrow_brown",
  "#8c92ac": "cool_grey",
  "#8c9c76": "pale_blue_usuao",
  "#8c9e5e": "willow_dye",
  "#8d4e85": "razzmic_berry",
  "#8d608c": "half_hashita",
  "#8da399": "morning_blue",
  "#8db600": "deep_apple_green",
  "#8dd9cc": "middle_blue_green",
  "#8ee53f": "kiwi",
  "#8f00ff": "electric_violet",
  "#8f1d21": "true_red",
  "#8f9779": "artichoke",
  "#8fbc8f": "darkseagreen",
  "#906652": "italian_roast",
  "#90be6d": "light_olive_green",
  "#90ee90": "lightgreen",
  "#913225": "dyestalk_red",
  "#913228": "red_kite",
  "#914e75": "sugar_plum",
  "#915c83": "antique_fuchsia",
  "#918151": "dark_tan",
  "#923c01": "iced_tea",
  "#92a1cf": "ceil",
  "#92a8d1": "rain_blue",
  "#933d41": "smoky_topaz",
  "#934337": "persimmon_juice_color",
  "#936900": "porcupine",
  "#9370db": "mediumpurple",
  "#93ccea": "cornflower",
  "#9400d3": "darkviolet",
  "#9457eb": "lavender_indigo",
  "#954535": "chestnut",
  "#955251": "rosewood",
  "#957b38": "finch_brown",
  "#963d7f": "violet_crayola",
  "#967117": "bistre_brown",
  "#9678b6": "purple_mountain_majesty",
  "#96c8a2": "eton_blue",
  "#96ded1": "pale_robin_egg_blue",
  "#96ff00": "mango_green",
  "#97645a": "plum_blossom_mouse",
  "#976e9a": "tatarian_aster",
  "#97867c": "silver_grey_ginnezumi",
  "#979aaa": "manatee",
  "#985629": "fox",
  "#987654": "pale_brown",
  "#98fb98": "palegreen",
  "#98ff98": "mint_green",
  "#990000": "crimson_red",
  "#990033": "dark_crimson",
  "#990099": "dark_red_violet",
  "#9900cc": "dark_violet",
  "#9900ff": "bright_violet",
  "#993300": "brown",
  "#993333": "indian_red",
  "#993366": "dark_mauve",
  "#9933ff": "electric_lilac",
  "#9955bb": "deep_lilac",
  "#996515": "golden_brown",
  "#996666": "copper_rose",
  "#9966ff": "medium_violet",
  "#997a8d": "mountbatten_pink",
  "#999966": "pale_olive",
  "#99cc00": "lime",
  "#99ff33": "light_chartreuse",
  "#99ff66": "light_lime",
  "#99ff99": "pale_green",
  "#99ffcc": "pale_mint",
  "#9b2335": "carmine",
  "#9b351b": "deep_dumpling",
  "#9b533f": "faded_spicy_red_brown",
  "#9b5de5": "vibrant_lavender",
  "#9b870c": "dark_yellow",
  "#9bc4e2": "pale_cerulean",
  "#9c51b6": "purple_plum",
  "#9c7c38": "metallic_sunburst",
  "#9c8a4d": "willow_tea",
  "#9c8aa4": "deep_amethyst",
  "#9e1316": "spartan_crimson",
  "#9efd38": "french_lime",
  "#9f00ff": "blue_lilac",
  "#9f2b68": "amaranth_deep_purple",
  "#9f4576": "magenta_haze",
  "#9f7462": "walnut_dyed",
  "#9fe2bf": "sea_foam_green",
  "#a020f0": "purple_x11",
  "#a0522d": "sienna",
  "#a09484": "stone_terrace",
  "#a0e6ff": "winter_wizard",
  "#a13d2d": "red_brown",
  "#a17a74": "burnished_brown",
  "#a1caf1": "baby_blue_eyes",
  "#a2006d": "flirt",
  "#a23bec": "child_purple",
  "#a24f46": "sappanwood_incense",
  "#a2a2d0": "blue_bell",
  "#a2add0": "wild_blue",
  "#a45a52": "redwood",
  "#a4b086": "sage_green",
  "#a4f4f9": "waterspout",
  "#a55353": "middle_red_purple",
  "#a57c00": "gold",
  "#a5ba93": "whitish_green",
  "#a62c2b": "metallic_red",
  "#a63a79": "maximum_red_purple",
  "#a67b5b": "cafe_au_lait",
  "#a6d608": "vivid_lime_green",
  "#a72127": "rambutan_red",
  "#a76bcf": "rich_lavender",
  "#a7f432": "green_lizard",
  "#a7fc00": "spring_bud",
  "#a87ca0": "thin_usu",
  "#a8a9ad": "chrome_aluminum",
  "#a8c3bc": "opal",
  "#a96232": "clove_dyed_chojizome",
  "#a99a86": "grullo",
  "#a9a9a9": "darkgray",
  "#a9b2c3": "cadet_blue_crayola",
  "#a9ba9d": "laurel_green",
  "#aa00bb": "heliotrope_magenta",
  "#aa381e": "chinese_red",
  "#aa6c39": "dark_gold",
  "#aa8736": "pale_fallen_leaves",
  "#aa98a9": "heliotrope_gray",
  "#aaf0d1": "magic_mint",
  "#ab4b52": "english_red",
  "#ab4c3d": "wilted_brown",
  "#ab4e52": "rose_vale",
  "#ab92b3": "glossy_grape",
  "#abcdef": "pale_cornflower_blue",
  "#ac8181": "cherry_blossom_mouse",
  "#acace6": "maximum_blue_purple",
  "#acbf60": "middle_green_yellow",
  "#ace1af": "celadon",
  "#ace5ee": "blizzard_blue",
  "#ad4379": "mystic_maroon",
  "#ad6f69": "copper_penny",
  "#add8e6": "lightblue",
  "#addfad": "light_moss_green",
  "#adff2f": "greenyellow",
  "#ae2029": "upsdell_red",
  "#ae98aa": "lilac_luster",
  "#aec6cf": "pastel_blue",
  "#af4035": "medium_carmine",
  "#af593e": "brown_crayola",
  "#afeeee": "pale_blue_pale_turquoise",
  "#afff45": "apple_green",
  "#b05c52": "giants_club",
  "#b07939": "durian",
  "#b0c24a": "margarita",
  "#b0c4de": "lightsteelblue",
  "#b17304": "philippine_gold",
  "#b19cd9": "light_pastel_purple",
  "#b21807": "tomato_sauce",
  "#b284be": "african_violet",
  "#b29700": "light_gold",
  "#b2beb5": "ash_gray",
  "#b2ffff": "celeste",
  "#b31b1b": "carnelian",
  "#b35c44": "spicy_red_brown",
  "#b39eb5": "pastel_purple",
  "#b53389": "fandango",
  "#b56257": "electric_brown",
  "#b5651d": "light_brown",
  "#b5651e": "dirty_brown",
  "#b565a7": "orchid",
  "#b57edc": "lavender_floral",
  "#b5a642": "brass",
  "#b5b35c": "olive_green",
  "#b5ead7": "child_mint",
  "#b7410e": "rust",
  "#b768a2": "pearly_purple",
  "#b784a7": "opera_mauve",
  "#b78727": "university_of_california_gold",
  "#b80ce3": "vivid_mulberry",
  "#b86d29": "liver_dogs",
  "#b94e48": "deep_chestnut",
  "#b95754": "long_spring",
  "#b9a193": "white_mouse",
  "#ba0001": "ue_red",
  "#ba160c": "international_orange1",
  "#ba55d3": "mediumorchid",
  "#ba93d8": "lenurple",
  "#bb3385": "red_magenta",
  "#bbb477": "misty_moss",
  "#bc243c": "red",
  "#bc8f8f": "rosybrown",
  "#bcb88a": "sage",
  "#bd559c": "rose_quartz_pink",
  "#bd9b16": "gold_foil",
  "#bda928": "greenfinch",
  "#bdb76b": "darkkhaki",
  "#bf00ff": "electric_purple",
  "#bf4f51": "bittersweet_shimmer",
  "#bf94e4": "bright_lavender",
  "#bfbd70": "pomelo_olive",
  "#bfc0ee": "vodka",
  "#bfff00": "bitter_lime",
  "#c0448f": "red_violet_crayola",
  "#c08081": "old_rose",
  "#c09999": "tuscany",
  "#c154c1": "deep_fuchsia",
  "#c1f9a2": "menthol",
  "#c21460": "raspberry",
  "#c23b22": "dark_pastel_red",
  "#c2b280": "ecru",
  "#c3272b": "pure_crimson",
  "#c3cde6": "periwinkle_crayola",
  "#c46210": "alloy_orange",
  "#c4d8e2": "columbia_blue",
  "#c54b8c": "mulberry",
  "#c57f2e": "mulberry_orange",
  "#c5b358": "vegas_gold",
  "#c5e384": "yellow_green_crayola",
  "#c68e17": "caramel",
  "#c71585": "mediumvioletred",
  "#c7ceea": "lavender_blue",
  "#c84186": "smitten",
  "#c8509b": "mulberry_crayola",
  "#c86500": "asda_orange",
  "#c8a2c8": "lilac",
  "#c9a0dc": "wisteria",
  "#c9ffe5": "aero_blue",
  "#ca1f7b": "magenta_dye",
  "#ca2c92": "royal_fuchsia",
  "#ca7309": "asda_orange_1968",
  "#cae00d": "bitter_lemon",
  "#cb6649": "muddy_brown",
  "#cb99c9": "pastel_violet",
  "#cba135": "satin_sheen_gold",
  "#cc0066": "vivid_raspberry",
  "#cc0099": "strong_magenta",
  "#cc00cc": "deep_magenta",
  "#cc00ff": "vivid_orchid",
  "#cc3336": "madder_lake",
  "#cc338b": "magenta_pink",
  "#cc3399": "medium_red_violet",
  "#cc33cc": "steel_pink",
  "#cc33ff": "bright_orchid",
  "#cc474b": "english_vermillion",
  "#cc5500": "burnt_orange",
  "#cc6600": "orange_brown",
  "#cc6666": "fuzzy_wuzzy",
  "#cc6699": "medium_pink",
  "#cc66ff": "medium_orchid",
  "#cc99cc": "light_grayish_magenta",
  "#cc99ff": "pale_violet",
  "#cca01d": "lemon_curry",
  "#ccccff": "palelavender",
  "#ccff00": "electric_lime",
  "#ccff33": "light_lime_green",
  "#ccff66": "pale_yellow_green",
  "#cd5700": "tenne_tawny",
  "#cd5b45": "dark_coral",
  "#cd5c5c": "indianred",
  "#cd7f32": "bronze",
  "#cd8032": "chinese_bronze",
  "#cd853f": "peru",
  "#cda4de": "tropical_violet",
  "#cec8ef": "soap",
  "#ceff00": "volt",
  "#cf6ba9": "super_pink",
  "#cf71af": "sky_magenta",
  "#cfb53b": "old_gold",
  "#d0db61": "chinese_green",
  "#d0f0c0": "tea_green",
  "#d0ff14": "arctic_lime",
  "#d19fe8": "bright_ube",
  "#d1bea8": "dark_vanilla",
  "#d1e189": "lime_pulp",
  "#d1e231": "pear",
  "#d2c29d": "pale_tan",
  "#d2d9db": "aluminum_foil",
  "#d3212d": "amaranth_red",
  "#d3419d": "barbie_pink_1975",
  "#d39bcb": "light_medium_orchid",
  "#d3af37": "american_gold",
  "#d3b17d": "steamed_chestnut",
  "#d3d3d3": "lightgray",
  "#d470a2": "wild_orchid",
  "#d473d4": "deep_mauve",
  "#d4af37": "gold_metallic",
  "#d4f1f9": "water",
  "#d74894": "pink_pantone",
  "#d7837f": "new_york_pink",
  "#d891ef": "bright_lilac",
  "#d8b2d1": "pink_lavender",
  "#d8bfd8": "thistle",
  "#d8e4bc": "gin",
  "#d92121": "maximum_red",
  "#d9381e": "vermilion",
  "#d9463e": "strawberry_daiquiri",
  "#d982b5": "middle_purple",
  "#d99559": "sand",
  "#d9e650": "maximum_green_yellow",
  "#da1d81": "vivid_cerise",
  "#da680f": "metallic_orange",
  "#da70d6": "orchid",
  "#daa520": "sunflower_yellow",
  "#dbd7d2": "timberwolf",
  "#dda0dd": "medium_lavender_magenta",
  "#ddadaf": "pale_chestnut",
  "#dde26a": "bored_accent_green",
  "#de5246": "google_chrome_red",
  "#dea5a4": "pastel_pink",
  "#df00ff": "phlox",
  "#df6124": "vivid_red_tangelo",
  "#df73ff": "heliotrope",
  "#dfff00": "chartreuse_traditional",
  "#e0218a": "barbie_pink_pantone",
  "#e0b0ff": "mauve",
  "#e0bc5b": "lanzones",
  "#e0ffff": "lightcyan",
  "#e15d44": "terracotta",
  "#e1ad01": "mustard_yellow",
  "#e1ad21": "urobilin",
  "#e1bd27": "durian_yellow",
  "#e25098": "raspberry_pink",
  "#e2725b": "terra_cotta",
  "#e29cd2": "orchid_crayola",
  "#e2f0cb": "pale_spring",
  "#e3a857": "indian_yellow",
  "#e3ab57": "sunray",
  "#e3b130": "rape_blossom_brown",
  "#e4000f": "nintendo_red",
  "#e40078": "red_purple",
  "#e4007c": "mexican_pink",
  "#e4d00a": "citrine",
  "#e4d96f": "straw",
  "#e56024": "vivid_vermilion",
  "#e58e73": "middle_red",
  "#e5b73b": "meat_brown",
  "#e5ccc9": "dust_storm",
  "#e60000": "electric_red",
  "#e69b3a": "turmeric",
  "#e6a8d7": "light_orchid",
  "#e6e200": "peridot",
  "#e6e6fa": "lavender_mist",
  "#e71d36": "strong_carmine",
  "#e73895": "royal_pink",
  "#e79fc4": "kobi",
  "#e7accf": "pink_pearl",
  "#e8000d": "ku_crimson",
  "#e88e5a": "big_foot_feet",
  "#e8e4c9": "dirty_white",
  "#e8f48c": "key_lime",
  "#e936a7": "frostbite",
  "#e9399e": "strong_boy_pink",
  "#e95c4b": "fire_opal",
  "#e9967a": "darksalmon",
  "#e9d66b": "arylide_yellow",
  "#e9edf6": "coconut_white",
  "#eae0c8": "pearl",
  "#ebb0d7": "thistle_crayola",
  "#ebecf0": "bright_gray",
  "#ec1c24": "verizon_red",
  "#eccfcf": "lotion_pink",
  "#ecd540": "sandstorm",
  "#ecebbd": "pale_spring_bud",
  "#ed1c24": "huawei_red",
  "#edc9af": "desert_sand",
  "#ee82ee": "lavender_magenta",
  "#eed202": "safety_yellow",
  "#eedc82": "flax",
  "#eee600": "titanium_yellow",
  "#eeff1b": "watermelon_yellow",
  "#ef3038": "deep_carmine_pink",
  "#ef3939": "vivaldi_red",
  "#efdecd": "almond",
  "#efdfbb": "dutch_white",
  "#efff04": "neon_yellow",
  "#f04e1f": "microsoft_red",
  "#f07f5e": "red_incense",
  "#f08080": "lightcoral",
  "#f08f90": "one_kin",
  "#f0dc82": "buff",
  "#f0e130": "dandelion",
  "#f0e68c": "light_khaki",
  "#f0ead6": "eggshell",
  "#f0f8ff": "aliceblue",
  "#f0fff0": "honeydew",
  "#f0ffff": "azure_mist",
  "#f15bb5": "vibrant_light_magenta",
  "#f1a7fe": "rich_brilliant_lavender",
  "#f1ddcf": "champagne_pink",
  "#f28e1c": "beer",
  "#f2d930": "margarine",
  "#f2e2e0": "very_pale_pink",
  "#f2f0e6": "alabaster",
  "#f2f27a": "sunny",
  "#f2f3f4": "anti_flash_white",
  "#f3722c": "deep_orange",
  "#f37a48": "mandarin",
  "#f3c13a": "amur_cork_tree",
  "#f3e5ab": "medium_champagne",
  "#f400a1": "fashion_fuchsia",
  "#f49ac2": "orchid_pink",
  "#f4b9b8": "pale_blush",
  "#f4bbff": "brilliant_lavender",
  "#f4c2c2": "baby_pink",
  "#f4c430": "saffron",
  "#f57f4f": "rich_gardenia",
  "#f58231": "orange",
  "#f5e050": "minion_yellow",
  "#f5f5dc": "beige",
  "#f6a08c": "poppy_petal",
  "#f6a494": "coral_reef",
  "#f6b511": "spanish_yellow",
  "#f7238a": "barbie_pink_1999",
  "#f7bfbe": "spanish_pink",
  "#f7cac9": "light_pink",
  "#f8674f": "coral_color",
  "#f8f4ff": "magnolia",
  "#f94144": "strong_red",
  "#f9429e": "rose_bonbon",
  "#f94d00": "tangelo",
  "#f984e5": "pale_magenta",
  "#f984ef": "light_fuchsia_pink",
  "#f9906f": "meat_color",
  "#f9ffe3": "pomelo_white",
  "#fa1a8e": "philippine_pink",
  "#fa5b3d": "orange_soda",
  "#fa6e79": "begonia",
  "#fa7b62": "dawn_color",
  "#fa8072": "salmon",
  "#fae7b5": "banana_mania",
  "#faebd7": "antiquewhite",
  "#faf0be": "blond",
  "#faf0e6": "linen",
  "#fafa37": "maximum_yellow",
  "#fafad2": "lightgoldenrodyellow",
  "#fb0081": "flickr_pink",
  "#fb4d46": "tart_orange",
  "#fba0e3": "lavender_rose",
  "#fbcce7": "classic_rose",
  "#fbec5d": "corn",
  "#fc74fd": "pink_flamingo",
  "#fca474": "pale_persimmon",
  "#fcf75e": "icterine",
  "#fd4900": "xiaomi_orange",
  "#fd5800": "willpower_orange",
  "#fd7c6e": "coral_reef1",
  "#fdbcb4": "melancholy",
  "#fdcc0d": "metallic_yellow",
  "#fdee00": "aureolin",
  "#fdf5e6": "oldlace",
  "#fdfd96": "pastel_yellow",
  "#fdfe03": "sponge",
  "#fdff00": "lemon_glacier",
  "#fe28a2": "persian_rose",
  "#fe5a1d": "giants_orange",
  "#fe6f5e": "bittersweet",
  "#fed8b1": "peach_cream",
  "#fedf00": "yellow_pantone",
  "#fef65b": "dodie_yellow",
  "#fefe33": "yellow_ryb",
  "#ff006e": "neon_pink",
  "#ff007c": "sunset",
  "#ff007f": "bright_pink",
  "#ff0090": "magenta_process",
  "#ff00ff": "fuchsia",
  "#ff1493": "deeppink",
  "#ff1dce": "hot_magenta",
  "#ff2400": "chili_red",
  "#ff2800": "ferrari_red",
  "#ff3300": "red_orange",
  "#ff3399": "deep_pink",
  "#ff33cc": "razzle_dazzle_rose",
  "#ff3503": "electric_orange",
  "#ff3800": "coquelicot",
  "#ff4040": "coral_red",
  "#ff404c": "sunburnt_cyclops",
  "#ff4057": "salmon_pink",
  "#ff43a4": "wild_strawberry",
  "#ff4500": "red_orange_color_wheel",
  "#ff4f00": "international_orange",
  "#ff5349": "orange_red_brown",
  "#ff5500": "mystic_red",
  "#ff5800": "orange1",
  "#ff5a36": "portland_orange",
  "#ff5b00": "maximum_orange",
  "#ff5ccd": "light_deep_pink",
  "#ff6347": "tomato",
  "#ff6600": "classic_orange",
  "#ff66cc": "rose_pink",
  "#ff66ff": "magentapink",
  "#ff6700": "safety_orange_blaze",
  "#ff69b4": "hotpink",
  "#ff7538": "papaya",
  "#ff77ff": "fuchsia_pink",
  "#ff7a00": "heat_wave",
  "#ff7e00": "amber_saeece",
  "#ff7f00": "primary_orange",
  "#ff85cf": "princess_perfume",
  "#ff8936": "daylily",
  "#ff968a": "light_coral",
  "#ff9899": "american_pink",
  "#ff9999": "light_salmon_pink",
  "#ff99ff": "bubblegum",
  "#ff9a00": "weebly_orange",
  "#ff9f00": "orange_peel",
  "#ffa07a": "lightsalmon",
  "#ffa089": "vivid_tangerine",
  "#ffa26b": "stylish_persimmon",
  "#ffa343": "neon_carrot",
  "#ffa400": "dark_golden_yellow",
  "#ffa600": "cheese",
  "#ffb7b2": "light_blush",
  "#ffc0cb": "pink",
  "#ffcc99": "peach_orange",
  "#ffcccb": "light_red",
  "#ffccff": "rosa",
  "#ffcff1": "shampoo",
  "#ffd300": "cyber_yellow",
  "#ffd800": "school_bus_yellow",
  "#ffdb00": "sizzling_sunrise",
  "#ffdd05": "sprint_yellow",
  "#ffddf4": "pink_lace",
  "#ffdf46": "gargoyle_gas",
  "#ffe135": "banana_yellow",
  "#ffe302": "vivid_yellow",
  "#ffe4e1": "mistyrose",
  "#ffef00": "canary_yellow",
  "#fff000": "yellow_rose",
  "#fff44f": "lemon_yellow",
  "#fff600": "cadmium_yellow",
  "#fff700": "lemon",
  "#fffacd": "lemonchiffon",
  "#fffaf0": "floralwhite",
  "#fffdd0": "cream",
  "#ffff31": "daffodil",
  "#ffff33": "electric_yellow",
  "#ffff66": "laser_lemon",
  "#ffff99": "canary",
  "#ffffcc": "conditioner",
  "#ffffe0": "lightyellow"
});
function palVariety(hex, n, hues = 300) {
  const [h, s, l] = clrHexToHsl(hex); // assumes this converter exists
  console.log(hex, h, s, l);

  return Array.from({ length: n }, (_, i) => {
    const hue = (h + (i * hues) / n) % 360;
    return clrHslToHex(hue, s, l);
  });
}
function palVariety(hex, n, hues = 300) {
  hex = clrHex(hex);
  if (n < 1) return [];

  // LCH is LAB expressed as lightness, chroma, and hue.
  const [L, C, H] = clrToPolar(clrRgbToLab(...clrHexToRgb(hex)));

  return Array.from({ length: n }, (_, i) => {
    const hue = (H + (n > 1 ? i * hues / (n - 1) : 0)) % 360;
    return clrRgbToHex(...clrLabToRgb(...clrFromPolar([L, C, hue])));
  });
}
function palVariety(hex, n) {
  hex = clrHex(hex);
  if (n < 1) return [];

  const [L, C, H] = clrToPolar(clrRgbToLab(...clrHexToRgb(hex)));

  return Array.from({ length: n }, (_, i) => {
    const chroma = n > 1 ? C * (1 - i / (n - 1)) : C;
    return clrRgbToHex(...clrLabToRgb(...clrFromPolar([L, chroma, H])));
  });
}
function palVariety(hex, n, hues = 360) {
  hex = clrHex(hex);
  if (n < 1) return [];

  const [L0, C0, H0] = clrToPolar(
    clrRgbToLab(...clrHexToRgb(hex))
  );

  const fits = (L, C, H) =>
    clrLabToRgb(...clrFromPolar([L, C, H]))
      .every(v => v >= -0.005 && v <= 255.005);

  const fitChroma = (L, C, H) => {
    if (fits(L, C, H)) return C;

    let low = 0;
    let high = C;

    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (fits(L, mid, H)) low = mid;
      else high = mid;
    }

    return low;
  };

  const lightnessSpan = Math.min(24, L0, 100 - L0);

  return Array.from({ length: n }, (_, i) => {
    const hue = (H0 + i * hues / n) % 360;
    const step = Math.ceil(i / 2);
    const direction = i === 0 ? 0 : i % 2 ? 1 : -1;
    // const lightness = Math.max(
    //   5,
    //   Math.min(95, L0 + direction * (0.35 + 0.65 * step / Math.ceil(n / 2)) * lightnessSpan)
    // );
    const isYellow = hue >= 45 && hue <= 100;
    const lightness = isYellow
      ? Math.max(75, L0)
      : Math.max(5, Math.min(95, L0 + direction * lightnessSpan)); const chroma = fitChroma(lightness, C0, hue);

    return clrRgbToHex(
      ...clrLabToRgb(...clrFromPolar([lightness, chroma, hue]))
    );
  });
}
function palVariety(hex, n, hues = 300, l = 0, s = 0) {
  hex = clrHex(hex);
  if (n < 1) return [];

  const [h0, s0, l0] = clrRgbToHsl(...clrHexToRgb(hex));
  const lightnessOffsets = [0, ...(Array.isArray(l) ? l : [l])];
  const saturationOffsets = [0, ...(Array.isArray(s) ? s : [s])];

  return Array.from({ length: n }, (_, i) => {
    const hue = (h0 + i * hues / n) % 360;

    return lightnessOffsets.flatMap(lightnessOffset =>
      saturationOffsets.map(saturationOffset =>
        clrHslToHex(
          hue,
          Math.max(0, Math.min(100, s0 + saturationOffset)),
          ((l0 + lightnessOffset) % 100 + 100) % 100
        )
      )
    );
  }).flat();
}
function palVariety(hex, n, hues = 300, l = [-10, 10], s = 0) {
  hex = clrHex(hex);
  if (n < 1) return [];

  const [h0, s0, l0] = clrRgbToHsl(...clrHexToRgb(hex));
  const lightnessOffsets = Array.isArray(l) ? l : [l];
  const saturationOffsets = Array.isArray(s) ? s : [s];

  return Array.from({ length: n }, (_, i) => {
    const hue = (h0 + i * hues / n) % 360;
    const lightness = (l0 + lightnessOffsets[i % lightnessOffsets.length] % 100 + 100) % 100;
    const saturationOffset = saturationOffsets[i % saturationOffsets.length];

    return clrHslToHex(
      hue,
      Math.max(0, Math.min(100, s0 + saturationOffset)),
      lightness
    );
  });
}
function palVariety(hex, n) {
  if (n < 1) return [];

  const anchors = [
    "#ff0000", // red
    "#ffff00", // yellow
    "#00ff00", // green
    "#00ffff", // cyan
    "#0000ff", // blue
    "#ff00ff", // magenta
  ];

  // Begin with the anchor closest in hue to the starting color.
  const [startH] = clrRgbToHsl(...clrHexToRgb(clrHex(hex)));
  const startIndex = anchors
    .map((color, i) => {
      const [h] = clrRgbToHsl(...clrHexToRgb(color));
      const distance = Math.abs(((h - startH + 540) % 360) - 180);
      return { i, distance };
    })
    .sort((a, b) => a.distance - b.distance)[0].i;

  const ordered = anchors.map((_, i) => anchors[(startIndex + i) % anchors.length]);

  if (n <= anchors.length) {
    return Array.from({ length: n }, (_, i) => ordered[
      Math.round(i * anchors.length / n) % anchors.length
    ]);
  }

  // Distribute extra colors between adjacent anchors in OKLCH.
  const extraCount = n - anchors.length;
  const extrasPerSegment = Array(anchors.length).fill(
    Math.floor(extraCount / anchors.length)
  );

  for (let i = 0; i < extraCount % anchors.length; i++) {
    extrasPerSegment[i]++;
  }

  return ordered.flatMap((color, i) => {
    const next = ordered[(i + 1) % ordered.length];
    const count = extrasPerSegment[i];

    const between = count
      ? clrMixMany(color, next, Array.from(
        { length: count },
        (_, j) => (j + 1) / (count + 1)
      ), "oklch")
      : [];

    return [color, ...between];
  });
}
function palVariety(hex, n, anchors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff",]) {
  if (n < 1) return [];

  const selected = anchors.slice(0, n).map(clrHex);
  if (selected.length < anchors.length && n < anchors.length) {
    throw new RangeError("n must be at least the number of anchors");
  }
  if (n <= selected.length) return selected;

  const toLab = hex => clrRgbToOklab(...clrHexToRgb(hex));
  const distanceSquared = (a, b) =>
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2;

  const selectedLabs = selected.map(toLab);
  const levels = Array.from({ length: 16 }, (_, i) => i * 16).concat(255);
  const candidates = [];

  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const color = clrRgbToHex(r, g, b);
        if (!selected.includes(color)) {
          candidates.push({ color, lab: clrRgbToOklab(r, g, b) });
        }
      }
    }
  }

  while (selected.length < n && candidates.length) {
    let bestIndex = 0;
    let bestDistance = -1;

    for (let i = 0; i < candidates.length; i++) {
      const minDistance = Math.min(
        ...selectedLabs.map(lab => distanceSquared(candidates[i].lab, lab))
      );
      if (minDistance > bestDistance) {
        bestDistance = minDistance;
        bestIndex = i;
      }
    }

    const [best] = candidates.splice(bestIndex, 1);
    selected.push(best.color);
    selectedLabs.push(best.lab);
  }

  return selected;
}
function palVariety(hex, n, anchors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff",]) {
  if (n < 1) return [];

  const selected = anchors.slice(0, n).map(clrHex);
  let na = anchors.length;
  //how many different pairs can I make with anchors?
  let np = Math.pow(na, 2) - na;
  console.log(np);
  //how many colors per pair do I need to complete the palette?
  let nc = Math.ceil(n / np);
  console.log(nc);
  for (let i = 0; i < anchors.length; i++) {
    for (let j = i + 1; j < anchors.length; j++) {
      let color = clrMix(anchors[i], anchors[j], .5);
      selected.push(color);
      // colors.map(x=>selected.push(x));
      if (selected.length >= n) return selected;
    }
  }
  for (let i = 0; i < n - selected.length; i++) {
    selected.push(clrRandom());
  }
  return selected;
}

function clrRandom(space = 'hsl', opts = {}) {
  let sp = CLR_SPACES[space], [names, ...defaults] = CLR_RANGES[space] ?? [];
  if (!sp || !names) throw new Error('clrRandom: unknown space ' + space);

  let coords = names.split('').map((ch, i) => {
    let o = opts[ch], [lo, hi] = o === undefined ? defaults[i] : Array.isArray(o) ? o : [o, o];
    let span = hi - lo;
    if (i === sp.hue && span < 0) span += 360; // handle wrap like [350, 20]
    let v = lo + Math.random() * span;
    return i === sp.hue ? (v % 360 + 360) % 360 : v;
  });

  let hex = clrRgbToHex(...sp.from(coords));
  if (opts.a !== undefined) {
    let alpha = Array.isArray(opts.a) ? opts.a[0] + Math.random() * (opts.a[1] - opts.a[0]) : opts.a;
    let aHex = Math.round(clrClamp(alpha, 0, 100) * 2.55).toString(16).padStart(2, '0');
    return hex + aHex;
  }
  return hex;
}
function palFrom(hex, n = 5, space = 'hsl', opts = {}) {
  let sp = CLR_SPACES[space];
  let [names, ...defaults] = CLR_RANGES[space] ?? [];
  if (!sp || !names) throw new Error('palFrom: unknown space ' + space);

  let baseRgb = clrHexToRgb(clrHex(hex));
  let baseCoords = sp.to(baseRgb);

  // Extract optional 2-char base alpha if present (e.g. #ff000080 -> 50%)
  let baseAlpha = hex.length === 9 ? parseInt(hex.slice(7), 16) / 2.55 : 100;

  return Array.from({ length: n }, (_, k) => {
    let t = n > 1 ? k / (n - 1) : 0;

    let coords = names.split('').map((ch, i) => {
      let o = opts[ch];
      if (o === undefined) return baseCoords[i]; // maintain base value
      let [lo, hi] = Array.isArray(o) ? o : [o, o];
      let span = hi - lo;
      if (i === sp.hue && span < 0) span += 360;
      let v = lo + span * t;
      return i === sp.hue ? (v % 360 + 360) % 360 : v;
    });

    let resHex = clrRgbToHex(...sp.from(coords));

    // Handle alpha if specified in opts or base color
    let aVal = opts.a !== undefined ? (Array.isArray(opts.a) ? opts.a[0] + (opts.a[1] - opts.a[0]) * t : opts.a) : (hex.length === 9 ? baseAlpha : undefined);
    if (aVal !== undefined) {
      let aHex = Math.round(clrClamp(aVal, 0, 100) * 2.55).toString(16).padStart(2, '0');
      return resHex + aHex;
    }
    return resHex;
  });
}

function clrRandom(n, opts = {}, space = 'lab') {
  let sp = CLR_SPACES[space], [names, ...ranges] = CLR_RANGES[space] ?? [];
  if (!sp || !names) throw new Error('clrRandom: unknown space ' + space);
  let rnd = opts.rand ?? Math.random, md2 = (opts.minDist ?? 0) ** 2, res = [], labs = [], first = true;
  let shuffled = () => { let a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { let j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  let ch = ranges.map((r, i) => {                                   // per channel: [lo, span, mode, phase, order]
    let o = opts[names[i]] ?? [...r, 'random'];                     // not given: whole range, random
    if (!isList(o)) o = [o, o];                                     // a single number: fixed
    let [lo, hi, mode = i === sp.hue ? 'spread' : 'random'] = o;    // hue ranges are spread by default
    let order = mode == 'spread' && !first ? shuffled() : null;     // 2nd, 3rd... spread channel: shuffled, so channels don't move in lockstep
    if (mode == 'spread') first = false;
    return [lo, hi - lo + (i === sp.hue && hi < lo ? 360 : 0), mode, rnd(), order];
  });
  let pick = k => ch.map(([lo, span, mode, ph, order], i) => {
    let v = lo + span * (mode == 'random' ? rnd() : mode == 'same' ? ph : (ph + (order ? order[k] : k) / n) % 1);
    return i === sp.hue ? (v % 360 + 360) % 360 : v;
  });
  let tries = ch.some(c => c[2] == 'random' && c[1]) ? 200 : 1;     // nothing random left: one try is enough
  while (res.length < n) {
    let hex, lab;
    for (let t = 0; t < tries; t++) {                               // rejection sampling, best effort after the last try
      let rgb = sp.from(pick(res.length));
      if (t < tries - 1 && !rgb.every(v => v > -0.5 && v < 255.5)) continue;   // outside the sRGB gamut
      hex = clrRgbToHex(...rgb);
      if (!md2) break;
      lab = clrRgbToLab(...clrHexToRgb(hex));
      if (labs.every(l => (l[0] - lab[0]) ** 2 + (l[1] - lab[1]) ** 2 + (l[2] - lab[2]) ** 2 >= md2)) break;
    }
    res.push(hex); if (md2) labs.push(lab);
  }
  return res;
}
function mStyle(elem, styles = {}) {
  elem = toElem(elem);
  const target = elem.style || elem;

  for (let key in styles) {
    let val = styles[key];

    // Resolve shorthand or functional properties first
    let prop = STYLES[key] || key;
    if (typeof prop === 'function') [prop, val] = prop(val);

    // If val is null or undefined, delete/remove the property or attribute
    if (val == null) {
      if (prop in target) {
        target[prop] = ''; // Setting to empty string removes style declaration in JS
      } else if (elem.nodeType) {
        elem.removeAttribute(prop);
      }
      continue;
    }

    // Auto-append 'px' for numeric values
    if (typeof val === 'number' && !NO_UNIT.has(prop)) val += 'px';

    // Single assignment branch
    if (prop in target) target[prop] = val;
    else if (elem.nodeType) elem.setAttribute(prop, val);
  }

  return elem;
}

//#endregion

//#region m gemini


/**
 * Efficiently applies styles to an HTML/SVG element or plain object.
 * @param {HTMLElement|Object} elem - Target element or style dictionary.
 * @param {Object} styles - Key-value pair of styles to apply.
 * @returns {HTMLElement|Object} The mutated target.
 */
function mStyle(elem, styles) {
  if (!elem || !styles) return elem;

  // Resolve root target element and actual style object
  const target = elem.nodeType ? elem : null;
  const targetStyle = target ? target.style : elem;

  for (let key in styles) {
    let val = styles[key];
    if (val == null) continue;

    // Look up key alias or transformation function in dictionary
    const lookup = STYLES[key] || ST_EXT[key] || key;
    let prop = lookup, computedVal = val;

    if (typeof lookup === 'function') {
      const res = lookup(val, styles.bg);
      if (Array.isArray(res)) [prop, computedVal] = res;
      else if (typeof res === 'object') {
        mStyle(elem, res); // Recursive application for object generators (e.g. grid/flex)
        continue;
      }
    } else if (Array.isArray(lookup)) {
      [prop, computedVal] = lookup;
    }

    // Auto-append 'px' for numeric values on standard layout properties
    if (typeof computedVal === 'number' && !NO_UNIT_STYLES.some(s => prop.includes(s))) {
      computedVal += 'px';
    }

    // Direct DOM property assignment vs CSS Style declaration setting
    if (target) {
      if (prop in targetStyle) {
        targetStyle[prop] = computedVal;
      } else if (prop in target) {
        target[prop] = computedVal; // Direct DOM properties like innerHTML or contenteditable
      } else {
        targetStyle.setProperty(prop, computedVal); // Kebab-case CSS variables / fallback
      }
    } else {
      targetStyle[prop] = computedVal;
    }
  }

  return elem;
}

//#endregion

//#region m claude

// Style shortcuts for mStyle / mDom. A key is looked up in STYLES first, otherwise it is used as a css property
// (camelCase or kebab-case). STYLES values: 'css-prop' = rename, ['css-prop', value] = constant (applied when truthy),
// function = returns a value, ['css-prop', value] or { css-prop: value, ... }. Numbers get 'px' unless unitless.
const px = x => isNumber(x) && x !== '' ? x + 'px' : x;
const hv = v => (v + '').split(' ').reverse().map(px).join(' ');   // 'h v' -> css order 'v h'
const auto = v => isNumber(v) ? `repeat(auto-fill,${v}px)` : isString(v) ? v : 'repeat(auto-fill,1fr)';
const rep = v => isNumber(v) ? `repeat(${v},1fr)` : v;
function line(v) {   // 2 | 'red' | '2 red' | 'red 2' | 'none' | any full css value
  let p = (v + '').split(' '), i = p.findIndex(x => isNumber(x[0]));
  if (p.length > 2 || p[0] == 'none' || p.length == 2 && i < 0) return v;
  return p.length == 1 ? (i == 0 ? `${px(v)} solid currentColor` : `1px solid ${colorFrom(v)}`) : `${px(p[i])} solid ${colorFrom(p[1 - i])}`;
}
const _STYLES = {
  ...Object.fromEntries(`
    align:text-align bgAttach:background-attachment bgBlend:background-blend-mode bgImage:background-image bgRepeat:background-repeat bgSize:background-size
    caret:caret-color clip:clip-path deco:text-decoration dir:flex-direction family:font-family fit:object-fit flow:grid-auto-flow fStyle:font-style fz:font-size
    gridCol:grid-column gridTemplateCols:grid-template-columns grow:flex-grow shrink:flex-shrink weight:font-weight hLine:line-height lheight:line-height lspace:letter-spacing
    h:height w:width hmax:max-height hmin:min-height wmax:max-width wmin:min-width x:left y:top l:left z:z-index k:cursor origin:transform-origin rounding:border-radius shadow:box-shadow
    hAlign:justify-content halign:justify-content justify:justify-content vAlign:align-items valign:align-items vert_align:align-items iplace:place-items place:place-items hgap:column-gap vgap:row-gap
    overx:overflow-x overy:overflow-y xover:overflow-x yover:overflow-y
    m:margin mauto:margin matop:margin-top mabottom:margin-bottom maleft:margin-left maright:margin-right mah:margin-inline mav:margin-block hMargin:margin-inline vMargin:margin-block
    paleft:padding-left pabottom:padding-bottom paright:padding-right patop:padding-top pah:padding-inline pav:padding-block hPadding:padding-inline vPadding:padding-block
    h100:height=100% w100:width=100% hCenter:justify-content=center vBaseline:align-items=baseline vCenter:align-items=center vStretch:align-items=stretch breakWord:overflow-wrap=break-word wrap:flex-wrap=wrap
  `.match(/\S+/g).map(t => { let [k, v] = t.split(':'); return [k, v.includes('=') ? v.split('=') : v]; })),
  autoCols: v => ['grid-template-columns', auto(v)],
  autoRows: v => ['grid-template-rows', auto(v)],
  autoGrid: v => { let [r, c = r] = (v + '').split(' '); return { display: 'grid', gridTemplateRows: `repeat(auto-fill,${px(r)})`, gridTemplateColumns: `repeat(auto-fill,${px(c)})` }; },
  bg: v => ['background-color', colorFrom(v)],
  bgSrc: v => ['background-image', `url(${v})`],
  border: line,
  box: v => ['box-sizing', v ? 'border-box' : 'content-box'],
  fg: (v, bg) => ['color', v == 'contrast' ? colorIdealText(bg) : colorFrom(v)],
  gridCols: v => ['grid-template-columns', rep(v)],
  gridRows: v => ['grid-template-rows', rep(v)],
  mahv: v => ['margin', hv(v)],
  outline: line,
  pahv: v => ['padding', hv(v)],
  round: v => ['border-radius', v ? '50%' : '0%'],
};
_STYLES.grid = STYLES.autoGrid;
const UNITLESS = /^(opacity|z-index|font-weight|order|aspect-ratio|orphans|widows|column-count|animation-iteration-count|zoom|scale|flex(-grow|-shrink)?|grid-(row|column|area).*)$/;

function mStyles(styles) {
  let res = {};
  for (const k in styles) {
    let key = k.startsWith('--') ? k : k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), val = styles[k], sc = STYLES[k];
    if (isString(sc)) key = sc;
    else if (isList(sc)) { if (!val) continue;[key, val] = sc; }
    else if (sc) {
      let out = sc(val, styles.bg);
      if (isDict(out)) { Object.assign(res, mStyles(out)); continue; }
      if (isList(out)) [key, val] = out; else val = out;
    }
    if (isdef(val)) res[key] = isNumber(val) && val !== '' && !UNITLESS.test(key) ? val + 'px' : val;
  }
  return res;
}
function mStyle(elem, styles = {}, opts = {}) {
  elem = toElem(elem);
  let css = mStyles(styles);
  for (const k in css) elem.style.setProperty(k, css[k]);
  applyOpts(elem, opts);
  return elem;
}
function applyOpts(d, opts = {}) {
  const alias = { classes: 'className', inner: 'innerHTML', html: 'innerHTML', editable: 'contentEditable', w: 'width', h: 'height' };
  for (const opt in opts) {
    let name = alias[opt] ?? opt, val = opts[opt];
    if (name == 'tag' || !isdef(val)) continue;
    if (name == 'recClick') d.onclick = async (ev) => { recUserEvent(); await val(ev); };
    else if (['id', 'style', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
    else if (typeof val == 'boolean') name in d ? d[name] = val : d.toggleAttribute(name, val);   // disabled: false must not disable
    else d.setAttribute(name, val);
  }
}
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mDom(dParent, styles = {}, opts = {}) {
  let tag = valf(opts.tag, 'div'), d = document.createElement(tag);
  if (tag == 'textarea') opts = { wrap: 'hard', ...opts };
  mStyle(d, styles, opts);
  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}



//#endregion



function clrDominant(el, n = 5, minDist = 10, bits = 4, maxSize = 100) {
  let w = el.naturalWidth || el.videoWidth || el.width, h = el.naturalHeight || el.videoHeight || el.height;
  if (!w || !h) return [];
  let k = Math.min(1, maxSize / Math.max(w, h)), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
  let cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  let ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;                      // no blended edge colors
  ctx.drawImage(el, 0, 0, cw, ch);
  let d = ctx.getImageData(0, 0, cw, ch).data, s = 8 - bits, bins = new Map();
  for (let i = 0; i < d.length; i += 4) {                 // 1. count pixels per coarse bucket
    if (d[i + 3] < 128) continue;                         //    (skip transparent ones)
    let key = ((d[i] >> s) << (2 * bits)) | ((d[i + 1] >> s) << bits) | (d[i + 2] >> s);
    let b = bins.get(key);
    if (!b) bins.set(key, b = [0, 0, 0, 0]);
    b[0]++; b[1] += d[i]; b[2] += d[i + 1]; b[3] += d[i + 2];
  }
  let clusters = [];                                      // 2. merge buckets that look alike, biggest first
  for (let b of [...bins.values()].sort((a, c) => c[0] - a[0])) {
    let lab = clrRgbToLab(b[1] / b[0], b[2] / b[0], b[3] / b[0]);
    let c = clusters.find(c => (c.lab[0] - lab[0]) ** 2 + (c.lab[1] - lab[1]) ** 2 + (c.lab[2] - lab[2]) ** 2 < minDist ** 2);
    if (c) { c.n += b[0]; c.r += b[1]; c.g += b[2]; c.b += b[3]; }
    else clusters.push({ lab, n: b[0], r: b[1], g: b[2], b: b[3] });
  }
  return clusters.sort((a, c) => c.n - a.n).slice(0, n)   // 3. most frequent first, as average color
    .map(c => clrRgbToHex(c.r / c.n, c.g / c.n, c.b / c.n));
}

async function palFromImg(input, count = 5, tolerance = 16) {
  /* Extracts the n most prevalent HEX colors from an image URL, <img> tag, or <canvas> element */
  let elImgOrCanvas = input;

  // If input is a URL string, asynchronously load it into an Image object
  if (typeof input === 'string') {
    elImgOrCanvas = await new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image from src: ' + input));
      img.src = input;
    });
  }

  let cvs = document.createElement('canvas');
  let ctx = cvs.getContext('2d');

  let w = elImgOrCanvas.naturalWidth || elImgOrCanvas.width || 100;
  let h = elImgOrCanvas.naturalHeight || elImgOrCanvas.height || 100;

  // Downscale to a max dimension of 150px for fast color sampling
  let maxDim = 150;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  cvs.width = w;
  cvs.height = h;
  ctx.drawImage(elImgOrCanvas, 0, 0, w, h);

  let imgData = ctx.getImageData(0, 0, w, h).data;
  let counts = {};

  for (let i = 0; i < imgData.length; i += 4) {
    let a = imgData[i + 3];
    if (a < 128) continue; // Skip transparent/semi-transparent pixels

    // Quantize RGB values by tolerance step to group similar shades
    let r = Math.round(imgData[i] / tolerance) * tolerance;
    let g = Math.round(imgData[i + 1] / tolerance) * tolerance;
    let b = Math.round(imgData[i + 2] / tolerance) * tolerance;

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    counts[hex] = (counts[hex] || 0) + 1;
  }

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, count);
}
function _clrMostDifferent(elCvsOrImg, count = 5, maxPixels = 100) {
  /* Extracts n visually distinct colors from an image/canvas using CIELAB max-min distance sampling */
  let w = elCvsOrImg.naturalWidth || elCvsOrImg.width || 100;
  let h = elCvsOrImg.naturalHeight || elCvsOrImg.height || 100;

  // 1. Downscale for fast execution
  let cvs = document.createElement('canvas');
  cvs.width = maxPixels;
  cvs.height = Math.max(1, Math.round((h * maxPixels) / w));

  let ctx = cvs.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(elCvsOrImg, 0, 0, cvs.width, cvs.height);

  let d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
  let bins = new Map();

  // 2. Aggregate pixels into 4-bit truncated buckets
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // Skip transparent pixels
    let r = d[i] & 0xf0;
    let g = d[i + 1] & 0xf0;
    let b = d[i + 2] & 0xf0;
    let key = (r << 16) | (g << 8) | b;

    let bData = bins.get(key);
    if (!bData) {
      bins.set(key, { b: key, lab: clrRgbToLab(r, g, b), n: 1, r: r, g: g });
    } else {
      bData.n++;
    }
  }

  let candidates = [...bins.values()];
  if (candidates.length <= count) {
    return candidates.map(c => clrToHex('#' + c.b.toString(16).padStart(6, '0')));
  }

  // 3. Pick the 1st color as the absolute most dominant
  candidates.sort((a, b) => b.n - a.n);
  let selected = [candidates[0]];
  candidates.shift();

  // 4. Greedy Max-Min selection for the remaining (count - 1) slots
  while (selected.length < count && candidates.length > 0) {
    let maxMinDist = -1;
    let bestIdx = -1;

    for (let i = 0; i < candidates.length; i++) {
      let cand = candidates[i];
      // Find minimum CIELAB distance from cand to any already selected color
      let minDist = Infinity;
      for (let s of selected) {
        let dist = (cand.lab[0] - s.lab[0]) ** 2 +
          (cand.lab[1] - s.lab[1]) ** 2 +
          (cand.lab[2] - s.lab[2]) ** 2;
        if (dist < minDist) minDist = dist;
      }

      // We want the candidate whose MINIMUM distance to selected is LARGEST
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      selected.push(candidates[bestIdx]);
      candidates.splice(bestIdx, 1);
    } else {
      break;
    }
  }

  return selected.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
}

function clrMostDifferent(elCvsOrImg, count = 5, acceptedMax = 2500, maxPixels = 100) {
  /* Extracts n distinct colors using CIELAB max-min distance with an early-exit acceptedMax threshold */
  let w = elCvsOrImg.naturalWidth || elCvsOrImg.width || 100;
  let h = elCvsOrImg.naturalHeight || elCvsOrImg.height || 100;

  // 1. Downscale for fast buffer extraction
  let cvs = document.createElement('canvas');
  cvs.width = maxPixels;
  cvs.height = Math.max(1, Math.round((h * maxPixels) / w));

  let ctx = cvs.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(elCvsOrImg, 0, 0, cvs.width, cvs.height);

  let d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;


  let bins = new Map();

  // 2. Aggregate pixels into 4-bit truncated buckets
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // Skip transparent pixels
    let r = d[i] & 0xf0;
    let g = d[i + 1] & 0xf0;
    let b = d[i + 2] & 0xf0;
    let key = (r << 16) | (g << 8) | b;

    let bData = bins.get(key);
    if (!bData) {
      bins.set(key, { b: key, lab: clrRgbToLab(r, g, b), n: 1, r: r, g: g });
    } else {
      bData.n++;
    }
  }

  let candidates = [...bins.values()];
  if (candidates.length <= count) {
    return candidates.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
  }

  // 3. Anchor with the most frequent color
  candidates.sort((a, b) => b.n - a.n);
  let selected = [candidates[0]];
  candidates.shift();

  // 4. Distance sampling loop with acceptedMax early exit
  while (selected.length < count && candidates.length > 0) {
    let maxMinDist = -1;
    let bestIdx = -1;

    for (let i = 0; i < candidates.length; i++) {
      let cand = candidates[i];
      let minDist = Infinity;

      for (let s of selected) {
        let dist = (cand.lab[0] - s.lab[0]) ** 2 +
          (cand.lab[1] - s.lab[1]) ** 2 +
          (cand.lab[2] - s.lab[2]) ** 2;
        if (dist < minDist) minDist = dist;
      }

      // Early exit if distance threshold is satisfied
      if (minDist >= acceptedMax) {
        bestIdx = i;
        break;
      }

      // Track current best candidate if threshold is not reached yet
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      selected.push(candidates[bestIdx]);
      candidates.splice(bestIdx, 1);
    } else {
      break;
    }
  }

  return selected.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
}

function clrMix(hex1, hex2, t = 0.5, space = 'lab') {
  //space: lab, rgb, hsl, lch
  let c1 = clrHexToRgb(hex1), c2 = clrHexToRgb(hex2);
  t = clrClamp(t, 0, 1);
  if (t == 0) return clrRgbToHex(...c1);
  if (t == 1) return clrRgbToHex(...c2);
  let mix = (a, b) => a.map((v, i) => v + (b[i] - v) * t);
  let hue = (h1, h2) => h1 + (((h2 - h1 + 540) % 360) - 180) * t;   // shortest way round the wheel
  if (space == 'rgb') return clrRgbToHex(...mix(c1, c2));
  if (space == 'hsl') {
    let [h1, s1, l1] = clrRgbToHsl(...c1), [h2, s2, l2] = clrRgbToHsl(...c2);
    if (s1 < 0.5) h1 = h2; else if (s2 < 0.5) h2 = h1;               // gray has no hue
    return clrHslToHex(hue(h1, h2), s1 + (s2 - s1) * t, l1 + (l2 - l1) * t);
  }
  let [L1, a1, b1] = clrRgbToLab(...c1), [L2, a2, b2] = clrRgbToLab(...c2);
  if (space == 'lch') {
    let C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), rad = 180 / Math.PI;
    let H1 = Math.atan2(b1, a1) * rad, H2 = Math.atan2(b2, a2) * rad;
    if (C1 < 1) H1 = H2; else if (C2 < 1) H2 = H1;
    let C = C1 + (C2 - C1) * t, H = hue(H1, H2) / rad;
    return clrRgbToHex(...clrLabToRgb(L1 + (L2 - L1) * t, C * Math.cos(H), C * Math.sin(H)));
  }
  return clrRgbToHex(...clrLabToRgb(...mix([L1, a1, b1], [L2, a2, b2])));   // 'lab'
}

function _palMix(hex1, hex2, n = 5, space = 'lab') {
  [hex1, hex2] = [clrHex(hex1), clrHex(hex2)];
  if (n < 2) return n == 1 ? [clrMix(hex1, hex2, 0, space)] : [];
  return Array.from({ length: n }, (_, i) => clrMix(hex1, hex2, i / (n - 1), space));
}
function _palShade(hex, n = 5) {
  hex = clrHex(hex);
  let [h, s] = clrRgbToHsl(...clrHexToRgb(hex));
  if (n < 2) return n == 1 ? [clrRgbToHex(...clrHexToRgb(hex))] : [];
  return Array.from({ length: n }, (_, i) => clrHslToHex(h, s, 100 - 100 * i / (n - 1)));
}
function clrHexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length == 3) h = [...h].map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function replaceSvgFills(text, fn) {
  return text.replace(/(\bfill\s*[=:]\s*["']?)([^"';}\s>]+)/gi, (all, pre, val) => pre + fn(val));
}
function strToNewHex(s) {
  let hex = clrToHex(s);
  let name = emoColorNames[hex];
  return colorByName[name] || s;
}
function buildColorGrid_rgb4(dict, bits = 4) {
  let shift = 8 - bits, n = 1 << bits, half = (1 << shift) / 2, grid = new Array(n ** 3);
  let toHex = v => ((v << shift) + half).toString(16).padStart(2, '0');
  for (let r = 0; r < n; r++)
    for (let g = 0; g < n; g++)
      for (let b = 0; b < n; b++)
        grid[(r * n + g) * n + b] = clrClosestName('#' + toHex(r) + toHex(g) + toHex(b), dict);
  return grid;
}

function clrMix(hex1, hex2, t = 0.5, space = 'lab') {
  let c1 = clrHexToRgb(hex1), c2 = clrHexToRgb(hex2);
  t = clrClamp(t, 0, 1);
  if (t == 0) return clrRgbToHex(...c1);
  if (t == 1) return clrRgbToHex(...c2);
  let mix = (a, b) => a.map((v, i) => v + (b[i] - v) * t);
  if (space == 'rgb') return clrRgbToHex(...mix(c1, c2));
  return clrRgbToHex(...clrLabToRgb(...mix(clrRgbToLab(...c1), clrRgbToLab(...c2))));
}


var colorByName_emo = {
  "rich_black_fog": "#00000D",
  "black": "#000000",
  "rich_black_fog2": "#000202",
  "imperial_blue": "#002395",
  "blue_ryb": "#0247FE",
  "dark_cerulean": "#004A7C",
  "blue": "#0047AB",
  "bluegreen": "#004D40",
  "midnight_blue2": "#00468C",
  "usafa_blue": "#004F98",
  "medium_teal": "#006666",
  "medium_persian_blue": "#0067A5",
  "dartmouth_green": "#00703C",
  "linkedin_blue": "#0072B1",
  "french_blue": "#0072BB",
  "metallic_seaweed": "#007689",
  "ocean_boat_blue": "#0076C6",
  "pine_green": "#01796F",
  "philippine_green": "#008543",
  "north_texas_green": "#059033",
  "teal_green": "#00897B",
  "boy_red": "#008C9A",
  "microsoft_blue": "#00A2ED",
  "rich_electric_blue": "#008EC9",
  "paolo_veronese_green": "#009B7D",
  "strong_cyan": "#009999",
  "blue_munsell": "#0093AF",
  "spring_sky": "#0099FF",
  "green_pantone": "#00AD43",
  "turquoise_surf": "#00BCD4",
  "vivid_teal": "#00BFA5",
  "cyan_process": "#00B7EB",
  "hawaii_blue": "#00C1E9",
  "dark_lime": "#00CC00",
  "vivid_sky_blue": "#00CCFF",
  "bright_aqua": "#00F5D4",
  "aqua": "#00FFFF",
  "panasonic_blue": "#0040BE",
  "absolute_zero": "#0048BA",
  "green": "#008001",
  "azure": "#007FFF",
  "persian_green": "#00A693",
  "tiffany_blue": "#02AEA8",
  "prussian_blue_color_konjo_iro": "#003171",
  "blue_cola": "#0088DC",
  "generic_viridian": "#007F66",
  "blue_raspberry": "#04C1EA",
  "caribbean_green": "#00CC99",
  "green_blue": "#0665B2",
  "light_blue_silk": "#044F67",
  "vibrant_green": "#06D6A0",
  "dodger_blue": "#0066CC",
  "navy_blue_bellflower": "#091238",
  "greenblue": "#003153",
  "cool_black": "#002E63",
  "catalina_blue": "#062A78",
  "xbox_green": "#0A7C1F",
  "green_munsell": "#00A877",
  "smoky_black": "#100C08",
  "bright_navy_blue": "#1974D2",
  "dark_powder_blue": "#003399",
  "blue_green": "#0D98BA",
  "oxford_blue": "#002147",
  "spiro_disco_ball": "#0FCAFF",
  "yankees_blue": "#10203D",
  "royal_blue_dark": "#002366",
  "black_kokushoku": "#171412",
  "lapis_lazuli_japan": "#143C7C",
  "yale_blue": "#0F4D92",
  "denim": "#1560BD",
  "cyan_cornflower_blue": "#1492C4",
  "lightseagreen": "#20B2AA",
  "new_car": "#164ACA",
  "dodgerblue": "#1E90FF",
  "dark_imperial_blue": "#00147E",
  "dark_cornflower_blue": "#172B86",
  "weebly_blue": "#2096F3",
  "egyptian_blue": "#1034A6",
  "summer_sky": "#2962FF",
  "true_blue1": "#0073CF",
  "jungle_green": "#009933",
  "greengrey": "#264653",
  "medium_electric_blue": "#035096",
  "mate_black": "#1A191E",
  "saint_patricks_blue": "#23297A",
  "goryeo_storeroom": "#1B2E35",
  "mughal_green": "#1B5E20",
  "spanish_viridian": "#007F5C",
  "denim_blue": "#1D44B3",
  "celtic_blue": "#246BCE",
  "licorice": "#1F0B08",
  "black_chestnut": "#252321",
  "japanese_laurel": "#2E7D32",
  "sea_blue": "#006994",
  "button_blue": "#24A0ED",
  "bright_navy": "#000080",
  "lapis_lazuli": "#2167A1",
  "asda_green_2002": "#21B249",
  "flickr_blue": "#2262DD",
  "facebook_blue": "#234096",
  "brilliant_azure": "#3399FF",
  "charleston_green": "#232B2B",
  "illuminating_emerald": "#319177",
  "blue_crayola": "#1F75FE",
  "gunmetal": "#2A3439",
  "green_blue_crayola": "#2887C8",
  "keppel": "#26A69A",
  "light_sky_blue": "#26BFFF",
  "legal_dye": "#281010",
  "blue_pigment": "#303F9F",
  "pleasant_green": "#33B64B",
  "pine_tree": "#2A2F23",
  "ink_color_sumi_iro": "#27221F",
  "celadon_green": "#2A898B",
  "dark_gray": "#353535",
  "onyx": "#353839",
  "scorched_brown": "#351F19",
  "ultramarine_blue": "#4166F5",
  "blue_violet": "#2B2028",
  "outer_space_crayola": "#2D383A",
  "charcoal": "#36454F",
  "horsetail": "#2F502A",
  "thousand_herb": "#317589",
  "silk_crepe": "#354E4B",
  "betel_nut": "#33251F",
  "deep_space_sparkle": "#335E68",
  "lincoln_green": "#195905",
  "mediumseagreen": "#3CB371",
  "metallic_green": "#296E01",
  "teal_blue": "#367588",
  "celestial_blue": "#4997D0",
  "verdigris": "#34A9AE",
  "twitter_blue": "#26A7DE",
  "vivid_blue_violet": "#3A0CA3",
  "zinnwaldite_brown": "#2C1608",
  "black_coffee": "#3B2F2F",
  "ming": "#36747D",
  "neon_blue": "#1B03A3",
  "black_olive": "#3B3C36",
  "green_cola": "#4C721D",
  "true_blue": "#2D68C4",
  "may_green": "#4C9141",
  "onando": "#364141",
  "iron_head_flower": "#344D56",
  "turquoise": "#40E0D0",
  "indigo_ink_brown": "#393432",
  "violet_blue": "#324AB2",
  "battery_charged_blue": "#1DACD6",
  "jelly_bean_blue": "#3A6F8A",
  "cola": "#3C3024",
  "google_chrome_blue": "#4285F4",
  "picton_blue": "#45B1E8",
  "disappearing_purple": "#3E2230",
  "old_burgundy": "#43302E",
  "bistre": "#3D2B1F",
  "cafe_noir": "#4F3320",
  "rusty_storeroom": "#3A403B",
  "outer_space": "#414A4C",
  "interdimensional_blue": "#410BD3",
  "american_bronze": "#391802",
  "napier_green": "#2A8000",
  "acajou": "#4A261F",
  "tufts_blue": "#3E8EDE",
  "zomp": "#39A78E",
  "bleu_de_france": "#42A5F5",
  "kimono_storage": "#3D4C51",
  "winter_sky": "#4396A9",
  "forest_green": "#339933",
  "opposite_flower": "#4D646C",
  "sky_blue": "#45F9FF",
  "dark_electric_blue": "#466B7D",
  "royal_blue_light": "#4169E1",
  "american_purple": "#470344",
  "rusty_storage": "#455859",
  "army_green": "#4B5320",
  "pine_needle": "#484E27",
  "simmered_seaweed_mirucha": "#4C3D30",
  "moonstone": "#3AA8C1",
  "boiled_red_bean_brown": "#4A251A",
  "dull_blue_aonibi": "#4F4944",
  "quartz": "#51484F",
  "light_blue": "#48929B",
  "american_green": "#34B334",
  "light_azure": "#4BC5FC",
  "neon_green": "#39FF14",
  "deep_violet": "#330066",
  "dark_lava": "#483C32",
  "royal_brown": "#503430",
  "blue_lagoon": "#4CB7A5",
  "maximum_blue": "#4DC6E1",
  "sea_serpent": "#4DD0E1",
  "brown_rat_grey": "#4B3C39",
  "maximum_green": "#4E9226",
  "dark_turquoise": "#55B4B0",
  "dark_liver": "#534B4F",
  "military_green": "#5A7247",
  "cadet": "#506D73",
  "english_violet": "#563C5C",
  "fresh_onion_moegi": "#528D30",
  "han_blue": "#446CCF",
  "imperial": "#541E69",
  "weathered_bamboo": "#543121",
  "dark_liver_horses": "#543630",
  "black_coral": "#54626F",
  "stormcloud": "#4F666A",
  "very_light_blue": "#6666FF",
  "plump_purple": "#5731A5",
  "violetblue": "#4424D6",
  "antique_bronze": "#586214",
  "mustard_green": "#586415",
  "olivedrab": "#6B8E23",
  "green_ryb": "#66B032",
  "mantis": "#58BF4E",
  "dimgray": "#696969",
  "darkolivegreen": "#59702C",
  "bayside": "#5FC9BF",
  "desaturated_cyan": "#669999",
  "crystal_blue": "#5A96A8",
  "dark_indigo": "#614E6E",
  "violet_blue_crayola": "#5C6BC0",
  "han_purple": "#5218FA",
  "liver": "#5D4037",
  "umber": "#5D423C",
  "light_royal_blue": "#6699FF",
  "very_light_malachite_green": "#64E986",
  "wenge": "#645452",
  "cadetblue": "#5F9EA0",
  "carolina_blue": "#5FB2DE",
  "palatinate_purple": "#600F58",
  "dark_brown": "#603C24",
  "contemplation": "#604338",
  "steel_teal": "#5F8A8B",
  "apple": "#60C14E",
  "blue_jeans": "#5DADEC",
  "medium_aquamarine": "#61DE9F",
  "sumac_dyed_korozen": "#592B1F",
  "van_dyke_brown": "#63351E",
  "painite": "#633D35",
  "air_force_blue": "#5D8AA8",
  "pale_emerald": "#50C878",
  "slategray": "#708090",
  "mediumaquamarine": "#64DAC1",
  "lawn_green": "#58A813",
  "aloewood": "#66361F",
  "delicate_girl_blue": "#6AB2CA",
  "iguana_green": "#66BB6A",
  "sky_blue_crayola": "#66C0E8",
  "nickel": "#727472",
  "purple": "#660066",
  "quincy": "#6A5445",
  "palm_leaf": "#689F38",
  "slate_blue": "#6E81A0",
  "oxley": "#6D9A79",
  "olive_drab": "#669900",
  "moonstone_blue": "#73A9C2",
  "liver_organ": "#6D291A",
  "deep_coffee": "#6D4238",
  "weldon_blue": "#6D94A5",
  "mediumslateblue": "#7B68EE",
  "sap_green": "#507D2A",
  "pastel_green": "#77DD77",
  "electric_sky": "#6FE8FD",
  "dark_silver": "#706C66",
  "moss_green": "#70853B",
  "philippine_bronze": "#713604",
  "aurometalsaurus": "#6E7F80",
  "khaki": "#8D9440",
  "golden_grey_bamboo": "#723F22",
  "lightslategray": "#778899",
  "bole": "#79443B",
  "slateblue": "#7350D3",
  "old_moss_green": "#867E36",
  "siskin_sprout_yellow": "#738613",
  "pale_cyan": "#87D3F8",
  "kenyan_copper": "#751C00",
  "asparagus": "#87A96B",
  "dark_purple": "#7600B3",
  "dove_feather_grey": "#765F57",
  "medium_slate_blue": "#836FFF",
  "maya_blue": "#73C2FB",
  "cypress_bark_color": "#77381F",
  "asda_green": "#7DC242",
  "color_of_an_undried_wall": "#785E49",
  "aero": "#7CB9E8",
  "maximum_purple": "#792D85",
  "dark_pastel_purple": "#966FD6",
  "gray": "#808080",
  "heart_gold": "#808000",
  "ceil": "#7986CB",
  "chinese_purple": "#720B98",
  "green_tea": "#824B35",
  "amethyst": "#9966CC",
  "french_sky_blue": "#77B5FE",
  "lye": "#7B5B52",
  "deep_taupe": "#7E5E60",
  "parakeet_blue": "#7EB6FF",
  "guacamole": "#7CB23F",
  "pale_blue_usuao": "#7D8E5F",
  "purple_heart": "#69359C",
  "pewter_blue": "#7EAAB3",
  "baby_blue": "#7EC8EE",
  "barn_red": "#7C0A02",
  "russet": "#80461B",
  "pastel_brown": "#836953",
  "microsoft_green": "#7DB700",
  "kiwi": "#7FCE1A",
  "red_brown1": "#8B352D",
  "titanium": "#878681",
  "pale_lilac": "#9999FF",
  "light_cyan": "#7FCDCD",
  "sheen_green": "#8FD400",
  "middle_blue_green": "#80DDD2",
  "medium_sky_blue": "#80DAEB",
  "dark_sky_blue": "#8CBED6",
  "lightskyblue": "#81D7FF",
  "falu_red": "#801818",
  "chocolate_traditional": "#823E00",
  "dark_brown_tangelo": "#88654E",
  "finch_brown": "#825E1D",
  "sen_no_rikyus_tea_rikyucha": "#826B58",
  "yellowgreen": "#9ACD32",
  "pearl_aqua": "#82E8D7",
  "yellow_sea_pine_brown": "#83622F",
  "battleship_grey": "#848482",
  "tuscan_red": "#7C4848",
  "spicy_mix": "#8B5F4D",
  "teal_deer": "#99E6B3",
  "rose_taupe": "#905D5D",
  "kobe": "#871E0C",
  "brushwood_dyed_fushizome": "#8C5939",
  "milk_chocolate": "#84563C",
  "bistre_brown": "#875D00",
  "taupe_gray": "#8B8589",
  "morning_blue": "#87A194",
  "french_plum": "#880E4F",
  "willow_grey": "#817B69",
  "middle_grey": "#8B8680",
  "pale_young_green_onion": "#8DB255",
  "sparrow_brown": "#893F2E",
  "clove_brown": "#8F583C",
  "medium_violet": "#8954FF",
  "medium_brown": "#996633",
  "roman_silver": "#838996",
  "citrine_brown": "#933709",
  "plum": "#8E4585",
  "saddlebrown": "#8A460A",
  "dark_lemon_lime": "#8BBE1B",
  "blood1": "#8A0303",
  "deep_dumpling": "#8C1D0B",
  "cornflower": "#8CC2EA",
  "violet": "#911EB4",
  "dark_magenta": "#993399",
  "polished_brown": "#985538",
  "cinereous": "#98817B",
  "shadow": "#8A795D",
  "wisteria_purple": "#875F9A",
  "purple_plum": "#903EB3",
  "cadet_grey": "#91A3B0",
  "pale_sky_blue": "#99CCFF",
  "vivid_auburn": "#922724",
  "italian_roast": "#91674D",
  "plum_blossom_mouse": "#925849",
  "citron": "#9FA91F",
  "jordy_blue": "#8AB9F1",
  "mardi_gras": "#880085",
  "non_photo_blue": "#A4DDED",
  "sangria": "#92000A",
  "brown_traditional": "#964B00",
  "liver_chestnut": "#987456",
  "granny_smith_apple": "#A8E4A0",
  "coconut": "#965A3E",
  "iron": "#A19D94",
  "pomelo": "#96A53C",
  "beaver": "#9F8170",
  "darkgray": "#A0A0A0",
  "cadet_blue_crayola": "#98A8BE",
  "acid_green": "#B0BF1A",
  "pale_blue": "#98B4D4",
  "spartan_crimson": "#99130D",
  "purpureus": "#9A4EAE",
  "chamoisee": "#A0785A",
  "light_cobalt_blue": "#9AA7ED",
  "pistachio": "#93C572",
  "red_birch": "#9D2B22",
  "walnut_dyed": "#9B6A57",
  "dark_chestnut": "#986960",
  "rapeseed_oil": "#A17917",
  "metallic_sunburst": "#9B782C",
  "crystal": "#A7D8DE",
  "red_brown": "#9C3C25",
  "lightblue": "#AFD7E9",
  "red_ochre": "#9F5233",
  "gamboge_orange_brown": "#996600",
  "dirt": "#9B7653",
  "inchworm": "#B2EC5D",
  "purple_munsell": "#9F00C5",
  "chrome_aluminum": "#9FA4AA",
  "auburn": "#A52A2A",
  "copper_brown": "#A65F46",
  "metallic_bronze": "#A97142",
  "light_pastel_purple": "#A08CCF",
  "pale_cerulean": "#A0C7E8",
  "june_bud": "#BDDA57",
  "olivine": "#9AB973",
  "margarita": "#A1C23C",
  "pastel_blue": "#A1C5CB",
  "chinese_red": "#A22911",
  "chinese_brown": "#AB381F",
  "darkorchid": "#9932CC",
  "dark_gold": "#A2672B",
  "cafe_au_lait": "#A2764A",
  "lenurple": "#A281D0",
  "fresh_air": "#A6E7FF",
  "dark_crimson": "#A30042",
  "sweet_brown": "#A83731",
  "grullo": "#A38E7A",
  "blood": "#A41313",
  "blast_off_bronze": "#A57164",
  "jazzberry_jam": "#A50B5E",
  "metallic_brown": "#AC4313",
  "lavender_purple": "#967BB6",
  "clove_dyed_chojizome": "#A7571F",
  "celeste": "#A7FFEB",
  "dark_candy_apple_red": "#A40000",
  "rufous": "#A81C07",
  "yellow_green_crayola": "#A8CE5F",
  "loquat_tree_brown": "#AB6134",
  "amaranth_deep_purple": "#AB2C5E",
  "medium_carmine": "#AB3F2E",
  "deep_fuchsia": "#AB47BC",
  "light_brown": "#AB580F",
  "vibrant_lavender": "#AB7CF7",
  "pale_fallen_leaves": "#AB872E",
  "ash_gray": "#ABB9BB",
  "cambridge_blue": "#A3C1AD",
  "carnelian": "#AD1414",
  "dirty_brown": "#AC5813",
  "rust": "#AD3900",
  "brown_sugar": "#AF6E4D",
  "turquoise_green": "#A0D6B4",
  "upsdell_red": "#AE111F",
  "faded_rikyus_tea": "#B0927A",
  "silver_metallic": "#AAA9AD",
  "silver_foil": "#AFB1AE",
  "red": "#FF0000",
  "raspberry": "#C51162",
  "mordant_red_19": "#AE0C00",
  "firebrick": "#B22222",
  "byzantine": "#BD33A4",
  "windsor_tan": "#A75502",
  "philippine_gold": "#AF6300",
  "copper_penny": "#AF7464",
  "spicy_red_brown": "#BB5D42",
  "light_taupe": "#B38B6D",
  "lime_green": "#B2D732",
  "blizzard_blue": "#B0F2F7",
  "dark_copper": "#B87333",
  "water_persimmon": "#B56C60",
  "university_of_california_gold": "#B27E18",
  "deer": "#BA8759",
  "bronze_metallic": "#B08D57",
  "pale_violet": "#B391FF",
  "beau_blue": "#BCD4E6",
  "diamond": "#B9F2FF",
  "tomato_sauce": "#B41301",
  "darkgoldenrod": "#B8860B",
  "limerick": "#9DC209",
  "pale_cornflower_blue": "#B4DDFA",
  "african_violet": "#B574C3",
  "chinese_yellow_tea": "#B7702D",
  "alloy_orange": "#B65500",
  "bitter_lemon": "#B6D401",
  "powderblue": "#B0E0E6",
  "birch_brown_kabacha": "#B14A30",
  "columbia_blue": "#B8DADE",
  "pale_taupe": "#BC987E",
  "pale_oak": "#BBA46D",
  "silver": "#C0C0C0",
  "red_cola": "#B62020",
  "golden_oak": "#BB8141",
  "camel": "#C19A6B",
  "strawberry_red": "#C83F49",
  "light_golden_brown": "#C66B27",
  "white_tea": "#C48E69",
  "dark_pastel_red": "#BC2A16",
  "asda_orange_1968": "#BC6F00",
  "mocha": "#BEA493",
  "silver_pink": "#C4AEAD",
  "jet_stream": "#BBD0C9",
  "bright_lavender": "#BD90E6",
  "inside_of_a_bottle": "#C6C2B6",
  "mediumvioletred": "#BE0576",
  "rich_lilac": "#B666D2",
  "gin": "#BEDC9D",
  "pure_crimson": "#BF1A1A",
  "lemon_iced_tea": "#BD3000",
  "greyed_red": "#BC2D29",
  "caramel": "#BF8302",
  "maple_syrup": "#BB9351",
  "pale_silver": "#C9C0BB",
  "aluminum_foil": "#BFCCD2",
  "medium_spring_bud": "#C9DC87",
  "mulberry_orange": "#C0711F",
  "underside_of_willow_leaves": "#BCB58C",
  "cattail_color": "#B64925",
  "dark_ochre": "#BE7F51",
  "dark_international_orange": "#C0362C",
  "mahogany": "#C04000",
  "copper_red": "#CB6D51",
  "pear": "#C2DD1F",
  "very_pale_cyan": "#CCFFFF",
  "venetian_red": "#C80815",
  "ruddy_brown": "#BB6528",
  "lightgray": "#CCCCCC",
  "very_pale_green": "#CCFFCC",
  "light_french_beige": "#C8AD7F",
  "silver_sand": "#BFC1C2",
  "antique_brass": "#CD9575",
  "light_periwinkle": "#C5CBE1",
  "electric_brown": "#C67260",
  "mustard_brown": "#CD7A00",
  "brown_yellow": "#CC9966",
  "chinese_green": "#C6D856",
  "water": "#C6E4F7",
  "bright_orchid": "#C71FFF",
  "lavender_gray": "#C4C3D0",
  "persian_red": "#CC3333",
  "pastel_gray": "#CFCFC4",
  "amaranth_red": "#CA1837",
  "madder_lake": "#CA2C31",
  "palelavender": "#CABEFF",
  "amber_japan": "#CA6924",
  "raw_sienna": "#D68A59",
  "medium_red_violet": "#CC26A1",
  "scarlet1": "#CF3A24",
  "ochre1": "#CC7722",
  "azureish_white": "#DBE9F4",
  "very_light_green": "#CCFF99",
  "carrot": "#CC3300",
  "tan": "#D2B48C",
  "peru": "#CE843A",
  "tan_crayola": "#D99A6C",
  "medium_lavender_magenta": "#CE93D8",
  "crimson": "#DC143C",
  "cedar_chest": "#C95A49",
  "cinnamon": "#D2691E",
  "tropical_violet": "#CFB0EA",
  "sinopia": "#CB410B",
  "copper": "#DA8A67",
  "languid_lavender": "#D6CADD",
  "glazed_persimmon": "#D34E36",
  "dark_coral": "#D1593F",
  "decaying_leaves": "#D57835",
  "chinese_gold": "#CC9900",
  "palevioletred": "#DB7093",
  "chinese_bronze": "#D28333",
  "white_oak": "#CE9F6F",
  "jolly_red": "#CC0000",
  "jasper": "#D73B3E",
  "berry_pink": "#C3447A",
  "medium_vermilion": "#D9603B",
  "orange_brown": "#D36600",
  "jelly_bean": "#DA614E",
  "verizon_red1": "#CD040B",
  "fire_engine_red": "#CE2029",
  "vivid_red_tangelo": "#D55113",
  "metallic_orange": "#D55E00",
  "patrinia_flowers": "#D9B611",
  "timberwolf": "#D5CCC2",
  "lemon_lime": "#E3FF00",
  "persian_orange": "#D99058",
  "gold_brown_yamabukicha": "#CB7E1F",
  "golden_fallen_leaves": "#E29C45",
  "tumbleweed": "#DEAA88",
  "blush": "#D65076",
  "deep_cerise": "#DA3287",
  "rust_red": "#DD4124",
  "flame": "#E25822",
  "orchid": "#D853C9",
  "sand": "#D89852",
  "japanese_triandra_grass": "#E2B13C",
  "harvest_gold": "#DA9100",
  "pale_lavender": "#DCD0FF",
  "rosso_corsa": "#D40000",
  "brewed_mustard_brown": "#E68364",
  "burlywood": "#DEB887",
  "dark_vanilla": "#D9BAA5",
  "beige_grey": "#DFCFBE",
  "gainsboro": "#DCDCDC",
  "nyanza": "#E9FFDB",
  "strong_carmine": "#DA0A23",
  "cg_red": "#E03C31",
  "sumac_dyed_hajizome": "#E08A1E",
  "jasper_orange": "#DE8F4E",
  "bone": "#E3DAC9",
  "orangered": "#DC3023",
  "spanish_orange": "#E86100",
  "urobilin": "#DBA010",
  "microsoft_red": "#DD2C00",
  "tigers_eye": "#E08D3C",
  "eggshell_paper": "#E2BE9F",
  "persimmon": "#EC5800",
  "washed_out_persimmon": "#EC8254",
  "fawn": "#E5AA70",
  "zinnwaldite": "#EBC2AF",
  "middle_purple": "#DF86AC",
  "indigo_white": "#EBF6F7",
  "permanent_geranium_lake": "#E12C2C",
  "cinnabar": "#E34234",
  "candy_pink": "#E4717A",
  "salmon_rose": "#E7968B",
  "manila": "#E7C9A9",
  "platinum": "#E5E4E2",
  "green_yellow_crayola": "#F0E891",
  "bubbles": "#E7FEFF",
  "carrot_orange": "#ED9121",
  "bright_gray": "#E1E7EA",
  "lychee": "#DC5349",
  "beer": "#E27406",
  "gamboge": "#E49B0F",
  "lavender_mist": "#E2DEFA",
  "very_pale_grey": "#E1EDE9",
  "google_chrome_red": "#E34B44",
  "cadmium_orange": "#ED872D",
  "cookies_and_cream": "#EEE0B1",
  "palegoldenrod": "#EEE8AA",
  "pale_spring_bud": "#E3E0AA",
  "chinese_white": "#E2E5DE",
  "halloween_orange": "#EB6123",
  "fulvous": "#E48400",
  "gold_crayola": "#E6BE8A",
  "white_coffee": "#E6E0D4",
  "mindaro": "#E3F988",
  "lust": "#E62020",
  "marigold": "#EAA221",
  "deep_raspberry": "#E6194B",
  "orioles_orange": "#FB4F14",
  "raspberry_pink": "#E6508F",
  "sawtooth_oak": "#EC956C",
  "orange_soda1": "#EB593D",
  "very_pale_yellow": "#FFFFBF",
  "refreshed_red_brown": "#E35C38",
  "peach_burst": "#F39998",
  "rape_blossom_brown": "#E8A631",
  "mustard_yellow": "#E8AD00",
  "durian_white": "#E6D0AB",
  "italian_ice": "#E9F6EF",
  "aliceblue": "#E8F6FF",
  "ochre": "#FF4E20",
  "barbie_pink": "#E94196",
  "calamansi": "#FCFFA4",
  "congo_pink": "#F88379",
  "deep_carrot_orange": "#E9692C",
  "burnt_sienna": "#E97451",
  "light_magenta": "#FF80FF",
  "indian_yellow": "#EAAB57",
  "goldenrod": "#EFC050",
  "earth_yellow": "#E1A95F",
  "blood_red": "#F35336",
  "pale_red": "#EF476F",
  "vibrant_orangered": "#F46036",
  "vivid_tangelo": "#F07427",
  "persian_pink": "#F77FBE",
  "ibis_wing_color": "#F58F84",
  "chinese_orange": "#F37042",
  "sandybrown": "#F4A460",
  "spanish_yellow": "#EDA600",
  "douban_light_yellow": "#F7C58E",
  "yellow_munsell": "#EFCC00",
  "white_chocolate": "#EDE6D6",
  "carmine_pink": "#EB4C42",
  "fire_opal": "#EE5B4A",
  "bubblegum": "#EE8CFF",
  "orange_yellow": "#F5BD1F",
  "light_red_violet": "#FF6699",
  "thrice_dyed_crimson": "#F7665A",
  "purple_pizzazz": "#FE4EDA",
  "orchid_pink": "#EF87B2",
  "plum_dyed_umezome": "#FA9258",
  "dark_tangerine": "#FFA812",
  "middle_yellow_red": "#ECB176",
  "apricot": "#FBCEB1",
  "isabelline": "#F4F0EC",
  "whitesmoke": "#F5F5F5",
  "primary_red": "#F00",
  "orange_ryb": "#FB9902",
  "mellow_apricot": "#F8B878",
  "lemon_meringue": "#F6EABE",
  "anti_flash_white": "#F0F4F5",
  "university_of_tennessee_orange": "#F77F00",
  "kumquat": "#FB9912",
  "corn_japan": "#FAA945",
  "maximum_yellow_red": "#F2BA49",
  "penguin_white": "#F5F3EF",
  "american_yellow": "#F2B400",
  "turmeric": "#F2AB47",
  "light_yellow_asagi": "#F7BB7D",
  "maize_crayola": "#F2C649",
  "pastel_orange": "#FFB347",
  "jasmine": "#F8DE7E",
  "pale_purple_pantone": "#FAE6FA",
  "ogre_odor": "#FD5240",
  "princeton_orange": "#F58025",
  "egg": "#FFA631",
  "floral_leaf": "#FFB94E",
  "chickadee": "#FFC34D",
  "deep_champagne": "#FAD6A5",
  "wheat": "#F5DEB3",
  "rajah": "#FBAB60",
  "gamboge_bright": "#FFB61E",
  "lightpink": "#FFB6C1",
  "topaz": "#FFC87C",
  "champagne_pink": "#F5E1D1",
  "champagne": "#F7E7CE",
  "alabaster": "#F5F3E7",
  "ghostwhite": "#F8F8FF",
  "frostbite": "#F63BBE",
  "pale_magenta_pink": "#FF99CC",
  "deep_saffron": "#FF9933",
  "deep_peach": "#FFCBA4",
  "deep_lemon": "#F5C71A",
  "mintcream": "#F5FFFA",
  "vivid_red": "#F70D1A",
  "huawei_red": "#F72E26",
  "pale_magenta": "#F772DB",
  "safety_orange": "#FF7800",
  "light_orange": "#FFCC66",
  "bright_yellow": "#FCCC1A",
  "caramel_creme": "#FFD59A",
  "mustard": "#FFDB58",
  "flavescent": "#F7E98E",
  "strong_boy_pink": "#F84AB2",
  "rinsed_out_red": "#FF7952",
  "sandy_tan": "#FDD9B5",
  "peach_yellow": "#FADFAD",
  "red_ryb": "#FE2712",
  "shocking_pink_crayola": "#FF6FFF",
  "sunset_yellow": "#FFC922",
  "pale_blush_pink": "#FFD1DC",
  "peach_puff": "#FFDAC1",
  "jonquil": "#F4CA16",
  "bisque": "#FFE4C4",
  "flesh": "#FFE9D1",
  "white": "#FFFFFF",
  "outrageous_orange": "#FF6E4A",
  "atomic_tangerine": "#FF9966",
  "yellow_orange_wheel": "#FF9505",
  "chrome_yellow": "#FFA700",
  "yellow_orange": "#FFAE42",
  "mikado_yellow": "#FFC40C",
  "orange_yellow_crayola": "#F8D568",
  "sunshine_yellow": "#FFE119",
  "very_pale_orange": "#FFDFBF",
  "moccasin": "#FFE4B5",
  "lumber": "#FFE4CD",
  "naples_yellow": "#FADA5E",
  "banana_mania": "#FAE9AE",
  "blanchedalmond": "#FFEBCD",
  "coral_red": "#FB3028",
  "brave_orange": "#FF631C",
  "darkorange": "#FF8C00",
  "cape_jasmine": "#FFB95A",
  "mango": "#FDBE02",
  "sunglow": "#FFCC33",
  "shandy": "#FFE670",
  "seashell": "#FFF5EE",
  "medium_champagne": "#FBF0B4",
  "lotion": "#FEFDFA",
  "coral": "#FF7F50",
  "red_bronze": "#FB8136",
  "satsuma": "#F28500",
  "microsoft_yellow": "#FDB900",
  "bright_yellow_orange": "#FFBE0B",
  "ripe_mango": "#FFC324",
  "spanish_pink": "#FCC4BF",
  "feldspar": "#FDD5B1",
  "dandelion_crayola": "#FDDB6D",
  "electric_yellow": "#FEE440",
  "lavenderblush": "#FFF0F5",
  "ivory": "#FFFFF0",
  "baby_powder": "#FEFEFA",
  "pastel_red": "#FF6961",
  "orange_red": "#FF681F",
  "smashed_pumpkin": "#FF6D3A",
  "tulip": "#FF878D",
  "mango_tango": "#FF8243",
  "royal_orange": "#F99245",
  "light_hot_pink": "#FFB3DE",
  "vibrant_bright_yellow": "#FFD32D",
  "cherry_blossom": "#FCC9B9",
  "child_banana": "#FDDB3A",
  "fashion_fuchsia": "#FE05A2",
  "bright_orange_red": "#FB5607",
  "dark_salmon": "#FF6666",
  "tangerine": "#FC600A",
  "sunset_orange": "#FD5E53",
  "american_orange": "#FF8B00",
  "meat_color": "#FE8E6E",
  "vivid_gamboge": "#FF9900",
  "washed_out_crimson": "#FFB3A7",
  "bright_yellow_crayola": "#FFAA1D",
  "light_blush": "#FEA8A7",
  "ucla_gold": "#FFB300",
  "selective_yellow": "#FFBA00",
  "amber": "#FFBF00",
  "vibrant_sunny_yellow": "#FFD166",
  "peach": "#FFD8B1",
  "peachpuff": "#FFDAB9",
  "pale_peach": "#FFE5B4",
  "papayawhip": "#FFEFD5",
  "blond": "#FEF3C0",
  "yellow_crayola": "#FCE883",
  "cornsilk": "#FFF8DC",
  "cosmic_latte": "#FFF8E7",
  "milk": "#FDFFF5",
  "hot_pink": "#FF0066",
  "shocking_pink": "#FC0FC0",
  "candy_apple_red": "#FF0800",
  "barbie_pink_1999": "#FF2D8A",
  "taobao_orange": "#FF4200",
  "rose_bonbon": "#FF4081",
  "portland_orange": "#FF4C2A",
  "strawberry": "#FF5050",
  "vivid_orange": "#FF5F00",
  "hotpink": "#FF61A9",
  "pumpkin": "#FF7518",
  "watermelon": "#FF6F61",
  "begonia": "#FF6C75",
  "philippine_orange": "#FF7300",
  "papaya": "#FF732D",
  "coral_color": "#FF7759",
  "salmon": "#FF7B78",
  "soft_coral": "#FF9AA2",
  "vivid_tangerine": "#FF9D83",
  "vivid_orange_peel": "#FFA000",
  "pale_incense_usuko": "#FFA565",
  "ora_orange": "#FFA500",
  "vibrant_orange": "#FF9F1C",
  "poppy_petal": "#FFA996",
  "very_light_tangelo": "#FFB077",
  "chinese_yellow": "#FFB200",
  "macaroni_and_cheese": "#FFBD88",
  "golden_poppy": "#FCC200",
  "melon": "#FEBAAD",
  "philippine_yellow": "#FECB00",
  "tangerine_yellow": "#FFCC00",
  "classic_rose": "#FFCCE1",
  "google_chrome_yellow": "#FFCE44",
  "pale_pink": "#FFCCCC",
  "banana": "#FFD662",
  "unbleached_silk": "#FFDDCA",
  "golden": "#FFD700",
  "golden_yellow": "#FFDF00",
  "banana_yellow": "#FFE02E",
  "navajowhite": "#FFDEAD",
  "minion_yellow": "#FFE959",
  "middle_yellow": "#FFEB00",
  "corn": "#FFEA5C",
  "antiquewhite": "#FFEAD9",
  "vibrant_electric_yellow": "#FFEB3B",
  "buttercup_yellow": "#FFF620",
  "lemon_yellow_crayola": "#FFFF9F",
  "oldlace": "#FFF7EB",
  "pastel_yellow": "#FFF891",
  "snow": "#FFFAFA",
  "yellow": "#FFFF00"
};

var colorByHex_emo = {
  "#00000D": "rich_black_fog",
  "#000000": "black",
  "#000202": "rich_black_fog2",
  "#002395": "imperial_blue",
  "#0247FE": "blue_ryb",
  "#004A7C": "dark_cerulean",
  "#0047AB": "blue",
  "#004D40": "bluegreen",
  "#00468C": "midnight_blue2",
  "#004F98": "usafa_blue",
  "#006666": "medium_teal",
  "#0067A5": "medium_persian_blue",
  "#00703C": "dartmouth_green",
  "#0072B1": "linkedin_blue",
  "#0072BB": "french_blue",
  "#007689": "metallic_seaweed",
  "#0076C6": "ocean_boat_blue",
  "#01796F": "pine_green",
  "#008543": "philippine_green",
  "#059033": "north_texas_green",
  "#00897B": "teal_green",
  "#008C9A": "boy_red",
  "#00A2ED": "microsoft_blue",
  "#008EC9": "rich_electric_blue",
  "#009B7D": "paolo_veronese_green",
  "#009999": "strong_cyan",
  "#0093AF": "blue_munsell",
  "#0099FF": "spring_sky",
  "#00AD43": "green_pantone",
  "#00BCD4": "turquoise_surf",
  "#00BFA5": "vivid_teal",
  "#00B7EB": "cyan_process",
  "#00C1E9": "hawaii_blue",
  "#00CC00": "dark_lime",
  "#00CCFF": "vivid_sky_blue",
  "#00F5D4": "bright_aqua",
  "#00FFFF": "aqua",
  "#0040BE": "panasonic_blue",
  "#0048BA": "absolute_zero",
  "#008001": "green",
  "#007FFF": "azure",
  "#00A693": "persian_green",
  "#02AEA8": "tiffany_blue",
  "#003171": "prussian_blue_color_konjo_iro",
  "#0088DC": "blue_cola",
  "#007F66": "generic_viridian",
  "#04C1EA": "blue_raspberry",
  "#00CC99": "caribbean_green",
  "#0665B2": "green_blue",
  "#044F67": "light_blue_silk",
  "#06D6A0": "vibrant_green",
  "#0066CC": "dodger_blue",
  "#091238": "navy_blue_bellflower",
  "#003153": "greenblue",
  "#002E63": "cool_black",
  "#062A78": "catalina_blue",
  "#0A7C1F": "xbox_green",
  "#00A877": "green_munsell",
  "#100C08": "smoky_black",
  "#1974D2": "bright_navy_blue",
  "#003399": "dark_powder_blue",
  "#0D98BA": "blue_green",
  "#002147": "oxford_blue",
  "#0FCAFF": "spiro_disco_ball",
  "#10203D": "yankees_blue",
  "#002366": "royal_blue_dark",
  "#171412": "black_kokushoku",
  "#143C7C": "lapis_lazuli_japan",
  "#0F4D92": "yale_blue",
  "#1560BD": "denim",
  "#1492C4": "cyan_cornflower_blue",
  "#20B2AA": "lightseagreen",
  "#164ACA": "new_car",
  "#1E90FF": "dodgerblue",
  "#00147E": "dark_imperial_blue",
  "#172B86": "dark_cornflower_blue",
  "#2096F3": "weebly_blue",
  "#1034A6": "egyptian_blue",
  "#2962FF": "summer_sky",
  "#0073CF": "true_blue1",
  "#009933": "jungle_green",
  "#264653": "greengrey",
  "#035096": "medium_electric_blue",
  "#1A191E": "mate_black",
  "#23297A": "saint_patricks_blue",
  "#1B2E35": "goryeo_storeroom",
  "#1B5E20": "mughal_green",
  "#007F5C": "spanish_viridian",
  "#1D44B3": "denim_blue",
  "#246BCE": "celtic_blue",
  "#1F0B08": "licorice",
  "#252321": "black_chestnut",
  "#2E7D32": "japanese_laurel",
  "#006994": "sea_blue",
  "#24A0ED": "button_blue",
  "#000080": "bright_navy",
  "#2167A1": "lapis_lazuli",
  "#21B249": "asda_green_2002",
  "#2262DD": "flickr_blue",
  "#234096": "facebook_blue",
  "#3399FF": "brilliant_azure",
  "#232B2B": "charleston_green",
  "#319177": "illuminating_emerald",
  "#1F75FE": "blue_crayola",
  "#2A3439": "gunmetal",
  "#2887C8": "green_blue_crayola",
  "#26A69A": "keppel",
  "#26BFFF": "light_sky_blue",
  "#281010": "legal_dye",
  "#303F9F": "blue_pigment",
  "#33B64B": "pleasant_green",
  "#2A2F23": "pine_tree",
  "#27221F": "ink_color_sumi_iro",
  "#2A898B": "celadon_green",
  "#353535": "dark_gray",
  "#353839": "onyx",
  "#351F19": "scorched_brown",
  "#4166F5": "ultramarine_blue",
  "#2B2028": "blue_violet",
  "#2D383A": "outer_space_crayola",
  "#36454F": "charcoal",
  "#2F502A": "horsetail",
  "#317589": "thousand_herb",
  "#354E4B": "silk_crepe",
  "#33251F": "betel_nut",
  "#335E68": "deep_space_sparkle",
  "#195905": "lincoln_green",
  "#3CB371": "mediumseagreen",
  "#296E01": "metallic_green",
  "#367588": "teal_blue",
  "#4997D0": "celestial_blue",
  "#34A9AE": "verdigris",
  "#26A7DE": "twitter_blue",
  "#3A0CA3": "vivid_blue_violet",
  "#2C1608": "zinnwaldite_brown",
  "#3B2F2F": "black_coffee",
  "#36747D": "ming",
  "#1B03A3": "neon_blue",
  "#3B3C36": "black_olive",
  "#4C721D": "green_cola",
  "#2D68C4": "true_blue",
  "#4C9141": "may_green",
  "#364141": "onando",
  "#344D56": "iron_head_flower",
  "#40E0D0": "turquoise",
  "#393432": "indigo_ink_brown",
  "#324AB2": "violet_blue",
  "#1DACD6": "battery_charged_blue",
  "#3A6F8A": "jelly_bean_blue",
  "#3C3024": "cola",
  "#4285F4": "google_chrome_blue",
  "#45B1E8": "picton_blue",
  "#3E2230": "disappearing_purple",
  "#43302E": "old_burgundy",
  "#3D2B1F": "bistre",
  "#4F3320": "cafe_noir",
  "#3A403B": "rusty_storeroom",
  "#414A4C": "outer_space",
  "#410BD3": "interdimensional_blue",
  "#391802": "american_bronze",
  "#2A8000": "napier_green",
  "#4A261F": "acajou",
  "#3E8EDE": "tufts_blue",
  "#39A78E": "zomp",
  "#42A5F5": "bleu_de_france",
  "#3D4C51": "kimono_storage",
  "#4396A9": "winter_sky",
  "#339933": "forest_green",
  "#4D646C": "opposite_flower",
  "#45F9FF": "sky_blue",
  "#466B7D": "dark_electric_blue",
  "#4169E1": "royal_blue_light",
  "#470344": "american_purple",
  "#455859": "rusty_storage",
  "#4B5320": "army_green",
  "#484E27": "pine_needle",
  "#4C3D30": "simmered_seaweed_mirucha",
  "#3AA8C1": "moonstone",
  "#4A251A": "boiled_red_bean_brown",
  "#4F4944": "dull_blue_aonibi",
  "#51484F": "quartz",
  "#48929B": "light_blue",
  "#34B334": "american_green",
  "#4BC5FC": "light_azure",
  "#39FF14": "neon_green",
  "#330066": "deep_violet",
  "#483C32": "dark_lava",
  "#503430": "royal_brown",
  "#4CB7A5": "blue_lagoon",
  "#4DC6E1": "maximum_blue",
  "#4DD0E1": "sea_serpent",
  "#4B3C39": "brown_rat_grey",
  "#4E9226": "maximum_green",
  "#55B4B0": "dark_turquoise",
  "#534B4F": "dark_liver",
  "#5A7247": "military_green",
  "#506D73": "cadet",
  "#563C5C": "english_violet",
  "#528D30": "fresh_onion_moegi",
  "#446CCF": "han_blue",
  "#541E69": "imperial",
  "#543121": "weathered_bamboo",
  "#543630": "dark_liver_horses",
  "#54626F": "black_coral",
  "#4F666A": "stormcloud",
  "#6666FF": "very_light_blue",
  "#5731A5": "plump_purple",
  "#4424D6": "violetblue",
  "#586214": "antique_bronze",
  "#586415": "mustard_green",
  "#6B8E23": "olivedrab",
  "#66B032": "green_ryb",
  "#58BF4E": "mantis",
  "#696969": "dimgray",
  "#59702C": "darkolivegreen",
  "#5FC9BF": "bayside",
  "#669999": "desaturated_cyan",
  "#5A96A8": "crystal_blue",
  "#614E6E": "dark_indigo",
  "#5C6BC0": "violet_blue_crayola",
  "#5218FA": "han_purple",
  "#5D4037": "liver",
  "#5D423C": "umber",
  "#6699FF": "light_royal_blue",
  "#64E986": "very_light_malachite_green",
  "#645452": "wenge",
  "#5F9EA0": "cadetblue",
  "#5FB2DE": "carolina_blue",
  "#600F58": "palatinate_purple",
  "#603C24": "dark_brown",
  "#604338": "contemplation",
  "#5F8A8B": "steel_teal",
  "#60C14E": "apple",
  "#5DADEC": "blue_jeans",
  "#61DE9F": "medium_aquamarine",
  "#592B1F": "sumac_dyed_korozen",
  "#63351E": "van_dyke_brown",
  "#633D35": "painite",
  "#5D8AA8": "air_force_blue",
  "#50C878": "pale_emerald",
  "#708090": "slategray",
  "#64DAC1": "mediumaquamarine",
  "#58A813": "lawn_green",
  "#66361F": "aloewood",
  "#6AB2CA": "delicate_girl_blue",
  "#66BB6A": "iguana_green",
  "#66C0E8": "sky_blue_crayola",
  "#727472": "nickel",
  "#660066": "purple",
  "#6A5445": "quincy",
  "#689F38": "palm_leaf",
  "#6E81A0": "slate_blue",
  "#6D9A79": "oxley",
  "#669900": "olive_drab",
  "#73A9C2": "moonstone_blue",
  "#6D291A": "liver_organ",
  "#6D4238": "deep_coffee",
  "#6D94A5": "weldon_blue",
  "#7B68EE": "mediumslateblue",
  "#507D2A": "sap_green",
  "#77DD77": "pastel_green",
  "#6FE8FD": "electric_sky",
  "#706C66": "dark_silver",
  "#70853B": "moss_green",
  "#713604": "philippine_bronze",
  "#6E7F80": "aurometalsaurus",
  "#8D9440": "khaki",
  "#723F22": "golden_grey_bamboo",
  "#778899": "lightslategray",
  "#79443B": "bole",
  "#7350D3": "slateblue",
  "#867E36": "old_moss_green",
  "#738613": "siskin_sprout_yellow",
  "#87D3F8": "pale_cyan",
  "#751C00": "kenyan_copper",
  "#87A96B": "asparagus",
  "#7600B3": "dark_purple",
  "#765F57": "dove_feather_grey",
  "#836FFF": "medium_slate_blue",
  "#73C2FB": "maya_blue",
  "#77381F": "cypress_bark_color",
  "#7DC242": "asda_green",
  "#785E49": "color_of_an_undried_wall",
  "#7CB9E8": "aero",
  "#792D85": "maximum_purple",
  "#966FD6": "dark_pastel_purple",
  "#808080": "gray",
  "#808000": "heart_gold",
  "#7986CB": "ceil",
  "#720B98": "chinese_purple",
  "#824B35": "green_tea",
  "#9966CC": "amethyst",
  "#77B5FE": "french_sky_blue",
  "#7B5B52": "lye",
  "#7E5E60": "deep_taupe",
  "#7EB6FF": "parakeet_blue",
  "#7CB23F": "guacamole",
  "#7D8E5F": "pale_blue_usuao",
  "#69359C": "purple_heart",
  "#7EAAB3": "pewter_blue",
  "#7EC8EE": "baby_blue",
  "#7C0A02": "barn_red",
  "#80461B": "russet",
  "#836953": "pastel_brown",
  "#7DB700": "microsoft_green",
  "#7FCE1A": "kiwi",
  "#8B352D": "red_brown1",
  "#878681": "titanium",
  "#9999FF": "pale_lilac",
  "#7FCDCD": "light_cyan",
  "#8FD400": "sheen_green",
  "#80DDD2": "middle_blue_green",
  "#80DAEB": "medium_sky_blue",
  "#8CBED6": "dark_sky_blue",
  "#81D7FF": "lightskyblue",
  "#801818": "falu_red",
  "#823E00": "chocolate_traditional",
  "#88654E": "dark_brown_tangelo",
  "#825E1D": "finch_brown",
  "#826B58": "sen_no_rikyus_tea_rikyucha",
  "#9ACD32": "yellowgreen",
  "#82E8D7": "pearl_aqua",
  "#83622F": "yellow_sea_pine_brown",
  "#848482": "battleship_grey",
  "#7C4848": "tuscan_red",
  "#8B5F4D": "spicy_mix",
  "#99E6B3": "teal_deer",
  "#905D5D": "rose_taupe",
  "#871E0C": "kobe",
  "#8C5939": "brushwood_dyed_fushizome",
  "#84563C": "milk_chocolate",
  "#875D00": "bistre_brown",
  "#8B8589": "taupe_gray",
  "#87A194": "morning_blue",
  "#880E4F": "french_plum",
  "#817B69": "willow_grey",
  "#8B8680": "middle_grey",
  "#8DB255": "pale_young_green_onion",
  "#893F2E": "sparrow_brown",
  "#8F583C": "clove_brown",
  "#8954FF": "medium_violet",
  "#996633": "medium_brown",
  "#838996": "roman_silver",
  "#933709": "citrine_brown",
  "#8E4585": "plum",
  "#8A460A": "saddlebrown",
  "#8BBE1B": "dark_lemon_lime",
  "#8A0303": "blood1",
  "#8C1D0B": "deep_dumpling",
  "#8CC2EA": "cornflower",
  "#911EB4": "violet",
  "#993399": "dark_magenta",
  "#985538": "polished_brown",
  "#98817B": "cinereous",
  "#8A795D": "shadow",
  "#875F9A": "wisteria_purple",
  "#903EB3": "purple_plum",
  "#91A3B0": "cadet_grey",
  "#99CCFF": "pale_sky_blue",
  "#922724": "vivid_auburn",
  "#91674D": "italian_roast",
  "#925849": "plum_blossom_mouse",
  "#9FA91F": "citron",
  "#8AB9F1": "jordy_blue",
  "#880085": "mardi_gras",
  "#A4DDED": "non_photo_blue",
  "#92000A": "sangria",
  "#964B00": "brown_traditional",
  "#987456": "liver_chestnut",
  "#A8E4A0": "granny_smith_apple",
  "#965A3E": "coconut",
  "#A19D94": "iron",
  "#96A53C": "pomelo",
  "#9F8170": "beaver",
  "#A0A0A0": "darkgray",
  "#98A8BE": "cadet_blue_crayola",
  "#B0BF1A": "acid_green",
  "#98B4D4": "pale_blue",
  "#99130D": "spartan_crimson",
  "#9A4EAE": "purpureus",
  "#A0785A": "chamoisee",
  "#9AA7ED": "light_cobalt_blue",
  "#93C572": "pistachio",
  "#9D2B22": "red_birch",
  "#9B6A57": "walnut_dyed",
  "#986960": "dark_chestnut",
  "#A17917": "rapeseed_oil",
  "#9B782C": "metallic_sunburst",
  "#A7D8DE": "crystal",
  "#9C3C25": "red_brown",
  "#AFD7E9": "lightblue",
  "#9F5233": "red_ochre",
  "#996600": "gamboge_orange_brown",
  "#9B7653": "dirt",
  "#B2EC5D": "inchworm",
  "#9F00C5": "purple_munsell",
  "#9FA4AA": "chrome_aluminum",
  "#A52A2A": "auburn",
  "#A65F46": "copper_brown",
  "#A97142": "metallic_bronze",
  "#A08CCF": "light_pastel_purple",
  "#A0C7E8": "pale_cerulean",
  "#BDDA57": "june_bud",
  "#9AB973": "olivine",
  "#A1C23C": "margarita",
  "#A1C5CB": "pastel_blue",
  "#A22911": "chinese_red",
  "#AB381F": "chinese_brown",
  "#9932CC": "darkorchid",
  "#A2672B": "dark_gold",
  "#A2764A": "cafe_au_lait",
  "#A281D0": "lenurple",
  "#A6E7FF": "fresh_air",
  "#A30042": "dark_crimson",
  "#A83731": "sweet_brown",
  "#A38E7A": "grullo",
  "#A41313": "blood",
  "#A57164": "blast_off_bronze",
  "#A50B5E": "jazzberry_jam",
  "#AC4313": "metallic_brown",
  "#967BB6": "lavender_purple",
  "#A7571F": "clove_dyed_chojizome",
  "#A7FFEB": "celeste",
  "#A40000": "dark_candy_apple_red",
  "#A81C07": "rufous",
  "#A8CE5F": "yellow_green_crayola",
  "#AB6134": "loquat_tree_brown",
  "#AB2C5E": "amaranth_deep_purple",
  "#AB3F2E": "medium_carmine",
  "#AB47BC": "deep_fuchsia",
  "#AB580F": "light_brown",
  "#AB7CF7": "vibrant_lavender",
  "#AB872E": "pale_fallen_leaves",
  "#ABB9BB": "ash_gray",
  "#A3C1AD": "cambridge_blue",
  "#AD1414": "carnelian",
  "#AC5813": "dirty_brown",
  "#AD3900": "rust",
  "#AF6E4D": "brown_sugar",
  "#A0D6B4": "turquoise_green",
  "#AE111F": "upsdell_red",
  "#B0927A": "faded_rikyus_tea",
  "#AAA9AD": "silver_metallic",
  "#AFB1AE": "silver_foil",
  "#FF0000": "red",
  "#C51162": "raspberry",
  "#AE0C00": "mordant_red_19",
  "#B22222": "firebrick",
  "#BD33A4": "byzantine",
  "#A75502": "windsor_tan",
  "#AF6300": "philippine_gold",
  "#AF7464": "copper_penny",
  "#BB5D42": "spicy_red_brown",
  "#B38B6D": "light_taupe",
  "#B2D732": "lime_green",
  "#B0F2F7": "blizzard_blue",
  "#B87333": "dark_copper",
  "#B56C60": "water_persimmon",
  "#B27E18": "university_of_california_gold",
  "#BA8759": "deer",
  "#B08D57": "bronze_metallic",
  "#B391FF": "pale_violet",
  "#BCD4E6": "beau_blue",
  "#B9F2FF": "diamond",
  "#B41301": "tomato_sauce",
  "#B8860B": "darkgoldenrod",
  "#9DC209": "limerick",
  "#B4DDFA": "pale_cornflower_blue",
  "#B574C3": "african_violet",
  "#B7702D": "chinese_yellow_tea",
  "#B65500": "alloy_orange",
  "#B6D401": "bitter_lemon",
  "#B0E0E6": "powderblue",
  "#B14A30": "birch_brown_kabacha",
  "#B8DADE": "columbia_blue",
  "#BC987E": "pale_taupe",
  "#BBA46D": "pale_oak",
  "#C0C0C0": "silver",
  "#B62020": "red_cola",
  "#BB8141": "golden_oak",
  "#C19A6B": "camel",
  "#C83F49": "strawberry_red",
  "#C66B27": "light_golden_brown",
  "#C48E69": "white_tea",
  "#BC2A16": "dark_pastel_red",
  "#BC6F00": "asda_orange_1968",
  "#BEA493": "mocha",
  "#C4AEAD": "silver_pink",
  "#BBD0C9": "jet_stream",
  "#BD90E6": "bright_lavender",
  "#C6C2B6": "inside_of_a_bottle",
  "#BE0576": "mediumvioletred",
  "#B666D2": "rich_lilac",
  "#BEDC9D": "gin",
  "#BF1A1A": "pure_crimson",
  "#BD3000": "lemon_iced_tea",
  "#BC2D29": "greyed_red",
  "#BF8302": "caramel",
  "#BB9351": "maple_syrup",
  "#C9C0BB": "pale_silver",
  "#BFCCD2": "aluminum_foil",
  "#C9DC87": "medium_spring_bud",
  "#C0711F": "mulberry_orange",
  "#BCB58C": "underside_of_willow_leaves",
  "#B64925": "cattail_color",
  "#BE7F51": "dark_ochre",
  "#C0362C": "dark_international_orange",
  "#C04000": "mahogany",
  "#CB6D51": "copper_red",
  "#C2DD1F": "pear",
  "#CCFFFF": "very_pale_cyan",
  "#C80815": "venetian_red",
  "#BB6528": "ruddy_brown",
  "#CCCCCC": "lightgray",
  "#CCFFCC": "very_pale_green",
  "#C8AD7F": "light_french_beige",
  "#BFC1C2": "silver_sand",
  "#CD9575": "antique_brass",
  "#C5CBE1": "light_periwinkle",
  "#C67260": "electric_brown",
  "#CD7A00": "mustard_brown",
  "#CC9966": "brown_yellow",
  "#C6D856": "chinese_green",
  "#C6E4F7": "water",
  "#C71FFF": "bright_orchid",
  "#C4C3D0": "lavender_gray",
  "#CC3333": "persian_red",
  "#CFCFC4": "pastel_gray",
  "#CA1837": "amaranth_red",
  "#CA2C31": "madder_lake",
  "#CABEFF": "palelavender",
  "#CA6924": "amber_japan",
  "#D68A59": "raw_sienna",
  "#CC26A1": "medium_red_violet",
  "#CF3A24": "scarlet1",
  "#CC7722": "ochre1",
  "#DBE9F4": "azureish_white",
  "#CCFF99": "very_light_green",
  "#CC3300": "carrot",
  "#D2B48C": "tan",
  "#CE843A": "peru",
  "#D99A6C": "tan_crayola",
  "#CE93D8": "medium_lavender_magenta",
  "#DC143C": "crimson",
  "#C95A49": "cedar_chest",
  "#D2691E": "cinnamon",
  "#CFB0EA": "tropical_violet",
  "#CB410B": "sinopia",
  "#DA8A67": "copper",
  "#D6CADD": "languid_lavender",
  "#D34E36": "glazed_persimmon",
  "#D1593F": "dark_coral",
  "#D57835": "decaying_leaves",
  "#CC9900": "chinese_gold",
  "#DB7093": "palevioletred",
  "#D28333": "chinese_bronze",
  "#CE9F6F": "white_oak",
  "#CC0000": "jolly_red",
  "#D73B3E": "jasper",
  "#C3447A": "berry_pink",
  "#D9603B": "medium_vermilion",
  "#D36600": "orange_brown",
  "#DA614E": "jelly_bean",
  "#CD040B": "verizon_red1",
  "#CE2029": "fire_engine_red",
  "#D55113": "vivid_red_tangelo",
  "#D55E00": "metallic_orange",
  "#D9B611": "patrinia_flowers",
  "#D5CCC2": "timberwolf",
  "#E3FF00": "lemon_lime",
  "#D99058": "persian_orange",
  "#CB7E1F": "gold_brown_yamabukicha",
  "#E29C45": "golden_fallen_leaves",
  "#DEAA88": "tumbleweed",
  "#D65076": "blush",
  "#DA3287": "deep_cerise",
  "#DD4124": "rust_red",
  "#E25822": "flame",
  "#D853C9": "orchid",
  "#D89852": "sand",
  "#E2B13C": "japanese_triandra_grass",
  "#DA9100": "harvest_gold",
  "#DCD0FF": "pale_lavender",
  "#D40000": "rosso_corsa",
  "#E68364": "brewed_mustard_brown",
  "#DEB887": "burlywood",
  "#D9BAA5": "dark_vanilla",
  "#DFCFBE": "beige_grey",
  "#DCDCDC": "gainsboro",
  "#E9FFDB": "nyanza",
  "#DA0A23": "strong_carmine",
  "#E03C31": "cg_red",
  "#E08A1E": "sumac_dyed_hajizome",
  "#DE8F4E": "jasper_orange",
  "#E3DAC9": "bone",
  "#DC3023": "orangered",
  "#E86100": "spanish_orange",
  "#DBA010": "urobilin",
  "#DD2C00": "microsoft_red",
  "#E08D3C": "tigers_eye",
  "#E2BE9F": "eggshell_paper",
  "#EC5800": "persimmon",
  "#EC8254": "washed_out_persimmon",
  "#E5AA70": "fawn",
  "#EBC2AF": "zinnwaldite",
  "#DF86AC": "middle_purple",
  "#EBF6F7": "indigo_white",
  "#E12C2C": "permanent_geranium_lake",
  "#E34234": "cinnabar",
  "#E4717A": "candy_pink",
  "#E7968B": "salmon_rose",
  "#E7C9A9": "manila",
  "#E5E4E2": "platinum",
  "#F0E891": "green_yellow_crayola",
  "#E7FEFF": "bubbles",
  "#ED9121": "carrot_orange",
  "#E1E7EA": "bright_gray",
  "#DC5349": "lychee",
  "#E27406": "beer",
  "#E49B0F": "gamboge",
  "#E2DEFA": "lavender_mist",
  "#E1EDE9": "very_pale_grey",
  "#E34B44": "google_chrome_red",
  "#ED872D": "cadmium_orange",
  "#EEE0B1": "cookies_and_cream",
  "#EEE8AA": "palegoldenrod",
  "#E3E0AA": "pale_spring_bud",
  "#E2E5DE": "chinese_white",
  "#EB6123": "halloween_orange",
  "#E48400": "fulvous",
  "#E6BE8A": "gold_crayola",
  "#E6E0D4": "white_coffee",
  "#E3F988": "mindaro",
  "#E62020": "lust",
  "#EAA221": "marigold",
  "#E6194B": "deep_raspberry",
  "#FB4F14": "orioles_orange",
  "#E6508F": "raspberry_pink",
  "#EC956C": "sawtooth_oak",
  "#EB593D": "orange_soda1",
  "#FFFFBF": "very_pale_yellow",
  "#E35C38": "refreshed_red_brown",
  "#F39998": "peach_burst",
  "#E8A631": "rape_blossom_brown",
  "#E8AD00": "mustard_yellow",
  "#E6D0AB": "durian_white",
  "#E9F6EF": "italian_ice",
  "#E8F6FF": "aliceblue",
  "#FF4E20": "ochre",
  "#E94196": "barbie_pink",
  "#FCFFA4": "calamansi",
  "#F88379": "congo_pink",
  "#E9692C": "deep_carrot_orange",
  "#E97451": "burnt_sienna",
  "#FF80FF": "light_magenta",
  "#EAAB57": "indian_yellow",
  "#EFC050": "goldenrod",
  "#E1A95F": "earth_yellow",
  "#F35336": "blood_red",
  "#EF476F": "pale_red",
  "#F46036": "vibrant_orangered",
  "#F07427": "vivid_tangelo",
  "#F77FBE": "persian_pink",
  "#F58F84": "ibis_wing_color",
  "#F37042": "chinese_orange",
  "#F4A460": "sandybrown",
  "#EDA600": "spanish_yellow",
  "#F7C58E": "douban_light_yellow",
  "#EFCC00": "yellow_munsell",
  "#EDE6D6": "white_chocolate",
  "#EB4C42": "carmine_pink",
  "#EE5B4A": "fire_opal",
  "#EE8CFF": "bubblegum",
  "#F5BD1F": "orange_yellow",
  "#FF6699": "light_red_violet",
  "#F7665A": "thrice_dyed_crimson",
  "#FE4EDA": "purple_pizzazz",
  "#EF87B2": "orchid_pink",
  "#FA9258": "plum_dyed_umezome",
  "#FFA812": "dark_tangerine",
  "#ECB176": "middle_yellow_red",
  "#FBCEB1": "apricot",
  "#F4F0EC": "isabelline",
  "#F5F5F5": "whitesmoke",
  "#F00": "primary_red",
  "#FB9902": "orange_ryb",
  "#F8B878": "mellow_apricot",
  "#F6EABE": "lemon_meringue",
  "#F0F4F5": "anti_flash_white",
  "#F77F00": "university_of_tennessee_orange",
  "#FB9912": "kumquat",
  "#FAA945": "corn_japan",
  "#F2BA49": "maximum_yellow_red",
  "#F5F3EF": "penguin_white",
  "#F2B400": "american_yellow",
  "#F2AB47": "turmeric",
  "#F7BB7D": "light_yellow_asagi",
  "#F2C649": "maize_crayola",
  "#FFB347": "pastel_orange",
  "#F8DE7E": "jasmine",
  "#FAE6FA": "pale_purple_pantone",
  "#FD5240": "ogre_odor",
  "#F58025": "princeton_orange",
  "#FFA631": "egg",
  "#FFB94E": "floral_leaf",
  "#FFC34D": "chickadee",
  "#FAD6A5": "deep_champagne",
  "#F5DEB3": "wheat",
  "#FBAB60": "rajah",
  "#FFB61E": "gamboge_bright",
  "#FFB6C1": "lightpink",
  "#FFC87C": "topaz",
  "#F5E1D1": "champagne_pink",
  "#F7E7CE": "champagne",
  "#F5F3E7": "alabaster",
  "#F8F8FF": "ghostwhite",
  "#F63BBE": "frostbite",
  "#FF99CC": "pale_magenta_pink",
  "#FF9933": "deep_saffron",
  "#FFCBA4": "deep_peach",
  "#F5C71A": "deep_lemon",
  "#F5FFFA": "mintcream",
  "#F70D1A": "vivid_red",
  "#F72E26": "huawei_red",
  "#F772DB": "pale_magenta",
  "#FF7800": "safety_orange",
  "#FFCC66": "light_orange",
  "#FCCC1A": "bright_yellow",
  "#FFD59A": "caramel_creme",
  "#FFDB58": "mustard",
  "#F7E98E": "flavescent",
  "#F84AB2": "strong_boy_pink",
  "#FF7952": "rinsed_out_red",
  "#FDD9B5": "sandy_tan",
  "#FADFAD": "peach_yellow",
  "#FE2712": "red_ryb",
  "#FF6FFF": "shocking_pink_crayola",
  "#FFC922": "sunset_yellow",
  "#FFD1DC": "pale_blush_pink",
  "#FFDAC1": "peach_puff",
  "#F4CA16": "jonquil",
  "#FFE4C4": "bisque",
  "#FFE9D1": "flesh",
  "#FFFFFF": "white",
  "#FF6E4A": "outrageous_orange",
  "#FF9966": "atomic_tangerine",
  "#FF9505": "yellow_orange_wheel",
  "#FFA700": "chrome_yellow",
  "#FFAE42": "yellow_orange",
  "#FFC40C": "mikado_yellow",
  "#F8D568": "orange_yellow_crayola",
  "#FFE119": "sunshine_yellow",
  "#FFDFBF": "very_pale_orange",
  "#FFE4B5": "moccasin",
  "#FFE4CD": "lumber",
  "#FADA5E": "naples_yellow",
  "#FAE9AE": "banana_mania",
  "#FFEBCD": "blanchedalmond",
  "#FB3028": "coral_red",
  "#FF631C": "brave_orange",
  "#FF8C00": "darkorange",
  "#FFB95A": "cape_jasmine",
  "#FDBE02": "mango",
  "#FFCC33": "sunglow",
  "#FFE670": "shandy",
  "#FFF5EE": "seashell",
  "#FBF0B4": "medium_champagne",
  "#FEFDFA": "lotion",
  "#FF7F50": "coral",
  "#FB8136": "red_bronze",
  "#F28500": "satsuma",
  "#FDB900": "microsoft_yellow",
  "#FFBE0B": "bright_yellow_orange",
  "#FFC324": "ripe_mango",
  "#FCC4BF": "spanish_pink",
  "#FDD5B1": "feldspar",
  "#FDDB6D": "dandelion_crayola",
  "#FEE440": "electric_yellow",
  "#FFF0F5": "lavenderblush",
  "#FFFFF0": "ivory",
  "#FEFEFA": "baby_powder",
  "#FF6961": "pastel_red",
  "#FF681F": "orange_red",
  "#FF6D3A": "smashed_pumpkin",
  "#FF878D": "tulip",
  "#FF8243": "mango_tango",
  "#F99245": "royal_orange",
  "#FFB3DE": "light_hot_pink",
  "#FFD32D": "vibrant_bright_yellow",
  "#FCC9B9": "cherry_blossom",
  "#FDDB3A": "child_banana",
  "#FE05A2": "fashion_fuchsia",
  "#FB5607": "bright_orange_red",
  "#FF6666": "dark_salmon",
  "#FC600A": "tangerine",
  "#FD5E53": "sunset_orange",
  "#FF8B00": "american_orange",
  "#FE8E6E": "meat_color",
  "#FF9900": "vivid_gamboge",
  "#FFB3A7": "washed_out_crimson",
  "#FFAA1D": "bright_yellow_crayola",
  "#FEA8A7": "light_blush",
  "#FFB300": "ucla_gold",
  "#FFBA00": "selective_yellow",
  "#FFBF00": "amber",
  "#FFD166": "vibrant_sunny_yellow",
  "#FFD8B1": "peach",
  "#FFDAB9": "peachpuff",
  "#FFE5B4": "pale_peach",
  "#FFEFD5": "papayawhip",
  "#FEF3C0": "blond",
  "#FCE883": "yellow_crayola",
  "#FFF8DC": "cornsilk",
  "#FFF8E7": "cosmic_latte",
  "#FDFFF5": "milk",
  "#FF0066": "hot_pink",
  "#FC0FC0": "shocking_pink",
  "#FF0800": "candy_apple_red",
  "#FF2D8A": "barbie_pink_1999",
  "#FF4200": "taobao_orange",
  "#FF4081": "rose_bonbon",
  "#FF4C2A": "portland_orange",
  "#FF5050": "strawberry",
  "#FF5F00": "vivid_orange",
  "#FF61A9": "hotpink",
  "#FF7518": "pumpkin",
  "#FF6F61": "watermelon",
  "#FF6C75": "begonia",
  "#FF7300": "philippine_orange",
  "#FF732D": "papaya",
  "#FF7759": "coral_color",
  "#FF7B78": "salmon",
  "#FF9AA2": "soft_coral",
  "#FF9D83": "vivid_tangerine",
  "#FFA000": "vivid_orange_peel",
  "#FFA565": "pale_incense_usuko",
  "#FFA500": "ora_orange",
  "#FF9F1C": "vibrant_orange",
  "#FFA996": "poppy_petal",
  "#FFB077": "very_light_tangelo",
  "#FFB200": "chinese_yellow",
  "#FFBD88": "macaroni_and_cheese",
  "#FCC200": "golden_poppy",
  "#FEBAAD": "melon",
  "#FECB00": "philippine_yellow",
  "#FFCC00": "tangerine_yellow",
  "#FFCCE1": "classic_rose",
  "#FFCE44": "google_chrome_yellow",
  "#FFCCCC": "pale_pink",
  "#FFD662": "banana",
  "#FFDDCA": "unbleached_silk",
  "#FFD700": "golden",
  "#FFDF00": "golden_yellow",
  "#FFE02E": "banana_yellow",
  "#FFDEAD": "navajowhite",
  "#FFE959": "minion_yellow",
  "#FFEB00": "middle_yellow",
  "#FFEA5C": "corn",
  "#FFEAD9": "antiquewhite",
  "#FFEB3B": "vibrant_electric_yellow",
  "#FFF620": "buttercup_yellow",
  "#FFFF9F": "lemon_yellow_crayola",
  "#FFF7EB": "oldlace",
  "#FFF891": "pastel_yellow",
  "#FFFAFA": "snow",
  "#FFFF00": "yellow"
};

// auto-generated from assets/svg (fill colors, 3673 unique, 3731 files)
var emoColors = [
  '#00000D', '#000200', '#000202', '#000304', '#000306', '#000409', '#000502', '#000504', '#002691', '#0048FF',
  '#004A7C', '#004CA5', '#004D40', '#004DAE', '#004F84', '#004FAC', '#004FAD', '#00579C', '#00695C', '#006CA8',
  '#006CA9', '#006DA6', '#006F2E', '#0071AF', '#0071BC', '#007689', '#0076C6', '#00796B', '#007A71', '#007D33',
  '#00821D', '#00847A', '#00897B', '#008C9A', '#008DEB', '#008EC9', '#008F76', '#0091EA', '#00937A', '#009688',
  '#0097A7', '#009984', '#00A5FF', '#00AA46', '#00AA48', '#00BCD4', '#00BDA3', '#00BFA5', '#00BFED', '#00C0A2',
  '#00C0E9', '#00C1E9', '#00C1EC', '#00C1ED', '#00CC00', '#00CFFF', '#00EDCD', '#00EEFF', '#010000', '#010100',
  '#010101', '#010102', '#010103', '#010206', '#010605', '#014EAB', '#014EAC', '#014FAB', '#01579B', '#016AA9',
  '#016BA2', '#016DA7', '#01AB46', '#020200', '#020204', '#020308', '#0241BC', '#024AB1', '#024FAC', '#0250AC',
  '#025ABC', '#026AA8', '#0277BD', '#027B69', '#027F1C', '#0284FF', '#0288D1', '#028B2B', '#02A5A0', '#02A945',
  '#02AB46', '#02AB47', '#02AB48', '#02AD41', '#02AEA8', '#02BFF1', '#030200', '#03347A', '#034DAD', '#034EAC',
  '#03728C', '#0386D9', '#039BA1', '#039BE5', '#03A9F4', '#03AB47', '#040000', '#040301', '#044FAB', '#0468A6',
  '#048196', '#04841F', '#04846C', '#04A287', '#04AB47', '#04BFA3', '#04C1EA', '#050402', '#05AC47', '#05BEF2',
  '#05C19D', '#05E005', '#060401', '#060405', '#0665B2', '#06927F', '#06AA46', '#06AC47', '#06AC48', '#07000D',
  '#070707', '#075263', '#07AC47', '#07BFF0', '#07D6B7', '#0847B0', '#0868D4', '#0896A5', '#08A5EB', '#08AC47',
  '#090A0B', '#091238', '#092C56', '#093068', '#0967D7', '#09AD48', '#0A070B', '#0A0A0A', '#0A1237', '#0A3160',
  '#0A3880', '#0A67A8', '#0A7C1F', '#0A7E1D', '#0AAC81', '#0AAD48', '#0AC2E7', '#0B0B0B', '#0B0C0C', '#0B52A0',
  '#0B88CF', '#0BAD48', '#0C090C', '#0C66C8', '#0CAD48', '#0D47A1', '#0D6BDB', '#0D9ABB', '#0DAE48', '#0E2B52',
  '#0EAE48', '#0F3B7C', '#0F60B2', '#0F64C7', '#0FAE48', '#0FCAFF', '#100D0F', '#10203D', '#10356E', '#1064CB',
  '#10AE48', '#11AE48', '#12AF48', '#12D8B7', '#131314', '#134BA5', '#136FD8', '#13AF48', '#141111', '#141414',
  '#143C7C', '#144E92', '#1465C0', '#1492C4', '#14AF48', '#151413', '#1565C0', '#1565C4', '#159DF5', '#159FF7',
  '#15A595', '#15AF48', '#15CB9B', '#164ACA', '#1664C0', '#168DFC', '#16B049', '#171716', '#171717', '#172789',
  '#172B86', '#172D86', '#174DA1', '#176BC6', '#176CC7', '#178BFD', '#1798F3', '#179CF5', '#17B049', '#182B85',
  '#184AAD', '#1851ED', '#188AD6', '#188AFF', '#18B049', '#191919', '#193D51', '#194FA5', '#1966A4', '#1976D2',
  '#19B049', '#19DDB8', '#1A1717', '#1A191E', '#1A1A19', '#1A1A1A', '#1A1A1D', '#1A237E', '#1AB149', '#1B1B1B',
  '#1B2A89', '#1B2B8F', '#1B2E35', '#1B5E20', '#1B65A6', '#1B6DA4', '#1B75BC', '#1B9372', '#1BB149', '#1C1D1E',
  '#1C1E1E', '#1C3AA9', '#1C75BC', '#1CB149', '#1D44B3', '#1D7DCC', '#1D86FA', '#1D86FB', '#1D89FE', '#1DB149',
  '#1E4EA6', '#1E5FC6', '#1E85F9', '#1E86FE', '#1E86FF', '#1E88E5', '#1E88FE', '#1EB149', '#1EB7E8', '#1F0B08',
  '#1F1D1B', '#1F6721', '#1F6ABF', '#1F82A3', '#1F87FD', '#1F87FF', '#1FA9EB', '#1FB249', '#201284', '#202020',
  '#202121', '#206022', '#2086FA', '#2086FD', '#2096F3', '#20B249', '#20D39E', '#212121', '#214485', '#2167A1',
  '#2196F3', '#21B249', '#22404C', '#2262DD', '#22AD9D', '#22B249', '#231F20', '#232020', '#234096', '#2385F8',
  '#23B34A', '#24B34A', '#24E2B5', '#252829', '#25836E', '#2584FF', '#25B34A', '#262D33', '#263238', '#2686C6',
  '#26A69A', '#26B34A', '#26BFFF', '#27282D', '#272C34', '#274C5E', '#27B44A', '#281010', '#282827', '#282828',
  '#282F2F', '#283593', '#2865AB', '#2885C6', '#28B3F2', '#28B44A', '#291B16', '#291D15', '#292928', '#29292A',
  '#292D26', '#2962FF', '#29B3A6', '#29B44A', '#29B6F6', '#2A2725', '#2A2A2A', '#2A2B28', '#2A2D2F', '#2A4E56',
  '#2A56C6', '#2A85C6', '#2A898B', '#2AB44A', '#2B2A32', '#2B2B2B', '#2BB44A', '#2C292A', '#2C2A32', '#2C2B2C',
  '#2C2B2D', '#2C2C2C', '#2C2F31', '#2C2F33', '#2C302B', '#2C312C', '#2C3640', '#2C3F9E', '#2C7B2E', '#2C7E33',
  '#2CB54A', '#2D2A25', '#2D2B2E', '#2D2B30', '#2D2B33', '#2D2D2B', '#2D2D2D', '#2D2D2E', '#2D2E31', '#2D2E35',
  '#2D3130', '#2D3133', '#2D792A', '#2D802D', '#2DB54A', '#2E1914', '#2E2A32', '#2E2C2F', '#2E2C33', '#2E2D31',
  '#2E2E27', '#2E2E2E', '#2E2E2F', '#2E2F2D', '#2E2F2F', '#2E2F31', '#2E302D', '#2E302F', '#2E3030', '#2E5128',
  '#2E5FE6', '#2E7D32', '#2E7E30', '#2E7E31', '#2E9DF4', '#2EB54A', '#2F2829', '#2F2927', '#2F2E2F', '#2F2F2D',
  '#2F2F2F', '#2F2F30', '#2F302B', '#2F302D', '#2F3030', '#2F363A', '#2F3B4B', '#2F3E82', '#2F502A', '#2F7889',
  '#2F7C31', '#2F7F32', '#2FB54A', '#302C30', '#302F2F', '#303030', '#303031', '#303232', '#303F9F', '#304945',
  '#304E5E', '#307B32', '#307B37', '#307D31', '#30B64B', '#312D2D', '#312F2A', '#312F2C', '#31312F', '#313130',
  '#31322E', '#317C31', '#31B64B', '#322D2E', '#323130', '#323230', '#323234', '#323332', '#325599', '#327E33',
  '#329377', '#32B64B', '#33251F', '#33312E', '#33312F', '#333132', '#333333', '#335599', '#335E68', '#33632C',
  '#33691E', '#33AC71', '#33B64B', '#34302F', '#34700D', '#347A88', '#3488C1', '#349EFE', '#34A9AE', '#34B6E2',
  '#34B74B', '#351BA4', '#35220B', '#352A2D', '#353535', '#353738', '#356477', '#35B74B', '#3615AF', '#362729',
  '#36292B', '#363B34', '#364F4B', '#365666', '#366918', '#3674CE', '#367A8B', '#367C2D', '#368231', '#36B4E1',
  '#36B4E2', '#36B74B', '#372D2B', '#373C3F', '#37474F', '#374C57', '#378016', '#37B4E2', '#37B4E5', '#37B5E1',
  '#37B74B', '#37D8C3', '#385661', '#385662', '#388E3C', '#38B2E8', '#38B74B', '#393531', '#3949AB', '#394D57',
  '#395552', '#395660', '#395661', '#39B84B', '#39BDE3', '#3A3839', '#3A3A3A', '#3A6F8A', '#3AB5A0', '#3AB84B',
  '#3B2622', '#3B2C22', '#3B5361', '#3B78E7', '#3BB84B', '#3BBCF7', '#3C2B24', '#3C2C23', '#3C3C3C', '#3CB84B',
  '#3DAAE0', '#3DB94C', '#3E2230', '#3E2723', '#3E4346', '#3E727B', '#3E737C', '#3EB94C', '#3F2720', '#3F2C13',
  '#3F3F3F', '#3F4040', '#3F474C', '#3F51B5', '#3F545F', '#3F7377', '#3F737B', '#3FB94C', '#402821', '#403D3E',
  '#403F42', '#404040', '#404042', '#40423E', '#404649', '#4054B0', '#40717A', '#40717B', '#40727B', '#40B94C',
  '#40BFE6', '#40C0E7', '#40C252', '#40C4FF', '#410BD3', '#412A0D', '#412C0C', '#414042', '#414340', '#41484A',
  '#41727A', '#4186F1', '#418C1D', '#41BA4C', '#422319', '#422B0D', '#42312C', '#423F3E', '#424242', '#427687',
  '#429ADF', '#42A18E', '#42A5F5', '#42BA4C', '#4300D9', '#434343', '#434B55', '#434C4E', '#437687', '#4383F4',
  '#4396A9', '#43A047', '#43BA4C', '#44261F', '#444444', '#444445', '#444540', '#44484E', '#44494E', '#444E47',
  '#445A65', '#4485F6', '#44B3E6', '#44BA4C', '#454140', '#45494F', '#454B4E', '#454C4F', '#454C52', '#455A64',
  '#4568AC', '#4568AD', '#45BA4C', '#45F9FF', '#464646', '#46484A', '#464B4E', '#464C4E', '#464C4F', '#464C50',
  '#464C52', '#464D50', '#466B7D', '#467CE0', '#46BB4C', '#470344', '#47302D', '#473530', '#474B4E', '#474B4F',
  '#474C4F', '#474C50', '#474C52', '#474D50', '#474D51', '#47515C', '#47BB4C', '#48145C', '#484A4E', '#484C51',
  '#484D4F', '#484D50', '#484D51', '#484E23', '#484E27', '#485020', '#489DF6', '#48BB4C', '#48CDED', '#492C25',
  '#49352E', '#49362E', '#494949', '#49A4BA', '#49BB4C', '#49C0F5', '#4A251A', '#4A261F', '#4A2F27', '#4A4240',
  '#4A4542', '#4A4A29', '#4A4A4C', '#4ABC4D', '#4B0DD4', '#4B0FCE', '#4B4A51', '#4B4C4D', '#4B4C4E', '#4B7179',
  '#4B727B', '#4B8A99', '#4B9CED', '#4B9EEC', '#4BBC4D', '#4BC5FC', '#4BDDFF', '#4BFF17', '#4C186E', '#4C4035',
  '#4C4038', '#4C443F', '#4C4C4C', '#4C5125', '#4C889B', '#4C8C19', '#4CA854', '#4CAF50', '#4CBC4D', '#4CC1F7',
  '#4D3129', '#4D3730', '#4D453C', '#4D4D4D', '#4DA852', '#4DB6AC', '#4DBC4D', '#4DC6E1', '#4DD0E1', '#4E342E',
  '#4E433C', '#4E433D', '#4E4D50', '#4E5725', '#4E6B17', '#4E8F34', '#4E9226', '#4EA4B0', '#4EB0D3', '#4EBD4D',
  '#4EC0F5', '#4EC1F5', '#4F322C', '#4F3320', '#4F352E', '#4F3B37', '#4F838F', '#4F8B26', '#4FBD4D', '#4FC0FA',
  '#4FC1F5', '#4FC2F7', '#4FC3F7', '#4FC4F8', '#4FE8D8', '#503430', '#50352F', '#50362D', '#503730', '#504644',
  '#504F4F', '#505152', '#50565C', '#5064C9', '#506B3F', '#506D71', '#506D73', '#50AFC4', '#50BD4D', '#50C1F6',
  '#50C4FA', '#513531', '#513532', '#51362D', '#51362F', '#513630', '#513635', '#513730', '#513C5E', '#515151',
  '#516C73', '#518E2C', '#518E30', '#51BD4D', '#522F21', '#523226', '#52322A', '#523329', '#52352A', '#52362D',
  '#523730', '#523833', '#524745', '#52575C', '#528D30', '#52BD4D', '#52C0EE', '#52C2F3', '#532D1D', '#533731',
  '#535456', '#5366CF', '#536DFE', '#536F79', '#536F7B', '#536F7D', '#537F94', '#53B4A0', '#53BE4D', '#541E69',
  '#543121', '#543527', '#543529', '#543630', '#543731', '#543930', '#545454', '#54585B', '#54595F', '#54636E',
  '#54646D', '#54656B', '#546D7A', '#546D81', '#546E7A', '#546F79', '#546F7A', '#546F7B', '#547078', '#548B2E',
  '#54BE4D', '#553A30', '#5547F4', '#557077', '#558B2F', '#558EA0', '#559833', '#55BE4D', '#563428', '#563C31',
  '#56BE4D', '#56BFE6', '#56C2F9', '#5731A5', '#573D36', '#575757', '#575A5B', '#57BF4E', '#58382B', '#583EE2',
  '#586214', '#586415', '#589622', '#58A12F', '#58BF4E', '#58C4FD', '#593329', '#595858', '#595959', '#595F66',
  '#596514', '#59702C', '#597718', '#598B15', '#59951B', '#5995B3', '#59BF4E', '#59C7BD', '#5A6066', '#5A6415',
  '#5A6610', '#5A8D91', '#5A96A8', '#5A9821', '#5ABF4E', '#5AC7F0', '#5B4B66', '#5B626A', '#5B6467', '#5B9821',
  '#5B9922', '#5BC04E', '#5BCEFA', '#5C5C5C', '#5C5CFF', '#5C6063', '#5C6268', '#5C6269', '#5C6567', '#5C6A23',
  '#5C6BC0', '#5C727D', '#5C727F', '#5C9823', '#5C9AAD', '#5CC04E', '#5CEAD6', '#5D18F6', '#5D4037', '#5D423C',
  '#5D6164', '#5D6165', '#5D6167', '#5D6265', '#5D6266', '#5D6268', '#5D6365', '#5DC04E', '#5E35B1', '#5E5E5E',
  '#5E6268', '#5E6269', '#5E6366', '#5E6367', '#5E636F', '#5E6467', '#5E8A28', '#5E97F6', '#5EC04E', '#5EDF70',
  '#5F4D4E', '#5F4E47', '#5F6165', '#5F6364', '#5F6366', '#5F6367', '#5F6369', '#5F6467', '#5F6468', '#5F646D',
  '#5F7AFF', '#5F989E', '#5F9A22', '#5FB2DE', '#5FC04E', '#600F58', '#603C24', '#604338', '#605F66', '#606060',
  '#606265', '#606468', '#606568', '#607D8B', '#608C3D', '#60C14E', '#6119FF', '#613E31', '#614F46', '#615555',
  '#615654', '#616161', '#616266', '#616569', '#61BFE8', '#61C14E', '#61DE9F', '#62392B', '#62453B', '#626168',
  '#626667', '#62666A', '#62A5A8', '#62C14E', '#63351E', '#633D35', '#63453B', '#63516D', '#636262', '#636363',
  '#636866', '#63697F', '#6392A5', '#63ABDE', '#63C14E', '#63C776', '#646464', '#64696C', '#647584', '#649726',
  '#64B5F6', '#64C24F', '#64D0FF', '#64DAC1', '#657582', '#65A21B', '#65C24F', '#66361F', '#663B22', '#666666',
  '#6678D9', '#668424', '#66B7C4', '#66BB6A', '#66C0E8', '#66C24F', '#676C70', '#676F72', '#677584', '#67A6AD',
  '#67C24F', '#680C5F', '#683D31', '#684D42', '#686868', '#6896A5', '#689F38', '#68A4AF', '#68ABE6', '#68C34F',
  '#693928', '#694D42', '#696E72', '#696F75', '#69769C', '#69937D', '#699F1A', '#69A1BA', '#69A246', '#69A5AD',
  '#69A6AE', '#69B6C9', '#69C34F', '#69F0AE', '#6A463E', '#6A493B', '#6A6E70', '#6A9A18', '#6AA5AC', '#6AA5AD',
  '#6AC34F', '#6B4433', '#6B4733', '#6B4B46', '#6B4C42', '#6B4D42', '#6B7E37', '#6BA3AB', '#6BA3AC', '#6BA3AE',
  '#6BA4AE', '#6BA5AF', '#6BB8FE', '#6BC34F', '#6C1507', '#6C4A41', '#6C4B41', '#6C4D42', '#6C4D43', '#6C6D6F',
  '#6C6E70', '#6C9EB4', '#6CA4AB', '#6CA4AE', '#6CC34F', '#6CCBF6', '#6D291A', '#6D2A19', '#6D4238', '#6D4938',
  '#6D4A37', '#6D4B41', '#6D4C3F', '#6D4C40', '#6D4C41', '#6D4C42', '#6D4D42', '#6D544D', '#6D7276', '#6D8038',
  '#6D94A5', '#6DA3AC', '#6DA3AF', '#6DA5B0', '#6DC44F', '#6DCBE0', '#6E4A3A', '#6E4B41', '#6E4D42', '#6E4D44',
  '#6E4F44', '#6E62ED', '#6E823A', '#6E8690', '#6E9921', '#6EA517', '#6EADB7', '#6EC44F', '#6F4838', '#6F4B3B',
  '#6F4B41', '#6F6A67', '#6F6B67', '#6F7178', '#6F9823', '#6F9923', '#6FA3B0', '#6FBFF0', '#6FC44F', '#6FD86F',
  '#6FE8FD', '#703B26', '#70534A', '#70534C', '#706C66', '#707070', '#70853B', '#70853C', '#709823', '#709921',
  '#709923', '#709F19', '#70C44F', '#713604', '#714C40', '#717578', '#717A7C', '#717F35', '#71873B', '#719921',
  '#71C550', '#71DE81', '#723F22', '#727272', '#727F37', '#727F39', '#728034', '#728035', '#728037', '#728137',
  '#728E9C', '#729A24', '#72C550', '#72E38D', '#72E6AC', '#734434', '#734B42', '#7350D3', '#737373', '#737F35',
  '#737F39', '#737F3F', '#738136', '#738613', '#738A97', '#73A0A2', '#73B03E', '#73C550', '#73DC86', '#73DF86',
  '#748138', '#7497A5', '#749B22', '#74ADBA', '#74C550', '#74CCF2', '#751C00', '#753D29', '#754C3F', '#757575',
  '#757B80', '#757E40', '#757F3E', '#757F40', '#759937', '#75A768', '#75A7BC', '#75C650', '#75C6D3', '#7600B3',
  '#76167B', '#765F57', '#7669F7', '#767E3A', '#768040', '#76C650', '#76C8FF', '#76DE88', '#76F8FF', '#76FF8B',
  '#77381F', '#774439', '#777777', '#778183', '#77A3AB', '#77A3AC', '#77A8AF', '#77ABC0', '#77C650', '#77F7FF',
  '#784D30', '#785446', '#785447', '#7855BC', '#7855BD', '#787676', '#787878', '#78909C', '#789E46', '#78A3AC',
  '#78A3AD', '#78C0E8', '#78C650', '#792D85', '#795548', '#7956C0', '#7957BB', '#7958C2', '#797B7E', '#797C00',
  '#798082', '#7986CB', '#799FAE', '#79A5AB', '#79AEC0', '#79C650', '#79DA89', '#79DC8A', '#79DD8A', '#7A166C',
  '#7A1FA6', '#7A442C', '#7A4631', '#7A4832', '#7A4C32', '#7A4E23', '#7A5549', '#7A56BF', '#7A57BD', '#7A5846',
  '#7A7D02', '#7A7D7B', '#7A9C41', '#7AB9FE', '#7AB9FF', '#7AC750', '#7ACDED', '#7ADC8A', '#7ADD8A', '#7ADE8D',
  '#7B1FA2', '#7B5B52', '#7B5E5A', '#7B7B7B', '#7BAAF7', '#7BB1BA', '#7BC750', '#7BD989', '#7C1477', '#7C7C7C',
  '#7C7D7D', '#7CB23F', '#7CB243', '#7CB342', '#7CC750', '#7CDA87', '#7CDB8A', '#7CDB8B', '#7CDB8D', '#7D5133',
  '#7D8A9D', '#7D8E5F', '#7DB240', '#7DB343', '#7DBBE3', '#7DC750', '#7E43A4', '#7E57C2', '#7EAAB3', '#7EC851',
  '#7EC8EE', '#7ED989', '#7F0099', '#7F170F', '#7F441C', '#7F4935', '#7F594B', '#7F7E7E', '#7FABB4', '#7FB240',
  '#7FBA42', '#7FC851', '#7FCE13', '#7FCE1A', '#7FDAFB', '#802828', '#804833', '#806451', '#807978', '#807F7D',
  '#808080', '#808378', '#8092F2', '#80C851', '#80CBC4', '#80D114', '#80DDD2', '#80DEEA', '#8177FA', '#81AEC0',
  '#81AFC1', '#81B6CC', '#81C13E', '#81C851', '#81D4FA', '#81D7FF', '#822322', '#823B1F', '#823E00', '#824624',
  '#824A34', '#824E3A', '#825948', '#825B4E', '#825E1D', '#826156', '#828282', '#82AEC0', '#82B032', '#82B9D1',
  '#82BAD2', '#82BF42', '#82C951', '#82CC2B', '#82E8B6', '#82E8D7', '#835A4A', '#835D4E', '#83622F', '#838383',
  '#838584', '#838587', '#83C951', '#83D3F7', '#84574E', '#845846', '#845A4A', '#845A54', '#845B51', '#845B52',
  '#84765F', '#848484', '#848485', '#848486', '#848582', '#84B0C1', '#84C951', '#84FFFF', '#85574A', '#855B50',
  '#855B51', '#855B52', '#855B53', '#855C52', '#855C54', '#858485', '#858583', '#858585', '#858587', '#858686',
  '#858687', '#85BB41', '#85C951', '#85D59E', '#85E4FF', '#865953', '#865A52', '#865B50', '#865B51', '#865B52',
  '#865B54', '#865C50', '#865C51', '#865C52', '#865E53', '#866054', '#868586', '#868686', '#86B4BB', '#86C82C',
  '#86C951', '#86CDC7', '#871E0C', '#871E0E', '#874D36', '#875334', '#875740', '#875841', '#875845', '#875A51',
  '#875B4E', '#875B4F', '#875B50', '#875B52', '#875B54', '#875C51', '#875D00', '#875D54', '#875E51', '#876022',
  '#87716B', '#878787', '#878789', '#87A194', '#87C244', '#87CA51', '#880E4F', '#885742', '#885B50', '#885B52',
  '#885C51', '#886456', '#886A57', '#888071', '#88847D', '#88857C', '#888A8A', '#88B050', '#88B151', '#88B154',
  '#88BABC', '#88C4D8', '#88CA51', '#891349', '#891E0C', '#891E0D', '#891E0E', '#893F2E', '#894F36', '#8954FF',
  '#895A4E', '#896024', '#896159', '#89837C', '#89847E', '#898484', '#899394', '#89AF50', '#89CA51', '#8A1E0C',
  '#8A1E0D', '#8A1F0F', '#8A2E08', '#8A418C', '#8A460A', '#8A5A54', '#8A5B51', '#8A867E', '#8ABFD1', '#8ACA51',
  '#8B200B', '#8B200D', '#8B5738', '#8BC029', '#8BC02B', '#8BC12D', '#8BC34A', '#8BCB52', '#8BEAA9', '#8C1B0D',
  '#8C1D0B', '#8C6238', '#8C685C', '#8CAFBF', '#8CC2EA', '#8CCB52', '#8D1D0A', '#8D542E', '#8D5E50', '#8D5F55',
  '#8D6256', '#8D6E63', '#8DAFBF', '#8DC02C', '#8DC02D', '#8DCB52', '#8DCC47', '#8E24AA', '#8E2F97', '#8E4D2F',
  '#8E736E', '#8E7F66', '#8E8E8E', '#8E9395', '#8EC9D6', '#8ECB52', '#8F5D9B', '#8F6D61', '#8F7635', '#8F7CF3',
  '#8F9397', '#8FC5D8', '#8FCC52', '#8FD0EB', '#903EB3', '#904625', '#907AFA', '#907BF3', '#909090', '#90909B',
  '#90A4AE', '#90A4AF', '#90CAF9', '#90CC52', '#912221', '#91674D', '#916919', '#917BF1', '#91837F', '#919191',
  '#919F50', '#91BDCE', '#91C354', '#91CC52', '#925849', '#925949', '#929292', '#929394', '#92989B', '#92A51E',
  '#92C9F4', '#92CBEB', '#92CC52', '#931481', '#937672', '#937EF3', '#939393', '#93C7EE', '#93C9EF', '#93CC52',
  '#93D1E0', '#946548', '#948585', '#94A61A', '#94A61D', '#94A71A', '#94ADBC', '#94C6D6', '#94C7EA', '#94CD52',
  '#94D1E0', '#950D19', '#954A06', '#95683D', '#957155', '#9575CD', '#95A61D', '#95ACBC', '#95C7EC', '#95C7F7',
  '#95CBDE', '#95CD52', '#95D3FF', '#95DA93', '#96010C', '#96030D', '#965A45', '#965B44', '#966239', '#966737',
  '#966738', '#969696', '#96A51D', '#96A520', '#96A819', '#96A820', '#96C8EB', '#96C8EC', '#96C8ED', '#96CBE9',
  '#96CD52', '#974F2F', '#97886E', '#979892', '#979899', '#97A53B', '#97A63B', '#97A927', '#97AEC0', '#97B4C2',
  '#97CC37', '#97CD52', '#983BA1', '#987869', '#98999A', '#98A8BE', '#98ADB8', '#98B715', '#98B71E', '#98C0D0',
  '#98CE53', '#99130D', '#992FAF', '#995AA8', '#995F33', '#99674F', '#999898', '#999999', '#999A9D', '#999B9A',
  '#99C23B', '#99CE53', '#99D45B', '#9A6648', '#9A9A99', '#9A9A9A', '#9A9A9B', '#9AA7ED', '#9ACD66', '#9ACE53',
  '#9B2929', '#9B3123', '#9B6253', '#9B674E', '#9B6A57', '#9B7169', '#9B7515', '#9B782C', '#9B8D8B', '#9B9A9B',
  '#9B9B9B', '#9B9B9C', '#9B9B9D', '#9B9C94', '#9BC4D1', '#9BCE53', '#9C2D1B', '#9C3C25', '#9C6C3B', '#9C7866',
  '#9C7A63', '#9C9C9C', '#9CCC65', '#9CCF53', '#9CECAC', '#9CFCEC', '#9D6C5B', '#9D9C9C', '#9D9D9C', '#9D9D9D',
  '#9DCF53', '#9DD4E0', '#9E5737', '#9E673C', '#9E705A', '#9E730A', '#9E740B', '#9E7B65', '#9E7E54', '#9E9E9E',
  '#9E9FA1', '#9EA2A3', '#9EA5A6', '#9ECF53', '#9ED839', '#9EE350', '#9F0CC4', '#9F6841', '#9F7157', '#9F7CDC',
  '#9F9F9F', '#9FA0A2', '#9FA4AA', '#9FB525', '#9FCF53', '#9FD4E2', '#9FE1EA', '#A02422', '#A02524', '#A02A1B',
  '#A057A1', '#A05C3C', '#A05D43', '#A06841', '#A08CCF', '#A099F7', '#A0A0A0', '#A0C787', '#A0C7E8', '#A0CF53',
  '#A12422', '#A12524', '#A15D38', '#A1713E', '#A1887F', '#A1A40A', '#A1C07D', '#A1C23C', '#A1C5CB', '#A1D053',
  '#A1D1DA', '#A1D2D3', '#A1D2D6', '#A1D5E5', '#A1D65C', '#A22911', '#A22918', '#A23DC9', '#A2672B', '#A2703D',
  '#A2764A', '#A281D0', '#A2A409', '#A2D053', '#A2E4FD', '#A30042', '#A32916', '#A33633', '#A363AF', '#A363B0',
  '#A363B1', '#A364B2', '#A3673E', '#A37BCB', '#A37F69', '#A38E7A', '#A3A3A3', '#A3B523', '#A3CDD9', '#A3D053',
  '#A41916', '#A42615', '#A42714', '#A42718', '#A42E1A', '#A463B0', '#A46E40', '#A4725E', '#A473D3', '#A47ECC',
  '#A47FCC', '#A47FCD', '#A4CED5', '#A4D053', '#A5146A', '#A52415', '#A52914', '#A53E11', '#A56C43', '#A58DC6',
  '#A5C7D3', '#A5CEDA', '#A5D0D6', '#A5D0D7', '#A5D154', '#A62616', '#A62714', '#A65F3E', '#A66F38', '#A681CB',
  '#A6B732', '#A6CDD1', '#A6CFD5', '#A6CFD6', '#A6D154', '#A7281D', '#A7571F', '#A75FB7', '#A7C32F', '#A7CED6',
  '#A7D0D6', '#A7D0D7', '#A7D154', '#A7FFEB', '#A80707', '#A81919', '#A82612', '#A833A3', '#A86D44', '#A87254',
  '#A8A8A8', '#A8BAC1', '#A8CE5F', '#A8CFD6', '#A8CFD7', '#A8D0D6', '#A8D154', '#A8E3F0', '#A92813', '#A94230',
  '#A95531', '#A9A299', '#A9A9A9', '#A9D254', '#A9E7FF', '#AAAAAA', '#AAD254', '#AAD876', '#AAE2F9', '#AB2C5E',
  '#AB3F2E', '#AB47BC', '#AB5731', '#AB580F', '#AB5832', '#AB5931', '#AB5932', '#AB664B', '#AB7CF7', '#AB872E',
  '#AB872F', '#ABABAB', '#ABB0B1', '#ABB9BB', '#ABC884', '#ABC9B8', '#ABD254', '#ABD7DB', '#AC101B', '#AC42AC',
  '#AC5810', '#AC5811', '#AC5813', '#AC5832', '#ACA299', '#ACA399', '#ACA39B', '#ACB1B2', '#ACB1B5', '#ACD254',
  '#ACE4FE', '#ACE8FE', '#AD1414', '#AD236B', '#AD3421', '#AD3900', '#AD5834', '#AD5910', '#AD7156', '#ADADAD',
  '#ADADB7', '#ADADB8', '#ADBCC3', '#ADD254', '#ADD4C1', '#AE0D1A', '#AE111F', '#AE3A00', '#AE5614', '#AE5731',
  '#AE5734', '#AE957F', '#AE9580', '#AEAEAE', '#AEAEAF', '#AEB0B0', '#AEB0B1', '#AED0D7', '#AED354', '#AED581',
  '#AEE3FD', '#AEE6FD', '#AF0A1B', '#AF0B4E', '#AF0C1A', '#AF0C1B', '#AF0D03', '#AF0D1A', '#AF0F1B', '#AF0F21',
  '#AF1E1E', '#AF2C1B', '#AF2C96', '#AF5214', '#AF570C', '#AF5711', '#AF5713', '#AF5832', '#AF5912', '#AF6300',
  '#AF7464', '#AFA59E', '#AFAFAE', '#AFAFAF', '#AFB1B0', '#AFB42A', '#AFB8B6', '#AFC5CC', '#AFD354', '#AFD7E9',
  '#AFE2FB', '#AFE3FB', '#AFE3FE', '#AFE3FF', '#AFE6F8', '#B0091B', '#B01522', '#B05100', '#B05353', '#B06542',
  '#B07853', '#B0805C', '#B08467', '#B0B0AF', '#B0B0B0', '#B0B0B1', '#B0B1B0', '#B0B1B2', '#B0B1B3', '#B0B3AF',
  '#B0BEC5', '#B0D354', '#B0E0FF', '#B0E244', '#B0E2FD', '#B0E3FD', '#B0E4FE', '#B0E4FF', '#B0F2F7', '#B10A1B',
  '#B11F2B', '#B18466', '#B1B0B0', '#B1B1B1', '#B1D354', '#B1DE7D', '#B1E3FF', '#B1E4FF', '#B22519', '#B22D2D',
  '#B23220', '#B24938', '#B25B47', '#B26500', '#B26830', '#B27767', '#B27E18', '#B2947C', '#B2B1B2', '#B2B2B2',
  '#B2D455', '#B2DFEC', '#B2E6FE', '#B2EBF2', '#B31B1B', '#B38251', '#B38354', '#B3875D', '#B38A6D', '#B391FF',
  '#B3937C', '#B39DDB', '#B3AFAF', '#B3B3B3', '#B3D0E0', '#B3D455', '#B3E1EE', '#B3E2FB', '#B3E5FC', '#B3E5FF',
  '#B40E1C', '#B41301', '#B42F17', '#B48212', '#B48958', '#B49075', '#B4B5B7', '#B4D218', '#B4D455', '#B4DDFA',
  '#B4DE58', '#B4E1ED', '#B50D22', '#B51616', '#B52213', '#B55E19', '#B574C3', '#B5772C', '#B5885D', '#B5885E',
  '#B59074', '#B59075', '#B5B5B5', '#B5C2C8', '#B5CF17', '#B5CF23', '#B5D024', '#B5D455', '#B60F27', '#B65500',
  '#B68859', '#B6885A', '#B6885B', '#B6895A', '#B68E74', '#B69B5A', '#B6CED5', '#B6D016', '#B6D115', '#B6D401',
  '#B6D555', '#B71C1C', '#B75D18', '#B76D54', '#B7855F', '#B78759', '#B78859', '#B7885A', '#B78958', '#B79277',
  '#B79279', '#B7B721', '#B7B7B7', '#B7CBD3', '#B7CDD2', '#B7D016', '#B7D019', '#B7D118', '#B7D214', '#B7D555',
  '#B7D5E5', '#B7E4EA', '#B85500', '#B85C3E', '#B881CF', '#B88658', '#B8885A', '#B88956', '#B89379', '#B8B8B8',
  '#B8CED4', '#B8CF17', '#B8D555', '#B8DADE', '#B95E19', '#B95F1A', '#B982CA', '#B99277', '#B99680', '#B9A074',
  '#B9BABA', '#B9BBBD', '#B9CE46', '#B9CED2', '#B9CED3', '#B9CED4', '#B9D555', '#B9E4EA', '#BA2626', '#BA5E0D',
  '#BA793E', '#BA8855', '#BA8859', '#BA8D68', '#BA8D69', '#BA8D72', '#BA8F63', '#BA957E', '#BA967D', '#BABABA',
  '#BACDD2', '#BACFD4', '#BAD555', '#BAE2FD', '#BAF3FA', '#BB303D', '#BB5D42', '#BB6117', '#BB8064', '#BB9176',
  '#BBCCD3', '#BBCED3', '#BBCED4', '#BBD046', '#BBD047', '#BBD655', '#BBE68B', '#BC2A16', '#BC6F00', '#BC8346',
  '#BC8954', '#BC9671', '#BCAA93', '#BCAAA4', '#BCAFAA', '#BCBCBC', '#BCCE45', '#BCCED2', '#BCD655', '#BD816A',
  '#BD8955', '#BD90E6', '#BD9177', '#BD9178', '#BD9874', '#BDA890', '#BDB8B1', '#BDBDBD', '#BDBDBF', '#BDCCD1',
  '#BDCCD4', '#BDCD43', '#BDCE44', '#BDCE46', '#BDCF44', '#BDCF46', '#BDCF47', '#BDD655', '#BE0576', '#BE66CC',
  '#BE6716', '#BE9079', '#BEB4AC', '#BEBEBE', '#BECE44', '#BED04A', '#BED655', '#BEDC9D', '#BEE29F', '#BF0477',
  '#BF0578', '#BF077C', '#BF1A1A', '#BF360C', '#BF3636', '#BF4A10', '#BF8049', '#BF8302', '#BF8400', '#BF855E',
  '#BF8904', '#BF9052', '#BF9177', '#BF967C', '#BF9F85', '#BFB3B3', '#BFB5B3', '#BFBFBF', '#BFCCD2', '#BFD756',
  '#BFE094', '#C0711F', '#C0B3AE', '#C0B5B1', '#C0B699', '#C0B8B3', '#C0C0C0', '#C0CA33', '#C0D756', '#C10375',
  '#C14F2D', '#C17E52', '#C18816', '#C1C1C1', '#C1CA32', '#C1D756', '#C2185B', '#C2362B', '#C23B00', '#C26948',
  '#C2B5A8', '#C2C2C2', '#C2D756', '#C2DD1F', '#C2E3F0', '#C2EDF4', '#C30B1B', '#C34C10', '#C36639', '#C38E69',
  '#C3CCC7', '#C3D2D9', '#C3D856', '#C3FECE', '#C41B59', '#C48E6A', '#C49166', '#C4A878', '#C4AA9D', '#C4C451',
  '#C4C6C7', '#C4D856', '#C51162', '#C54C0F', '#C5886F', '#C5B3AF', '#C5CFDD', '#C5D856', '#C62727', '#C62828',
  '#C67100', '#C67260', '#C67500', '#C67C5D', '#C69461', '#C6A99D', '#C6B3A1', '#C6C6C6', '#C6C7C1', '#C6D856',
  '#C6DDCB', '#C6E1A5', '#C6E4F7', '#C71FFF', '#C76831', '#C76933', '#C78C61', '#C7C7C7', '#C7C9C9', '#C7CDD0',
  '#C7D856', '#C87D5E', '#C8A68F', '#C8BEB3', '#C8C7CC', '#C8C8C8', '#C8C9C6', '#C8D956', '#C8DEE9', '#C92B27',
  '#C93737', '#C98A67', '#C9C7C4', '#C9C7CA', '#C9C8C7', '#C9C8C8', '#C9C9C9', '#C9CABB', '#C9D956', '#C9E3E6',
  '#C9EFF2', '#CA1837', '#CA2C31', '#CA750F', '#CA8865', '#CABEFF', '#CACACA', '#CAD8DD', '#CAD956', '#CAF4F9',
  '#CB1C35', '#CB6C22', '#CB8251', '#CBD956', '#CC094F', '#CC0B1E', '#CC1935', '#CC1A36', '#CC26A1', '#CC2929',
  '#CC2D2D', '#CC3332', '#CC3333', '#CC3F27', '#CC4337', '#CC701F', '#CC8552', '#CC8600', '#CCCCCC', '#CCDA57',
  '#CCDEED', '#CCFF90', '#CD0E1E', '#CD0E1F', '#CD1734', '#CD3001', '#CD7955', '#CD844F', '#CD8C56', '#CD935F',
  '#CDAC93', '#CDCBBF', '#CDCBC0', '#CDCDCE', '#CDDA57', '#CDDFEE', '#CE41B3', '#CE701B', '#CE701D', '#CE843A',
  '#CE8963', '#CE93D8', '#CECDD2', '#CECECE', '#CECECF', '#CEDA57', '#CF1636', '#CF1A35', '#CF381A', '#CF6150',
  '#CF6E21', '#CF6F24', '#CF701D', '#CF701E', '#CF7118', '#CF7120', '#CF7756', '#CFB0EA', '#CFC6BD', '#CFCFCF',
  '#CFD8DC', '#CFD9DB', '#CFDA57', '#D05314', '#D05416', '#D05E53', '#D06150', '#D06F1D', '#D0701C', '#D0805F',
  '#D0CFE0', '#D0D0D2', '#D0DB57', '#D0FE8B', '#D1422F', '#D15116', '#D1593F', '#D16250', '#D16E1D', '#D1701C',
  '#D17020', '#D1762C', '#D17757', '#D17759', '#D1775B', '#D17856', '#D17858', '#D18100', '#D19600', '#D19661',
  '#D1D1D1', '#D1DB57', '#D25114', '#D25116', '#D26051', '#D2608C', '#D2711F', '#D2712A', '#D2735B', '#D27854',
  '#D27856', '#D27857', '#D28333', '#D29B64', '#D29F6C', '#D2A590', '#D2A67C', '#D2DB57', '#D2EDF7', '#D3100A',
  '#D32F2F', '#D35113', '#D3578B', '#D36337', '#D36600', '#D3792F', '#D38200', '#D3CAC3', '#D3F1FA', '#D43330',
  '#D44A28', '#D45B89', '#D45E51', '#D46F1E', '#D47858', '#D4785D', '#D4A37D', '#D4CCCD', '#D4D2D6', '#D4D3D4',
  '#D4D4D3', '#D4D4D4', '#D50916', '#D52B2B', '#D55113', '#D55E00', '#D57657', '#D5AA67', '#D5C60E', '#D5CCC2',
  '#D5D5D5', '#D5EBF5', '#D5F100', '#D60D29', '#D61029', '#D62F34', '#D63102', '#D6336B', '#D64C12', '#D67659',
  '#D68B52', '#D68F30', '#D69136', '#D69640', '#D6A57E', '#D6D6D6', '#D6F100', '#D6F1F2', '#D70617', '#D75010',
  '#D7578A', '#D7598B', '#D7CCC5', '#D7CCC6', '#D7CCC7', '#D7CDC7', '#D80D1A', '#D81B60', '#D82E75', '#D83F22',
  '#D84213', '#D84315', '#D84D32', '#D853C9', '#D85A41', '#D85F11', '#D89852', '#D8992B', '#D89A00', '#D8A26D',
  '#D8BDF4', '#D8CCC7', '#D8CDC7', '#D8CDC9', '#D8CEC9', '#D8D0C5', '#D8F3FA', '#D90512', '#D92F0A', '#D93D8E',
  '#D9411C', '#D97755', '#D97A08', '#D9AC77', '#D9AC82', '#D9BAA5', '#D9C6B6', '#D9CBC7', '#D9CDC9', '#D9D1C6',
  '#D9D9D9', '#D9E3DF', '#D9EBF3', '#D9EFF2', '#D9F2D1', '#DA0A23', '#DA0A26', '#DA0E21', '#DA0E28', '#DA2E75',
  '#DA342E', '#DA4C00', '#DA4D32', '#DA6727', '#DA8119', '#DA8346', '#DABCF3', '#DACEC9', '#DAD0C5', '#DADADA',
  '#DAEBF5', '#DB0000', '#DB0A27', '#DB0A28', '#DB0D25', '#DB0D27', '#DB0D28', '#DB0D2A', '#DB0D2B', '#DB132C',
  '#DB3427', '#DB5200', '#DB7C60', '#DBA010', '#DBA689', '#DBCDC7', '#DBD6CC', '#DBDAD8', '#DBDBDB', '#DBDFE1',
  '#DBECF7', '#DBEDF6', '#DBEFF5', '#DC0D25', '#DC0D27', '#DC0D28', '#DC0D2A', '#DC4E20', '#DC5819', '#DC7540',
  '#DC7E13', '#DC8124', '#DCA282', '#DCBCF6', '#DCD2C7', '#DCDCDC', '#DCE775', '#DCECF6', '#DCEDF5', '#DCEDF6',
  '#DD0B2B', '#DD0C22', '#DD0C26', '#DD0C28', '#DD0C29', '#DD0F26', '#DD2C00', '#DD5FD1', '#DD733F', '#DD7341',
  '#DD7342', '#DD801B', '#DD821D', '#DD8A3E', '#DDA281', '#DDA290', '#DDB98C', '#DDBCA8', '#DDDDDD', '#DDE2E1',
  '#DDECF5', '#DDECF6', '#DE2B01', '#DE3E31', '#DE4E00', '#DE7321', '#DE7340', '#DE7541', '#DE7F14', '#DE8010',
  '#DEA076', '#DEA66C', '#DEBCA8', '#DEDEDE', '#DEDFE2', '#DF0A2B', '#DF0B26', '#DF0E28', '#DF0E2B', '#DF1324',
  '#DF7C1A', '#DF7D15', '#DF7F14', '#DF8013', '#DF8116', '#DF86AC', '#DF9047', '#DFBBAA', '#DFBCA6', '#DFD7C5',
  '#DFDFDF', '#DFDFE0', '#DFE0E0', '#DFE1E0', '#DFECF5', '#DFEEF1', '#DFEEF5', '#E03232', '#E04537', '#E04E2C',
  '#E06767', '#E07D15', '#E07E17', '#E07F14', '#E07F16', '#E08013', '#E08016', '#E08F00', '#E09147', '#E09A84',
  '#E0A614', '#E0BB95', '#E0C290', '#E0C3AB', '#E0DFDE', '#E0DFE2', '#E0E080', '#E0E0DF', '#E0E0E0', '#E0E1E0',
  '#E0EBF6', '#E0ECF3', '#E0F2F1', '#E0F7FA', '#E0FEAC', '#E14536', '#E17A2C', '#E17F13', '#E17F16', '#E1D9DC',
  '#E1E0DF', '#E1E0E0', '#E1E1E1', '#E1E2E1', '#E1E7EA', '#E1F5FE', '#E1F7FE', '#E2122D', '#E24444', '#E26056',
  '#E27406', '#E27F13', '#E2A610', '#E2A613', '#E2B013', '#E2C090', '#E2C5B0', '#E2DDD7', '#E2DEFA', '#E2E0E4',
  '#E2E2E2', '#E2E2E4', '#E2EBEE', '#E34B44', '#E37D14', '#E380A1', '#E38130', '#E38211', '#E38413', '#E39503',
  '#E3970A', '#E39744', '#E3C08C', '#E3C08F', '#E3D9A8', '#E3DDA6', '#E3DE9E', '#E3DEA1', '#E3E0AA', '#E3E1DF',
  '#E3E3DF', '#E3E3E1', '#E3E3E2', '#E3E4DE', '#E3E5E5', '#E3EBEE', '#E3EDFC', '#E3F2FD', '#E3FFAD', '#E45D1A',
  '#E47702', '#E47D17', '#E48216', '#E49725', '#E4BBAB', '#E4BF8C', '#E4BF8F', '#E4C5B0', '#E4C5B1', '#E4DC9F',
  '#E4DCD5', '#E4DDA2', '#E4E0E8', '#E4EAEE', '#E4EBEE', '#E4F57D', '#E51E25', '#E5322E', '#E53935', '#E57373',
  '#E57702', '#E5912C', '#E59502', '#E59600', '#E59700', '#E59802', '#E59F1D', '#E5A87F', '#E5B27F', '#E5DD9F',
  '#E5DDA0', '#E5DDD2', '#E5E5E5', '#E62B6B', '#E63934', '#E63D00', '#E63F33', '#E64A19', '#E6508F', '#E65100',
  '#E658A4', '#E68C87', '#E69267', '#E69601', '#E69B03', '#E6A467', '#E6A475', '#E6DC9F', '#E6E6E6', '#E74B8C',
  '#E7523C', '#E78B20', '#E7AC84', '#E7BA75', '#E7E7E7', '#E7FCAE', '#E84B8B', '#E85858', '#E8623F', '#E89802',
  '#E89806', '#E89B9B', '#E89D05', '#E8A631', '#E8AD00', '#E8D4AF', '#E8DD9E', '#E8DE9F', '#E8F5E9', '#E8F6FF',
  '#E92A02', '#E92C02', '#E94539', '#E9462D', '#E94B8B', '#E94B8C', '#E9BB91', '#E9DCA7', '#E9E7D7', '#E9FCAE',
  '#EA4133', '#EA4333', '#EA4889', '#EA4B8D', '#EA4E9C', '#EA6363', '#EA7032', '#EA7554', '#EA80FC', '#EA8D04',
  '#EA8D37', '#EA9843', '#EAAB57', '#EAAD32', '#EAB554', '#EAB56E', '#EABE9F', '#EAC084', '#EAC183', '#EAEAEA',
  '#EAEBEB', '#EB2901', '#EB4E9D', '#EB81AA', '#EB892E', '#EB8B34', '#EB8F00', '#EB961B', '#EBA961', '#EBC990',
  '#EBE7E6', '#EBF8FF', '#EC3E24', '#EC3F23', '#EC407A', '#EC5F32', '#EC6B31', '#EC6E24', '#EC7FAC', '#EC7FAE',
  '#EC80AF', '#EC8717', '#EC8816', '#EC8B7A', '#EC9C2A', '#ECB354', '#ECEFF1', '#ECF0F2', '#ED3D23', '#ED4132',
  '#ED4889', '#ED520A', '#ED603A', '#ED6A65', '#ED6B2F', '#ED6B31', '#ED6C30', '#ED6C31', '#ED6C66', '#ED6D23',
  '#ED6D30', '#ED706E', '#ED7770', '#ED9004', '#EDA052', '#EDA600', '#EDBD82', '#EDBF00', '#EDC391', '#EDE0D6',
  '#EDE7F6', '#EE3E23', '#EE534E', '#EE5948', '#EE594A', '#EE5A46', '#EE5B4A', '#EE6D33', '#EE6F5D', '#EE7FAC',
  '#EE7FAD', '#EE8CFF', '#EEA25D', '#EEBA4B', '#EEBD1C', '#EEBF72', '#EEEEEE', '#EEF9FF', '#EF3E24', '#EF4D8F',
  '#EF5090', '#EF5350', '#EF54D2', '#EF5592', '#EF5593', '#EF5B44', '#EF6C00', '#EF6C32', '#EF7EAD', '#EF7F9D',
  '#EF7FAD', '#EF8720', '#EF87B2', '#EF8848', '#EF9E01', '#EFB682', '#EFC2A2', '#EFE4AF', '#EFEBE9', '#EFEBEA',
  '#EFEEEC', '#EFEFEF', '#F00', '#F04E3E', '#F05455', '#F05A94', '#F06292', '#F06E00', '#F07371', '#F081AF',
  '#F08846', '#F08A34', '#F09300', '#F09D02', '#F09E00', '#F09F04', '#F0A007', '#F0A25B', '#F0A358', '#F0AA6B',
  '#F0E7BA', '#F0F4C3', '#F0F4F5', '#F15A24', '#F17900', '#F17FAE', '#F182A7', '#F1901B', '#F19102', '#F19534',
  '#F19F40', '#F1A002', '#F1A058', '#F1A106', '#F1B34F', '#F1C688', '#F1EBEE', '#F1EDEC', '#F1EDED', '#F1F2F2',
  '#F1F6F7', '#F2478D', '#F26A35', '#F26D31', '#F27B00', '#F27CB6', '#F29657', '#F2A05B', '#F2A159', '#F2A258',
  '#F2A259', '#F2A25B', '#F2A35B', '#F2A600', '#F2A65D', '#F2A764', '#F2AA7B', '#F2AB47', '#F2B87E', '#F2BC1A',
  '#F2BD72', '#F2C548', '#F2EDEC', '#F2EDED', '#F2EEEA', '#F2EEEC', '#F2EEED', '#F2F0EE', '#F2F2F2', '#F2F3F5',
  '#F3790E', '#F37EAA', '#F386AB', '#F387AB', '#F3911C', '#F3A25A', '#F3A25C', '#F3AB47', '#F3AE07', '#F3AE38',
  '#F3C975', '#F3C976', '#F3E5F5', '#F3F1F6', '#F44236', '#F44336', '#F4482B', '#F4511E', '#F45125', '#F47100',
  '#F47A00', '#F47BA8', '#F47DAA', '#F47DAD', '#F47FAC', '#F4821E', '#F48FB1', '#F4A223', '#F4A55D', '#F4AE3B',
  '#F4B043', '#F4B13A', '#F4B400', '#F4B54C', '#F4D097', '#F4DAAD', '#F4EEED', '#F4F0EF', '#F4FCFF', '#F54536',
  '#F57C00', '#F5A055', '#F5A813', '#F5A9B8', '#F5AD02', '#F5AD71', '#F5B03A', '#F5B03C', '#F5B03E', '#F5B03F',
  '#F5B23F', '#F5BF0A', '#F5C876', '#F5C977', '#F5E1D1', '#F5E5C7', '#F5ECEB', '#F5F3E7', '#F5F5F5', '#F5F8FA',
  '#F63BBE', '#F687A9', '#F6922C', '#F69C9C', '#F6AF3B', '#F6AF3D', '#F6AF41', '#F6B03E', '#F6B140', '#F6B99D',
  '#F6BA84', '#F6BC41', '#F6BF26', '#F6C519', '#F6C973', '#F6C977', '#F6CB89', '#F6F6F6', '#F6F6F7', '#F6FFFE',
  '#F71538', '#F7153A', '#F72E26', '#F772DB', '#F77300', '#F77E00', '#F77EAE', '#F78A51', '#F78C1F', '#F79226',
  '#F79228', '#F7922A', '#F7932A', '#F79429', '#F7A54B', '#F7B03A', '#F7B03C', '#F7B95E', '#F7BB86', '#F7BD5C',
  '#F7BF5E', '#F7C272', '#F7C515', '#F7C875', '#F7C876', '#F7CA76', '#F7CC93', '#F7CF92', '#F7D74D', '#F7DF92',
  '#F7F6F5', '#F83C30', '#F84AB2', '#F86E49', '#F8910A', '#F8932A', '#F8A128', '#F8AB16', '#F8AB19', '#F8AB59',
  '#F8AD1E', '#F8AF3C', '#F8C778', '#F8C972', '#F8C976', '#F8C977', '#F8D4B5', '#F8DBAF', '#F8E2D5', '#F8EAC0',
  '#F8F8F7', '#F8F9FC', '#F8FFFD', '#F92610', '#F92612', '#F964E5', '#F97D23', '#F99628', '#F9A156', '#F9A825',
  '#F9B03C', '#F9C248', '#F9C319', '#F9C86F', '#F9CA76', '#F9CB8F', '#F9D2E1', '#F9D4B2', '#F9D6BB', '#F9D81E',
  '#F9DDBD', '#F9DF96', '#F9DF9B', '#F9DF9D', '#F9DFAF', '#F9DFB1', '#F9E0CA', '#F9F9FC', '#F9FBFA', '#F9FFFF',
  '#FA1C1F', '#FA2B23', '#FA6C43', '#FA821B', '#FA8960', '#FA9100', '#FA912C', '#FAA700', '#FAB037', '#FAB16E',
  '#FAC010', '#FAC018', '#FAC96D', '#FACE90', '#FAD56E', '#FAD674', '#FAD91A', '#FADA80', '#FADBBC', '#FADCB2',
  '#FADDC3', '#FADE62', '#FADFB1', '#FAE9AE', '#FAEAC7', '#FAEACB', '#FAFAFA', '#FAFFFF', '#FB1B1D', '#FB2B22',
  '#FB3028', '#FB6113', '#FB8B02', '#FB8C00', '#FB8D00', '#FBB67D', '#FBB75A', '#FBBB02', '#FBBC01', '#FBC02D',
  '#FBC11A', '#FBC219', '#FBC21F', '#FBCB89', '#FBD3B3', '#FBD5B2', '#FBDAA6', '#FBDE93', '#FBDF96', '#FBE0AF',
  '#FBE0BC', '#FBE36A', '#FBE9E7', '#FBEBCC', '#FBF0B4', '#FBF9F9', '#FBF9FB', '#FBFFFE', '#FBFFFF', '#FC2929',
  '#FC2B26', '#FC5027', '#FC6B48', '#FC6B4A', '#FC7143', '#FC7444', '#FC7544', '#FC7C47', '#FC873D', '#FC8F02',
  '#FC8F0B', '#FC9301', '#FCA2C8', '#FCA4A7', '#FCA72E', '#FCB316', '#FCB602', '#FCB745', '#FCB757', '#FCB900',
  '#FCB90A', '#FCB95A', '#FCBA03', '#FCC01E', '#FCC11A', '#FCC12B', '#FCC219', '#FCC21B', '#FCC318', '#FCC417',
  '#FCC4BF', '#FCC9D2', '#FCCB7E', '#FCCD87', '#FCD41E', '#FCD4B0', '#FCD817', '#FCD81E', '#FCD96B', '#FCDE8C',
  '#FCDE96', '#FCDE97', '#FCE193', '#FCE438', '#FCE4EC', '#FCE5AC', '#FCE8B2', '#FCE9C5', '#FCE9CA', '#FCEACC',
  '#FCEBCD', '#FCECC8', '#FCF9E9', '#FCFDFA', '#FCFDFD', '#FCFDFE', '#FD1B0D', '#FD3B3B', '#FD5E5B', '#FD6660',
  '#FD6A1F', '#FD6A21', '#FD6F42', '#FD703F', '#FD774D', '#FD7BA6', '#FD7C88', '#FD7D84', '#FD7E84', '#FD7E89',
  '#FD8695', '#FD894A', '#FD8C03', '#FD8E02', '#FD8F01', '#FDA152', '#FDA3C9', '#FDA431', '#FDA4A5', '#FDA4C6',
  '#FDA726', '#FDA72C', '#FDB20D', '#FDB3D1', '#FDB700', '#FDB900', '#FDBA02', '#FDBBA0', '#FDC11E', '#FDC318',
  '#FDC397', '#FDCB27', '#FDCB61', '#FDCBBA', '#FDCE8C', '#FDD083', '#FDD0B1', '#FDD3B1', '#FDD717', '#FDD835',
  '#FDDD9C', '#FDE064', '#FDE1CC', '#FDE7C4', '#FDEAC8', '#FDEACB', '#FDEBC8', '#FDEDC5', '#FDEDCC', '#FDEFAA',
  '#FDF0F7', '#FDFDFD', '#FDFEFA', '#FDFEFE', '#FDFFFC', '#FDFFFE', '#FDFFFF', '#FE05A2', '#FE180A', '#FE1D1E',
  '#FE2A19', '#FE2A22', '#FE2A28', '#FE2C23', '#FE4E27', '#FE4F20', '#FE5314', '#FE5E12', '#FE5F12', '#FE5F5F',
  '#FE6011', '#FE6014', '#FE6111', '#FE6117', '#FE6261', '#FE6364', '#FE6656', '#FE6A1F', '#FE7043', '#FE7A47',
  '#FE7C84', '#FE82A5', '#FE8D00', '#FE8D06', '#FE8E06', '#FE8E6E', '#FE8F01', '#FE9004', '#FE9700', '#FE9C51',
  '#FEA32E', '#FEA4C7', '#FEA62D', '#FEA6A4', '#FEA7A5', '#FEA826', '#FEA8A6', '#FEA8A7', '#FEA8A8', '#FEA9A6',
  '#FEACA9', '#FEACAB', '#FEAF5F', '#FEB359', '#FEB502', '#FEB800', '#FEB804', '#FEB896', '#FEB903', '#FEBA02',
  '#FEBB00', '#FEBDBE', '#FEBF21', '#FEC000', '#FEC417', '#FEC516', '#FEC56C', '#FEC925', '#FECA18', '#FECA7F',
  '#FECC88', '#FECE60', '#FED0AB', '#FED0B0', '#FED0BE', '#FED287', '#FED386', '#FED3B0', '#FED3B4', '#FED519',
  '#FED5B6', '#FEDC61', '#FEDE6A', '#FEDF64', '#FEE066', '#FEE165', '#FEE262', '#FEE269', '#FEE2B2', '#FEE2B3',
  '#FEE465', '#FEE4B4', '#FEE56B', '#FEE5AD', '#FEE5C1', '#FEE5C3', '#FEE942', '#FEE9C6', '#FEE9C9', '#FEEAC4',
  '#FEEAC7', '#FEEAC8', '#FEEAD0', '#FEEBCC', '#FEECCB', '#FEEED1', '#FEF3C0', '#FEF499', '#FEF58A', '#FEF6E0',
  '#FEF7B0', '#FEF7B2', '#FEF9E5', '#FEFCFE', '#FEFEF6', '#FEFEFD', '#FEFEFE', '#FEFEFF', '#FEFFFA', '#FEFFFD',
  '#FEFFFE', '#FEFFFF', '#FF0000', '#FF0044', '#FF00A2', '#FF0303', '#FF17C8', '#FF180A', '#FF2219', '#FF222D',
  '#FF2422', '#FF2622', '#FF262E', '#FF281D', '#FF2820', '#FF2825', '#FF2A23', '#FF2B23', '#FF2B25', '#FF2B26',
  '#FF2D26', '#FF2D8A', '#FF3D00', '#FF4081', '#FF4545', '#FF4638', '#FF4C1C', '#FF4C2A', '#FF4E23', '#FF4F1C',
  '#FF4F28', '#FF510F', '#FF5117', '#FF5119', '#FF511B', '#FF521A', '#FF5252', '#FF5319', '#FF5450', '#FF5722',
  '#FF5960', '#FF5B5E', '#FF5D10', '#FF5D15', '#FF5E00', '#FF5E59', '#FF5F00', '#FF5F02', '#FF5F5C', '#FF5F5D',
  '#FF5F5E', '#FF5F5F', '#FF600D', '#FF6011', '#FF6050', '#FF605E', '#FF605F', '#FF6063', '#FF6110', '#FF6157',
  '#FF615E', '#FF61A9', '#FF623E', '#FF631A', '#FF635F', '#FF6362', '#FF6666', '#FF6A65', '#FF6B17', '#FF6B19',
  '#FF6B5D', '#FF6C75', '#FF6E45', '#FF6F00', '#FF7043', '#FF706A', '#FF732D', '#FF7512', '#FF7537', '#FF7555',
  '#FF7759', '#FF77AD', '#FF7879', '#FF7942', '#FF7B78', '#FF7D86', '#FF7E45', '#FF7FAD', '#FF80AB', '#FF8155',
  '#FF82A7', '#FF82B2', '#FF8383', '#FF844B', '#FF847A', '#FF8480', '#FF8984', '#FF8A65', '#FF8A66', '#FF8A80',
  '#FF8B00', '#FF8B03', '#FF8B0D', '#FF8C00', '#FF8C02', '#FF8C71', '#FF8D02', '#FF8E00', '#FF8E01', '#FF8E05',
  '#FF8E06', '#FF8E5C', '#FF8F00', '#FF8F04', '#FF8F50', '#FF8F8C', '#FF8FC7', '#FF9003', '#FF9009', '#FF9100',
  '#FF9270', '#FF9411', '#FF94BD', '#FF9502', '#FF9613', '#FF9797', '#FF97AB', '#FF97F5', '#FF9800', '#FF9966',
  '#FF99B7', '#FF9A4F', '#FF9B17', '#FF9B31', '#FF9C9C', '#FF9D83', '#FF9F12', '#FF9F9F', '#FFA000', '#FFA364',
  '#FFA42D', '#FFA500', '#FFA5A8', '#FFA5AA', '#FFA624', '#FFA627', '#FFA62B', '#FFA62D', '#FFA6A3', '#FFA70B',
  '#FFA722', '#FFA724', '#FFA726', '#FFA72B', '#FFA7A6', '#FFA7AA', '#FFA821', '#FFA826', '#FFA828', '#FFA8A4',
  '#FFA8A7', '#FFA8A8', '#FFA996', '#FFA9AB', '#FFAA00', '#FFAB00', '#FFAB91', '#FFAB93', '#FFADA6', '#FFAF29',
  '#FFAF76', '#FFB0B1', '#FFB0DA', '#FFB17A', '#FFB1D1', '#FFB300', '#FFB305', '#FFB3B3', '#FFB502', '#FFB600',
  '#FFB65A', '#FFB685', '#FFB6C1', '#FFB6D7', '#FFB700', '#FFB70C', '#FFB74D', '#FFB775', '#FFB800', '#FFB803',
  '#FFB901', '#FFB903', '#FFB91F', '#FFBA02', '#FFBA06', '#FFBA5F', '#FFBB23', '#FFBC6C', '#FFBCD8', '#FFBD13',
  '#FFBD16', '#FFBD52', '#FFBD66', '#FFBE01', '#FFBE1F', '#FFBF18', '#FFBF1B', '#FFBFA5', '#FFC01E', '#FFC020',
  '#FFC022', '#FFC06C', '#FFC0A6', '#FFC107', '#FFC119', '#FFC300', '#FFC402', '#FFC516', '#FFC55C', '#FFC697',
  '#FFC6B2', '#FFC86E', '#FFC927', '#FFCA26', '#FFCA28', '#FFCA29', '#FFCABE', '#FFCB05', '#FFCB29', '#FFCB38',
  '#FFCB80', '#FFCB86', '#FFCB88', '#FFCBAC', '#FFCC00', '#FFCC32', '#FFCC80', '#FFCC8A', '#FFCCBC', '#FFCCC1',
  '#FFCCE1', '#FFCD40', '#FFCD88', '#FFCE27', '#FFCF62', '#FFCF86', '#FFCF8C', '#FFD1B3', '#FFD1B7', '#FFD1D1',
  '#FFD285', '#FFD288', '#FFD290', '#FFD29C', '#FFD2AD', '#FFD2AF', '#FFD2B1', '#FFD2B2', '#FFD324', '#FFD360',
  '#FFD3AF', '#FFD3B0', '#FFD3B2', '#FFD420', '#FFD429', '#FFD4AC', '#FFD51D', '#FFD54F', '#FFD58A', '#FFD5CA',
  '#FFD600', '#FFD61C', '#FFD629', '#FFD717', '#FFD766', '#FFD792', '#FFD816', '#FFD899', '#FFD8A1', '#FFDB8B',
  '#FFDC1E', '#FFDCE8', '#FFDD74', '#FFE000', '#FFE02E', '#FFE066', '#FFE068', '#FFE082', '#FFE0B1', '#FFE0B2',
  '#FFE13B', '#FFE265', '#FFE267', '#FFE268', '#FFE269', '#FFE361', '#FFE365', '#FFE36A', '#FFE36C', '#FFE3C7',
  '#FFE4B4', '#FFE558', '#FFE567', '#FFE57F', '#FFE5B2', '#FFE779', '#FFE869', '#FFE8AE', '#FFE959', '#FFE9C8',
  '#FFEA00', '#FFEA5C', '#FFEAC3', '#FFEAC6', '#FFEAC8', '#FFEAC9', '#FFEACA', '#FFEACF', '#FFEAD9', '#FFEB3B',
  '#FFEBB1', '#FFEBC1', '#FFEBC8', '#FFEBC9', '#FFEBCA', '#FFEBCC', '#FFEBEE', '#FFECB3', '#FFED5A', '#FFEDA8',
  '#FFEDC4', '#FFEE58', '#FFEFA1', '#FFEFAB', '#FFF0AD', '#FFF11B', '#FFF170', '#FFF176', '#FFF1B0', '#FFF1C2',
  '#FFF3DD', '#FFF3E0', '#FFF3E1', '#FFF59D', '#FFF5EB', '#FFF685', '#FFF69D', '#FFF6A0', '#FFF6AD', '#FFF6B2',
  '#FFF6E2', '#FFF7B3', '#FFF7C3', '#FFF7EB', '#FFF891', '#FFF8E1', '#FFF9AF', '#FFF9C4', '#FFFCFD', '#FFFCFF',
  '#FFFDE7', '#FFFDFA', '#FFFDFD', '#FFFDFE', '#FFFEFD', '#FFFEFE', '#FFFEFF', '#FFFF00', '#FFFF8D', '#FFFFFC',
  '#FFFFFD', '#FFFFFE', '#FFFFFF'
];

// flattened from alibs/w3color.js dicolor (21 hue groups, 1936 entries -> 1697 unique hex; first name wins on duplicates, hex uppercased)
const dicolorFlatNames = {
  '#000000': 'black',
  '#000066': 'navy',
  '#000075': 'deep_blue',
  '#000080': 'bright_navy',
  '#00008B': 'darkblue',
  '#000099': 'dark_blue',
  '#00009C': 'duke_blue',
  '#0000CC': 'medium_blue',
  '#0000CD': 'mediumblue',
  '#0000FF': 'primary_blue',
  '#000F89': 'phthalo_blue',
  '#001440': 'cetacean_blue',
  '#00147E': 'dark_imperial_blue',
  '#0014A8': 'zaffre',
  '#0018A8': 'blue_pantone',
  '#002147': 'oxford_blue',
  '#002366': 'royal_blue_dark',
  '#002387': 'resolution_blue',
  '#002395': 'imperial_blue',
  '#002E63': 'cool_black',
  '#00308F': 'air_force_blue_usaf',
  '#003153': 'greenblue',
  '#003171': 'prussian_blue_color_konjo_iro',
  '#003300': 'dark_green',
  '#003366': 'dark_midnight_blue',
  '#003399': 'dark_powder_blue',
  '#0033AA': 'ua_blue',
  '#0033CC': 'bright_blue',
  '#0038A7': 'philippine_blue',
  '#0038A8': 'royal_azure',
  '#003A6C': 'ateneo_blue',
  '#003B6F': 'tardis_blue',
  '#004040': 'rich_black',
  '#0040BE': 'panasonic_blue',
  '#00416A': 'dark_imperial_blue_green',
  '#004225': 'british_racing_green',
  '#004242': 'warm_black',
  '#004346': 'dark_cyan',
  '#00468C': 'midnight_blue2',
  '#0047AB': 'blue',
  '#0048BA': 'absolute_zero',
  '#004953': 'midnight_green',
  '#004B49': 'deep_jungle_green',
  '#004F98': 'usafa_blue',
  '#00563F': 'castleton_green',
  '#005F73': 'deep_cyan',
  '#006400': 'dark_green_x11',
  '#006442': 'green_bamboo',
  '#006600': 'pakistan_green',
  '#006666': 'medium_teal',
  '#006699': 'sea_bluegreen',
  '#0066CC': 'dodger_blue',
  '#0066FF': 'brilliant_blue',
  '#0067A5': 'medium_persian_blue',
  '#006994': 'sea_blue',
  '#006A4E': 'bangladesh_green',
  '#006B3C': 'cadmium_green',
  '#006C7F': 'new_bridge',
  '#006DB0': 'honolulu_blue',
  '#00703C': 'dartmouth_green',
  '#0070B8': 'spanish_blue',
  '#0070FF': 'brandeis_blue',
  '#0072B1': 'linkedin_blue',
  '#0072BB': 'french_blue',
  '#0073CF': 'true_blue1',
  '#007474': 'skobeloff',
  '#00755E': 'tropical_rain_forest',
  '#0077BE': 'ocean_boat_blue',
  '#0078D7': 'microsoft_edge_blue',
  '#007AA5': 'cg_blue',
  '#007BA7': 'celadon_blue',
  '#007BB8': 'star_command_blue',
  '#007F5C': 'spanish_viridian',
  '#007F66': 'generic_viridian',
  '#007FFF': 'azure',
  '#008000': 'ao_english',
  '#008001': 'green',
  '#008080': 'teal',
  '#00827F': 'teal_green',
  '#008543': 'philippine_green',
  '#0087BD': 'blue_ncs',
  '#0088DC': 'blue_cola',
  '#008B8B': 'darkcyan',
  '#009000': 'islamic_green',
  '#009150': 'spanish_green',
  '#0093AF': 'blue_munsell',
  '#0095B6': 'bondi_blue',
  '#009698': 'viridian_green',
  '#009900': 'strong_green',
  '#009933': 'jungle_green',
  '#009966': 'green_cyan',
  '#009999': 'strong_cyan',
  '#0099CC': 'deep_sky_blue',
  '#0099FF': 'spring_sky',
  '#009B77': 'seaglass',
  '#009B7D': 'paolo_veronese_green',
  '#009E60': 'shamrock_green',
  '#009F6B': 'green_ncs',
  '#00A2ED': 'microsoft_blue',
  '#00A550': 'green_pigment',
  '#00A693': 'persian_green',
  '#00A86B': 'jade',
  '#00A870': 'sesame_street_green',
  '#00A877': 'green_munsell',
  '#00AAEE': 'vivid_cerulean',
  '#00AB66': 'go_green',
  '#00AD43': 'green_pantone',
  '#00B7EB': 'cyan_process',
  '#00B8A9': 'vivid_teal',
  '#00B9FB': 'blue_bolt',
  '#00BBF9': 'bright_sky_blue',
  '#00BFFF': 'capri',
  '#00C3E3': 'hawaii_blue',
  '#00C5CD': 'turquoise_surf',
  '#00CC00': 'dark_lime',
  '#00CC33': 'vivid_malachite',
  '#00CC66': 'medium_spring_green',
  '#00CC99': 'caribbean_green',
  '#00CCCC': 'robin_egg_blue',
  '#00CCFF': 'vivid_sky_blue',
  '#00CED1': 'darkturquoise',
  '#00DEA4': 'asda_green_1985',
  '#00F5D4': 'bright_aqua',
  '#00FA9A': 'mediumspringgreen',
  '#00FF00': 'electric_green',
  '#00FF7F': 'guppie_green',
  '#00FF99': 'spring_green',
  '#00FFCC': 'aquagreen',
  '#00FFCD': 'sea_green_crayola',
  '#00FFEF': 'turquoise_blue',
  '#00FFFF': 'aqua',
  '#010203': 'rich_black_fog2',
  '#010B13': 'rich_black_fog',
  '#013220': 'emerald',
  '#014421': 'forest_green_traditional',
  '#01796F': 'pine_green',
  '#02075D': 'dark_navy',
  '#0247FE': 'blue_ryb',
  '#035096': 'medium_electric_blue',
  '#03C03C': 'dark_pastel_green',
  '#043927': 'sacramento_state_green',
  '#044F67': 'light_blue_silk',
  '#046307': 'emerald_green',
  '#056608': 'deep_green',
  '#059033': 'north_texas_green',
  '#062A78': 'catalina_blue',
  '#064E40': 'bluegreen',
  '#06D6A0': 'vibrant_green',
  '#073B4C': 'dark_teal',
  '#08415C': 'dark_cyan_blue',
  '#08457E': 'dark_cerulean',
  '#0892D0': 'rich_electric_blue',
  '#08E8DE': 'bright_turquoise',
  '#091F92': 'indigo_dye',
  '#0A1195': 'cadmium_blue',
  '#0A7E8C': 'metallic_seaweed',
  '#0ABAB5': 'tiffany_blue',
  '#0B132B': 'blue_black',
  '#0BDA51': 'malachite',
  '#0CBFE9': 'blue_raspberry',
  '#0D98BA': 'blue_green',
  '#0E7A0D': 'xbox_green',
  '#0E7C61': 'deep_green_cyan',
  '#0E9CA5': 'boy_red',
  '#0F4D92': 'yale_blue',
  '#0F52BA': 'sapphire',
  '#0FC0FC': 'spiro_disco_ball',
  '#10002B': 'midnight_purple',
  '#100C08': 'smoky_black',
  '#101820': 'eerie_black',
  '#1034A6': 'egyptian_blue',
  '#1164B4': 'green_blue',
  '#118AB2': 'vibrant_blue',
  '#12279E': 'samsung_blue',
  '#123524': 'phthalo_green',
  '#126180': 'blue_sapphire',
  '#136207': 'royal_green',
  '#138808': 'india_green',
  '#1560BD': 'denim',
  '#15F2FD': 'lotion_blue',
  '#15F4EE': 'fluorescent_blue',
  '#171412': 'black_kokushoku',
  '#17182B': 'elderberry',
  '#177245': 'dark_spring_green',
  '#181B26': 'coarse_wool',
  '#18453B': 'msu_green',
  '#18880D': 'verse_green',
  '#188BC2': 'cyan_cornflower_blue',
  '#191970': 'midnightblue',
  '#191F45': 'navy_blue_bellflower',
  '#192236': 'dark_blue_kon',
  '#195905': 'lincoln_green',
  '#1974D2': 'bright_navy_blue',
  '#1A1110': 'licorice',
  '#1A1423': 'raisin_black',
  '#1A2421': 'dark_jungle_green',
  '#1AA260': 'google_chrome_green',
  '#1AC1DD': 'caribbean_blue',
  '#1B03A3': 'neon_blue',
  '#1B1811': 'black_chocolate',
  '#1B263B': 'prussian_blue',
  '#1B294B': 'dark_blue_lapis_lazuli',
  '#1B4D3E': 'brunswick_green',
  '#1C1CF0': 'bluebonnet',
  '#1C2841': 'yankees_blue',
  '#1C352D': 'medium_jungle_green',
  '#1C39BB': 'persian_blue',
  '#1CA9C9': 'pacific_blue',
  '#1CAC78': 'green_crayola',
  '#1D2951': 'space_cadet',
  '#1D697C': 'light_blue_flower',
  '#1DACD6': 'battery_charged_blue',
  '#1E4D2B': 'pomona_green',
  '#1E90FF': 'dodgerblue',
  '#1F262A': 'dark_gunmetal',
  '#1F4788': 'lapis_lazuli_japan',
  '#1F75FE': 'blue_crayola',
  '#1F8EED': 'weebly_blue',
  '#203838': 'goryeo_storeroom',
  '#20B2AA': 'lightseagreen',
  '#214FC6': 'new_car',
  '#216BD6': 'flickr_blue',
  '#21ABCD': 'ball_blue',
  '#2243B6': 'denim_blue',
  '#224634': 'velvet_birodo',
  '#228B22': 'forestgreen',
  '#230C33': 'blackcurrant',
  '#23191E': 'dark_red_kurobeni',
  '#23297A': 'saint_patricks_blue',
  '#232B2B': 'charleston_green',
  '#233067': 'indigo_rainbow',
  '#240046': 'very_dark_violet',
  '#242124': 'mate_black',
  '#246BCE': 'celtic_blue',
  '#2496CD': 'douban_blue',
  '#24A0ED': 'button_blue',
  '#252321': 'black_chestnut',
  '#253529': 'black_leather_jacket',
  '#26428B': 'dark_cornflower_blue',
  '#264348': 'japanese_indigo',
  '#264653': 'greengrey',
  '#26547C': 'winter_blue',
  '#26619C': 'lapis_lazuli',
  '#26A7DE': 'twitter_blue',
  '#27221F': 'ink_color_sumi_iro',
  '#273BE2': 'palatinate_blue',
  '#283618': 'dark_olive',
  '#28589C': 'cyan_cobalt_blue',
  '#2887C8': 'green_blue_crayola',
  '#290E05': 'root_beer',
  '#296E01': 'metallic_green',
  '#299617': 'slimy_green',
  '#29AB87': 'jungle_cyan',
  '#2A2F23': 'pine_tree',
  '#2A3439': 'gunmetal',
  '#2A52BE': 'cerulean_blue',
  '#2A603B': 'green_midori',
  '#2A8000': 'napier_green',
  '#2B2028': 'blue_violet',
  '#2B2D42': 'gun_grey',
  '#2B3733': 'iron_tetsu',
  '#2B3736': 'iron_storage',
  '#2C1608': 'zinnwaldite_brown',
  '#2D383A': 'outer_space_crayola',
  '#2D4436': 'insect_screen',
  '#2D68C4': 'true_blue',
  '#2E211B': 'legal_dye',
  '#2E2D88': 'cosmic_cobalt',
  '#2E372E': 'indigo_codium',
  '#2E5090': 'yinmn_blue',
  '#2E5894': 'bdazzled_blue',
  '#2E8B57': 'seagreen',
  '#2E963D': 'douban_green',
  '#2EC4B6': 'vibrant_turquoise',
  '#2F4F4F': 'darkslategray',
  '#2F7532': 'japanese_laurel',
  '#2F847C': 'celadon_green',
  '#301934': 'darkpurple',
  '#306030': 'mughal_green',
  '#30B21A': 'yellow_green',
  '#30BA8F': 'mountain_meadow',
  '#30BFBF': 'maximum_blue_green',
  '#317589': 'thousand_herb',
  '#317873': 'myrtle_green',
  '#318CE7': 'bleu_de_france',
  '#319177': 'illuminating_emerald',
  '#32127A': 'persian_indigo',
  '#32174D': 'russian_violet',
  '#324AB2': 'violet_blue',
  '#32527B': 'metallic_blue',
  '#32AD61': 'asda_green_2002',
  '#32CD32': 'limegreen',
  '#330066': 'deep_violet',
  '#333300': 'very_dark_olive',
  '#333366': 'deep_koamaru',
  '#333399': 'blue_pigment',
  '#3333CC': 'indigo_sky',
  '#3333FF': 'electric_blue',
  '#336600': 'young_olive',
  '#336699': 'dark_slate_blue',
  '#3366CC': 'royal_blue',
  '#3366FF': 'summer_sky',
  '#339933': 'forest_green',
  '#339966': 'sea_green',
  '#3399FF': 'brilliant_azure',
  '#33CC33': 'light_green',
  '#33CCCC': 'sea_sky',
  '#33CCFF': 'light_sky_blue',
  '#344D56': 'iron_head_flower',
  '#347C98': 'steel_blue',
  '#34B233': 'wageningen_green',
  '#34B334': 'american_green',
  '#351E1C': 'black_kite',
  '#351F19': 'scorched_brown',
  '#352925': 'betel_nut',
  '#353535': 'dark_gray',
  '#353839': 'onyx',
  '#354230': 'kombu_green',
  '#354E4B': 'silk_crepe',
  '#355E3B': 'deep_moss_green',
  '#35654D': 'poker_green',
  '#360CCC': 'interdimensional_blue',
  '#364141': 'onando',
  '#36454F': 'charcoal',
  '#365194': 'chinese_blue',
  '#36747D': 'ming',
  '#367588': 'teal_blue',
  '#374231': 'thousand_year_old_green',
  '#38A32A': 'vine_green',
  '#391285': 'pixie_powder',
  '#391802': 'american_bronze',
  '#393432': 'indigo_ink_brown',
  '#39569C': 'facebook_blue',
  '#39A78E': 'zomp',
  '#39FF14': 'neon_green',
  '#3A0CA3': 'vivid_blue_violet',
  '#3A243B': 'deeppurple',
  '#3A403B': 'rusty_storeroom',
  '#3A6960': 'blue_green_seiheki',
  '#3A86FF': 'vivid_blue',
  '#3AA8C1': 'moonstone',
  '#3AB09E': 'keppel',
  '#3B2F2F': 'black_coffee',
  '#3B331C': 'pullman_green',
  '#3B3429': 'thousand_year_old_brown',
  '#3B3B6D': 'american_blue',
  '#3B3C36': 'black_olive',
  '#3B7A57': 'amazon',
  '#3C1414': 'dark_sienna',
  '#3C1874': 'deep_indigo',
  '#3C3024': 'cola',
  '#3C341F': 'dark_olive_drab',
  '#3CB371': 'mediumseagreen',
  '#3CB44B': 'pleasant_green',
  '#3CD070': 'ufo_green',
  '#3D0C02': 'black_bean',
  '#3D2B1F': 'bistre',
  '#3D325D': 'jacarta',
  '#3D4035': 'storeroom_brown',
  '#3D4C51': 'kimono_storage',
  '#3D5D42': 'horsetail',
  '#3E8EDE': 'tufts_blue',
  '#3EB489': 'mint',
  '#3F00FF': 'electric_ultramarine',
  '#3F313A': 'disappearing_purple',
  '#3F3351': 'dark_lavender',
  '#3FFF00': 'harlequin',
  '#407A52': 'patina_rokusho',
  '#40826D': 'deep_aquamarine',
  '#40E0D0': 'turquoise',
  '#413628': 'jacko_bean',
  '#414A4C': 'outer_space',
  '#4166F5': 'ultramarine_blue',
  '#4169E1': 'royal_blue_light',
  '#423629': 'dark_taupe',
  '#42D4F4': 'sky_blue',
  '#431C53': 'american_purple',
  '#43302E': 'old_burgundy',
  '#4363D8': 'cobalt_blue',
  '#436B95': 'queen_blue',
  '#43B3AE': 'verdigris',
  '#4424D6': 'violetblue',
  '#444C38': 'rifle_green',
  '#446CCF': 'han_blue',
  '#44798E': 'jelly_bean_blue',
  '#44D7A8': 'eucalyptus',
  '#450920': 'burgundy_velvet',
  '#454D32': 'pine_needle',
  '#455859': 'rusty_storage',
  '#45B1E8': 'picton_blue',
  '#45B8AC': 'medium_turquoise',
  '#462255': 'aubergine',
  '#465945': 'gray_asparagus',
  '#4682B4': 'steelblue',
  '#4682BF': 'cyan_blue_azure',
  '#469990': 'light_teal',
  '#46CB18': 'harlequin_green',
  '#473F2D': 'flirtatious_indigo_tea',
  '#47ABCC': 'maximum_blue',
  '#480607': 'bulgarian_rose',
  '#483C32': 'dark_lava',
  '#483D8B': 'darkslateblue',
  '#48929B': 'light_blue',
  '#48BF84': 'light_emerald',
  '#48BF91': 'ocean_green',
  '#48D1CC': 'mediumturquoise',
  '#490206': 'dark_chocolate',
  '#491E3C': 'rabbit_ear_iris',
  '#49796B': 'hookers_green',
  '#4997D0': 'celestial_blue',
  '#4A2C2A': 'brown_coffee',
  '#4A4E69': 'independence2',
  '#4A5D23': 'dark_moss_green',
  '#4A646C': 'deep_space_sparkle',
  '#4AFF00': 'chlorophyll_green',
  '#4B0082': 'indigo',
  '#4B3621': 'cafe_noir',
  '#4B3C39': 'brown_rat_grey',
  '#4B5320': 'army_green',
  '#4BC7CF': 'sea_serpent',
  '#4C2882': 'spanish_violet',
  '#4C2F27': 'acajou',
  '#4C3D30': 'simmered_seaweed_mirucha',
  '#4C516D': 'independence',
  '#4C721D': 'green_cola',
  '#4C8BF5': 'google_chrome_blue',
  '#4C9141': 'may_green',
  '#4CB7A5': 'blue_lagoon',
  '#4CBB17': 'kelly_green',
  '#4D1A7F': 'blue_violet_color_wheel',
  '#4D3B3C': 'wisteria_and_burnt_bamboo',
  '#4D4B3A': 'sooty_willow_bamboo',
  '#4D5D53': 'feldgrau',
  '#4D646C': 'opposite_flower',
  '#4D8C57': 'middle_green',
  '#4D8FAC': 'winter_sky',
  '#4E1609': 'french_puce',
  '#4E5180': 'purple_navy',
  '#4E82B4': 'cyan_azure',
  '#4F284B': 'purple_murasaki',
  '#4F42B5': 'ocean_blue',
  '#4F4944': 'dull_blue_aonibi',
  '#4F666A': 'stormcloud',
  '#4F7942': 'fern_green',
  '#4F86F7': 'blueberry',
  '#50404D': 'purple_taupe',
  '#5072A7': 'blue_yonder',
  '#507D2A': 'sap_green',
  '#50C878': 'pale_emerald',
  '#512888': 'ksu_purple',
  '#514100': 'dark_bronze_coin',
  '#51484F': 'quartz',
  '#5218FA': 'han_purple',
  '#522D80': 'regalia',
  '#523B35': 'royal_brown',
  '#524B2A': 'codium_fragile_seaweed',
  '#52593B': 'blue_black_crayfish',
  '#534A32': 'rikan_brown_rikancha',
  '#534B4F': 'dark_liver',
  '#536872': 'cadet',
  '#536878': 'dark_electric_blue',
  '#536895': 'ucla_blue',
  '#540B0E': 'dark_maroon',
  '#542D24': 'boiled_red_bean_brown',
  '#543D37': 'dark_liver_horses',
  '#545A2C': 'soldier_green',
  '#545AA7': 'liberty',
  '#54626F': 'black_coral',
  '#551B8C': 'american_violet',
  '#553592': 'blue_magenta_violet',
  '#555D50': 'ebony',
  '#556B2F': 'darkolivegreen',
  '#55B4B0': 'dark_turquoise',
  '#563C0D': 'pineapple',
  '#563C5C': 'english_violet',
  '#568203': 'avocado',
  '#56887D': 'wintergreen_dream',
  '#56A0D3': 'carolina_blue',
  '#577590': 'airforce_greyblue',
  '#58427C': 'cyber_grape',
  '#58A813': 'lawn_green',
  '#59260B': 'seal_brown',
  '#592720': 'caput_mortuum',
  '#59292C': 'mulberry_dye',
  '#592B1F': 'sumac_dyed_korozen',
  '#593A27': 'weathered_bamboo',
  '#5946B2': 'plump_purple',
  '#5A4F74': 'safflower',
  '#5A4FCF': 'iris',
  '#5A6457': 'aloeswood_brown',
  '#5A7247': 'military_green',
  '#5B0A91': 'metallic_violet',
  '#5B3256': 'japanese_violet',
  '#5B5EA6': 'blue_lavender',
  '#5B8930': 'fresh_onion_moegi',
  '#5B92E5': 'united_nations_blue',
  '#5C4827': 'nightingale_brown',
  '#5C544E': 'mousy_indigo',
  '#5CFF67': 'lemon_lime_blue',
  '#5D1916': 'philippine_brown',
  '#5D3954': 'dark_byzantium',
  '#5D3A1A': 'earthtone',
  '#5D3F6A': 'bellflower',
  '#5D89BA': 'silver_lake_blue',
  '#5D8AA8': 'air_force_blue',
  '#5D8CAE': 'storm_blue',
  '#5DA493': 'polished_pine',
  '#5DADEC': 'blue_jeans',
  '#5E2824': 'maroon',
  '#5E3D26': 'dark_brown',
  '#5E5545': 'iwai_brown_iwaicha',
  '#5E644F': 'old_bamboo',
  '#5E8C31': 'maximum_green',
  '#5F8A8B': 'steel_teal',
  '#5F9EA0': 'cadetblue',
  '#5FA777': 'forest_green_crayola',
  '#5FA778': 'shiny_shamrock',
  '#5FC9BF': 'bayside',
  '#60281E': 'chestnut_leather_brown',
  '#602F6B': 'imperial',
  '#6050DC': 'majorelle_blue',
  '#6082B6': 'glaucous',
  '#614051': 'eggplant',
  '#614E6E': 'dark_indigo',
  '#630F0F': 'blood_organ',
  '#635147': 'umber',
  '#635A52': 'italian_leather',
  '#63775B': 'axolotl',
  '#644117': 'pullman_brown_ups_brown',
  '#645452': 'wenge',
  '#6495ED': 'cornflowerblue',
  '#64E986': 'very_light_malachite_green',
  '#650D1B': 'claret_red',
  '#656255': 'greyish_dark_green',
  '#65FF00': 'green_slime',
  '#660000': 'blood_red1',
  '#660033': 'dark_red',
  '#660066': 'purple',
  '#6600CC': 'deep_purple',
  '#6600FF': 'vivid_violet',
  '#66023C': 'imperial_purple',
  '#66033C': 'spanish_purple',
  '#6622CC': 'deepviolet',
  '#663300': 'darkbrown',
  '#663399': 'rebeccapurple',
  '#663854': 'halaya_pink',
  '#664228': 'van_dyke_brown',
  '#665343': 'contemplation',
  '#665D1E': 'antique_bronze',
  '#666633': 'dark_olive_green',
  '#666699': 'dark_lavenderblue',
  '#6666FF': 'very_light_blue',
  '#669900': 'olive_drab',
  '#669999': 'desaturated_cyan',
  '#6699CC': 'blue_gray',
  '#6699FF': 'light_royal_blue',
  '#66B032': 'green_ryb',
  '#66B447': 'apple',
  '#66C992': 'asda_green_1999',
  '#66CCFF': 'light_azure',
  '#66CDAA': 'mediumaquamarine',
  '#66DDAA': 'medium_aquamarine',
  '#66FF00': 'bright_green',
  '#66FF33': 'spring_leaf',
  '#66FF66': 'screamin_green',
  '#66FF99': 'spearmint',
  '#66FFCC': 'light_aqua',
  '#66FFFF': 'bleach',
  '#672422': 'red_bean_color',
  '#674403': 'violin_brown',
  '#674846': 'rose_ebony',
  '#674C47': 'liver',
  '#679267': 'russian_green',
  '#682860': 'palatinate_purple',
  '#68A0B0': 'crystal_blue',
  '#69359C': 'purple_heart',
  '#696969': 'dimgray',
  '#6A040F': 'red_oxide',
  '#6A0DAD': 'bright_purple',
  '#6A432D': 'aloewood',
  '#6A5445': 'quincy',
  '#6A5ACD': 'slateblue',
  '#6A7F7A': 'rusted_light_blue',
  '#6AB2CA': 'delicate_girl_blue',
  '#6B4423': 'brown_nose',
  '#6B4947': 'painite',
  '#6B5B95': 'blue_purple',
  '#6B8E23': 'olivedrab',
  '#6B9362': 'young_bamboo',
  '#6C2E1F': 'liver_organ',
  '#6C3082': 'eminence',
  '#6C541E': 'field_drab',
  '#6CA0DC': 'little_boy_blue',
  '#6D2B50': 'vine_grape_ebizome',
  '#6D9A79': 'oxley',
  '#6D9BC3': 'cerulean_frost',
  '#6E3A07': 'philippine_bronze',
  '#6E5F57': 'plain_mouse',
  '#6E6E30': 'mustard_green',
  '#6E7F80': 'aurometalsaurus',
  '#6E81A0': 'slate_blue',
  '#6EAEA1': 'green_sheen',
  '#6F00FF': 'electric_indigo',
  '#6F2DA8': 'grape',
  '#6F3028': 'cypress_bark_red',
  '#6F4E37': 'coffee',
  '#6F9940': 'palm_leaf',
  '#701C1C': 'persian_plum',
  '#702670': 'midnight',
  '#702963': 'byzantium',
  '#704214': 'sepia',
  '#704241': 'deep_coffee',
  '#70543E': 'mud',
  '#708090': 'slategray',
  '#716675': 'rum',
  '#71706E': 'dark_silver',
  '#71A6D2': 'iceberg',
  '#71BC78': 'iguana_green',
  '#7209B7': 'dark_purple',
  '#720B98': 'chinese_purple',
  '#727472': 'nickel',
  '#72A0C1': 'air_superiority_blue',
  '#733380': 'maximum_purple',
  '#733635': 'garnet',
  '#734F96': 'dark_lilac',
  '#7366BD': 'blue_violet_crayola',
  '#737000': 'bronze_yellow',
  '#738276': 'smoke',
  '#738678': 'xanadu',
  '#73A9C2': 'moonstone_blue',
  '#73C2FB': 'maya_blue',
  '#746CC0': 'toolbox',
  '#749F8D': 'pale_green_onion',
  '#74BBFB': 'very_light_azure',
  '#74C365': 'mantis',
  '#752E23': 'cypress_bark_color',
  '#755D5B': 'dove_feather_grey',
  '#757D75': 'harbor_rat',
  '#763568': 'iris_purple',
  '#766980': 'mousy_wisteria',
  '#766EC8': 'violet_blue_crayola',
  '#76D7EA': 'sky_blue_crayola',
  '#774D8E': 'pale_purple',
  '#777696': 'rhythm',
  '#778899': 'lightslategray',
  '#778BA5': 'shadow_blue',
  '#779ECB': 'periwinkle',
  '#77B5FE': 'french_sky_blue',
  '#77DD77': 'pastel_green',
  '#78184A': 'pansy_purple',
  '#7851A9': 'royal_purple',
  '#785E49': 'color_of_an_undried_wall',
  '#78779B': 'stained_red',
  '#78866B': 'camouflage_green',
  '#79443B': 'bole',
  '#796878': 'old_lavender',
  '#7A942E': 'siskin_sprout_yellow',
  '#7B1113': 'up_maroon',
  '#7B3B3A': 'deep_scarlet',
  '#7B3F00': 'chocolate_traditional',
  '#7B68EE': 'mediumslateblue',
  '#7BB661': 'bud_green',
  '#7C0A02': 'barn_red',
  '#7C1C05': 'kenyan_copper',
  '#7C4848': 'tuscan_red',
  '#7C98AB': 'weldon_blue',
  '#7C9ED9': 'vista_blue',
  '#7CB9E8': 'aero',
  '#7CFC00': 'lawngreen',
  '#7D4E2D': 'golden_grey_bamboo',
  '#7DB700': 'microsoft_green',
  '#7DC242': 'asda_green',
  '#7DF9FF': 'electric_sky',
  '#7E5E60': 'deep_taupe',
  '#7EB6FF': 'parakeet_blue',
  '#7ED4E6': 'middle_blue',
  '#7F00FF': 'violet_color_wheel',
  '#7F3E98': 'cadmium_violet',
  '#7F5D3B': 'japanese_iris',
  '#7F6B5D': 'lye',
  '#7FCDCD': 'light_cyan',
  '#7FFF00': 'chartreuse',
  '#7FFFD4': 'aquamarine',
  '#800000': 'red_maroon',
  '#800080': 'patriarch',
  '#801818': 'falu_red',
  '#804040': 'american_brown',
  '#80461B': 'russet',
  '#804A00': 'dark_bronze',
  '#807532': 'spanish_bistre',
  '#808000': 'heart_gold',
  '#808080': 'gray',
  '#80C197': 'asda_green_1994',
  '#80DAEB': 'medium_sky_blue',
  '#81007F': 'philippine_violet',
  '#811453': 'french_plum',
  '#81613C': 'coyote_brown',
  '#817B69': 'willow_grey',
  '#819C8B': 'celadon_seiji',
  '#820000': 'deep_maroon',
  '#824B35': 'green_tea',
  '#826644': 'raw_umber',
  '#826B58': 'sen_no_rikyus_tea_rikyucha',
  '#828E84': 'dolphin_gray',
  '#832A0D': 'smokey_topaz',
  '#8338EC': 'vibrant_purple',
  '#8366F4': 'violets_are_blue',
  '#836953': 'pastel_brown',
  '#836FFF': 'medium_slate_blue',
  '#83781B': 'brass_yellow',
  '#838996': 'roman_silver',
  '#841617': 'ou_crimson_red',
  '#84563C': 'milk_chocolate',
  '#848482': 'battleship_grey',
  '#850101': 'deep_red',
  '#856088': 'chinese_violet',
  '#856D4D': 'french_bistre',
  '#85754E': 'gold_fusion',
  '#857C55': 'baiko_brown',
  '#85BB65': 'dollar_bill',
  '#8601AF': 'violet_ryb',
  '#86608E': 'french_lilac',
  '#867E36': 'old_moss_green',
  '#86ABA5': 'aqua_blue',
  '#872657': 'dark_raspberry',
  '#873260': 'boysenberry',
  '#87413F': 'brandy',
  '#875F9A': 'wisteria_purple',
  '#878681': 'titanium',
  '#87A96B': 'asparagus',
  '#87CEEB': 'skyblue',
  '#87CEFA': 'lightskyblue',
  '#87D3F8': 'pale_cyan',
  '#87FF2A': 'spring_frost',
  '#880085': 'mardi_gras',
  '#8806CE': 'french_violet',
  '#882D17': 'kobe',
  '#88540B': 'bronze1',
  '#88654E': 'dark_brown_tangelo',
  '#8878C3': 'ube',
  '#88ACE0': 'light_cobalt_blue',
  '#88B04B': 'guacamole',
  '#88D8C0': 'pearl_aqua',
  '#896C39': 'yellow_sea_pine_brown',
  '#89729E': 'wisteria_fuji',
  '#898A74': 'rusty_celadon',
  '#89CFF0': 'baby_blue',
  '#8A0303': 'blood1',
  '#8A2BE2': 'blueviolet',
  '#8A3324': 'burnt_umber',
  '#8A496B': 'twilight_lavender',
  '#8A795D': 'shadow',
  '#8A9A5B': 'moss_green',
  '#8AB9F1': 'jordy_blue',
  '#8B0000': 'darkred',
  '#8B008B': 'darkmagenta',
  '#8B171A': 'strawberry_jam',
  '#8B352D': 'red_brown1',
  '#8B4513': 'saddlebrown',
  '#8B5F4D': 'spicy_mix',
  '#8B72BE': 'middle_blue_purple',
  '#8B7D3A': 'moss_color',
  '#8B8589': 'taupe_gray',
  '#8B8680': 'middle_grey',
  '#8BA8B7': 'pewter_blue',
  '#8BBE1B': 'dark_lemon_lime',
  '#8C4736': 'sparrow_brown',
  '#8C5939': 'brushwood_dyed_fushizome',
  '#8C92AC': 'cool_grey',
  '#8C9C76': 'pale_blue_usuao',
  '#8C9E5E': 'willow_dye',
  '#8CBED6': 'dark_sky_blue',
  '#8D4E85': 'razzmic_berry',
  '#8D608C': 'half_hashita',
  '#8D9440': 'khaki',
  '#8DA399': 'morning_blue',
  '#8DB255': 'pale_young_green_onion',
  '#8DB600': 'deep_apple_green',
  '#8DD9CC': 'middle_blue_green',
  '#8E4585': 'plum',
  '#8EE53F': 'kiwi',
  '#8F00FF': 'electric_violet',
  '#8F1D21': 'true_red',
  '#8F583C': 'clove_brown',
  '#8F9779': 'artichoke',
  '#8FBC8F': 'darkseagreen',
  '#8FD400': 'sheen_green',
  '#905D5D': 'rose_taupe',
  '#906652': 'italian_roast',
  '#90BE6D': 'light_olive_green',
  '#90EE90': 'lightgreen',
  '#911EB4': 'violet',
  '#913225': 'dyestalk_red',
  '#913228': 'red_kite',
  '#914E75': 'sugar_plum',
  '#915C83': 'antique_fuchsia',
  '#918151': 'dark_tan',
  '#91A3B0': 'cadet_grey',
  '#92000A': 'sangria',
  '#922724': 'vivid_auburn',
  '#923C01': 'iced_tea',
  '#92A1CF': 'ceil',
  '#92A8D1': 'rain_blue',
  '#933709': 'citrine_brown',
  '#933D41': 'smoky_topaz',
  '#934337': 'persimmon_juice_color',
  '#936900': 'porcupine',
  '#9370DB': 'mediumpurple',
  '#93C572': 'pistachio',
  '#93CCEA': 'cornflower',
  '#9400D3': 'darkviolet',
  '#9457EB': 'lavender_indigo',
  '#954535': 'chestnut',
  '#955251': 'rosewood',
  '#957B38': 'finch_brown',
  '#963D7F': 'violet_crayola',
  '#964B00': 'brown_traditional',
  '#965A3E': 'coconut',
  '#966FD6': 'dark_pastel_purple',
  '#967117': 'bistre_brown',
  '#9678B6': 'purple_mountain_majesty',
  '#967BB6': 'lavender_purple',
  '#96A53C': 'pomelo',
  '#96C8A2': 'eton_blue',
  '#96DED1': 'pale_robin_egg_blue',
  '#96FF00': 'mango_green',
  '#97645A': 'plum_blossom_mouse',
  '#976E9A': 'tatarian_aster',
  '#97867C': 'silver_grey_ginnezumi',
  '#979AAA': 'manatee',
  '#985538': 'polished_brown',
  '#985629': 'fox',
  '#986960': 'dark_chestnut',
  '#987456': 'liver_chestnut',
  '#987654': 'pale_brown',
  '#98817B': 'cinereous',
  '#98B4D4': 'pale_blue',
  '#98FB98': 'palegreen',
  '#98FF98': 'mint_green',
  '#990000': 'crimson_red',
  '#990033': 'dark_crimson',
  '#990099': 'dark_red_violet',
  '#9900CC': 'dark_violet',
  '#9900FF': 'bright_violet',
  '#9932CC': 'darkorchid',
  '#993300': 'brown',
  '#993333': 'indian_red',
  '#993366': 'dark_mauve',
  '#993399': 'dark_magenta',
  '#9933FF': 'electric_lilac',
  '#9955BB': 'deep_lilac',
  '#996515': 'golden_brown',
  '#996600': 'gamboge_orange_brown',
  '#996633': 'medium_brown',
  '#996666': 'copper_rose',
  '#9966CC': 'amethyst',
  '#9966FF': 'medium_violet',
  '#997A8D': 'mountbatten_pink',
  '#999966': 'pale_olive',
  '#9999FF': 'pale_lilac',
  '#99CC00': 'lime',
  '#99CCFF': 'pale_sky_blue',
  '#99E6B3': 'teal_deer',
  '#99FF33': 'light_chartreuse',
  '#99FF66': 'light_lime',
  '#99FF99': 'pale_green',
  '#99FFCC': 'pale_mint',
  '#9A4EAE': 'purpureus',
  '#9AB973': 'olivine',
  '#9ACD32': 'yellowgreen',
  '#9B2335': 'carmine',
  '#9B351B': 'deep_dumpling',
  '#9B533F': 'faded_spicy_red_brown',
  '#9B5DE5': 'vibrant_lavender',
  '#9B7653': 'dirt',
  '#9B870C': 'dark_yellow',
  '#9BC4E2': 'pale_cerulean',
  '#9C51B6': 'purple_plum',
  '#9C7C38': 'metallic_sunburst',
  '#9C8A4D': 'willow_tea',
  '#9C8AA4': 'deep_amethyst',
  '#9D2B22': 'red_birch',
  '#9DC209': 'limerick',
  '#9E1316': 'spartan_crimson',
  '#9EFD38': 'french_lime',
  '#9F00C5': 'purple_munsell',
  '#9F00FF': 'blue_lilac',
  '#9F2B68': 'amaranth_deep_purple',
  '#9F4576': 'magenta_haze',
  '#9F5233': 'red_ochre',
  '#9F7462': 'walnut_dyed',
  '#9F8170': 'beaver',
  '#9FA91F': 'citron',
  '#9FE2BF': 'sea_foam_green',
  '#A020F0': 'purple_x11',
  '#A0522D': 'sienna',
  '#A0785A': 'chamoisee',
  '#A09484': 'stone_terrace',
  '#A0D6B4': 'turquoise_green',
  '#A0E6FF': 'winter_wizard',
  '#A13D2D': 'red_brown',
  '#A17917': 'rapeseed_oil',
  '#A17A74': 'burnished_brown',
  '#A19D94': 'iron',
  '#A1CAF1': 'baby_blue_eyes',
  '#A2006D': 'flirt',
  '#A23BEC': 'child_purple',
  '#A24F46': 'sappanwood_incense',
  '#A2A2D0': 'blue_bell',
  '#A2ADD0': 'wild_blue',
  '#A3C1AD': 'cambridge_blue',
  '#A40000': 'dark_candy_apple_red',
  '#A41313': 'blood',
  '#A45A52': 'redwood',
  '#A4B086': 'sage_green',
  '#A4DDED': 'non_photo_blue',
  '#A4F4F9': 'waterspout',
  '#A50B5E': 'jazzberry_jam',
  '#A52A2A': 'auburn',
  '#A55353': 'middle_red_purple',
  '#A57164': 'blast_off_bronze',
  '#A57C00': 'gold',
  '#A5BA93': 'whitish_green',
  '#A62C2B': 'metallic_red',
  '#A63A79': 'maximum_red_purple',
  '#A65F46': 'copper_brown',
  '#A67B5B': 'cafe_au_lait',
  '#A6D608': 'vivid_lime_green',
  '#A6E7FF': 'fresh_air',
  '#A72127': 'rambutan_red',
  '#A75502': 'windsor_tan',
  '#A76BCF': 'rich_lavender',
  '#A7D8DE': 'crystal',
  '#A7F432': 'green_lizard',
  '#A7FC00': 'spring_bud',
  '#A81C07': 'rufous',
  '#A83731': 'sweet_brown',
  '#A87CA0': 'thin_usu',
  '#A8A9AD': 'chrome_aluminum',
  '#A8C3BC': 'opal',
  '#A8E4A0': 'granny_smith_apple',
  '#A96232': 'clove_dyed_chojizome',
  '#A97142': 'metallic_bronze',
  '#A99A86': 'grullo',
  '#A9A9A9': 'darkgray',
  '#A9B2C3': 'cadet_blue_crayola',
  '#A9BA9D': 'laurel_green',
  '#AA00BB': 'heliotrope_magenta',
  '#AA381E': 'chinese_red',
  '#AA6C39': 'dark_gold',
  '#AA8736': 'pale_fallen_leaves',
  '#AA98A9': 'heliotrope_gray',
  '#AAA9AD': 'silver_metallic',
  '#AAF0D1': 'magic_mint',
  '#AB381F': 'chinese_brown',
  '#AB4B52': 'english_red',
  '#AB4C3D': 'wilted_brown',
  '#AB4E52': 'rose_vale',
  '#AB6134': 'loquat_tree_brown',
  '#AB92B3': 'glossy_grape',
  '#ABCDEF': 'pale_cornflower_blue',
  '#AC4313': 'metallic_brown',
  '#AC8181': 'cherry_blossom_mouse',
  '#ACACE6': 'maximum_blue_purple',
  '#ACBF60': 'middle_green_yellow',
  '#ACE1AF': 'celadon',
  '#ACE5EE': 'blizzard_blue',
  '#AD4379': 'mystic_maroon',
  '#AD6F69': 'copper_penny',
  '#ADD8E6': 'lightblue',
  '#ADDFAD': 'light_moss_green',
  '#ADFF2F': 'greenyellow',
  '#AE0C00': 'mordant_red_19',
  '#AE2029': 'upsdell_red',
  '#AE98AA': 'lilac_luster',
  '#AEC6CF': 'pastel_blue',
  '#AF4035': 'medium_carmine',
  '#AF593E': 'brown_crayola',
  '#AF6E4D': 'brown_sugar',
  '#AFB1AE': 'silver_foil',
  '#AFEEEE': 'pale_blue_pale_turquoise',
  '#AFFF45': 'apple_green',
  '#B05C52': 'giants_club',
  '#B07939': 'durian',
  '#B08D57': 'bronze_metallic',
  '#B0927A': 'faded_rikyus_tea',
  '#B0BF1A': 'acid_green',
  '#B0C24A': 'margarita',
  '#B0C4DE': 'lightsteelblue',
  '#B0E0E6': 'powderblue',
  '#B14A30': 'birch_brown_kabacha',
  '#B17304': 'philippine_gold',
  '#B19CD9': 'light_pastel_purple',
  '#B21807': 'tomato_sauce',
  '#B22222': 'firebrick',
  '#B284BE': 'african_violet',
  '#B29700': 'light_gold',
  '#B2BEB5': 'ash_gray',
  '#B2D732': 'lime_green',
  '#B2EC5D': 'inchworm',
  '#B2FFFF': 'celeste',
  '#B31B1B': 'carnelian',
  '#B35C44': 'spicy_red_brown',
  '#B38B6D': 'light_taupe',
  '#B39EB5': 'pastel_purple',
  '#B53389': 'fandango',
  '#B56257': 'electric_brown',
  '#B5651D': 'light_brown',
  '#B5651E': 'dirty_brown',
  '#B565A7': 'orchid',
  '#B56C60': 'water_persimmon',
  '#B57EDC': 'lavender_floral',
  '#B5A642': 'brass',
  '#B5B35C': 'olive_green',
  '#B5EAD7': 'child_mint',
  '#B62020': 'red_cola',
  '#B64925': 'cattail_color',
  '#B666D2': 'rich_lilac',
  '#B7410E': 'rust',
  '#B768A2': 'pearly_purple',
  '#B7702D': 'chinese_yellow_tea',
  '#B784A7': 'opera_mauve',
  '#B78727': 'university_of_california_gold',
  '#B80CE3': 'vivid_mulberry',
  '#B86D29': 'liver_dogs',
  '#B87333': 'dark_copper',
  '#B8860B': 'darkgoldenrod',
  '#B94E48': 'deep_chestnut',
  '#B95754': 'long_spring',
  '#B9A193': 'white_mouse',
  '#B9F2FF': 'diamond',
  '#BA0001': 'ue_red',
  '#BA160C': 'international_orange1',
  '#BA55D3': 'mediumorchid',
  '#BA8759': 'deer',
  '#BA93D8': 'lenurple',
  '#BB3385': 'red_magenta',
  '#BB6528': 'ruddy_brown',
  '#BB8141': 'golden_oak',
  '#BB9351': 'maple_syrup',
  '#BBA46D': 'pale_oak',
  '#BBB477': 'misty_moss',
  '#BBD0C9': 'jet_stream',
  '#BC243C': 'red',
  '#BC2D29': 'greyed_red',
  '#BC8F8F': 'rosybrown',
  '#BC987E': 'pale_taupe',
  '#BCB58C': 'underside_of_willow_leaves',
  '#BCB88A': 'sage',
  '#BCD4E6': 'beau_blue',
  '#BD3000': 'lemon_iced_tea',
  '#BD33A4': 'byzantine',
  '#BD559C': 'rose_quartz_pink',
  '#BD9B16': 'gold_foil',
  '#BDA928': 'greenfinch',
  '#BDB76B': 'darkkhaki',
  '#BDDA57': 'june_bud',
  '#BE7F51': 'dark_ochre',
  '#BEA493': 'mocha',
  '#BF00FF': 'electric_purple',
  '#BF4F51': 'bittersweet_shimmer',
  '#BF94E4': 'bright_lavender',
  '#BFBD70': 'pomelo_olive',
  '#BFC0EE': 'vodka',
  '#BFC1C2': 'silver_sand',
  '#BFFF00': 'bitter_lime',
  '#C0362C': 'dark_international_orange',
  '#C04000': 'mahogany',
  '#C0448F': 'red_violet_crayola',
  '#C08081': 'old_rose',
  '#C09999': 'tuscany',
  '#C0C0C0': 'silver',
  '#C154C1': 'deep_fuchsia',
  '#C19A6B': 'camel',
  '#C1F9A2': 'menthol',
  '#C21460': 'raspberry',
  '#C23B22': 'dark_pastel_red',
  '#C2B280': 'ecru',
  '#C3272B': 'pure_crimson',
  '#C3447A': 'berry_pink',
  '#C3CDE6': 'periwinkle_crayola',
  '#C46210': 'alloy_orange',
  '#C48E69': 'white_tea',
  '#C4AEAD': 'silver_pink',
  '#C4C3D0': 'lavender_gray',
  '#C4D8E2': 'columbia_blue',
  '#C54B8C': 'mulberry',
  '#C57F2E': 'mulberry_orange',
  '#C5B358': 'vegas_gold',
  '#C5CBE1': 'light_periwinkle',
  '#C5E384': 'yellow_green_crayola',
  '#C66B27': 'light_golden_brown',
  '#C68E17': 'caramel',
  '#C6C2B6': 'inside_of_a_bottle',
  '#C71585': 'mediumvioletred',
  '#C7CEEA': 'lavender_blue',
  '#C80815': 'venetian_red',
  '#C83F49': 'strawberry_red',
  '#C84186': 'smitten',
  '#C8509B': 'mulberry_crayola',
  '#C86500': 'asda_orange',
  '#C8A2C8': 'lilac',
  '#C8AD7F': 'light_french_beige',
  '#C95A49': 'cedar_chest',
  '#C9A0DC': 'wisteria',
  '#C9C0BB': 'pale_silver',
  '#C9DC87': 'medium_spring_bud',
  '#C9FFE5': 'aero_blue',
  '#CA1F7B': 'magenta_dye',
  '#CA2C92': 'royal_fuchsia',
  '#CA6924': 'amber_japan',
  '#CA7309': 'asda_orange_1968',
  '#CAE00D': 'bitter_lemon',
  '#CB410B': 'sinopia',
  '#CB6649': 'muddy_brown',
  '#CB6D51': 'copper_red',
  '#CB7E1F': 'gold_brown_yamabukicha',
  '#CB99C9': 'pastel_violet',
  '#CBA135': 'satin_sheen_gold',
  '#CC0000': 'jolly_red',
  '#CC0066': 'vivid_raspberry',
  '#CC0099': 'strong_magenta',
  '#CC00CC': 'deep_magenta',
  '#CC00FF': 'vivid_orchid',
  '#CC3300': 'carrot',
  '#CC3333': 'persian_red',
  '#CC3336': 'madder_lake',
  '#CC338B': 'magenta_pink',
  '#CC3399': 'medium_red_violet',
  '#CC33CC': 'steel_pink',
  '#CC33FF': 'bright_orchid',
  '#CC474B': 'english_vermillion',
  '#CC5500': 'burnt_orange',
  '#CC6600': 'orange_brown',
  '#CC6666': 'fuzzy_wuzzy',
  '#CC6699': 'medium_pink',
  '#CC66FF': 'medium_orchid',
  '#CC7722': 'ochre1',
  '#CC9900': 'chinese_gold',
  '#CC9966': 'brown_yellow',
  '#CC99CC': 'light_grayish_magenta',
  '#CC99FF': 'pale_violet',
  '#CCA01D': 'lemon_curry',
  '#CCCCFF': 'palelavender',
  '#CCFF00': 'electric_lime',
  '#CCFF33': 'light_lime_green',
  '#CCFF66': 'pale_yellow_green',
  '#CCFF99': 'very_light_green',
  '#CCFFCC': 'very_pale_green',
  '#CCFFFF': 'very_pale_cyan',
  '#CD040B': 'verizon_red1',
  '#CD5700': 'tenne_tawny',
  '#CD5B45': 'dark_coral',
  '#CD5C5C': 'indianred',
  '#CD7A00': 'mustard_brown',
  '#CD7F32': 'bronze',
  '#CD8032': 'chinese_bronze',
  '#CD853F': 'peru',
  '#CD9575': 'antique_brass',
  '#CDA4DE': 'tropical_violet',
  '#CE2029': 'fire_engine_red',
  '#CE9F6F': 'white_oak',
  '#CEC8EF': 'soap',
  '#CEFF00': 'volt',
  '#CF3A24': 'scarlet1',
  '#CF6BA9': 'super_pink',
  '#CF71AF': 'sky_magenta',
  '#CFB53B': 'old_gold',
  '#CFCFC4': 'pastel_gray',
  '#D0DB61': 'chinese_green',
  '#D0F0C0': 'tea_green',
  '#D0FF14': 'arctic_lime',
  '#D19FE8': 'bright_ube',
  '#D1BEA8': 'dark_vanilla',
  '#D1E189': 'lime_pulp',
  '#D1E231': 'pear',
  '#D2691E': 'cinnamon',
  '#D2B48C': 'tan',
  '#D2C29D': 'pale_tan',
  '#D2D9DB': 'aluminum_foil',
  '#D3212D': 'amaranth_red',
  '#D3419D': 'barbie_pink_1975',
  '#D34E36': 'glazed_persimmon',
  '#D39BCB': 'light_medium_orchid',
  '#D3AF37': 'american_gold',
  '#D3B17D': 'steamed_chestnut',
  '#D3D3D3': 'lightgray',
  '#D40000': 'rosso_corsa',
  '#D470A2': 'wild_orchid',
  '#D473D4': 'deep_mauve',
  '#D4AF37': 'gold_metallic',
  '#D4F1F9': 'water',
  '#D57835': 'decaying_leaves',
  '#D65076': 'blush',
  '#D68A59': 'raw_sienna',
  '#D6CADD': 'languid_lavender',
  '#D73B3E': 'jasper',
  '#D74894': 'pink_pantone',
  '#D7837F': 'new_york_pink',
  '#D891EF': 'bright_lilac',
  '#D8B2D1': 'pink_lavender',
  '#D8BFD8': 'thistle',
  '#D8E4BC': 'gin',
  '#D92121': 'maximum_red',
  '#D9381E': 'vermilion',
  '#D9463E': 'strawberry_daiquiri',
  '#D9603B': 'medium_vermilion',
  '#D982B5': 'middle_purple',
  '#D99058': 'persian_orange',
  '#D99559': 'sand',
  '#D99A6C': 'tan_crayola',
  '#D9B611': 'patrinia_flowers',
  '#D9E650': 'maximum_green_yellow',
  '#DA1D81': 'vivid_cerise',
  '#DA3287': 'deep_cerise',
  '#DA614E': 'jelly_bean',
  '#DA680F': 'metallic_orange',
  '#DA70D6': 'orchid',
  '#DA8A67': 'copper',
  '#DA9100': 'harvest_gold',
  '#DAA520': 'sunflower_yellow',
  '#DB7093': 'palevioletred',
  '#DBD7D2': 'timberwolf',
  '#DBE9F4': 'azureish_white',
  '#DC143C': 'crimson',
  '#DC3023': 'orangered',
  '#DC5349': 'lychee',
  '#DCD0FF': 'pale_lavender',
  '#DCDCDC': 'gainsboro',
  '#DD4124': 'rust_red',
  '#DDA0DD': 'medium_lavender_magenta',
  '#DDADAF': 'pale_chestnut',
  '#DDE26A': 'bored_accent_green',
  '#DE5246': 'google_chrome_red',
  '#DE8F4E': 'jasper_orange',
  '#DEA5A4': 'pastel_pink',
  '#DEAA88': 'tumbleweed',
  '#DEB887': 'burlywood',
  '#DF00FF': 'phlox',
  '#DF6124': 'vivid_red_tangelo',
  '#DF73FF': 'heliotrope',
  '#DFCFBE': 'beige_grey',
  '#DFFF00': 'chartreuse_traditional',
  '#E0218A': 'barbie_pink_pantone',
  '#E03C31': 'cg_red',
  '#E08A1E': 'sumac_dyed_hajizome',
  '#E08D3C': 'tigers_eye',
  '#E0B0FF': 'mauve',
  '#E0BC5B': 'lanzones',
  '#E0FFFF': 'lightcyan',
  '#E12C2C': 'permanent_geranium_lake',
  '#E15D44': 'terracotta',
  '#E1A95F': 'earth_yellow',
  '#E1AD01': 'mustard_yellow',
  '#E1AD21': 'urobilin',
  '#E1BD27': 'durian_yellow',
  '#E1EDE9': 'very_pale_grey',
  '#E25098': 'raspberry_pink',
  '#E25822': 'flame',
  '#E2725B': 'terra_cotta',
  '#E29C45': 'golden_fallen_leaves',
  '#E29CD2': 'orchid_crayola',
  '#E2B13C': 'japanese_triandra_grass',
  '#E2BE9F': 'eggshell_paper',
  '#E2E5DE': 'chinese_white',
  '#E2F0CB': 'pale_spring',
  '#E34234': 'cinnabar',
  '#E35C38': 'refreshed_red_brown',
  '#E3A857': 'indian_yellow',
  '#E3AB57': 'sunray',
  '#E3B130': 'rape_blossom_brown',
  '#E3DAC9': 'bone',
  '#E3F988': 'mindaro',
  '#E3FF00': 'lemon_lime',
  '#E4000F': 'nintendo_red',
  '#E40078': 'red_purple',
  '#E4007C': 'mexican_pink',
  '#E4717A': 'candy_pink',
  '#E48400': 'fulvous',
  '#E49B0F': 'gamboge',
  '#E4D00A': 'citrine',
  '#E4D96F': 'straw',
  '#E56024': 'vivid_vermilion',
  '#E58E73': 'middle_red',
  '#E5AA70': 'fawn',
  '#E5B73B': 'meat_brown',
  '#E5CCC9': 'dust_storm',
  '#E5E4E2': 'platinum',
  '#E60000': 'electric_red',
  '#E6194B': 'deep_raspberry',
  '#E62020': 'lust',
  '#E68364': 'brewed_mustard_brown',
  '#E69B3A': 'turmeric',
  '#E6A8D7': 'light_orchid',
  '#E6BE8A': 'gold_crayola',
  '#E6D0AB': 'durian_white',
  '#E6E0D4': 'white_coffee',
  '#E6E200': 'peridot',
  '#E6E6FA': 'lavender_mist',
  '#E71D36': 'strong_carmine',
  '#E73895': 'royal_pink',
  '#E7968B': 'salmon_rose',
  '#E79FC4': 'kobi',
  '#E7ACCF': 'pink_pearl',
  '#E7C9A9': 'manila',
  '#E7FEFF': 'bubbles',
  '#E8000D': 'ku_crimson',
  '#E86100': 'spanish_orange',
  '#E88E5A': 'big_foot_feet',
  '#E8E4C9': 'dirty_white',
  '#E8F48C': 'key_lime',
  '#E936A7': 'frostbite',
  '#E9399E': 'strong_boy_pink',
  '#E94196': 'barbie_pink',
  '#E95C4B': 'fire_opal',
  '#E9692C': 'deep_carrot_orange',
  '#E97451': 'burnt_sienna',
  '#E9967A': 'darksalmon',
  '#E9D66B': 'arylide_yellow',
  '#E9EDF6': 'coconut_white',
  '#E9F6EF': 'italian_ice',
  '#E9FFDB': 'nyanza',
  '#EAA221': 'marigold',
  '#EAE0C8': 'pearl',
  '#EB4C42': 'carmine_pink',
  '#EB593D': 'orange_soda1',
  '#EB6123': 'halloween_orange',
  '#EBB0D7': 'thistle_crayola',
  '#EBC2AF': 'zinnwaldite',
  '#EBECF0': 'bright_gray',
  '#EBF6F7': 'indigo_white',
  '#EC1C24': 'verizon_red',
  '#EC5800': 'persimmon',
  '#EC8254': 'washed_out_persimmon',
  '#EC956C': 'sawtooth_oak',
  '#ECB176': 'middle_yellow_red',
  '#ECCFCF': 'lotion_pink',
  '#ECD540': 'sandstorm',
  '#ECEBBD': 'pale_spring_bud',
  '#ED1C24': 'huawei_red',
  '#ED872D': 'cadmium_orange',
  '#ED9121': 'carrot_orange',
  '#EDC9AF': 'desert_sand',
  '#EDE6D6': 'white_chocolate',
  '#EE82EE': 'lavender_magenta',
  '#EED202': 'safety_yellow',
  '#EEDC82': 'flax',
  '#EEE0B1': 'cookies_and_cream',
  '#EEE600': 'titanium_yellow',
  '#EEE8AA': 'palegoldenrod',
  '#EEFF1B': 'watermelon_yellow',
  '#EF3038': 'deep_carmine_pink',
  '#EF3939': 'vivaldi_red',
  '#EF476F': 'pale_red',
  '#EFC050': 'goldenrod',
  '#EFCC00': 'yellow_munsell',
  '#EFDECD': 'almond',
  '#EFDFBB': 'dutch_white',
  '#EFFF04': 'neon_yellow',
  '#F04E1F': 'microsoft_red',
  '#F07427': 'vivid_tangelo',
  '#F07F5E': 'red_incense',
  '#F08080': 'lightcoral',
  '#F08F90': 'one_kin',
  '#F0DC82': 'buff',
  '#F0E130': 'dandelion',
  '#F0E68C': 'light_khaki',
  '#F0E891': 'green_yellow_crayola',
  '#F0EAD6': 'eggshell',
  '#F0F8FF': 'aliceblue',
  '#F0FFF0': 'honeydew',
  '#F0FFFF': 'azure_mist',
  '#F15BB5': 'vibrant_light_magenta',
  '#F1A7FE': 'rich_brilliant_lavender',
  '#F1DDCF': 'champagne_pink',
  '#F28500': 'satsuma',
  '#F28E1C': 'beer',
  '#F2B400': 'american_yellow',
  '#F2BA49': 'maximum_yellow_red',
  '#F2C649': 'maize_crayola',
  '#F2D930': 'margarine',
  '#F2E2E0': 'very_pale_pink',
  '#F2F0E6': 'alabaster',
  '#F2F27A': 'sunny',
  '#F2F3F4': 'anti_flash_white',
  '#F35336': 'blood_red',
  '#F37042': 'chinese_orange',
  '#F3722C': 'deep_orange',
  '#F37A48': 'mandarin',
  '#F39998': 'peach_burst',
  '#F3C13A': 'amur_cork_tree',
  '#F3E5AB': 'medium_champagne',
  '#F400A1': 'fashion_fuchsia',
  '#F46036': 'vibrant_orangered',
  '#F49AC2': 'orchid_pink',
  '#F4A460': 'sandybrown',
  '#F4B9B8': 'pale_blush',
  '#F4BBFF': 'brilliant_lavender',
  '#F4C2C2': 'baby_pink',
  '#F4C430': 'saffron',
  '#F4CA16': 'jonquil',
  '#F4F0EC': 'isabelline',
  '#F57F4F': 'rich_gardenia',
  '#F58025': 'princeton_orange',
  '#F58231': 'orange',
  '#F58F84': 'ibis_wing_color',
  '#F5BD1F': 'orange_yellow',
  '#F5C71A': 'deep_lemon',
  '#F5DEB3': 'wheat',
  '#F5E050': 'minion_yellow',
  '#F5F3EF': 'penguin_white',
  '#F5F5DC': 'beige',
  '#F5F5F5': 'whitesmoke',
  '#F5FFFA': 'mintcream',
  '#F6A08C': 'poppy_petal',
  '#F6A494': 'coral_reef',
  '#F6B511': 'spanish_yellow',
  '#F6EABE': 'lemon_meringue',
  '#F70D1A': 'vivid_red',
  '#F7238A': 'barbie_pink_1999',
  '#F7665A': 'thrice_dyed_crimson',
  '#F77F00': 'university_of_tennessee_orange',
  '#F77FBE': 'persian_pink',
  '#F7BB7D': 'light_yellow_asagi',
  '#F7BFBE': 'spanish_pink',
  '#F7C58E': 'douban_light_yellow',
  '#F7CAC9': 'light_pink',
  '#F7E7CE': 'champagne',
  '#F7E98E': 'flavescent',
  '#F8674F': 'coral_color',
  '#F88379': 'congo_pink',
  '#F8B878': 'mellow_apricot',
  '#F8D568': 'orange_yellow_crayola',
  '#F8DE7E': 'jasmine',
  '#F8F4FF': 'magnolia',
  '#F8F8FF': 'ghostwhite',
  '#F94144': 'strong_red',
  '#F9429E': 'rose_bonbon',
  '#F94D00': 'tangelo',
  '#F984E5': 'pale_magenta',
  '#F984EF': 'light_fuchsia_pink',
  '#F9906F': 'meat_color',
  '#F99245': 'royal_orange',
  '#F9FFE3': 'pomelo_white',
  '#FA1A8E': 'philippine_pink',
  '#FA5B3D': 'orange_soda',
  '#FA6E79': 'begonia',
  '#FA7B62': 'dawn_color',
  '#FA8072': 'salmon',
  '#FA9258': 'plum_dyed_umezome',
  '#FAA945': 'corn_japan',
  '#FAD6A5': 'deep_champagne',
  '#FADA5E': 'naples_yellow',
  '#FADFAD': 'peach_yellow',
  '#FAE6FA': 'pale_purple_pantone',
  '#FAE7B5': 'banana_mania',
  '#FAEBD7': 'antiquewhite',
  '#FAF0BE': 'blond',
  '#FAF0E6': 'linen',
  '#FAFA37': 'maximum_yellow',
  '#FAFAD2': 'lightgoldenrodyellow',
  '#FB0081': 'flickr_pink',
  '#FB4D46': 'tart_orange',
  '#FB4F14': 'orioles_orange',
  '#FB5607': 'bright_orange_red',
  '#FB8136': 'red_bronze',
  '#FB9902': 'orange_ryb',
  '#FB9912': 'kumquat',
  '#FBA0E3': 'lavender_rose',
  '#FBAB60': 'rajah',
  '#FBCCE7': 'classic_rose',
  '#FBCEB1': 'apricot',
  '#FBEC5D': 'corn',
  '#FC0FC0': 'shocking_pink',
  '#FC600A': 'tangerine',
  '#FC74FD': 'pink_flamingo',
  '#FCA474': 'pale_persimmon',
  '#FCC200': 'golden_poppy',
  '#FCC9B9': 'cherry_blossom',
  '#FCCC1A': 'bright_yellow',
  '#FCE883': 'yellow_crayola',
  '#FCF75E': 'icterine',
  '#FCFFA4': 'calamansi',
  '#FD4900': 'xiaomi_orange',
  '#FD5240': 'ogre_odor',
  '#FD5800': 'willpower_orange',
  '#FD5E53': 'sunset_orange',
  '#FD7C6E': 'coral_reef1',
  '#FDB900': 'microsoft_yellow',
  '#FDBCB4': 'melancholy',
  '#FDBE02': 'mango',
  '#FDCC0D': 'metallic_yellow',
  '#FDD5B1': 'feldspar',
  '#FDD9B5': 'sandy_tan',
  '#FDDB3A': 'child_banana',
  '#FDDB6D': 'dandelion_crayola',
  '#FDEE00': 'aureolin',
  '#FDF5E6': 'oldlace',
  '#FDFD96': 'pastel_yellow',
  '#FDFE03': 'sponge',
  '#FDFF00': 'lemon_glacier',
  '#FDFFF5': 'milk',
  '#FE2712': 'red_ryb',
  '#FE28A2': 'persian_rose',
  '#FE4EDA': 'purple_pizzazz',
  '#FE5A1D': 'giants_orange',
  '#FE6F5E': 'bittersweet',
  '#FEBAAD': 'melon',
  '#FECB00': 'philippine_yellow',
  '#FED8B1': 'peach_cream',
  '#FEDF00': 'yellow_pantone',
  '#FEE440': 'vibrant_electric_yellow',
  '#FEF65B': 'dodie_yellow',
  '#FEFDFA': 'lotion',
  '#FEFE33': 'yellow_ryb',
  '#FEFEFA': 'baby_powder',
  '#FF0000': 'primary_red',
  '#FF0066': 'hot_pink',
  '#FF006E': 'neon_pink',
  '#FF007C': 'sunset',
  '#FF007F': 'bright_pink',
  '#FF0090': 'magenta_process',
  '#FF00FF': 'fuchsia',
  '#FF0800': 'candy_apple_red',
  '#FF1493': 'deeppink',
  '#FF1DCE': 'hot_magenta',
  '#FF2400': 'chili_red',
  '#FF2800': 'ferrari_red',
  '#FF3300': 'red_orange',
  '#FF3399': 'deep_pink',
  '#FF33CC': 'razzle_dazzle_rose',
  '#FF3503': 'electric_orange',
  '#FF3800': 'coquelicot',
  '#FF4040': 'coral_red',
  '#FF404C': 'sunburnt_cyclops',
  '#FF4057': 'salmon_pink',
  '#FF4200': 'taobao_orange',
  '#FF43A4': 'wild_strawberry',
  '#FF4500': 'red_orange_color_wheel',
  '#FF4E20': 'ochre',
  '#FF4F00': 'international_orange',
  '#FF5050': 'strawberry',
  '#FF5349': 'orange_red_brown',
  '#FF5500': 'mystic_red',
  '#FF5800': 'orange1',
  '#FF5A36': 'portland_orange',
  '#FF5B00': 'maximum_orange',
  '#FF5CCD': 'light_deep_pink',
  '#FF5F00': 'vivid_orange',
  '#FF631C': 'brave_orange',
  '#FF6347': 'tomato',
  '#FF6600': 'classic_orange',
  '#FF6666': 'dark_salmon',
  '#FF6699': 'light_red_violet',
  '#FF66CC': 'rose_pink',
  '#FF66FF': 'magentapink',
  '#FF6700': 'safety_orange_blaze',
  '#FF681F': 'orange_red',
  '#FF6961': 'pastel_red',
  '#FF69B4': 'hotpink',
  '#FF6D3A': 'smashed_pumpkin',
  '#FF6E4A': 'outrageous_orange',
  '#FF6F61': 'watermelon',
  '#FF6FFF': 'shocking_pink_crayola',
  '#FF7300': 'philippine_orange',
  '#FF7518': 'pumpkin',
  '#FF7538': 'papaya',
  '#FF77FF': 'fuchsia_pink',
  '#FF7800': 'safety_orange',
  '#FF7952': 'rinsed_out_red',
  '#FF7A00': 'heat_wave',
  '#FF7E00': 'amber_saeece',
  '#FF7F00': 'orange_color_wheel',
  '#FF7F50': 'coral',
  '#FF80FF': 'light_magenta',
  '#FF8243': 'mango_tango',
  '#FF85CF': 'princess_perfume',
  '#FF878D': 'tulip',
  '#FF8936': 'daylily',
  '#FF8B00': 'american_orange',
  '#FF8C00': 'darkorange',
  '#FF9505': 'yellow_orange_wheel',
  '#FF968A': 'light_coral',
  '#FF9899': 'american_pink',
  '#FF9900': 'vivid_gamboge',
  '#FF9933': 'deep_saffron',
  '#FF9966': 'atomic_tangerine',
  '#FF9999': 'light_salmon_pink',
  '#FF99CC': 'pale_magenta_pink',
  '#FF99FF': 'bubblegum',
  '#FF9A00': 'weebly_orange',
  '#FF9AA2': 'soft_coral',
  '#FF9F00': 'orange_peel',
  '#FF9F1C': 'vibrant_orange',
  '#FFA000': 'vivid_orange_peel',
  '#FFA07A': 'lightsalmon',
  '#FFA089': 'vivid_tangerine',
  '#FFA26B': 'stylish_persimmon',
  '#FFA343': 'neon_carrot',
  '#FFA400': 'dark_golden_yellow',
  '#FFA500': 'ora_orange',
  '#FFA565': 'pale_incense_usuko',
  '#FFA600': 'cheese',
  '#FFA631': 'egg',
  '#FFA700': 'chrome_yellow',
  '#FFA812': 'dark_tangerine',
  '#FFAA1D': 'bright_yellow_crayola',
  '#FFAE42': 'yellow_orange',
  '#FFB077': 'very_light_tangelo',
  '#FFB200': 'chinese_yellow',
  '#FFB300': 'ucla_gold',
  '#FFB347': 'pastel_orange',
  '#FFB3A7': 'washed_out_crimson',
  '#FFB3DE': 'light_hot_pink',
  '#FFB61E': 'gamboge_bright',
  '#FFB6C1': 'lightpink',
  '#FFB7B2': 'light_blush',
  '#FFB94E': 'floral_leaf',
  '#FFB95A': 'cape_jasmine',
  '#FFBA00': 'selective_yellow',
  '#FFBD88': 'macaroni_and_cheese',
  '#FFBE0B': 'bright_yellow_orange',
  '#FFBF00': 'amber',
  '#FFC0CB': 'pink',
  '#FFC324': 'ripe_mango',
  '#FFC34D': 'chickadee',
  '#FFC40C': 'mikado_yellow',
  '#FFC87C': 'topaz',
  '#FFC922': 'sunset_yellow',
  '#FFCBA4': 'deep_peach',
  '#FFCC00': 'tangerine_yellow',
  '#FFCC33': 'sunglow',
  '#FFCC66': 'light_orange',
  '#FFCC99': 'peach_orange',
  '#FFCCCB': 'light_red',
  '#FFCCCC': 'pale_pink',
  '#FFCCFF': 'rosa',
  '#FFCE44': 'google_chrome_yellow',
  '#FFCFF1': 'shampoo',
  '#FFD166': 'vibrant_sunny_yellow',
  '#FFD1DC': 'pale_blush_pink',
  '#FFD300': 'cyber_yellow',
  '#FFD32D': 'vibrant_bright_yellow',
  '#FFD59A': 'caramel_creme',
  '#FFD662': 'banana',
  '#FFD700': 'golden',
  '#FFD800': 'school_bus_yellow',
  '#FFD8B1': 'peach',
  '#FFDAB9': 'peachpuff',
  '#FFDAC1': 'peach_puff',
  '#FFDB00': 'sizzling_sunrise',
  '#FFDB58': 'mustard',
  '#FFDD05': 'sprint_yellow',
  '#FFDDCA': 'unbleached_silk',
  '#FFDDF4': 'pink_lace',
  '#FFDEAD': 'navajowhite',
  '#FFDF00': 'golden_yellow',
  '#FFDF46': 'gargoyle_gas',
  '#FFDFBF': 'very_pale_orange',
  '#FFE119': 'sunshine_yellow',
  '#FFE135': 'banana_yellow',
  '#FFE302': 'vivid_yellow',
  '#FFE4B5': 'moccasin',
  '#FFE4C4': 'bisque',
  '#FFE4CD': 'lumber',
  '#FFE4E1': 'mistyrose',
  '#FFE5B4': 'pale_peach',
  '#FFE670': 'shandy',
  '#FFE9D1': 'flesh',
  '#FFEB00': 'middle_yellow',
  '#FFEBCD': 'blanchedalmond',
  '#FFEF00': 'canary_yellow',
  '#FFEFD5': 'papayawhip',
  '#FFF000': 'yellow_rose',
  '#FFF0F5': 'lavenderblush',
  '#FFF44F': 'lemon_yellow',
  '#FFF5EE': 'seashell',
  '#FFF600': 'cadmium_yellow',
  '#FFF620': 'buttercup_yellow',
  '#FFF700': 'lemon',
  '#FFF8DC': 'cornsilk',
  '#FFF8E7': 'cosmic_latte',
  '#FFFACD': 'lemonchiffon',
  '#FFFAF0': 'floralwhite',
  '#FFFAFA': 'snow',
  '#FFFDD0': 'cream',
  '#FFFF00': 'yellow',
  '#FFFF31': 'daffodil',
  '#FFFF33': 'electric_yellow',
  '#FFFF66': 'laser_lemon',
  '#FFFF99': 'canary',
  '#FFFF9F': 'lemon_yellow_crayola',
  '#FFFFBF': 'very_pale_yellow',
  '#FFFFCC': 'conditioner',
  '#FFFFE0': 'lightyellow',
  '#FFFFF0': 'ivory',
  '#FFFFFF': 'white'
};
// inverted dicolorFlatNames (name -> hex; last hex wins on duplicate names, 1696 unique names)
const dicolorByName = {
  'absolute_zero': '#0048BA',
  'acajou': '#4C2F27',
  'acid_green': '#B0BF1A',
  'aero': '#7CB9E8',
  'aero_blue': '#C9FFE5',
  'african_violet': '#B284BE',
  'air_force_blue': '#5D8AA8',
  'air_force_blue_usaf': '#00308F',
  'air_superiority_blue': '#72A0C1',
  'airforce_greyblue': '#577590',
  'alabaster': '#F2F0E6',
  'aliceblue': '#F0F8FF',
  'alloy_orange': '#C46210',
  'almond': '#EFDECD',
  'aloeswood_brown': '#5A6457',
  'aloewood': '#6A432D',
  'aluminum_foil': '#D2D9DB',
  'amaranth_deep_purple': '#9F2B68',
  'amaranth_red': '#D3212D',
  'amazon': '#3B7A57',
  'amber': '#FFBF00',
  'amber_japan': '#CA6924',
  'amber_saeece': '#FF7E00',
  'american_blue': '#3B3B6D',
  'american_bronze': '#391802',
  'american_brown': '#804040',
  'american_gold': '#D3AF37',
  'american_green': '#34B334',
  'american_orange': '#FF8B00',
  'american_pink': '#FF9899',
  'american_purple': '#431C53',
  'american_violet': '#551B8C',
  'american_yellow': '#F2B400',
  'amethyst': '#9966CC',
  'amur_cork_tree': '#F3C13A',
  'anti_flash_white': '#F2F3F4',
  'antique_brass': '#CD9575',
  'antique_bronze': '#665D1E',
  'antique_fuchsia': '#915C83',
  'antiquewhite': '#FAEBD7',
  'ao_english': '#008000',
  'apple': '#66B447',
  'apple_green': '#AFFF45',
  'apricot': '#FBCEB1',
  'aqua': '#00FFFF',
  'aqua_blue': '#86ABA5',
  'aquagreen': '#00FFCC',
  'aquamarine': '#7FFFD4',
  'arctic_lime': '#D0FF14',
  'army_green': '#4B5320',
  'artichoke': '#8F9779',
  'arylide_yellow': '#E9D66B',
  'asda_green': '#7DC242',
  'asda_green_1985': '#00DEA4',
  'asda_green_1994': '#80C197',
  'asda_green_1999': '#66C992',
  'asda_green_2002': '#32AD61',
  'asda_orange': '#C86500',
  'asda_orange_1968': '#CA7309',
  'ash_gray': '#B2BEB5',
  'asparagus': '#87A96B',
  'ateneo_blue': '#003A6C',
  'atomic_tangerine': '#FF9966',
  'aubergine': '#462255',
  'auburn': '#A52A2A',
  'aureolin': '#FDEE00',
  'aurometalsaurus': '#6E7F80',
  'avocado': '#568203',
  'axolotl': '#63775B',
  'azure': '#007FFF',
  'azure_mist': '#F0FFFF',
  'azureish_white': '#DBE9F4',
  'baby_blue': '#89CFF0',
  'baby_blue_eyes': '#A1CAF1',
  'baby_pink': '#F4C2C2',
  'baby_powder': '#FEFEFA',
  'baiko_brown': '#857C55',
  'ball_blue': '#21ABCD',
  'banana': '#FFD662',
  'banana_mania': '#FAE7B5',
  'banana_yellow': '#FFE135',
  'bangladesh_green': '#006A4E',
  'barbie_pink': '#E94196',
  'barbie_pink_1975': '#D3419D',
  'barbie_pink_1999': '#F7238A',
  'barbie_pink_pantone': '#E0218A',
  'barn_red': '#7C0A02',
  'battery_charged_blue': '#1DACD6',
  'battleship_grey': '#848482',
  'bayside': '#5FC9BF',
  'bdazzled_blue': '#2E5894',
  'beau_blue': '#BCD4E6',
  'beaver': '#9F8170',
  'beer': '#F28E1C',
  'begonia': '#FA6E79',
  'beige': '#F5F5DC',
  'beige_grey': '#DFCFBE',
  'bellflower': '#5D3F6A',
  'berry_pink': '#C3447A',
  'betel_nut': '#352925',
  'big_foot_feet': '#E88E5A',
  'birch_brown_kabacha': '#B14A30',
  'bisque': '#FFE4C4',
  'bistre': '#3D2B1F',
  'bistre_brown': '#967117',
  'bitter_lemon': '#CAE00D',
  'bitter_lime': '#BFFF00',
  'bittersweet': '#FE6F5E',
  'bittersweet_shimmer': '#BF4F51',
  'black': '#000000',
  'black_bean': '#3D0C02',
  'black_chestnut': '#252321',
  'black_chocolate': '#1B1811',
  'black_coffee': '#3B2F2F',
  'black_coral': '#54626F',
  'black_kite': '#351E1C',
  'black_kokushoku': '#171412',
  'black_leather_jacket': '#253529',
  'black_olive': '#3B3C36',
  'blackcurrant': '#230C33',
  'blanchedalmond': '#FFEBCD',
  'blast_off_bronze': '#A57164',
  'bleach': '#66FFFF',
  'bleu_de_france': '#318CE7',
  'blizzard_blue': '#ACE5EE',
  'blond': '#FAF0BE',
  'blood': '#A41313',
  'blood1': '#8A0303',
  'blood_organ': '#630F0F',
  'blood_red': '#F35336',
  'blood_red1': '#660000',
  'blue': '#0047AB',
  'blue_bell': '#A2A2D0',
  'blue_black': '#0B132B',
  'blue_black_crayfish': '#52593B',
  'blue_bolt': '#00B9FB',
  'blue_cola': '#0088DC',
  'blue_crayola': '#1F75FE',
  'blue_gray': '#6699CC',
  'blue_green': '#0D98BA',
  'blue_green_seiheki': '#3A6960',
  'blue_jeans': '#5DADEC',
  'blue_lagoon': '#4CB7A5',
  'blue_lavender': '#5B5EA6',
  'blue_lilac': '#9F00FF',
  'blue_magenta_violet': '#553592',
  'blue_munsell': '#0093AF',
  'blue_ncs': '#0087BD',
  'blue_pantone': '#0018A8',
  'blue_pigment': '#333399',
  'blue_purple': '#6B5B95',
  'blue_raspberry': '#0CBFE9',
  'blue_ryb': '#0247FE',
  'blue_sapphire': '#126180',
  'blue_violet': '#2B2028',
  'blue_violet_color_wheel': '#4D1A7F',
  'blue_violet_crayola': '#7366BD',
  'blue_yonder': '#5072A7',
  'blueberry': '#4F86F7',
  'bluebonnet': '#1C1CF0',
  'bluegreen': '#064E40',
  'blueviolet': '#8A2BE2',
  'blush': '#D65076',
  'boiled_red_bean_brown': '#542D24',
  'bole': '#79443B',
  'bondi_blue': '#0095B6',
  'bone': '#E3DAC9',
  'bored_accent_green': '#DDE26A',
  'boy_red': '#0E9CA5',
  'boysenberry': '#873260',
  'brandeis_blue': '#0070FF',
  'brandy': '#87413F',
  'brass': '#B5A642',
  'brass_yellow': '#83781B',
  'brave_orange': '#FF631C',
  'brewed_mustard_brown': '#E68364',
  'bright_aqua': '#00F5D4',
  'bright_blue': '#0033CC',
  'bright_gray': '#EBECF0',
  'bright_green': '#66FF00',
  'bright_lavender': '#BF94E4',
  'bright_lilac': '#D891EF',
  'bright_navy': '#000080',
  'bright_navy_blue': '#1974D2',
  'bright_orange_red': '#FB5607',
  'bright_orchid': '#CC33FF',
  'bright_pink': '#FF007F',
  'bright_purple': '#6A0DAD',
  'bright_sky_blue': '#00BBF9',
  'bright_turquoise': '#08E8DE',
  'bright_ube': '#D19FE8',
  'bright_violet': '#9900FF',
  'bright_yellow': '#FCCC1A',
  'bright_yellow_crayola': '#FFAA1D',
  'bright_yellow_orange': '#FFBE0B',
  'brilliant_azure': '#3399FF',
  'brilliant_blue': '#0066FF',
  'brilliant_lavender': '#F4BBFF',
  'british_racing_green': '#004225',
  'bronze': '#CD7F32',
  'bronze1': '#88540B',
  'bronze_metallic': '#B08D57',
  'bronze_yellow': '#737000',
  'brown': '#993300',
  'brown_coffee': '#4A2C2A',
  'brown_crayola': '#AF593E',
  'brown_nose': '#6B4423',
  'brown_rat_grey': '#4B3C39',
  'brown_sugar': '#AF6E4D',
  'brown_traditional': '#964B00',
  'brown_yellow': '#CC9966',
  'brunswick_green': '#1B4D3E',
  'brushwood_dyed_fushizome': '#8C5939',
  'bubblegum': '#FF99FF',
  'bubbles': '#E7FEFF',
  'bud_green': '#7BB661',
  'buff': '#F0DC82',
  'bulgarian_rose': '#480607',
  'burgundy_velvet': '#450920',
  'burlywood': '#DEB887',
  'burnished_brown': '#A17A74',
  'burnt_orange': '#CC5500',
  'burnt_sienna': '#E97451',
  'burnt_umber': '#8A3324',
  'buttercup_yellow': '#FFF620',
  'button_blue': '#24A0ED',
  'byzantine': '#BD33A4',
  'byzantium': '#702963',
  'cadet': '#536872',
  'cadet_blue_crayola': '#A9B2C3',
  'cadet_grey': '#91A3B0',
  'cadetblue': '#5F9EA0',
  'cadmium_blue': '#0A1195',
  'cadmium_green': '#006B3C',
  'cadmium_orange': '#ED872D',
  'cadmium_violet': '#7F3E98',
  'cadmium_yellow': '#FFF600',
  'cafe_au_lait': '#A67B5B',
  'cafe_noir': '#4B3621',
  'calamansi': '#FCFFA4',
  'cambridge_blue': '#A3C1AD',
  'camel': '#C19A6B',
  'camouflage_green': '#78866B',
  'canary': '#FFFF99',
  'canary_yellow': '#FFEF00',
  'candy_apple_red': '#FF0800',
  'candy_pink': '#E4717A',
  'cape_jasmine': '#FFB95A',
  'capri': '#00BFFF',
  'caput_mortuum': '#592720',
  'caramel': '#C68E17',
  'caramel_creme': '#FFD59A',
  'caribbean_blue': '#1AC1DD',
  'caribbean_green': '#00CC99',
  'carmine': '#9B2335',
  'carmine_pink': '#EB4C42',
  'carnelian': '#B31B1B',
  'carolina_blue': '#56A0D3',
  'carrot': '#CC3300',
  'carrot_orange': '#ED9121',
  'castleton_green': '#00563F',
  'catalina_blue': '#062A78',
  'cattail_color': '#B64925',
  'cedar_chest': '#C95A49',
  'ceil': '#92A1CF',
  'celadon': '#ACE1AF',
  'celadon_blue': '#007BA7',
  'celadon_green': '#2F847C',
  'celadon_seiji': '#819C8B',
  'celeste': '#B2FFFF',
  'celestial_blue': '#4997D0',
  'celtic_blue': '#246BCE',
  'cerulean_blue': '#2A52BE',
  'cerulean_frost': '#6D9BC3',
  'cetacean_blue': '#001440',
  'cg_blue': '#007AA5',
  'cg_red': '#E03C31',
  'chamoisee': '#A0785A',
  'champagne': '#F7E7CE',
  'champagne_pink': '#F1DDCF',
  'charcoal': '#36454F',
  'charleston_green': '#232B2B',
  'chartreuse': '#7FFF00',
  'chartreuse_traditional': '#DFFF00',
  'cheese': '#FFA600',
  'cherry_blossom': '#FCC9B9',
  'cherry_blossom_mouse': '#AC8181',
  'chestnut': '#954535',
  'chestnut_leather_brown': '#60281E',
  'chickadee': '#FFC34D',
  'child_banana': '#FDDB3A',
  'child_mint': '#B5EAD7',
  'child_purple': '#A23BEC',
  'chili_red': '#FF2400',
  'chinese_blue': '#365194',
  'chinese_bronze': '#CD8032',
  'chinese_brown': '#AB381F',
  'chinese_gold': '#CC9900',
  'chinese_green': '#D0DB61',
  'chinese_orange': '#F37042',
  'chinese_purple': '#720B98',
  'chinese_red': '#AA381E',
  'chinese_violet': '#856088',
  'chinese_white': '#E2E5DE',
  'chinese_yellow': '#FFB200',
  'chinese_yellow_tea': '#B7702D',
  'chlorophyll_green': '#4AFF00',
  'chocolate_traditional': '#7B3F00',
  'chrome_aluminum': '#A8A9AD',
  'chrome_yellow': '#FFA700',
  'cinereous': '#98817B',
  'cinnabar': '#E34234',
  'cinnamon': '#D2691E',
  'citrine': '#E4D00A',
  'citrine_brown': '#933709',
  'citron': '#9FA91F',
  'claret_red': '#650D1B',
  'classic_orange': '#FF6600',
  'classic_rose': '#FBCCE7',
  'clove_brown': '#8F583C',
  'clove_dyed_chojizome': '#A96232',
  'coarse_wool': '#181B26',
  'cobalt_blue': '#4363D8',
  'coconut': '#965A3E',
  'coconut_white': '#E9EDF6',
  'codium_fragile_seaweed': '#524B2A',
  'coffee': '#6F4E37',
  'cola': '#3C3024',
  'color_of_an_undried_wall': '#785E49',
  'columbia_blue': '#C4D8E2',
  'conditioner': '#FFFFCC',
  'congo_pink': '#F88379',
  'contemplation': '#665343',
  'cookies_and_cream': '#EEE0B1',
  'cool_black': '#002E63',
  'cool_grey': '#8C92AC',
  'copper': '#DA8A67',
  'copper_brown': '#A65F46',
  'copper_penny': '#AD6F69',
  'copper_red': '#CB6D51',
  'copper_rose': '#996666',
  'coquelicot': '#FF3800',
  'coral': '#FF7F50',
  'coral_color': '#F8674F',
  'coral_red': '#FF4040',
  'coral_reef': '#F6A494',
  'coral_reef1': '#FD7C6E',
  'corn': '#FBEC5D',
  'corn_japan': '#FAA945',
  'cornflower': '#93CCEA',
  'cornflowerblue': '#6495ED',
  'cornsilk': '#FFF8DC',
  'cosmic_cobalt': '#2E2D88',
  'cosmic_latte': '#FFF8E7',
  'coyote_brown': '#81613C',
  'cream': '#FFFDD0',
  'crimson': '#DC143C',
  'crimson_red': '#990000',
  'crystal': '#A7D8DE',
  'crystal_blue': '#68A0B0',
  'cyan_azure': '#4E82B4',
  'cyan_blue_azure': '#4682BF',
  'cyan_cobalt_blue': '#28589C',
  'cyan_cornflower_blue': '#188BC2',
  'cyan_process': '#00B7EB',
  'cyber_grape': '#58427C',
  'cyber_yellow': '#FFD300',
  'cypress_bark_color': '#752E23',
  'cypress_bark_red': '#6F3028',
  'daffodil': '#FFFF31',
  'dandelion': '#F0E130',
  'dandelion_crayola': '#FDDB6D',
  'dark_blue': '#000099',
  'dark_blue_kon': '#192236',
  'dark_blue_lapis_lazuli': '#1B294B',
  'dark_bronze': '#804A00',
  'dark_bronze_coin': '#514100',
  'dark_brown': '#5E3D26',
  'dark_brown_tangelo': '#88654E',
  'dark_byzantium': '#5D3954',
  'dark_candy_apple_red': '#A40000',
  'dark_cerulean': '#08457E',
  'dark_chestnut': '#986960',
  'dark_chocolate': '#490206',
  'dark_copper': '#B87333',
  'dark_coral': '#CD5B45',
  'dark_cornflower_blue': '#26428B',
  'dark_crimson': '#990033',
  'dark_cyan': '#004346',
  'dark_cyan_blue': '#08415C',
  'dark_electric_blue': '#536878',
  'dark_gold': '#AA6C39',
  'dark_golden_yellow': '#FFA400',
  'dark_gray': '#353535',
  'dark_green': '#003300',
  'dark_green_x11': '#006400',
  'dark_gunmetal': '#1F262A',
  'dark_imperial_blue': '#00147E',
  'dark_imperial_blue_green': '#00416A',
  'dark_indigo': '#614E6E',
  'dark_international_orange': '#C0362C',
  'dark_jungle_green': '#1A2421',
  'dark_lava': '#483C32',
  'dark_lavender': '#3F3351',
  'dark_lavenderblue': '#666699',
  'dark_lemon_lime': '#8BBE1B',
  'dark_lilac': '#734F96',
  'dark_lime': '#00CC00',
  'dark_liver': '#534B4F',
  'dark_liver_horses': '#543D37',
  'dark_magenta': '#993399',
  'dark_maroon': '#540B0E',
  'dark_mauve': '#993366',
  'dark_midnight_blue': '#003366',
  'dark_moss_green': '#4A5D23',
  'dark_navy': '#02075D',
  'dark_ochre': '#BE7F51',
  'dark_olive': '#283618',
  'dark_olive_drab': '#3C341F',
  'dark_olive_green': '#666633',
  'dark_pastel_green': '#03C03C',
  'dark_pastel_purple': '#966FD6',
  'dark_pastel_red': '#C23B22',
  'dark_powder_blue': '#003399',
  'dark_purple': '#7209B7',
  'dark_raspberry': '#872657',
  'dark_red': '#660033',
  'dark_red_kurobeni': '#23191E',
  'dark_red_violet': '#990099',
  'dark_salmon': '#FF6666',
  'dark_sienna': '#3C1414',
  'dark_silver': '#71706E',
  'dark_sky_blue': '#8CBED6',
  'dark_slate_blue': '#336699',
  'dark_spring_green': '#177245',
  'dark_tan': '#918151',
  'dark_tangerine': '#FFA812',
  'dark_taupe': '#423629',
  'dark_teal': '#073B4C',
  'dark_turquoise': '#55B4B0',
  'dark_vanilla': '#D1BEA8',
  'dark_violet': '#9900CC',
  'dark_yellow': '#9B870C',
  'darkblue': '#00008B',
  'darkbrown': '#663300',
  'darkcyan': '#008B8B',
  'darkgoldenrod': '#B8860B',
  'darkgray': '#A9A9A9',
  'darkkhaki': '#BDB76B',
  'darkmagenta': '#8B008B',
  'darkolivegreen': '#556B2F',
  'darkorange': '#FF8C00',
  'darkorchid': '#9932CC',
  'darkpurple': '#301934',
  'darkred': '#8B0000',
  'darksalmon': '#E9967A',
  'darkseagreen': '#8FBC8F',
  'darkslateblue': '#483D8B',
  'darkslategray': '#2F4F4F',
  'darkturquoise': '#00CED1',
  'darkviolet': '#9400D3',
  'dartmouth_green': '#00703C',
  'dawn_color': '#FA7B62',
  'daylily': '#FF8936',
  'decaying_leaves': '#D57835',
  'deep_amethyst': '#9C8AA4',
  'deep_apple_green': '#8DB600',
  'deep_aquamarine': '#40826D',
  'deep_blue': '#000075',
  'deep_carmine_pink': '#EF3038',
  'deep_carrot_orange': '#E9692C',
  'deep_cerise': '#DA3287',
  'deep_champagne': '#FAD6A5',
  'deep_chestnut': '#B94E48',
  'deep_coffee': '#704241',
  'deep_cyan': '#005F73',
  'deep_dumpling': '#9B351B',
  'deep_fuchsia': '#C154C1',
  'deep_green': '#056608',
  'deep_green_cyan': '#0E7C61',
  'deep_indigo': '#3C1874',
  'deep_jungle_green': '#004B49',
  'deep_koamaru': '#333366',
  'deep_lemon': '#F5C71A',
  'deep_lilac': '#9955BB',
  'deep_magenta': '#CC00CC',
  'deep_maroon': '#820000',
  'deep_mauve': '#D473D4',
  'deep_moss_green': '#355E3B',
  'deep_orange': '#F3722C',
  'deep_peach': '#FFCBA4',
  'deep_pink': '#FF3399',
  'deep_purple': '#6600CC',
  'deep_raspberry': '#E6194B',
  'deep_red': '#850101',
  'deep_saffron': '#FF9933',
  'deep_scarlet': '#7B3B3A',
  'deep_sky_blue': '#0099CC',
  'deep_space_sparkle': '#4A646C',
  'deep_taupe': '#7E5E60',
  'deep_violet': '#330066',
  'deeppink': '#FF1493',
  'deeppurple': '#3A243B',
  'deepviolet': '#6622CC',
  'deer': '#BA8759',
  'delicate_girl_blue': '#6AB2CA',
  'denim': '#1560BD',
  'denim_blue': '#2243B6',
  'desaturated_cyan': '#669999',
  'desert_sand': '#EDC9AF',
  'diamond': '#B9F2FF',
  'dimgray': '#696969',
  'dirt': '#9B7653',
  'dirty_brown': '#B5651E',
  'dirty_white': '#E8E4C9',
  'disappearing_purple': '#3F313A',
  'dodger_blue': '#0066CC',
  'dodgerblue': '#1E90FF',
  'dodie_yellow': '#FEF65B',
  'dollar_bill': '#85BB65',
  'dolphin_gray': '#828E84',
  'douban_blue': '#2496CD',
  'douban_green': '#2E963D',
  'douban_light_yellow': '#F7C58E',
  'dove_feather_grey': '#755D5B',
  'duke_blue': '#00009C',
  'dull_blue_aonibi': '#4F4944',
  'durian': '#B07939',
  'durian_white': '#E6D0AB',
  'durian_yellow': '#E1BD27',
  'dust_storm': '#E5CCC9',
  'dutch_white': '#EFDFBB',
  'dyestalk_red': '#913225',
  'earth_yellow': '#E1A95F',
  'earthtone': '#5D3A1A',
  'ebony': '#555D50',
  'ecru': '#C2B280',
  'eerie_black': '#101820',
  'egg': '#FFA631',
  'eggplant': '#614051',
  'eggshell': '#F0EAD6',
  'eggshell_paper': '#E2BE9F',
  'egyptian_blue': '#1034A6',
  'elderberry': '#17182B',
  'electric_blue': '#3333FF',
  'electric_brown': '#B56257',
  'electric_green': '#00FF00',
  'electric_indigo': '#6F00FF',
  'electric_lilac': '#9933FF',
  'electric_lime': '#CCFF00',
  'electric_orange': '#FF3503',
  'electric_purple': '#BF00FF',
  'electric_red': '#E60000',
  'electric_sky': '#7DF9FF',
  'electric_ultramarine': '#3F00FF',
  'electric_violet': '#8F00FF',
  'electric_yellow': '#FFFF33',
  'emerald': '#013220',
  'emerald_green': '#046307',
  'eminence': '#6C3082',
  'english_red': '#AB4B52',
  'english_vermillion': '#CC474B',
  'english_violet': '#563C5C',
  'eton_blue': '#96C8A2',
  'eucalyptus': '#44D7A8',
  'facebook_blue': '#39569C',
  'faded_rikyus_tea': '#B0927A',
  'faded_spicy_red_brown': '#9B533F',
  'falu_red': '#801818',
  'fandango': '#B53389',
  'fashion_fuchsia': '#F400A1',
  'fawn': '#E5AA70',
  'feldgrau': '#4D5D53',
  'feldspar': '#FDD5B1',
  'fern_green': '#4F7942',
  'ferrari_red': '#FF2800',
  'field_drab': '#6C541E',
  'finch_brown': '#957B38',
  'fire_engine_red': '#CE2029',
  'fire_opal': '#E95C4B',
  'firebrick': '#B22222',
  'flame': '#E25822',
  'flavescent': '#F7E98E',
  'flax': '#EEDC82',
  'flesh': '#FFE9D1',
  'flickr_blue': '#216BD6',
  'flickr_pink': '#FB0081',
  'flirt': '#A2006D',
  'flirtatious_indigo_tea': '#473F2D',
  'floral_leaf': '#FFB94E',
  'floralwhite': '#FFFAF0',
  'fluorescent_blue': '#15F4EE',
  'forest_green': '#339933',
  'forest_green_crayola': '#5FA777',
  'forest_green_traditional': '#014421',
  'forestgreen': '#228B22',
  'fox': '#985629',
  'french_bistre': '#856D4D',
  'french_blue': '#0072BB',
  'french_lilac': '#86608E',
  'french_lime': '#9EFD38',
  'french_plum': '#811453',
  'french_puce': '#4E1609',
  'french_sky_blue': '#77B5FE',
  'french_violet': '#8806CE',
  'fresh_air': '#A6E7FF',
  'fresh_onion_moegi': '#5B8930',
  'frostbite': '#E936A7',
  'fuchsia': '#FF00FF',
  'fuchsia_pink': '#FF77FF',
  'fulvous': '#E48400',
  'fuzzy_wuzzy': '#CC6666',
  'gainsboro': '#DCDCDC',
  'gamboge': '#E49B0F',
  'gamboge_bright': '#FFB61E',
  'gamboge_orange_brown': '#996600',
  'gargoyle_gas': '#FFDF46',
  'garnet': '#733635',
  'generic_viridian': '#007F66',
  'ghostwhite': '#F8F8FF',
  'giants_club': '#B05C52',
  'giants_orange': '#FE5A1D',
  'gin': '#D8E4BC',
  'glaucous': '#6082B6',
  'glazed_persimmon': '#D34E36',
  'glossy_grape': '#AB92B3',
  'go_green': '#00AB66',
  'gold': '#A57C00',
  'gold_brown_yamabukicha': '#CB7E1F',
  'gold_crayola': '#E6BE8A',
  'gold_foil': '#BD9B16',
  'gold_fusion': '#85754E',
  'gold_metallic': '#D4AF37',
  'golden': '#FFD700',
  'golden_brown': '#996515',
  'golden_fallen_leaves': '#E29C45',
  'golden_grey_bamboo': '#7D4E2D',
  'golden_oak': '#BB8141',
  'golden_poppy': '#FCC200',
  'golden_yellow': '#FFDF00',
  'goldenrod': '#EFC050',
  'google_chrome_blue': '#4C8BF5',
  'google_chrome_green': '#1AA260',
  'google_chrome_red': '#DE5246',
  'google_chrome_yellow': '#FFCE44',
  'goryeo_storeroom': '#203838',
  'granny_smith_apple': '#A8E4A0',
  'grape': '#6F2DA8',
  'gray': '#808080',
  'gray_asparagus': '#465945',
  'green': '#008001',
  'green_bamboo': '#006442',
  'green_blue': '#1164B4',
  'green_blue_crayola': '#2887C8',
  'green_cola': '#4C721D',
  'green_crayola': '#1CAC78',
  'green_cyan': '#009966',
  'green_lizard': '#A7F432',
  'green_midori': '#2A603B',
  'green_munsell': '#00A877',
  'green_ncs': '#009F6B',
  'green_pantone': '#00AD43',
  'green_pigment': '#00A550',
  'green_ryb': '#66B032',
  'green_sheen': '#6EAEA1',
  'green_slime': '#65FF00',
  'green_tea': '#824B35',
  'green_yellow_crayola': '#F0E891',
  'greenblue': '#003153',
  'greenfinch': '#BDA928',
  'greengrey': '#264653',
  'greenyellow': '#ADFF2F',
  'greyed_red': '#BC2D29',
  'greyish_dark_green': '#656255',
  'grullo': '#A99A86',
  'guacamole': '#88B04B',
  'gun_grey': '#2B2D42',
  'gunmetal': '#2A3439',
  'guppie_green': '#00FF7F',
  'halaya_pink': '#663854',
  'half_hashita': '#8D608C',
  'halloween_orange': '#EB6123',
  'han_blue': '#446CCF',
  'han_purple': '#5218FA',
  'harbor_rat': '#757D75',
  'harlequin': '#3FFF00',
  'harlequin_green': '#46CB18',
  'harvest_gold': '#DA9100',
  'hawaii_blue': '#00C3E3',
  'heart_gold': '#808000',
  'heat_wave': '#FF7A00',
  'heliotrope': '#DF73FF',
  'heliotrope_gray': '#AA98A9',
  'heliotrope_magenta': '#AA00BB',
  'honeydew': '#F0FFF0',
  'honolulu_blue': '#006DB0',
  'hookers_green': '#49796B',
  'horsetail': '#3D5D42',
  'hot_magenta': '#FF1DCE',
  'hot_pink': '#FF0066',
  'hotpink': '#FF69B4',
  'huawei_red': '#ED1C24',
  'ibis_wing_color': '#F58F84',
  'iceberg': '#71A6D2',
  'iced_tea': '#923C01',
  'icterine': '#FCF75E',
  'iguana_green': '#71BC78',
  'illuminating_emerald': '#319177',
  'imperial': '#602F6B',
  'imperial_blue': '#002395',
  'imperial_purple': '#66023C',
  'inchworm': '#B2EC5D',
  'independence': '#4C516D',
  'independence2': '#4A4E69',
  'india_green': '#138808',
  'indian_red': '#993333',
  'indian_yellow': '#E3A857',
  'indianred': '#CD5C5C',
  'indigo': '#4B0082',
  'indigo_codium': '#2E372E',
  'indigo_dye': '#091F92',
  'indigo_ink_brown': '#393432',
  'indigo_rainbow': '#233067',
  'indigo_sky': '#3333CC',
  'indigo_white': '#EBF6F7',
  'ink_color_sumi_iro': '#27221F',
  'insect_screen': '#2D4436',
  'inside_of_a_bottle': '#C6C2B6',
  'interdimensional_blue': '#360CCC',
  'international_orange': '#FF4F00',
  'international_orange1': '#BA160C',
  'iris': '#5A4FCF',
  'iris_purple': '#763568',
  'iron': '#A19D94',
  'iron_head_flower': '#344D56',
  'iron_storage': '#2B3736',
  'iron_tetsu': '#2B3733',
  'isabelline': '#F4F0EC',
  'islamic_green': '#009000',
  'italian_ice': '#E9F6EF',
  'italian_leather': '#635A52',
  'italian_roast': '#906652',
  'ivory': '#FFFFF0',
  'iwai_brown_iwaicha': '#5E5545',
  'jacarta': '#3D325D',
  'jacko_bean': '#413628',
  'jade': '#00A86B',
  'japanese_indigo': '#264348',
  'japanese_iris': '#7F5D3B',
  'japanese_laurel': '#2F7532',
  'japanese_triandra_grass': '#E2B13C',
  'japanese_violet': '#5B3256',
  'jasmine': '#F8DE7E',
  'jasper': '#D73B3E',
  'jasper_orange': '#DE8F4E',
  'jazzberry_jam': '#A50B5E',
  'jelly_bean': '#DA614E',
  'jelly_bean_blue': '#44798E',
  'jet_stream': '#BBD0C9',
  'jolly_red': '#CC0000',
  'jonquil': '#F4CA16',
  'jordy_blue': '#8AB9F1',
  'june_bud': '#BDDA57',
  'jungle_cyan': '#29AB87',
  'jungle_green': '#009933',
  'kelly_green': '#4CBB17',
  'kenyan_copper': '#7C1C05',
  'keppel': '#3AB09E',
  'key_lime': '#E8F48C',
  'khaki': '#8D9440',
  'kimono_storage': '#3D4C51',
  'kiwi': '#8EE53F',
  'kobe': '#882D17',
  'kobi': '#E79FC4',
  'kombu_green': '#354230',
  'ksu_purple': '#512888',
  'ku_crimson': '#E8000D',
  'kumquat': '#FB9912',
  'languid_lavender': '#D6CADD',
  'lanzones': '#E0BC5B',
  'lapis_lazuli': '#26619C',
  'lapis_lazuli_japan': '#1F4788',
  'laser_lemon': '#FFFF66',
  'laurel_green': '#A9BA9D',
  'lavender_blue': '#C7CEEA',
  'lavender_floral': '#B57EDC',
  'lavender_gray': '#C4C3D0',
  'lavender_indigo': '#9457EB',
  'lavender_magenta': '#EE82EE',
  'lavender_mist': '#E6E6FA',
  'lavender_purple': '#967BB6',
  'lavender_rose': '#FBA0E3',
  'lavenderblush': '#FFF0F5',
  'lawn_green': '#58A813',
  'lawngreen': '#7CFC00',
  'legal_dye': '#2E211B',
  'lemon': '#FFF700',
  'lemon_curry': '#CCA01D',
  'lemon_glacier': '#FDFF00',
  'lemon_iced_tea': '#BD3000',
  'lemon_lime': '#E3FF00',
  'lemon_lime_blue': '#5CFF67',
  'lemon_meringue': '#F6EABE',
  'lemon_yellow': '#FFF44F',
  'lemon_yellow_crayola': '#FFFF9F',
  'lemonchiffon': '#FFFACD',
  'lenurple': '#BA93D8',
  'liberty': '#545AA7',
  'licorice': '#1A1110',
  'light_aqua': '#66FFCC',
  'light_azure': '#66CCFF',
  'light_blue': '#48929B',
  'light_blue_flower': '#1D697C',
  'light_blue_silk': '#044F67',
  'light_blush': '#FFB7B2',
  'light_brown': '#B5651D',
  'light_chartreuse': '#99FF33',
  'light_cobalt_blue': '#88ACE0',
  'light_coral': '#FF968A',
  'light_cyan': '#7FCDCD',
  'light_deep_pink': '#FF5CCD',
  'light_emerald': '#48BF84',
  'light_french_beige': '#C8AD7F',
  'light_fuchsia_pink': '#F984EF',
  'light_gold': '#B29700',
  'light_golden_brown': '#C66B27',
  'light_grayish_magenta': '#CC99CC',
  'light_green': '#33CC33',
  'light_hot_pink': '#FFB3DE',
  'light_khaki': '#F0E68C',
  'light_lime': '#99FF66',
  'light_lime_green': '#CCFF33',
  'light_magenta': '#FF80FF',
  'light_medium_orchid': '#D39BCB',
  'light_moss_green': '#ADDFAD',
  'light_olive_green': '#90BE6D',
  'light_orange': '#FFCC66',
  'light_orchid': '#E6A8D7',
  'light_pastel_purple': '#B19CD9',
  'light_periwinkle': '#C5CBE1',
  'light_pink': '#F7CAC9',
  'light_red': '#FFCCCB',
  'light_red_violet': '#FF6699',
  'light_royal_blue': '#6699FF',
  'light_salmon_pink': '#FF9999',
  'light_sky_blue': '#33CCFF',
  'light_taupe': '#B38B6D',
  'light_teal': '#469990',
  'light_yellow_asagi': '#F7BB7D',
  'lightblue': '#ADD8E6',
  'lightcoral': '#F08080',
  'lightcyan': '#E0FFFF',
  'lightgoldenrodyellow': '#FAFAD2',
  'lightgray': '#D3D3D3',
  'lightgreen': '#90EE90',
  'lightpink': '#FFB6C1',
  'lightsalmon': '#FFA07A',
  'lightseagreen': '#20B2AA',
  'lightskyblue': '#87CEFA',
  'lightslategray': '#778899',
  'lightsteelblue': '#B0C4DE',
  'lightyellow': '#FFFFE0',
  'lilac': '#C8A2C8',
  'lilac_luster': '#AE98AA',
  'lime': '#99CC00',
  'lime_green': '#B2D732',
  'lime_pulp': '#D1E189',
  'limegreen': '#32CD32',
  'limerick': '#9DC209',
  'lincoln_green': '#195905',
  'linen': '#FAF0E6',
  'linkedin_blue': '#0072B1',
  'little_boy_blue': '#6CA0DC',
  'liver': '#674C47',
  'liver_chestnut': '#987456',
  'liver_dogs': '#B86D29',
  'liver_organ': '#6C2E1F',
  'long_spring': '#B95754',
  'loquat_tree_brown': '#AB6134',
  'lotion': '#FEFDFA',
  'lotion_blue': '#15F2FD',
  'lotion_pink': '#ECCFCF',
  'lumber': '#FFE4CD',
  'lust': '#E62020',
  'lychee': '#DC5349',
  'lye': '#7F6B5D',
  'macaroni_and_cheese': '#FFBD88',
  'madder_lake': '#CC3336',
  'magenta_dye': '#CA1F7B',
  'magenta_haze': '#9F4576',
  'magenta_pink': '#CC338B',
  'magenta_process': '#FF0090',
  'magentapink': '#FF66FF',
  'magic_mint': '#AAF0D1',
  'magnolia': '#F8F4FF',
  'mahogany': '#C04000',
  'maize_crayola': '#F2C649',
  'majorelle_blue': '#6050DC',
  'malachite': '#0BDA51',
  'manatee': '#979AAA',
  'mandarin': '#F37A48',
  'mango': '#FDBE02',
  'mango_green': '#96FF00',
  'mango_tango': '#FF8243',
  'manila': '#E7C9A9',
  'mantis': '#74C365',
  'maple_syrup': '#BB9351',
  'mardi_gras': '#880085',
  'margarine': '#F2D930',
  'margarita': '#B0C24A',
  'marigold': '#EAA221',
  'maroon': '#5E2824',
  'mate_black': '#242124',
  'mauve': '#E0B0FF',
  'maximum_blue': '#47ABCC',
  'maximum_blue_green': '#30BFBF',
  'maximum_blue_purple': '#ACACE6',
  'maximum_green': '#5E8C31',
  'maximum_green_yellow': '#D9E650',
  'maximum_orange': '#FF5B00',
  'maximum_purple': '#733380',
  'maximum_red': '#D92121',
  'maximum_red_purple': '#A63A79',
  'maximum_yellow': '#FAFA37',
  'maximum_yellow_red': '#F2BA49',
  'may_green': '#4C9141',
  'maya_blue': '#73C2FB',
  'meat_brown': '#E5B73B',
  'meat_color': '#F9906F',
  'medium_aquamarine': '#66DDAA',
  'medium_blue': '#0000CC',
  'medium_brown': '#996633',
  'medium_carmine': '#AF4035',
  'medium_champagne': '#F3E5AB',
  'medium_electric_blue': '#035096',
  'medium_jungle_green': '#1C352D',
  'medium_lavender_magenta': '#DDA0DD',
  'medium_orchid': '#CC66FF',
  'medium_persian_blue': '#0067A5',
  'medium_pink': '#CC6699',
  'medium_red_violet': '#CC3399',
  'medium_sky_blue': '#80DAEB',
  'medium_slate_blue': '#836FFF',
  'medium_spring_bud': '#C9DC87',
  'medium_spring_green': '#00CC66',
  'medium_teal': '#006666',
  'medium_turquoise': '#45B8AC',
  'medium_vermilion': '#D9603B',
  'medium_violet': '#9966FF',
  'mediumaquamarine': '#66CDAA',
  'mediumblue': '#0000CD',
  'mediumorchid': '#BA55D3',
  'mediumpurple': '#9370DB',
  'mediumseagreen': '#3CB371',
  'mediumslateblue': '#7B68EE',
  'mediumspringgreen': '#00FA9A',
  'mediumturquoise': '#48D1CC',
  'mediumvioletred': '#C71585',
  'melancholy': '#FDBCB4',
  'mellow_apricot': '#F8B878',
  'melon': '#FEBAAD',
  'menthol': '#C1F9A2',
  'metallic_blue': '#32527B',
  'metallic_bronze': '#A97142',
  'metallic_brown': '#AC4313',
  'metallic_green': '#296E01',
  'metallic_orange': '#DA680F',
  'metallic_red': '#A62C2B',
  'metallic_seaweed': '#0A7E8C',
  'metallic_sunburst': '#9C7C38',
  'metallic_violet': '#5B0A91',
  'metallic_yellow': '#FDCC0D',
  'mexican_pink': '#E4007C',
  'microsoft_blue': '#00A2ED',
  'microsoft_edge_blue': '#0078D7',
  'microsoft_green': '#7DB700',
  'microsoft_red': '#F04E1F',
  'microsoft_yellow': '#FDB900',
  'middle_blue': '#7ED4E6',
  'middle_blue_green': '#8DD9CC',
  'middle_blue_purple': '#8B72BE',
  'middle_green': '#4D8C57',
  'middle_green_yellow': '#ACBF60',
  'middle_grey': '#8B8680',
  'middle_purple': '#D982B5',
  'middle_red': '#E58E73',
  'middle_red_purple': '#A55353',
  'middle_yellow': '#FFEB00',
  'middle_yellow_red': '#ECB176',
  'midnight': '#702670',
  'midnight_blue2': '#00468C',
  'midnight_green': '#004953',
  'midnight_purple': '#10002B',
  'midnightblue': '#191970',
  'mikado_yellow': '#FFC40C',
  'military_green': '#5A7247',
  'milk': '#FDFFF5',
  'milk_chocolate': '#84563C',
  'mindaro': '#E3F988',
  'ming': '#36747D',
  'minion_yellow': '#F5E050',
  'mint': '#3EB489',
  'mint_green': '#98FF98',
  'mintcream': '#F5FFFA',
  'misty_moss': '#BBB477',
  'mistyrose': '#FFE4E1',
  'moccasin': '#FFE4B5',
  'mocha': '#BEA493',
  'moonstone': '#3AA8C1',
  'moonstone_blue': '#73A9C2',
  'mordant_red_19': '#AE0C00',
  'morning_blue': '#8DA399',
  'moss_color': '#8B7D3A',
  'moss_green': '#8A9A5B',
  'mountain_meadow': '#30BA8F',
  'mountbatten_pink': '#997A8D',
  'mousy_indigo': '#5C544E',
  'mousy_wisteria': '#766980',
  'msu_green': '#18453B',
  'mud': '#70543E',
  'muddy_brown': '#CB6649',
  'mughal_green': '#306030',
  'mulberry': '#C54B8C',
  'mulberry_crayola': '#C8509B',
  'mulberry_dye': '#59292C',
  'mulberry_orange': '#C57F2E',
  'mustard': '#FFDB58',
  'mustard_brown': '#CD7A00',
  'mustard_green': '#6E6E30',
  'mustard_yellow': '#E1AD01',
  'myrtle_green': '#317873',
  'mystic_maroon': '#AD4379',
  'mystic_red': '#FF5500',
  'napier_green': '#2A8000',
  'naples_yellow': '#FADA5E',
  'navajowhite': '#FFDEAD',
  'navy': '#000066',
  'navy_blue_bellflower': '#191F45',
  'neon_blue': '#1B03A3',
  'neon_carrot': '#FFA343',
  'neon_green': '#39FF14',
  'neon_pink': '#FF006E',
  'neon_yellow': '#EFFF04',
  'new_bridge': '#006C7F',
  'new_car': '#214FC6',
  'new_york_pink': '#D7837F',
  'nickel': '#727472',
  'nightingale_brown': '#5C4827',
  'nintendo_red': '#E4000F',
  'non_photo_blue': '#A4DDED',
  'north_texas_green': '#059033',
  'nyanza': '#E9FFDB',
  'ocean_blue': '#4F42B5',
  'ocean_boat_blue': '#0077BE',
  'ocean_green': '#48BF91',
  'ochre': '#FF4E20',
  'ochre1': '#CC7722',
  'ogre_odor': '#FD5240',
  'old_bamboo': '#5E644F',
  'old_burgundy': '#43302E',
  'old_gold': '#CFB53B',
  'old_lavender': '#796878',
  'old_moss_green': '#867E36',
  'old_rose': '#C08081',
  'oldlace': '#FDF5E6',
  'olive_drab': '#669900',
  'olive_green': '#B5B35C',
  'olivedrab': '#6B8E23',
  'olivine': '#9AB973',
  'onando': '#364141',
  'one_kin': '#F08F90',
  'onyx': '#353839',
  'opal': '#A8C3BC',
  'opera_mauve': '#B784A7',
  'opposite_flower': '#4D646C',
  'ora_orange': '#FFA500',
  'orange': '#F58231',
  'orange1': '#FF5800',
  'orange_brown': '#CC6600',
  'orange_color_wheel': '#FF7F00',
  'orange_peel': '#FF9F00',
  'orange_red': '#FF681F',
  'orange_red_brown': '#FF5349',
  'orange_ryb': '#FB9902',
  'orange_soda': '#FA5B3D',
  'orange_soda1': '#EB593D',
  'orange_yellow': '#F5BD1F',
  'orange_yellow_crayola': '#F8D568',
  'orangered': '#DC3023',
  'orchid': '#DA70D6',
  'orchid_crayola': '#E29CD2',
  'orchid_pink': '#F49AC2',
  'orioles_orange': '#FB4F14',
  'ou_crimson_red': '#841617',
  'outer_space': '#414A4C',
  'outer_space_crayola': '#2D383A',
  'outrageous_orange': '#FF6E4A',
  'oxford_blue': '#002147',
  'oxley': '#6D9A79',
  'pacific_blue': '#1CA9C9',
  'painite': '#6B4947',
  'pakistan_green': '#006600',
  'palatinate_blue': '#273BE2',
  'palatinate_purple': '#682860',
  'pale_blue': '#98B4D4',
  'pale_blue_pale_turquoise': '#AFEEEE',
  'pale_blue_usuao': '#8C9C76',
  'pale_blush': '#F4B9B8',
  'pale_blush_pink': '#FFD1DC',
  'pale_brown': '#987654',
  'pale_cerulean': '#9BC4E2',
  'pale_chestnut': '#DDADAF',
  'pale_cornflower_blue': '#ABCDEF',
  'pale_cyan': '#87D3F8',
  'pale_emerald': '#50C878',
  'pale_fallen_leaves': '#AA8736',
  'pale_green': '#99FF99',
  'pale_green_onion': '#749F8D',
  'pale_incense_usuko': '#FFA565',
  'pale_lavender': '#DCD0FF',
  'pale_lilac': '#9999FF',
  'pale_magenta': '#F984E5',
  'pale_magenta_pink': '#FF99CC',
  'pale_mint': '#99FFCC',
  'pale_oak': '#BBA46D',
  'pale_olive': '#999966',
  'pale_peach': '#FFE5B4',
  'pale_persimmon': '#FCA474',
  'pale_pink': '#FFCCCC',
  'pale_purple': '#774D8E',
  'pale_purple_pantone': '#FAE6FA',
  'pale_red': '#EF476F',
  'pale_robin_egg_blue': '#96DED1',
  'pale_silver': '#C9C0BB',
  'pale_sky_blue': '#99CCFF',
  'pale_spring': '#E2F0CB',
  'pale_spring_bud': '#ECEBBD',
  'pale_tan': '#D2C29D',
  'pale_taupe': '#BC987E',
  'pale_violet': '#CC99FF',
  'pale_yellow_green': '#CCFF66',
  'pale_young_green_onion': '#8DB255',
  'palegoldenrod': '#EEE8AA',
  'palegreen': '#98FB98',
  'palelavender': '#CCCCFF',
  'palevioletred': '#DB7093',
  'palm_leaf': '#6F9940',
  'panasonic_blue': '#0040BE',
  'pansy_purple': '#78184A',
  'paolo_veronese_green': '#009B7D',
  'papaya': '#FF7538',
  'papayawhip': '#FFEFD5',
  'parakeet_blue': '#7EB6FF',
  'pastel_blue': '#AEC6CF',
  'pastel_brown': '#836953',
  'pastel_gray': '#CFCFC4',
  'pastel_green': '#77DD77',
  'pastel_orange': '#FFB347',
  'pastel_pink': '#DEA5A4',
  'pastel_purple': '#B39EB5',
  'pastel_red': '#FF6961',
  'pastel_violet': '#CB99C9',
  'pastel_yellow': '#FDFD96',
  'patina_rokusho': '#407A52',
  'patriarch': '#800080',
  'patrinia_flowers': '#D9B611',
  'peach': '#FFD8B1',
  'peach_burst': '#F39998',
  'peach_cream': '#FED8B1',
  'peach_orange': '#FFCC99',
  'peach_puff': '#FFDAC1',
  'peach_yellow': '#FADFAD',
  'peachpuff': '#FFDAB9',
  'pear': '#D1E231',
  'pearl': '#EAE0C8',
  'pearl_aqua': '#88D8C0',
  'pearly_purple': '#B768A2',
  'penguin_white': '#F5F3EF',
  'peridot': '#E6E200',
  'periwinkle': '#779ECB',
  'periwinkle_crayola': '#C3CDE6',
  'permanent_geranium_lake': '#E12C2C',
  'persian_blue': '#1C39BB',
  'persian_green': '#00A693',
  'persian_indigo': '#32127A',
  'persian_orange': '#D99058',
  'persian_pink': '#F77FBE',
  'persian_plum': '#701C1C',
  'persian_red': '#CC3333',
  'persian_rose': '#FE28A2',
  'persimmon': '#EC5800',
  'persimmon_juice_color': '#934337',
  'peru': '#CD853F',
  'pewter_blue': '#8BA8B7',
  'philippine_blue': '#0038A7',
  'philippine_bronze': '#6E3A07',
  'philippine_brown': '#5D1916',
  'philippine_gold': '#B17304',
  'philippine_green': '#008543',
  'philippine_orange': '#FF7300',
  'philippine_pink': '#FA1A8E',
  'philippine_violet': '#81007F',
  'philippine_yellow': '#FECB00',
  'phlox': '#DF00FF',
  'phthalo_blue': '#000F89',
  'phthalo_green': '#123524',
  'picton_blue': '#45B1E8',
  'pine_green': '#01796F',
  'pine_needle': '#454D32',
  'pine_tree': '#2A2F23',
  'pineapple': '#563C0D',
  'pink': '#FFC0CB',
  'pink_flamingo': '#FC74FD',
  'pink_lace': '#FFDDF4',
  'pink_lavender': '#D8B2D1',
  'pink_pantone': '#D74894',
  'pink_pearl': '#E7ACCF',
  'pistachio': '#93C572',
  'pixie_powder': '#391285',
  'plain_mouse': '#6E5F57',
  'platinum': '#E5E4E2',
  'pleasant_green': '#3CB44B',
  'plum': '#8E4585',
  'plum_blossom_mouse': '#97645A',
  'plum_dyed_umezome': '#FA9258',
  'plump_purple': '#5946B2',
  'poker_green': '#35654D',
  'polished_brown': '#985538',
  'polished_pine': '#5DA493',
  'pomelo': '#96A53C',
  'pomelo_olive': '#BFBD70',
  'pomelo_white': '#F9FFE3',
  'pomona_green': '#1E4D2B',
  'poppy_petal': '#F6A08C',
  'porcupine': '#936900',
  'portland_orange': '#FF5A36',
  'powderblue': '#B0E0E6',
  'primary_blue': '#0000FF',
  'primary_red': '#FF0000',
  'princess_perfume': '#FF85CF',
  'princeton_orange': '#F58025',
  'prussian_blue': '#1B263B',
  'prussian_blue_color_konjo_iro': '#003171',
  'pullman_brown_ups_brown': '#644117',
  'pullman_green': '#3B331C',
  'pumpkin': '#FF7518',
  'pure_crimson': '#C3272B',
  'purple': '#660066',
  'purple_heart': '#69359C',
  'purple_mountain_majesty': '#9678B6',
  'purple_munsell': '#9F00C5',
  'purple_murasaki': '#4F284B',
  'purple_navy': '#4E5180',
  'purple_pizzazz': '#FE4EDA',
  'purple_plum': '#9C51B6',
  'purple_taupe': '#50404D',
  'purple_x11': '#A020F0',
  'purpureus': '#9A4EAE',
  'quartz': '#51484F',
  'queen_blue': '#436B95',
  'quincy': '#6A5445',
  'rabbit_ear_iris': '#491E3C',
  'rain_blue': '#92A8D1',
  'raisin_black': '#1A1423',
  'rajah': '#FBAB60',
  'rambutan_red': '#A72127',
  'rape_blossom_brown': '#E3B130',
  'rapeseed_oil': '#A17917',
  'raspberry': '#C21460',
  'raspberry_pink': '#E25098',
  'raw_sienna': '#D68A59',
  'raw_umber': '#826644',
  'razzle_dazzle_rose': '#FF33CC',
  'razzmic_berry': '#8D4E85',
  'rebeccapurple': '#663399',
  'red': '#BC243C',
  'red_bean_color': '#672422',
  'red_birch': '#9D2B22',
  'red_bronze': '#FB8136',
  'red_brown': '#A13D2D',
  'red_brown1': '#8B352D',
  'red_cola': '#B62020',
  'red_incense': '#F07F5E',
  'red_kite': '#913228',
  'red_magenta': '#BB3385',
  'red_maroon': '#800000',
  'red_ochre': '#9F5233',
  'red_orange': '#FF3300',
  'red_orange_color_wheel': '#FF4500',
  'red_oxide': '#6A040F',
  'red_purple': '#E40078',
  'red_ryb': '#FE2712',
  'red_violet_crayola': '#C0448F',
  'redwood': '#A45A52',
  'refreshed_red_brown': '#E35C38',
  'regalia': '#522D80',
  'resolution_blue': '#002387',
  'rhythm': '#777696',
  'rich_black': '#004040',
  'rich_black_fog': '#010B13',
  'rich_black_fog2': '#010203',
  'rich_brilliant_lavender': '#F1A7FE',
  'rich_electric_blue': '#0892D0',
  'rich_gardenia': '#F57F4F',
  'rich_lavender': '#A76BCF',
  'rich_lilac': '#B666D2',
  'rifle_green': '#444C38',
  'rikan_brown_rikancha': '#534A32',
  'rinsed_out_red': '#FF7952',
  'ripe_mango': '#FFC324',
  'robin_egg_blue': '#00CCCC',
  'roman_silver': '#838996',
  'root_beer': '#290E05',
  'rosa': '#FFCCFF',
  'rose_bonbon': '#F9429E',
  'rose_ebony': '#674846',
  'rose_pink': '#FF66CC',
  'rose_quartz_pink': '#BD559C',
  'rose_taupe': '#905D5D',
  'rose_vale': '#AB4E52',
  'rosewood': '#955251',
  'rosso_corsa': '#D40000',
  'rosybrown': '#BC8F8F',
  'royal_azure': '#0038A8',
  'royal_blue': '#3366CC',
  'royal_blue_dark': '#002366',
  'royal_blue_light': '#4169E1',
  'royal_brown': '#523B35',
  'royal_fuchsia': '#CA2C92',
  'royal_green': '#136207',
  'royal_orange': '#F99245',
  'royal_pink': '#E73895',
  'royal_purple': '#7851A9',
  'ruddy_brown': '#BB6528',
  'rufous': '#A81C07',
  'rum': '#716675',
  'russet': '#80461B',
  'russian_green': '#679267',
  'russian_violet': '#32174D',
  'rust': '#B7410E',
  'rust_red': '#DD4124',
  'rusted_light_blue': '#6A7F7A',
  'rusty_celadon': '#898A74',
  'rusty_storage': '#455859',
  'rusty_storeroom': '#3A403B',
  'sacramento_state_green': '#043927',
  'saddlebrown': '#8B4513',
  'safety_orange': '#FF7800',
  'safety_orange_blaze': '#FF6700',
  'safety_yellow': '#EED202',
  'safflower': '#5A4F74',
  'saffron': '#F4C430',
  'sage': '#BCB88A',
  'sage_green': '#A4B086',
  'saint_patricks_blue': '#23297A',
  'salmon': '#FA8072',
  'salmon_pink': '#FF4057',
  'salmon_rose': '#E7968B',
  'samsung_blue': '#12279E',
  'sand': '#D99559',
  'sandstorm': '#ECD540',
  'sandy_tan': '#FDD9B5',
  'sandybrown': '#F4A460',
  'sangria': '#92000A',
  'sap_green': '#507D2A',
  'sappanwood_incense': '#A24F46',
  'sapphire': '#0F52BA',
  'satin_sheen_gold': '#CBA135',
  'satsuma': '#F28500',
  'sawtooth_oak': '#EC956C',
  'scarlet1': '#CF3A24',
  'school_bus_yellow': '#FFD800',
  'scorched_brown': '#351F19',
  'screamin_green': '#66FF66',
  'sea_blue': '#006994',
  'sea_bluegreen': '#006699',
  'sea_foam_green': '#9FE2BF',
  'sea_green': '#339966',
  'sea_green_crayola': '#00FFCD',
  'sea_serpent': '#4BC7CF',
  'sea_sky': '#33CCCC',
  'seaglass': '#009B77',
  'seagreen': '#2E8B57',
  'seal_brown': '#59260B',
  'seashell': '#FFF5EE',
  'selective_yellow': '#FFBA00',
  'sen_no_rikyus_tea_rikyucha': '#826B58',
  'sepia': '#704214',
  'sesame_street_green': '#00A870',
  'shadow': '#8A795D',
  'shadow_blue': '#778BA5',
  'shampoo': '#FFCFF1',
  'shamrock_green': '#009E60',
  'shandy': '#FFE670',
  'sheen_green': '#8FD400',
  'shiny_shamrock': '#5FA778',
  'shocking_pink': '#FC0FC0',
  'shocking_pink_crayola': '#FF6FFF',
  'sienna': '#A0522D',
  'silk_crepe': '#354E4B',
  'silver': '#C0C0C0',
  'silver_foil': '#AFB1AE',
  'silver_grey_ginnezumi': '#97867C',
  'silver_lake_blue': '#5D89BA',
  'silver_metallic': '#AAA9AD',
  'silver_pink': '#C4AEAD',
  'silver_sand': '#BFC1C2',
  'simmered_seaweed_mirucha': '#4C3D30',
  'sinopia': '#CB410B',
  'siskin_sprout_yellow': '#7A942E',
  'sizzling_sunrise': '#FFDB00',
  'skobeloff': '#007474',
  'sky_blue': '#42D4F4',
  'sky_blue_crayola': '#76D7EA',
  'sky_magenta': '#CF71AF',
  'skyblue': '#87CEEB',
  'slate_blue': '#6E81A0',
  'slateblue': '#6A5ACD',
  'slategray': '#708090',
  'slimy_green': '#299617',
  'smashed_pumpkin': '#FF6D3A',
  'smitten': '#C84186',
  'smoke': '#738276',
  'smokey_topaz': '#832A0D',
  'smoky_black': '#100C08',
  'smoky_topaz': '#933D41',
  'snow': '#FFFAFA',
  'soap': '#CEC8EF',
  'soft_coral': '#FF9AA2',
  'soldier_green': '#545A2C',
  'sooty_willow_bamboo': '#4D4B3A',
  'space_cadet': '#1D2951',
  'spanish_bistre': '#807532',
  'spanish_blue': '#0070B8',
  'spanish_green': '#009150',
  'spanish_orange': '#E86100',
  'spanish_pink': '#F7BFBE',
  'spanish_purple': '#66033C',
  'spanish_violet': '#4C2882',
  'spanish_viridian': '#007F5C',
  'spanish_yellow': '#F6B511',
  'sparrow_brown': '#8C4736',
  'spartan_crimson': '#9E1316',
  'spearmint': '#66FF99',
  'spicy_mix': '#8B5F4D',
  'spicy_red_brown': '#B35C44',
  'spiro_disco_ball': '#0FC0FC',
  'sponge': '#FDFE03',
  'spring_bud': '#A7FC00',
  'spring_frost': '#87FF2A',
  'spring_green': '#00FF99',
  'spring_leaf': '#66FF33',
  'spring_sky': '#0099FF',
  'sprint_yellow': '#FFDD05',
  'stained_red': '#78779B',
  'star_command_blue': '#007BB8',
  'steamed_chestnut': '#D3B17D',
  'steel_blue': '#347C98',
  'steel_pink': '#CC33CC',
  'steel_teal': '#5F8A8B',
  'steelblue': '#4682B4',
  'stone_terrace': '#A09484',
  'storeroom_brown': '#3D4035',
  'storm_blue': '#5D8CAE',
  'stormcloud': '#4F666A',
  'straw': '#E4D96F',
  'strawberry': '#FF5050',
  'strawberry_daiquiri': '#D9463E',
  'strawberry_jam': '#8B171A',
  'strawberry_red': '#C83F49',
  'strong_boy_pink': '#E9399E',
  'strong_carmine': '#E71D36',
  'strong_cyan': '#009999',
  'strong_green': '#009900',
  'strong_magenta': '#CC0099',
  'strong_red': '#F94144',
  'stylish_persimmon': '#FFA26B',
  'sugar_plum': '#914E75',
  'sumac_dyed_hajizome': '#E08A1E',
  'sumac_dyed_korozen': '#592B1F',
  'summer_sky': '#3366FF',
  'sunburnt_cyclops': '#FF404C',
  'sunflower_yellow': '#DAA520',
  'sunglow': '#FFCC33',
  'sunny': '#F2F27A',
  'sunray': '#E3AB57',
  'sunset': '#FF007C',
  'sunset_orange': '#FD5E53',
  'sunset_yellow': '#FFC922',
  'sunshine_yellow': '#FFE119',
  'super_pink': '#CF6BA9',
  'sweet_brown': '#A83731',
  'tan': '#D2B48C',
  'tan_crayola': '#D99A6C',
  'tangelo': '#F94D00',
  'tangerine': '#FC600A',
  'tangerine_yellow': '#FFCC00',
  'taobao_orange': '#FF4200',
  'tardis_blue': '#003B6F',
  'tart_orange': '#FB4D46',
  'tatarian_aster': '#976E9A',
  'taupe_gray': '#8B8589',
  'tea_green': '#D0F0C0',
  'teal': '#008080',
  'teal_blue': '#367588',
  'teal_deer': '#99E6B3',
  'teal_green': '#00827F',
  'tenne_tawny': '#CD5700',
  'terra_cotta': '#E2725B',
  'terracotta': '#E15D44',
  'thin_usu': '#A87CA0',
  'thistle': '#D8BFD8',
  'thistle_crayola': '#EBB0D7',
  'thousand_herb': '#317589',
  'thousand_year_old_brown': '#3B3429',
  'thousand_year_old_green': '#374231',
  'thrice_dyed_crimson': '#F7665A',
  'tiffany_blue': '#0ABAB5',
  'tigers_eye': '#E08D3C',
  'timberwolf': '#DBD7D2',
  'titanium': '#878681',
  'titanium_yellow': '#EEE600',
  'tomato': '#FF6347',
  'tomato_sauce': '#B21807',
  'toolbox': '#746CC0',
  'topaz': '#FFC87C',
  'tropical_rain_forest': '#00755E',
  'tropical_violet': '#CDA4DE',
  'true_blue': '#2D68C4',
  'true_blue1': '#0073CF',
  'true_red': '#8F1D21',
  'tufts_blue': '#3E8EDE',
  'tulip': '#FF878D',
  'tumbleweed': '#DEAA88',
  'turmeric': '#E69B3A',
  'turquoise': '#40E0D0',
  'turquoise_blue': '#00FFEF',
  'turquoise_green': '#A0D6B4',
  'turquoise_surf': '#00C5CD',
  'tuscan_red': '#7C4848',
  'tuscany': '#C09999',
  'twilight_lavender': '#8A496B',
  'twitter_blue': '#26A7DE',
  'ua_blue': '#0033AA',
  'ube': '#8878C3',
  'ucla_blue': '#536895',
  'ucla_gold': '#FFB300',
  'ue_red': '#BA0001',
  'ufo_green': '#3CD070',
  'ultramarine_blue': '#4166F5',
  'umber': '#635147',
  'unbleached_silk': '#FFDDCA',
  'underside_of_willow_leaves': '#BCB58C',
  'united_nations_blue': '#5B92E5',
  'university_of_california_gold': '#B78727',
  'university_of_tennessee_orange': '#F77F00',
  'up_maroon': '#7B1113',
  'upsdell_red': '#AE2029',
  'urobilin': '#E1AD21',
  'usafa_blue': '#004F98',
  'van_dyke_brown': '#664228',
  'vegas_gold': '#C5B358',
  'velvet_birodo': '#224634',
  'venetian_red': '#C80815',
  'verdigris': '#43B3AE',
  'verizon_red': '#EC1C24',
  'verizon_red1': '#CD040B',
  'vermilion': '#D9381E',
  'verse_green': '#18880D',
  'very_dark_olive': '#333300',
  'very_dark_violet': '#240046',
  'very_light_azure': '#74BBFB',
  'very_light_blue': '#6666FF',
  'very_light_green': '#CCFF99',
  'very_light_malachite_green': '#64E986',
  'very_light_tangelo': '#FFB077',
  'very_pale_cyan': '#CCFFFF',
  'very_pale_green': '#CCFFCC',
  'very_pale_grey': '#E1EDE9',
  'very_pale_orange': '#FFDFBF',
  'very_pale_pink': '#F2E2E0',
  'very_pale_yellow': '#FFFFBF',
  'vibrant_blue': '#118AB2',
  'vibrant_bright_yellow': '#FFD32D',
  'vibrant_electric_yellow': '#FEE440',
  'vibrant_green': '#06D6A0',
  'vibrant_lavender': '#9B5DE5',
  'vibrant_light_magenta': '#F15BB5',
  'vibrant_orange': '#FF9F1C',
  'vibrant_orangered': '#F46036',
  'vibrant_purple': '#8338EC',
  'vibrant_sunny_yellow': '#FFD166',
  'vibrant_turquoise': '#2EC4B6',
  'vine_grape_ebizome': '#6D2B50',
  'vine_green': '#38A32A',
  'violet': '#911EB4',
  'violet_blue': '#324AB2',
  'violet_blue_crayola': '#766EC8',
  'violet_color_wheel': '#7F00FF',
  'violet_crayola': '#963D7F',
  'violet_ryb': '#8601AF',
  'violetblue': '#4424D6',
  'violets_are_blue': '#8366F4',
  'violin_brown': '#674403',
  'viridian_green': '#009698',
  'vista_blue': '#7C9ED9',
  'vivaldi_red': '#EF3939',
  'vivid_auburn': '#922724',
  'vivid_blue': '#3A86FF',
  'vivid_blue_violet': '#3A0CA3',
  'vivid_cerise': '#DA1D81',
  'vivid_cerulean': '#00AAEE',
  'vivid_gamboge': '#FF9900',
  'vivid_lime_green': '#A6D608',
  'vivid_malachite': '#00CC33',
  'vivid_mulberry': '#B80CE3',
  'vivid_orange': '#FF5F00',
  'vivid_orange_peel': '#FFA000',
  'vivid_orchid': '#CC00FF',
  'vivid_raspberry': '#CC0066',
  'vivid_red': '#F70D1A',
  'vivid_red_tangelo': '#DF6124',
  'vivid_sky_blue': '#00CCFF',
  'vivid_tangelo': '#F07427',
  'vivid_tangerine': '#FFA089',
  'vivid_teal': '#00B8A9',
  'vivid_vermilion': '#E56024',
  'vivid_violet': '#6600FF',
  'vivid_yellow': '#FFE302',
  'vodka': '#BFC0EE',
  'volt': '#CEFF00',
  'wageningen_green': '#34B233',
  'walnut_dyed': '#9F7462',
  'warm_black': '#004242',
  'washed_out_crimson': '#FFB3A7',
  'washed_out_persimmon': '#EC8254',
  'water': '#D4F1F9',
  'water_persimmon': '#B56C60',
  'watermelon': '#FF6F61',
  'watermelon_yellow': '#EEFF1B',
  'waterspout': '#A4F4F9',
  'weathered_bamboo': '#593A27',
  'weebly_blue': '#1F8EED',
  'weebly_orange': '#FF9A00',
  'weldon_blue': '#7C98AB',
  'wenge': '#645452',
  'wheat': '#F5DEB3',
  'white': '#FFFFFF',
  'white_chocolate': '#EDE6D6',
  'white_coffee': '#E6E0D4',
  'white_mouse': '#B9A193',
  'white_oak': '#CE9F6F',
  'white_tea': '#C48E69',
  'whitesmoke': '#F5F5F5',
  'whitish_green': '#A5BA93',
  'wild_blue': '#A2ADD0',
  'wild_orchid': '#D470A2',
  'wild_strawberry': '#FF43A4',
  'willow_dye': '#8C9E5E',
  'willow_grey': '#817B69',
  'willow_tea': '#9C8A4D',
  'willpower_orange': '#FD5800',
  'wilted_brown': '#AB4C3D',
  'windsor_tan': '#A75502',
  'winter_blue': '#26547C',
  'winter_sky': '#4D8FAC',
  'winter_wizard': '#A0E6FF',
  'wintergreen_dream': '#56887D',
  'wisteria': '#C9A0DC',
  'wisteria_and_burnt_bamboo': '#4D3B3C',
  'wisteria_fuji': '#89729E',
  'wisteria_purple': '#875F9A',
  'xanadu': '#738678',
  'xbox_green': '#0E7A0D',
  'xiaomi_orange': '#FD4900',
  'yale_blue': '#0F4D92',
  'yankees_blue': '#1C2841',
  'yellow': '#FFFF00',
  'yellow_crayola': '#FCE883',
  'yellow_green': '#30B21A',
  'yellow_green_crayola': '#C5E384',
  'yellow_munsell': '#EFCC00',
  'yellow_orange': '#FFAE42',
  'yellow_orange_wheel': '#FF9505',
  'yellow_pantone': '#FEDF00',
  'yellow_rose': '#FFF000',
  'yellow_ryb': '#FEFE33',
  'yellow_sea_pine_brown': '#896C39',
  'yellowgreen': '#9ACD32',
  'yinmn_blue': '#2E5090',
  'young_bamboo': '#6B9362',
  'young_olive': '#336600',
  'zaffre': '#0014A8',
  'zinnwaldite': '#EBC2AF',
  'zinnwaldite_brown': '#2C1608',
  'zomp': '#39A78E'
};


function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
  let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
  mStyle(dParent, styles);
  let res = [];
  for (let i = 0; i < chflex.length; i++) {
    let bg = isdef(bgs) ? bgs[i] : null;
    let d1 = mDiv(dParent, { flex: chflex[i] });
    if (isdef(bg)) mStyle(d1, { bg: bg });
    res.push(d1);
  }
  return res;
}
