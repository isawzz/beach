onload = start; VERBOSE = false; TESTING = false; DEV = false; POLLING = true;

function start() { test0(); }

async function test0_aristo_show_actions() {
	await loadAssetsStaticPreload();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating aristo game...');
	let table = createGameTable('aristo', ['felix', 'mimi'],
		{
			church: 'no',
			journey: 'no',
			commission: 'no',
			peasants: 'no',
			rumors: 'no'
		},
		{
			mimi: { playmode: 'human' },
			felix: { playmode: 'human' },
		});
	await tableSaveNew(table);
	console.log('aristo game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
}
async function test0_aristo() {
	await loadAssetsStaticPreload();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	// DA.menu = 'games';
	// Ensure TO.bots is initialized
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating aristo game...');
	let table = createGameTable('aristo', ['felix', 'mimi'],
		{
			use_levels: 'no',
			church: 'no',
			journey: 'no',
			commission: 'no',
			peasants: 'no',
			rumors: 'no'
		},
		{
			mimi: { playmode: 'human' },
			felix: { playmode: 'human' },
		});
	table.turn = ['mimi'];
	table.players.felix.hand = [];
	await tableSaveNew(table);
	console.log('aristo game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
}
async function test0() {
	create_card_assets_c52();
	await loadAssetsStaticPreload();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await reloadTables();
	await switchToUser(); // da wird M.users geladen!
	//DA.menu = 'games';
	await switchToMenu();
	await pollInit();
}
async function test0_suture() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	// DA.menu = 'games';
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating suture game...');
	let table = createGameTable('suture', ['amanda', 'mimi'],
		{
			radius: '3'
		},
		{
			amanda: { playmode: 'bot' },
			mimi: { playmode: 'human' },
		});
	await tableSaveNew(table);
	console.log('suture game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
	//downloadAsYaml(table, 'suture');
}
async function test01() {
	let res = await apiGetGameTables();
	let games = res.tables || [];
	conslog(games[0], true);
}
async function test0_cryptid() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	// DA.menu = 'games';
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating cryptid game...');
	let table = createGameTable('cryptid', ['amanda', 'mimi'],
		{
			radius: '3'
		},
		{
			amanda: { playmode: 'bot' },
			mimi: { playmode: 'human' },
		});
	await tableSaveNew(table);
	console.log('cryptid game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
	downloadAsYaml(table, 'cryptid');
}
async function test0_set() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	// DA.menu = 'games';
	// Ensure TO.bots is initialized
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating set game...');
	let table = createGameTable('setgame', ['amanda', 'mimi'],
		{
			use_levels: 'no'
		},
		{
			amanda: { playmode: 'bot' },
			mimi: { playmode: 'bot' },
		});
	//table.turn = ['mimi'];
	await tableSaveNew(table);
	console.log('set game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
}
async function test0_bluff() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	// DA.menu = 'games';
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating bluff game...');
	let table = createGameTable('bluff', ['amanda', 'mimi'],
		{
			max_handsize: 3
		},
		{
			amanda: { playmode: 'bot' },
			mimi: { playmode: 'bot', strategy: 'clairvoyant' },
		});
	table.turn = ['mimi'];
	await tableSaveNew(table);
	console.log('bluff game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await switchToMenu('table');
	await updateMain();
	await pollInit();
}
async function test0_reversi() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	DA.menu = 'games';
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating reversi game...');
	let table = createGameTable('reversi', ['amanda', 'mimi'],
		{
			// columns: '3', rows: '3', symbols: 'XO',
		},
		{
			amanda: { playmode: 'bot' },
			mimi: { playmode: 'bot', strategy: 'clairvoyant' },
		});
	table.turn = ['mimi'];
	await tableSaveNew(table);
	console.log('reversi game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
	await pollInit();
}
async function test0_ttt() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	DA.menu = 'games';
	await reloadTables();
	await switchToUser('mimi');

	console.log('creating ttt game...');
	let table = createGameTable('ttt', ['amanda', 'mimi'], {
		columns: '3', rows: '3', symbols: 'XO',
	}, {
		amanda: { playmode: 'bot' },
		mimi: { playmode: 'bot', strategy: 'clairvoyant' },
	});
	table.turn = ['mimi'];
	await tableSaveNew(table);
	console.log('ttt game created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
	await pollInit();
}
async function test0_clickgame() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	DA.menu = 'games';
	await reloadTables();
	await switchToUser('amanda');

	console.log('creating clickgame...');
	let table = createGameTable('clickgame', ['amanda', 'mimi'], {
		target: '5',
	}, {
		amanda: { playmode: 'bot' },
		mimi: { playmode: 'bot' },
	});
	table.turn = ['amanda'];
	await tableSaveNew(table);
	console.log('clickgame created!');
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
	await pollInit();
}
async function prelim() {
	await loadAssetsStaticPreload();
}
async function postlim(uname) {
	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await reloadTables();

	await switchToUser(uname); // da wird M.users geladen!
	await pollInit();
}

// === aristo tests merged from simset2/start.js ===
async function test0_aristoStage1() {
	await prelim();
	initUI();
	await postlim();
}
async function test01_aristoStage1() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await pollInit();
	DA.menu = 'games';
	await switchToUser('mimi');

	let table = createGameTable('aristo', ['amanda', 'mimi'],
		{ church: 'no', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no', winning_score: 5, adaptive: 'yes', num_symbols: '10', num_cards: '2' },
		{
			amanda: { playmode: 'human', hint: 2 },
			mimi: { playmode: 'human', hint: 2 },
		});

	let fen = table.fen;
	for (const plName of table.plorder) {
		let pl = fen.players[plName];
		let numStall = 3 + Math.floor(Math.random() * 3);
		numStall = Math.min(numStall, pl.hand.length);
		for (let i = 0; i < numStall; i++) {
			let card = pl.hand.shift();
			pl.stall.push(card);
		}
	}

	fen.actionsCompleted = [];
	let minval = Infinity, minplayer = null;
	for (const uname of table.plorder) {
		let pl = fen.players[uname];
		if (isEmpty(pl.stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = pl.stall_value = calc_stall_value(fen, uname);
		if (val < minval) { minval = val; minplayer = uname; }
	}

	fen.stage = 5;
	table.turn = [minplayer];
	fen.numActions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;

	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
}
async function test02_queenBall() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await pollInit();
	DA.menu = 'games';
	await switchToUser('mimi');

	let table = createGameTable('aristo', ['amanda', 'mimi'],
		{ church: 'no', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no', winning_score: 5, adaptive: 'yes', num_symbols: '10', num_cards: '2' },
		{
			amanda: { playmode: 'human', hint: 2 },
			mimi: { playmode: 'human', hint: 2 },
		});

	let fen = table.fen;
	fen.phase = 'queen';
	fen.stage = 11;
	fen.ball = [];
	fen.ballContributions = {};
	fen.ballPlayers = [];
	fen.actionsCompleted = [];
	fen.market = fen.market.length > 0 ? fen.market : [];
	table.turn = [table.plorder[0]];

	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
}
