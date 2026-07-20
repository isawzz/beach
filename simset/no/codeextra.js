
// #region === GAMES ===
function badger() {
	function setup(table) {
		stdSetupGame(table);
		let fen = table.fen;
		fen.listType = M.byType.emo;
		fen.listYes = fen.listType.filter(x => M.byCat.animal.includes(x));
		fen.listNo = fen.listType.filter(x => ['transport', 'sport', 'building', 'clothing'].some(y => M.superdi[x].cats.includes(y)));
		fen.numCards = 12;
		fen.qTypes = ['unique', 'oddman', 'frequent', 'alpha'];
		renewSet(fen);
	}
	function renewSet(fen) {
		let { key, list, oddman, inst } = pickRandomSet(fen.listYes, fen.listNo, fen.numCards, fen.qTypes);
		fen.instruction = inst;
		fen.list = list;
		fen.bgs = list.map(x => rColor());
		fen.oddman = oddman;
		fen.key = key;
	}
	async function process(uname, table, key) {
		let newTable = gtCopy(table);
		let success = key == newTable.fen.oddman;
		if (success) {
			newTable.players[uname].score += 1;
			renewSet(newTable.fen);
		} else {
			newTable.players[uname].score -= 1;
		}
		newTable.action = { plName: uname, step: newTable.step, action: { success }, success };
		let res = await tableSaveUpdateFS(newTable);
		return true;
	}
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 500, 'wood');
		showTitleGame(me, table);
		stdStatsScore(me, table);
		let fen = table.fen;
		let key = fen.key;
		let fg = key == 'unique' ? 'yellow' : key == 'oddman' ? 'lime' : key == 'frequent' ? 'red' : 'lightblue';
		let st = { matop: 10, fz: 40, fg, family: 'blackops', align: 'center', w: 200 }; //,weight:'bold'};
		let dKey = mDom(dTable, st, { html: key + '!' }); //(key.length > 7 ? '' : '!') });
		mLinebreak(dTable, 10);
		let dParent = mDom(dTable, { w: 500, h: 400 }); //, bg:'green' });
		let items = mFit(fen.list, dParent);
		for (let i = 0; i < items.length; i++) {
			let bg = fen.bgs[i];
			let fg = colorIdealText(bg);
			mStyle(items[i].div, { bg, fg });
		}
		let correctItem = items.find(x => x.key == fen.oddman);
		return { dTable, items, correctItem, refresh: true };
	}
	async function activate(me, table, ui) {
		let { myTurn, spectating } = stdInstruction(me, table);
		if (spectating) return;
		for (const item of ui.items) {
			let d = item.div;
			d.setAttribute('key', item.key);
			mStyle(d, { cursor: 'pointer' });
			ignoreDoubleClick(d, () => rsgEval(me, me, table, ui, item));
		}
		stdBotMoves(bot => rsgEval(bot, me, table, ui, ui.correctItem), table);
	}
	async function rsgEval(uname, me, table, ui, item) {
		stdEvalShield();
		if (uname == me) {
			toggleItemSelection({ div: iDiv(item) });
		}
		let moveSent = await process(uname, table, item.key);
		if (moveSent) await updateMain(true);
		DA.isProcessingMove = false;
	}
	return { setup, present, activate, process }
}
function bgImageFromPath(path) { return isdef(path) ? `url('${path}')` : null; }
function bid_to_string(bid) { return bid.join(' '); }
async function blogSaveAll() {
	function replaceDivs(str) {
		return str.replaceAll('<div>', '<br>').replaceAll('</div>', '');
	}
	let blog = DA.blogs;
	let list = dict2list(blog);
	for (const bl of list) {
		let d = bl.dParts;
		let chi = arrChildren(d);
		let parts = [];
		let prevType = null;
		let prevText = null;
		for (const ch of chi) {
			let type = ch.getAttribute('type'); 
			if (type == 'text') {
				let txt = ch.innerHTML;
				txt = replaceDivs(txt);
				if (isdef(prevText)) txt = prevText + '<br>' + txt;
				prevType = 'text';
				prevText = txt;
			} else {
				if (isdef(prevText)) { parts.push(prevText); prevText = null; }
				prevType = type;
				if (type == 'image') {
					parts.push(ch.src);
				} else if (!type) {
					console.log('need to save image data', ch)
					saveBase64Image(ch, 'img1.jpg');
				}
			}
		}
		bl.parts = parts;
	}
	let di = {};
	for (const el of list) {
		di[el.key] = { title: el.o.title, text: el.parts };
	}
	let text = jsyaml.dump(di);
	let res = await mPhpPostFile(text, 'zdata/blog1.yaml');
	return res;
}
function blogShow(d, key, o) {
	let dBlog = mDom(d, { fz: 20, className: 'collapsible' }, { key });
	mDom(dBlog, { className: 'title' }, { html: `${key}: ${o.title}` });
	let dParts = mDom(dBlog, { className: 'sortable' });
	let blogItem = { o, key, div: dBlog, dParts, items: [] }
	for (let textPart of o.text) {
		let d2, type;
		if (textPart.includes('blogimages/')) {
			type = 'image'
			d2 = mDom(dParts, { w100: true }, { tag: 'img', src: textPart, type });
		} else {
			type = 'text'
			d2 = mDom(dParts, { caret: 'white', padding: 2, outline: '' }, { html: textPart, contenteditable: true, type });
		}
		let item = { key, text: textPart, div: d2, type };
		blogItem.items.push(item);
	}
	mDom(dParts, { patop: 5, pabottom: 2 }, { html: '<hr>', type: 'line' });
	return blogItem;
}
function blogShowAll(d, blog) {
	let dates = Object.keys(blog);
	dates.sort((a, b) => new Date(b) - new Date(a));
	let di = {};
	for (const date of dates) {
		di[date] = blogShow(d, date, blog[date]);
	}
	return di;
}
function bluff() {
	const rankstr = '3456789TJQKA2';
	const suitstr = 'CDSH';
	function setup(table) {
		let fen = table.fen = {};
		let options = table.options;
		let plNames = Object.keys(table.players);
		let num_cards_needed = plNames.length * table.options.max_handsize;
		let num_decks_needed = fen.num_decks = Math.ceil(num_cards_needed / 52);
		let deck = fen.deck = c52Decks(num_decks_needed);
		arrShuffle(deck);
		let handsize = options.min_handsize;
		for (const name in table.players) {
			let pl = table.players[name];
			pl.hand = cDeckDeal(deck, handsize);
			pl.handsize = handsize;
		}
		table.plorder = jsCopy(plNames);
		arrShuffle(table.plorder);
		table.turn = [table.plorder[0]];
		fen.movetype = 'turn';
		fen.stage = 0;
	}
	async function process(me, table, movetype) {
		if (movetype == 'bid') {
			return await processBid(me, table);
		} else if (movetype == 'gehtHoch') {
			return await processGehtHoch(me, table);
		} else {
			return false;
		}
	}
	async function processStage1(table) {
		let newTable = gtCopy(table);
		newTable.fen.stage = 0;
		for (const plName in newTable.players) {
			delete newTable.players[plName].lastbid;
		}
		delete newTable.fen.lastbid;
		delete newTable.fen.lastbidder;
		delete newTable.fen.war_drin;
		delete newTable.fen.oldbid;
		delete newTable.fen.newbid;
		delete newTable.fen.aufheber;
		delete newTable.fen.loser;
		delete newTable.fen.bidder;
		await tableSaveUpdate(newTable);
		return true;
	}
	async function processBid(me, table) {
		let newTable = gtCopy(table);
		let fen = newTable.fen;
		let players = newTable.players;
		let oldbid = jsCopy(fen.oldbid);
		let bid = jsCopy(fen.newbid);
		bid = normalize_bid(bid);
		let higher = is_bid_higher_than(bid, oldbid);
		if (bid[2] == 0) bid[2] = '_';
		if (!higher) {
			return false;
		} else {
			fen.lastbid = players[me].lastbid = bid;
			fen.lastbidder = me;
			delete fen.oldbid; delete fen.newbid;
			newTable.turn = [arrNext(newTable.plorder, me)];
			await tableSaveUpdate(newTable);
			return true;
		}
	}
	async function processGehtHoch(me, table) {
		let newTable = gtCopy(table);
		let fen = newTable.fen;
		let players = newTable.players;
		table = newTable;
		let [bid, bidder] = [fen.lastbid, fen.lastbidder];
		let diff = calc_bid_minus_cards(table, bid);
		let aufheber = me;
		let loser = diff > 0 ? bidder : aufheber;
		let war_drin = fen.war_drin = diff <= 0;
		let pl = table.players[loser];
		let loser_handsize = pl.handsize = Number(pl.handsize) + 1;
		let deck = fen.deck = c52Decks(fen.num_decks_needed); arrShuffle(fen.deck);
		for (const name in table.players) {
			let pl = table.players[name];
			pl.hand = cDeckDeal(deck, pl.handsize);
		}
		fen.stage = 1;
		let nextplayer;
		if (loser_handsize > table.options.max_handsize) {
			nextplayer = arrNext(table.plorder, loser)
			table.plorder = remove_player(table, loser);
			if (table.plorder.length < 2) {
				fen.winners = table.plorder;
				nextplayer = null;
				table.status = 'over';
			}
		} else {
			nextplayer = loser;
		}
		fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;
		table.turn = table.status == 'over' ? [] : [nextplayer];
		delete fen.lastbid; delete fen.lastbidder; delete fen.war_drin;
		delete fen.oldbid; delete fen.newbid;
		await tableSaveUpdate(newTable);
		return true;
	}
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(me, table);
		let fen = table.fen;
		let stage = fen.stage;
		let ui = { dTable };
		let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white'];
		statsInit(me, table, { sz, bg, fg, cimgborder });
		for (const plName in table.players) {
			let pl = table.players[plName];
			let d = mBy('dStat_' + plName);
			mStyle(d, { padding: 10 })
			let max = pl.handsize == table.options.max_handsize;
			let fg1 = fg == 'white' ? 'yellow' : 'red';
			let dhz = mDom(d, { fg: max ? fg1 : fg }, { html: `hand: ${pl.handsize}` });
			mLinebreak(d);
			let html = plName == fen.aufheber ? `<b>X</b>` : valf(pl.lastbid, ['_']).join(' ');
			let elem = mDom(d, { fg: fg1 }, { html });
			let szhand = getSizeNeeded(dhz);
			let sz = getSizeNeeded(elem);
			let w = Math.max(szhand.w + 20, sz.w + 20, 80);
			mLinebreak(d);
		}
		let dt = mDom('dTable', { pabottom: 20, w100: true, h100: true });
		let pl = me in table.players ? table.players[me] : table.players[table.turn[0]];
		mLinebreak(dt, 10);
		mText(stage == 1 ? "all players' cards: " : `${capitalize(pl.name)}'s hand: `, dt);
		mLinebreak(dt, 8);
		let cards = stage == 1 ? fen.akku : pl.hand;
		cards = cSort(cards, null, '23456789TJQKA');
		ui.cards = cards.map(x => uiTypeCard52(x, 150));
		cSplay(ui.cards, dt, 'right');
		if (stage == 1) {
			let message = `${fen.bidder}'s bid was ${fen.loser == fen.aufheber ? 'correct' : 'not correct'} - ${fen.loser} loses!!!`; // fen.aufheben + ' did not belive'
			mDom(dt, { fz: 20, maright: 20, matop: 20 }, { html: message });
			if (nundef(table.players[fen.loser])) {
				mDom(dt, { fz: 18, maright: 20, matop: 10 }, { html: `${fen.loser} is eliminated!!!` });
			}
			mLinebreak(dt, 20);
		}
		return ui;
	}
	async function activate(me, table, ui) {
		let fen = table.fen;
		let stage = fen.stage;
		let dt = ui.dTable;
		let myturn = table.turn.includes(me);
		let botturn = table.players[table.turn[0]].playmode == 'bot';
		if (stage == 1) {
			if (botturn) {
				await mSleep(8000);
				await processStage1(table);
				return;
			}
			mDom(dt, {}, { html: 'Next Round', tag: 'button', onclick: async () => await processStage1(table) });
			return;
		}
		if (myturn) {
			if (isdef(fen.lastbid)) {
				let dc1 = mDom(dt, { w: 480, alignItems: 'center' });
				makeGridColumns(dc1, '120px 1fr 120px');
				mDom(dc1, { align: 'right', maright: 10 }, { html: '<b>Current bid:</b>' });
				mDom(dc1, { bg: '#ffffffA0', fg: 'red', padding: 4 }, { className: 'selectbutton', html: bid_to_string(fen.lastbid) });
				ui.bGehtHoch = mButton('geht hoch!', async () => await gehtHoch(me, table, ui), dc1, {}, ['selectbutton', 'enabled']);
				mLinebreak(dt, 10);
			} else {
				mDom(dt, { fz: 18 }, { html: 'You are the first to bid!' });
				mLinebreak(dt, 10);
			}
			let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
			fen.newbid = jsCopy(bid);
			let dc = ui.dPanelContainer = mDom(dt, { w: 480 });
			makeGridColumns(dc, '120px 1fr 120px');
			mDom(dc, { align: 'right', maright: 10 }, { html: '<b>Your bid:</b>' });
			ui.panel = mDom(dc, { bg: 'white' }, { className: 'selectbutton' });
			ui.panelItems = [];
			bid.forEach((b, i) => {
				let dw = mDom(ui.panel, { pah: 4, display: 'inline', fz: 18, weight: 'bold', fg: 'red' }, { id: `dbid_${i}`, html: b });
				dw.onclick = () => selectText(dw);
				ui.panelItems.push({ div: dw, index: i, initial: b, state: 'unselected' })
			});
			ui.bBid = mButton('BID', async () => await bluffBid(me, table, ui), dc, {}, ['selectbutton', 'enabled']);
			mLinebreak(dt, 20);
			let sz = 50;
			let n = bid[0] == '_' ? 1 : Number(bid[0]);
			let arrs = [arrRange(n, n + 5), toLetters('3456789TJQKA'), arrRange(0, 5), toLetters('3456789TJQKA')];
			let dTasten = ui.dTasten = mDiv(dt, { gap: 8 });
			let divs = [d1, d2, d3, d4] = mColFlex(dTasten, [1, 2, 1, 2]);
			for (let i = 0; i < 4; i++) {
				let d = divs[i];
				mStyle(d, { bg: i % 2 == 0 ? '#dda15e' : '#bb9457', padding: 6, rounding: 8 });
				ui[`dn${i + 1}`] = create_bluff_input1(me, table, ui, d, arrs[i], i % 2 ? 2 : 1, sz, i);
				d.onmouseenter = () => iHigh(ui.panelItems[i]); d.onmouseleave = () => iUnhigh(ui.panelItems[i]);
			}
		}
		let { ralist, wildcards } = createRankList([table.turn], table);
		ralist = ralist.filter(x => x.value >= 1);
		let lastbid = fen.lastbid;
		let bids = []
		if (nundef(lastbid)) {
			let b = createRealisticRandomStartingBid(table, ralist, wildcards);
			let p = calculateBidProbability(ralist, wildcards, b);
			if (TESTING) {
			}
			if (p < .2 && b[0] > 2) b[0] -= 2;
			else if (p < .5 && b[0] > 1) b[0]--;
			if (TESTING) {
				p = calculateBidProbability(ralist, wildcards, b);
			}
			b = normalize_bid(b);
			bids.push(b);
			console.log('realistic starting bid', b)
			let lb = normalize_bid(lowestPossibleBid(ralist));
			console.log('lowest possible bid', lb)
			bids.push(lb);
		} else {
			let b = generateComplexHigherBid(ralist, wildcards, lastbid);
			let bAlt = nextHigherBid(ralist, lastbid); bAlt = normalize_bid(bAlt);
			if (TESTING) {
				p = calculateBidProbability(ralist, wildcards, b);
			}
			let lastBitCorrect = calc_bid_minus_cards(table, lastbid) <= 0;
			let bCorrect = calc_bid_minus_cards(table, b) <= 0;
			let bAltCorrect = calc_bid_minus_cards(table, bAlt) <= 0;
			b = normalize_bid(b);
			bAlt = normalize_bid(bAlt);
			console.log('b', b)
			console.log('bAlt', bAlt)
			if (lastBitCorrect && bCorrect) {
				bids.push(b);
			} else if (!lastBitCorrect && !bCorrect) {
				bids.push(bAlt); bids.push('gehtHoch');
			} else { bids.push(bAlt); bids.push(b); bids.push('gehtHoch');console.log('3') }
		}
		if (TESTING && myturn) {
			mLinebreak(ui.dTable, 10)
			let db2 = mDom(ui.dTable);
			for (const k in bids) {
				let bid = bids[k];
				let bBid = mDom(db2, { margin: 10 }, {
					tag: 'button', html: isList(bid) ? bid_to_string(bid) : bid,
					onclick: async () => {
						if (isList(bid)) {
							table.fen.newbid = bid;
							TO.hallo = await bluffBid(me, table, ui)
						} else if (bid == 'gehtHoch') {
							await gehtHoch(me, table, ui);
						}
					}
				});
			}
		}
		if (botturn) {
			TO.botsleep = await mSleep(3000);
			let bot = table.turn[0];
			let b = rChoose(bids);
			if (b == 'gehtHoch') {
				await processGehtHoch(bot, table);
			} else {
				table.fen.oldbid = valf(lastbid, ['_', '_', '_', '_']);
				table.fen.newbid = b;
				let moveSent = await processBid(bot, table);
			}
			await updateMain(true);
			DA.isProcessingMove = false;
		}
	}
	async function bluffBid(me, table, ui) {
		stdEvalShield();
		let moveSent = await processBid(me, table);
		if (moveSent) { await updateMain(true); }
		else {
			mShieldOff();
			showMessage('the bid you entered is not high enough!');
		}
		DA.isProcessingMove = false;
	}
	async function gehtHoch(me, table, ui) {
		stdEvalShield();
		await processGehtHoch(me, table);
		await updateMain(true);
		DA.isProcessingMove = false;
	}
	function lowestPossibleBid(ralist) {
		const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
		const rankOrder = '3456789TJQKA';
		/* Sort the entire ralist by its rankOrder index ascending to find the absolute lowest rank structural element */
		let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
		let lowestRankItem = sortedRalist[0];
		/* Return exactly 1 of that lowest rank with an empty secondary component */
		return [
			1,
			toword[lowestRankItem.rank] || '_',
			'_',
			'_'
		];
	}
	function nextHigherBid(ralist, bid) {
		const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
		const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
		const rankOrder = '3456789TJQKA';
		/* 1. Extract structural ranks available in the current game setup */
		let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
		let availableRanks = sortedRalist.map(x => x.rank);
		/* 2. Parse the incoming bid */
		let oldCount1 = Number(bid[0]) || 0;
		let oldRank1 = torank[bid[1]] || '_';
		let oldCount2 = bid[2] === '_' ? 0 : (Number(bid[2]) || 0);
		let oldRank2 = torank[bid[3]] || '_';
		let oldVolume = oldCount1 + oldCount2;
		/* 3. Systematically generate ALL structural bids up to an expanded volume tier */
		let allPossibleBids = [];
		for (let totalVolume = 1; totalVolume <= 30; totalVolume++) {
			let tierBids = [];
			availableRanks.forEach(r1 => {
				tierBids.push({
					bid: [totalVolume, toword[r1], '_', '_'],
					volume: totalVolume,
					isSplit: false,
					rankIdx1: rankOrder.indexOf(r1),
					rankIdx2: -1
				});
			});
			availableRanks.forEach(r1 => {
				availableRanks.forEach(r2 => {
					if (r1 === r2) return;
					for (let c1 = 1; c1 < totalVolume; c1++) {
						let c2 = totalVolume - c1;
						tierBids.push({
							bid: [c1, toword[r1], c2, toword[r2]],
							volume: totalVolume,
							isSplit: true,
							rankIdx1: rankOrder.indexOf(r1),
							rankIdx2: rankOrder.indexOf(r2)
						});
					}
				});
			});
			/* Sort this specific volume tier by your precise progression rules */
			tierBids.sort((a, b) => {
				if (a.isSplit !== b.isSplit) return a.isSplit ? 1 : -1;
				if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1;
				return a.rankIdx2 - b.rankIdx2;
			});
			allPossibleBids.push(...tierBids);
		}
		/* 4. Find the current bid index inside our ordered master list */
		let currentMatchIdx = allPossibleBids.findIndex(item => {
			let b = item.bid;
			return Number(b[0]) === oldCount1 &&
				torank[b[1]] === oldRank1 &&
				(b[2] === '_' ? 0 : Number(b[2])) === oldCount2 &&
				torank[b[3]] === oldRank2;
		});
		/* 5. Return the immediate next structural higher layout sequence step */
		if (currentMatchIdx !== -1 && currentMatchIdx + 1 < allPossibleBids.length) {
			return allPossibleBids[currentMatchIdx + 1].bid;
		}
		/* Fallback: If current bid is outside or exceeds generation matrix, increment volume */
		let fallbackRank = availableRanks[0] || '3';
		return [
			oldVolume + 1,
			toword[fallbackRank],
			'_',
			'_'
		];
	}
	function calculateBidProbability(ralist, wildcards, bid) {
		const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
		/* 1. Calculate total cards currently in play */
		/* Sum up the total values of all ranks + the wildcards */
		let totalCardsInPlay = ralist.reduce((sum, item) => sum + (Number(item.value) || 0), 0) + Number(wildcards);
		if (totalCardsInPlay === 0) return 0;
		const TOTAL_DECK_SIZE = 52;
		const WILDCARDS_IN_DECK = 4;
		const NATURALS_PER_RANK = 4;
		/* Parse the bid counts and ranks */
		let reqCount1 = Number(bid[0]) || 0;
		let rank1 = torank[bid[1]];
		let reqCount2 = bid[2] === '_' ? 0 : (Number(bid[2]) || 0);
		let rank2 = torank[bid[3]];
		/* Helper: Combinations formula nCr (n choose r) */
		function nCr(n, r) {
			if (r < 0 || r > n) return 0;
			if (r === 0 || r === n) return 1;
			let res = 1;
			for (let i = 1; i <= r; i++) {
				res = res * (n - r + i) / i;
			}
			return Math.round(res);
		}
		/* Helper: Hypergeometric probability */
		/* Probability of getting exactly 'k' successes in a sample of 'n' from a deck of 'N' with 'K' total successes available */
		function hypergeometric(k, n, K, N) {
			return (nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n);
		}
		/* --- CASE 1: Single Rank Bid [Count1, Rank1, '_', '_'] --- */
		if (reqCount2 === 0 || rank2 === '_') {
			let matchingCardsInDeck = NATURALS_PER_RANK + WILDCARDS_IN_DECK;
			let probabilityOfAtLeastReq = 0;
			/* Sum probabilities of getting at least reqCount1 matching cards */
			for (let k = reqCount1; k <= Math.min(matchingCardsInDeck, totalCardsInPlay); k++) {
				probabilityOfAtLeastReq += hypergeometric(k, totalCardsInPlay, matchingCardsInDeck, TOTAL_DECK_SIZE);
			}
			return Math.min(1, Math.max(0, probabilityOfAtLeastReq));
		}
		/* --- CASE 2: Split Rank Bid [Count1, Rank1, Count2, Rank2] --- */
		let totalMatchingBidCards = 0;
		/* If the two ranks are distinct, they pool their natural cards together with the wildcards */
		if (rank1 !== rank2) {
			totalMatchingBidCards = NATURALS_PER_RANK + NATURALS_PER_RANK + WILDCARDS_IN_DECK;
		} else {
			totalMatchingBidCards = NATURALS_PER_RANK + WILDCARDS_IN_DECK;
		}
		let totalRequiredCards = reqCount1 + reqCount2;
		let probabilityOfSplit = 0;
		/* Sum probabilities of hitting the total target combined card count */
		for (let k = totalRequiredCards; k <= Math.min(totalMatchingBidCards, totalCardsInPlay); k++) {
			probabilityOfSplit += hypergeometric(k, totalCardsInPlay, totalMatchingBidCards, TOTAL_DECK_SIZE);
		}
		return Math.min(1, Math.max(0, probabilityOfSplit));
	}
	function createRankList(plName, table) {
		let pl = table.players[plName];
		let all_hand_cards = [];
		for (const name in table.players) {
			all_hand_cards = all_hand_cards.concat(table.players[name].hand);
		}
		let getCardRank = (card) => {
			let r = card.length === 3 ? card.substring(0, 2) : card[0];
			return r === '10' ? 'T' : r;
		};
		let wildcards = all_hand_cards.filter(c => getCardRank(c) === '2').length;
		let globalRanks = {};
		all_hand_cards.forEach(card => {
			let r = getCardRank(card);
			if (r !== '2') { globalRanks[r] = (globalRanks[r] || 0) + 1; }
		});
		const rankOrder = '3456789TJQKA';
		let myRanks = pl.hand.map(c => getCardRank(c));
		let ralist = rankOrder.split('').map(r => {
			let globalNaturalCount = globalRanks[r] || 0;
			let isMine = myRanks.includes(r);
			let irank = rankOrder.indexOf(r);
			return {
				rank: r,
				value: globalNaturalCount,
				mine: isMine,
				irank: irank,
				i: irank + 100 * (globalNaturalCount + wildcards)
			};
		});
		ralist.sort((a, b) => b.i - a.i);
		return { ralist, wildcards };
	}
	function createRealisticRandomStartingBid(table, ralist, wildcards) {
		const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
		const rankOrder = '3456789TJQKA';
		/* 1. Calculate how many total wildcards are floating around */
		let sampleItem = ralist[0];
		let itemI = Number(sampleItem.i) || 0;
		let itemIrank = Number(sampleItem.irank) || 0;
		let itemValue = Number(sampleItem.value) || 0;
		/* 2. Determine a realistic quantity anchor */
		let num = wildcards + itemValue;
		let plausible = table.plorder.length / 3;
		if (itemValue > plausible) {
			num -= Math.ceil(Math.random() * plausible);
		}
		/* 3. 40% of the time pick a random rank entirely independent of what players actually hold */
		let rank = toword[ralist[0].rank];
		if (coin(40)) {
			let randomIdx = Math.floor(Math.random() * rankOrder.length);
			rank = toword[rankOrder[randomIdx]];
			num--;
		}
		/* FIXED: Enforce that the primary count is ALWAYS at least 1 */
		if (num < 1) num = 1;
		/* 4. Construct a standard valid single-rank starting bid layout */
		/* (If a secondary count is ever added here later, ensure it uses Math.max(1, count2)) */
		return [
			num,
			rank,
			'_',
			'_'
		];
	}
	function generateComplexHigherBid(ralist, wildcards, currentBid) {
		const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
		const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
		const rankOrder = '3456789TJQKA';
		/* --- PART 1: PARSE CURRENT BID --- */
		let count1 = currentBid[0] === '_' ? 0 : Number(currentBid[0]);
		let rankWord1 = currentBid[1];
		let count2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
		let rankWord2 = currentBid[3];
		let symbol1 = torank[rankWord1] || '_';
		let symbol2 = torank[rankWord2] || '_';
		/* --- PART 2: ANALYZE ASSETS --- */
		let activeRanks = ralist.filter(x => x.value >= 1);
		activeRanks.sort((a, b) => b.value - a.value);
		let bestRankItem = activeRanks[0] || ralist[0];
		let secondBestRankItem = activeRanks[1] || ralist[1] || bestRankItem;
		/* Helper to step up a rank while avoiding a collision with a restricted rank */
		function getNextUniqueRankSymbol(currentSym, restrictedSym) {
			if (currentSym === '_') return rankOrder[0] === restrictedSym ? rankOrder[1] : rankOrder[0];
			let idx = rankOrder.indexOf(currentSym);
			if (idx === -1 || idx === rankOrder.length - 1) return null;
			let nextSym = rankOrder[idx + 1];
			if (nextSym === restrictedSym) {
				if (idx + 2 < rankOrder.length) {
					return rankOrder[idx + 2];
				}
				return null;
			}
			return nextSym;
		}
		function isValidHigher(testBidArr) {
			try {
				if (typeof is_bid_higher_than === 'function') {
					return is_bid_higher_than(
						[Number(testBidArr[0]) || 0, torank[testBidArr[1]], testBidArr[2] === '_' ? 0 : Number(testBidArr[2]), torank[testBidArr[3]]],
						[count1, symbol1, count2, symbol2]
					);
				}
			} catch (e) { }
			return false;
		}
		/* --- CRITICAL CHECK: ENFORCE OPTION A BEFORE FAILING --- */
		if (count2 === 0 || rankWord2 === '_') {
			let targetSecRank = secondBestRankItem.rank === symbol1
				? ralist.find(x => x.rank !== symbol1)?.rank || symbol1 == 'A' ? 'K' : 'A'
				: secondBestRankItem.rank;
			let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;
			let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];
			if (isValidHigher(optionABid)) {
				return optionABid;
			}
		}
		/* --- PART 3: STANDARD STRATEGY POOL --- */
		let strategyPool = [];
		strategyPool.push(() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);
		if (count2 > 0 && rankWord2 !== '_') {
			strategyPool.push(() => [count2, rankWord2, count1, rankWord1]);
		}
		let upSymbol1 = getNextUniqueRankSymbol(symbol1, symbol2);
		if (upSymbol1) {
			strategyPool.push(() => [count1, toword[upSymbol1], currentBid[2], rankWord2]);
		}
		if (count2 > 0 && rankWord2 !== '_') {
			let upSymbol2 = getNextUniqueRankSymbol(symbol2, symbol1);
			if (upSymbol2) {
				strategyPool.push(() => [count1, rankWord1, count2, toword[upSymbol2]]);
			}
		}
		/* Select and execute a random strategy */
		let primaryMutator = strategyPool[Math.floor(Math.random() * strategyPool.length)] || (() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);
		let mutatedBid = primaryMutator();
		/* Optional combo layering (30% chance) */
		/* --- PART 4: FINAL VALIDATION & EMERGENCY CEILING --- */
		if (isValidHigher(mutatedBid)) {
			return mutatedBid;
		}
		/* Fallback check Option A */
		if (count2 === 0 || rankWord2 === '_') {
			let targetSecRank = secondBestRankItem.rank === symbol1 ? ralist.find(x => x.rank !== symbol1)?.rank || 'A' : secondBestRankItem.rank;
			let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;
			let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];
			if (isValidHigher(optionABid)) {
				return optionABid;
			}
		}
		/* Ultimate fallback: Increment total volume cleanly using your best unique assets */
		let fallbackSecRank = secondBestRankItem.rank === bestRankItem.rank
			? ralist.find(x => x.rank !== bestRankItem.rank)?.rank || 'A'
			: secondBestRankItem.rank;
		return [
			count1 + 1,
			toword[bestRankItem.rank],
			count2 > 0 ? count2 : 1,
			toword[fallbackSecRank]
		];
	}
	function getRandomHigherRank(currentRankWord) {
		const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
		const torank = { three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
		const rankOrder = '3456789TJQKA';
		let currentRankSymbol = torank[currentRankWord];
		let currentIndex = rankOrder.indexOf(currentRankSymbol);
		if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
			return null;
		}
		let higherSymbols = rankOrder.slice(currentIndex + 1).split('');
		let randomSymbol = higherSymbols[Math.floor(Math.random() * higherSymbols.length)];
		return toword[randomSymbol];
	}
	function switchBidRanksIfHigher(bid) {
		const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
		const rankOrder = '3456789TJQKA';
		/* Extract the rank string components from the array */
		let rankWord1 = bid[1];
		let rankWord2 = bid[3];
		/* If there is no secondary rank (it's a single rank bid), return the bid as-is */
		if (rankWord2 === '_') {
			return [...bid];
		}
		/* Translate the words into symbol indices to verify mechanical priority rules */
		let idx1 = rankOrder.indexOf(torank[rankWord1]);
		let idx2 = rankOrder.indexOf(torank[rankWord2]);
		/* Swap the values if the second rank sits higher in the rank order hierarchy */
		if (idx2 > idx1) {
			return [
				bid[2],     /* Second count becomes the new primary count */
				rankWord2,  /* Second rank word becomes the new primary rank word */
				bid[0],     /* First count becomes the new secondary count */
				rankWord1   /* First rank word becomes the new secondary rank word */
			];
		}
		/* Return a clean clone of the input configuration if no modifications are triggered */
		return [...bid];
	}
	return { setup, present, activate, process };
}
function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }
function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }

// #endregion

function buyProgressCard(ev) {
	let o = evToAttrElem(ev, 'key');
	console.log('player buys', o.val);
	o.elem.remove();
	let spot = M.selectedCivSpot
	if (isdef(spot)) {
		spot.innerHTML = '';
		let [w, h] = [mGetStyle(spot, 'w'), mGetStyle(spot, 'h')];
		mAppend(spot, o.elem);
		mStyle(o.elem, { h: h, w: w });
		o.elem.onclick = () => selectCivSpot(spot)
		mClassRemove(M.selectedCivSpot, 'shadow');
		M.selectedCivSpot = null;
	}
}
