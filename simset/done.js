
async function ari_present(me, table) {
  let fen = table.fen;
  let stage = table.fen.stage;
  PrevItems = Items;
  Items = {};
  let dTable = Items.dTable = stdPresentBGATableCols(me, table, 2000);
  ariShowTitle(table);
  DA.stats = ariStats(me, table);
  historyShow(table, 'dStats');
  let dt = Items.dt = mDom('dTable', { pabottom: 20, h100: true, box: true, w100: true, bg: colorLight('#EDC690', 50) });
  let dOpenTable = Items.dOpenTable = mDom(dt, { gap: 4 }, { id: 'dOpenTable' }); mFlexWrap(dOpenTable);
  let deckCards = Items.deckCards = fen.deck.map(key => uiTypeCard52(key));
  let cont = ariContainer(dOpenTable, 'dDeck', 'deck');
  let deck = Items.deck = uiTypeDeck(deckCards, cont);
  let marketCards = Items.marketCards = fen.market.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dMarket', 'market');
  cont = mDom(cont, { margin: 10 });
  let market = Items.market = splayItems(marketCards, cont,
    { direction: 'right', overlap: -0.1 });
  let openDiscardCards = Items.openDiscardCards = fen.openDiscard.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dOpenDiscard', 'buy');
  cont = mDom(cont, { margin: 10 });
  let openDiscard = Items.openDiscard = splayItems(openDiscardCards, cont,
    { direction: 'right', overlap: -0.1 });
  let deckDiscardCards = Items.deckDiscardCards = fen.deckDiscard.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dDeckDiscard', 'discard');
  let deckDiscard = Items.deckDiscard = uiTypeDeck(deckDiscardCards, cont);
  if (!isEmpty(fen.ball)) {
    let ballCards = Items.ballCards = fen.ball.map(key => uiTypeCard52(key));
    cont = ariContainer(dOpenTable, 'dBall', 'ball');
    cont = mDom(cont, { margin: 10 });
    let ball = Items.ball = splayItems(ballCards, cont,
      { direction: 'right', overlap: -0.1 });
  }
  if (exp_church(table.options)) {
    let churchCards = Items.churchCards = fen.church.map(key => uiTypeCard52(key));
    let cont = ariContainer(dOpenTable, 'dChurch', 'church');
    let n = churchCards.length;
    let i = 180 / n;
    let startAngle = 360 - i * (n - 1);
    let church = Items.church = await wheelItems(churchCards, cont, { sweep: 180, startAngle, interactive: 'none' });//, inclusive: true });
  }
  let smallsz = 60;
  if (exp_commissions(table.options)) {
    let openCommissionCards = Items.openCommissionCards = fen.openCommissions.map(key => uiTypeCard52(key, smallsz, 'blue'));
    cont = ariContainer(dOpenTable, 'dOpenCommissions', 'commissions');
    mMagnifyOnHoverControlPopup(cont);
    let openCommissions = Items.openCommissions = cSplay(openCommissionCards, cont, dir = 'right', splay = 1.1);
    let deckCommissionCards = Items.deckCommissionCards = fen.deckCommission.map(key => uiTypeCard52(key, smallsz));
    cont = ariContainer(dOpenTable, 'dDeckCommission', 'commission');
    let deckCommission = Items.deckCommission = uiTypeDeck(deckCommissionCards, cont);
  }
  if (exp_peasants(table.options) || exp_rumors(table.options)) {
    let deckRumorsCards = Items.deckRumorsCards = fen.deckRumors.map(key => uiTypeCard52(key, smallsz, 'green'));
    cont = ariContainer(dOpenTable, 'dDeckRumors', 'peasants');
    let deckRumors = Items.deckRumors = uiTypeDeck(deckRumorsCards, cont);
  }
  if (exp_journeys(table.options)) {
    let deckLuxuryCards = Items.deckLuxuryCards = fen.deckLuxury.map(key => uiTypeCard52(key, smallsz, 'blue'));
    cont = ariContainer(dOpenTable, 'dDeckLuxury', 'luxury');
    let deckLuxury = Items.deckLuxury = uiTypeDeck(deckLuxuryCards, cont);
  }
  Items.players = {};
  let uname_plays = table.plorder.includes(me);
  let show_first = uname_plays ? me : table.turn[0];
  let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
  let playerStyles = { bg: '#ffffff80', fg: 'black', padding: 10, margin: 4, rounding: 9 };
  for (const plName of order) {
    let hidden = plName != order[0];
    Items.players[plName] = await ariPresentPlayer(table, me, plName, dt, playerStyles, smallsz, hidden && !TESTING);
  }
  return Items;
}
async function ariPresentPlayer(table, me, plName, dt, styles, smallsz, isHidden = false) {
	let fen = table.fen;
	let pl = table.players[plName];
	let d = mDom(dt, styles, { html: get_user_pic_html(plName, 25) });
	mStyle(d, { border: `2px ${pl.color} solid`, gap: 4 })
	mFlexWrap(d);
	mDom(d, {}, { html: plName })
	mLinebreak(d, 9);
	let ui = { div: d };
	let handCards = ui.handCards = pl.hand.map(key => uiTypeCard52(key));
	if (isHidden) { handCards.map(x => face_down(x)); }
	cont = ariContainer(d, `d${capitalize(plName)}Hand`, 'hand');
	mStyle(cont, { wmin: 200 })
	cont = mDom(cont, { margin: 10 });
	let hand = ui.hand = splayItems(handCards, cont, { direction: 'right', overlap: 0.8 });
	hand.splay = 0.8;
	let stallCards = ui.stallCards = pl.stall.map(key => uiTypeCard52(key));
	cont = ariContainer(d, `d${capitalize(plName)}Stall`, 'stall');
	cont = mDom(cont, { margin: 10 });
	let stall = ui.stall = splayItems(stallCards, cont, { direction: 'right', overlap: -0.1 });
	if (fen.stage < 5 && isHidden) { stallCards.map(x => face_down(x)); }
	if (exp_peasants(table.options)) {
		let peasantCards = ui.peasantCards = pl.peasants.map(key => uiTypeCard52(key, smallsz, 'green'));
		cont = ariContainer(d, `d${capitalize(plName)}Peasants`, 'peasants');
		let peasants = ui.peasants = cSplay(peasantCards, cont, dir = 'right', splay = 1.2);
		let peasantUsedCards = ui.peasantUsedCards = pl.peasantsUsed.map(key => uiTypeCard52(key, smallsz, 'green'));
		cont = ariContainer(d, `d${capitalize(plName)}PeasantUsed`, 'used');
		let peasantUsed = ui.peasantUsed = cSplay(peasantUsedCards, cont, dir = 'right', splay = 1.2);
		peasantUsedCards.map(x => face_down(x));
	}
	if (exp_commissions(table.options)) {
		if (!isHidden) pl.commissions = cSort(pl.commissions, null, 'A23456789TJQK');
		let commisionCards = ui.commisionCards = pl.commissions.map(key => uiTypeCard52(key, smallsz, 'blue'));
		cont = ariContainer(d, `d${capitalize(plName)}Commissions`, 'commissions');
		let commissions = ui.commissions = cSplay(commisionCards, cont, dir = 'right', splay = 1.2);
		if (isHidden) { commisionCards.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(cont);
	}
	if (exp_rumors(table.options)) {
		if (!isHidden) pl.rumors = cSort(pl.rumors, null, 'A23456789TJQK');
		let rumorCards = ui.rumorCards = pl.rumors.map(key => uiTypeCard52(key, smallsz, 'green'));
		cont = ariContainer(d, `d${capitalize(plName)}Rumors`, 'rumors');
		let rumors = ui.rumors = cSplay(rumorCards, cont, dir = 'right', splay = .25);
		if (isHidden) { rumorCards.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(cont);
	}
	if (exp_journeys(table.options)) {
		ui.journeys = [];
		let i = 0;
		for (const j of pl.journeys) {
			let jCards = j.map(key => uiTypeCard52(key));
			let cont = ariContainer(d, `d${capitalize(plName)}Journey${i}`, 'journey');
			let jui = cSplay(jCards, cont, dir = 'right', splay = 0.2);
			i += 1;
			ui.journeys.push({ jCards, cont, jui });
		}
	}
	mLinebreak(d, 8);
	ui.buildinglist = [];
	ui.indexOfFirstBuilding = arrChildren(d).length;
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let type = k;
			let list = b.list;
			let bCards = list.map(key => uiTypeCard52(key));
			let hiddenCards = bCards.filter(x => x.key != b.lead && (!b.schweine || !b.schweine.includes(x.key)));
			let leadCard = bCards.find(x => x.key == b.lead);
			hiddenCards.map(x => face_down(x));
			let cont = ariContainer(d, `d${capitalize(plName)}Building${k}${i}`, k);
			let bui = cSplay(bCards, cont, dir = 'right', splay = 0.2);
			let dHarvest = null;
			if (isdef(b.h)) {
				let d = iDiv(leadCard);
				mStyle(d, { position: 'relative' });
				dHarvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .8, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
			}
			let dRumors = null, rumorItems = [];
			if (!isEmpty(b.rumors)) {
				let d = cont;
				mStyle(d, { position: 'relative' });
				dRumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 6, right: 4, z: 10000 }); //,bg:'green'});
				for (const rumor of b.rumors) {
					let dr = mDiv(dRumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
					rumorItems.push({ div: dr, key: rumor });
				}
			}
			bui.cards = bCards;
			bui.hiddenCards = hiddenCards;
			bui.dHarvest = dHarvest;
			bui.leadCard = leadCard;
			bui.dRumors = dRumors;
			bui.rumorItems = rumorItems;
			bui.type = k;
			ui.buildinglist.push(bui);
			if (b.isBlackmailed) { mStamp(cont, 'blackmail'); }
			lookupAddToList(ui, ['buildings', k], bui); //GEHT!!!!!!!!!!!!!!!!!!!!!
			i += 1;
		}
	}
	if (plName == me) {
		showHandSortingButtonsFor(table.players[me], ui);
		if (hasBuildings(pl)) {
			let d = ui.div;
			let bstyles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
			let b1 = mDom(d, bstyles, { tag: 'button', innerHTML: 'view buildings' });
			b1.onclick = () => ariRevealBuildings(ui);
		}
	}
	return ui;
}
function splayItems(items, container, {
	direction = 'right',
	overlap = 0.65,
	rotateStep = 0,
	spreadDeg = 40,
	arcRadius,
	padding = 6,
	interactive = 'all',
	hoverRaise = 10,
	selectionColor = 'red',
	selectionWidth = 3,
	durationMs = 250,
} = {}) {
	/**
	 * splayItems
	 * ─────────────────────────────────────────────────────────────────────────────
	 * Positions a list of cards or divs in a splay/fan inside a container.
	 * The container is auto-sized; its required dimensions are returned.
	 *
	 * @param {Array<Object|HTMLElement>} items
	 *   Card objects from uiTypeCard52, or plain HTMLElements.
	 *
	 * @param {HTMLElement} container
	 *   Parent element. Gets position:relative and is resized to fit the splay.
	 *
	 * @param {Object} [options]
	 * @param {'right'|'left'|'up'|'down'|
	 *          'down-right'|'down-left'|'up-right'|'up-left'|
	 *          'fan'} [options.direction='right']
	 *
	 * @param {number} [options.overlap=0.65]
	 *   Fraction of each item's width/height hidden behind the next.
	 *   0 = items just touching · 1 = perfect stack · <0 = gap between items.
	 *
	 * @param {number} [options.rotateStep=0]
	 *   Extra rotation in degrees added per item (linear modes only).
	 *   e.g. rotateStep=3 fans the cards slightly while still splaying linearly.
	 *
	 * @param {number} [options.spreadDeg=40]  Fan mode: total arc sweep in degrees.
	 * @param {number} [options.arcRadius]     Fan mode: arc radius in px (auto if omitted).
	 * @param {number} [options.padding=6]     Px gap between splay bounding box and container edge.
	 * @param {number} [options.hoverRaise=10] Px the item lifts upward on hover.
	 * @param {string} [options.selectionColor='red']  Outline colour when selected.
	 * @param {number} [options.selectionWidth=3]      Outline width in px when selected.
	 * @param {boolean}[options.animate=true]
	 * @param {number} [options.durationMs=250]
	 *
	 * @returns {Promise<{width:number, height:number}>}
	 *   Total pixel size required for the container.
	 *
	 * @example
	 *   const { width, height } = splayItems(hand, handEl, { direction: 'fan', spreadDeg: 50 });
	 *   handEl.style.width  = width  + 'px';
	 *   handEl.style.height = height + 'px';
	 *
	 *   splayItems(deck, deckEl, { direction: 'down-right', overlap: 0.88 });
	 *   splayItems(Array.from(container.children), container, { direction: 'right' });
	 */
	if (!items.length) return { width: 0, height: 0 };
	const norm = items.map(_normalizeItem);
	const positions = direction === 'fan'
		? _fanCoords(norm, spreadDeg, arcRadius)
		: _linearCoords(norm, direction, overlap, rotateStep);
	const maxRight = Math.max(...positions.map(p => p.left + p.w));
	const maxBottom = Math.max(...positions.map(p => p.top + p.h));
	const totalW = Math.ceil(maxRight + 2 * padding);
	const totalH = Math.ceil(maxBottom + 2 * padding);
	container.style.position = 'relative';
	container.style.width = `${totalW}px`;
	container.style.height = `${totalH}px`;
	positions.forEach(({ el }) => {
		if (el.parentElement !== container) container.appendChild(el);
	});
	const tr = 'none';
	positions.forEach(({ el, left, top, rotation, zIndex, original }) => {
		el.dataset.splayRotation = String(rotation);
		el.dataset.splayZIndex = String(zIndex);
		if (original && !(original instanceof HTMLElement)) original.splayRotation = rotation;
		el.style.position = 'absolute';
		el.style.zIndex = String(zIndex);
		el.style.transition = tr;
		el.style.left = `${Math.round(left + padding)}px`;
		el.style.top = `${Math.round(top + padding)}px`;
		el.style.transform = rotation ? `rotate(${rotation.toFixed(2)}deg)` : '';
		if (interactive == 'all' || interactive == 'top' && i == n - 1 || interactive == 'bottom' && i == 0) {
			_bindInteractions(el, { hoverRaise, selectionColor, selectionWidth });
		}
	});
	// if (animate) await new Promise(r => setTimeout(r, durationMs));
	return { container, width: totalW, height: totalH, direction, overlap };
}

function calc_stall_value(table, plName) { 
	const val={A:1,T:10,J:10,Q:10,K:10};
  let st = table.players[plName].stall; 
  if (isEmpty(st)) return 0; 
  else return arrSum(st.map(x => val[x[0]] || Number(x[0])));//uiTypeCard52(x).val)); 
}
function mCardText(ckey, sz, color) {
  let j = is_jolly(ckey);
  if (nundef(color)) color = get_color_of_card(ckey);
  return is_jolly(ckey) ?
    `<span style="font-size:12px;font-family:Algerian;color:${color}">jolly</span>` :
    is_color(ckey) ? `<span style="font-weight:bold;color:${color}">${ckey}</span>` :
      is_color(stringAfter(ckey, '_')) ? `<span style="font-size:16px;font-family:Algerian;color:${color}">${stringBefore(ckey, '_')}</span>` :
        `${ckey[0]}${mSuit(ckey, sz, color)}`;
}
function mSuit(ckey, sz = 20, color = null) {
  let suit = ckey.length == 1 ? ckey : ckey[1];
  let di = { S: '&spades;', H: '&hearts;', D: '&diams;', C: '&clubs;' };
  color = valf(color, suit == 'H' || suit == 'D' ? 'red' : 'black');
  let html = `<span style='color:${color};font-size:${sz}px'>${di[suit]}</span>`;
  return html;
}
async function splayItemsAnim(items, container, {
	direction = 'right',
	overlap = 0.65,
	rotateStep = 0,
	spreadDeg = 40,
	arcRadius,
	padding = 6,
	interactive = 'all',
	hoverRaise = 10,
	selectionColor = 'red',
	selectionWidth = 3,
	animate = true,
	durationMs = 250,
	} = {}) {
	/**
	 * splayItems
	 * ─────────────────────────────────────────────────────────────────────────────
	 * Positions a list of cards or divs in a splay/fan inside a container.
	 * The container is auto-sized; its required dimensions are returned.
	 *
	 * @param {Array<Object|HTMLElement>} items
	 *   Card objects from uiTypeCard52, or plain HTMLElements.
	 *
	 * @param {HTMLElement} container
	 *   Parent element. Gets position:relative and is resized to fit the splay.
	 *
	 * @param {Object} [options]
	 * @param {'right'|'left'|'up'|'down'|
	 *          'down-right'|'down-left'|'up-right'|'up-left'|
	 *          'fan'} [options.direction='right']
	 *
	 * @param {number} [options.overlap=0.65]
	 *   Fraction of each item's width/height hidden behind the next.
	 *   0 = items just touching · 1 = perfect stack · <0 = gap between items.
	 *
	 * @param {number} [options.rotateStep=0]
	 *   Extra rotation in degrees added per item (linear modes only).
	 *   e.g. rotateStep=3 fans the cards slightly while still splaying linearly.
	 *
	 * @param {number} [options.spreadDeg=40]  Fan mode: total arc sweep in degrees.
	 * @param {number} [options.arcRadius]     Fan mode: arc radius in px (auto if omitted).
	 * @param {number} [options.padding=6]     Px gap between splay bounding box and container edge.
	 * @param {number} [options.hoverRaise=10] Px the item lifts upward on hover.
	 * @param {string} [options.selectionColor='red']  Outline colour when selected.
	 * @param {number} [options.selectionWidth=3]      Outline width in px when selected.
	 * @param {boolean}[options.animate=true]
	 * @param {number} [options.durationMs=250]
	 *
	 * @returns {Promise<{width:number, height:number}>}
	 *   Total pixel size required for the container.
	 *
	 * @example
	 *   const { width, height } = await splayItemsAnim(hand, handEl, { direction: 'fan', spreadDeg: 50 });
	 *   handEl.style.width  = width  + 'px';
	 *   handEl.style.height = height + 'px';
	 *
	 *   await splayItemsAnim(deck, deckEl, { direction: 'down-right', overlap: 0.88 });
	 *
	 *   
	 *   await splayItemsAnim(Array.from(container.children), container, { direction: 'right' });
	 */
	if (!items.length) return { width: 0, height: 0 };
	const norm = items.map(_normalizeItem);
	const positions = direction === 'fan'
		? _fanCoords(norm, spreadDeg, arcRadius)
		: _linearCoords(norm, direction, overlap, rotateStep);
	const maxRight = Math.max(...positions.map(p => p.left + p.w));
	const maxBottom = Math.max(...positions.map(p => p.top + p.h));
	const totalW = Math.ceil(maxRight + 2 * padding);
	const totalH = Math.ceil(maxBottom + 2 * padding);
	container.style.position = 'relative';
	container.style.width = `${totalW}px`;
	container.style.height = `${totalH}px`;
	positions.forEach(({ el }) => {
		if (el.parentElement !== container) container.appendChild(el);
	});
	const tr = animate
		? `left ${durationMs}ms ease, top ${durationMs}ms ease, transform ${durationMs}ms ease`
		: 'none';
	positions.forEach(({ el, left, top, rotation, zIndex, original }) => {
		el.dataset.splayRotation = String(rotation);
		el.dataset.splayZIndex = String(zIndex);
		if (original && !(original instanceof HTMLElement)) original.splayRotation = rotation;
		el.style.position = 'absolute';
		el.style.zIndex = String(zIndex);
		el.style.transition = tr;
		el.style.left = `${Math.round(left + padding)}px`;
		el.style.top = `${Math.round(top + padding)}px`;
		el.style.transform = rotation ? `rotate(${rotation.toFixed(2)}deg)` : '';
		if (interactive == 'all' || interactive == 'top' && i == n - 1 || interactive == 'bottom' && i == 0) {
			_bindInteractions(el, { hoverRaise, selectionColor, selectionWidth });
		}
	});
	if (animate) await new Promise(r => setTimeout(r, durationMs));
	return { container, width: totalW, height: totalH, direction, overlap };
}

