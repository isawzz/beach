
function ttt() {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

  function lineAt({ rows, cols, winlen, board }, sym) {
    for (let i = 0; i < rows * cols; i++) for (const [dr, dc] of dirs) {
      const line = range(winlen).map(k => {
        const r = Math.floor(i / cols) + dr * k, c = i % cols + dc * k;
        return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : -1;
      });
      if (line.every(j => board[j] === sym)) return line;
    }
  }

  function setup(table) {
    const rows = Number(table.options.rows) || 3, cols = Number(table.options.columns) || 3;
    const symbols = [...(table.options.symbols || 'XO')];
    table.fen = { rows, cols, winlen: Math.min(rows, cols), board: Array(rows * cols).fill(null), symbols };
    Object.keys(table.players).forEach((name, i) => Object.assign(table.players[name], { symbol: symbols[i % symbols.length], score: 0 }));
    table.plorder = arrShuffle(Object.keys(table.players));
    table.turn = [table.plorder[0]];
    table.options.polling = 1000;
  }

  async function process(who, table, i) {
    const t = gtCopy(table), { fen } = t, sym = t.players[who].symbol;
    if (fen.board[i] !== null) return false;
    fen.board[i] = sym;
    const line = lineAt(fen, sym);
    if (line || !fen.board.includes(null)) {
      Object.assign(fen, { winLine: line, winners: line ? [who] : [] });
      Object.assign(t, { status: 'over', turn: [] });
    } else t.turn = [arrNext(t.plorder, who)];
    t.action = { plName: who, key: i, step: (t.step || 0) + 1 };
    return (await tableSaveUpdateFO(t))?.success === true;
  }

  async function play(who, table, i) {
    DA.isProcessingMove = true;
    stdEvalShield();
    await mSleep(200);
    if (await process(who, table, i)) await updateMain(true);
    DA.isProcessingMove = false;
  }

  function botPick(table, bot) {
    const { fen } = table, { symbol, strategy } = table.players[bot];
    const free = range(fen.board.length).filter(i => fen.board[i] === null);
    if (strategy === 'clairvoyant') for (const sym of [symbol, ...fen.symbols.filter(s => s !== symbol)]) {
      const hit = free.find(i => { fen.board[i] = sym; const win = lineAt(fen, sym); fen.board[i] = null; return win; });
      if (hit !== undefined) return hit;
    }
    return rChoose(free);
  }

  function present(me, table) {
    const dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table, { allowUserSwitch: true });
    const { rows, cols, board, winLine = [] } = table.fen;
    const cell = Math.min(110, Math.floor(600 / Math.max(rows, cols)));
    const dGrid = mDom(dTable, { display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap: 4, m: 'auto' });
    const cells = board.map((val, i) => {
      const win = winLine.includes(i);
      return mDom(dGrid, {
        w: cell, h: cell, center: 1, r: 8, fz: cell * .55, fw: 'bold', fg: '#1b5e20',
        bg: win ? '#ffeb3b' : val ? '#e8f5e9' : '#fffde7',
        border: win ? '3 #f44336' : '2 #bdbdbd', html: val ?? ''
      });
    });
    return { dTable, cells };
  }

  async function activate(me, table, ui) {
    const { myTurn, spectating } = stdInstruction(me, table, 'Place your symbol!');
    if (spectating || table.status === 'over') return;
    if (myTurn) table.fen.board.forEach((v, i) => v === null && ignoreDoubleClick(mStyle(ui.cells[i], { cursor: 'pointer' }), () => play(me, table, i)));
    const bot = rChoose(table.turn.filter(n => table.players[n].playmode == 'bot'));
    if (!bot) return;
    const { botmin = 2000, botmax = 4000 } = table.options;
    clearTimeout(TO.bot);
    TO.bot = setTimeout(() => play(bot, table, botPick(table, bot)), TESTING ? 500 : rNumber(botmin, Math.max(botmin + 1000, botmax)));
  }

  return { setup, process, present, activate };
}

function stdPresentBGATable(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', M.users[me].color);
  pollSetMs(lookup(table, ['options', 'polling']) ?? ms ?? 2000);
  const dm = mDom('dMain', { hmin: 700, align: 'center', boxSizing: 'border-box' });
  mClass(className == 'velvet' ? 'dMain' : dm, className);
  mDom(dm, { id: 'dTitle', flexSpaceBetween: 1, hmin: 30 });
  mDom(dm, { id: 'dInstruction', flexCenterCenter: 1, hmin: 50 });
  mDom(dm, { id: 'dStats', flexCenterCenter: 1, hmin: 110 });
  mDom(dm, { id: 'dTable', flexCenterCenter: 1 });
  return mBy('dTable');
}
