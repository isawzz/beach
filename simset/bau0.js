
function _ari_pre_action(me, table, ui) {
	let [stage, fen, pl, upl, phase, deck, market] = [table.fen.stage, table.fen, table.players[me], ui.players[me], table.fen.phase, table.fen.deck, table.fen.market];
	if (fen.numActions > 0) fen.progress = `&nbsp;&nbsp;(action ${fen.action_number} of ${fen.total_pl_actions})`; else delete fen.progress;
	let stageText = ARI.stage[stage];
	switch (stageText) {
		case 'stall_selection': {
			let { myTurn, spectating } = stdInstruction(me, table, 'select cards for your stall');
			if (!myTurn || spectating) break;
			let plUi = ui.players[me];
			let handItems = plUi.handCards.map((c, i) => ({ o: c, a: c.key, key: c.key, friendly: c.key, index: i }));
			if (nundef(DA.stallSelected)) DA.stallSelected = [];
			if (nundef(mBy('bCommit'))) {
				let handler = () => processStallSelected(me, table, ui, handItems);
				mButton('commit', handler, mBy('dInstruction'), { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
				mStyle(mBy('bCommit'), { opacity: 0 });
			}
			for (const item of handItems) {
				showItemAsSelectable(item);
				let d = item.o.div;
				d.onclick = () => {
					toggleItemSelectionState(item);
					let selected = handItems.filter(x => x.state === 'selected');
					DA.stallSelected = selected.map(x => x.key);
					mStyle('bCommit', { opacity: selected.length > 0 ? 1 : 0 });
				};
			}
			break;
		}
		case 'action: command': {
			if (nundef(DA.kingPhase)) DA.kingPhase = 'command';
			switch (DA.kingPhase) {
				case 'command': kingPhaseShowCommands(me, table, ui); break;
				case 'exchange_select_cards': kingPhaseExchangeSelectCards(me, table, ui); break;
				case 'build_select_payment': kingPhaseBuildSelectPayment(me, table, ui); break;
				case 'build_select_cards': kingPhaseBuildSelectCards(me, table, ui); break;
				case 'buy_select_card': kingPhaseBuySelectCard(me, table, ui); break;
			}
			break;
		}
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
			//console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
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

async function processStallSelected(me, table, ui, handItems) {
	let fen = table.fen;
	let pl = table.players[me];
	let selectedKeys = handItems.filter(x => x.state === 'selected').map(x => x.key);
	if (isEmpty(selectedKeys)) return;
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
async function processPass(me, table, ui) {
	let fen = table.fen;
	fen.actionsCompleted.push(me);
	ariTransitionToActionStage(table);
	await tableSaveUpdate(table);
	await updateUI();
}

function calcStallValue(table, plName) {
	let st = table.players[plName].stall;
	if (isEmpty(st)) return 0;
	let rankvals = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
	return arrSum(st.map(x => rankvals[x[0]] || 0));
}

function ariTransitionToActionStage(table) {
	let fen = table.fen;
	let minval = Infinity, minplayer = null;
	for (const uname of table.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = table.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = table.players[uname].stall_value = calcStallValue(table, uname);
		if (val < minval) { minval = val; minplayer = uname; }
	}
	if (!minplayer) {
		ariEndPhaseCleanup(table);
	} else {
		fen.stage = 5;
		table.turn = [minplayer];
		fen.numActions = fen.total_pl_actions = table.players[minplayer].stall.length;
		fen.action_number = 1;
	}
}

function ariEndPhaseCleanup(table) {
	let fen = table.fen;
	let rankstr = 'A23456789TJQK*';
	let oldPhase = fen.phase;
	// move market to discard
	for (const cardKey of fen.market) {
		fen.deckDiscard.push(cardKey);
	}
	fen.market = [];
	// take up to 4 from discard, shuffle, place open
	if (fen.deckDiscard.length > 0) {
		arrShuffle(fen.deckDiscard);
		let n = Math.min(4, fen.deckDiscard.length);
		for (let i = 0; i < n; i++) {
			fen.openDiscard.push(fen.deckDiscard.pop());
		}
	}
	// stall cards go back to player hands
	for (const plName of table.plorder) {
		let pl = table.players[plName];
		for (const cardKey of pl.stall) {
			pl.hand.push(cardKey);
		}
		pl.stall = [];
	}
	// deal 1 card from deck to each player
	for (const plName of table.plorder) {
		let pl = table.players[plName];
		let dealt = cDeckDeal(fen.deck, 1);
		pl.hand.push(...dealt);
	}
	// deal new market cards
	let n_market = fen.phase == 'jack' ? 3 : 2;
	fen.market = cDeckDeal(fen.deck, n_market);
	// advance phase: king->queen, queen->jack, jack->king
	let phaseOrder = ['king', 'queen', 'jack'];
	let idx = phaseOrder.indexOf(fen.phase);
	fen.phase = phaseOrder[(idx + 1) % phaseOrder.length];
	historyAddLines([`${fen.phase} phase begins`], 'market', fen);
	// end-of-round after jack phase
	if (oldPhase === 'jack') {
		// change herald to next player
		let heraldIdx = fen.heraldorder.indexOf(fen.herald);
		fen.herald = fen.heraldorder[(heraldIdx + 1) % fen.heraldorder.length];
		historyAddLines([`${fen.herald} is the new herald`], 'market', fen);
		// give each player 1 coin
		for (const plName of table.plorder) {
			table.players[plName].coins += 1;
		}
		historyAddLines([`each player receives 1 coin`], 'market', fen);
		// check if any player has more than 7 cards
		let playersToDiscard = table.plorder.filter(p => table.players[p].hand.length > 7);
		if (playersToDiscard.length > 0) {
			fen.playersToDiscard = playersToDiscard;
			fen.discardIdx = 0;
			fen.stage = 50;
			table.turn = [playersToDiscard[0]];
			return;
		}
	}
	// init ball state
	fen.ball = [];
	fen.ballContributions = {};
	fen.ballPlayers = [];
	// start next phase
	[fen.stage, table.turn] = setStallStage(table);
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
		[fen.stage, table.turn] = setStallStage(table);
	}
}

function hasKingInHand(pl) {
	return pl.hand.some(k => k[0] === 'K');
}

function kingPhaseShowCommands(me, table, ui) {
	let fen = table.fen;
	let pl = table.players[me];
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

function kingPhaseExchangeSelectCards(me, table, ui) {
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
	// my stall cards
	if (isdef(plUi.stallCards)) {
		for (const c of plUi.stallCards) {
			allItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'stall' });
		}
	}
	// market cards
	if (isdef(Items.marketCards)) {
		for (const c of Items.marketCards) {
			allItems.push({ o: c, a: c.key, key: c.key, friendly: c.key, source: 'market' });
		}
	}
	// other players' stall cards
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

function isValidExchangePair(selected) {
	if (selected.length !== 2) return false;
	let hasStall = selected.some(x => x.source === 'stall');
	let hasTarget = selected.some(x => x.source !== 'stall');
	return hasStall && hasTarget;
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

function kingPhaseBuildSelectPayment(me, table, ui) {
	let fen = table.fen;
	let pl = table.players[me];
	let { myTurn, spectating } = stdInstruction(me, table, `Action ${fen.action_number} of ${fen.total_pl_actions}: Select payment for building (coin or King card)`);
	if (!myTurn || spectating) return;
	let dInst = mBy('dInstruction');
	let bstyles = { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '1px solid #666', bg: '#ddd', fg: 'black', cursor: 'pointer' };
	mButton('cancel', () => { DA.kingPhase = 'command'; updateUI(); }, dInst, { ...bstyles, bg: '#fcc', maleft: 20 });
	// coin option
	if (pl.coins > 0) {
		mButton(`Pay Coin (${pl.coins} left)`, () => {
			DA.buildPayment = { type: 'coin' };
			DA.kingPhase = 'build_select_cards';
			updateUI();
		}, dInst, bstyles);
	}
	// king card option
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

async function performBuild(me, table, ui, selectedItems) {
	let fen = table.fen;
	let pl = table.players[me];
	let selectedKeys = selectedItems.map(x => x.key);
	let numCards = selectedKeys.length;
	let buildingType = numCards === 4 ? 'farm' : numCards === 5 ? 'estate' : 'chateau';
	// remove payment
	if (DA.buildPayment.type === 'coin') {
		pl.coins -= 1;
	} else {
		removeInPlace(pl.hand, DA.buildPayment.key);
	}
	// remove cards from hand/stall
	for (const ckey of selectedKeys) {
		removeInPlace(pl.hand, ckey);
		removeInPlace(pl.stall, ckey);
	}
	// create building
	let building = { list: selectedKeys, lead: selectedKeys[0], schweine: [], rumors: [], h: false, isBlackmailed: false };
	pl.buildings[buildingType].push(building);
	let vps = buildingType === 'farm' ? 1 : buildingType === 'estate' ? 2 : 3;
	pl.vps += vps;
	historyAddLines([`${me} builds a ${buildingType} (${vps} VP) with ${selectedKeys.join(', ')} paying ${DA.buildPayment.type === 'coin' ? '1 coin' : DA.buildPayment.key}`], 'king', fen);
	delete DA.buildPayment;
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
