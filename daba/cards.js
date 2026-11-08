
function cDeck52() {
  return combineLetters(['A23456789TJQK', 'SHDC']);
}
function c52Decks(n) {
  return arrRepeat(cDeck52(), n);
}
function c52Sort(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
  return hand.sort((a, b) => {
    if (bySuit) {
      const suitDiff = suits.indexOf(a[1]) - suits.indexOf(b[1]);
      if (suitDiff !== 0) return suitDiff;
    }
    if (byRank) {
      return rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]);
    }
    return 0;
  });
}
function c52Sort_alternative(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
  const suitOrder = bySuit ? Object.fromEntries([...suits].map((s, i) => [s, i])) : null;
  const rankOrder = byRank ? Object.fromEntries([...rankstr].map((r, i) => [r, i])) : null;
  return hand.sort((a, b) => {
    if (bySuit) {
      const suitDiff = suitOrder[a[1]] - suitOrder[b[1]];
      if (suitDiff !== 0) return suitDiff;
    }
    if (byRank) {
      return rankOrder[a[0]] - rankOrder[b[0]];
    }
    return 0;
  });
}
function c52Sort_old(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
  if (bySuit && byRank) {
    let buckets = arrBuckets(hand, x => x[1], suits);
    for (const b of buckets) { c52Sort(b.list, false, null, true, rankstr); }
    hand.length = 0; buckets.map(x => x.list.map(y => hand.push(y)));
  } else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1]));
  else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
  return hand;
}
function cBlank(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = valf(styles.sz, 100);
  if (nundef(styles.w)) styles.w = styles.h * .7;
  if (nundef(styles.bg)) styles.bg = 'white';
  styles.position = 'relative';
  if (nundef(styles.rounding)) styles.rounding = Math.min(styles.w, styles.h) / 21;
  addKeys({ className: 'card' }, opts);
  let d = mDom(dParent, styles, opts);
  opts.type = 'card';
  addKeys(styles, opts);
  let item = mItem(d ? { div: d } : {}, opts);
  return item;
}
function cDeckDeal(deck, n) { return deck.splice(0, n); }
function cFaceDown(item, color, texture) {
  if (!item.faceUp) return;
  if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
    face_down_alt(item, color, texture);
  } else {
    let svgCode = M.c52.card_2B;
    item.div.innerHTML = svgCode;
    if (nundef(color)) color = item.color;
    if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
  }
  item.faceUp = false;
}
function cFaceUp(item) {
  if (item.faceUp) return;
  if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
  else item.div.innerHTML = isdef(item.c52key) ? M.c52[item.c52key] : item.html;
  item.faceUp = true;
}
function cFlip(card, callback) {
  let child = card.div;
  let a = ANIM.flipcard = aFlip(child, 800, 'ease-in');
  a.onfinish = () => { toggle_face(card); if (isdef(callback)) callback(); };
  return a;
}
function cLandscape(dParent, styles = {}, opts = {}) {
  if (nundef(styles.w)) styles.w = 100;
  if (nundef(styles.h)) styles.h = styles.w * .65;
  return cBlank(dParent, styles, opts);
}
function cMove(card, newParent, callback) {
  let child = card.div;
  let zOld = child.style.zIndex;
  mStyle(child, { z: 10000 })
  let a = ANIM.move = aMove(child, newParent, 800, 'ease-in');
  a.onfinish = () => { if (isdef(callback)) callback(); };
  a.oncancel = () => mStyle(child, { z: zOld });
  return a;
}
function cNumber(ckey, styles = {}, opts = {}) {
  addKeys({ border: 'silver', h: 100 }, styles);
  addKeys({ backcolor: BLUE, ov: .3, key: ckey, type: 'num' }, opts);
  let c = cPortrait(null, styles, opts);
  if (isNumeric(ckey)) { ckey = `${ckey}_blue`; }
  let sym = c.rank = stringBefore(ckey, '_');
  let color = c.suit = c.val = stringAfter(ckey, '_');
  let sz = c.h;
  let [sm, lg, w, h] = [sz / 8, sz / 4, c.w, c.h];
  let styleSmall = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
  cPrintSym(c, sym, styleSmall, 'tl')
  cPrintSym(c, sym, styleSmall, 'tr')
  styleSmall.transform = 'rotate(180deg)';
  cPrintSym(c, sym, styleSmall, 'bl')
  cPrintSym(c, sym, styleSmall, 'br')
  let styleBig = { matop: (h - lg) / 2, family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }
  styleBig = { display: 'inline', family: 'algerian', fg: color, fz: lg, hline: lg }
  cPrintSym(c, sym, styleBig, 'cc')
  return c;
}
function cPortrait(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = 100;
  if (nundef(styles.w)) styles.w = styles.h * .7;
  return cBlank(dParent, styles, opts);
}
function cPrintSym(card, sym, styles, pos) {
  let d = iDiv(card);
  let opts = {};
  if (isNumber(sym)) {
    opts.html = sym;
  } else if (sym.includes('/')) {
    opts.tag = 'img';
    opts.src = sym;
  }
  let d1 = mDom(d, styles, opts);
  mPlace(d1, pos, pos[0] == 'c' ? 0 : 2, pos[1] == 'c' ? 0 : 2);
}
function cRound(dParent, styles = {}, opts = {}) {
  styles.w = valf(styles.w, 100);
  styles.h = valf(styles.h, 100);
  styles.rounding = '50%';
  return cBlank(dParent, styles, opts);
}
function cSort(hand, suits = null, ranks = null) {
  const sMap = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : {};
  const rMap = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : {};
  return hand.sort((a, b) => {
    const { [1]: sA, [0]: rA } = a.key ?? a;
    const { [1]: sB, [0]: rB } = b.key ?? b;
    if (suits) {
      const diff = sMap[sA] - sMap[sB];
      if (diff !== 0) return diff;
    }
    return ranks ? rMap[rA] - rMap[rB] : 0;
  });
}
function cSplay(cards, dParent = null, dir = 'right', splay = 0.25) {
  const n = cards.length;
  if (n === 0) return mGrid(1, 1, dParent);
  if (dir == 'diagonal') return cSplayDiagonal(cards, dParent, splay*0.8);
  let dg;
  if (dParent) {
    let isHorizontal = ['left', 'right'].includes(dir);
    let rows = isHorizontal ? 1 : n;
    let cols = isHorizontal ? n : 1;
    dg = mGrid(rows, cols, dParent, { gap: 0, padding:8});//, padding: 14});
    dg.style.gridTemplateRows = `repeat(${rows}, max-content)`;
    dg.style.gridTemplateColumns = `repeat(${cols}, max-content)`;
    dg.style.display = 'inline-grid';
  } else {
    dg = cards[0].div.parentNode;
    mClear(dg);
  }
  const cardW = cards[0].w;
  const cardH = cards[0].h;
	if (dir!='left' && dir!='right') splay*=.8;
  const invSplay = 1 - splay;
  const marginW = -(cardW * invSplay);
  const marginH = -(cardH * invSplay);
  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);
    dc.style.margin = "0";
    dc.style.zIndex = i;
    if (i < n - 1) {
      if (dir === 'right') dc.style.marginRight = `${marginW}px`;
      if (dir === 'down') dc.style.marginBottom = `${marginH}px`;
      if (dir === 'left') dc.style.marginRight = `${marginW}px`;
      if (dir === 'up') dc.style.marginBottom = `${marginH}px`;
    }
    if (dir === 'left' || dir === 'up') {
      dc.style.zIndex = n - i;
    }
  });
  return { dg, dir, splay };
}
function cSplay1(container, cards, w = 70) {
  const cardWidth = w;
  const overlap = 0.75;
  const step = cardWidth * (1 - overlap);
  mStyle(container, { display: 'grid', maleft: -(cardWidth * .75) })
  container.style.gridTemplateColumns = `repeat(${cards.length}, ${step}px)`;
  container.style.margin = "0 0 0 -52px";
  cards.forEach((card, i) => {
    mAppend(container, card);
    card.style.gridColumn = i + 1;
    card.style.width = cardWidth + "px";
  });
}
function cSplayDiagonal(cards, dParent, splay = 0.25) {
  const n = cards.length;
  let rc = Math.max(n, 1);
  let dg = mGrid(rc, rc, dParent, { gap: 0, padding: 20 });
  if (n === 0) return dg;
  const cardW = cards[0].w;
  const cardH = cards[0].h;
  const offW = cardW * splay;
  const offH = cardH * splay;
  const colTemplate = `repeat(${n - 1}, ${offW}px) ${cardW}px`;
  const rowTemplate = `repeat(${n - 1}, ${offH}px) ${cardH}px`;
  dg.style.display = 'inline-grid';
  dg.style.gridTemplateColumns = colTemplate;
  dg.style.gridTemplateRows = rowTemplate;
  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);
    dc.style.gridColumn = i + 1;
    dc.style.gridRow = i + 1;
    dc.style.margin = "0";
    dc.style.width = `${cardW}px`;
    dc.style.height = `${cardH}px`;
    dc.style.zIndex = i;
  });
  return dg;
}
function uiTypeCard52(ckey, h = 100, bg = 'transparent', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
  const CARD_RATIO = 240 / 336;
  const w = Math.round(h * CARD_RATIO);
  let html = M.c52['card_' + ckey.slice(0, 2)];
  if (!shadow) {
    html = html.replace(/(<svg\b[^>]*?)\s+class="[^"]*"/, '$1');
  }
  const div = mDom(null, {
    h, w,
    bg,
    rounding: Math.round(w / 20), // matches SVG rx="12" in viewBox width 240: 12/240*w = w/20
    overflow: 'hidden'                 // clips any stroke bleed at the corners
  }, { html });
  const rect = _cardOuterRect(div);
  if (rect) {
    rect.setAttribute('fill', bgFace);
    rect.setAttribute('stroke', border);
    rect.setAttribute('stroke-width', String(borderthickness));
  }
  const svgUp = div.innerHTML;
  return { key: ckey, w, h, svgUp, faceUp: true, div, bg, border, borderthickness, shadow, bgFace };
}
async function uiTypeDeck(cards, dParent, face = 'down', splay = 0.002, nTop = 2) {
  const n = cards.length;
  visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
  visualCount = Math.max(nTop + 1, visualCount);
  let part = cards.slice(-visualCount);
  mCenterFlex(dParent);
  let dcont = mDom(dParent, { matop: 10, position: 'relative' });
  let o = await splayItems(part, dcont, { interactive: 'none', direction: 'down-right', overlap: 1 - splay, animate: false }); //'down-right'
  let dg = o.container;
  let topCard = cards[n - 1];
  if (face == 'down') part.map(x => face_down(x));
  let bottomCard = part[0];
  if (n > 0) addBadge(dg, n)
  return {
    topCard,
    bottomCard,
    dg,
  }
}
function uiTypeHand(items, dParent, styles = {}, path = 'hand', title = 'hand', show_if_empty = false) {
  let defaults = valf(M.config.ui.container, {});
  defaults.position = 'relative';
  addKeys(defaults, styles);
  let cont = mDom(dParent, styles);
  let cardcont = mDom(cont);
  let card = isEmpty(items) ? { w: 1, h: M.config.ui.card.h, ov: 0 } : items[0];
  let splay = 2;
  mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
  for (const item of items) {
    let d = iDiv(item); console.log('card div', d);
    mAppend(cont, iDiv(item));
    mItemSplay(item, items, 2);
  }
  return {
    ctype: 'hand',
    list: items,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    splay: splay,
    items: items,
  };
}

