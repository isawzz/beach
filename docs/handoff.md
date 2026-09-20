---
title: Handoff iteration 1
status: in_progress
last_updated: 2026-09-19
---

# Handoff — Iteration 1

## What was done
- `common/globals.js`: minimal `DA`, `M`, `TO`, `UI`, `PolyClips`, `STYLES`, `NO_UNIT_STYLES` (legacy `globals.js` lines 725–962, trimmed of color/icon systems).
- `common/codebasic.js`: only strictly needed helpers, alphabetically sorted, plain functions, comments inside bodies: `mDom`, `mBy` (legacy-compatible), `mByX` (new: single selector entry point replacing `querySelector(All)`), `mStyle`/`mStyles`, `mKey` (minimal text version until `y/*.yaml` asset loading lands), `mSleep` (simplified: no shared `TO` timeout, parallel sleeps no longer cancel each other), `mClear`, `mCreate`, `mAppend`, `mButton`, `applyOpts`, `toElem`, type guards, `arrNext`/`arrShuffle`, `rChoose`, `jsCopy`, `lookup`, `getUID`, `toWords`, `valf`.
- `common/codebackend.js`: minimal `apiFetch` POST wrapper for `common/api.php`.
- `koala/ttt.js`: streamlined `ttt()` returning `{setup, present, activate, process}`; pure local state (no backend), solo human-vs-random-bot, semantic buttons + live-region status.
- `koala/start.js`: `start()` calls `test0_initial()` (pure-logic self-tests + playable demo), per change-hygiene rule.
- `koala/index.html`: loads `ttt.js`; `common/styles.css`: mobile-first theme, 44px targets, focus rings, `prefers-reduced-motion`.

## Deferred (with reason)
- Backend table persistence/polling/menus/`DAInit`/`switchToUser`: needs `M.config`/`users.yaml` loading; iteration 2.
- Full `mKey` emoji/icon rendering: needs `y/` asset pipeline; iteration 3.
- Bot strategies/levels: explicitly later per AGENTS.md.

## Verification
- `node --check` on all touched JS files.
- Pure-logic ttt tests executed in node (setup/process/win/draw/illegal moves).
- Browser smoke test (320px, landscape, keyboard) NOT yet exercised — no browser tooling in this session.
