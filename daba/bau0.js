
function stdPresentBGATable(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', M.users[me].color);
  let polling = lookup(table, ['options', 'polling']);
  if (isdef(polling)) pollSetMs(polling);
  else if (isdef(ms)) pollSetMs(ms);
  let dm = mDom('dMain', { hmin: 700, align: 'center', boxSizing: 'border-box' });
  if (className == 'velvet') mClass('dMain', className);
  else mClass(dm, className);
  mDom(dm, { flexSpaceBetween: 1, id: 'dTitle' });
  mDom(dm, { flexCenterCenter: 1, id: 'dInstruction' });
  mDom(dm, { flexCenterCenter: 1, id: 'dStats' });
  mDom(dm, { flexCenterCenter: 1, id: 'dTable' });
  return mBy('dTable');
}
function stdStatsScore(me, table, extras = {}) {
  statsInit(me, table, extras);
  for (const plName in table.players) {
    let pl = table.players[plName];
    let d = mBy('dStat_' + plName);
    mDom(d, { fz: 22, margin: 4, html: pl.score });
    let lp = lookup(table, ['action', 'plName']); //console.log('last player', lp);
    let t = getNow();
    if (lp == plName) mAnimate(d, 'outline', ['3px solid yellow', ''], null, 1500, 'ease-out', 0, 'both');
  }
}
function statsInit(me, table, extras = {}) {
  let players = table.players || table.fen.players;
  let sz = isdef(extras.sz) ? extras.sz : 40;
  let styles = { margin: 10, maxWidth: 210, rounding: 10, margin: 4, padding: 4, ptop: 12, boxSizing: 'border-box' }; //, 'border-style': 'solid', 'border-width': 6 }
  let showfirst = isdef(players[me]) ? me : table.plorder[0];
  let order = arrCycle(table.plorder, table.plorder.indexOf(showfirst));
  let d = mDom(extras.dParent || 'dStats', { mtop: 6, mbottom: 10, className: extras.className || 'flexCC' });
  let usedPlayerColor = false;
  let bg, fg, cborder, cimgborder;
  for (const plName of order) {
    let pl = players[plName];
    let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
    if (nundef(extras.bg)) { usedPlayerColor = true; bg = pl.color; fg = colorIdealText(pl.color); }
    else if (nundef(extras.fg)) { bg = extras.bg; fg = colorIdealText(extras.bg); }
    else { bg = extras.bg; fg = extras.fg; }
    if (usedPlayerColor) { cborder = extras.cborder || 'white'; cimgborder = extras.cimgborder || 'white'; }
    else { cborder = extras.cborder || pl.color; cimgborder = extras.cimgborder || pl.color; }
    copyKeys({ bg, fg, border: `${cborder == pl.color ? 2 : 1}px solid ${cborder}` }, styles);
    let d1 = mDom(d, { ...styles, id: 'dStat_' + plName });
    if (extras.allowUserSwitch || TESTING) {
      mStyle(d1, { cursor: 'pointer' });
      d1.onclick = async () => { await switchToUser(plName); }
    }
    let img = mDom(d1, { border: `${cimgborder == pl.color ? 2 : 1}px solid ${cimgborder}`, padding: 0, margin: 10, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot', tag: 'img', src });
    mLinebreak(d1);
    if (table.turn.includes(plName) && (!table.pending || !table.pending.includes(plName))) showHourglass(plName, d1, sz / 2, { left: -4, top: 4 });
  }
}
function showTitleGame(me, table) {
  dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { ptop: 4, wrap: 'nowrap', boxSizing: 'border-box' });
  let list = table.turn;
  let d0 = mDom(dTitle, { flexSpaceBetween: 1 });
  let d1 = mDom(d0, { pleft: 12, html: `Player${list.length > 1 ? 's' : ''}: `, id: 'dTitleLeft' });
  if (sameList(list, table.plorder)) {
    mDom(d0, { mleft: 4, html: 'All' });
  } else {
    for (const plName of list) {
      let pl = table.players[plName];
      let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(d0, { border: `1px solid ${cimgborder}`, mleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot', tag: 'img', src });
    }
  }
  mDom(dTitle, { id: 'dTitleMiddle' });
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(M.config.games[table.game].friendly) + ')';
  mDom(dTitle, { pright: 10, boxSizing: 'border-box', html, id: 'dTitleRight' });
  let dtr = mBy('dTitleRight');
  dtr.onmouseenter = () => onhoverGamename(me, table);
  dtr.onmouseleave = () => mRemove('dGameOptions');
}


function ttt() {
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let rows = fen.rows = Number(options.rows) || 3;
    let cols = fen.cols = Number(options.columns) || 3;
    let symbols = fen.symbols = (options.symbols || 'XO').split('');
    fen.winlen = Math.min(rows, cols);
    fen.board = [];
    for (let r = 0; r < rows; r++) { fen.board.push([]); for (let c = 0; c < cols; c++) fen.board[r].push(null); }
    let plNames = Object.keys(table.players);
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    for (let i = 0; i < plNames.length; i++) {
      let pl = table.players[plNames[i]];
      pl.symbol = symbols[i % symbols.length];
      pl.score = 0;
    }
    table.turn = [table.plorder[0]];
    fen.movetype = 'turn';
    table.options.polling = 1000;
  }
  async function process(me, table, cellKey) {
    let newTable = gtCopy(table);
    let fen = newTable.fen;
    let pl = newTable.players[me];
    if (!pl || !pl.symbol) return false;
    if (!isdef(cellKey) || !String(cellKey).includes(',')) return false;
    let [r, c] = String(cellKey).split(',').map(Number);
    if (r < 0 || r >= fen.rows || c < 0 || c >= fen.cols) return false;
    if (fen.board[r][c] !== null) return false;
    fen.board[r][c] = pl.symbol;
    let result = tttCheckWin(fen.board, pl.symbol, fen.winlen, fen.rows, fen.cols);
    if (result) {
      fen.winLine = result;
      fen.winners = [me];
      newTable.status = 'over';
      newTable.turn = [];
    } else if (tttIsBoardFull(fen.board, fen.rows, fen.cols)) {
      fen.winners = [];
      newTable.status = 'over';
      newTable.turn = [];
    } else {
      newTable.turn = [arrNext(newTable.plorder, me)];
    }
    newTable.action = { plName: me, key: cellKey, step: (newTable.step || 0) + 1 };
    let res = await tableSaveUpdateFO(newTable);
    return res?.success === true;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table, { allowUserSwitch: true });
    let fen = table.fen;
    let rows = fen.rows, cols = fen.cols;
    let sz = Math.min(600, Math.max(rows, cols) * 110);
    let cellSz = Math.floor(sz / Math.max(rows, cols));
    let dt = mDom(dTable, { display: 'grid', 'grid-template-columns': `repeat(${cols}, ${cellSz}px)`, 'grid-template-rows': `repeat(${rows}, ${cellSz}px)`, gap: 4, margin: 'auto' });
    let ui = { dTable: dt, cells: [] };
    let winLine = fen.winLine;
    for (let r = 0; r < rows; r++) {
      ui.cells[r] = [];
      for (let c = 0; c < cols; c++) {
        let val = fen.board[r][c];
        let isWin = winLine && winLine.some(([wr, wc]) => wr === r && wc === c);
        let bg = isWin ? '#ffeb3b' : (val ? '#e8f5e9' : '#fffde7');
        let border = isWin ? '3px solid #f44336' : '2px solid #bdbdbd';
        let fg = val ? '#1b5e20' : '#ccc';
        let fz = Math.floor(cellSz * 0.55);
        let d = mDom(dt, { w: cellSz, h: cellSz, bg, border, rounding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fz, fw: 'bold', cursor: 'pointer', html: val || '', id: `ttt_${r}_${c}` });
        ui.cells[r][c] = d;
      }
    }
    return ui;
  }
  async function onHumanClick(me, table, ui, r, c) {
    DA.isProcessingMove = true;
    stdEvalShield();
    await mSleep(200);
    let sent = await process(me, table, `${r},${c}`);
    if (sent) await updateMain(true);
    DA.isProcessingMove = false;
  }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table, 'Place your symbol!');
    if (table.status === 'over') return;
    if (spectating) {
      return;
    }
    if (myTurn) {
      let fen = table.fen;
      for (let r = 0; r < fen.rows; r++) {
        for (let c = 0; c < fen.cols; c++) {
          let d = ui.cells[r][c];
          if (fen.board[r][c] === null) {
            ignoreDoubleClick(d, async () => await onHumanClick(me, table, ui, r, c));
          }
        }
      }
    } else {
    }
    scheduleBotMoves(me, table);
  }
  function scheduleBotMoves(me, table) {
    let bots = table.turn.filter(name => table.players[name].playmode == 'bot');
    if (bots.length == 0) return;
    let bot = rChoose(bots);
    let min = lookup(table.options, ['botmin']) ?? 2000;
    let max = Math.max(min + 1000, lookup(table.options, ['botmax']) ?? 4000);
    let ms = TESTING ? 500 : rChoose(range(min, max));
    if (isdef(TO.bot)) clearTimeout(TO.bot);
    TO.bot = setTimeout(async () => {
      DA.isProcessingMove = true;
      stdEvalShield();
      await mSleep(200);
      let cell = tttBotPick(table, bot);
      let sent = await process(bot, table, cell);
      if (sent) await updateMain(true);
      DA.isProcessingMove = false;
    }, ms);
  }
  return { setup, process, present, activate };
}
function tttBotPick(table, bot) {
  let fen = table.fen;
  let rows = fen.rows, cols = fen.cols;
  let pl = table.players[bot];
  let sym = pl.symbol;
  let strategy = lookup(table, ['players', bot, 'strategy']) || 'random';
  let empty = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (fen.board[r][c] === null) empty.push([r, c]);
  if (empty.length === 0) return null;
  if (strategy === 'clairvoyant') {
    for (let [r, c] of empty) { fen.board[r][c] = sym; let win = tttCheckWin(fen.board, sym, fen.winlen, rows, cols); fen.board[r][c] = null; if (win) return `${r},${c}`; }
    let oppSyms = fen.symbols.filter(s => s !== sym);
    for (let [r, c] of empty) {
      for (let os of oppSyms) { fen.board[r][c] = os; let win = tttCheckWin(fen.board, os, fen.winlen, rows, cols); fen.board[r][c] = null; if (win) return `${r},${c}`; }
    }
  }
  let pick = rChoose(empty);
  return `${pick[0]},${pick[1]}`;
}
function tttCheckWin(board, sym, winlen, rows, cols) {
  function checkLine(cells) { return cells.length >= winlen && cells.every(([r, c]) => board[r][c] === sym); }
  function findInDir(startR, startC, dr, dc) {
    let cells = [];
    for (let i = 0; i < winlen; i++) { let r = startR + dr * i, c = startC + dc * i; if (r < 0 || r >= rows || c < 0 || c >= cols) return null; cells.push([r, c]); }
    return cells;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c <= cols - winlen; c++) { let cells = findInDir(r, c, 0, 1); if (cells && checkLine(cells)) return cells; }
  for (let c = 0; c < cols; c++) for (let r = 0; r <= rows - winlen; r++) { let cells = findInDir(r, c, 1, 0); if (cells && checkLine(cells)) return cells; }
  for (let r = 0; r <= rows - winlen; r++) for (let c = 0; c <= cols - winlen; c++) { let cells = findInDir(r, c, 1, 1); if (cells && checkLine(cells)) return cells; }
  for (let r = 0; r <= rows - winlen; r++) for (let c = winlen - 1; c < cols; c++) { let cells = findInDir(r, c, 1, -1); if (cells && checkLine(cells)) return cells; }
  return null;
}
function tttIsBoardFull(board, rows, cols) {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (board[r][c] === null) return false;
  return true;
}


