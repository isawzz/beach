# Legacy games integration (aristo + ferro)

## What was done
- New `koala/legacygames.js`: legacy `aristo`/`ferro` game factories from `koala/closure.js` plus all code they need (362 top-level functions, ~201 KB). No framework/network code.
- New `koala/glue.js`: minimal bridge that runs the legacy games inside the modern `codeall0.js` mechanisms (`gtShow`, `updateMain`, polling, `tableSaveUpdate`).
- `koala/aristo0.js` is obsolete: no longer loaded by `index.html` (file kept on disk, unreferenced).
- `index.html` now loads `globals.js`, `codeall0.js`, `legacygames.js`, `glue.js`, `start.js` (in that order).
- `start.js` tests no longer use `aristo0.js`-only helpers.

## How dependencies were extracted
- `closure.js` has 885 top-level `function` declarations. Reachability was computed from the `aristo()`/`ferro()` factory bodies (including by-reference callbacks such as `post_trade`, `fp_card_selection`, `ferro_ack_uplayer`, which a naive `name(` scan misses).
- Result: 552 reachable functions. 192 of them already exist in `codeall0.js` and are reused, not copied. The remaining 360 plus the two factories were copied verbatim into `legacygames.js`.
- The 11 legacy network/sync functions (`take_turn*`, `autopoll`, `send_or_sim`) were excluded and reimplemented in `glue.js`.

## Name conflicts and resolution
- Full top-level overlap `closure.js` vs `codeall0.js`: 312 identical names (mostly generic `m*`, `is*`, `arr*`, `lookup*` utilities). The 192 overlaps reachable from the games are reused from `codeall0.js` (modern versions win; spot-checked as compatible supersets, e.g. null-safe `lookup`, dict-aware `rChoose`).
- Renamed legacy-side (per AGENTS rule, call sites updated):
  - `aristo` -> `aristoLegacy`, `ferro` -> `ferroLegacy` (frees `aristo`/`ferro` for the modern adapters in `glue.js`; `DAInit` shorthand would otherwise grab the wrong factory).
  - `ARI` -> `ARI_LEGACY` (`globals.js` already defines `ARI` with a different stage map; 5 legacy functions use it: `ari_present`, `ari_state`, `ai_move`, `ari_pre_action`, `ari_tax_phase_needed`).
  - `process_comm_setup` -> `leg_process_comm_setup` (the only true function collision: `codeall0.js` defines an `async process_comm_setup(me, table, items)` with table-based semantics vs the legacy Z-based one; 5 occurrences renamed).
- No other top-level declaration in `legacygames.js`/`glue.js` collides with `codeall0.js`/`globals.js` (verified by script).

## Glue design (`glue.js`, ~100 lines, comments only inside functions)
| Legacy (Z-based) | Modern (table-based) |
|---|---|
| `Z.fen/stage/turn/plorder/uplayer/options/...` | mirrored from `table` by `syncZFromTable(me, table[, resetUI])` before `present`/`activate` |
| `take_turn*()` + `send_or_sim` (PHP backend) | redefined: `syncTableFromZ` -> `tableSaveUpdate` -> `updateMain(true)` |
| `autopoll`/`_poll` | no-op; modern `pollAndShow` loop owns polling |
| `setup(players, options)` | wrapped as `setup(table)`; also seeds `Serverdata.users` colors and copies `playmode` into `fen.players` (legacy `get_user_color`/`is_human_player` need them) |
| `ari_present`/`ferro_present(dParent)` | called with `stdPresentBGATable` output after `showTitleGame`; returns global `UI` |
| `ari_activate_ui`/`ferro_activate_ui()` | called from modern `activate(me, table, ui)`; spectators skip |
| game registration | `gluePatchDAInit` wraps `DAInit`: adds `ferro` to `DA.gamelist`/`DA.funcs`, points `DA.funcs.aristo` at the adapter, injects `M.config.games.ferro` defaults |
| `playerdata`/`state*` (legacy multi-step moves) | persisted on the table object alongside `fen` |

## `start.js` changes
- `test0_aristo_show_actions`: removed stall-hacking and `ariTransitionToActionStage` (aristo0-only, wrong data model: legacy hands live in `table.fen.players`, not `table.players`); game now starts via its natural legacy setup flow.
- `test01_aristoStage1`: operates on `fen.players`, uses `calc_stall_value(fen, name)` from `codeall0.js` instead of removed `calcStallValue(table, name)`; dropped `DA.kingPhase` (unused by legacy flow).

## Verification
- `node --check` passes for `legacygames.js` and `glue.js`.
- Script-checked: zero top-level name collisions across the three scripts; zero bare `ARI` left in `legacygames.js`; boundary functions absent from `legacygames.js` and defined in `glue.js`; no `//` comments outside function bodies in the new files.
- Runtime check is manual: open `koala/index.html` (via web server), `start()` creates an aristo table and `gtShow` renders it; create a `ferro` table the same way to exercise the second adapter.

## Limitations
- Legacy move handlers assume the legacy selection UI; bot play for aristo/ferro is whatever legacy `ai_move` provides (no modern `scheduleBotMoves` wiring).
- Out-of-turn clients render the board but only spectators are blocked from acting; move legality relies on legacy turn flow, as before.
