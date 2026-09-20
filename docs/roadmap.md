---
title: Modular refactor of legacy game suite
status: in_progress
last_updated: 2026-09-19
---

# Roadmap

- [x] Iteration 1: minimal `common/` helpers (`mDom`, `mBy` + `mByX`, `mStyle`, `mKey`, `mSleep`), `globals.js`, streamlined `ttt()` module, `test0_initial` demo
- [ ] Iteration 2: backend wiring — `tableSaveUpdate` equivalents on `common/api.php`, polling, user/menu handling (`switchToUser`, `switchToMenu`, `DAInit`)
- [ ] Iteration 3: game menu (players, options), table/settings/icons menus, `y/*.yaml` asset loading into `M`
- [ ] Later: solo bot mode per game, user-definable bot strategies, optional player/bot levels
