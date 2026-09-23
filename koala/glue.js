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
    showTitleGame(me, table);
    let dTable = stdPresentBGATable(me, table);
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
