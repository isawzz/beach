# Project Guidance & Agent Rules

## Overview
This repository refactors legacy web card and board games into a clean, modular vanilla JavaScript framework with a PHP backend (`ppph/api.php`).
Ultimately, it should become a phone-first, laptop-friendly host console for multiplayer boardgames coordinated via a thin backend that only handles game state persistence and minimal player coordination (see legacy/maroot/games/ppph/api.php). 

## Features
- there will also be a solo mode in which all but one player will play as bots. 
- in a later version, game specific bot strategies should be definable by the user. wait with this feature! for that we will have to design an simple yet powerful mechanism and possibly language.
- also, in a later version, each user or bot should be able to have a level attributed, so that game play can remain challenging for players of very different skill level. this feature should be optional.

## Architectural Context
- Stack: Vanilla JS, CSS, php
- Modular engine structure; keep UI separated from game logic.

## Workflow Requirements
- **Planning**: Before rendering multi-file updates, outline a concise step-by-step implementation plan.
- **Minimal Code Principle**: Implement ONLY the helper functions strictly needed for the current work. Avoid speculative coding.
- **Concise Code Principle**: Maintain clean, self-documenting JS. keep all comments inside of functions and use comments sparingly.

## Critical Code Rules
1. **Functions & Structure**: Use plain functions (`function name() {}`), avoiding `class` keywords.
2. **Comment Placement**: ALWAYS place JSDoc/explanatory comments **INSIDE** the body of function definitions. Never put comments above or outside function declarations. Use comments sparingly; prefer clear, self-documenting code.
3. **Alphabetical Sorting**: In EVERY `.js` file, keep all top-level function definitions sorted **alphabetically by function name**.
4. **Naming Prefixes**: Use standard prefixes for grouping related helpers:
   - `m` for DOM operations (`mDom`, `mStyle`, `mBy`, `mClear`)
   - `arr` for Array helpers (`arrClear`, `arrShuffle`)
   - `obj` for Object helpers
   - `ani` for Animations
   - `c` / `ui` for Card-related components
5. **Assets & Libraries**: Reference shared resources at top-level directories: `/alibs` (e.g., `alibs/tess.js`) and `/assets`. Load assets using simple, clean mechanisms from legacy `maroot/games/codeall0.js`.
6. **Game Architecture**: Every game module exports a single function `[GAMENAME]()` returning `{ setup, present, activate, process }`:
   - Pure state logic: `setup(players)` and `process(state, move)`
   - Pure UI logic: `present(state, dParent)` and `activate(state, ui, onMove)`

## Legacy Code
- from legacy/maroot/games, I would like to preserve the menus, user handling, switchToUser, switchToMenu, DAInit, etc. as well as the general way to load and save tables (tableSaveUpdate..., UpdateMain, UpdateUi, gtShow, etc.). 
- also, the general game structure (a game is a function returning `{ setup, present, activate, process }`) should be preserved.
- the game menu (selecting players, options etc.) as well as the other menus (table, settings, icons) should be preserved. however the code for all of this could be streamlined and simplified. extract as much as possible general functions that can be reused.
- specific functions in codebasic.js that I would like preserved are (from legacy/maroot/games/codeall0.js): mDom, mBy, mStyle, mKey, mSleep. mBy could be enhanced to completely replace document.querySelectorAll. if any of these functions could be improved, please make suggestions and implement the suggested version as with an X appended to the function name (eg., mBy => mByX).
- the following files from folder y should be used as in legacy/maroot/games: config.yaml, diemo.yaml, digroup.yaml, m.yaml, users.yaml. as before, those should be used to build the initial global M. 
- from legacy/maroot/games/globals.js I would like to preserve at least: STYLES, PolyClips, M (for assets) and DA (for data saved at client only)

## Project Structure & Architecture
- `alibs/`: External/third-party vendor libraries. Do not modify.
- `assets/`: assets to be loaded. Do not modify.
- `common/`: Shared modular utility functions (`codebasic.js`, `codeboard.js`, etc.) shared across project instances.
- `koala/`: Active project directory containing game instances (e.g., `ttt.js`), `index.html`, and entry points (`start.js`).
- IMPORTANT: ONLY add or change files or code in the 3 folders: common, koala, and docs. Do not modify any other files or folders. keep everything else as is.

## Project Directory Layout
- `alibs/`: Vendor libraries (e.g., `tess.js`). Do NOT modify.
- `assets/`: Game assets, images, and audio. Do NOT modify.
- `legacy/aroot/`: Older code baseline. Reference `closure.js` for well-functioning logic for `ferro` and `aristo`, as well as `select_add_items` and `ari_pre_action`.
- `legacy/maroot/`: Newer code baseline. Reference `codeall0.js` and `aristo0.js` for updated client-server communication (`netFetch`, `tableSaveUpdate`, `tableSaveUpdateFO`, `tableSaveUpdateFS`), polling, `gtShow`, `UpdateMain`, and updated styling patterns.
- `common/`: Active shared library modules:
  - `globals.js`: Minimal required global variables.
  - `codebasic.js`: Basic DOM, array/object manipulation, and animation helpers.
  - `codecards.js`: Card elements and UI creation logic (SpotIt round cards, standard 52-card suits/ranks, complex innovation cards).
  - `codeboard.js`: Graph, grid, and tessellation board layouts using `tess.js`.
  - `codebackend.js`: Backend PHP communications, polling, and table state updates.
  - `codegames.js`: Shared game UI utilities (`select_add_items`, `stdInstruction`, etc.).
  - `styles.css`: Merged and cleaned stylesheet based on legacy `basemin.css` and `styles.css`.
- `koala/`: Active development project directory containing:
  - `index.html`: Entry HTML script tags referencing `../common0/` scripts and `gem0/` game files.
  - `ttt.js`: Tic-Tac-Toe starter implementation as one example of a game using the 4-function interface. later we will successively add all the other games and more
  - `start.js`: Application bootstrap and render loop.

## UI and accessibility rules
- Design mobile-first for 320 px portrait screens, landscape phones, and laptop widths.
- Every interaction must remain available by touch; keyboard shortcuts are enhancements, never requirements.
- Use semantic buttons, headings, labels, live regions, visible focus rings, and at least 44 px touch targets.
- Respect `prefers-reduced-motion`; do not rely on animation or color alone to communicate state.
- Use the semantic theme foreground/surface variables for accent, strong, secret, status, and focus treatments. Keep explicit dark tokens identical to system-dark tokens and retain automated contrast checks.
- Game-scoped accent highlights come from the current player/team color via a single `--accent` variable on the game console; shared chrome outside games keeps its own neutral coral.
- Keep host-facing answers large and high contrast so a phone can be read across a table.
- Prevent accidental secret disclosure. Review both DOM state and visual state when modifying an answer, role, number, or target flow.
- Keep timer state changes independent from Poetry and Pictionary history corrections.

## Testing expectations

- Unit-test sampling, deck rollover, bounds, private dealing, scoring/reassignment, timer behavior, CSV parsing, reveal/attribution rendering changes, and turn prompt/resolve/skip/force behavior.
- Run tests before calling a task complete.
- For interaction changes, manually smoke-test 320 px portrait, phone landscape, and keyboard navigation when browser tooling is available; record anything not exercised in `docs/handoff.md`.
- A passing build does not replace checking that unrevealed secrets are absent from rendered UI.

## Documentation and task records

- Keep `README.md` accurate for current status, installation, and quickstart.
- Keep `docs/architecture.md`, `docs/user-guide.md`, and `docs/deployment.md` aligned with behavior. create those files of don't exist.
- Every major task needs a roadmap and handoff. The current initiative uses `docs/roadmap.md` and `docs/handoff.md`; later concurrent initiatives should use `docs/tasks/YYYY-MM-DD-short-name/roadmap.md` and `handoff.md`.
- Each roadmap/handoff starts with YAML metadata containing at least `title`, `status`, and `last_updated`. Allowed statuses: `planned`, `in_progress`, `blocked`, `completed`, `superseded`.
- On starting work, search `docs/**/{roadmap,handoff}.md`. Mark stale active records `completed` or `superseded` with a short explanation; never leave multiple records implying ownership of the same task.
- Update roadmap checkboxes and handoff verification results at the end of every major task.

## Change hygiene

- Preserve unrelated user work and datasets.
- Do not commit, push, deploy, or configure external services unless explicitly requested.
- Do not put secrets in the repository. There are currently no required environment variables.
- Prefer concise comments that explain decisions rather than restating code.
- each change must have a test in koala/start.js inserted at the top (right after function start and called in function start)


