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
	select.value = 'DissectedCrossStarBoardTessagon';

	function renderTessagon() {
		const name = select.value;
		const U = parseInt(document.getElementById('tcols').value, 10);
		const V = parseInt(document.getElementById('trows').value, 10);

		const board = buildTessellation(name, { U, V });
		const container = document.getElementById('tboard');
		const svg = renderHexBoard(board, container, { strokeWidth: '0.004' });
		const streets = addStreetsToTessellation(board, svg);
		const cities = addCitiesToTessellation(board, svg);

		const status = document.getElementById('tstatus');
		const stats = neighborStats(board);
		console.log(stats);
		status.textContent = board.faces.length + ' cells, ' + streets.length +
			' streets, ' + cities.length + ' cities, ' + stats.min + '-' + stats.max +
			' neighbors per cell built from a ' + U + ' x ' + V +
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

	const board = buildTessellation('HexTessagon', { U: 6, V: 4, random: mulberry32(1) });
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
		onCityClick: city => {
			console.log('city', city.v, city.x, city.y, 'cells', city.cells.join(','));
		}
	});

	const status = document.getElementById('status');
	if (status) {
		status.textContent = board.faces.length + ' cells, ' +
			streets.length + ' streets, ' + cities.length + ' cities built from a ' +
			board.U + ' x ' + board.V + ' HexTessagon patch.';
	}
}




