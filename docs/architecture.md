---
title: Architecture
status: in_progress
last_updated: 2026-09-19
---

# Architecture

- `common/`: shared vanilla-JS library (`globals.js`, `codebasic.js`, `codebackend.js`, `codeboard.js`, `codecards.js`, `codegames.js`, `styles.css`, `api.php`).
- `koala/`: active game instances; each game module exports one function `[GAMENAME]()` returning `{setup, present, activate, process}` (pure state in `setup`/`process`, pure UI in `present`, wiring in `activate`).
- `common/api.php`: thin backend — JSON POST router for DB rows (`gametable`, `game_sync`), YAML/file ops, uploads. Only persistence + minimal coordination; game rules live client-side.
- `y/`: YAML datasets loaded into global `M` (wiring deferred to iteration 3).
- `legacy/`, `alibs/`, `assets/`: read-only reference/vendor material.
