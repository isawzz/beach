onload = start();

function start() { test1(); }

function test1() {
	let el = mBy('dTest0'); if (el) el.remove();
	const select = document.getElementById('tessagon');
	for (const name of Object.keys(TessagonTypes).sort()) {
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		select.appendChild(opt);
	}
	mBy('tcols').value = 2;
	mBy('trows').value = 2;
	select.value = 'SpecialStarTessagon';

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

function test2() {
	let el = mBy('dTest2'); if (el) el.remove();

	function mulberry32(a) {
		return function () {
			a |= 0; a = (a + 0x6D2B79F5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	const board = buildTessellation('HexTessagon', { H: 6, V: 4, random: mulberry32(1) });
	const ser = serializeBoard(board);

	ser.verts = ser.verts.map(v => v.map(p => Number(p.toFixed(3))));
	downloadAsYaml(ser, 'board');
	const reloaded = deserializeBoard(JSON.parse(JSON.stringify(ser)));

	const rows = document.createElement('div');
	rows.id = 'dTest2';
	rows.style.display = 'grid';
	rows.style.gridTemplateColumns = '1fr 1fr';
	rows.style.gap = '1rem';
	document.body.appendChild(rows);

	function renderOne(title, b) {
		const col = document.createElement('div');
		const h = document.createElement('h3');
		h.textContent = title;
		col.appendChild(h);
		rows.appendChild(col);
		const svg = renderHexBoard(b, col, { strokeWidth: '0.004' });
		addStreetsToTessellation(b, svg);
		addCitiesToTessellation(b, svg);
	}
	renderOne('original', board);
	renderOne('reloaded', reloaded);

	const same = JSON.stringify(reloaded.adj) === JSON.stringify(board.adj);
	const status = document.createElement('div');
	status.className = 'status';
	status.textContent = 'original: ' + board.faces.length + ' cells, ' + board.streets.length +
		' streets, ' + board.cities.length + ' cities; reloaded: ' + reloaded.faces.length +
		' cells, ' + reloaded.streets.length + ' streets, ' + reloaded.cities.length +
		' cities, ' + Object.keys(reloaded.adj).length + ' adj entries (serialized ' +
		JSON.stringify(ser).length + ' bytes), adj identical: ' + same;
	document.body.insertBefore(status, rows);

	console.log('test2 serialize round trip', same, reloaded.faces.length, 'cells,', reloaded.streets.length, 'streets,', reloaded.cities.length, 'cities');
}

function test0() {
	let el = mBy('dTest1'); if (el) el.remove();
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




