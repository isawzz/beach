# Beach — modular game suite (refactor in progress)

Vanilla JS + CSS + PHP refactor of the legacy web card/board games.

## Status
Iteration 1: minimal `common/` helpers, streamlined `ttt()` module, `test0_initial` demo in `koala/start.js`.

## Quickstart
Serve via XAMPP (or any PHP server) and open `koala/index.html`.

## Layout
- `common/`: shared library + `api.php` backend
- `koala/`: game instances (`ttt.js`, `start.js`, `index.html`)
- `docs/`: roadmap, handoff, architecture, user guide, deployment
- `legacy/`, `alibs/`, `assets/`, `y/`: reference/vendor/data (do not modify except `y/` datasets as needed)
