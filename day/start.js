onload = start; VERBOSE = false; TESTING = false; DEV = false; POLLING = true;

function start() { test1(); }



function test1() {

	let html =`  <div id="dTest1">
    <h2>Any tessagon: streets &amp; cities</h2>
    <div class="controls">
      <label for="tessagon">Tessagon</label>
      <select id="tessagon"></select>
      <label for="tcols">Cols</label>
      <input id="tcols" type="number" value="1" min="1" max="12" />
      <label for="trows">Rows</label>
      <input id="trows" type="number" value="1" min="1" max="12" />
      <label for="tpattern">Pattern</label>
      <select id="tpattern"></select>
      <button id="trender">Render</button>
    </div>
    <div class="controls">
      <label><input type="checkbox" id="lblCells"  /> cells</label>
      <label><input type="checkbox" id="lblStreets"  /> streets</label>
      <label><input type="checkbox" id="lblCities" checked /> cities</label>
      <label><input type="checkbox" id="lblIsolated" /> isolated cities</label>
    </div>
    <div id="tstatus" class="status"></div>
    <div id="tboard"></div>
  </div>
	`;
	dPage.innerHTML = html;
	const select = document.getElementById('tessagon');
	for (const name of Object.keys(TessagonTypes).sort()) {
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		select.appendChild(opt);
	}
	mBy('tcols').value = 3;
	mBy('trows').value = 2;
	select.value = 'HexTessagon';

	const patternSelect = document.getElementById('tpattern');
	const PATTERN_PALETTE = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];

	function refreshPatterns() {
		patternSelect.innerHTML = '';
		const klass = TessagonTypes[select.value];
		const n = klass && typeof klass.num_color_patterns === 'function' ? klass.num_color_patterns() : 0;
		for (let i = 1; i <= n; i++) {
			const opt = document.createElement('option');
			opt.value = i;
			opt.textContent = 'Pattern ' + i;
			patternSelect.appendChild(opt);
		}
		patternSelect.disabled = n === 0;
	}
	select.addEventListener('change', refreshPatterns);
	refreshPatterns();

	function renderTessagon() {
		const name = select.value;
		let H = parseInt(document.getElementById('tcols').value, 10);
		let V = parseInt(document.getElementById('trows').value, 10);
		let [h_cyclic, v_cyclic] = [false, false];
		//if (name.toLowerCase().includes('weave')) [H,V,h_cyclic,v_cyclic] = [5,5,true,true];

		const buildOpts = { H, V, h_cyclic, v_cyclic };
		const cp = parseInt(patternSelect.value, 10);
		if (!isNaN(cp) && cp > 0) {
			buildOpts.color_pattern = cp;
		}

		const board = buildTessellation(name, buildOpts);
		const container = document.getElementById('tboard');
		const svg = renderHexBoard(board, container, { strokeWidth: '0.004', palette: PATTERN_PALETTE });
		const streets = addStreetsToTessellation(board, svg);
		const cities = addCitiesToTessellation(board, svg);

		let thresh=2;
		const showIsolated = V>thresh?false:document.getElementById('lblIsolated').checked;
		const labelOpts = {
			labelCells: V>thresh?false:document.getElementById('lblCells').checked,
			labelStreets: V>thresh?false:document.getElementById('lblStreets').checked,
			labelCities: V>thresh?false:document.getElementById('lblCities').checked,
			showIsolatedCities: showIsolated
		};
		addLabels(board, svg, labelOpts);
		if (showIsolated) {
			addCities(board, svg, { showIsolatedCities: true });
		}

		const status = document.getElementById('tstatus');
		const stats = neighborStats(board);
		console.log(stats);
		status.textContent = board.faces.length + ' cells, ' + streets.length +
			' streets, ' + cities.length + ' cities, ' + stats.min + '-' + stats.max +
			' neighbors per cell built from a ' + H + ' x ' + V +
			' ' + name + ' patch.';
	}

	document.getElementById('trender').addEventListener('click', renderTessagon);
	renderTessagon();

}
async function test0_board() { 
	let d=mDom('dPage',{},{id:'board'});
	showBoard(d);
}
function test0_board() {
	//let el = mBy('dTest1'); if (el) el.remove();
	let d=mDom('dPage',{},{id:'board'});
	const container = document.getElementById('board');
	const board = buildHexBoard(4);
	const svg = renderHexBoard(board, container, {
		onCellClick: idx => {
			const [x, y] = board.centers[idx];
			const [col, row] = board.axial[idx];
			console.log(x, y, col, row);
		}
	});
	const streets = addStreets(board, svg, {
		onStreetClick: street => {
			const [xa, ya] = board.centers[street.i];
			const [xb, yb] = street.j === null ? [] : board.centers[street.j];
			console.log('street', street.i, street.j, street.outer, xa, ya, xb, yb);
		}
	});
	const cities = addCities(board, svg, {
		showIsolatedCities: document.getElementById('lblIsolated') &&
			document.getElementById('lblIsolated').checked,
		onCityClick: city => {
			console.log('city', city.v, city.x, city.y, 'cells', city.cells.join(','));
		}
	});
	addLabels(board, svg, {
		labelCells: !document.getElementById('lblCells') ||
			document.getElementById('lblCells').checked,
		labelStreets: !document.getElementById('lblStreets') ||
			document.getElementById('lblStreets').checked,
		labelCities: !document.getElementById('lblCities') ||
			document.getElementById('lblCities').checked,
		showIsolatedCities: document.getElementById('lblIsolated') &&
			document.getElementById('lblIsolated').checked
	});

	const status = document.getElementById('status');
	if (status) {
		status.textContent = board.faces.length + ' cells, ' +
			streets.length + ' streets, ' + cities.length + ' cities built from a ' +
			board.H + ' x ' + board.V + ' HexTessagon patch.';
	}
}

//#region colors
async function test0_palettes() {
	for (const k in palettes) {
		let list = palettes[k];
		mDom('dPage', {}, { html: k }); //mLinebreak('dPage',10);
		showPalette('dPage', list, true);
	}
}
async function test0_palmix3() {
	for (const space of ['linear', 'lab', 'oklab', 'hsl', 'lch', 'oklch', 'rgb']) {
		mDom('dPage', {}, { html: space }); //mLinebreak('dPage',10);
		let list = palVariety(2, ['yellow','red','green','indigo'], space, false);
		//console.log(list);
		//list = list.map(x=>justDark(x));
		showPalette('dPage', list, true);
	}
}
async function test0_palmix2() {
	for (const space of ['linear', 'lab', 'oklab', 'hsl', 'lch', 'oklch', 'rgb']) {
		mDom('dPage', {}, { html: space }); //mLinebreak('dPage',10);
		let list = palVariety(2, ['lime', 'microsoft_blue', 'indigo'], space, false);
		console.log(list);
		showPalette('dPage', list, true);
	}
}
async function test0_palmix1() {
	for (const space of ['linear', 'lab', 'oklab', 'hsl', 'lch', 'oklch', 'rgb']) {
		mDom('dPage', {}, { html: space }); //mLinebreak('dPage',10);
		let list = palVariety(2, ['yellow', 'red', 'microsoft_blue'], space, false);
		console.log(list);
		showPalette('dPage', list, true);
	}
}
async function test0_palmix() {
	let res = palMix("#ff0000", "#ffff00", 5, 'hsl', true);
	console.log(res);
	showPalette('dPage', res.slice(0, 608));
	mLinebreak('dPage');
	let list = palVariety(2, ['yellow', 'red', 'primary_blue']);
	console.log(list);
	showPalette('dPage', list, true);
	let drev = ColorByHex = reverseDict(ColorByName);
	for (const space of ['linear', 'lab', 'oklab', 'hsl', 'lch', 'oklch', 'rgb']) {
		mDom('dPage', { marginTop: 10 }, { html: space });
		let c = clrMix("#ffff00", "#00ffff", .5, space);
		console.log(c, clrName(c));
		showPalette('dPage', [c], true);
		c = clrMix("#ffff00", "#0000ff", .5, space);
		console.log(c, clrName(c));
		showPalette('dPage', [c], true);
		c = clrMix("#ffff00", "#ff00ff", .5, space);
		console.log(c, clrName(c));
		showPalette('dPage', [c], true);
		c = clrMix("#00ff00", "#0000ff", .5, space);
		console.log(c, clrName(c));
		showPalette('dPage', [c], true);
	}
}
async function test0_sort() {
	let drev = ColorByHex = reverseDict(ColorByName);
	let list = Object.keys(drev);
	const grid = mDom('dPage', { gridCols: [5, 4], p: 16, minHeight: 200 });
	list = list.filter(x => {
		let [h, s, l] = clrHexToHsl(x);
		return s > 75 && l > 25 && l < 75;
	});
	list = sortColors(list, clrDistanceOklab);
	//let d1 = mDom(grid);
	showPalette(grid, list.slice(0, 608));
}
async function test0_closest() {
	let funcs = [clrDistanceRgb, clrDistanceLab, clrDistanceOklab, clrDistanceHsl, clrDistanceCiede2000];
	let drev = ColorByHex = reverseDict(ColorByName);
	let list = Object.keys(drev);
	for (const i of range(120)) {
		//let d = mDom('dPage', { gridCols: [funcs.length, 2] });
		const grid = mDom('dPage', { gridCols: [5, 12], p: 16, minHeight: 20 });
		let hex = clrRand();
		for (const f of funcs) {
			let hexClosest = clrClosest(hex, list, f);
			let h1 = clrBestBy(hex, list, clrContrastRatio);   // readability contrast
			let h2 = clrBestBy(hex, list, clrLightnessContrast); // light/dark separation
			let h3 = clrBestBy(hex, list, clrHueContrast);       // complementary hue
			let h4 = clrBestBy(hex, list, clrContrast);       // complementary hue
			let hexFurthest = clrMaxContrast(hex, list, f);
			let d1 = mDom(grid);
			mDom(d1, {}, { html: f.name });
			showPalette(d1, [hex, hexClosest, h1, h2, h3, h4, hexFurthest]);
		}
	}
}
async function test0_closest() {
	let funcs = [clrDistanceRgb, clrDistanceLab, clrDistanceOklab, clrDistanceHsl, clrDistanceCiede2000];
	let drev = ColorByHex = reverseDict(ColorByName);
	let list = Object.keys(drev);
	for (const i of range(120)) {
		//let d = mDom('dPage', { gridCols: [funcs.length, 2] });
		const grid = mDom('dPage', { gridCols: [5, 12], p: 16, minHeight: 20 });
		let hex = clrRand();
		for (const f of funcs) {
			let hexClosest = clrClosest(hex, list, f);
			let h1 = clrBestBy(hex, list, clrContrastRatio);   // readability contrast
			let h2 = clrBestBy(hex, list, clrLightnessContrast); // light/dark separation
			let h3 = clrBestBy(hex, list, clrHueContrast);       // complementary hue
			let h4 = clrBestBy(hex, list, clrContrast);       // complementary hue
			let hexFurthest = clrMaxContrast(hex, list, f);
			let d1 = mDom(grid);
			mDom(d1, {}, { html: f.name });
			showPalette(d1, [hex, hexClosest, h1, h2, h3, h4, hexFurthest]);
		}
	}
}
async function test0_dist() {
	let funcs = [clrDistanceRgb, clrDistanceLab, clrDistanceOklab, clrDistanceHsl, clrDistanceCiede2000];
	let drev = ColorByHex = reverseDict(ColorByName);
	//let d = mDom('dPage', { gridCols: [funcs.length, 2] });
	const grid = mDom('dPage', { gridCols: [5, 12], p: 16, minHeight: 200 });
	for (const f of funcs) {
		console.log(f.name);
		// let list = sortColors(Object.keys(drev).slice(0,100), f);
		let list = sortColors(Object.keys(drev), f);
		let d1 = mDom(grid);
		showPalette(d1, list);
	}
}
async function test0_gridCols() {
	// 1. Create container and apply gridCols layout
	const grid = mDom('dPage', {
		gridCols: [5, 12], // 5-column grid with 12px gap
		p: 16,
		minHeight: 200
	});

	// 2. Generate 5 columns with random colors using clrRandom
	for (let i = 1; i <= 5; i++) {
		const bg = rColor();

		mDom(grid, {
			bg: bg,
			center: true,
			r: 8,
			fg: '#ffffff',
			p: 12
		}, { html: `Col ${i}` });
	}
}
async function test0_allColors() {
	let cAll = Object.keys(ColorByName);
	console.log('all', cAll.length);
	let drev = ColorByHex = reverseDict(ColorByName);
	cVals = Object.keys(drev);
	console.log('cVals', cVals.length);
	let dup = findDuplicateValuesInDict(ColorByName);
	console.log('dup', dup);

	let cHex = Object.keys(ColorByHex);
	console.log('cHex', cHex.length);
	let dupNames = findDuplicateValuesInDict(ColorByHex);
	console.log('dupNames', dupNames);
	//return;
	let cs = sortColorsByLabDistance(Object.keys(ColorByHex));
	console.log('all', cAll.length, cs.length)
	let c = cs.filter(x => {
		let [h, s, l] = clrHexToHsl(x);
		return s > 75 && l > 25 && l < 75;
	});
	console.log('filtered', c.length)
	showPalette('dPage', cs);
}
async function test0_bga() {
	await loadAssets();
	console.log(M);
	UI = createBgaLayout('dPage');
	console.log(UI);
	let parent = UI.mainTable;

	// Automatically fits cards into the available width (min width 140px)
	const boardArea = mDom(parent, { gridAuto: [140, 10], w: '100%' });
}
async function test0_rColor() {
	let bg = '#ff0000';//rColor();
	console.log(clrHexToHsl(bg));
	//console.log(bg);return;
	let list = ['indigo', 'violet_ryb', 'deeppink', 'huawei_red', 'tangerine', 'microsoft_yellow', 'banana', 'buttercup_yellow', 'light_chartreuse', 'spanish_green', 'light_blue_silk', 'light_aqua', 'sky_blue', 'persian_blue']
	list = ['indigo', 'violet_ryb', 'deeppink', 'huawei_red', 'tangerine', 'microsoft_yellow', 'banana', 'buttercup_yellow', 'light_chartreuse', 'spanish_green', 'light_blue_silk', 'new_bridge', 'microsoft_blue', 'persian_blue']
	list = ['indigo', 'deeppink', 'tangerine', 'microsoft_yellow', 'buttercup_yellow', 'spanish_green', 'light_blue_silk', 'microsoft_blue', 'persian_blue']
	list = ['red', 'buttercup_yellow', 'lime', 'spanish_green', 'microsoft_blue', 'zaffre', 'indigo'];

	let anchors = list.map(x => ColorByName[x]); //['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
	let pal = palVariety(bg, 25, anchors); console.log(pal);

	showPalette('dPage', pal);
}
async function _test0_bga() {
	await loadAssets();
	console.log(M);
	UI = createBgaLayout('dPage');
	console.log(UI);
	let parent = UI.mainTable;

	// Automatically fits cards into the available width (min width 140px)
	const boardArea = mDom(parent, { gridAuto: [140, 10], w: '100%' });

	// Or automatically creates an even N-item grid given an array of items
	let items = [];
	let n = 20;
	for (const i of range(n)) { items.push('card' + i) }
	//const items = ['card1', 'card2', 'card3', 'card4', 'card5'];
	const grid = mDom(parent, { gridUniform: [items.length, 12], w: '100%' });

	// Pick a random HSL color with Lightness locked to 50% and Alpha fixed at 100%
	let bg = rColor(); console.log(bg)

	// Produce 5 colors from red (#ff0000) spreading Lightness from 20% to 80%
	let colors = palFrom(bg, n, 'hsl', { h: [0, 320] });

	console.log('colors', colors);

	for (const [i, item] of items.entries()) {
		console.log(i, item);
		mDom(grid, { bg: colors[i] }, { html: item });
	}

}

//#region test0 colors
async function test0_palPerf() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	//let filename = '../assets/img/beach/beach1.jpg';
	let dir = '../assets/img/tierspiel/';
	let n = 4;
	let [tGemini, tClaude, tColorthief, tMostDifferent] = [0, 0, 0, 0];
	let res = await mGetFiles(dir.slice(3));
	console.log(res);//return;

	let funcs = {
		gem: { t: 0, f: palGemini, params: [n, 50] },
		claude: { t: 0, f: palClaude, params: [n] },
		diff: { t: 0, f: palMostDifferent, params: [n, 1000] }
	};
	let keys = ['gem', 'claude', 'diff'], ikey = 0;
	// for (const f of ['beach0.jpg', 'beach1.jpg', 'beach2.jpg', 'beach3.jpg', 'beach4.jpg']) {
	for (const f of res.files.slice(2)) { //['beach0.jpg', 'beach1.jpg', 'beach2.jpg', 'beach3.jpg', 'beach4.jpg']) {

		let filename = dir + f;
		let { w, h, img } = await loadImage(filename);
		console.log(w, h);
		mLinebreak(dParent, 20); mAppend(dParent, img); mLinebreak(dParent);
		let t, colors;

		ikey = (ikey + 1) % keys.length;
		for (let i = 0; i < keys.length; i++) {
			let o = funcs[keys[(i + ikey) % keys.length]];
			//console.log(o.t, o.f.name, o.params);
			mLinebreak(dParent, 5);
			t = Date.now();
			colors = o.f(img, ...o.params);
			o.t += Date.now() - t;
			mDom(dParent, {}, { html: o.f.name });
			for (const c of colors) {
				let name = clrName(c);
				let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
			}
		}

	}
	console.log('mostDifferent', funcs.diff.f.name, funcs.diff.t);
	console.log('gemini', funcs.gem.f.name, funcs.gem.t);
	console.log('claude', funcs.claude.f.name, funcs.claude.t);
	console.log('colorThief', tColorthief);

}
async function _test0_palFromImage() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	//let filename = '../assets/img/beach/beach1.jpg';
	let dir = '../assets/img/beach/';
	let n = 7;
	let [tGemini, tClaude, tColorthief, tMostDifferent] = [0, 0, 0, 0];
	let res = await mGetFiles(`assets/img/beach`);
	console.log(res);//return;


	// for (const f of ['beach0.jpg', 'beach1.jpg', 'beach2.jpg', 'beach3.jpg', 'beach4.jpg']) {
	for (const f of res.files.slice(2)) { //['beach0.jpg', 'beach1.jpg', 'beach2.jpg', 'beach3.jpg', 'beach4.jpg']) {
		let filename = dir + f;
		let { w, h, img } = await loadImage(filename);
		//let scale = Math.min(1000 / w, 1000 / h);
		//w *= scale; h *= scale;
		console.log(w, h);
		//mStyle(img, { w, h, fit: 'cover' });
		mLinebreak(dParent, 20);
		mAppend(dParent, img); mLinebreak(dParent);
		let t, colors;

		mLinebreak(dParent, 5);
		t = Date.now();
		colors = colorPaletteFromImage(img, n)
		t = Date.now() - t;
		tColorthief += t;
		for (const c of colors) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}

		mLinebreak(dParent, 5);
		t = Date.now();
		colors = palGemini(img, n, 50);
		t = Date.now() - t;
		tGemini += t;
		for (const c of colors) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}

		mLinebreak(dParent, 5);
		t = Date.now();
		colors = palClaude(img, n);
		t = Date.now() - t;
		tClaude += t;
		for (const c of colors) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}

		mLinebreak(dParent, 5);
		t = Date.now();
		colors = palMostDifferent(img, n, 100);
		t = Date.now() - t;
		tMostDifferent += t;
		for (const c of colors) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}

	}
	console.log('mostDifferent', tMostDifferent);
	console.log('gemini', tGemini);
	console.log('claude', tClaude);
	console.log('colorThief', tColorthief);

}
async function test0_palMix() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	let [k1, k2] = rChoose(SpecialKeys, 2);
	let t1 = await sampleSvgText(k1);
	let t2 = await sampleSvgText(k2);
	let list1 = palFromText(t1);
	let list2 = palFromText(t2);
	let t11 = clrReplaceCycle(t1, list2);
	let t22 = clrReplaceCycle(t2, list1);
	let label = k2;
	for (const t of [t1, t2, t11, t22]) {
		let d = mDom(dParent);
		showSvgTextAsImage(t, d, { w: 100, h: 100 });
		mDom(d, { align: 'center' }, { html: label = label == k1 ? k2 : k1 });
	}

	mLinebreak(dParent);
	let color = rChoose(Object.keys(ColorByName));//'primary_orange';// '#ffff00';//clrPrimary('blue');
	mDom(dParent, { w100: true, align: 'center', bg: clrHex(color) }, { html: color });

	for (const space of Object.keys(CLR_SPACES)) { //} ['lab', 'hsl', 'lch', 'rgb']) {
		let list = palMix('white', color, 5, space).concat(palMix(color, 'black', 5, space).slice(1));
		console.log(list);
		mLinebreak(dParent); mDom(dParent, {}, { html: space }); mLinebreak(dParent);
		for (const c of list.slice(1)) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}
	}

	for (const space of ['hsl', 'lch', 'oklch']) { //} ['lab', 'hsl', 'lch', 'rgb']) {
		let list = palShade(color, 9, space);
		console.log(list);
		mLinebreak(dParent); mDom(dParent, {}, { html: space }); mLinebreak(dParent);
		for (const c of list.slice(1)) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}
	}
}
async function test0_emoreplace() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	let [k1, k2] = rChoose(SpecialKeys, 2);
	let t1 = await sampleSvgText(k1);
	let t2 = await sampleSvgText(k2);
	let list1 = palFromText(t1);
	let list2 = palFromText(t2);
	let t11 = clrReplaceCycle(t1, list2);
	let t22 = clrReplaceCycle(t2, list1);
	let label = k2;
	for (const t of [t1, t2, t11, t22]) {
		let d = mDom(dParent);
		showSvgTextAsImage(t, d, { w: 100, h: 100 });
		mDom(d, { align: 'center' }, { html: label = label == k1 ? k2 : k1 });
	}

	mLinebreak(dParent);
	let color = rChoose(Object.keys(ColorByName));//'primary_orange';// '#ffff00';//clrPrimary('blue');
	mDom(dParent, { w100: true, align: 'center', bg: clrHex(color) }, { html: color });

	for (const space of Object.keys(CLR_SPACES)) { //} ['lab', 'hsl', 'lch', 'rgb']) {
		let list = palMix('white', color, 5, space).concat(palMix(color, 'black', 5, space).slice(1));
		console.log(list);
		mLinebreak(dParent); mDom(dParent, {}, { html: space }); mLinebreak(dParent);
		for (const c of list.slice(1)) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}
	}

	for (const space of ['hsl', 'lch', 'oklch']) { //} ['lab', 'hsl', 'lch', 'rgb']) {
		let list = palShade(color, 9, space);
		console.log(list);
		mLinebreak(dParent); mDom(dParent, {}, { html: space }); mLinebreak(dParent);
		for (const c of list.slice(1)) {
			let name = clrName(c);
			let d = mDom(dParent, { w: 160, align: 'center', bg: c, padding: 12, fg: clrText(c) }, { html: c });
		}
	}
}
async function test0_emos() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	for (const k of SpecialKeys) {
		let text = await sampleSvgText(k);
		let d = mDom(dParent);
		showSvgTextAsImage(text, d, { w: 100, h: 100 });
		mDom(d, {}, { html: k });

	}
}
async function test0_shiftColors() {
	let text = await sampleSvgText('owl');
	//let svg2 = clrReplace(text, h => clrShiftH(h,80));

	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	showSvgTextAsImage(text, dParent, { w: 200, h: 200 });
	for (const hue of [-180, -120, -60, 60, 120]) {
		let svg2 = clrReplace(text, h => clrShiftH(h, hue + 30));
		showSvgTextAsImage(svg2, dParent, { w: 200, h: 200 });
	}
	//showSvgTextAsImage(svg2, dParent, { w: 200, h: 200 })
}
async function test0_lab() {
	let findName = makeColorFinder(ColorByHex);   // once
	let text = await sampleSvgText('owl');
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	let svg2 = clrReplace(text, h => findName(h));
	showSvgTextAsImage(text, dParent, { w: 200, h: 200 })
	showSvgTextAsImage(svg2, dParent, { w: 200, h: 200 })
}
async function test0_grid4() {
	let gl4 = clrBuildGrid(ColorByHex, 4);
	let gl5 = clrBuildGrid(ColorByHex, 5);
	let gl6 = clrBuildGrid(ColorByHex, 6);
	let gr4 = clrBuildGridRgb(ColorByHex, 4);
	let gr5 = clrBuildGridRgb(ColorByHex, 5);
	let gr6 = clrBuildGridRgb(ColorByHex, 6);
	console.log(gl4.length, gl5.length, gl6.length, gr4.length, gr5.length, gr6.length);

	let text = await sampleSvgText('owl');
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	showSvgTextAsImage(text, dParent, { w: 200, h: 200 })
	let outl4 = clrReplace(text, hex => clrClosestFast(hex, gl4, 4));
	showSvgTextAsImage(outl4, dParent, { w: 200, h: 200 });
	let outl5 = clrReplace(text, hex => clrClosestFast(hex, gl5, 5));
	showSvgTextAsImage(outl4, dParent, { w: 200, h: 200 });
	let outl6 = clrReplace(text, hex => clrClosestFast(hex, gl6, 6));
	showSvgTextAsImage(outl6, dParent, { w: 200, h: 200 });
	let outr4 = clrReplace(text, hex => clrClosestFast(hex, gr4, 4));
	showSvgTextAsImage(outr4, dParent, { w: 200, h: 200 });
	let outr5 = clrReplace(text, hex => clrClosestFast(hex, gr5, 5));
	showSvgTextAsImage(outr4, dParent, { w: 200, h: 200 });
	let outr6 = clrReplace(text, hex => clrClosestFast(hex, gr6, 6));
	showSvgTextAsImage(outr6, dParent, { w: 200, h: 200 });


}
async function test0_replaceColorsInSvg1() {
	let text = await sampleSvgText('owl');
	let out = clrReplace(text, hex => clrWarmer(hex));
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	showSvgTextAsImage(text, dParent, { w: 200, h: 200 })
	showSvgTextAsImage(out, dParent, { w: 200, h: 200 })
}
async function test0_colorgrid() {
	let grid = clrBuildGrid(ColorByHex);
	console.log(grid);
}
async function test0_replaceColorsInSvg0() {
	let text = await sampleSvgText('owl');
	//console.log(text);
	let parts = text.split('fill:');
	for (const p of parts) {
		let ctext = stringBefore(p, ';');
		let result = clrHex(ctext);
		//console.log(ctext,result);
	}
	// also replace all incidents of stop-color: bis '"'
	parts = text.split('stop-color:');
	let text1 = parts[0];
	let di = {};
	for (const p of parts.slice(1)) {
		let hex = p.slice(0, 7);
		//is this hex in colorByHex?
		let name = ColorByHex[hex] || emoColorNames[hex.toLowerCase()];
		if (!name) {
			name = clrClosestName(hex, ColorByHex);
			console.log('closest', name);
			di[hex] = name;
		} else {
			console.log('found', name);
		}
		if (name) {
			text1 += +'stop-color:' + name + p.slice(7);
			continue;
		}
	}
	//return;
	let text2 = replaceSvgFills(text, val => strToNewHex(val));
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	showSvgTextAsImage(text, dParent, { w: 200, h: 200 })
	showSvgTextAsImage(text2, dParent, { w: 200, h: 200 })
	console.log(di);
}
async function test0_colordis() {
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	let total = Object.keys(ColorByName).length; console.log(total);
	let cnt = 0;
	for (const hex in emoColorNames) {
		let name = emoColorNames[hex];
		let [bg, bg1] = [ColorByName[name], hex];
		if (bg == bg1) continue;
		let d = mDom(dParent, { align: 'center', w: 200, padding: 2, bg }, { html: bg });
		let d1 = mDom(dParent, { align: 'center', w: 200, padding: 2, bg: bg1 }, { html: bg1 });
		mLinebreak(dParent);
		cnt++;
	}
	console.log(cnt);
}
async function test0_addColors() {
	for (const k in dicolorFlatNames) {
		let name = dicolorFlatNames[k];
		if (isdef(ColorByName[name])) continue;
		ColorByHex[k] = name;
		ColorByName[name] = k;
	}
	console.log(ColorByHex);
	console.log(ColorByName);
}
async function test0_colors() {
	let txt = await loadText('common/colors.yaml');
	console.log(txt);
	let lines = txt.split('\n');
	let byName = {}, byHex = {};
	for (let line of lines) {
		let parts = line.split(':');
		let name = parts[0].trim();
		let hex = parts[1].trim();
		//console.log(name,hex);
		byName[name] = hex;
		byHex[hex] = name;
	}
	console.log(byName);
	console.log(byHex);
}
async function test0_primary() {
	// by rgb dominance:
	let dom1 = 'green blue red';
	let dom2 = 'yellow cyan magenta';
	let dom3 = 'grey';
	//by hue dominance:
	let prim = 'blue green yellow red grey';
	let sec = 'bluegreen orange pink violet brown beige lime cyan magenta';

	let loc = window.location.href;
	console.log(loc);
	let project = getDA('project');
	console.log(DA);
	let M = await loadYaml('y/m.yaml');
	console.log(M);
}
async function test0_emoColors() {
	//showColor('dPage','red');
	let text = '';
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	for (const k in emoColorNames) {
		let hex = k;
		let name = emoColorNames[k];
		let result = ColorByName[name];
		//console.log(k,emoColorNames[k],colorByName[emoColorNames[k]]);
		let d = mDom(dParent, { align: 'center', w: 200, padding: 2, bg: k }, { html: k });
		let d1 = mDom(dParent, { align: 'center', w: 200, padding: 2, bg: result }, { html: result });
		if (k == result) console.log('same: ', name);
		text += '\n' + name + ': ' + k + ' ' + result;
		mLinebreak(dParent);
	}
	downloadAsText(text, 'test0_emoColors.txt');
}
async function test0_colorByName() {
	//showColor('dPage','red');
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	for (const k in ColorByName) {
		let d = mDom(dParent, { align: 'center', w: 200, padding: 2, bg: ColorByName[k] }, { html: k });
	}
}
async function test0_svgColors() {
	let svg = await sampleSvgText('owl');

	let colors = svgGetFillColorsFromText(svg);
	console.log(colors);

	showSvgTextAsImage(svg, 'dPage')
	//console.log(svg); //

	let c = w3color(colors[0], mBy('dPage'));
	console.log(c);

}

async function test0() {
	await loadAssetsStaticPreload();
	console.log(M);
	let o = M.emo.ambulance;
	let part = stringBefore(o.uni, '_');
	console.log(part);
	let fname = `../assets/svg/emoji_u${part}.svg`;
	let fname1 = `${DA.staticUrl}/assets/svg/emoji_u${part}.svg`;
	let svg1 = await loadStaticText(`assets/svg/emoji_u${part}.svg`);
	let d = mDom('dPage');
	d.innerHTML = `<svg style="width:50%;height:50%" viewBox="0 0 ${o.sz} ${o.sz}"><use href="${fname}" /></svg>`;
	d = mDom('dPage', {}, { html: fname });
	d.innerHTML = `<svg style="width:25%;height:25%" viewBox="0 0 ${o.sz} ${o.sz}"><use href="${fname}" /></svg>`;
	// d.style.backgroundImage=`url(${svg})`;
	// d.style.backgroundSize='100% 100%';
	// d.style.backgroundRepeat='no-repeat';
	// d.style.backgroundPosition='center';

}












async function test0_legacy() {
	create_card_assets_c52();
	await loadAssetsStaticPreload();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await reloadTables();
	await switchToUser(); // da wird M.users geladen!
	//DA.menu = 'games';
	await switchToMenu();
	await pollInit();
}
