onload = start;
function start() { test0_initial(); }
async function test0_initial() {
	let dPage = mBy('dPage');
	let game = ttt();
	let results = [];
	function check(name, cond) {
		// Collects one self-test outcome for the visible report below.
		results.push([name, !!cond]);
		console.assert(cond, name);
	}
	let s = game.setup(['mimi', 'felix'], { rows: 3, cols: 3 });
	check('setup builds 3x3 empty board', s.rows === 3 && s.board.flat().every(x => x === null));
	check('setup assigns symbols X/O', Object.values(s.players).map(p => p.symbol).join('') === 'XO' || Object.values(s.players).map(p => p.symbol).join('') === 'OX');
	let bad = game.process(s, { player: 'nobody', r: 0, c: 0 });
	check('rejects move by unknown player', bad === null);
	let busy = game.process(game.process(s, { player: s.turn[0], r: 0, c: 0 }), { player: s.turn[0], r: 0, c: 0 });
	check('rejects move on occupied cell', busy === null);
	let g = game.setup(['a', 'b'], { rows: 3, cols: 3, bots: [] });
	g.plorder = ['a', 'b']; g.turn = ['a'];
	g = game.process(g, { player: 'a', r: 0, c: 0 });
	g = game.process(g, { player: 'b', r: 1, c: 0 });
	g = game.process(g, { player: 'a', r: 0, c: 1 });
	g = game.process(g, { player: 'b', r: 1, c: 1 });
	g = game.process(g, { player: 'a', r: 0, c: 2 });
	check('detects row win', g && g.status === 'over' && g.winners[0] === 'a' && g.winLine.length === 3);
	let d = game.setup(['a', 'b'], { rows: 3, cols: 3, bots: [] });
	d.plorder = ['a', 'b']; d.turn = ['a'];
	let seq = [[0, 0], [0, 1], [0, 2], [1, 1], [1, 0], [1, 2], [2, 1], [2, 0], [2, 2]];
	for (const [r, c] of seq) d = game.process(d, { player: d.turn[0], r, c });
	check('detects draw on full board', d && d.status === 'over' && d.winners.length === 0);
	mClear(dPage);
	let dWrap = mDom(dPage, { wmax: 560, m: 'auto', pabottom: 16, paleft: 12, paright: 12, patop: 12 });
	mDom(dWrap, { fz: 18, weight: 'bold', mabottom: 8 }, { tag: 'h1', html: 'Iteration 1: helpers + ttt' });
	let dTests = mDom(dWrap, { mabottom: 12 }, { tag: 'ul' });
	for (const [name, ok] of results) mDom(dTests, { fg: ok ? 'green' : 'red' }, { tag: 'li', html: (ok ? 'PASS ' : 'FAIL ') + name });
	let dGame = mDom(dWrap);
	function runDemo() {
		// Starts a fresh solo game: human X vs random bot O.
		let state = game.setup([{ name: 'you', playmode: 'human' }, { name: 'bot', playmode: 'bot' }], { rows: 3, cols: 3 });
		state.players['you'].symbol = 'X'; state.players['bot'].symbol = 'O';
		state.plorder = ['you', 'bot']; state.turn = ['you'];
		let ui = game.present(state, dGame);
		game.activate(state, ui, onMove);
		function onMove(move) {
			let next = game.process(state, move);
			if (!next) return;
			state = next;
			let ui2 = game.present(state, dGame);
			game.activate(state, ui2, onMove);
		}
	}
	mButton('Restart human-vs-bot', runDemo, dWrap, { matop: 4, mabottom: 12 });
	runDemo();
}
