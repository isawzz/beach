
function ari_present(dParent) {
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
  mStyle(dOben,{hmin:80});
  //mStyle(dRechts,{bg:'red'}); mStyle(dParent,{bg:'blue'});
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		mStyle(dOben, { hmin: 110 })
	}
	mStyle(dRechts, { wmin: 200,hmin:'100vh' });
	ariStats(dRechts, uplayer, Z);
	//ari_stats(dRechts);
	show_history(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ari_get_card);
	let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', ari_get_card, true);
	let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', ari_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ari_get_card);
	if (exp_commissions(Z.options)) {
		let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', ari_get_card);
		mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
		let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', ari_get_card);
		let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', ari_get_card);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}
	if (exp_church(Z.options)) {
		let church = ui.church = ui_type_church(fen.church, dOpenTable, { maleft: 28 }, 'church', 'church', ari_get_card);
	}
	if (exp_rumors(Z.options)) {
		let deck_rumors = ui.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 25 }, 'deck_rumors', 'rumors', ari_get_card);
	}
	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 9, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 9);
		let hidden = compute_hidden(plname);
		ari_present_player(plname, d, hidden);
		//console.log('!!!',UI)
	}
	// for (const plname of order) {
	// 	let pl = fen.players[plname];
	// 	let ui = UI.players[plname];
	// 	let cont = ui.hand.container;
	// 	mStyle(cont, { bg:'red' });
	// 	let b = mDom(cont, {}, { tag: 'button' });
	// 	let bstyles = { z: 10000, position: 'absolute', hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black' };
	// 	let b1 = mDom(d, { ...bstyles, left: 20, bottom: 2 }, { tag: 'button', innerHTML: 'rank' });
	// 	b1.onclick = () => {
	// 		console.log('b1', b1);
	// 	}


	// 	//showHandSortingButtonsFor(pl,UI.players[plname]);
	// }	//ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;

	show_view_buildings_button(uplayer);
	let desc = ARI_LEGACY.stage[Z.stage];
	Z.isWaiting = false;
	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && is_playerdata_set(uplayer)) {
		if ((Z.mode == 'hotseat' || Z.host == uplayer) && check_resolve()) {
			Z.turn = [Z.host];
			Z.stage = 104; //'next_comm_setup_stage';
		}
		show_waiting_message(`waiting for other players...`);
		Z.isWaiting = true;
	}
}
function ari_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ari_get_card, false, rankstr=aristo().rankstr);
	if (ishidden) { hand.items.map(x => face_down(x)); mRemove(hand.bSort); }
	let stall = ui.stall = ui_type_market(pl.stall, d, { maleft: 12 }, `players.${plname}.stall`, 'stall', ari_get_card);
	if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }
	if (exp_commissions(Z.options)) {
		if (!ishidden) pl.commissions = correct_handsorting(pl.commissions, plname);
		ui.commissions = ui_type_market(pl.commissions, d, { maleft: 12 }, `players.${plname}.commissions`, 'commissions', Z.stage == 23 ? ari_get_card_large : ari_get_card);
		if (ishidden) { ui.commissions.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.commissions.cardcontainer);
	}
	if (exp_rumors(Z.options)) {
		if (!ishidden) pl.rumors = correct_handsorting(pl.rumors, plname);
		ui.rumors = ui_type_market(pl.rumors, d, { maleft: 12 }, `players.${plname}.rumors`, 'rumors', Z.stage == 24 ? ari_get_card_large : ari_get_card);
		if (ishidden) { ui.rumors.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.rumors.cardcontainer);
	}
	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_hand(j, d, { maleft: 12 }, `players.${plname}.journeys.${i}`, '', ari_get_card);//list, dParent, path, title, get_card_func
		i += 1;
		ui.journeys.push(jui);
	}
	mLinebreak(d, 8);
	ui.buildinglist = [];
	ui.indexOfFirstBuilding = arrChildren(d).length;
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let type = k;
			let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card, true, ishidden);
			b_ui.type = k;
			ui.buildinglist.push(b_ui);
			if (b.isblackmailed) { mStamp(b_ui.cardcontainer, 'blackmail'); }
			lookupAddToList(ui, ['buildings', k], b_ui); //GEHT!!!!!!!!!!!!!!!!!!!!!
			i += 1;
		}
	}
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false, rankstr='23456789TJQKA*') {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDom(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
  let bSort;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//ui_add_container_title(title, cont, items, show_if_empty);
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		// mDom(cont, { w100: true, align: 'center', maleft: -2, matop: 2 }, { html: title });
    let d1=mDom(cont,{gap:12,matop:4});mCenterCenterFlex(d1);
    //mButton('sort',()=>{console.log('clicked')},d1,{margin:4,hmax:12});
    bSort=mDom(d1,{hmax:12},{tag:'button',html:'sort'});
    bSort.onclick=()=>{
      console.log('clicked');
      if (Clientdata && Clientdata.handsorting == 'rank') onclick_by_suit(rankstr,'CDSH'); else onclick_by_rank(rankstr);
    }
    mDom(d1,{matop:4},{html:title});
		//mDom(cont, { w100: true, align: 'center', maleft: -2, matop: 2 }, { html: title });

	}
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
    bSort:bSort,
	};
}
function ari_show_handsorting_buttons_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative' });
	let dHandButtons = mDiv(d, { position: 'absolute', bottom: -2, left: 52, height: 25 }, 'dHandButtons');
	show_player_button('sort', dHandButtons, onclick_by_rank);
}

function ariStats(dParent,me, table) {
  let fen = table.fen;
  let players = table.players || table.fen.players;
  let ui = {};
  let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white']; //return {dTable}
  
  statsInit(me, table, { sz, bg, fg, cimgborder, className: 'flexCol',dParent});
  let herald = fen.heraldorder[0];
  for (const plName in players) {
    let pl = players[plName];
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
    if (!isEmpty(players[plName].stall) && fen.stage >= 5 && fen.stage <= 6) {
      statsCount('shinto_shrine', !fen.actionsCompleted.includes(plName) || fen.stage < 6 ? calc_stall_value(table, plName) : '_', d);
    }
    statsCount('star', plName == U.name || isdef(fen.winners) ? ari_calc_real_vps(pl, plName) : ari_calc_fictive_vps(pl, plName), d);
    if (plName == herald) {
      let x = mKey('scroll', d, { fg: 'gold', fz: 24, padding: 4 });
      mStyle(x, { position: 'absolute', top: 0, right: 0 });
    }
  }
  return ui;
}


function syncZFromTable(me, table, resetUI) {
  if (resetUI !== false) { UI = {}; }
  Z = {};
  Z.fen = table.fen;
  Z.stage = table.fen.stage;
  Z.phase = table.fen.phase;
  Z.turn = jsCopy(table.turn);
  Z.plorder = jsCopy(table.plorder);
  Z.uname = me;
  Z.uplayer = table.players[me] ? me : table.turn[0];
  Z.pl = table.players[me] || null;
  Z.options = table.options;
  Z.game = table.game;
  Z.mode = table.options.mode || 'multi';
  Z.host = table.owner;
  Z.friendly = table.friendly;
  Z.role = !is_playing(me, table.fen) ? 'spectator' : table.turn.includes(me) ? 'active' : 'inactive';
  for (const k of ['playerdata', 'state', 'state1', 'state2']) { if (isdef(table[k])) Z[k] = jsCopy(table[k]); }
  A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
  Z.A = A;
}
function syncTableFromZ(table) {
  table.fen = Z.fen;
  table.turn = jsCopy(Z.turn);
  table.plorder = jsCopy(Z.plorder);
  table.fen.stage = Z.stage;
  if (isdef(Z.phase)) table.fen.phase = Z.phase;
  for (const k of ['playerdata', 'state', 'state1', 'state2']) { if (isdef(Z[k])) table[k] = jsCopy(Z[k]); else delete table[k]; }
}
async function take_turn() {
  try {
    let table = DAGetTable(DA.tid);
    syncTableFromZ(table);
    await tableSaveUpdate(table);
    await updateMain(true);
  } catch (err) { console.log(err); }
}
function take_turn_fen() { take_turn(); }
function take_turn_fen_clear() { delete Z.playerdata; take_turn(); }
function take_turn_fen_write() { take_turn(); }
function take_turn_multi() { take_turn(); }
function take_turn_spotit() { take_turn(); }
function take_turn_state1() { take_turn(); }
function take_turn_waiting() { take_turn(); }
function take_turn_write() { take_turn(); }
function autopoll() { return null; }
function send_or_sim() { take_turn(); }
function aristo() {
  function setup(table) {
    let players = Object.keys(table.players);
    Serverdata.users = players.map((n, i) => ({ name: n, color: valf(table.players[n].color, ['red', 'blue', 'green', 'orange', 'purple', 'teal'][i % 6]) }));
    for (const n of players) { if (nundef(table.players[n].color)) table.players[n].color = Serverdata.users.find(x => x.name == n).color; }
    let fen = aristoLegacy().setup(players, table.options);
    for (const n of players) fen.players[n].playmode = table.players[n].playmode;
    table.fen = fen;
    table.plorder = jsCopy(fen.plorder);
    table.turn = jsCopy(fen.turn);
  }
  function present(me, table) {
    syncZFromTable(me, table);
    //console.log('present',me,table);
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    ari_present(dTable);
    return UI;
  }
  async function activate(me, table, ui) {
    syncZFromTable(me, table, false);
    if (!table.players[me]) return;
    ari_activate_ui();
  }
  function checkGameover(table) { return isdef(table.fen.winners) ? table.fen.winners : false; }
  return { setup, present, activate, checkGameover };
}
function ferro() {
  function setup(table) {
    let players = Object.keys(table.players);
    Serverdata.users = players.map((n, i) => ({ name: n, color: valf(table.players[n].color, ['red', 'blue', 'green', 'orange', 'purple', 'teal'][i % 6]) }));
    for (const n of players) { if (nundef(table.players[n].color)) table.players[n].color = Serverdata.users.find(x => x.name == n).color; }
    let fen = ferroLegacy().setup(players, table.options);
    for (const n of players) fen.players[n].playmode = table.players[n].playmode;
    table.fen = fen;
    table.plorder = jsCopy(fen.plorder);
    table.turn = jsCopy(fen.turn);
  }
  function present(me, table) {
    syncZFromTable(me, table);
    showTitleGame(me, table);
    let dTable = stdPresentBGATable(me, table);
    ferro_present(dTable);
    return UI;
  }
  async function activate(me, table, ui) {
    syncZFromTable(me, table, false);
    if (!table.players[me]) return;
    ferro_activate_ui();
  }
  function checkGameover(table) { return isdef(table.fen.winners) ? table.fen.winners : false; }
  return { setup, present, activate, checkGameover };
}
function gluePatchDAInit() {
  let origDAInit = DAInit;
  DAInit = async function () {
    await origDAInit();
    if (!DA.gamelist.includes('ferro')) DA.gamelist.push('ferro');
    DA.funcs.aristo = aristo;
    DA.funcs.ferro = ferro;
    if (nundef(M.config.games.ferro)) M.config.games.ferro = { friendly: 'Ferro', options: { maxrounds: '7,3,1', handsize: '13,11,7', coins: '5,0,3' }, ploptions: { playmode: 'human,bot' } };
  };
}
gluePatchDAInit();
