function ttt() {
	function setup(players, options = {}) {
		let rows = Number(options.rows) || 3;
		let cols = Number(options.cols) || 3;
		let symbols = (options.symbols || 'XO').split('');
		let names = players.map(p => (isString(p) ? p : p.name));
		let bots = options.bots || players.filter(p => !isString(p) && p.playmode === 'bot').map(p => p.name);
		let board = [];
		for (let r = 0; r < rows; r++) { board.push([]); for (let c = 0; c < cols; c++) board[r].push(null); }
		let plorder = arrShuffle(names.slice());
		let pls = {};
		for (let i = 0; i < names.length; i++) pls[names[i]] = { name: names[i], symbol: symbols[i % symbols.length], playmode: bots.includes(names[i]) ? 'bot' : 'human' };
		return { rows, cols, symbols, board, plorder, players: pls, turn: [plorder[0]], status: 'active', winners: [], winLine: null, winlen: Math.min(rows, cols) };
	}
	function process(state, move) {
		// Pure move: returns a new state copy on success, null on illegal move. No backend, no mutation.
		if (state.status === 'over') return null;
		if (nundef(move) || !state.turn.includes(move.player)) return null;
		let { r, c } = move;
		if (!isNumber(r) || !isNumber(c) || r < 0 || r >= state.rows || c < 0 || c >= state.cols) return null;
		if (state.board[r][c] !== null) return null;
		let next = jsCopy(state);
		let sym = next.players[move.player].symbol;
		next.board[r][c] = sym;
		let line = tttCheckWin(next.board, sym, next.winlen);
		if (line) { next.winLine = line; next.winners = [move.player]; next.status = 'over'; next.turn = []; }
		else if (tttIsBoardFull(next.board)) { next.winners = []; next.status = 'over'; next.turn = []; }
		else next.turn = [arrNext(next.plorder, move.player)];
		return next;
	}
	function present(state, dParent) {
		mClear(dParent);
		let dConsole = mDom(dParent, { wmax: 560, m: 'auto', pabottom: 16, paleft: 12, paright: 12, patop: 12 }, { id: 'dConsole' });
		let me = state.turn[0];
		let accent = state.status === 'over' ? 'var(--surface-ink)' : me === state.plorder[0] ? 'var(--accent-x)' : 'var(--accent-o)';
		mStyle(dConsole, { border: '2px solid ' + accent });
		dConsole.style.setProperty('--accent', accent);
		let status = state.status === 'over'
			? (state.winners.length ? 'Winner: ' + state.winners[0] + ' (' + state.players[state.winners[0]].symbol + ')' : 'Draw!')
			: 'Turn: ' + me + ' (' + state.players[me].symbol + ')';
		mDom(dConsole, { fz: 22, weight: 'bold', mabottom: 4 }, { tag: 'h1', html: 'Tic-Tac-Toe' });
		let dStatus = mDom(dConsole, { fz: 18, mabottom: 12 }, { tag: 'p', html: status });
		dStatus.setAttribute('role', 'status');
		dStatus.setAttribute('aria-live', 'polite');
		let cellPx = 'min(26vw, 110px)';
		let dBoard = mDom(dConsole, { display: 'grid', gap: 8, justifyContent: 'center' });
		dBoard.style.gridTemplateColumns = 'repeat(' + state.cols + ', ' + cellPx + ')';
		let cells = [];
		for (let r = 0; r < state.rows; r++) {
			cells[r] = [];
			for (let c = 0; c < state.cols; c++) {
				let val = state.board[r][c];
				let isWin = state.winLine && state.winLine.some(([wr, wc]) => wr === r && wc === c);
				let b = mDom(dBoard, {}, { tag: 'button', html: val || '', id: 'ttt_' + r + '_' + c });
				b.className = 'ttt-cell' + (isWin ? ' win' : '');
				b.setAttribute('aria-label', 'Row ' + (r + 1) + ' column ' + (c + 1) + ', ' + (val || 'empty'));
				if (state.status === 'over' || val) b.disabled = true;
				cells[r][c] = b;
			}
		}
		return { dConsole, dStatus, cells };
	}
	function activate(state, ui, onMove) {
		// Wires human clicks; when a bot is to move, schedules one random move instead.
		if (state.status === 'over') return;
		let me = state.turn[0];
		if (state.players[me].playmode === 'bot') {
			setTimeout(() => {
				let pick = tttBotPick(state);
				if (pick) onMove({ player: me, r: pick[0], c: pick[1] });
			}, 600);
			return;
		}
		for (let r = 0; r < state.rows; r++) for (let c = 0; c < state.cols; c++) {
			if (state.board[r][c] === null) ui.cells[r][c].onclick = () => onMove({ player: me, r, c });
		}
	}
	return { setup, present, activate, process };
}
function tttBotPick(state) {
	let empty = [];
	for (let r = 0; r < state.rows; r++) for (let c = 0; c < state.cols; c++) if (state.board[r][c] === null) empty.push([r, c]);
	if (empty.length === 0) return null;
	return rChoose(empty);
}
function tttCheckWin(board, sym, winlen) {
	function lineFrom(r, c, dr, dc) {
		let cells = [];
		for (let i = 0; i < winlen; i++) {
			let rr = r + dr * i, cc = c + dc * i;
			if (rr < 0 || rr >= board.length || cc < 0 || cc >= board[0].length || board[rr][cc] !== sym) return null;
			cells.push([rr, cc]);
		}
		return cells;
	}
	for (let r = 0; r < board.length; r++) for (let c = 0; c <= board[0].length - winlen; c++) { let l = lineFrom(r, c, 0, 1); if (l) return l; }
	for (let c = 0; c < board[0].length; c++) for (let r = 0; r <= board.length - winlen; r++) { let l = lineFrom(r, c, 1, 0); if (l) return l; }
	for (let r = 0; r <= board.length - winlen; r++) for (let c = 0; c <= board[0].length - winlen; c++) { let l = lineFrom(r, c, 1, 1); if (l) return l; }
	for (let r = 0; r <= board.length - winlen; r++) for (let c = winlen - 1; c < board[0].length; c++) { let l = lineFrom(r, c, 1, -1); if (l) return l; }
	return null;
}
function tttIsBoardFull(board) {
	for (let r = 0; r < board.length; r++) for (let c = 0; c < board[0].length; c++) if (board[r][c] === null) return false;
	return true;
}
