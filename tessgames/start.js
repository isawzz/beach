onload = start();

function start() { test1(); }


function test1() {
	let el = mBy('dTest0'); if (el) el.remove();
	const select = document.getElementById('tessagon');
	for (const name of Object.keys(TessagonTypes)) {
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		select.appendChild(opt);
	}

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




