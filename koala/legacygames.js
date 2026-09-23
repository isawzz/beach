const ARI_LEGACY = {
	sz_hand: 7,
	stage: {
		1: 'journey',
		2: 'tax',
		3: 'auto market',
		4: 'stall selection',
		1004: 'TEST_starts_in_stall_selection_complete',
		5: 'action: command',
		6: 'action step 2',
		7: 'action 3',
		8: 'action 4',
		9: 'action 5',
		10: 'end game?',
		11: 'ball',
		12: 'auction: bid',
		13: 'auction: buy',
		14: 'complementing_market_after_church',
		15: 'commission',
		16: 'commission new',
		17: 'church',
		18: 'church_minplayer_tithe',
		19: 'church_newcards',
		20: 'payment action',
		21: 'church_minplayer_tithe_add',
		22: 'church_minplayer_tithe_downgrade',
		23: 'comm_weitergeben',
		24: 'rumors_weitergeben',
		25: 'rumor',
		26: 'blackmail',
		blackmail: 26,
		27: 'inspect',
		rumor: 25,
		28: 'buy rumor',
		'buy rumor': 28,
		29: 'rumor discard',
		30: 'pick luxury or journey cards',
		31: 'add new journey',
		32: 'rumor_both',
		33: 'blackmail_owner',
		34: 'accept_blackmail',
		35: 'blackmail_complete',
		36: 'reject_blackmail',
		37: 'commission_stall',
		38: 'pick_schwein',
		40: 'trade',
		41: 'build',
		42: 'visit',
		43: 'buy',
		44: 'upgrade',
		45: 'downgrade',
		46: 'visit destroy',
		build: 41,
		upgrade: 44,
		downgrade: 45,
		visit: 42,
		buy: 43,
		100: 'pickup end',
		101: 'build end',
		102: 'select building to upgrade',
		103: 'select downgrade cards',
		104: 'next_comm_setup_stage',
		105: 'next_rumor_setup_stage',
	}
};
function aristoLegacy() {
	const rankstr = 'A23456789TJQK*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = create_fen_deck('n', num_decks);
		shuffle(deck);
		let deck_commission = fen.deck_commission = create_fen_deck('c'); shuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = create_fen_deck('l'); shuffle(deck_luxury);
		let deck_rumors = fen.deck_rumors = exp_rumors(options) ? create_fen_deck('r') : []; shuffle(deck_rumors);
		shuffle(fen.plorder);
		fen.market = [];
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = []; //eg., [Q,A,5,...]
		fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
		fen.church = exp_church(options) ? deck_deal(deck, players.length) : [];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 7),
				commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
				rumors: exp_rumors(options) ? deck_deal(deck_rumors, players.length - 1) : [],
				journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
				buildings: { farm: [], estate: [], chateau: [] },
				stall: [],
				stall_value: 0,
				coins: 3,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.phase = 'king'; //TODO: king !!!!!!!
		fen.num_actions = 0;
		fen.herald = fen.plorder[0];
		fen.heraldorder = jsCopy(fen.plorder);
		if (exp_commissions(options)) {
			ari_history_list([`commission trading starts`], 'commissions', fen);
			[fen.stage, fen.turn] = [23, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; fen.comm_setup_num = 3; fen.keeppolling = true;
		} else if (exp_rumors(options) && fen.plorder.length > 2) {
			ari_history_list([`gossiping starts`], 'rumors', fen);
			[fen.stage, fen.turn] = [24, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
		} else[fen.stage, fen.turn] = set_journey_or_stall_stage(fen, options, fen.phase);
		return fen;
	}
	function activate_ui() { ari_activate_ui(); }
	function check_gameover(z) { return isdef(z.fen.winners) ? z.fen.winners : false; }
	function present(dParent) { ari_present(dParent); }
	function stats(dParent) { ari_stats(dParent); }
	function state_info(dParent) { ari_state(dParent); }
	function get_selection_color(item) {
		if (Z.stage == 41 && Z.A.selected.length == 1) return 'blue'; return 'red';
	}
	return { get_selection_color, rankstr, setup, activate_ui, check_gameover, present, state_info, stats };
}
function ferroLegacy() {
	const rankstr = '23456789TJQKA*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		options.jokers_per_group = 1;
		fen.allGoals = ['7R', '55', '5', '44', '4', '33', '3'];
		fen.availableGoals = options.maxrounds == 1 ? [rChoose(fen.allGoals)] : options.maxrounds < 7 ? rChoose(fen.allGoals, options.maxrounds) : fen.allGoals;
		fen.availableGoals.sort((a, b) => fen.allGoals.indexOf(a) - fen.allGoals.indexOf(b)); //sorted most difficult first
		fen.roundGoals = arrReverse(fen.availableGoals); //sorted easiest first!
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		if (DA.TESTING != true) { shuffle(fen.plorder); shuffle(fen.plorder); } //shuffletest(fen.plorder);		}
		let starter = fen.plorder[0];
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				roundgoal: false,
				coins: options.coins, //0, //10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = {};
			for (const g of fen.availableGoals) { pl.goals[g] = 0; }//console.log('g',g);  { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function activate_ui() { ferro_activate_ui(); }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function clear_ack() {
		if (Z.stage == 'round_end') { start_new_round_ferro(); take_turn_fen(); }
		else if (Z.stage != 'card_selection') {
			for (const plname of Z.fen.canbuy) {
				let pldata = firstCond(Z.playerdata, x => x.name == plname);
				if (isdef(pldata) && lookup(pldata, ['state', 'buy']) == true) {
					Z.fen.buyer = plname;
					break;
				}
			}
			Z.stage = 'can_resolve';
			ferro_change_to_card_selection();
		}
	}
	function present(dParent) { ferro_present(dParent); }
	function stats(dParent) { ferro_stats(dParent); }
	function state_info(dParent) { ferro_state(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}
function HPLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mInsert(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'hp';
}
function HRPLayout() {
	let dr = UI.dRechts;
	dr.remove();
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	mAppend(dTable, dr);
	Clientdata.historyLayout = 'hrp';
}
function PHLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mAppend(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'ph';
}
function PRHLayout() {
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	Clientdata.historyLayout = 'prh';
}
function a2_pay_with_card(item) {
	let fen = Z.fen;
	let source = lookup(fen, item.path.split('.'));
	elem_from_to_top(item.key, source, fen.deck_discard);
	ari_reorg_discard(fen);
}
function a2_pay_with_coin(uplayer) {
	let fen = Z.fen;
	fen.players[uplayer].coins -= 1;
}
function activate_ui() {
	if (uiActivated) { DA.ai_is_moving = false; return; }
	uiActivated = true; DA.ai_is_moving = false;
}
function add_advanced_ui(dParent) {
	mDiv(dParent, {}, 'dAdvancedUI');
	show_advanced_ui_buttons();
}
function add_schwein(card, fenbuilding, uibuilding) {
	if (isdef(uibuilding)) add_ui_schwein(card, uibuilding.schweine);
	let ckey = isString(card) ? card : card.key;
	let index = isString(card) ? fenbuilding.list.indexOf(ckey) : card.index;
	fenbuilding.schweine.push(index);
	console.log('fen schweine', fenbuilding.schweine);
}
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	DA.transactionlist.push(cmd);
}
function add_ui_schwein(item, uischweine) {
	uischweine.push(item);
	mStyle(iDiv(item), { position: 'relative' });
	miPic('pig', iDiv(item), { position: 'absolute', top: 30, left: 0, fz: 30 });
	face_up(item);
}
function ai_move(ms = 100) {
	DA.ai_is_moving = true;
	let [A, fen] = [valf(Z.A, {}), Z.fen];
	let selitems;
	if (Z.game == 'accuse' && Z.stage == 'hand') {
		selitems = [];
	} else if (Z.game == 'ferro') {
		if (Z.stage == 'card_selection') {
			let uplayer = Z.uplayer;
			let i1 = firstCond(A.items, x => x.path.includes(`${uplayer}.hand`));
			let i2 = firstCond(A.items, x => x.key == 'discard');
			selitems = [i1, i2];
		} else if (Z.stage == 'buy_or_pass') {
			selitems = [A.items[1]]; //waehlt immer pass
		} else selitems = [A.items[0]];
	} else if (Z.game == 'bluff') {
		let [newbid, handler] = bluff_ai();
		if (newbid) { fen.newbid = newbid; UI.dAnzeige.innerHTML = bid_to_string(newbid); }
		else if (handler != handle_gehtHoch) { bluff_generate_random_bid(); }
		A.callback = handler;
		selitems = [];
	} else if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade') {
		selitems = [rChoose(A.items)];
	} else if (A.command == 'rumor') {
		selitems = [];
		let buildings = A.items.filter(x => x.path.includes('building'));
		let rumors = A.items.filter(x => !x.path.includes('building'));
		selitems = [rChoose(buildings), rChoose(rumors)];
	} else if (ARI_LEGACY.stage[Z.stage] == 'rumors_weitergeben') {
		let players = A.items.filter(x => Z.plorder.includes(x.key))
		let rumors = A.items.filter(x => !Z.plorder.includes(x.key))
		selitems = [rChoose(players), rChoose(rumors)];
	} else if (ARI_LEGACY.stage[Z.stage] == 'journey') {
		selitems = []; // always pass!
	} else {
		let items = A.items;
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];
	}
	for (const item of selitems) {
		select_last(item, select_toggle);
		if (isdef(item.submit_on_click)) A.selected.pop();
	}
	clearTimeout(TO.ai);
	loader_on();
	TO.ai = setTimeout(() => { if (isdef(A.callback)) A.callback(); loader_off(); }, ms);
}
function ai_pick_legal_exchange() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let firstPick = rChoose(items, 1, x => x.path.includes('building'));
	let secondPick = rChoose(items, 1, x => !x.path.includes('building'));
	return [firstPick, secondPick];
}
function ai_pick_legal_trade() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let stall = fen.players[uplayer].stall;
	let firstPick = rChoose(items, 1, x => x.path.includes(uplayer)); //stall.includes(x.key));
	let secondPick = rChoose(items, 1, x => !x.path.includes(uplayer));
	return [firstPick, secondPick];
}
function animate_card_exchange(i0, i1, callback) {
	ari_make_unselectable(i0);
	ari_make_unselectable(i1);
	let d0 = iDiv(i0.o);
	let d1 = iDiv(i1.o);
	let r0 = getRect(d0);
	let r1 = getRect(d1);
	let c0 = { x: r0.x + r0.w / 2, y: r0.y + r0.h / 2 };
	let c1 = { x: r1.x + r1.w / 2, y: r1.y + r1.h / 2 };
	let v = { x: c1.x - c0.x, y: c1.y - c0.y };
	mTranslateBy(d0, v.x, v.y);
	mTranslateBy(d1, -v.x, -v.y, 700, callback);
}
function animate_card_transfer(card, goal, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal); //das muss irgendein UI item sein!
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mTranslateBy(d, v.x, v.y, 700, callback);
}
function animbuilding(ui_building, ms = 800, callback = null) {
	let d = ui_building.cardcontainer;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = callback;
}
function animcoin(plname, ms = 800, callback = null) {
	let d = UI.player_stat_items[plname].dCoin;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(3)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = () => {
		let uplayer = Z.uplayer;
		let dAmount = UI.player_stat_items[uplayer].dAmount;
		dAmount.innerHTML = Z.fen.players[uplayer].coins;
		mStyle(dAmount, { fg: 'red' });
		if (callback) callback();
	};
}
function apiphp(o, saveFromZ = false) {
	let [data, cmd] = [o.data, o.cmd];
	let result = {}, friendly, uname, state, player_status, fen;
	if (saveFromZ && isdef(data.friendly) && !db_table_exists(data.friendly)) {
		let res = db_new_table(data.friendly, Z.game, Z.host, jsCopy(Z.playerlist), jsCopy(Z.fen), jsCopy(Z.options));
		if (isdef(Z.playerdata)) res.playerdata = jsCopy(Z.playerdata);
	}
	if (cmd == 'table') {
		if (isdef(data.auto)) result.auto = data.auto;
		friendly = data.friendly;
		uname = data.uname;
		result.status = "table";
		if (isdef(data.clear_players)) {
			result.playerdata = db_clear_players(friendly);
			result.status = "clear_players";
		} else if (isdef(data.write_player) && isdef(data.state)) {
			player_status = isdef(data.player_status) ? data.player_status : '';
			result.playerdata = db_write_player(friendly, uname, data.state, player_status);
			result.status = "write_player";
		} else {
			result.playerdata = db_read_playerdata(friendly);
		}
		if (isdef(data.write_fen)) {
			result.table = db_write_fen(friendly, data.fen);
			result.status += " write_fen";
		} else {
			result.table = db_read_table(friendly);
		}
	} else if (cmd == 'startgame') {
		let res = db_new_table(data.friendly, data.game, data.host, data.players, data.fen, data.options);
		result.table = res.table;
		result.playerdata = res.playerdata;
		result.status = `startgame ${data.friendly}`;
	} else if (cmd == 'tables') {
		result.tables = dict2list(GT, 'friendly').map(x => x.table);
		result.status = "tables";
	} else if (cmd == 'gameover') {
		result.table = db_write_fen(data.friendly, data.fen, data.scoring);
		result.status = `scored table ${data.friendly}`;
	}
	return result;
}
function ari_activate_ui() { ari_pre_action(); }
function ari_add_hand_card() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		ari_ensure_deck(fen, 1);
		top_elem_from_to(fen.deck, fen.players[uplayer].hand);
	}
}
function ari_add_harvest_cards(fen) {
	for (const plname of fen.plorder) {
		for (const f of fen.players[plname].buildings.farm) {
			if (nundef(f.h)) {
				let list = [];
				ari_ensure_deck(fen, 1);
				top_elem_from_to(fen.deck, list);
				f.h = list[0];
			}
		}
	}
}
function ari_calc_fictive_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_calc_real_vps(fen, plname) {
	let pl = fen.players[plname];
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
function ari_check_action_available(a, fen, uplayer) {
	let cards;
	let pl = fen.players[uplayer];
	if (a == 'trade') {
		cards = ari_get_all_trading_cards(fen);
		let not_pl_stall = cards.filter(x => !pl.stall.includes(x.key));
		return cards.length >= 2 && pl.stall.length > 0 && not_pl_stall.length > 0;
	} else if (a == 'exchange') {
		cards = ari_get_all_wrong_building_cards(fen, uplayer);
		return cards.length > 0 && (pl.hand.length + pl.stall.length > 0);
	} else if (a == 'build') {
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (res.length < 4) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && (!has_a_king || res.length < 5)) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		if (isEmpty(pl.buildings.farm) && isEmpty(pl.buildings.estate)) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (isEmpty(res)) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		return true;
	} else if (a == 'buy') {
		if (fen.open_discard.length == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (fen.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		let harvests = ari_get_all_building_harvest_cards(fen, uplayer);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		return true;
	} else if (a == 'commission') {
		for (const c of pl.commissions) {
			let rank = c[0];
			if (firstCond(pl.stall, x => x[0] == rank)) return true; //nur wenn in stall!!!!!!
		}
		return false;
	} else if (a == 'rumor') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		return true;
	} else if (a == 'inspect') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		return n > 0;
	} else if (a == 'blackmail') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				let list = fen.players[plname].buildings[k];
				let building_with_rumor = firstCond(list, x => !isEmpty(x.rumors));
				if (building_with_rumor) n++;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'buy rumor') {
		if (fen.deck_rumors.length == 0) return false;
		if (pl.coins < 1) return false;
		return true;
	}
}
function ari_check_end_condition(blist) {
	let nchateau = blist.chateau.length;
	let nfarm = blist.farm.length;
	let nestate = blist.estate.length;
	if (nchateau >= 2 || nchateau >= 1 && nfarm >= 3 || nchateau >= 1 && nestate >= 2) {
		return true;
	}
	return false;
}
function ari_clear_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	for (const prop of ['church', 'church_order', 'selorder', 'tithemin', 'tithe_minimum', 'toBeSelected', 'candidates']) delete fen[prop];
	for (const plname in fen.players) {
		delete fen.players[plname].tithes;
	}
	fen.church = ari_deck_deal_safe(fen, Z.plorder.length);
}
function ari_deck_deal_safe(fen, n) { ari_ensure_deck(fen, n); return deck_deal(fen.deck, n); }
function ari_ensure_deck(fen, n) {
	if (fen.deck.length < n) { ari_refill_deck(fen); }
}
function ari_get_actions(uplayer) {
	let fen = Z.fen;
	let actions = exp_rumors(Z.options) ? ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'buy rumor', 'rumor', 'inspect', 'blackmail', 'harvest', 'pickup', 'sell', 'tithe', 'commission']
		: ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tithe', 'commission'];
	if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		let avail = ari_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;
}
function ari_get_all_building_harvest_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
	for (const b of pl.buildings.farm) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_trading_cards(fen) {
	let res = [];
	fen.market.map(c => res.push({ key: c, path: 'market' }));
	for (const uplayer of fen.plorder) {
		let pl = fen.players[uplayer];
		let stall = pl.stall;
		stall.map(x => res.push({ key: x, path: `players.${uplayer}.stall` }));
	}
	return res;
}
function ari_get_all_wrong_building_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
	for (const k in pl.buildings) {
		for (const b of pl.buildings[k]) {
			let bcards = b.list;
			let lead = bcards[0];
			let [rank, suit] = [lead[0], lead[1]];
			for (let i = 1; i < bcards.length; i++) {
				if (bcards[i][0] != rank) res.push({ c: bcards[i], building: b });
			}
		}
	}
	return res;
}
function ari_get_card(ckey, h, w, ov = .3) {
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	else if (type == 'h') heritage_card_deco(card);
	return card;
}
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
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
	return bcorrect; // [bcorrect, realvps];
}
function ari_get_first_tax_payer(fen, pl_tax) { return ari_get_tax_payer(fen, pl_tax, 0); }
function ari_get_max_journey_length(fen, uplayer) {
	let pl = fen.players[uplayer];
	let sorted_journeys = sortByDescending(pl.journeys.map(x => ({ arr: x, len: x.length })), 'len');
	return isEmpty(pl.journeys) ? 0 : sorted_journeys[0].len;
}
function ari_get_player_hand_and_stall(fen, uplayer) {
	let res = [];
	res = res.concat(fen.players[uplayer].hand);
	res = res.concat(fen.players[uplayer].stall);
	return res;
}
function ari_get_tax_payer(fen, pl_tax, ifrom = 0) {
	let iturn = ifrom;
	let uplayer = fen.plorder[iturn];
	if (nundef(uplayer)) return null;
	while (pl_tax[uplayer] <= 0) {
		iturn++;
		if (iturn >= fen.plorder.length) return null;
		uplayer = fen.plorder[iturn];
	}
	return uplayer;
}
function ari_history_list(lines, title = '', fen) {
	if (nundef(fen)) fen = Z.fen;
	if (nundef(fen.history)) fen.history = [];
	if (isString(lines)) lines = [lines];
	fen.history.push({ title: title, lines: lines });
}
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'player': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_selected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'player': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'player': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'player': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}
}
function ari_move_herald(fen) {
	fen.heraldorder = arrCycle(fen.heraldorder, 1);
	ari_history_list([`*** new herald: ${fen.heraldorder[0]} ***`], 'herald');
	return fen.heraldorder[0];
}
function ari_move_market_to_discard() {
	let fen = Z.fen;
	while (fen.market.length > 0) {
		elem_from_to_top(fen.market[0], fen.market, fen.deck_discard);
	}
	ari_reorg_discard();
}
function ari_move_stalls_to_hands() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		fen.players[uplayer].hand = fen.players[uplayer].hand.concat(fen.players[uplayer].stall);
		fen.players[uplayer].stall = [];
	}
}
function ari_next_action() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	deactivate_ui();
	console.assert(isdef(Z.num_actions));
	fen.num_actions -= 1;
	fen.action_number += 1;
	if (fen.num_actions <= 0) {
		fen.total_pl_actions = 0;
		lookupAddIfToList(fen, ['actionsCompleted'], uplayer);
		let next = ari_select_next_player_according_to_stall_value(fen);
		if (!next) {
			ari_next_phase();
		} else {
			Z.turn = [next];
		}
	} else {
		Z.stage = 5;
	}
	take_turn_fen();
}
function ari_next_phase() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_move_market_to_discard();
	ari_move_stalls_to_hands();
	ari_add_hand_card();
	delete fen.actionsCompleted;
	delete fen.stallSelected;
	Z.turn = [fen.plorder[0]];
	if (Z.stage == 10) {
		Z.phase = 'queen';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else if (fen.phase == 'king') {
		fen.pl_gameover = [];
		for (const plname of fen.plorder) {
			let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			if (can_end) fen.pl_gameover.push(plname);
		}
		if (!isEmpty(fen.pl_gameover)) {
			Z.stage = 10;
			Z.turn = [fen.pl_gameover[0]];
		} else {
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
		}
	} else if (fen.phase == 'queen') {
		for (const uplayer of fen.plorder) {
			for (const k in fen.players[uplayer].buildings) {
				if (k == 'farm') continue;
				let n = fen.players[uplayer].buildings[k].length;
				fen.players[uplayer].coins += n;
				if (n > 0) ari_history_list([`${uplayer} gets ${n} coins for ${k} buildings`], 'payout');
			}
		}
		Z.phase = 'jack';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else {
		fen.herald = ari_move_herald(fen, uplayer);
		fen.plorder = jsCopy(fen.heraldorder);
		ari_add_harvest_cards(fen);
		Z.phase = 'king';
		let taxneeded = ari_tax_phase_needed(fen);
		Z.turn = taxneeded ? fen.turn : [fen.herald];
		if (taxneeded) Z.stage = 2; else[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	}
	return Z.stage;
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
function ari_open_rumors(stage = 28) {
	let [fen, deck] = [Z.fen, UI.deck_rumors];
	DA.qanim = [];
	fen.stage = Z.stage = stage;
	let n = Math.min(2, fen.deck_rumors.length);
	let cards = arrTake(fen.deck_rumors, n);
	let uicards = cards.map(x => ari_get_card(x));
	let dest = UI.rumor_top = ui_type_market([], deck.container.parentNode, { maleft: 12 }, `rumor_top`, 'rumor_top', ari_get_card);
	mMagnifyOnHoverControlPopup(dest.cardcontainer);
	for (let i = 0; i < n; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, dest]]);
		DA.qanim.push([q_move_topmost, [deck, dest]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck_rumors', 'rumor_top']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_pre_action() {
	let [stage, A, fen, phase, uplayer, deck, market] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.deck, Z.market];
	if (Z.num_actions > 0) fen.progress = `(action ${Z.action_number} of ${Z.total_pl_actions})`; else delete fen.progress;
	show_progress();
	switch (ARI_LEGACY.stage[stage]) {
		case 'action: command': Z.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break; //5
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(uplayer), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
				case 'inspect': select_add_items(ui_get_other_buildings(uplayer), process_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(uplayer), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'comm_weitergeben': if (!is_playerdata_set(uplayer)) select_add_items(ui_get_all_commission_items(uplayer), leg_process_comm_setup, `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard`, fen.comm_setup_num, fen.comm_setup_num); break;
		case 'rumors_weitergeben':
			let rumitems = ui_get_rumors_and_players_items(uplayer);
			if (isEmpty(rumitems)) {
				show_waiting_message('waiting for other players...');
				Z.state = null;
				let done = rumor_playerdata_complete();
				if (done) {
					Z.turn = [Z.host];
					Z.stage = 105; //'next_rumors_setup_stage';
					clear_transaction();
					take_turn_fen();
				} else autopoll();
			} else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
			break;
		case 'next_rumor_setup_stage': post_rumor_setup(); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(uplayer), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(uplayer), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(uplayer), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
		case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tithe': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			let pl = fen.players[uplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				ari_history_list([`${uplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				ari_history_list([`${uplayer} must tithe more cards to reach ${min}!`], 'tithe');
				select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
			}
			break;
		case 'church_newcards':
			reveal_church_cards();
			let items = ui_get_church_items(uplayer);
			let num_select = items.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(items, post_church, instr, num_select, num_select);
			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(uplayer), post_complementing_market_after_church, 'may complement stall'); break;
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
		case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}
}
function ari_present(dParent) {
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		mStyle(dOben, { hmin: 110 })
	}
	ari_stats(dRechts);
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
	}
	ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;
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
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ari_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }
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
function ari_refill_deck(fen) {
	fen.deck = fen.deck.concat(fen.open_discard).concat(fen.deck_discard);
	shuffle(fen.deck);
	fen.open_discard = [];
	fen.deck_discard = [];
	console.log('deck refilled: contains', fen.deck.length, 'cards');
}
function ari_reorg_discard() {
	let fen = Z.fen;
	while (fen.deck_discard.length > 0 && fen.open_discard.length < 4) {
		bottom_elem_from_to(fen.deck_discard, fen.open_discard);
	}
}
function ari_reveal_all_buildings(fen) {
	for (const plname of fen.plorder) {
		let gbs = UI.players[plname].buildinglist;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
		}
	}
}
function ari_select_next_player_according_to_stall_value() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	Z.stage = 5;
	let minval = 100000;
	let minplayer = null;
	for (const uname of fen.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = fen.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = fen.players[uname].stall_value = arrSum(stall.map(x => ari_get_card(x).val));
		if (val < minval) { minval = val; minplayer = uname; }
	}
	if (!minplayer) {
		return null;
	} else {
		Z.turn = fen.turn = [minplayer];
		fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
		fen.action_number = 1;
		return minplayer;
	}
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
function ari_start_action_stage() {
	let next = ari_select_next_player_according_to_stall_value();
	if (!next) { ari_next_phase(); }
	take_turn_fen();
}
function ari_start_church_stage() {
	let [fen] = [Z.fen];
	let order = fen.plorder = fen.church_order = determine_church_turn_order();
	[Z.turn, Z.stage] = [[order[0]], 17];
	ari_history_list([`inquisition starts!`], 'church');
	take_turn_fen();
}
function ari_state(dParent) {
	function get_phase_html() {
		if (isEmpty(Z.phase) || Z.phase == 'over') return null; //capitalize(Z.friendly);
		let rank = Z.phase[0].toUpperCase();
		let card = ari_get_card(rank + 'Hn', 40);
		let d = iDiv(card);
		mClassRemove(d.firstChild, 'card');
		return iDiv(card).outerHTML;
	}
	if (DA.TEST0 == true) {
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {
			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;
			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`; // (${typeof state})`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}
		dParent.innerHTML = html;
		return;
	}
	let user_html = get_user_pic_html(Z.uplayer, 30);
	let phase_html = get_phase_html();
	let html = '';
	if (phase_html) html += `${Z.phase}:&nbsp;${phase_html}`;
	if (Z.stage == 17) { html += `&nbsp;&nbsp;CHURCH EVENT!!!`; }
	else if (TESTING) { html += `&nbsp;&nbsp;&nbsp;stage: ${ARI_LEGACY.stage[Z.stage]}`; }
	else html += `&nbsp;player: ${user_html} `;
	dParent.innerHTML = html;
}
function ari_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent); //fen.plorder.map(x => fen.players[x]));
	let fen = Z.fen;
	let herald = fen.heraldorder[0];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (plname == herald) {
			mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
		}
		if (exp_church(Z.options)) {
			if (isdef(pl.tithes)) {
				player_stat_count('cross', pl.tithes.val, d);
			}
		}
		let dCoin = player_stat_count('coin', pl.coins, d);
		item.dCoin = dCoin.firstChild;
		item.dAmount = dCoin.children[1];
		let list = pl.hand.concat(pl.stall);
		let list_luxury = list.filter(x => x[2] == 'l');
		player_stat_count('pinching hand', list.length, d);
		let d1 = player_stat_count('hand-holding-usd', list_luxury.length, d);
		mStyle(d1.firstChild, { fg: 'gold', fz: 20 })
		if (!isEmpty(fen.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
			player_stat_count('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
		}
		player_stat_count('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, plname) : ari_calc_fictive_vps(fen, plname), d);
		if (fen.turn.includes(plname)) {
			show_hourglass(plname, d, 30, { left: -3, top: 0 }); //'calc( 50% - 36px )' });
		}
	}
}
function ari_tax_phase_needed(fen) {
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uplayer of fen.plorder) {
		let hsz = fen.players[uplayer].hand.length;
		let nchateaus = fen.players[uplayer].buildings.chateau.length;
		let allowed = ARI_LEGACY.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uplayer] = diff;
	}
	if (need_tax_phase) {
		fen.turn = [ari_get_first_tax_payer(fen, pl_tax)];
		fen.pl_tax = pl_tax;
		fen.stage = 2;
		return true;
	} else {
		fen.stage = 3;
		return false;
	}
}
function arrCount(arr, func) { return arr.filter(func).length; }
function arrExtend(arr, list) { list.map(x => arr.push(x)); return arr; }
function arrRemove(arr, listweg) {
	arrReplace(arr, listweg, []);
}
function arrReplace(arr, listweg, listdazu) {
	arrExtend(arr, listdazu);
	listweg.map(x => arrRemovip(arr, x));
	return arr;
}
function arrReverse(arr) { return jsCopy(arr).reverse(); }
function beautify_history(lines, title, fen, uplayer) {
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) { html += mCardText(w1); continue; }
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
		if (lines.length > 1) html = html.trim() + (l == arrLast(lines) ? '.' : ', ');
	}
	html += "</div>";
	return html;
}
function being_blackmailed() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cmd = item.key;
	console.log('selected reaction to blackmail:', item.key);
	if (cmd == 'accept') { Z.stage = 34; ari_pre_action(); }
	else if (cmd == 'reject') { post_reject_blackmail(); }
	else { post_defend_blackmail(); }
}
function bluff_ai() {
	let [A, fen, uplayer, pl] = [Z.A, Z.fen, Z.uplayer, Z.pl];
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = get_keys(torank).slice(1); // words sind three, four, ..., king, ace
	let all_hand_cards = aggregate_elements(dict2list(fen.players, 'name'), 'hand'); // all cards in play
	let no_twos = all_hand_cards.filter(x => x[0] != '2'); // alle Karten ohne 2er
	let rankstr = '3456789TJQKA2';
	sortByRank(all_hand_cards, rankstr);
	let byrank = aggregate_player_hands_by_rank(fen);
	let rank_list = dict2list(byrank, 'rank');
	let unique_ranks = sortByRank(get_keys(byrank));
	let myranks = sortByRank(pl.hand.map(x => x[0]));
	let my_unique = unique_ranks.filter(x => myranks.includes(x));
	rank_list.map(x => { x.mine = myranks.includes(x.rank); x.irank = rankstr.indexOf(x.rank); x.i = x.irank + 100 * x.value; });
	rank_list = rank_list.filter(x => x.rank != '2');
	sortByDescending(rank_list, 'i');
	let maxcount = rank_list[0].value;
	let mymaxcount = rank_list.filter(x => x.mine)[0].value;
	let expected = all_hand_cards.length / 13; // auch 2er gibt es soviele!
	let nreason = Math.max(1, Math.round(expected * 2));
	let n_twos = all_hand_cards.filter(x => x[0] == '2').length;
	let have2 = firstCond(rank_list, x => x.rank == '2' && x.mine);
	return botbest(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, fen);
}
function bluff_change_to_ack_round(fen, nextplayer) {
	[Z.stage, Z.turn] = [1, [get_admin_player(fen.plorder)]];
	fen.keeppolling = true;
	fen.nextturn = [nextplayer]; //next player after ack!
}
function bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let words = get_keys(di2).slice(1);
	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)
		let nmax = calc_reasonable_max(fen);
		let n = b[0] == '_' ? 1 : Number(b[0]);
		let done = false;
		if (n > nmax + 1) {
			const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
			let rankstr = '3456789TJQKA';
			let w1 = di2[b[1]];
			let idx = isdef(w1) ? rankstr.indexOf(w1) : -1;
			if (idx >= 0 && idx < rankstr.length - 2) {
				let r = rankstr[idx + 1];
				b[1] = di[r];
				done = true;
			}
		}
		if (!done) {
			if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
			else if (b[0] > b[2]) { b[2] += 1; } //console.log('new bid is now:', b); }
			else { b[0] += coin(80) ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
		}
	} else {
		let nmax = calc_reasonable_max(fen);
		let nmin = Math.max(nmax - 1, 1);
		let arr_nmax = arrRange(1, nmax);
		let arr_nmin = arrRange(1, nmin);
		b = [rChoose(arr_nmax), rChoose(words), rChoose(arr_nmin), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	UI.dAnzeige.innerHTML = bid_to_string(b);
}
function botbest(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	if (nundef(DA.ctrandom)) DA.ctrandom = 1; console.log(`${DA.ctrandom++}: ${Z.uplayer} using strategy`, Z.strategy)
	let bot = window[`bot_${Z.strategy}`];
	let [b, f] = bot(list, max, mmax, exp, nreas, n2, have2, words, fen);
	assertion(!b || b[2] != 0, 'bot returned bid with n2==0');
	return [b, f];
}
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1, arr2); }
function calc_ferro_highest_goal_achieved(pl) {
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};
	for (const k of Z.fen.availableGoals) { // ['7R', '55', '5', '44', '4', '33', '3']) {
		if (pl.goals[k]) {
			console.log('player', pl.name, 'already achieved goal', k);
			continue;
		}
		let achieved = di[k];
		if (achieved) {
			return k;
		}
	}
	return null;
}
function calc_ferro_score(roundwinner) {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	assertion(roundwinner == uplayer, '_calc_ferro_score: roundwinner != uplayer');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		pl.newcards = [];
		if (nundef(pl.score)) pl.score = 0;
		if (uplayer == plname) pl.score -= round * 5;
		else pl.score += calc_hand_value(pl.hand);
	}
}
function check_correct_journey(A, fen, uplayer) {
	let items = A.selected.map(x => A.items[x]);
	if (items.length < 2) {
		select_error('please select at least 2 items!'); return [null, null, null];//a total of at least 2 items must be selected
	}
	let carditems = items.filter(x => is_card(x));
	if (isEmpty(carditems)) {
		select_error('please select at least 1 card!'); return [null, null, null];//at least one hand card must be selected
	} else if (items.length - carditems.length > 1) {
		select_error('please select no more than 1 journey!'); return [null, null, null];//at most one journey must be selected
	}
	let journeyitem = firstCond(items, x => !is_card(x));
	let cards = journeyitem ? jsCopy(journeyitem.o.list) : [];
	cards = cards.concat(carditems.map(x => x.o.key));
	let jlegal = is_journey(cards);
	if (!jlegal || jlegal.length != cards.length) {
		select_error('this is not a legal journey!!'); return [null, null, null];//is this a legal journey?
	}
	return [carditems, journeyitem, jlegal];
}
function check_if_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let jacks = fen.market.filter(x => x[0] == 'J');
	let queens = fen.market.filter(x => x[0] == 'Q');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let pl_jacks = pl.stall.filter(x => x[0] == 'J');
		let pl_queens = pl.stall.filter(x => x[0] == 'Q');
		jacks = jacks.concat(pl_jacks);
		queens = queens.concat(pl_queens);
	}
	let ischurch = false;
	for (const j of jacks) {
		if (firstCond(queens, x => x[1] != j[1])) ischurch = true;
	}
	return ischurch;
}
function check_resolve() {
	let can_resolve = true;
	for (const plname of Z.plorder) {
		let data1 = firstCond(Z.playerdata, x => x.name == plname && !isEmpty(x.state));
		if (nundef(data1)) { can_resolve = false; break; }
	}
	return can_resolve;
}
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let key = p;
		let vals = poss[p];
		if (isString(vals) && vals.split(',').length <= 1) {
			di[p] = isNumber(vals) ? Number(vals) : vals;
			continue;
		}
		let fs = mBy(`d_${p}`);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function compute_hidden(plname) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[plname];
	let hidden;
	if (isdef(fen.winners)) hidden = false;
	else if (Z.role == 'spectator') hidden = plname != uplayer;
	else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
	else hidden = plname != Z.uname;
	return hidden;
}
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}

function data_from_client(raw) {
	assertion(is_stringified(raw), 'data should be stringified json!!!!!!!!!!!!!!!', raw);
	let js = JSON.parse(raw);
	return js;
}
function db_clear_players(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly]; //for now only 1 copy!
	for (const pldata of t.playerdata) { pldata.state = null; pldata.player_status = null; }
	return t.playerdata;
}
function db_new_table(friendly, game, host, players, fen, options) {
	let table = { friendly, game, host, players, fen, options };
	table.modified = Date.now();	//console.log(table.modified,typeof table.modified);
	let playerdata = [];
	for (const plname of players) {
		playerdata.push({ name: `${plname}`, state: null, player_status: null });
	}
	let res = { table, playerdata };
	GT[friendly] = res;
	return res;
}
function db_read_playerdata(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].playerdata;
}
function db_read_table(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].table;
}
function db_table_exists(friendly) { return isdef(GT[friendly]); }
function db_write_fen(friendly, fen, scoring = null) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let table = t.table;
	table.fen = fen; table.scoring = scoring; table.phase = isdef(scoring) ? 'over' : '';
	table.modified = Date.now();	//console.log(table.modified,typeof table.modified);
	return table;
}
function db_write_player(friendly, uname, state, player_status) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let pldata = firstCond(t.playerdata, x => x.name == uname);
	pldata.state = state;
	pldata.player_status = player_status;
	pldata.checked = Date.now();
	return t.playerdata;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function deck_deal(deck, n) { return deck.splice(0, n); }
function deck_deal_safe_ferro(fen, plname, n) {
	if (fen.deck.length < n) {
		fen.deck = fen.deck.concat(fen.deck_discard.reverse());
		fen.deck_discard = [];
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return new_cards;
}
function determine_church_turn_order() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let initial = [];
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.vps = ari_calc_fictive_vps(fen, plname);
		pl.max_journey_length = ari_get_max_journey_length(fen, plname);
		pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
		initial.push(pl);
	}
	let sorted = sortByDescending(initial, 'score');
	return sorted.map(x => x.name);
}
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function end_of_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	calc_ferro_score(uplayer);
	if (Z.options.phase_order == 'anti') {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			if (!pl.roundgoal) pl.goals[get_round_goal()] = true;
		}
	}
	ari_history_list([`${uplayer} wins the round`], 'round');
	fen.round_winner = uplayer;
	[Z.stage, Z.turn] = ['round_end', [Z.host]]; //jsCopy(plorder)];
	take_turn_fen();
}
function ensure_polling() { }
function ensure_stallSelected(fen) { if (nundef(fen.stallSelected)) fen.stallSelected = []; }
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function exchange_by_index(arr1, i1, arr2, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr2[i2];
	arr2[i2] = temp;
}
function ferro_ack_uplayer() { if (Z.mode == 'multi') { ferro_ack_uplayer_multi(); } else { ferro_ack_uplayer_hotseat(); } }
function ferro_ack_uplayer_hotseat() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let buy = !isEmpty(A.selected) && A.selected[0] == 0;
	if (buy || uplayer == fen.lastplayer) { fen.buyer = uplayer;[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve']; }
	else { Z.turn = [get_next_in_list(uplayer, fen.canbuy)]; }
	take_turn_fen();
}
function ferro_ack_uplayer_multi() {
	let [A, uplayer] = [Z.A, Z.uplayer];
	stopPolling();
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	let can_resolve = ferro_check_resolve();
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen_write();
	} else { take_turn_multi(); }
}
function ferro_activate_ui() { ferro_pre_action(); }
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	fen.canbuy = newturn.filter(x => x != uplayer && fen.players[x].coins > 0); //fen.canbuy list ist angeordnet nach reihenfolge der frage
	fen.trigger = uplayer; //NEIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!get_admin_player(fen.plorder); // uplayer;
	fen.buyer = null;
	fen.nextturn = [nextplayer];
	if (isEmpty(fen.canbuy)) { Z.stage = 'can_resolve'; ferro_change_to_card_selection(); return; }
	else if (Z.mode == 'multi') { [Z.stage, Z.turn] = ['buy_or_pass', fen.canbuy]; fen.keeppolling = true; take_turn_fen_clear(); }
	else {
		fen.canbuy.map(x => fen.players[x].buy = 'unset');
		fen.lastplayer = arrLast(fen.canbuy);
		[Z.stage, Z.turn] = ['buy_or_pass', [fen.canbuy[0]]];
		take_turn_fen();
	}
}
function ferro_change_to_card_selection() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	assertion(stage == 'can_resolve', "change to card_selection: NOT IN can_resolve stage!!!!!!!!!!!!!!!!!!!!!!");
	assertion(Z.uplayer == 'mimi' || Z.uplayer == fen.trigger, "mixup uplayer in change_to_card_selection!!!!!!!!!!!!!!!!!!!!!!");
	if (isdef(fen.buyer)) {
		let plname = fen.buyer;
		let pl = fen.players[plname];
		let card = fen.deck_discard.shift();
		pl.hand.push(card);
		lookupAddToList(pl, ['newcards'], card);
		deck_deal_safe_ferro(fen, plname, 1);
		pl.coins -= 1; //pay
		ari_history_list([`${plname} bought ${card}`], 'buy');
	}
	let nextplayer = fen.nextturn[0];
	deck_deal_safe_ferro(fen, nextplayer, 1);
	Z.turn = fen.nextturn;
	Z.stage = 'card_selection';
	for (const k of ['buyer', 'canbuy', 'nextturn', 'trigger', 'lastplayer']) delete fen[k];//cleanup buy_or_pass multi-turn!!!!!!!!!!!!!
	delete fen.keeppolling;
	clear_transaction();
	take_turn_fen();
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];
	assertion(stage == 'buy_or_pass', "check_resolve NOT IN buy_or_pass stage!!!!!!!!!");
	assertion(isdef(pldata), "no playerdata in buy_or_pass stage!!!!!!!!!!!!!!!!!!!!!!!");
	let done = true;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;
		if (isEmpty(state)) done = false;
		else if (state.buy == true) fen.buyer = plname;
		else continue;
		break;
	}
	return done;
}
function ferro_is_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	if (cards.length < 3) return false;
	let num_jollies_in_cards = cards.filter(x => is_joker(x)).length;
	if (num_jollies_in_cards > max_jollies_allowed) return false;
	cards = sortCardItemsByRank(cards.map(x => x), rankstr = '23456789TJQKA*');
	let rank = cards[0].rank;
	let isgroup = cards.every(x => x.rank == rank || is_joker(x));
	let suits = cards.filter(x => !is_joker(x)).map(x => x.suit);
	let num_duplicate_suits = suits.filter(x => suits.filter(y => y == x).length > 1).length;
	if (isgroup && !group_same_suit_allowed && num_duplicate_suits > 0) return false;
	else if (isgroup) return cards.map(x => x.key);
	let suit = cards[0].suit;
	if (!cards.every(x => is_jolly(x.key) || x.suit == suit)) return false;
	let keys = cards.map(x => x.key);
	if (keys.length != new Set(keys).size) return false;
	let at_most_jollies = Math.min(num_jollies_in_cards, max_jollies_allowed);
	let num_jolly = sortCardItemsToSequence(cards, rankstr = '23456789TJQKA', at_most_jollies);
	let cond1 = num_jolly <= at_most_jollies; //this sequence does not need more jollies than it should
	let cond2 = cards.length >= seqlen; //console.log('cond2', cond2);
	if (cond1 && cond2) return cards.map(x => x.key); else return false;
}
function ferro_pre_action() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	switch (stage) {
		case 'can_resolve': if (Z.options.auto_weiter) ferro_change_to_card_selection(); else { select_add_items(ui_get_string_items(['weiter']), ferro_change_to_card_selection, 'may click to continue', 1, 1, Z.mode == 'multi'); select_timer(2000, ferro_change_to_card_selection); } break;
		case 'buy_or_pass': if (!is_playerdata_set(uplayer)) { select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click discard pile to buy or pass', 1, 1); if (uplayer != 'nasi') select_timer(Z.options.thinking_time * 1000, ferro_ack_uplayer); } break;
		case 'card_selection': select_add_items(ui_get_ferro_items(uplayer), fp_card_selection, 'must select one or more cards', 1, 100); break;
		default: console.log('stage is', stage); break;
	}
}
function ferro_present(dParent) {
	if (DA.simulate == true) show('bRestartMove'); else hide('bRestartMove'); //console.log('DA', DA);
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	ferro_stats(dRechts);
	show_history(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ferro_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ferro_get_card);
	if (!isEmpty(deck_discard.items)) face_up(deck_discard.get_topcard());
	order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 10);
		let hidden = compute_hidden(plname);
		ferro_present_player(plname, d, hidden);
	}
	Z.isWaiting = false;
	if (Z.stage == 'round_end') {
		show_waiting_for_ack_message();
		if (Z.role == 'active' || i_am_host()) {
			show('bClearAck');
		}
	} else if (Z.stage == 'buy_or_pass' && uplayer == fen.trigger && ferro_check_resolve()) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen(); return;
	} else if (Z.stage == 'buy_or_pass' && (Z.role != 'active' || is_playerdata_set(uplayer))) {
		assertion(isdef(Z.playerdata), 'playerdata is not defined in buy_or_pass (present ferro)');
		let pl_not_done = Z.playerdata.filter(x => Z.turn.includes(x.name) && isEmpty(x.state)).map(x => x.name);
		show_waiting_message(`waiting for possible buy decision...`);
		Z.isWaiting = true;
	}
	show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname, { bottom: -2 });
	new_cards_animation();
}
function ferro_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	Config.ui.card.h = ishidden ? 100 : 150;
	Config.ui.container.h = Config.ui.card.h + 30;
	if (!ishidden) pl.hand = correct_handsorting(pl.hand, plname);
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ferro_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }
	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_lead_hand(j, d, { maleft: 12, h: 130 }, `players.${plname}.journeys.${i}`, '', ferro_get_card);//list, dParent, path, title, get_card_func
		i += 1;
		ui.journeys.push(jui);
	}
}
function ferro_process_discard() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!isEmpty(pl.journeys) && !pl.roundgoal) {
		let goal = is_fixed_goal() ? get_round_goal() : calc_ferro_highest_goal_achieved(pl);
		pl.roundgoal = goal;
		pl.goals[goal] = true;
		ari_history_list([`${pl.name} achieved goal ${pl.roundgoal}`], 'achieve');
	}
	let c = A.selectedCards[0].key;
	elem_from_to_top(c, fen.players[uplayer].hand, fen.deck_discard);
	ari_history_list([`${uplayer} discards ${c}`], 'discard');
	if (fen.players[uplayer].hand.length == 0) { end_of_round_ferro(); } else ferro_change_to_buy_pass(); //ferro_change_to_ack_round();
}
function ferro_process_jolly(key, j) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let a = key;
	let b = j.find(x => x[0] == '*');
	arrReplace1(fen.players[uplayer].hand, a, b);
	replace_jolly(key, j);
	ari_history_list([`${uplayer} replaces for jolly`], 'jolly');
	Z.stage = 'card_selection';
}
function ferro_process_set(keys) {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (is_group(keys)) {
		keys = sort_cards(keys, true, 'CDSH', true, '23456789TJQKA*');
	}
	let j = [];
	keys.map(x => elem_from_to(x, fen.players[uplayer].hand, j));
	fen.players[uplayer].journeys.push(j);
	ari_history_list([`${uplayer} reveals ${j.join(', ')}`], 'auflegen');
	Z.stage = 'card_selection';
}
function ferro_state(dParent) {
	if (DA.TEST0 == true) {
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {
			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;
			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`; // (${typeof state})`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}
		dParent.innerHTML = html;
		return;
	}
	if (Z.stage == 'round_end') {
		dParent.innerHTML = `Round ${Z.round} ended by &nbsp;${get_user_pic_html(Z.fen.round_winner, 30)}`;
	} else if (is_fixed_goal()) {
		let goal = get_round_goal();
		console.log('goal', goal);
		let goal_html = `<div style="font-weight:bold;border-radius:50%;background:white;color:red;line-height:100%;padding:4px 8px">${goal}</div>`;
		dParent.innerHTML = `Round ${Z.round}:&nbsp;&nbsp;minimum:&nbsp;${goal_html}`;
	} else {
		let user_html = get_user_pic_html(Z.stage == 'buy_or_pass' ? Z.fen.nextturn[0] : Z.turn[0], 30);
		dParent.innerHTML = `Round ${Z.round}:&nbsp;${Z.stage == 'buy_or_pass' ? 'next ' : ''}turn: ${user_html} `;
	}
}
function ferro_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mStyle(d, { wmin: 150 }); mLinebreak(d);
		player_stat_count('coin', pl.coins, d);
		player_stat_count('pinching hand', pl.hand.length, d);
		if (!compute_hidden(plname)) player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand), d);
		player_stat_count('star', pl.score, d);
		mLinebreak(d, 4);
		if (!is_fixed_goal()) {
			let d2 = mDiv(d, { padding: 4, display: 'flex' }, `d_${plname}_goals`);
			if (fen.availableGoals.length < 4) { mStyle(d2, { wmin: 120 }); mCenterFlex(d2); }
			let sz = 16;
			let styles_done = { h: sz, fz: sz, maleft: 6, fg: 'grey', 'text-decoration': 'line-through green', weight: 'bold' };
			let styles_todo = { h: sz, fz: sz, maleft: 6, border: 'red', weight: 'bold', padding: 4, 'line-height': sz }; // 'text-decoration': 'underline red', 
			for (const k of fen.roundGoals) { //in pl.goals) {
				mText(k, d2, pl.goals[k] ? styles_done : styles_todo);
			}
		}
		if (fen.turn.includes(plname)) { show_hourglass(plname, d, 30, { left: -3, top: 0 }); }
	}
}
function ferro_transaction_error() {
	let d = mDiv(dError, { padding: 10, align: 'center' }, null, `Illegal turn sequence - transaction cannot be completed!!!<br>press reload and try again!<br>`);
	mButton('RELOAD', onclick_reload, d, { margin: 10 });
	clear_transaction();
}
function find_card(index, ui_item) { return ui_item.items[index]; }
function find_common_ancestor(d1, d2) { return dTable; }
function find_journeys(fen, uplayer) {
	let h = fen.players[uplayer].hand;
	let seqs = find_sequences(h, 2, 'A23456789TJQK');
	if (!isEmpty(seqs)) return seqs;
	let existing_journeys = aggregate_player(fen, 'journeys');
	for (const j of existing_journeys) {
		let h1 = j.concat(h);
		let seqs1 = find_sequences(h1, j.length + 1, 'A23456789TJQK');
		if (!isEmpty(seqs1)) return seqs1;
	}
	return seqs;
}
function find_players_with_min_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let minscore = Infinity;
	let minscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score < minscore) { minscore = pl.score; minscorepls = [plname]; }
		else if (pl.score == minscore) minscorepls.push(plname);
	}
	return minscorepls;
}
function find_players_with_potential_journey(fen) {
	let res = [];
	for (const uplayer of fen.plorder) {
		if (isdef(fen.passed) && fen.passed.includes(uplayer)) continue;
		let j = find_journeys(fen, uplayer);
		if (!isEmpty(j)) res.push(uplayer);
	}
	return res;
}
function find_sequences(blatt, n = 2, rankstr = '23456789TJQKA', allow_cycle = false) {
	let suitlists = get_suitlists_sorted_by_rank(blatt, rankstr, true); //true...remove_duplicates
	let seqs = [];
	for (const lst of get_values(suitlists)) {
		let len = lst.length;
		if (len < n) continue;
		let l = allow_cycle ? lst.concat(lst) : lst;
		for (let istart = 0; istart < len; istart++) {
			let seq = [l[istart]];
			let i = istart;
			while (i + 1 < l.length && follows_in_rank(l[i], l[i + 1], rankstr)) {
				seq.push(l[i + 1]);
				i++;
			}
			if (seq.length >= n) seqs.push(seq);
		}
	}
	return seqs;
}
function follows_in_rank(c1, c2, rankstr) {
	return get_rank_index(c2, rankstr) - get_rank_index(c1, rankstr) == 1;
	let i1 = rankstr.indexOf(c1[0]);
	let i2 = rankstr.indexOf(c2[0]);
	console.log('follows?', c1, i1, c2, i2, i2 - i1)
	return rankstr.indexOf(c2[0]) - rankstr.indexOf(c1[0]) == 1;
}
function fp_card_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let selitems = A.selectedCards = A.selected.map(x => A.items[x]);
	let cards = selitems.map(x => x.o);
	let cmd = A.last_selected.key;
	if (cmd == 'discard') {
		if (selitems.length != 1) { select_error('select exactly 1 hand card to discard!'); return; }
		let item = selitems[0];
		if (!item.path.includes(`${uplayer}.hand`)) { select_error('select a hand card to discard!', () => { ari_make_unselected(item); A.selected = []; }); return; }
		assertion(DA.transactionlist.length == 0 || DA.simulate, '!!!!!!!!!!!!!!!!transactionlist is not empty!');
		if (DA.transactionlist.length > 0) {
			console.log('VERIFYING TRANSACTION............')
			let legal = verify_min_req();
			clear_transaction();
			if (legal) {
				ferro_process_discard(); //discard selected card
			} else {
				ferro_transaction_error();
			}
		} else {
			ferro_process_discard(); //discard selected card
		}
	} else if (cmd == 'jolly') {
		if (selitems.length != 2) { select_error('select a hand card and the jolly you want!'); return; }
		let handcard = selitems.find(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let jolly = selitems.find(x => is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (!isdef(handcard) || !isdef(jolly)) { select_error('select a hand card and the jolly you want!'); return; }
		let key = handcard.key;
		let j = path2fen(fen, jolly.path);
		if (!jolly_matches(key, j)) { select_error('your card does not match jolly!'); return; }
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		ferro_process_jolly(key, j);
		take_turn_fen();
	} else if (cmd == 'auflegen') {
		if (selitems.length < 3) { select_error('select cards to form a group!'); return; }
		else if (pl.hand.length == selitems.length) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		let newset = ferro_is_set(cards, Z.options.jokers_per_group);
		if (!newset) { select_error('this is NOT a valid set!'); return; }
		let is_illegal = is_correct_group_illegal(cards);
		if (is_illegal) { select_error(is_illegal); return; }
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		let keys = newset; //cards.map(x => x.key);
		ferro_process_set(keys);
		take_turn_fen();
	} else if (cmd == 'anlegen') {
		if (selitems.length < 1) { select_error('select at least 1 hand card and the first card of a group!'); return; }
		else if (pl.hand.length == selitems.length - 1) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		let handcards = selitems.filter(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let groupcard = selitems.find(x => !is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (isEmpty(handcards) || !isdef(groupcard)) { select_error('select 1 or more hand cards and the first card of a group!'); return; }
		let hand_rank = handcards[0].key[0];
		let handcards_same_rank = handcards.every(x => x.key[0] == hand_rank);
		let j = path2fen(fen, groupcard.path);
		if (is_group(j)) {
			if (!handcards_same_rank) { select_error('all hand cards must have the same rank!'); return; }
			let group_rank = groupcard.key[0];
			if (group_rank == hand_rank) {
				for (const h of handcards) {
					elem_from_to(h.key, fen.players[uplayer].hand, j);
				}
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				return;
			} else {
				select_error('hand cards do not match the group!');
				return;
			}
		} else { //its a sequence!
			let suit = get_sequence_suit(j);
			let handkeys = handcards.map(x => x.key); //console.log('suit',suit,'keys', keys);
			if (firstCond(handkeys, x => x[1] != suit)) { select_error('hand card suit does not match the group!'); return; }
			let ij = j.findIndex(x => is_jolly(x));
			let j_has_jolly = ij > -1;
			let rank_to_be_relaced_by_jolly = j_has_jolly ? find_jolly_rank(j) : null;
			let r = rank_to_be_relaced_by_jolly;
			if (r) {
				j[ij] = r + suit + 'n';
			}
			keys = handkeys.concat(j);
			let allcards = keys.map(x => ferro_get_card(x)); // handcards.concat(j.map(x=>ferro_get_card(x)));
			let jneeded = sortCardItemsToSequence(allcards, undefined, 0);
			if (jneeded == 0) {
				let seq = allcards.map(x => x.key);
				if (r) { arrReplace1(seq, r + suit + 'n', '*Hn'); }
				j.length = 0;
				j.push(...seq);
				for (const k of handkeys) { removeInPlace(fen.players[uplayer].hand, k); }
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
			} else {
				if (r != null) { j[ij] = '*Hn'; }
				select_error('hand cards cannot be added to sequence!');
				return;
			}
		}
	}
}
function gamestep() {
	show_admin_ui();
	DA.running = true; clear_screen(); dTable = mBy('dTable'); mClass('dTexture', 'wood');
	if (Z.game == 'aristo') { if (Z.role != Clientdata.role || Z.mode == 'multi' && Z.role != 'active') mFall(dTable); Clientdata.role = Z.role; }//else mTableTransition(dTable, 2000);
	else mFall(dTable);
	shield_off();
	show_title();
	show_role();
	Z.func.present(dTable);	// *** Z.uname und Z.uplayer ist IMMER da! ***
	if (isdef(Z.scoring.winners)) { show_winners(); animatedTitle('GAMEOVER!'); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		staticTitle();
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); } //mShield(dTable.firstChild.childNodes[1])} //if (isdef(Z.fen.shield)) mShield(dTable);  }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		if (Z.isWaiting == true || Z.mode != 'multi') staticTitle(); else animatedTitle();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && Z.fen.keeppolling) {
			autopoll();
			console.log('gamestep autopoll');
		}
	}
	if (TESTING == true) landing();	//DA.max=100;DA.runs=valf(DA.runs+1,0);if (DA.runs<DA.max) onclick_restart();
}
function generate_table_name(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(Info.capital);
		let parts = cap.split(' ');
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let s = (n == 2 ? 'duel of ' : rChoose(['battle of ', 'war of '])) + cap;
		if (!existing.includes(s)) return s;
	}
}
function get_admin_player(list) {
	let res = valf(firstCond(list, x => x == 'mimi'), firstCond(list, x => ['felix', 'amanda', 'lauren'].includes(x)));
	return res ?? list[0]; //if (!res) return list[0];
}
function get_available_goals(plname) {
	return Z.fen.availableGoals.filter(x => !Z.fen.players[plname].goals[x]);
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		let checked = ch.getAttribute('checked');
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function get_game_color(game) { return colorFrom(Config.games[game].color); }
function get_keys(o) { return Object.keys(o); }
function get_logout_button() {
	let html = `<a id="aLogout" href="javascript:onclick_logout()">logout</a>`;
	return mCreateFrom(html);
}
function get_multi_trigger() { return lookup(Z, ['fen', 'trigger']); }
function get_next_in_list(el, list) {
	let iturn = list.indexOf(el);
	let nextplayer = list[(iturn + 1) % list.length];
	return nextplayer;
}
function get_pay_history(payment, uplayer) { return [`${uplayer} pays with ${payment}`]; }
function get_playmode(uname) { return Z.fen.players[uname].playmode; }
function get_present_order() {
	let [fen, uplayer, uname] = [Z.fen, Z.uplayer, Z.uname];
	assertion(is_human_player(uplayer) || uname == Z.host, "PRESENT ORDER ME WRONG!!!!!!!!!!!!!")
	let uname_plays = fen.plorder.includes(uname);
	let is_bot = !is_human_player(uplayer);
	let show_first = Z.mode == 'multi' && uname_plays && !is_bot ? Z.uname : uplayer;
	return arrCycle(Z.fen.plorder, Z.fen.plorder.indexOf(show_first));
}
function get_rank_index(ckey, rankstr = '23456789TJQKA') { return rankstr.indexOf(ckey[0]); }
function get_round_goal() { return Z.fen.roundGoals[Z.round - 1]; } //get_keys(Z.fen.players[Z.uplayer].goals).sort()[Z.round - 1]; }
function get_suitlists_sorted_by_rank(blatt, rankstr = '23456789TJQKA', remove_duplicates = false) {
	let di = {};
	for (const k of blatt) {
		let suit = k[1];
		if (nundef(di[suit])) di[suit] = [];
		if (remove_duplicates) addIf(di[suit], k); else di[suit].push(k);
	}
	for (const s in di) {
		sortByRank(di[s], rankstr);
	}
	return di;
}
function get_trade_history(uplayer, i0, i1) {
	if (i1.path.includes(uplayer)) { let h = i0; i0 = i1; i1 = h; }
	return [`${uplayer} trades ${i0.key} (from own stall) for ${i1.key} (from ${i1.path == 'market' ? 'market' : stringBetween(i1.path, '.', '.')})`];
}
function get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return colorFrom(u.color); }
function get_user_pic_and_name(uname, dParent, sz = 50, border = 'solid medium white') {
	let html = `
			<div username='${uname}' style='text-align:center;font-size:${sz / 2.8}px'>
				<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0;border:${border}'>
				<div style='margin-top:${-sz / 6}px'>${uname}</div>
			</div>`;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	return elem;
}
function get_values(o) { return Object.values(o); }
function get_waiting_html(sz = 30) { return `<img src="../base/assets/images/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function handle_gehtHoch() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let [bid, bidder] = [fen.lastbid, fen.lastbidder];
	let diff = calc_bid_minus_cards(fen, bid); // hier wird schon der akku gemacht!!! ich kann also jetzt die cards renewen!!!
	let aufheber = uplayer;
	let loser = diff > 0 ? bidder : aufheber;
	let war_drin = fen.war_drin = diff <= 0;
	let loser_handsize = inc_handsize(fen, loser);
	new_deal(fen);
	let nextplayer;
	if (loser_handsize > Z.options.max_handsize) {
		nextplayer = get_next_player(Z, loser)
		let plorder = fen.plorder = remove_player(fen, loser);
	} else {
		nextplayer = loser;
	}
	fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;
	bluff_change_to_ack_round(fen, nextplayer);
	take_turn_fen();
}
function handle_result(result, cmd) {
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }
	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }
	DA.result = jsCopy(obj); //console.log('DA.result', DA.result);
	processServerdata(obj, cmd);
	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "table1":
			update_table();
			console.log('cmd', cmd)
			console.log('obj', obj)
			for (const k in obj) { if (isLiteral(obj[k])) { console.log(k, obj[k]); } }
			clear_timeouts();
			gamestep();
			break;
		case "gameover":
		case "table":
		case "startgame":
			update_table();
			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			clear_timeouts();
			gamestep();
			break;
	}
}
function has_farm(uname) { return firstCond(UI.players[uname].buildinglist, x => x.type == 'farm'); }
function hide_options_popup() { let d = mBy('dOptions'); if (isdef(d)) mRemove(d); }
function i_am_acting_host() { return U.name == Z.fen.acting_host; }
function i_am_host() { return U.name == Z.host; }
function i_am_trigger() { return is_multi_trigger(U.name); }
function if_hotseat_autoswitch(result) {
	if (isdef(result.table) && isdef(Z) && Z.mode == 'hotseat') { //!DA.AUTOSWITCH) {
		let turn = lookup(result, ['table', 'fen', 'turn']);
		assertion(isdef(turn), 'turn is NOT defined (_sendSIMSIM) !!!!');
		let uname = turn.length == 1 ? turn[0] : get_next_in_list(U.name, turn);
		if (uname != U.name) switch_uname(uname);
	}
}
function if_stringified(obj) { return is_stringified(obj) ? JSON.parse(obj) : obj; }
function is_advanced_user() {
	let advancedUsers = ['mimi', 'felix', 'bob', 'buddy', 'minnow', 'nimble', 'leo']; //, 'guest', 'felix'];
	return isdef(U) && ((advancedUsers.includes(DA.secretuser) || advancedUsers.includes(U.name)));
}
function is_ai_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'bot';
}
function is_card(o) { return isdef(o.rank) || isdef(o.o) && isdef(o.o.rank); }
function is_correct_group_illegal(cards) {
	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return false;
	if (is_fixed_goal() && get_round_goal() != '7R') {
		return `the goal for this round is ${get_round_goal()}!`;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return `you can only have one sequence of 7!`;
	if (pl.journeys.find(x => is_sequence(x))) return `you can only have one sequence of 7!`;
	if (pl.roundgoal) return `row of 7 NOT allowed except if it is the round goal!`;
	return false;
}
function is_fixed_goal() { return Z.options.phase_order == 'fixed'; }
function is_group(j) {
	if (j.length < 3) return false;
	let rank = firstCond(j, x => !is_jolly(x))[0];
	return j.every(x => is_jolly(x) || x[0] == rank);
}
function is_human_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'human';
}
function is_in_middle_of_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	return isdef(fen.players[uplayer].tithes);
}
function is_journey(cards) {
	let jlist = find_sequences(cards, cards.length, 'A23456789TJQK');
	let j = firstCond(jlist, x => x.length == cards.length);
	return j;
}
function is_loggedin(name) { return isdef(U) && U.name == name; }
function is_multi_trigger(plname) { return lookup(Z, ['fen', 'trigger']) == plname; }
function is_player(s) { return isdef(Z.fen.players[s]); }
function is_playerdata_set(plname) {
	return isdef(Z.playerdata) && !isEmpty(Z.playerdata) && !isEmpty(Z.playerdata.find(x => x.name == plname).state);
}
function is_playing(pl, fen) {
	return isList(fen.plorder) && fen.plorder.includes(pl) || isList(fen.roundorder) && fen.roundorder.includes(pl) || Z.game == 'feedback' && isdef(Z.fen.players[pl]);
}
function is_sequence(j) { return !is_group(j); }
function is_shield_mode() {
	return Z.role == 'spectator'
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.host != Z.uname
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.pl.playmode != 'bot'
}
function is_stall_selection_complete() { return Z.fen.stallSelected.length == Z.fen.plorder.length; }
function is_stringified(obj) {
	if (isString(obj)) {
		return '"\'{[('.includes(obj[0]);
	}
	return false;
}
function landing() { if (isdef(DA.landing)) DA.landing(); } //onclick_by_rank(); } //show_strategy_popup(); } //onclick_random(); }//show_history_popup(); }
function last_elem_from_to(arr1, arr2) { arr2.push(arr1.pop()); }
function load_assets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();
	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
function loader_off() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_off'; }
function loader_on() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_on'; }
function mRemoveChildrenFromIndex(dParent, i) { while (dParent.children[i]) { mRemove(dParent.children[i]); } }
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	let family = info.family; // == 'emoNoto' && DA.isFirefox == true? 'emoNotoFF':info.family;
	styles.family = family;
	let sizes;
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, 25); }
	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	let labels = fs.getElementsByTagName('label');
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		wmax = Math.max(wmax, r1.w);
	}
	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
	}
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function miPic(item, dParent, styles, classes) {
	let info = isString(item) ? Syms[item] : isdef(item.info) ? item.info : item;
	let d = mDiv(dParent);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let family = info.family; // == 'emoNoto' && DA.isFirefox == true? 'emoNotoFF':info.family;
	addKeys({ family: family, fz: 50, display: 'inline-block' }, styles);
	mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	mCenterCenterFlex(d);
	return d;
}
function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			if (nundef(ui)) { pl.newcards = []; return; }
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}
function new_deal(fen) {
  let deck = fen.deck = create_fen_deck('n', fen.num_decks);
  shuffle(deck);
  for (const plName in fen.players) {
    let pl = fen.players[plName];
    let handsize = pl.handsize;
    pl.hand = cDeckDeal(deck, handsize);
  }
}
function object2string(o, props = [], except_props = []) {
	let s = '';
	if (nundef(o)) return s;
	if (isString(o)) return o;
	let keys = Object.keys(o).sort();
	for (const k of keys) {
		if (!isEmpty(props) && props.includes(k) || !except_props.includes(k)) {
			let val = isList(o[k]) ? o[k].join(',') : isDict(o[k]) ? object2string(o[k].props, except_props) : o[k];
			let key_part = isEmpty(s) ? '' : `, ${k}:`;
			s += val;
		}
	}
	return s;
}
function onclick_advanced_test() {
	DA.showTestButtons = toggle_visibility('dTestButtons');
	style_advanced_button();
}
function onclick_by_rank() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = 'rank'; //{ n: items.length, by: 'rank' };
	Clientdata.handsorting = pl.handsorting;
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //window[Z.game.toUpperCase()].rankstr); //'23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}
function onclick_by_suit() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	Clientdata.handsorting = pl.handsorting = 'suit'; //{ n: items.length, by: 'suit' };
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //'23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}
function onclick_game_menu_item(ev) { show_game_menu(ev_to_gname(ev)); }
function onclick_reload() {
	if (isdef(Z)) {
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			take_turn_fen();
		} else {
			FORCE_REDRAW = true; send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: false }, 'table');
		}
	} else if (U) { onclick_tables(); }
	else { show_users(); }
}
function onclick_table(tablename) {
	send_or_sim({ friendly: tablename, uname: U.name }, 'table');
}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function path2fen(fen, path) { let o = lookup(fen, path.split('.')); return o; }
function payment_complete() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.payment = A.items[A.selected[0]];
	let nextstage = Z.stage = ARI_LEGACY.stage[A.command];
	ari_pre_action();
}
function phpPost(data, cmd) {
	if (DA.TEST1 === true && cmd == 'table') { cmd = 'table1'; }
	pollStop();
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);
	if (DA.SIMSIM && (DA.exclusive || ['table', 'startgame', 'gameover', 'tables'].includes(cmd))) {
		sendSIMSIM(o, DA.exclusive);
		FORCE_REDRAW = true;
		if (DA.exclusive) return;
	} else if (DA.simulate) {
		sendSIMSIM(o, true, true);
		FORCE_REDRAW = true;
		return;
	}
	clear_transaction();
	var xml = new XMLHttpRequest();
	loader_on();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_off();
			handle_result(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);
	let d = mDiv(dParent, styles);
	if (isdef(Syms[key])) mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}
function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function post_accept_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	elem_from_to(item.key, fen.players[blackmailed].stall, fen.players[blackmailer].hand);
	ari_history_list([`${blackmailed} accepts: gives ${item.key} to ${blackmailer}`], 'blackmail');
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_auction() {
	console.assert(Z.stage == 13, 'WRONG STAGE IN POST AUCTION ' + Z.stage);
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.selected.map(x => A.items[x])[0]; // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);
	lookupSet(fen, ['buy', uplayer], { key: item.key, index: A.selected[0] });
	ari_history_list([`${uplayer} selects ${item.key}`], 'auction');
	for (const plname of fen.maxplayers) {
		if (!lookup(fen, ['buy', plname])) {
			Z.turn = [plname]; //fen.plorder[iturn];
			take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
			return;
		}
	}
	let buylist = dict2list(fen.buy, 'playername');
	let discardlist = [];
	for (const plname of fen.maxplayers) {
		let choice = fen.buy[plname]; //{key:item.key,index:A.selected[0]}
		let n = arrCount(buylist, x => x.index == choice.index);
		let is_unique = n == 1; //!firstCond(buylist, x => x.id != plname && x.key == choice);
		if (is_unique) {
			fen.players[plname].coins -= fen.second_most;
			let x = UI.player_stat_items[plname].dCoin; mPulse1(x); //console.log('dCoin: ', x); 
			elem_from_to(choice.key, fen.market, fen.players[plname].hand);
			ari_history_list([`${plname} buys ${choice.key} for ${fen.second_most}`], 'auction');
			let card = find_card(choice.index, UI.market);
			animate_card_transfer(card, arrLast(UI.players[plname].hand.items)); //UI.player_stat_items[plname]);
		} else {
			addIf(discardlist, choice.key);
			delete fen.buy[plname];
		}
	}
	for (const key of discardlist) {
		elem_from_to(key, fen.market, fen.deck_discard);
		ari_reorg_discard(fen);
		ari_history_list([`${key} is discarded`], 'auction');
	}
	delete fen.second_most;
	delete fen.maxplayers;
	delete fen.buy;
	delete fen.auction;
	Z.stage = 4;
	Z.turn = [fen.plorder[0]];
	setTimeout(take_turn_fen, 1000); //take_turn_fen(); 
}
function post_ball() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let keys = A.selected.map(x => A.items[x]).map(x => x.key);
	keys.map(x => lookupAddIfToList(fen, ['ball', uplayer], x));
	keys.map(x => removeInPlace(fen.players[uplayer].hand, x));
	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //alle sind durch ball selection
		if (isdef(fen.ball)) {
			let all = [];
			for (const c of fen.market) all.push(c);
			for (const uplayer in fen.ball) for (const c of fen.ball[uplayer]) all.push(c);
			shuffle(all);
			fen.market = [];
			for (let i = 0; i < 2; i++) top_elem_from_to(all, fen.market);
			for (const uplayer in fen.ball) for (let i = 0; i < fen.ball[uplayer].length; i++) top_elem_from_to(all, fen.players[uplayer].hand);
			delete fen.ball;
		} //else { console.log('empty ball!!!'); }
		iturn = 0;
		Z.stage = 4;
		console.assert(fen.phase == 'queen', 'wie bitte noch nicht in queen phase?!!!!!!!!!!!');
	}
	Z.turn = [fen.plorder[iturn]];
	ari_history_list([`${uplayer} added ${keys.length} card${plural(keys.length)} to ball!`], 'ball');
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
}
function post_blackmail() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_history_list([`blackmail complete!`], 'blackmail');
	delete fen.blackmail;
	ari_next_action();
}
function post_build() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected.length < 4 || A.selected.length > 6) {
		select_error('select 4, 5, or 6 cards to build!');
		return;
	}
	let building_items = A.selected.map(x => A.items[x]);
	let building_type = building_items.length == 4 ? 'farm' : building_items.length == '5' ? 'estate' : 'chateau';
	fen.players[uplayer].buildings[building_type].push({ list: building_items.map(x => x.key), h: null, schweine: [], lead: building_items[0].key });
	for (const item of building_items) {
		let source = lookup(fen, item.path.split('.'));
		removeInPlace(source, item.key);
	}
	ari_history_list([`${uplayer} builds a ${building_type}`], 'build');
	let is_coin_pay = process_payment();
	let ms = 1800;
	if (is_coin_pay) animcoin(Z.uplayer, 1000);
	remove_ui_items(building_items);
	let pl = fen.players[uplayer];
	let nfarms = pl.buildings.farm.length;
	let nestates = pl.buildings.estate.length;
	let nchateaus = pl.buildings.chateau.length;
	let index = building_type == 'farm' ? nfarms - 1 : building_type == 'estate' ? nfarms + nestates - 1 : nfarms + nestates + nchateaus - 1;
	console.log('index of new building is', index);
	let ifinal = UI.players[uplayer].indexOfFirstBuilding + index;
	console.log('ifinal', ifinal);
	let dpl = iDiv(UI.players[uplayer]);
	let akku = [];
	while (dpl.children.length > ifinal) { akku.push(dpl.lastChild); dpl.removeChild(dpl.lastChild); }
	let fenbuilding = arrLast(fen.players[uplayer].buildings[building_type]);
	let newbuilding = ui_type_building(fenbuilding, dpl, { maleft: 8 }, `players.${uplayer}.buildings.${building_type}.${index}`, building_type, ari_get_card, true, false);
	animbuilding(newbuilding, ms, ari_next_action);
	akku.map(x => mAppend(dpl, x));
}
function post_buy() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];
	elem_from_to(item.key, fen.open_discard, fen.players[uplayer].hand);
	ari_history_list([`${uplayer} buys ${item.key}`], 'buy')
	ari_reorg_discard();
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();
}
function post_buy_rumor() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0]);
	let rumor = item.key;
	for (const item of non_selected) { fen.deck_rumors.push(item.key); }
	fen.players[uplayer].rumors.push(rumor);
	fen.players[uplayer].coins -= 1;
	ari_history_list([`${uplayer} bought a rumor`], 'rumor');
	ari_next_action();
}
function post_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);
	let card = items.find(x => x.path && x.path.includes('church')); if (isdef(card)) card = card.key;
	let cand = items.length > 1 ? items.find(x => !x.path) : fen.candidates[0];
	if (isdef(cand) && isDict(cand)) cand = cand.key;
	if (nundef(card) || nundef(cand)) {
		select_error(`You must select a card ${items.length > 1 ? 'and a candidate' : ''}!`);
		return;
	}
	elem_from_to(card, fen.church, fen.players[cand].hand);
	ari_history_list([`${uplayer} gives ${cand} card ${card}`], 'new cards');
	removeInPlace(fen.toBeSelected, cand);
	if (fen.church.length == 1) {
		let cand = fen.toBeSelected[0];
		let card = fen.church[0];
		elem_from_to(card, fen.church, fen.players[cand].hand);
		ari_history_list([`${cand} receives last card: ${card}`], 'new cards');
		Z.stage = 14;
		let plorder = fen.plorder = jsCopy(fen.heraldorder);
		Z.turn = [plorder[0]];
		take_turn_fen();
	} else {
		Z.turn = [get_next_in_list(uplayer, fen.selorder)];
		take_turn_fen();
	}
}
function post_comm_setup_stage() {
	let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	let achtungHack = false;
	let new_playerdata = [];
	for (const data of Z.playerdata) {
		let o = data;
		if (is_stringified(data)) {
			console.log('achtungHack: data is stringified');
			o = JSON.parse(data);
			achtungHack = true;
		} else if (is_stringified(data.state)) {
			console.log('achtungHack: data.state is stringified');
			o.state = JSON.parse(data.state);
			achtungHack = true;
		}
		new_playerdata.push(o);
		let state = o.state;
		let giver = state.giver;
		let receiver = state.receiver;
		let keys = state.keys;
		keys.map(x => elem_from_to(x, fen.players[giver].commissions, fen.players[receiver].commissions));
	}
	if (achtungHack) { Z.playerdata = new_playerdata; }
	fen.comm_setup_num -= 1;
	if (fen.comm_setup_num <= 0) {
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;
		delete fen.keeppolling;
		ari_history_list([`commission trading ends`], 'commissions');
		if (exp_rumors && plorder.length > 2) {
			[Z.stage, Z.turn] = [24, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
			ari_history_list([`gossiping starts`], 'rumors');
		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }
	} else {
		[Z.stage, Z.turn] = [23, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
	}
	take_turn_fen_clear();
}
function post_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let comm_selected = A.items[A.selected[0]];
	let stall_item = A.commission_stall_item;
	console.log('stall_item:', stall_item);
	let rank = A.commission.key[0];
	if (nundef(fen.commissioned)) fen.commissioned = [];
	let x = firstCond(fen.commissioned, x => x.rank == rank);
	if (x) { removeInPlace(fen.commissioned, x); }
	else { x = { key: A.commission.key, rank: rank, count: 0 }; }
	x.count += 1;
	let pl = fen.players[uplayer];
	let top = isEmpty(fen.commissioned) ? null : arrLast(fen.commissioned);
	let rankstr = 'A23456789TJQK';
	let points = !top || get_rank_index(rank, rankstr) >= get_rank_index(top.rank, rankstr) ? 1 : 0;
	points += Number(x.count);
	pl.coins += points;
	fen.commissioned.push(x);
	let key = stall_item.key;
	removeInPlace(pl.stall, key); // das muss aendern!!!!!!!!!!!!!
	if (comm_selected.path == 'open_commissions') {
		removeInPlace(fen.open_commissions, comm_selected.key);
		top_elem_from_to(fen.deck_commission, fen.open_commissions);
	} else {
		removeInPlace(fen.deck_commission, comm_selected.key);
	}
	arrReplace(pl.commissions, [A.commission.key], [comm_selected.key]);
	ari_history_list([`${uplayer} commissions card ${A.commission.key}`, `${uplayer} gets ${points} coin${if_plural(points)} for commissioning ${A.commission.key}`], 'commission');
	ari_next_action();
}
function post_complementing_market_after_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	if (selectedKeys.length > 0) ari_history_list([`${uplayer} complements stall`], 'complement stall');
	let next = get_next_player(Z, uplayer);
	if (next == plorder[0]) {
		ari_clear_church();
		ari_start_action_stage();
	} else {
		Z.turn = [next];
		take_turn_fen();
	}
}
function post_defend_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	let rumors = fen.players[building_owner].rumors;
	let lead = fenbuilding.lead;
	let brumors = fenbuilding.rumors;
	let match = firstCond(rumors, x => x[0] == lead[0]);
	removeInPlace(rumors, match);
	brumors.pop();
	ari_history_list([`${blackmailed} defends: pays matching rumor to deflect blackmail, 1 rumor is removed from building`], 'blackmail');
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];
	A.downgrade_cards = A.selected.map(x => A.items[x]); //
	let obuilding = lookup(fen, A.building.path.split('.'));
	let n = obuilding.list.length;
	let nremove = A.downgrade_cards.length;
	let nfinal = n - nremove;
	let type = A.building.o.type;
	let list = pl.buildings[type];
	removeInPlace(list, obuilding);
	let cards = A.downgrade_cards.map(x => x.key);
	if (nfinal < 4) {
		pl.hand = pl.hand.concat(obuilding.list);
	} else if (nfinal == 4) {
		pl.buildings.farm.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 5) {
		pl.buildings.estate.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 6) {
		pl.buildings.chateau.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	}
	A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));
	if (isdef(pl.tithes)) {
		for (const c of cards) removeInPlace(pl.hand, c);
	}
	ari_history_list([`${uplayer} downgrades to ${ari_get_building_type(obuilding)}`], 'downgrade');
	if (isdef(pl.tithes)) { proceed_to_newcards_selection(); } else ari_next_action(fen, uplayer);
}
function post_endgame() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected[0] == 0) {
		console.log('GAMEOVER!!!!!!!!!!!!!!!!!!!');
		for (const plname of fen.plorder) {
			let pl = fen.players[plname];
			pl.vps = ari_calc_real_vps(fen, plname);
			pl.max_journey_length = ari_get_max_journey_length(fen, plname);
			pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
			console.log('score', plname, pl.score);
		}
		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		fen.winners = all_winners.map(x => x.name);
		console.log('winners:', fen.winners)
		take_turn_fen();
	} else {
		let iturn = fen.pl_gameover.indexOf(uplayer) + 1;
		if (iturn >= fen.pl_gameover.length) { //niemand wollte beenden: move to queen phase!
			delete fen.pl_gameover;
			Z.turn = [fen.plorder[0]];
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
			take_turn_fen();
		} else {
			Z.turn = [fen.pl_gameover[iturn]];
			take_turn_fen();
		}
	}
}
function post_exchange() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	let [p0, p1] = [i0.path, i1.path];
	if (p0.includes('build') == p1.includes('build')) {
		select_error('select exactly one building card and one of your hand or stall cards!');
		return;
	}
	let ibuilding = p0.includes('build') ? i0 : i1;
	let ihandstall = ibuilding == i0 ? i1 : i0;
	let fenbuilding = lookup(fen, ibuilding.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));
	let ib_index = ibuilding.o.index; //index of the building card within building!
	if (fenbuilding.schweine.includes(ib_index)) {
		fenbuilding.schweine.splice(fenbuilding.schweine.indexOf(ib_index), 1);
	}
	let pl = fen.players[uplayer];
	let list2 = ihandstall.path.includes('hand') ? pl.hand : pl.stall;
	let i2 = list2.indexOf(ihandstall.o.key)
	exchange_by_index(fenbuilding.list, ib_index, list2, i2);
	ari_history_list([`${uplayer} exchanges card in ${ari_get_building_type(fenbuilding)}`], 'exchange');
	animate_card_exchange(ibuilding, ihandstall, ari_next_action);
}
function post_harvest() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	fen.players[uplayer].hand.push(obuilding.h);
	obuilding.h = null;
	ari_history_list([`${uplayer} harvests`], 'harvest');
	ari_next_action();
}
function post_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let schwein = A.items[A.selected[0]].o;
	turn_new_schwein_up(schwein, A.fenbuilding, A.uibuilding);
}
function post_luxury_or_journey_cards() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let luxury_selected = A.selected[0] == 0;
	console.log('carditems', A.carditems);
	let n = A.carditems.length;
	if (luxury_selected) {
		let cardstoreplace = A.carditems.map(x => x.key); //add n luxury cards to player hand
		arrReplace(fen.players[uplayer].hand, cardstoreplace, deck_deal(fen.deck_luxury, n));
	} else {
		let len = A.jlegal.length;
		let handcards = firstCond(A.carditems, x => A.jlegal[0] == x.key) ? arrFromIndex(A.jlegal, len - n) : A.jlegal.slice(0, n);
		console.log('handcards', handcards);
		arrExtend(fen.players[uplayer].hand, handcards);
		A.jlegal = arrMinus(A.jlegal, handcards);
		let cardstoremove = A.carditems.map(x => x.key);
		arrRemove(fen.players[uplayer].hand, cardstoremove);
	}
	let path = A.journeyitem.path;
	let parts = path.split('.');
	let owner = parts[1];
	console.log('path', path, 'parts', parts, 'owner', owner)
	fen.players[owner].journeys.splice(Number(parts[3]), 1, A.jlegal);
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
	ari_history_list([`${uplayer} added to existing journey and takes ${luxury_selected ? 'luxury cards' : 'journey cards'}`], 'journey');
	take_turn_fen();
}
function post_new_journey() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	fen.players[uplayer].journeys.push(A.jlegal);
	arrReplace(fen.players[uplayer].hand, A.jlegal, deck_deal(fen.deck_luxury, A.jlegal.length));
	ari_history_list([`${uplayer} added journey`], 'journey');
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	take_turn_fen();
}
function post_pass() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let n = fen.total_pl_actions - fen.num_actions;
	ari_history_list([`${uplayer} passes after ${n} action${plural(n)}`], 'pass');
	fen.num_actions = 0;
	ari_next_action();
}
function post_pickup() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	elem_from_to(item.key, fen.players[uplayer].stall, fen.players[uplayer].hand);
	ari_history_list([`${uplayer} picks up ${item.key}`], 'pickup');
	ari_next_action();
}
function post_reject_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	ari_history_list([`${blackmailed} rejects!`], 'blackmail');
	let rumors = fenbuilding.rumors;
	let has_lead_rumor = firstCond(rumors, x => x[0] == fenbuilding.lead[0]);
	if (has_lead_rumor) {
		let stall = fen.players[blackmailed].stall;
		fen.players[blackmailer].hand = fen.players[blackmailer].hand.concat(stall);
		fen.players[blackmailed].stall = [];
		ari_history_list([`RUMOR CORRECT!!! ${blackmailed} looses entire stall to ${blackmailer}`], 'blackmail');
	} else {
		ari_history_list([`${blackmailed} was lucky!!! rumors incorrect`], 'blackmail');
	}
	delete fenbuilding.rumors;
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_rumor_both() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0])[0];
	let rumor = item.key;
	let rumor_other = non_selected.key;
	fen.players[uplayer].rumors.push(rumor);
	fen.players[A.owner].rumors.push(rumor_other);
	ari_history_list([`${uplayer} got a rumor, ${A.owner} got one too`], 'rumor');
	ari_next_action();
}
function post_rumor_setup() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	for (const plname of plorder) { fen.players[plname].rumors = []; }
	for (const plname of plorder) {
		let data = firstCond(Z.playerdata, x => x.name == plname);
		let di = data.state.di;
		for (const k in di) {
			arrPlus(fen.players[k].rumors, di[k]);
		}
	}
	ari_history_list([`gossiping ends`], 'rumors');
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	take_turn_fen_clear();
}
function post_sell() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('select exactly 2 cards to sell!');
		return;
	}
	for (const i of A.selected) {
		let c = A.items[i].key;
		elem_from_to(c, fen.players[uplayer].stall, fen.deck_discard);
	}
	ari_reorg_discard();
	fen.players[uplayer].coins += 1;
	let [i1, i2] = A.selected.map(x => A.items[x].key)
	ari_history_list([`${uplayer} sells ${i1} and ${i2}`], 'sell');
	ari_next_action(fen, uplayer);
}
function post_stall_selected() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	ensure_stallSelected(fen);
	fen.stallSelected.push(uplayer);
	ari_history_list([`${uplayer} puts up a stall for ${selectedKeys.length} action${plural(selectedKeys.length)}`], 'market');
	if (is_stall_selection_complete()) {
		delete fen.stallSelected;
		fen.actionsCompleted = [];
		if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		take_turn_fen();
	}
}
function post_tax() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = A.selected.map(x => A.items[x]);
	let n = fen.pl_tax[uplayer];
	if (items.length != n) {
		select_error(`please select exactly ${n} cards`);
		return;
	}
	for (const item of items) {
		elem_from_to_top(item.key, fen.players[uplayer].hand, fen.deck_discard);
	}
	ari_reorg_discard();
	ari_history_list([`${uplayer} pays tax: ${fen.pl_tax[uplayer]}`], 'tax');
	fen.pl_tax[uplayer] = 0;
	let iturn = fen.plorder.indexOf(uplayer);
	let plnext = ari_get_tax_payer(fen, fen.pl_tax, iturn + 1);
	if (plnext == null) {
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, 'king');
		delete fen.pl_tax;
	} else {
		Z.turn = [plnext];
	}
	take_turn_fen(fen, uplayer);
}
function post_tithe() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let items = A.selected.map(x => A.items[x]);
	if (items.length == 0) { select_error('No cards selected!'); return; }
	let st = items.map(x => ({ key: x.key, path: x.path }));
	let val = arrSum(st.map(x => ari_get_card(x.key).val));
	lookupSet(fen, ['players', uplayer, 'tithes'], { keys: st, val: val });
	remove_tithes_from_play(fen, uplayer);
	let pldone = plorder.filter(x => isdef(fen.players[x].tithes));
	let minplayers = arrMin(pldone, x => fen.players[x].tithes.val);
	let minplayer = isList(minplayers) ? minplayers[0] : minplayers;
	let minval = fen.tithemin = fen.players[minplayer].tithes.val;
	let next = get_next_in_list(uplayer, fen.church_order);
	if (next == fen.church_order[0]) {
		assertion(sameList(pldone, plorder), 'NOT all players have tithes!!!!!!!', pldone);
		if (minplayers.length > 1) { proceed_to_newcards_selection(); return; }
		else {
			pldone = pldone.filter(x => x != minplayer);
			let sorted = sortBy(pldone, x => fen.players[x].tithes.val);
			let second_min = sorted[0];
			fen.tithe_minimum = fen.players[second_min].tithes.val - minval;
			let pl = fen.players[minplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = isEmpty(vals) ? 0 : arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				pl.hand = [];
				pl.stall = [];
				let buildings = arrFlatten(get_values(pl.buildings));
				console.log('buildings', buildings);
				if (isEmpty(buildings)) {
					ari_history_list([`${minplayer} does not have a building to downgrade!`], 'downgrade');
					proceed_to_newcards_selection();
					return;
				}
				ari_history_list([`${minplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				Z.stage = 22;
			} else {
				ari_history_list([`${minplayer} must tithe more cards to reach ${min}!`], 'tithe');
				Z.stage = 21;
			}
			Z.turn = [minplayer];
		}
	} else {
		Z.turn = [next];
	}
	take_turn_fen();
}
function post_tithe_minimum() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);
	let st = items.map(x => ({ key: x.key, path: x.path }));
	pl.tithes.keys = pl.tithes.keys.concat(st);
	let newval = arrSum(st.map(x => ari_get_card(x.key).val));
	pl.tithes.val += newval;
	console.log('tithe_minimum', fen.tithe_minimum);
	console.log('val', pl.tithes.val);
	if (newval < fen.tithe_minimum) {
		select_error(`you need to tithe at least ${fen.tithe_minimum} to reach minimum`);
		return;
	}
	remove_tithes_from_play(fen, uplayer, st);
	proceed_to_newcards_selection();
}
function post_trade() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	let num_own_stall = [i0, i1].filter(x => x.path.includes(uplayer)).length;
	if (i0.path == i1.path) {
		select_error('you cannot trade cards from the same group');
		return;
	} else if (num_own_stall != 1) {
		select_error('you have to pick one card of your stall and one other card');
		return;
	} else {
		let list0 = lookup(fen, i0.path.split('.'));
		let list1 = lookup(fen, i1.path.split('.'));
		exchange_by_index(list0, i0.o.index, list1, i1.o.index);
		ari_history_list(get_trade_history(uplayer, i0, i1), 'trade');
		animate_card_exchange(i0, i1, ari_next_action);
	}
}
function post_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	let gb = A.building;
	let b = lookup(fen, gb.path.split('.'));
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estate' : 'chateau';
	let target = lookup(fen, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(fen, o.path.split('.'));
		elem_from_to(o.key, source, target.list);
	}
	let bres = target; //lookup(otree,target);
	bres.h = null;
	removeInPlace(fen.players[uplayer].buildings[type0], bres);
	fen.players[uplayer].buildings[type1].push(bres);
	ari_history_list([`${uplayer} upgrades a ${type0}`], 'upgrade');
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();
}
function post_visit() {
	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
		}
	} else {
		let list = obuilding.list;
		let correct_key = list[0];
		let rank = correct_key[0];
		while (list.length > 0) {
			let ckey = list[0];
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		if (isdef(obuilding.h)) {
			fen.deck_discard.unshift(obuilding.h);
		}
		ari_reorg_discard(fen);
		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));
		removeInPlace(blist, obuilding);
	}
	ari_history_list([`${uplayer} visited ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'visit');
	ari_next_action(fen, uplayer);
}
function proceed_to_newcards_selection() {
	let fen = Z.fen;
	let selorder = fen.selorder = sortByFuncDescending(fen.church_order, x => fen.players[x].tithes.val);
	fen.toBeSelected = jsCopy(selorder);
	fen.plorder = selorder;
	Z.turn = [selorder[0]];
	Z.stage = 19;
	take_turn_fen();
}
function processServerdata(obj, cmd) {
	if (isdef(Serverdata.table)) Serverdata.prevtable = jsCopy(Serverdata.table);
	if (isdef(obj.playerdata)) {
		let old_playerdata = valf(Serverdata.playerdata, []);
		let di = list2dict(old_playerdata, 'name');
		Serverdata.playerdata = if_stringified(obj.playerdata);
		Serverdata.playerdata_changed_for = [];
		for (const o of Serverdata.playerdata) {
			let old = di[o.name];
			o.state = isEmpty(o.state) ? '' : if_stringified(o.state);
			o.state1 = isEmpty(o.state1) ? '' : if_stringified(o.state1);
			o.state2 = isEmpty(o.state2) ? '' : if_stringified(o.state2);
			let changed = nundef(old) ? true : !simpleCompare(old, o);
			if (changed) {
				Serverdata.playerdata_changed_for.push(o.name);
			}
		}
	} else if (isdef(Serverdata.playerdata)) {
		Serverdata.playerdata_changed_for = Serverdata.playerdata.map(x => x.name);
		Serverdata.playerdata = [];
	} else Serverdata.playerdata_changed_for = [];
	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); }
		else if (k == 'users') Serverdata[k] = obj[k];
		else if (k == 'playerdata') continue;
		else if (cmd != 'assets') Serverdata[k] = obj[k];
	}
	if (isdef(obj.table)) {
		assertion(isdef(Serverdata.table) && obj.table.id == Serverdata.table.id, 'table NOT in Serverdata or table id mismatch');
		let i = Serverdata.tables.findIndex(x => x.id == obj.table.id);
		if (i != -1) { Serverdata.tables[i] = Serverdata.table; } else Serverdata.tables.push(Serverdata.table);
	}
	else if (isdef(Serverdata.table)) {
		let t = Serverdata.tables.find(x => x.id == Serverdata.table.id);
		if (nundef(t)) delete Serverdata.table;
	}
}
function process_auction() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	if (isEmpty(A.selected)) A.selected = [0];
	let playerbid = Number(valf(A.items[A.selected[0]].a, '0')); //A.selected.map(x => A.items[x]); 
	lookupSet(fen, ['auction', uplayer], playerbid);
	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //console.log('auction over!');
		let list = dict2list(fen.auction, 'uplayer');
		list = sortByDescending(list, 'value');
		let max = list[0].value;
		if (max == 0) {
			Z.stage = 4;
			Z.turn = [fen.plorder[0]];
			take_turn_fen();
			return;
		}
		let second = fen.second_most = list.length == 1 ? randomNumber(0, max) : list[1].value;
		Z.stage = 13;
		let maxplayers = fen.maxplayers = list.filter(x => x.value == max).map(x => x.uplayer);
		Z.turn = [maxplayers[0]];
		for (const plname of plorder) {
			ari_history_list([`${plname} bids ${fen.auction[plname]}`], 'auction');
		}
		ari_history_list([`auction winner${if_plural(fen.maxplayers.length)}: ${fen.maxplayers.join(', ')} (price: ${fen.second_most} coin)`], 'auction');
	} else {
		Z.turn = [fen.plorder[iturn]];
	}
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
}
function process_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	console.log('selected building to blackmail:', item);
	let building_owner = stringAfter(item.o.path, '.'); building_owner = stringBefore(building_owner, '.');
	let path = item.o.path;
	fen.blackmail = { blackmailer: uplayer, blackmailed: building_owner, payment: A.payment, building_path: path };
	let fenbuilding = lookup(fen, path.split('.'));
	console.log('blackmail:', fen.blackmail);
	fenbuilding.isblackmailed = true;
	ari_history_list([`${uplayer} is blackmailing ${building_owner}`], 'blackmail');
	[Z.stage, Z.turn] = [33, [building_owner]];
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(take_turn_fen, 1000); //take_turn_fen();
}
function leg_process_comm_setup() {
	let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	assertion(fen.keeppolling == true, "keeppolling must be true for leg_process_comm_setup!!!");
	if (DA.hallo) {
		console.log('leg_process_comm_setup:', Z.playerdata, Z.stage, uplayer, pl);
		return;
	}
	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	Z.state = { giver: giver, receiver: receiver, keys: keys };
	assertion(isdef(Z.playerdata), "Z.playerdata must be defined for leg_process_comm_setup!!!");
	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), `MISSING: playerdata for ${uplayer}`);
	data.state = Z.state;
	let can_resolve = check_resolve();
	if (can_resolve) {
		Z.turn = [Z.host];
		Z.stage = 104; //'next_comm_setup_stage';
		take_turn_fen_write();
	} else {
		if (Z.mode == 'hotseat') { Z.turn = [get_next_player(Z, uplayer)]; take_turn_fen_write(); }
		else take_turn_multi();
	}
}
function process_command() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.last_selected;
	if (nundef(item)) { post_pass(); return; }
	A.selected = [item.index];
	let a = A.items[A.selected[0]];
	A.command = a.key;
	ari_pre_action();
}
function process_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.commission = A.items[A.selected[0]];
	if (A.commission.similar.length > 1) {
		Z.stage = 37;
	} else {
		A.commission_stall_item = A.commission.similar[0];
		Z.stage = 16;
	}
	ari_pre_action();
}
function process_commission_stall() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	console.log('process_commission_stall selected', A.selected, 'item', A.items[A.selected[0]]);
	Z.A.commission_stall_item = A.items[A.selected[0]];
	Z.stage = 16;
	ari_pre_action();
}
function process_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	fen.stage = Z.stage = 103;
	let items = ui_get_hidden_building_items(A.building.o);
	items.map(x => face_up(x.o));
	A.possible_downgrade_cards = items;
	ari_pre_action();
}
function process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cards = item.o.items;
	cards.map(x => face_up(x))
	weiter_process_inspect();
}
function process_journey() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	if (isEmpty(A.selected)) {
		if (nundef(fen.passed)) fen.passed = []; fen.passed.push(uplayer);
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
		take_turn_fen();
		return;
	}
	let sel = A.selected.map(x => A.items[x].key);
	let [carditems, journeyitem, jlegal] = check_correct_journey(A, fen, uplayer);
	if (!carditems) return;
	delete fen.passed; //at this point, a player has selected successful journey so all players can enter journey round again!
	[A.carditems, A.journeyitem, A.jlegal] = [carditems, journeyitem, jlegal];
	Z.stage = A.journeyitem ? 30 : 31;
	ari_pre_action();
}
function process_payment() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.payment;
	is_coin_pay = nundef(item.o);
	if (is_coin_pay) a2_pay_with_coin(uplayer); else a2_pay_with_card(item);
	ari_history_list(get_pay_history(is_coin_pay ? 'coin' : item.o.key, uplayer), 'payment');
	A.payment_complete = true;
	return is_coin_pay;
}
function process_rumor() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = A.selected.map(x => A.items[x]);
	let building = firstCond(items, x => x.path.includes('building'));
	let rumor = firstCond(items, x => !x.path.includes('building'));
	if (nundef(building) || nundef(rumor)) {
		select_error('you must select exactly one building and one rumor card!');
		return;
	}
	let fenbuilding = lookup(fen, building.path.split('.'));
	lookupAddToList(fenbuilding, ['rumors'], rumor.key);
	removeInPlace(fen.players[uplayer].rumors, rumor.key);
	ari_history_list([`${uplayer} added rumor to ${ari_get_building_type(fenbuilding)}`,], 'rumor');
	ari_next_action(fen, uplayer);
}
function process_rumor_discard() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	console.log('.........items', A.items, A.selected, item);
	let rumor = item.key;
	removeInPlace(fen.players[uplayer].rumors, rumor);
	ari_history_list([`building is correct! ${uplayer} had to discard rumor (${rumor})`], 'rumor');
	ari_next_action();
}
function process_rumors_setup() {
	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];
	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}
	assertion(isdef(data), 'no data for player ' + uplayer); //	sss(); //console.log('data',data);
	rumor_update_playerdata(data, receiver, rumor);
	let playerdata_complete = rumor_playerdata_complete();
	if (playerdata_complete) {
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		clear_transaction();
		take_turn_fen_write();
	} else if (isEmpty(data.state.remaining)) {
		clear_transaction();
		take_turn_write();
	} else {
		add_transaction('rumorsetup');
		take_turn_write();
	}
}
function process_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let n = A.selected.length;
	if (n > 2 || n == 2 && !has_farm(uplayer)) {
		select_error('too many cards selected!');
		return;
	} else if (n == 0) {
		select_error('please select hand or stall card(s) to upgrade!');
		return;
	}
	A.upgrade_cards = A.selected.map(x => A.items[x]);
	Z.stage = fen.stage = 102;
	ari_pre_action();
}
function process_visit() {
	//alert('NOT IMPLEMENTED!');
	process_payment();
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	let parts = item.path.split('.');
	let owner = parts[1];
	if (isdef(obuilding.schweine)) {
		Z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;
	} else {
		let cards = item.o.items;
		let key = cards[0].rank;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schweine = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schweine = schweine;
		}
		ari_history_list([
			`${uplayer} visited ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'visit');
	}
}
function q_mirror_fen() {
	let fen = Z.fen;
	for (const prop of arguments) {
		let ui = UI[prop];
		fen[prop] = ui.list;
	}
	qanim();
}
function q_move_topmost(uideck, uito) {
	let topmost = pop_top(uideck); //pop_deck(uideck);
	let dfrom = iDiv(topmost);
	dfrom.remove();
	dfrom.style.position = 'static';
	dfrom.style.zIndex = 0;
	uito.items.push(topmost);
	uito.list = uito.items.map(x => x.key);
	mAppend(uito.cardcontainer, dfrom);
	qanim();
}
function qanim() {
	if (!isEmpty(DA.qanim)) {
		let [f, params] = DA.qanim.shift();
		f(...params);
	} //else console.log('...anim q done!')
}
function qanim_flip(card, ms = 400) {
	mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], qanim, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function qanim_flip_topmost(deck, ms = 400) {
	qanim_flip(deck.get_topcard(), ms);
}
function qanim_move(card, uifrom, uito, ms = 400) {
	let dfrom = iDiv(card);
	let dto = isEmpty(uito.items) ? uito.cardcontainer : iDiv(arrLast(uito.items));
	let dParent = find_common_ancestor(dfrom, dto);
	let rfrom = getRect(dfrom, dParent);
	let rto = getRect(dto, dParent);
	dfrom.style.zIndex = 100;
	let [offx, offy] = isEmpty(uito.items) ? [4, 4] : [card.w, 0];
	let a = mAnimate(dfrom, 'transform',
		[`translate(${offx + rto.l - rfrom.l}px, ${offy + rto.t - rfrom.t}px)`], qanim,
		ms, 'ease');
}
function qanim_move_topmost(uideck, uito, ms = 400) {
	let card = uideck.get_topcard();
	qanim_move(card, uideck, uito, ms);
}
function reindex_items(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function remove_tithes_from_play(fen, plname, tithes) {
	let pl = fen.players[plname];
	if (nundef(tithes)) tithes = pl.tithes.keys;
	for (const tithe of tithes) {
		if (tithe.path.includes('hand')) { removeInPlace(pl.hand, tithe.key); }
		else if (tithe.path.includes('stall')) { removeInPlace(pl.stall, tithe.key); }
	}
	ari_history_list([`${plname} tithes ${tithes.map(x => x.key).join(', ')}!`], 'tithe');
}
function remove_ui_items(items) {
	console.log('remove_ui_items', items);
	for (const item of items) {
		let card = item.o;
		make_card_unselectable(item);
		iDiv(item.o).remove();
	}
}
function reveal_church_cards() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let uichurch = UI.church;
	let dOpenTable = UI.dOpenTable;
	let church_cards = uichurch.items;
	uichurch.container.remove();
	UI.church = uichurch = ui_type_market(fen.church, dOpenTable, { maleft: 25 }, 'church', 'church');
}
function rumor_playerdata_complete() {
	for (const pldata of Z.playerdata) {
		if (isEmpty(pldata.state) || !isEmpty(pldata.state.remaining)) return false;
	}
	return true;
}
function rumor_update_playerdata(data, receiver, rumor) {
	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);
	Z.state = data.state; //genau DAS muss gesendet werden!!!!!
}
function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect = false) { //, show_submit_button=true) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	show_progress();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction; // + '</div>';
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); } //console.log('triggered!!!') }
	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : is_player(item.a) ? 'player' : isdef(item.o) ? 'container' : is_color(item.a) ? 'color' : 'string'; // nundef(item.submit_on_click) ? 'string' : 'submit';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string' || type == 'color') { //make button for this item!
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev);
			ui.id = id;
		}
	}
	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }
	let show_restart_button = A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min); //TODO: sollte das passieren, check in ari_pre_action die mins!!!
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (A.autosubmit) {
			loader_on();
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}
function select_clear_previous_level() {
	let A = Z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		let dsel = Z.game == 'accuse' ? mBy(`dTitleMiddle`) : mBy(`dSelections1`); // mBy(`dSelections${A.level}`)
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 });
		for (const item of A.items) {
			ari_make_unselectable(item);
			if (A.keep_selection) continue;
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itemtype == 'card') {
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding: 2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itemtype == 'container') {
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itemtype == 'string') {
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'color') {
				let db = mDiv(dsel, { bg: item.a, fg: 'contrast', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'player') {
				let db = mDiv(dsel, {}, item.id, `<span style="color:${get_user_color(item.a)};font-weight:bold"> ${item.a} </span>`);
			}
		}
	}
}
function select_confirm_weiter(callback) {
	select_add_items(ui_get_string_items(['weiter']), callback, 'may click to continue', 1, 1, Z.mode == 'multi');
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;
	if (A.maxselected == 1 && A.selected.length > 0) {
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
	} else if (A.selected.length == 2) {
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';
	} else {
		TO.error = setTimeout(continue_after_error, 3000);
	}
}
function select_highlight() { let A = Z.A; for (const i of A.selected) { let a = A.items[i]; ari_make_selected(a, true); } }//console.log('a', a); } }
function select_last(item, callback, ev) {
	if (isdef(ev)) evNoBubble(ev);
	Z.A.last_selected = item; callback(item, ev);
}
function select_timer(ms, callback) {
	let d = mBy('dSelections0');
	let dtimer = mDiv(d, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, 'dTimer');
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, 1000, null, ms, callback);
	timer.start();
	return dtimer;
}
function select_toggle() { //item,ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;
	let item = A.last_selected;
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {
		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }
		A.selected.push(item.index);
		ari_make_selected(item);
		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && A.autosubmit) {
			setTimeout(() => A.callback(), 100);
		}
	}
}
function sendSIMSIM(o, exclusive = false, saveFromZ = false) {
	o = data_from_client(o);	//console.log('sendSIMSIM', o,exclusive);
	let result = apiphp(o, saveFromZ); //console.log('result', result); //this is server send!!! 
	if (TESTING && o.cmd == 'startgame') { for (const func of DA.test.mods) func(result.table); }
	let res = JSON.stringify(result);
	if (exclusive) { if_hotseat_autoswitch(result); handle_result(res, o.cmd); } else { console.log('sendSIMSIM testresult', result); }
}

function sendgameover(plname, friendly, fen, scoring) {
	let o = { winners: plname, friendly: friendly, fen: fen, scoring: scoring };
	phpPost(o, 'gameover');
}
function set_journey_or_stall_stage(fen, options, phase) {
	let pljourney = exp_journeys(options) ? find_players_with_potential_journey(fen) : [];
	let stage, turn;
	if (isEmpty(pljourney)) { delete fen.passed; turn = [fen.plorder[0]]; ari_ensure_deck(fen, phase == 'jack' ? 3 : 2); stage = 3; }
	else { turn = [pljourney[0]]; stage = 1; }
	return [stage, turn];
}
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
	copyKeys(fen.players[name], PL);
	Z.uplayer = name;
}
function set_player_strategy(val) {
	Z.strategy = Clientdata.strategy = Z.pl.strategy = val;
	mRemove('dOptions')
}
function set_user(name) {
	if (isdef(Z) && isdef(U) && U.name != name) {
		Z.prev.u = U;
		Z.prev.uname = U.name;
	}
	U = firstCond(Serverdata.users, x => x.name == name);
	if (isdef(Z)) {
		Z.u = U;
		Z.uname = name;
	}
}
function shield_off() {
	mStyle('dAdmin', { bg: 'white' });
}
function shield_on() {
	mShield(dTable.firstChild.childNodes[1]);
	mStyle('dAdmin', { bg: 'silver' });
}
function show_admin_ui() {
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer', 'bRestartMove', 'dTakeover', 'bExperience']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.uname == Z.host && Z.stage == 'round_end') show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == 'mimi' && Z.stage != 'card_selection') show('bClearAck');
	if (Z.game == 'accuse' && lookup(Z, ['fen', 'players', Z.uplayer, 'experience']) > 0) show('bExperience');
	if (['ferro', 'bluff', 'aristo', 'a_game'].includes(Z.game) && (Z.role == 'active' || Z.mode == 'hotseat')) {
		show('bRandomMove');
	}
	if (Z.uname == Z.host || Z.uname == 'mimi' || Z.uname == 'felix') show('dHostButtons'); else hide('dHostButtons');
	if (DA.showTestButtons == true) show('dTestButtons'); else hide('dTestButtons');
}
function show_advanced_ui_buttons() {
	let dParent = mBy('dAdvancedUI');
	mClear(dParent)
	let sz = 20;
	let styles = { bg: 'silver', wmin: sz, h: sz, rounding: '50%', maright: 10, align: 'center' };
	mButton(' ', onclick_advanced_test, dParent, styles, 'enabled');
	style_advanced_button();
}
function show_game_menu(gamename) {
	stopgame();
	show('dMenu'); mClear('dMenu');
	let dMenu = mBy('dMenu');
	let dForm = mDiv(dMenu, { align: 'center' }, 'fMenuInput');
	let dInputs = mDiv(dForm, {}, 'dMenuInput');
	let dButtons = mDiv(dForm, {}, 'dMenuButtons');
	let bstart = mButton('start', () => {
		let players = DA.playerlist.map(x => ({ name: x.uname, playmode: x.playmode }));
		let game = gamename;
		let options = collect_game_specific_options(game);
		for (const pl of players) { if (isEmpty(pl.strategy)) pl.strategy = valf(options.strategy, 'random'); }
		startgame(game, players, options); hide('dMenu');
	}, dButtons, {}, ['button', 'enabled']);
	let bcancel = mButton('cancel', () => { hide('dMenu'); }, dButtons, {}, ['button', 'enabled']);
	let bclear = mButton('clear players', clearPlayers, dButtons, {}, ['button', 'enabled']);
	let d = dInputs; mClear(d); mCenterFlex(d);
	let dPlayers = mDiv(d, { gap: 6 });
	mCenterFlex(dPlayers);
	DA.playerlist = [];
	DA.allPlayers = [];
	DA.lastName = null;
	let params = [gamename, DA.playerlist];
	let funcs = [style_not_playing, style_playing_as_human, style_playing_as_bot];
	for (const u of Serverdata.users) {
		let d = get_user_pic_and_name(u.name, dPlayers, 40);
		mStyle(d, { w: 60, cursor: 'pointer' })
		let item = { uname: u.name, div: d, state: 0, strategy: '', isSelected: false };
		DA.allPlayers.push(item);
		if (is_loggedin(u.name)) { toggle_select(item, funcs, gamename, DA.playerlist); DA.lastName = U.name; }
		else d.onclick = ev => {
			if (ev.shiftKey) {
				let list = Serverdata.users;
				if (nundef(DA.lastName)) DA.lastName = list[0].name;
				let x1 = list.find(x => x.name == DA.lastName);
				let i1 = list.indexOf(x1);
				let x2 = list.find(x => x.name == item.uname);
				let i2 = list.indexOf(x2);
				if (i1 == i2) return;
				if (i1 > i2) [i1, i2] = [i2, i1];
				assertion(i1 < i2, "NOT IN CORRECT ORDER!!!!!")
				for (let i = i1; i <= i2; i++) {
					let xitem = DA.allPlayers[i];
					if (xitem.isSelected) continue;
					style_playing_as_human(xitem, gamename, DA.playerlist);
				}
				DA.lastName = item.uname;
			} else {
				toggle_select(item, funcs, gamename, DA.playerlist);
				if (item.isSelected) DA.lastName = item.uname;
			}
		}
	}
	mDiv(d, { w: '100%', fz: 11, fg: '#444' }, null, '(use SHIFT to multi-select players)'); //'SHIFT<br>multiselect');
	mLinebreak(d, 1);
	show_game_options(d, gamename);
	mFall('dMenu');
}
function show_game_options(dParent, game) {
	mRemoveChildrenFromIndex(dParent, 2);
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(','); // make a list 
			if (list.length <= 1) continue;
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}
}
function show_games(ms = 500) {
	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });
	let d = mDiv(dParent, { fg: 'white', animation: 'appear 1s ease both' }, 'game_menu'); mFlexWrap(d);
	let gamelist = 'accuse aristo bluff wise spotit ferro'; if (DA.TEST0) gamelist += ' a_game';
	for (const gname of toWords(gamelist)) {
		let g = Config.games[gname];
		let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
		let d1 = mDiv(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 15, wmin: 140, height: 90, bg: bg, position: 'relative' }, g.id);
		d1.setAttribute('gamename', gname);
		d1.onclick = onclick_game_menu_item;
		mCenterFlex(d1);
		mDiv(d1, { fz: 50, family: sym.family, 'line-height': 55 }, null, sym.text);
		mLinebreak(d1);
		mDiv(d1, { fz: 18, align: 'center' }, null, g.friendly);
	}
}
function show_handsorting_buttons_for(plname, styles = {}) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative', wmin: 155 }); //,bg:'green' });
	addKeys({ position: 'absolute', left: 58, bottom: -8, height: 25 }, styles);
	let dHandButtons = mDiv(d, styles, 'dHandButtons');
	show_player_button('rank', dHandButtons, onclick_by_rank);
	show_player_button('suit', dHandButtons, onclick_by_suit);
}
function show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const o of jsCopy(fen.history).reverse()) {
			html += beautify_history(o.lines, o.title, fen);
		}
		let dHistory = mDiv(dParent, { maright: 10, hpadding: 12, bg: colorLight('#EDC690', 50), box: true, matop: 4, rounding: 10, patop: 10, pabottom: 10, hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', w: 260 }, null, html); //JSON.stringify(fen.history));
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
		if (isdef(Clientdata.historyLayout)) { show_history_layout(Clientdata.historyLayout); }
	}
}
function show_history_layout(layout) {
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	if (layout == 'ph') PHLayout();
	else if (layout == 'hp') HPLayout();
	else if (layout == 'prh') PRHLayout();
	else if (layout == 'hrp') HRPLayout();
	else PHLayout();
}
function show_history_popup() {
	if (isEmpty(Z.fen.history)) return;
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	let l = valf(Clientdata.historyLayout, 'ph');
	let cycle = ['ph', 'hp', 'prh', 'hrp'];
	let i = (cycle.indexOf(l) + 1) % cycle.length;
	show_history_layout(cycle[i]);
}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);
}
function show_instruction(msg) { mBy('dSelections0').innerHTML = msg; }
function show_message(msg = '', stay = false) {
	mStyle(dTable, { transition: 'all 1s ease' });
	let d = mBy('dMessage'); d.innerHTML = msg;
	if (stay) return;
	let ms = 1000, delay = 3000;
	let anim = d.animate([{ transform: `scale(1,1)`, opacity: 1 }, { transform: `scale(1,0)`, opacity: 0 },], { duration: 1000, easing: 'ease', delay: delay });
	dTable.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-56px)' },], { fill: 'none', duration: ms, easing: 'ease', delay: delay });
	anim.onfinish = () => {
		mClear(d);
	}
}
function show_options_popup(options) {
	let opresent = {};
	let di = { mode: 'gamemode', yes: true, no: false };
	let keys = get_keys(options);
	keys.sort();
	for (const k of get_keys(options).sort()) {
		let key = valf(di[k], k);
		let val = valf(di[options[k]], options[k]);
		opresent[key] = val;
	}
	let x = mYaml(mCreate('div'), opresent);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
}
function show_role() {
	if (Z.game == 'accuse') { show_role_accuse(); return; }
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = ''; //`<span style="color:dimgray;font-family:Algerian">${Z.friendly}  </span>`; // `in ${stringAfter(Z.friendly,'of ')}`;
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = location + text;
	mStyle(d, styles);
}
function show_role_accuse() {
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let [role, pldata, stage, fen, phase, uplayer, turn, uname, host, mode] = [Z.role, Z.playerdata, Z.stage, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	if (mode == 'hotseat') {
		text = `hotseat: <span style='color:${get_user_color(uplayer)}'>${uplayer}</span>`;
		styles = boldstyle;
		styles.wmin = 220;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'inactive' && !DA.showTestButtons) {
		styles = normalstyle;
		text = `(${turn[0]}'s turn)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length > 1 && !has_player_state(uplayer)) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length == 1) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (DA.showTestButtons) {
		let pls = turn.filter(x => x != uname && !has_player_state(x));
		if (isEmpty(pls)) pls = [host];
		let dpics = mDiv(d, { gap: 10 }); mCenterCenterFlex(dpics);
		for (const plname of pls) {
			let pic = get_user_pic(plname, sz = 30, border = 'solid medium white');
			mStyle(pic, { cursor: 'pointer' })
			pic.onclick = () => transferToPlayer(plname);
			mAppend(dpics, pic);
		}
	} else {
		styles = normalstyle;
		text = `(waiting for other players)`;
		d.innerHTML = text; mStyle(d, styles);
	}
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	mStyle(dParent, { 'justify-content': 'end', gap: 12, paright: 10 })
	let playmode = get_playmode(uplayer); //console.log('playmode',playmode,'uplayer',uplayer);
	let game_mode = Z.mode;
	let st = { fz: 20, padding: 0, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let dHistoryButton = miPic('scroll', dParent, st);
	dHistoryButton.onclick = show_history_popup;
	if (isdef(Config.games[Z.game].options.strategy)) {
		let dStrategy = miPic('chess pawn', dParent, st);
		dStrategy.onclick = show_strategy_popup;
	}
	let d = miPic('gear', dParent, st);
	options.playmode = playmode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_strategy_popup() {
	let dpop = mPopup('', dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mAppend(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
	mDiv(dpop, { matop: 5, maleft: 10 }, null, `choose strategy:`);
	let vals = Config.games[Z.game].options.strategy.split(',');
	let key = 'strategy';
	let fs = mRadioGroup(dpop, { fg: 'white' }, `d_${key}`); //,`${key}`, {fg:'white',border:'1px solid red'});
	for (const v of vals) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, set_player_strategy, key, v == Z.strategy); }
	measure_fieldset(fs);
}
function show_tables(ms = 500) {
	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);
	show_games();
	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }
	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);
	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});
	let d = iDiv(t);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);
		c = mAppend(r, mCreate('td'));
		c.innerHTML = h;
	}
}
function show_title() {
	settingsOn = Z.func.state_info(mBy('dTitleLeft'));
	if (nundef(settingsOn) || settingsOn) show_settings(mBy('dTitleRight'));
	mBy('dTablename').innerHTML = Z.friendly;
}
function show_username(loadTable = false) {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) add_advanced_ui(d); //mAppend(d, get_advanced_menu_buttons());
	mAppend(d, get_logout_button());
	mAppend(d, dpic);
	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	if (!TESTING && !DA.running) {
		if (!loadTable) phpPost({ app: 'easy' }, 'tables');
		else if (!isEmpty(Serverdata.tables)) {
			onclick_table(Serverdata.tables[0].friendly);
		}
	}
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}
function show_waiting_for_ack_message() {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = 'waiting for next round to start...'; //.remove();
}
function show_waiting_message(msg) {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = msg;
}
function show_winners() {
	let winners = Z.fen.winners;
	let multiple_winners = winners.length > 1;
	let winners_html = winners.map(x => get_user_pic_html(x, 35)).join(' ');
	let msg = `
		<div style="display:flex;gap:10px;align-items:center">
			<div style="color:red;font-size:22px;font-weight:bold;">GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div>
			<div style="padding-top:5px;">${winners_html}</div>
		</div>
	`;
	show_message(msg, true);
	mShield(dTable);
	hide('bRestartMove');
	return Z.fen.winners;
}
function simpleCompare(o1, o2) {
	let s1 = object2string(o1);
	let s2 = object2string(o2);
	return s1 == s2;
}
function sortByFuncDescending(arr, func) { arr.sort((a, b) => (func(a) > func(b) ? -1 : 1)); return arr; }
function start_new_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	Z.stage = 'card_selection';
	fen.plorder = arrCycle(plorder, 1);
	let starter = fen.plorder[0];
	Z.turn = fen.turn = [starter];
	let deck = fen.deck = create_fen_deck('n', fen.num_decks, fen.num_decks * 4);
	let deck_discard = fen.deck_discard = [];
	shuffle(deck);
	let handsize = valf(Number(Z.options.handsize), 11);
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.journeys = [];
		pl.roundgoal = false;
		pl.roundchange = true;
		delete pl.handsorting;
	}
	Z.round += 1;
	if (Z.round > Z.options.maxrounds) {
		ari_history_list([`game over`], 'game');
		Z.stage = 'game_over';
		fen.winners = find_players_with_min_score();
	}
}
function start_transaction() {
	if (DA.simulate) return;
	DA.simulate = true;
	DA.snapshot = { fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn }; //brauch ich eigentlich nicht
	DA.transactionlist = [];
}
function start_with_assets(reload = false) {
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	show_home_logo();
	if (nundef(U)) { show_users(); return; }
	show_username(reload);
	if (DA.TEST0 || DA.showTestButtons) show('dTestButtons');
}
function startgame(game, players, options = {}) {
	if (nundef(game)) game = 'a_game';
	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, options); //ensure options
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => ({ name: x.name })); //, playmode: 'human', strategy:valf(options.strategy,'random') })); //ensure players
	let playernames = players.map(x => x.name);
	let fen = window[game]().setup(playernames, options);
	if (nundef(fen.round)) fen.round = 1;
	if (nundef(fen.phase)) fen.phase = '';
	if (nundef(fen.stage)) fen.stage = 0;
	if (nundef(fen.step)) fen.step = 0;
	if (nundef(fen.turn)) fen.turn = [fen.plorder[0]]; else if (DA.TESTSTART1 && fen.turn.length == 1) fen.turn = [playernames[0]];
	players.map(x => { let pl = fen.players[x.name]; pl.playmode = valf(x.playmode, 'human'); pl.strategy = valf(x.strategy, valf(options.strategy, 'random')); });
	if (options.mode == 'solo') {
		let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(playernames);
		for (const plname of playernames) {
			if (plname == me) continue;
			fen.players[plname].playmode = 'bot';
		}
		options.mode = 'hotseat';
	}
	for (const k in options) { if (isNumber(options[k])) options[k] = parseInt(options[k]); }
	let o = {
		friendly: generate_table_name(players.length), game: game, host: playernames[0], players: playernames,
		fen: fen, options: options
	};
	ensure_polling(); // macht einfach nur Pollmode = 'auto'
	phpPost(o, 'startgame');
}
function stopPolling() { pollStop(); }
function stop_timer() {
	if (isdef(DA.timer)) {
		let res = DA.timer.clear();
		DA.timer = null;
		return isNumber(res) ? res : 0;
	}
	return 0;
}

function stopgame() {
	if (!DA.running) return;
	DA.running = false;
	DA.noshow = 0;
	clear_timeouts();
	hide('bRestartMove');
	hide('dHostButtons');
	mStyle('dAdmin', { bg: 'white' });
	mClear('dAdminMiddle')
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer']) hide(id);
	pollStop();
	Z = null; delete Serverdata.table; delete Serverdata.playerdata; Clientdata = {};
	staticTitle();
}
function style_advanced_button() {
	let b = mBy('dAdvancedUI').children[0];
	if (DA.showTestButtons) { b.innerHTML = ' '; mStyle(b, { bg: GREEN, opacity: 1 }); } //fg: 'green' }) }
	else { b.innerHTML = ' '; mStyle(b, { bg: 'silver', opacity: .5 }); } //fg: 'black' }) }
}
function style_not_playing(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: 'transparent', fg: 'black' });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 0; item.playmode = 'none'; removeInPlace(list, item);
	item.isSelected = false;
}
function style_playing_as_bot(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username'); let bg = get_game_color(game);
	mStyle(ui, { bg: bg, fg: colorIdealText(bg) });
	arrLast(arrChildren(ui)).innerHTML = uname.substring(0, 3) + 'bot';
	item.ifunc = 2; item.playmode = 'bot';
	item.isSelected = true;
}
function style_playing_as_human(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: get_user_color(uname), fg: colorIdealText(get_user_color(uname)) });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 1; item.playmode = 'human'; list.push(item);
	item.isSelected = true;
}
function switch_uname(plname) {
	set_user(plname);
	show_username();
}
function to_aristocard(ckey, sz = 100, color = RED, w) {
	let info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = color;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	info.irank = 'A23456789TJQK'.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * 13 + info.irank;
	return info;
}
function toggle_select(item, funcs) {
	let params = [...arguments];
	let ifunc = (valf(item.ifunc, 0) + 1) % funcs.length; let f = funcs[ifunc]; f(item, ...params.slice(2));
}

function toggle_visibility(elem) {
	elem = toElem(elem);
	if (nundef(elem)) return;
	let vis = elem.style.display;
	if (vis == 'none') { show(elem); return true; } else { hide(elem); return false; }
}
function too_many_string_items(A) { return A.items.filter(x => nundef(x.o)).length >= 8; }
function top_elem_from_to(arr1, arr2) { arr2.push(arr1.shift()); }
function transferToPlayer(plname) {
	stopgame();
	clear_screen();
	set_user(plname);	//U = firstCond(Serverdata.users, x => x.name == plname);	//localStorage.setItem('uname', U.name); DA.secretuser = U.name;
	assertion(U.name == plname, 'set_user nicht geklappt!!!!!!!')
	show_username(true);
}
function turn_has_bots_that_must_move() {
	let [turn, pldata] = [Z.turn, Z.playerdata];
	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata, 'name');
	let bots_on_turn = turn.filter(x => Z.fen.players[x].playmode != 'human');
	for (const bot of bots_on_turn) {
	}
	let no_pldata = bots_on_turn.filter(x => !isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length == bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	return no_pldata;
}
function turn_new_schwein_up(schwein, fenbuilding, uibuilding) {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let is_first_schwein = isEmpty(fenbuilding.schweine);
	add_schwein(schwein, fenbuilding, uibuilding);
	ari_history_list([`${uplayer} reveals a schwein!`], 'inspect');
	if (is_first_schwein) {
		console.log('unique AND first new schwein');
		show_instruction('found schwein - both players get a rumor!');
		let owner = stringAfter(uibuilding.path, '.');
		owner = stringBefore(owner, '.');
		console.log('owner', owner, 'uplayer', uplayer);
		A.owner = owner;
		ari_open_rumors(32);
	} else {
		console.log('unique new schwein (gibt schon schweine)')
		show_instruction('found schwein - you gain a rumor!');
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		ari_history_list([`${uplayer} inspects a schweine building!`], 'inspect');
		ari_next_action();
	}
}
function ui_get_blackmailed_items() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let commands = ['accept', 'reject'];
	let rumors = fen.players[uplayer].rumors;
	let b = path2fen(fen, fen.blackmail.building_path);
	if (nundef(b.lead)) b.lead = b.list[0];
	if (isList(rumors) && firstCond(rumors, x => x[0] == b.lead[0])) {
		commands.push('defend');
	}
	return ui_get_string_items(commands);
}
function ui_get_build_items(uplayer, except) {
	let items = ui_get_hand_and_stall_items(uplayer);
	if (is_card(except)) items = items.filter(x => x.key != except.key);
	reindex_items(items);
	return items;
}
function ui_get_building_items(uplayer) {
	let gblist = UI.players[uplayer].buildinglist;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_buildings(gblist) {
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_buy_or_pass_items() {
	let items = [], i = 0;
	if (!isEmpty(UI.deck_discard.items)) items.push(ui_get_deck_item(UI.deck_discard));
	items = items.concat(ui_get_string_items(['pass']));
	reindex_items(items);
	return items;
}
function ui_get_church_items(uplayer) {
	let fen = Z.fen;
	let items = [], i = 0;
	let church = UI.church;
	for (const o of church.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: church.path, index: i };
		i++;
		items.push(item);
	}
	let candidates = fen.candidates = arrMinus(fen.toBeSelected, uplayer);
	if (candidates.length > 1) {
		let player_items = ui_get_string_items(candidates);
		items = items.concat(player_items);
		reindex_items(items);
	}
	return items;
}
function ui_get_coin_amounts(uplayer) {
	let items = [];
	for (let i = 0; i <= Z.fen.players[uplayer].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
function ui_get_commands(uplayer) {
	let avail = ari_get_actions(uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	let stall = ui_get_stall_items(uplayer);
	for (const o of comm.items) {
		let rank = o.key[0];
		let similar = firstCond(stall, x => x.key[0] == rank);
		if (!similar) continue;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i, similar: stall.filter(x => x.key[0] == rank) }; // similar: similar };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_new_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.open_commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	return items;
}
function ui_get_commission_stall_items() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	console.log('ui_get_commission_stall_items similar', A.commission.similar);
	let items = A.commission.similar;
	reindex_items(items);
	return items;
}
function ui_get_deck_item(uideck) {
	let topdeck = uideck.get_topcard();
	let item = { o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: uideck.path, index: 0 };
	return item;
}
function ui_get_endgame(uplayer) { return ui_get_string_items(['end game', 'go on']); }
function ui_get_ferro_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer);	//hand items
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			for (const o of jitem.items) {
				if (!is_joker(o)) { continue; }
				let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
				items.push(item);
			}
		}
	}
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			let o = jitem.items[0]; // lead card
			let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
			items.push(item);
		}
	}
	let cmds = ui_get_submit_items(['discard', 'auflegen', 'jolly', 'anlegen']);
	items = items.concat(cmds);
	reindex_items(items);
	return items;
}
function ui_get_other_buildings(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist));
	}
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_and_rumors(uplayer) {
	let items = ui_get_other_buildings(uplayer);
	items = items.concat(ui_get_rumors_items(uplayer));
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_with_rumors(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist.filter(x => !isEmpty(x.rumors))));
	}
	reindex_items(items);
	return items;
}
function ui_get_payment_items(pay_letter) {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = ui_get_hand_and_stall_items(uplayer); //gets all hand and stall cards
	let n = items.length;
	items = items.filter(x => x.key[0] == pay_letter);
	if (n == 4 && A.command == 'build') items = []; //das ist damit min building items gewahrt bleibt!
	if (n == 1 && A.command == 'upgrade') items = []; //das ist damit min upgrade items gewahrt bleibt!
	if (fen.players[uplayer].coins > 0 && fen.phase[0].toUpperCase() == pay_letter) {
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
	}
	let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
	return items;
}
function ui_get_rumors_and_players_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;
	let [data, pl] = [Z.uplayer_data, Z.pl];
	assertion(isdef(data), 'no data for player ' + uplayer);
	if (!isDict(data.state)) data.state = { remaining: jsCopy(pl.rumors), receivers: [], di: {} };
	let rem = data.state.remaining;
	for (const k of rem) {
		let o = firstCond(comm.items, x => x.key == k);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let players = [];
	let receivers = data.state.receivers;
	for (const plname in UI.players) {
		if (plname == uplayer || receivers.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));
	reindex_items(items);
	return items;
}
function ui_get_rumors_items(uplayer) {
	let items = [], i = 0;
	let rum = UI.players[uplayer].rumors;
	for (const o of rum.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: rum.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_schweine_candidates(uibuilding) {
	let items = ui_get_hidden_building_items(uibuilding);
	items = items.filter(x => x.o.key[0] != uibuilding.keycard.key[0]);
	reindex_items(items);
	return items;
}
function ui_get_stall_items(uplayer) {
	let items = [], i = 0;
	let stall = UI.players[uplayer].stall;
	for (const o of stall.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: stall.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_string_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_submit_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i, submit_on_click: true, itemtype: 'submit' };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_top_rumors() {
	let items = [], i = 0;
	for (const o of UI.rumor_top.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `rumor_top`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_trade_items(uplayer) {
	let items = ui_get_market_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));//zuerst eigene!
	for (const plname of Z.fen.plorder) {
		if (plname != uplayer) items = items.concat(ui_get_stall_items(plname));
	}
	reindex_items(items);
	return items;
}
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	reindex_items(items);
	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}
	let d_rumors = null, rumorItems = [];
	if (!isEmpty(b.rumors)) {
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 }); //,bg:'green'});
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items);
	let uischweine = [];
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
	}
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schweine: uischweine,
		harvest: d_harvest,
		rumors: rumorItems,
		keycard: items[0],
	};
}
function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	let inc = 90;
	let rotation = n % 2 ? 0 : 90;
	for (const ckey of list) {
		let d = mDiv(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = { card: c, div: d };
		items.push(item);
		rotation += inc;
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function unpack_table(table) {
	for (const k of ['players', 'fen', 'options', 'scoring']) {
		let val = table[k];
		if (isdef(table[k])) table[k] = if_stringified(val); if (nundef(table[k])) table[k] = {}; //JSON.parse(table[k]); else table[k] = {};
	}
	if (isdef(table.modified)) { table.modified = Number(table.modified); table.timestamp = new Date(table.modified); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game]), 'game function for ' + table.game + ' not defined in window');
	if (isdef(table.game)) { table.func = window[table.game](); }
	if (isdef(table.options.mode)) { table.mode = table.options.mode; }
	delete table.action; delete table.expected;
	return table;
}
function update_table() {
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);
	assertion(isdef(Z.host), 'TABLE HAS NOT HOST IN UPDATE_TABLE!!!!!!!!!!!!!!')
	Clientdata.this_turn = Z.turn;
	set_user(U.name); //sets Z.uname
	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);
	let [fen, uname, turn, mode, host] = [Z.fen, Z.uname, Z.fen.turn, Z.mode, Z.host];
	let role = Z.role = !is_playing(uname, fen) ? 'spectator' : fen.turn.includes(uname) ? 'active' : 'inactive';
	let upl = role != 'spectator' ? uname : turn[0];
	if (Z.game == 'accuse') {
		if (isdef(Clientdata.mode)) Z.mode = Clientdata.mode;
		if (mode == 'hotseat' && turn.length > 1) {
			let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next;
		} else if (turn.length > 1 && uname == host) { //hand membership round
			let bots = turn_has_bots_that_must_move();
			if (!isEmpty(bots)) upl = bots[0];
		} else if (uname == host && !is_human_player(turn[0])) {
			upl = turn[0];
		} else if (mode == 'hotseat') {
			upl = turn[0];
		}
	} else {
		upl = Z.role == 'active' ? uname : turn[0];
		if (mode == 'hotseat' && turn.length > 1) { let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next; }
		if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }
	}
	set_player(upl, fen); //sets uplayer
	let pl = Z.pl;
	Z.playmode = pl.playmode; //could be human | ai | hybrid (that's for later!!!)
	Z.strategy = uname == pl.name ? valf(Clientdata.strategy, pl.strategy) : pl.strategy; //humans are really hybrids: they have default strategy 'random'
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];
	Z.uplayer_data = firstCond(Z.playerdata, x => x.name == Z.uplayer);
	let sametable = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sameplayerdata = isEmpty(Z.playerdata_changed_for);
	let myplayerdatachanged = Z.playerdata_changed_for.includes(Z.uplayer);
	let specialcase = !i_am_host() && !i_am_acting_host() && !i_am_trigger() && !myplayerdatachanged;
	Z.skip_presentation = sametable && (sameplayerdata || specialcase);
	if (DA.TEST1 && DA.TEST0 && (!sametable || !sameplayerdata)) {
		console.log('======>Z.skip_presentation', Z.skip_presentation, '\nplayerdata_changed_for', Z.playerdata_changed_for);
		console.log('_______ *** THE END *** ___________')
	}
	FORCE_REDRAW = false;
}

const GT = {}; //tables
function verify_min_req() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};
	let goals = is_fixed_goal() ? [get_round_goal()] : get_available_goals(uplayer);
	for (const g of goals) {
		if (di[g] == true) { return true; } //console.log('achieved',g);
	}
	return false;
}

function weiter_process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let uibuilding = A.uibuilding = item.o;
	let fenbuilding = A.fenbuilding = lookup(fen, uibuilding.path.split('.'));
	let key = uibuilding.keycard.key;
	let cards = uibuilding.items;
	let schweine_cand = [];
	for (let i = 1; i < cards.length; i++) {
		if (fenbuilding.schweine.includes(i)) continue; //if index i is already in schweine, skip this card
		let card = cards[i];
		if (card.key == key) continue;
		assertion(i == card.index, 'wrong card index!!!!')
		schweine_cand.push(card); //add this card to schweine_cand
	}
	if (schweine_cand.length > 1) {
		Z.stage = 38;
		ari_pre_action();
	} else if (schweine_cand.length == 1) {
		setTimeout(() => turn_new_schwein_up(schweine_cand[0], fenbuilding, uibuilding), 3000);
	} else if (isEmpty(fenbuilding.schweine)) {
		Z.stage = 29;
		ari_history_list([`${uplayer} inspects a correct building`], 'inspect');
		show_instruction('the building is CORRECT - You loose 1 rumor')
		setTimeout(ari_pre_action, 2000); //ari_pre_action();
	} else {
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		show_instruction('no additional schwein has been found - you gain 1 rumor')
		ari_history_list([`${uplayer} inspects a schweine!`], 'inspect');
		setTimeout(ari_next_action, 2000);
	}
}

