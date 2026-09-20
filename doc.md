/
├── alibs/
│   └── tess.js
├── common0/
│   ├── globals.js
│   ├── codebasic.js
│   ├── codecards.js
│   ├── codeboard.js
│   ├── codebackend.js
│   └── codegames.js
└── gem0/
    ├── index.html
    ├── styles.css
    ├── ttt.js
    └── start.js

Hi! I am starting a fresh refactoring of my legacy game suite into a modular structure according to our AGENTS.md rules.

Please review the legacy files in `legacy/aroot/` and `legacy/maroot/`, along with the architecture rules in AGENTS.md. 

Your goal for this first iteration is to build a minimal, fully functional Tic-Tac-Toe (`ttt`) implementation across the new modular directory layout:

1. `common/globals.js`: Define minimal global state (`G`).
2. `common/codebasic.js`: Minimal set of essential DOM and array helpers (`mDom`, `mStyle`, `mBy`, `mClear`, `mAppend`, `arrClear`).
3. `common/codecards.js`: Minimal card stub (`cRound`, `uiTypeCard52`).
4. `common/codeboard.js`: Board layout helper (`boardGridCreate`).
5. `common/codebackend.js`: Client-server network stub (`netFetch`, `tableSaveUpdate`).
6. `common/codegames.js`: Shared game helper (`stdInstruction`).
7. `koala/ttt.js`: Tic-Tac-Toe module returning `{ activate, present, process, setup }`.
8. `koala/styles.css`: Combined baseline CSS extracted from `legacy/aroot/games/basemin.css` and `legacy/maroot/games/styles.css`.
9. `koala/index.html` & `koala/start.js`: Clean entry point loading scripts in proper order and mounting `ttt`. the index.html should lean on legacy/maroot/games/index.html and legacy/aroot/games/index.html but can be much simplified. please import 

Strictly adhere to AGENTS.md:
- Keep all comments INSIDE function bodies.
- Sort top-level functions ALPHABETICALLY in every file.
- Use plain functions instead of classes.
- Keep the implementation concise and minimal (only functions required for `ttt` to render and run).

Please outline your step-by-step plan before writing the files.