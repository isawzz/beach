
const __STYLES = {
  align: 'text-align',
  // alignContent: 'align-content',
  // alignItems: 'align-items',
  // alignSelf: 'align-self',
  // aspectRatio: 'aspect-ratio',
  autoCols: v => ['grid-template-columns', isNumber(v) ? `repeat(auto-fill,${v}px)` : isString(v) ? v : `repeat(auto-fill,1fr)`],
  autoGrid: v => { let [rows, cols,] = v.split(' '); return { display: 'grid', gridTemplateRows: `repeat(auto-fill,${rows}px)`, gridTemplateColumns: `repeat(auto-fill,${cols}px)` }; },
  autoRows: v => ['grid-template-rows', isNumber(v) ? `repeat(auto-fill,${v}px)` : v],
  bg: v => ['background-color', colorFrom(v)],
	fg: v => ['color', clrHex(v)],
  bgAttach: 'background-attachment',
  bgBlend: 'background-blend-mode',
  bgImage: 'background-image',
  bgRepeat: 'background-repeat',
  bgSize: 'background-size',
  bgSrc: v => ['background-image', `url(${v})`],
  border: v => {
    let parts = v.split(' ');
    if (parts.length == 1) return `1px solid ${v}`;
    else if (parts.length == 2) {
      let n = parts.find(x => isNumber(x[0])); let i = parts.indexOf(n); let color = i == 0 ? parts[1] : parts[0];
      n = n.includes('px') || n.includes('%') ? n : `${n}px`;
      return `${n} solid ${colorFrom(color)}`;
    } else return v;
  },
  borderRadius: 'border-radius',
  box: v => ['box-sizing', v ? 'border-box' : 'content-box'],
  breakWord: ['overflow-wrap', 'break-word'],
  caret: 'caret-color',
  clip: 'clip-path',
  deco: 'text-decoration',
  dir: 'flex-direction',
  editable: 'contenteditable',
  family: 'font-family',
  fg: (v, bg) => ['color', v == 'contrast' ? colorIdealText(bg) : colorFrom(v)],
  fit: 'object-fit',
  //flex: v => {let [hor,vert, dir]=v.split(' ');return {display:'flex','flex-direction':(dir && dir.startsWith('c'))?'column':'row','align-content':vert,'justify-items':hor};},
  flexWrap: 'flex-wrap',
  flow: 'grid-auto-flow',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fStyle: 'font-style',
  fz: 'font-size',
  grid: v => { let [rows, cols,] = v.split(' '); return { display: 'grid', gridTemplateRows: `repeat(auto-fill,${rows}px)`, gridTemplateColumns: `repeat(auto-fill,${cols}px)` }; },
  gridRow: 'grid-row',
  gridCol: 'grid-column',
  gridCols: v => ['grid-template-columns', isNumber(v) ? `repeat(${v},1fr)` : v],
  gridRows: v => ['grid-template-rows', isNumber(v) ? `repeat(${v},1fr)` : v],
  gridTemplateCols: 'grid-template-columns',
  gridTemplateRows: 'grid-template-rows',
  grow: 'flex-grow',
  h: 'height',
  h100: ['height', '100%'],
  hAlign: 'justify-content',
  halign: 'justify-content',
  hCenter: ['justify-content', 'center'],
  hLine: 'line-height',
  hMargin: v => ['margin', `0px ${v}px`],
  hPadding: v => ['padding', `0px ${v}px`],
  hgap: 'column-gap',
  html: v => ['innerHTML', v],
  hmax: 'max-height',
  hmin: 'min-height',
  iplace: 'place-items',
  justifyContent: 'justify-content',
  justifyItems: 'justify-items',
  justifySelf: 'justify-self',
  justify: 'justify-content',
  k: 'cursor',
  l: 'left',
  lheight: 'line-height',
  letterSpacing: 'letter-spacing',
  lineHeight: 'line-height',
  lspace: 'letter-spacing',
  m: 'margin',
  mauto: 'margin',
  mabottom: 'margin-bottom',
  maleft: 'margin-left',
  maright: 'margin-right',
  matop: 'margin-top',
  mah: v => ['margin', `0px ${v}px`],
  mahv: v => ['margin', `${v.split(' ')[1]}px ${v.split(' ')[0]}px`],
  mav: v => ['margin', `${v}px 0px`],
  origin: 'transform-origin',
  outline: v => v.includes(' ') ? v : `1px solid ${v}`,
  overx: 'overflow-x',
  overy: 'overflow-y',
  overflowWrap: 'overflow-wrap',
  paleft: 'padding-left',
  pabottom: 'padding-bottom',
  paright: 'padding-right',
  patop: 'padding-top',
  pah: v => ['padding', `0px ${v}px`],
  pahv: v => ['padding', `${v.split(' ')[1]}px ${v.split(' ')[0]}px`],
  pav: v => ['padding', `${v}px 0px`],
  place: 'place-items',
  round: v => v ? ['border-radius', '50%'] : ['border-radius', '0%'],
  rounding: 'border-radius',
  shadow: 'box-shadow',
  shrink: 'flex-shrink',
  vAlign: 'align-items',
  valign: 'align-items',
  vBaseline: ['align-items', 'baseline'],
  vCenter: ['align-items', 'center'],
  vMargin: v => ['margin', `${v}px 0px`],
  vPadding: v => ['padding', `${v}px 0px`],
  vert_align: 'align-items',
  vStretch: ['align-items', 'stretch'],
  vgap: 'row-gap',
  w: 'width',
  w100: ['width', '100%'],
  weight: 'font-weight',
  whiteSpece: 'white-space',
  wmax: 'max-width',
  wmin: 'min-width',
  wordBreak: 'word-break',
  wrap: v => v == 'hard' ? ['wrap', 'hard'] : ['flexWrap', 'wrap'],
  x: 'left',
  xover: 'overflow-x',
  y: 'top',
  yover: 'overflow-y',
  z: 'z-index',
};
const __NO_UNIT_STYLES = ['opa', 'flex', 'grow', 'shrink', 'grid', 'z', 'iter', 'count', 'orph', 'widow', 'weight', 'order', 'index'];

function mStyle(elem, styles = {}, opts = {}) {
  elem = toElem(elem);
  let styles1 = mStyles(styles);
  for (const key in styles1) {
    elem.style.setProperty(key, styles1[key]);
  }
  applyOpts(elem, opts);
}
function mStyles(styles) {
  let res = {};
  for (const k in styles) {
    let key = k, val = styles[k];
    if (k in STYLES) {
      let dival = STYLES[k];
      if (typeof dival == 'function') {
        val = dival(val, styles.bg);
        if (isList(val)) [key, val] = val;
      }
      else if (isList(dival)) {
        [key, val] = dival;
      } else if (isString(dival)) key = dival;
      else val = dival;
    }
    let val1 = isNumber(val) && !NO_UNIT_STYLES.some(x => key.startsWith(x)) || key == 'fz' ? '' + Number(val) + 'px' : val;
    res[key] = val1;
  }
  return res;
}


