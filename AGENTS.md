# Project Guidance & Agent Rules

## Overview
working folder is daba. in bau0.js I have multiple functions that deal with svg creation and processing. I would definitely want to keep drawClaudeX, createStageX, emojiSvgToShape. Furthermore, I want very simple, small, minimalistic, easy to understand, unburdened by lots of checks and error handling, plainly assuming that the provided parameters are ok, functions to: 1)process svg code cleaning up unneeded attributes; rounding numbers in paths and other geometric numbers to integers (if possible) or fixed(2) if necessary; computing the BBox and setting viewbox accordingly to leave no space at the border. when rendering the svg with preserveAspectRatio none, width and height 100%, the svg should FULLY occupy the space of the parent div. when rendering with preserving the ratio, it should render the larger of the dims to fully occupy the enclosing div, and the other dim centered. 2)create an svg element from svg code. the helper functions needed for those functions can be kept as is. most comments and large initial comments should be removed. 

## Features
- koala/aristo0.js should become obsolete.
- koala/closure.js functions aristo and ferro should be added in a new file: koala/legacygames. 
- all dependencies from closure.js should be added as well.
- if there are name conflicts between added code and existing code in codeall0.js, those should be pointed out and resolved in a manner so that the functions from closure.js should be renamed and calls to those from closure.js should be updated accordingly.
- all comments should go INSIDE of the functions
- in another new file glue.js, minimal code should be added so that the closure functions work together with the mechanisms (polling, updateMain, gtShow, tableSaveUpdate...) from codeall0.js still work
- please document everything concisely in a file doc.md
