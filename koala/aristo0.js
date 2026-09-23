
function _ari_pre_action(me, table, ui) {
  console.log(me, ui);
}
function advanceDiscardTo7(table) {
  let fen = table.fen;
  fen.discardIdx++;
  if (fen.discardIdx < fen.playersToDiscard.length) {
    table.turn = [fen.playersToDiscard[fen.discardIdx]];
  } else {
    delete fen.playersToDiscard;
    delete fen.discardIdx;
    fen.ball = [];
    fen.ballContributions = {};
    fen.ballPlayers = [];
    [fen.stage, table.turn] = ariSetStallStage(table);
  }
}
function ariContainer(dParent, id, label) {
  let styles = { wmin: 100, hmin: 150, position: 'relative', alignSelf: 'stretch', bg: 'green', fg: 'white', align: 'center' };
  let cont = mDom(dParent, styles, { id });
  if (label) {
    mDom(cont, { position: 'absolute', bottom: 0, w100: true, align: 'center' }, { html: label })
  }
  return cont;
}
function ariEndPhaseCleanup(table) {
  let fen = table.fen;
  let rankstr = 'A23456789TJQK*';
  let oldPhase = fen.phase;
  for (const cardKey of fen.market) {
    fen.deckDiscard.push(cardKey);
  }
  fen.market = [];
  if (fen.deckDiscard.length > 0) {
    arrShuffle(fen.deckDiscard);
    let n = Math.min(4, fen.deckDiscard.length);
    for (let i = 0; i < n; i++) {
      fen.openDiscard.push(fen.deckDiscard.pop());
    }
  }
  for (const plName of table.plorder) {
    let pl = table.players[plName];
    for (const cardKey of pl.stall) {
      pl.hand.push(cardKey);
    }
    pl.stall = [];
  }
  for (const plName of table.plorder) {
    let pl = table.players[plName];
    let dealt = cDeckDeal(fen.deck, 1);
    pl.hand.push(...dealt);
  }
  let n_market = fen.phase == 'jack' ? 3 : 2;
  fen.market = cDeckDeal(fen.deck, n_market);
  let phaseOrder = ['king', 'queen', 'jack'];
  let idx = phaseOrder.indexOf(fen.phase);
  fen.phase = phaseOrder[(idx + 1) % phaseOrder.length];
  historyAddLines([`${fen.phase} phase begins`], 'market', fen);
  if (oldPhase === 'jack') {
    let heraldIdx = fen.heraldorder.indexOf(fen.herald);
    fen.herald = fen.heraldorder[(heraldIdx + 1) % fen.heraldorder.length];
    historyAddLines([`${fen.herald} is the new herald`], 'market', fen);
    for (const plName of table.plorder) {
      table.players[plName].coins += 1;
    }
    historyAddLines([`each player receives 1 coin`], 'market', fen);
    let playersToDiscard = table.plorder.filter(p => table.players[p].hand.length > 7);
    if (playersToDiscard.length > 0) {
      fen.playersToDiscard = playersToDiscard;
      fen.discardIdx = 0;
      fen.stage = 50;
      table.turn = [playersToDiscard[0]];
      return;
    }
  }
  fen.ball = [];
  fen.ballContributions = {};
  fen.ballPlayers = [];
  [fen.stage, table.turn] = ariSetStallStage(table);
}
function ariExchangeAction(me, table, ui) {
  let fen = table.fen;
  let pl = table.players[me];
  let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}: Select two cards to swap`);
  if (!myTurn || spectating) return;
  let plUi = ui.players[me];
  if (isEmpty(pl.stall)) return;
  let dInst = mBy('dInstruction');
  let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
  mButton('cancel', () => { DA.kingPhase = 'command'; updateUI(); }, dInst, { ...bstyles, bg: '#fcc', maleft: 20 });
  let allItems = [];
  if (isdef(plUi.stallCards)) {
    for (const c of plUi.stallCards) {
      allItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'stall' });
    }
  }
  if (isdef(Items.marketCards)) {
    for (const c of Items.marketCards) {
      allItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'market' });
    }
  }
  for (const plName of table.plorder) {
    if (plName === me) continue;
    let otherUi = ui.players[plName];
    if (nundef(otherUi) || nundef(otherUi.stallCards)) continue;
    for (const c of otherUi.stallCards) {
      allItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'player', owner: plName });
    }
  }
  if (isEmpty(allItems)) return;
  if (nundef(mBy('bCommit'))) {
    mButton('commit', () => {
      let selected = allItems.filter(x => x.state === 'selected');
      if (!isValidExchangePair(selected)) return;
      let myItem = selected.find(x => x.source === 'stall');
      let targetItem = selected.find(x => x.source !== 'stall');
      performExchange(me, table, ui, myItem.key, targetItem);
    }, dInst, { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
    mStyle(mBy('bCommit'), { opacity: 0 });
  }
  for (const item of allItems) {
    showItemAsSelectable(item);
    let d = item.o.div;
    d.onclick = () => {
      toggleItemSelectionState(item);
      let selected = allItems.filter(x => x.state === 'selected');
      let valid = selected.length === 2 && isValidExchangePair(selected);
      mStyle('bCommit', { opacity: valid ? 1 : 0 });
      if (!valid && selected.length > 1) showMessage(`one card must be from your stall and one from the market or another player's stall!`, 3000)
    };
  }
}
function ariFinalizeRumorAssignment(me, table, connections) {
  console.log("All cards assigned:", connections);
}
function ariHideBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_down(x));
  }
}
function ariMakePlayerHandSelectable(me, table, ui) {
  let item = ui.players[me];
  console.log(item);
  for (const c of item.handCards) {
    makeSelectable(c);
    iDiv(c).onclick = () => toggleSelectionState(c);
  }
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
function ariRevealBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_up(x));
  }
  TO.buildings = setTimeout(() => ariHideBuildings(ui), 5000);
}
function ariSetStage(table) {
  let options = table.options;
  let fen = table.fen;
  if (exp_commissions(options)) {
    historyAddLines([`commission trading starts`], 'commissions', fen);
    [fen.stage, table.turn] = [23, table.plorder];
    fen.commSetupNum = 3; fen.keeppolling = true;
  } else if (exp_rumors(options) && table.plorder.length > 2) {
    historyAddLines([`gossiping starts`], 'rumors', fen);
    [fen.stage, table.turn] = [24, table.plorder];
  } else {
    [fen.stage, table.turn] = ariSetStallStage(table);
  }
}
function ariSetStallStage(table) {
  let fen = table.fen;
  delete fen.passed;
  table.turn = [table.plorder[0]];
  fen.stage = fen.phase == 'jack' ? 12 : fen.phase == 'queen' ? 11 : 4;
  fen.stallSelected = [];
  return [fen.stage, table.turn];
}
function ariSetupRumorAssignment(me, table, testing = false) {
  let playerIds = getOtherPlayerNames(table, me);
  let cardIds = table.players[me].rumors;
  let connections = {};
  if (!testing) {
    let dParent = mBy('dInstruction');
    mClear(dParent);
    let d = mDom(dParent, { padding: 10, margin: 10, w100: true }, { className: 'section', }); mCenterFlex(d);
    let line1 = mDom(d, { display: 'flex', gap: 10, margin: 10, place: 'center' },);//mCenterCenterFlex(line1);
    mDom(line1, {}, { html: 'drag user images to rumor cards, then confirm' });
    mButton('commit', async () => ariFinalizeRumorAssignment(me, table, connections), line1, { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectbutton', 'bCommit');
    mStyle(mBy('bCommit'), { border: 'gray' }, { className: 'disabled', disabled: true });
    mLinebreak(d)
    let dg = mGrid(2, table.plorder.length - 1, d, { place: 'center', gap: 10, margin: 20 });
    for (const k of cardIds) {
      let cItem = uiTypeCard52(k, 150);
      let div = cItem.div;
      mAppend(dg, div);
      div.id = k;
      console.log(div.id);
    }
    for (const p of playerIds) {
      let pl = M.users[p];
      let du = mDom(dg, { margin: 10 }, { id: p });
      mAppend(du, get_user_pic(p, 50));
    }
  }
  playerIds.forEach(id => {
    let d = mBy(id);
    let parent = d.parentNode;
    d.setAttribute('data-home', parent.id || 'player-container');
    d.draggable = true;
    d.ondragstart = (ev) => {
      ev.dataTransfer.setData("playerId", id);
    };
  });
  cardIds.forEach(id => {
    let dCard = mBy(id);
    mStyle(dCard, { position: 'relative' });
    dCard.ondragover = (ev) => ev.preventDefault();
    dCard.ondrop = (ev) => {
      ev.preventDefault();
      let newPlayerId = ev.dataTransfer.getData("playerId");
      let newPlayerDiv = mBy(newPlayerId);
      let existingPlayerDiv = Array.from(dCard.children).find(child => playerIds.includes(child.id));
      if (existingPlayerDiv && existingPlayerDiv.id !== newPlayerId) {
        let incomingSource = newPlayerDiv.parentNode;
        mAppend(incomingSource, existingPlayerDiv);
        if (cardIds.includes(incomingSource.id)) {
          mStyle(existingPlayerDiv, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0
          });
          connections[incomingSource.id] = existingPlayerDiv.id;
        } else {
          mStyle(existingPlayerDiv, { position: 'static', transform: 'none' });
        }
      }
      mAppend(dCard, newPlayerDiv);
      mStyle(newPlayerDiv, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0
      });
      connections[id] = newPlayerId;
      if (Object.keys(connections).length === cardIds.length) {
        mStyle(mBy('bCommit'), { opacity: 1 });
      }
    };
  });
}
function ariShowActions(me, table, ui) {
  let fen = table.fen;
  let pl = table.players[me];
  if (pl.stall.length <= 0) { processPass(me,table,ui); return; }
  let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}. Choose an action:`);
  if (!myTurn || spectating) return;
  let dInst = mBy('dInstruction');
  let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
  let canExchange = pl.stall.length >= 1;
  if (canExchange) mButton('Exchange', () => { DA.kingPhase = 'exchange_select_cards'; updateUI(); }, dInst, { ...bstyles, maleft: 20 });
  let canBuild = pl.coins > 0 || hasKingInHand(pl);
  if (canBuild && pl.stall.concat(pl.hand).length >= 4) {
    mButton('Build', () => { DA.kingPhase = 'build_select_payment'; updateUI(); }, dInst, bstyles);
  }
  if (fen.phase == 'jack' && pl.coins > 0 && !isEmpty(fen.openDiscard)) {
    mButton('Buy', () => { DA.kingPhase = 'buy_select_card'; updateUI(); }, dInst, bstyles);
  }
  mButton('Pass', () => { delete DA.kingPhase; processPass(me, table, ui); }, dInst, { ...bstyles, maleft: 20 });
}
function ariShowTitle(table) {
  let fen = table.fen;
  let list = table.turn;
  let d0 = dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { w100: true, patop: 4, wrap: 'nowrap', box: true });
  mStyle(dTitle, flexSpaceBetween());
  let d1 = mDom(d0, { paleft: 12, display: 'flex', alignItems: 'start', justifyContent: 'start' }, { id: 'dTitleLeft' });
  let d2 = mDom(d0, { paright: 10, box: true }, { id: 'dTitleRight' });
  let dPhase = mDom(d1, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
  if (['king', 'queen', 'jack'].some(x => fen.phase == x)) {
    let ph = mDom(dPhase, { wmax: 60, maright: 6 }); //, { html: `Phase: <span style="color:red;font-weight:bold">${capitalize(fen.phase)}</span>` });
    let ph1 = mDom(ph, { fz: 14, deco: 'underline' }, { html: `Phase` });
    let ph2 = mDom(ph, { fz: 18, fg: fen.phase == 'queen' ? 'black' : 'red', weight: 'bold', matop: -2 }, { html: capitalize(fen.phase) });
    let x = mDom(dPhase);
    let rank = fen.phase[0].toUpperCase();
    let card = rank + (fen.phase == 'queen' ? 'Sn' : 'Hn');
    showCardMini(x, card, 44);
  } else {
    dPhase.innerHTML = `Phase: ${fen.phase}`;
  }
  if (TESTING) {
    let dStage = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
    mDom(dStage, { weight: 'bold', fg: 'red', bg: 'yellow', fz: 24 }, { html: `${fen.stage}: ${ARI.stage[fen.stage]}` })
  }
  let dPlayers = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
  mDom(dPlayers, { fz: 14, deco: 'underline' }, { html: 'Turn:' });
  if (sameList(list, table.plorder) && list.length > 2) {
    mDom(dPlayers, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plName of list) {
      let pl = table.players[plName];
      let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
      if (nundef(src)) { src = `../assets/img/users/unknown_user.jpg`; }
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(dPlayers, { cursor: 'pointer', border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
      img.onclick = () => switchToUser(plName);
    }
  }
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(M.config.games[table.game].friendly) + ')';
  mStyle(d2, {}, { html });
}
function ariStats(me, table) {
  let fen = table.fen;
  let ui = {};
  let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white']; //return {dTable}
  statsInit(me, table, { sz, bg, fg, cimgborder, className: 'flexCol' });
  let herald = fen.heraldorder[0];
  for (const plName in table.players) {
    let pl = table.players[plName];
    let d = mBy('dStat_' + plName);
    let item = ui[plName] = { div: d, plName };
    mCenterFlex(d); mLinebreak(d); mStyle(d, { position: 'relative' })
    if (exp_church(table.options)) {
      if (isdef(pl.tithes)) {
        statsCount('cross', pl.tithes.val, d);
      }
    }
    let dCoin = statsCount('coin', pl.coins, d);
    item.dCoin = dCoin.firstChild;
    item.dAmount = dCoin.children[1];
    let list = pl.hand.concat(pl.stall);
    let list_luxury = list.filter(x => x[2] == 'l');
    statsCount('pinching_hand', list.length, d);
    let d1 = statsCount('crown', list_luxury.length, d);
    mStyle(d1.firstChild, { fg: 'gold', fz: 20 })
    if (!isEmpty(table.players[plName].stall) && fen.stage >= 5 && fen.stage <= 6) {
      statsCount('shinto_shrine', !fen.actionsCompleted.includes(plName) || fen.stage < 6 ? calc_stall_value(table, plName) : '_', d);
    }
    statsCount('star', plName == U.name || isdef(fen.winners) ? ari_calc_real_vps(table, plName) : ari_calc_fictive_vps(table, plName), d);
    if (plName == herald) {
      let x = mKey('scroll', d, { fg: 'gold', fz: 24, padding: 4 });
      mStyle(x, { position: 'absolute', top: 0, right: 0 });
    }
  }
  return ui;
}
function ariTransitionToActionStage(table) {
  let fen = table.fen;
  let minval = Infinity, minplayer = null;
  for (const uname of table.plorder) {
    if (fen.actionsCompleted.includes(uname)) continue;
    let stall = table.players[uname].stall;
    if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
    let val = table.players[uname].stall_value = calcStallValue(table, uname);
    console.log(val,uname)
    if (val < minval) { minval = val; minplayer = uname; }
  }
  console.log('minplayer',minplayer,minval)
  if (!minplayer) {
    ariEndPhaseCleanup(table);
  } else {
    fen.stage = 5;
    table.turn = [minplayer];
    fen.numActions = fen.total_pl_actions = table.players[minplayer].stall.length;
    fen.action_number = 1;
  }
}
function ari_calc_fictive_vps(table, plName) {
  let pl = table.players[plName];
  let bs = pl.buildings;
  let vps = calc_building_vps(bs);
  return vps;
}
function ari_calc_real_vps(table, plName) {
  let pl = table.players[plName];
  let bs = ari_get_correct_buildings(pl.buildings);
  let vps = calc_building_vps(bs);
  for (const btype in bs) {
    let blist = bs[btype];
    for (const b of blist) {
      let lead = b.list[0];
      if (firstCond(pl.commissions, x => x[0] == lead[0])) {
        vps += 1;
      }
    }
  }
  return vps;
}
function ari_get_correct_buildings(buildings) {
  let bcorrect = { farm: [], estate: [], chateau: [] };
  for (const type in buildings) {
    for (const b of buildings[type]) {
      let list = b.list;
      let lead = list[0];
      let iscorrect = true;
      for (const key of arrFromIndex(list, 1)) {
        if (key[0] != lead[0]) { iscorrect = false; continue; }
      }
      if (iscorrect) {
        lookupAddIfToList(bcorrect, [type], b);
      }
    }
  }
  return bcorrect;
}
function ari_open_market(fen, phase, deck, market) {
  DA.qanim = [];
  let n_market = phase == 'jack' ? 3 : 2;
  fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
  fen.stallSelected = [];
  delete fen.passed;
  for (let i = 0; i < n_market; i++) {
    DA.qanim.push([qanim_flip_topmost, [deck]]);
    DA.qanim.push([qanim_move_topmost, [deck, market]]);
    DA.qanim.push([q_move_topmost, [deck, market]]);
  }
  DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
  DA.qanim.push([ari_pre_action, []]);
  qanim();
}
function ari_pre_action(me, table, ui) {
  let [fen, pl] = [table.fen, table.players[me]];
  if (fen.numActions > 0) fen.progress = `&nbsp;&nbsp;(action ${fen.action_number} of ${fen.total_pl_actions})`; else delete fen.progress;
  switch (ARI.stage[fen.stage]) {
    case 'stall_selection': {
      DA.stallSelected = [];
      let items = ui.players[me].handCards;
      if (isEmpty(items)) {
        processStallSelected(me, table);
      } else {
        setPlayerInstruction('must select cards for your stall');
        stdPassButton(() => { DA.stallSelected = []; processStallSelected(me, table) })
        stdCommitButton(() => processStallSelected(me, table));
        stdItemSelection(items);
      }
      break;
    }
    case 'show_actions': 
      ariShowActions(me, table, ui); 
      break;
    case 'exchange_select_cards': ariExchangeAction(me, table, ui); break;
    case 'build_select_payment': kingPhaseBuildSelectPayment(me, table, ui); break;
    case 'build_select_cards': kingPhaseBuild(me, table, ui); break;
    case 'buy_select_card': kingPhaseBuySelect(me, table, ui); break;
    case 'ball': {
      let { myTurn, spectating } = stdInstruction(me, table, 'Select cards from your hand to add to the ball (optional)');
      if (!myTurn || spectating) break;
      let plUi = ui.players[me];
      if (isEmpty(pl.hand)) {
        processBallContribution(me, table, ui, []);
        break;
      }
      let handItems = plUi.handCards.map((c, i) => ({ o: c, a: c.key, key: c.key, friendly: c.key, index: i }));
      if (nundef(mBy('bCommit'))) {
        mButton('commit', () => {
          let selected = handItems.filter(x => x.state === 'selected');
          processBallContribution(me, table, ui, selected);
        }, mBy('dInstruction'), { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
        mStyle(mBy('bCommit'), { opacity: 1 });
      }
      for (const item of handItems) {
        showItemAsSelectable(item);
        let d = item.o.div;
        d.onclick = () => {
          toggleItemSelectionState(item);
          let selected = handItems.filter(x => x.state === 'selected');
          mStyle('bCommit', { opacity: 1 });
        };
      }
      break;
    }
    case 'discard_to_7': {
      let excess = pl.hand.length - 7;
      if (excess <= 0) {
        advanceDiscardTo7(table);
        break;
      }
      let { myTurn, spectating } = stdInstruction(me, table, `Discard ${excess} card${excess > 1 ? 's' : ''} from your hand (you have ${pl.hand.length}, max 7)`);
      if (!myTurn || spectating) break;
      let plUi = ui.players[me];
      let handItems = plUi.handCards.map((c, i) => ({ o: c, a: c.key, key: c.key, friendly: c.key, index: i }));
      if (nundef(mBy('bCommit'))) {
        mButton('commit', () => {
          let selected = handItems.filter(x => x.state === 'selected');
          if (selected.length !== excess) return;
          processDiscardTo7(me, table, ui, selected);
        }, mBy('dInstruction'), { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
        mStyle(mBy('bCommit'), { opacity: 0 });
      }
      for (const item of handItems) {
        showItemAsSelectable(item);
        let d = item.o.div;
        d.onclick = () => {
          toggleItemSelectionState(item);
          let selected = handItems.filter(x => x.state === 'selected');
          mStyle('bCommit', { opacity: selected.length === excess ? 1 : 0 });
        };
      }
      break;
    }
    default: console.log('NOT IMPLEMENTED stage is', stageText);
      break;
  }
  return;
  switch (stageText) {
    case 'rumors_weitergeben':
      let rumitems = ui_get_rumors_and_players_items(me);
      if (isEmpty(rumitems)) {
        show_waiting_message('waiting for other players...');
        Z.state = null;
        let done = rumor_playerdata_complete();
        if (done) {
          Z.turn = [Z.host];
          Z.stage = 105;
          clear_transaction();
          take_turn_fen();
        } else autopoll();
      } else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
      break;
    case 'comm_weitergeben':
      let items = ui_get_all_commission_items(me, table, ui);
      DA.selectMin = DA.selectMax = fen.commSetupNum;
      DA.selectItems = items.map(x => x.o.div);
      let text = `must select ${fen.commSetupNum} card${fen.commSetupNum > 1 ? 's' : ''} to discard for commission setup`;
      let { myTurn, spectating } = stdInstruction(me, table, text);
      let handler = async () => process_comm_setup(me, table, items);
      if (nundef(mBy('bCommit'))) {
        mButton('commit', handler, mBy('dInstruction'), { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
        mStyle(mBy('bCommit'), { opacity: 0 });
      }
      for (const item of items) {
        showItemAsSelectable(item);
        let d = item.o.div;
        d.onclick = () => {
          toggleItemSelectionState(item);
          checkShowCommitButton(items, fen.commSetupNum);
        };
      }
      break;
    case 'action step 2':
      switch (A.command) {
        case 'trade': select_add_items(ui_get_trade_items(me), post_trade, 'must select 2 cards to trade', 2, 2); break;
        case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
        case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
        case 'downgrade': select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
        case 'pickup': select_add_items(ui_get_stall_items(me), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
        case 'harvest': select_add_items(ui_get_harvest_items(me), post_harvest, 'must select a farm to harvest from', 1, 1); break;
        case 'sell': select_add_items(ui_get_stall_items(me), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
        case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
        case 'buy rumor': ari_open_rumors(); break;
        case 'exchange': select_add_items(ui_get_exchange_items(me), post_exchange, 'must select cards to exchange', 2, 2); break;
        case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
        case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(me), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
        case 'inspect': select_add_items(ui_get_other_buildings(me), process_inspect, 'must select a building to visit', 1, 1); break;
        case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
        case 'commission': select_add_items(ui_get_commission_items(me, table, ui), process_commission, 'must select a card to commission', 1, 1); break;
        case 'pass': post_pass(); break;
      }
      break;
    case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
    case 'next_rumor_setup_stage': post_rumor_setup(); break;
    case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
    case 'rumor discard': select_add_items(ui_get_rumors_items(me), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
    case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
    case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(me), process_blackmail, 'must select a building to blackmail', 1, 1); break;
    case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
    case 'accept_blackmail': select_add_items(ui_get_stall_items(me), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
    case 'blackmail_complete': post_blackmail(); break;
    case 'journey': select_add_items(ui_get_hand_and_journey_items(me), process_journey, 'may form new journey or add cards to existing one'); break;
    case 'add new journey': post_new_journey(); break;
    case 'TEST_starts_in_stall_selection_complete':
      if (is_stall_selection_complete()) {
        delete fen.stallSelected;
        fen.actionsCompleted = [];
        if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
      } else select_add_items(ui_get_hand_items(me), post_stall_selected, 'must select your stall'); break;
    case 'stall selection': select_add_items(ui_get_hand_items(me), post_stall_selected, 'must select cards for stall'); break;
    case 'church': select_add_items(ui_get_hand_and_stall_items(me), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
    case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(me), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
    case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
    case 'church_minplayer_tithe':
      let pl2 = fen.players[me];
      let hst = pl2.hand.concat(pl2.stall);
      let vals = hst.map(x => ari_get_card(x).val);
      let sum = arrSum(vals);
      let min = fen.tithe_minimum;
      if (sum < min) {
        ari_history_list([`${me} must downgrade a building to tithe ${min}!`], 'downgrade');
        select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
      } else {
        ari_history_list([`${me} must tithe more cards to reach ${min}!`], 'tithe');
        select_add_items(ui_get_hand_and_stall_items(me), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
      }
      break;
    case 'church_newcards':
      reveal_church_cards();
      let itemsChurch = ui_get_church_items(me);
      let num_select = itemsChurch.length == fen.church.length ? 1 : 2;
      let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
      select_add_items(itemsChurch, post_church, instr, num_select, num_select);
      break;
    case 'complementing_market_after_church':
      select_add_items(ui_get_hand_items(me), post_complementing_market_after_church, 'may complement stall'); break;
    case 'tax': let n = fen.pl_tax[me]; select_add_items(ui_get_hand_items(me), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
    case 'build': select_add_items(ui_get_build_items(me, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
    case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
    case 'commission new': select_add_items(ui_get_commission_new_items(me), post_commission, 'must select a new commission', 1, 1); break;
    case 'upgrade': select_add_items(ui_get_build_items(me, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
    case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(me), post_upgrade, 'must select a building', 1, 1); break;
    case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
    case 'buy': select_add_items(ui_get_open_discard_items(me, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
    case 'visit': select_add_items(ui_get_other_buildings(me, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
    case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
    case 'ball': select_add_items(ui_get_hand_items(me), post_ball, 'may add cards to the ball'); break;
    case 'auction: bid': select_add_items(ui_get_coin_amounts(me), process_auction, 'must bid for the auction', 1, 1); break;
    case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
    case 'end game?': select_add_items(ui_get_endgame(me), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
    case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
    case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
    default: //console.log('stage is', stage); 
      break;
  }
}
async function ari_present(me, table) {
  let fen = table.fen;
  let stage = table.fen.stage;
  PrevItems = Items;
  Items = {};
  let dTable = Items.dTable = stdPresentBGATableCols(me, table, 2000);
  ariShowTitle(table);
  DA.stats = ariStats(me, table);
  historyShow(table, 'dStats');
  let dt = Items.dt = mDom(dTable, { pabottom: 20, h100: true, box: true, w100: true, bg: colorLight('#EDC690', 50) });
  let dOpenTable = Items.dOpenTable = mDom(dt, { gap: 4 }, { id: 'dOpenTable' }); mFlexWrap(dOpenTable);
  let deckCards = Items.deckCards = fen.deck.map(key => uiTypeCard52(key));
  let cont = ariContainer(dOpenTable, 'dDeck', 'deck');
  let deck = Items.deck = uiTypeDeck(deckCards, cont);
  let marketCards = Items.marketCards = fen.market.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dMarket', 'market');
  cont = mDom(cont, { margin: 10 });
  let market = Items.market = splayItems(marketCards, cont, { direction: 'right', overlap: -0.1 });
  let openDiscardCards = Items.openDiscardCards = fen.openDiscard.map(key => uiTypeCard52(key));
  cont = ariContainer(dOpenTable, 'dOpenDiscard', 'buy');
  cont = mDom(cont, { margin: 10 });
  let openDiscard = Items.openDiscard = splayItems(openDiscardCards, cont, { direction: 'right', overlap: -0.1 });
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
function aristo() {
  const rankstr = 'A23456789TJQK*';
  async function process(uname, table, keys, m) { }
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let players = table.players;
    let plNames = Object.keys(table.players);
    let n = plNames.length;
    let numDecks = fen.numDecks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
    let deck = fen.deck = c52Decks(numDecks).map(x => x + 'n'); arrShuffle(deck);
    let deckCommission = fen.deckCommission = c52Decks(1).map(x => x + 'c'); arrShuffle(deckCommission);
    let deckLuxury = fen.deckLuxury = c52Decks(1).map(x => x + 'l'); arrShuffle(deckLuxury);
    let deckRumors = fen.deckRumors = c52Decks(1).map(x => x + 'r'); arrShuffle(deckRumors);
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    fen.market = cDeckDeal(deck, 2);
    fen.deckDiscard = [];
    fen.openDiscard = [];
    fen.commissioned = [];
    fen.openCommissions = exp_commissions(options) ? cDeckDeal(deckCommission, 3) : [];
    fen.church = exp_church(options) ? cDeckDeal(deck, plNames.length) : [];
    for (const plName of plNames) {
      let pl = table.players[plName];
      addKeys({
        hand: cSort(cDeckDeal(deck, 7), null, rankstr),
        commissions: exp_commissions(options) ? cSort(cDeckDeal(deckCommission, 4), null, rankstr) : [],
        rumors: exp_rumors(options) ? cSort(cDeckDeal(deckRumors, Object.keys(players).length - 1), null, rankstr) : [],
        peasants: [],
        peasantsUsed: [],
        journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
        buildings: { farm: [], estate: [], chateau: [] },
        stall: [],
        stall_value: 0,
        coins: 3,
        vps: 0,
        score: 0,
        name: plName,
        color: pl.color,
      }, pl);
    }
    fen.phase = 'king'; //TODO: king !!!!!!!
    fen.numActions = 0;
    fen.herald = table.plorder[0];
    fen.heraldorder = jsCopy(table.plorder);
    if (exp_rumors(options)) {
      historyAddLines([`gossiping starts`], 'rumors', fen);
      [fen.stage, table.turn] = [24, table.plorder];
    } else if (exp_commissions(options)) {
      historyAddLines([`commission trading starts`], 'commissions', fen);
      [fen.stage, table.turn] = [23, table.plorder];
      fen.commSetupNum = 3; fen.keeppolling = true;
    } else if (exp_journeys(options)) {
      historyAddLines([`journey starts`], 'journey', fen);
      [fen.stage, table.turn] = [1, table.plorder];
    } else {
      [fen.stage, table.turn] = ariSetStallStage(table);
    }
    table.turn = table.turn.sort();
  }
  function present(me, table) { return ari_present(me, table); }
  function activate(me, table, ui) {
    let dInst = mBy('dInstruction');
    mStyle(dInst, { w100: true, hmin: 50 }, { className: 'section' });
    let myTurn = table.turn.includes(me) && !table.pending.includes(me);
    if (myTurn) { ari_pre_action(me, table, ui); return; }
    let spectating = !Object.keys(table.players).includes(me);
    if (spectating) {
      html = 'you are a spectator!'
    } else if (!myTurn) {
      html = `waiting for: ${getTurnPlayers(table)}`
    }
    dInst.innerHTML = html;
  }
  return { setup, present, activate, process };
}
function calcStallValue(table, plName) {
  let st = table.players[plName].stall;
  if (isEmpty(st)) return 0;
  let rankvals = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 1 };
  return arrSum(st.map(x => rankvals[x[0]] || 0));
}
function calc_stall_value(table, plName) { 
  const val={A:1,T:10,J:10,Q:10,K:10};
  let st = table.players[plName].stall; 
  if (isEmpty(st)) return 0; 
  else return arrSum(st.map(x => val[x[0]] || Number(x[0])));
}
function hasKingInHand(pl) {
  return pl.hand.some(k => k[0] === 'K');
}
function isValidExchangePair(selected) {
  if (selected.length !== 2) return false;
  let hasStall = selected.some(x => x.source === 'stall');
  let hasTarget = selected.some(x => x.source !== 'stall');
  return hasStall && hasTarget;
}
function kingPhaseBuildSelectCards(me, table, ui) {
  let fen = table.fen;
  let pl = table.players[me];
  let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}: Select 4-6 cards for building (first = face-up lead)`);
  if (!myTurn || spectating) return;
  let dInst = mBy('dInstruction');
  let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
  mButton('cancel', () => { delete DA.buildPayment; DA.kingPhase = 'command'; updateUI(); }, dInst, { ...bstyles, bg: '#fcc', maleft: 20 });
  let plUi = ui.players[me];
  let buildItems = [];
  if (isdef(plUi.handCards)) {
    for (const c of plUi.handCards) {
      buildItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'hand' });
    }
  }
  if (isdef(plUi.stallCards)) {
    for (const c of plUi.stallCards) {
      buildItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'stall' });
    }
  }
  if (isEmpty(buildItems)) return;
  if (nundef(mBy('bCommit'))) {
    mButton('commit', () => {
      let selected = buildItems.filter(x => x.state === 'selected');
      if (selected.length < 4 || selected.length > 6) return;
      performBuild(me, table, ui, selected);
    }, dInst, { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
    mStyle(mBy('bCommit'), { opacity: 0 });
  }
  for (const item of buildItems) {
    showItemAsSelectable(item);
    let d = item.o.div;
    d.onclick = () => {
      toggleItemSelectionState(item);
      let selected = buildItems.filter(x => x.state === 'selected');
      let show = selected.length >= 4 && selected.length <= 6 ? 1 : 0;
      mStyle('bCommit', { opacity: show });
    };
  }
}
function kingPhaseBuildSelectPayment(me, table, ui) {
  let fen = table.fen;
  let pl = table.players[me];
  let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}: Select payment for building (coin or King card)`);
  if (!myTurn || spectating) return;
  let dInst = mBy('dInstruction');
  let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
  mButton('cancel', () => { DA.kingPhase = 'command'; updateUI(); }, dInst, { ...bstyles, bg: '#fcc', maleft: 20 });
  if (pl.coins > 0) {
    mButton(`Pay Coin (${pl.coins} left)`, () => {
      DA.buildPayment = { type: 'coin' };
      DA.kingPhase = 'build_select_cards';
      updateUI();
    }, dInst, bstyles);
  }
  let plUi = ui.players[me];
  let kingCards = plUi.handCards.filter(c => c.key[0] === 'K');
  for (const c of kingCards) {
    mButton(`Pay ${c.key}`, () => {
      DA.buildPayment = { type: 'king', key: c.key };
      DA.kingPhase = 'build_select_cards';
      updateUI();
    }, dInst, bstyles);
  }
}
function kingPhaseBuySelectCard(me, table, ui) {
  let fen = table.fen;
  let pl = table.players[me];
  let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}: Select a card to buy (1 coin)`);
  if (!myTurn || spectating) return;
  let dInst = mBy('dInstruction');
  let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
  mButton('cancel', () => { DA.kingPhase = 'command'; updateUI(); }, dInst, { ...bstyles, bg: '#fcc', maleft: 20 });
  let buyItems = [];
  if (isdef(Items.openDiscardCards)) {
    for (const c of Items.openDiscardCards) {
      buyItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'openDiscard' });
    }
  }
  if (isEmpty(buyItems)) return;
  for (const item of buyItems) {
    showItemAsSelectable(item);
    let d = item.o.div;
    d.onclick = () => {
      performBuy(me, table, ui, item);
    };
  }
}
async function performBuild(me, table, ui, selectedItems) {
  let fen = table.fen;
  let pl = table.players[me];
  let selectedKeys = selectedItems.map(x => x.key);
  let numCards = selectedKeys.length;
  let buildingType = numCards === 4 ? 'farm' : numCards === 5 ? 'estate' : 'chateau';
  if (DA.buildPayment.type === 'coin') {
    pl.coins -= 1;
  } else {
    removeInPlace(pl.hand, DA.buildPayment.key);
  }
  for (const ckey of selectedKeys) {
    removeInPlace(pl.hand, ckey);
    removeInPlace(pl.stall, ckey);
  }
  let building = { list: selectedKeys, lead: selectedKeys[0], schweine: [], rumors: [], h: false, isBlackmailed: false };
  pl.buildings[buildingType].push(building);
  let vps = buildingType === 'farm' ? 1 : buildingType === 'estate' ? 2 : 3;
  pl.vps += vps;
  historyAddLines([`${me} builds a ${buildingType} (${vps} VP) with ${selectedKeys.join(', ')} paying ${DA.buildPayment.type === 'coin' ? '1 coin' : DA.buildPayment.key}`], 'king', fen);
  delete DA.buildPayment;
  delete DA.kingPhase;
  await processActionCompleted(me, table);
}
async function performBuy(me, table, ui, item) {
  let fen = table.fen;
  let pl = table.players[me];
  let cardKey = item.key;
  let idx = fen.openDiscard.indexOf(cardKey);
  if (idx >= 0) {
    fen.openDiscard.splice(idx, 1);
  } else {
    return;
  }
  pl.stall.push(cardKey);
  pl.coins -= 1;
  historyAddLines([`${me} buys ${cardKey} for 1 coin`], 'king', fen);
  delete DA.kingPhase;
  await processActionCompleted(me, table);
}
async function performExchange(me, table, ui, myCardKey, targetItem) {
  let fen = table.fen;
  let pl = table.players[me];
  let targetKey = targetItem.key;
  if (targetItem.source === 'market') {
    let idx = fen.market.indexOf(targetKey);
    if (idx >= 0) fen.market[idx] = myCardKey; else fen.market.push(myCardKey);
    removeInPlace(pl.stall, myCardKey);
    pl.stall.push(targetKey);
    historyAddLines([`${me} exchanges ${myCardKey} with market ${targetKey}`], 'king', fen);
  } else if (targetItem.source === 'player') {
    let otherPl = table.players[targetItem.owner];
    removeInPlace(pl.stall, myCardKey);
    removeInPlace(otherPl.stall, targetKey);
    pl.stall.push(targetKey);
    otherPl.stall.push(myCardKey);
    historyAddLines([`${me} exchanges ${myCardKey} with ${targetItem.owner}'s ${targetKey}`], 'king', fen);
  }
  delete DA.kingPhase;
  await processActionCompleted(me, table);
}
async function processActionCompleted(me, table) {
  let fen = table.fen;
  fen.numActions -= 1;
  fen.action_number += 1;
  if (fen.numActions <= 0) {
    fen.actionsCompleted.push(me);
    ariTransitionToActionStage(table);
  }
  await tableSaveUpdate(table);
  await updateUI();
}
async function processBallContribution(me, table, ui, handItems) {
  let fen = table.fen;
  let pl = table.players[me];
  let rankstr = 'A23456789TJQK*';
  let selectedKeys = handItems.filter(x => x.state === 'selected').map(x => x.key);
  for (const ckey of selectedKeys) {
    removeInPlace(pl.hand, ckey);
    fen.ball.push(ckey);
  }
  fen.ballContributions[me] = selectedKeys.length;
  fen.ballPlayers.push(me);
  if (selectedKeys.length > 0) {
    historyAddLines([`${me} adds ${selectedKeys.length} card${selectedKeys.length > 1 ? 's' : ''} to the ball`], 'market', fen);
  }
  if (fen.ballPlayers.length === table.plorder.length) {
    redistributeBall(table);
  } else {
    table.turn = [get_next_player(table, me)];
  }
  await tableSaveUpdate(table);
  await updateUI();
}
async function processDiscardTo7(me, table, ui, handItems) {
  let fen = table.fen;
  let pl = table.players[me];
  let rankstr = 'A23456789TJQK*';
  let selectedKeys = handItems.filter(x => x.state === 'selected').map(x => x.key);
  for (const ckey of selectedKeys) {
    removeInPlace(pl.hand, ckey);
    fen.deckDiscard.push(ckey);
  }
  pl.hand = cSort(pl.hand, null, rankstr);
  historyAddLines([`${me} discards ${selectedKeys.length} card${selectedKeys.length > 1 ? 's' : ''}`], 'market', fen);
  advanceDiscardTo7(table);
  await tableSaveUpdate(table);
  await updateUI();
}
async function processPass(me, table, ui) {
  let fen = table.fen;
  fen.actionsCompleted.push(me);
  ariTransitionToActionStage(table);
  await tableSaveUpdate(table);
  await updateUI();
}
async function processStallSelected(me, table) {
  let fen = table.fen;
  let pl = table.players[me];
  let selectedKeys = DA.stallSelected; 
  for (const ckey of selectedKeys) {
    removeInPlace(pl.hand, ckey);
    pl.stall.push(ckey);
  }
  if (nundef(fen.stallSelected)) fen.stallSelected = [];
  fen.stallSelected.push(me);
  historyAddLines([`${me} puts up a stall for ${selectedKeys.length} card${selectedKeys.length > 1 ? 's' : ''}`], 'market', fen);
  if (fen.stallSelected.length === table.plorder.length) {
    delete fen.stallSelected;
    fen.actionsCompleted = [];
    ariTransitionToActionStage(table);
  } else {
    table.turn = [get_next_player(table, me)];
  }
  delete DA.stallSelected;
  await tableSaveUpdate(table);
  await updateUI();
}
function redistributeBall(table) {
  let fen = table.fen;
  let rankstr = 'A23456789TJQK*';
  let ballCards = jsCopy(fen.ball);
  arrShuffle(ballCards);
  let i = 0;
  for (const plName of table.plorder) {
    let pl = table.players[plName];
    let n = fen.ballContributions[plName] || 0;
    for (let j = 0; j < n; j++) {
      pl.hand.push(ballCards[i]);
      i++;
    }
    pl.hand = cSort(pl.hand, null, rankstr);
  }
  if (ballCards.length > 0) {
    historyAddLines([`the ball is redistributed (${ballCards.length} cards)`], 'market', fen);
  }
  delete fen.ball;
  delete fen.ballContributions;
  delete fen.ballPlayers;
  fen.actionsCompleted = [];
  console.log(jsCopy(fen));
  ariTransitionToActionStage(table);
}
