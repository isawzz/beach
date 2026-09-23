# Project Guidance & Agent Rules

## Overview
add to the working project koala 2 games from a legacy project koala/closure.js: function aristo and function ferro.

## Features
- koala/aristo0.js should become obsolete.
- koala/closure.js functions aristo and ferro should be added in a new file: koala/legacygames. 
- all dependencies from closure.js should be added as well.
- if there are name conflicts between added code and existing code in codeall0.js, those should be pointed out and resolved in a manner so that the functions from closure.js should be renamed and calls to those from closure.js should be updated accordingly.
- all comments should go INSIDE of the functions
- in another new file glue.js, minimal code should be added so that the closure functions work together with the mechanisms (polling, updateMain, gtShow, tableSaveUpdate...) from codeall0.js still work
- please document everything concisely in a file doc.md
