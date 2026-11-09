onload = start; VERBOSE = false; TESTING = false; DEV = false; POLLING = true;

function start() { test0_gameTopdown(); }

async function test0_gameTopdown1(){
	await loadAssets();
	let dMenu = mDom('dMenu', { flexCenterTop: 1 });


}
async function test0_gameTopdown(){
	await loadAssets();
	let dMenu = mDom('dPage',{flexCenterTop:1});
	for(const [key,val] of Object.entries(M.config.games)){
		console.log(key, val);
		let d=msEmo(dMenu, { label: key, w: 100, h: 100 });

	}

}
async function test0_mKeyFromScratch() {
	//console.log([30, 50, 64, 96, 125, 200].reverse());return;
	await loadAssets();
	const dParent = mDom('dPage', { m: 30, justifyContent: 'center', display: 'flex', gap: 4, flexWrap: 'wrap' });
	let texture = '../assets/texwall/water.jpg';
	for (const k of rChoose(Meeples, 5)) {//}.concat(['hex','square','circle'])){
		console.log(k);
		let emo = M.emo[k]; if (!emo) continue;
		console.log(emo);
		for (const sz of [30, 50, 64, 96, 125, 200, 500].reverse()) {
			let [w, h] = [sz, sz];
			//let label = coin(90) ? k : null;

			msMeeple(k, dParent, { w, h });

			//woher kommt die color?
			msMeeple(k, dParent, { w, h, depth:0, texture:null, color:rColor() });
			// msMeeple(k, dParent, { w, h, depth: w / 4, color: rColor(), blend: 'overlay' });
			//msEmo(k, dParent, { round:1, bfg: rColor(), label, w, h }); //emo presentation

		}
	}
}
async function test0_mKeyWithShape() {
	await loadAssets();
	const dParent = mDom('dPage', { m: 30, justifyContent: 'center', display: 'flex', gap: 4, flexWrap: 'wrap' });
	//console.log('existing shapes', M.shapeKeys.length);
	for (const k of rChoose(Meeples, 5)) {//}.concat(['hex','square','circle'])){
		//let sh = M.shapes[k];
		console.log(k)
		//let prefer = rChoose(['shape','meeple','emoji']);
		mKey(k, dParent, { label: k, w: 100, h: 100, bg: rColor() });
	}
}
async function test0_existingShapes() {
	await loadAssets();
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	console.log('existing shapes', M.shapeKeys.length);
	for (const k of M.shapeKeys) {
		let sh = M.shapes[k];
		drawShape(sh, dParent, { label: k, w: 100, h: 100 });
	}
}
async function test0_cat() {
	await loadAssets();
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	//let text0 = await loadText('assets/svg/meeple.svg');
	//let list = await Promise.all(Meeples.map(async (x)=>await loadText('assets/svg/' + x + '.svg')));
	let svgFiles = await mGetFiles('assets/svg');
	svgFiles = svgFiles.files.filter(x => x.endsWith('.svg'));
	svgFiles = svgFiles.slice(0, 100)
	let svgs = await Promise.all(svgFiles.map(async (x) => await loadText('assets/svg/' + x)));
	console.log('svg files', svgFiles.length);
	for (const text of [getSeahorse(), getCat(), getCat1(), getCat2(), ...svgs]) {
		let key = 'cat';
		let shape = await emojiSvgToShape(text);
		//console.log('converted to shape', shape);
		drawShape(shape, dParent, { label: key, w: 100, h: 100 });
	}
}
async function test0_keyToMeeple() {
	await loadAssets();
	let listNoShapes = M.emokeys.filter(x => !M.shapes[x]);
	console.log('no shape', listNoShapes.length);
	//let listNoSvg = M.emokeys.filter(x => !M.svgs[x]);
	let listShapes = M.emokeys.filter(x => M.shapes[x]);
	console.log('with shape', listShapes.length);

	let svgFiles = await mGetFiles('assets/svg');
	svgFiles = svgFiles.files.filter(x => x.endsWith('.svg'));
	console.log('svg files', svgFiles.length);

	console.log('meeples', Meeples.length);
	assertion(Meeples.every(x => !!M.shapes[x]), 'Some meeples are missing shapes');

	//svg files but no shape
	let svgNoShape = svgFiles.filter(x => !M.shapes[x.replace('.svg', '')]);
	console.log('svg no shape', svgNoShape.length);
	console.log('svg no shape list', svgNoShape);
	let keys = svgNoShape.map(x => x.replace('.svg', ''));
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	for (const fname of svgNoShape) {
		let key = fname.replace('.svg', '');
		console.log('processing', key);
		let text = await loadText('assets/svg/' + key + '.svg');
		//console.log(text);
		let shape = await emojiSvgToShape(text);
		console.log('converted to shape', shape);
		drawShape(shape, key, dParent);
	}
	return;

	let k = rChoose(listNoShapes);
	let sh = M.shapes[k];
	if (!sh) {
		let text = await loadText('assets/svg/' + k + '.svg');
		console.log(text);

	}
	t = Date.now();
	let ds1 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let o1 = createStageX(ds1);
	o1 = drawClaudeX(o1.g, sh, k, o1.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once
	console.log('drawn shape in', Date.now() - t, 'ms');

	// let text = getSheep(); //await loadText('assets/test/sheep.svg');
	// t = Date.now();
	// let sh = await emojiSvgToShape(text);
	// console.log('converted to shape in', Date.now() - t, 'ms', sh);

}
async function test0_mKey() {
	await loadAssets();
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	let list = M.emokeys.filter(x => x.startsWith('b'));
	console.log(list.length);
	for (const k of list) {
		let path = M.images.find(x => x.includes(k));
		if (!path) continue;
		mKey(path, dParent, { bfg: clrRand(), p: 3, fz: 14, prefer: 'img', label: k });
		console.log(path);
	}
}
async function test0_mKeyWithImgSrc() {
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	let path = "../assets/img/emo/woman-construction-worker.png";
	mKey(path, dParent, { bg: clrRand(), p: 3, fz: 14, prefer: 'img' });
	console.log(path);
}
async function test0_mDomTestSrc() {
	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	let img = mDom(dParent, { bg: clrRand(), tag: 'img', src: "../assets/img/emo/alembic.png" });
	// console.log(location.href);
	// console.log(img);
}
async function test0_assignSrc() {

	const dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	const img = mDom(dParent, { tag: 'img' });
	img.src = '../assets/img/emo/alembic.png';
}
async function test0_yamlToJson() {
	await loadAssets();
	downloadAsText(JSON.stringify(M.emo), 'diemo.json');
}
async function test0_animemo() {
	await loadAssets();
	let dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	mKey('ant', dParent, { m: 10, w: 100, h: 100, prefer: 'anihover' });
	let list = M.emokeys.filter(x => M.emo[x].ani);
	console.log(list.length);
	for (const k of list) {
		mKey(k, dParent, { m: 10, w: 100, h: 100, key: k, prefer: 'anihover' });
	}

}
async function test0_keyToCleanSvg() {
	await loadAssets();
	let [w, h] = [100, 100];
	let dParent = mDom('dPage', { display: 'flex', gap: 4, flexWrap: 'wrap' });
	let key = 'copyright'; //M.emokeys.find(k => M.emo[k].uni == 'u00a9');
	for (const k of M.emokeys.slice(1, 10)) {//} ['copyright']){
		let o = M.emo[k];
		let svgFilename = emoKeyToFilename(k);
		// console.log('loading', svgFilename);
		let raw = await loadText('assets/svg/' + svgFilename);
		raw = stringAfter(raw, '-->');
		if (!raw) continue;
		let s = svgFromCode(raw);
		let d = mDom(dParent, { w, h, bg: clrRand() });
		mAppend(d, s);
		// let svgraw = document.createElementNS(SVG_NS, 'svg');
		// svgraw.innerHTML = raw;
		// mAppend(d, svgraw);

		console.log(d.firstChild);
		console.log('___', k)
		console.log('loaded', raw.length,);
		let svg = mCleanSvg(raw, { preserveAspectRatio: 'none' });
		console.log('cleaned', svg);
		let text = svg.outerHTML;
		let d1 = mDom(dParent, { w, h, bg: clrRand(), html: text });
		console.log(text.length);

	}
}
async function test0_saveCleanSvg() {
	let raw = await loadText('assets/test/meeple_raw.svg');
	console.log(raw.length);
	let t = Date.now();
	let svg = mCleanSvg(raw); //, { preserveAspectRatio: 'none' });
	console.log('extracted shapes in', Date.now() - t, 'ms', svg);
	let text = svg.outerHTML;
	console.log(text.length);
	let d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);
	downloadAsText(text, 'meeple.svg');

}
async function test0_cleanSvgToMeeple() {
	let text = getSheep(); //await loadText('assets/test/sheep.svg');
	t = Date.now();
	let sh = await emojiSvgToShape(text);
	console.log('converted to shape in', Date.now() - t, 'ms', sh);
	t = Date.now();
	let ds1 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let o1 = createStageX(ds1);
	o1 = drawClaudeX(o1.g, sh, 'YES', o1.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once
	console.log('drawn shape in', Date.now() - t, 'ms');

}
async function test0_fileToCleanSvg() {
	let raw = await loadText('assets/test/sheep.svg');
	console.log(raw.length);
	let t = Date.now();
	let svg = mCleanSvg(raw); //, { preserveAspectRatio: 'none' });
	console.log('extracted shapes in', Date.now() - t, 'ms', svg);
	let text = svg.outerHTML;
	console.log(text.length);
	let d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);

}
async function test0_mExtractShapes() {
	let dog = getElephantRaw();
	let t = Date.now();
	let svg = mCleanSvg(dog); //, { preserveAspectRatio: 'none' });
	console.log('extracted shapes in', Date.now() - t, 'ms');
	console.log(svg);
	let d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);

}
async function test0_ele() {
	let text = getElephantRaw();
	let d = mDom('dPage', { w: 200, h: 200, bg: clrRand(), html: text });
	let svg = d.firstChild;
	svg.setAttribute('preserveAspectRatio', 'none');

}
async function test0_fromRawSvg() {
	let dog = getElephantRaw();
	let t = Date.now();
	let svg = mCleanSvg(dog); //, { preserveAspectRatio: 'none' });
	console.log('extracted shapes in', Date.now() - t, 'ms');
	console.log(svg);
	let d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);

	let attr = svg.getAttribute('preserveAspectRatio');
	console.log('preserveAspectRatio before:', attr);
	let svg1 = svg.cloneNode(true);
	svg1.setAttribute('preserveAspectRatio', 'none');
	d = mDom('dPage', { w: 200, h: 200, bg: 'red' });
	mAppend(d, svg1);
}
async function test0_svgToContour() {
	let t = Date.now();
	await loadAssets();
	console.log('loaded assets in', Date.now() - t, 'ms');

	t = Date.now();
	d = mDom('dPage', { w: 200, h: 200, bg: 'blue', html: getElephant() });
	let svg = d.firstChild;

	console.log('created svg in', Date.now() - t, 'ms');

	t = Date.now();
	let sh = await emojiSvgToShape(svg);
	console.log('converted to shape in', Date.now() - t, 'ms', sh);

	t = Date.now();
	let ds1 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let o1 = createStageX(ds1);
	o1 = drawClaudeX(o1.g, sh, 'YES', o1.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once
	console.log('drawn shape in', Date.now() - t, 'ms');
}
async function test0_elephant() {
	let dog = getElephant();
	let t = Date.now();
	await loadAssets();
	console.log('loaded assets in', Date.now() - t, 'ms');
	//let svg = mExtractShapes(dog, { preserveAspectRatio: 'none' });

	// console.log('extracted shapes in', Date.now() - t, 'ms');
	d = mDom('dPage', { w: 200, h: 200, bg: 'blue', html: getElephant() });
	let svg = d.firstChild;
	//mAppend(d, svg);

	t = Date.now();
	let sh = svgToShapeSimple(svg); console.log(sh);
	console.log('converted to shape in', Date.now() - t, 'ms');
	let ds1 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let o1 = createStageX(ds1);
	o1 = drawClaudeX(o1.g, sh, 'YES', o1.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once


	t = Date.now();
	let sh1 = svgToShape(svg); console.log(sh1);
	console.log('converted to shape in', Date.now() - t, 'ms');
	d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });

	t = Date.now();
	let sh2 = emojiSvgToShape(svg); console.log(sh2);
	console.log('converted to shape in', Date.now() - t, 'ms');
	d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });

	t = Date.now();
	let d1 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let svg1 = mSvg(d1, { w: 200, h: 200, bg: 'blue', html: getElephant() });
	console.log('created svg1 in', Date.now() - t, 'ms');

	let d2 = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	let o2 = createStageX(d2);
	//let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
	let o = drawClaudeX(o2.g, sh1, 's', o2.text, { textFill: 'red', depth: 20, color: 'red' });   // draws the shape once
	return;
	console.log(svg.outerHTML);
	console.log('viewBox:', svg.getAttribute('viewBox'));
	console.log('paths:', svg.querySelectorAll('path').length);
	console.log(svg.querySelector('path')?.namespaceURI);
	console.log(svg.getAttribute('viewBox'));

	svg = mCleanSvg(getDog(), { preserveAspectRatio: 'none' });
	d = mDom('dPage', { mtop: 10, w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);
}
async function test0_dog() {
	let dog = getDog();
	let svg = mCleanSvg(dog);
	d = mDom('dPage', { w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);

	console.log(svg.outerHTML);
	console.log('viewBox:', svg.getAttribute('viewBox'));
	console.log('paths:', svg.querySelectorAll('path').length);
	console.log(svg.querySelector('path')?.namespaceURI);
	console.log(svg.getAttribute('viewBox'));

	svg = mCleanSvg(getDog(), { preserveAspectRatio: 'none' });
	d = mDom('dPage', { mtop: 10, w: 200, h: 200, bg: 'blue' });
	mAppend(d, svg);
}
async function test0_svg() {

	d = mDom(d0, { w: 200, h: 200, bg: 'blue' });
	let svg1 = mSvg(d);

	// 2. Explicit Coordinates
	d = mDom(d0, { w: 200, h: 200 });
	let svg2 = mSvg(d, { x: 0, y: 0, w: 200, h: 200, bg: 'lightgray' });

	// 3. Single Path (Auto-computes viewBox around the path)
	d = mDom(d0, { w: 200, h: 200 });
	let svg3 = mSvg(d, {
		path: "M 10 10 L 90 10 L 50 90 Z",
		fill: 'blue',
		stroke: 'darkblue',
		thickness: 2
	});

	// 4. Multiple Paths (Auto-computes viewBox across all paths)
	d = mDom(d0, { w: 200, h: 200 });
	let svg4 = mSvg(d, {
		pathlist: [
			"M 10 10 L 40 10 L 25 40 Z",
			"M 60 60 L 90 60 L 75 90 Z"
		],
		fill: 'teal'
	});

	// 5. Points List (Auto-converts to <polygon> and computes viewBox)
	d = mDom(d0, { w: 200, h: 200 });
	let svg5 = mSvg(d, {
		points: [[10, 10], [80, 20], [50, 70]], // or "10,10 80,20 50,70"
		fill: 'orange',
		stroke: 'black',
		pad: 5
	});
}

async function test1_svglib1() {
	await loadAssets();

	// let svg = mDom('dPage', { fill: 'red', w: 200, h: 200 });	mDom(svg, { w100: true, h100: true, tag: 'rect' }); //OK
	// let svg = mDom('dPage');	mDom(svg, { w:100, h:100, fill:'red', tag: 'rect' }); //OK, but svg is 300x150
	let svg = mDom('dPage', { tag: 'svg' }); mDom(svg, { w: 100, h: 100, fill: 'red', tag: 'rect' });

	// 2. Or draw a background rectangle inside the SVG
	//mDom(svg, { width: '100%', height: '100%', fill: 'red' }, { tag: 'rect', ns: 'http://www.w3.org/2000/svg' });
	console.log(svg);

}

//====================================== mDom change!!!! only opts!!!! =============================
async function _test1_svglib1() {
	await loadAssets();

	// let svg = mSvg('dPage', { fill: 'red', w: 200, h: 200 });	mSvg(svg, { w100: true, h100: true }, { tag: 'rect' }); //OK
	// let svg = mSvg('dPage');	mSvg(svg, { w:100, h:100, fill:'red' }, { tag: 'rect' }); //OK, but svg is 300x150
	let svg = mSvg('dPage', { w: 100, h: 100, fill: 'red' }, { tag: 'rect' });

	// 2. Or draw a background rectangle inside the SVG
	//mSvg(svg, { width: '100%', height: '100%', fill: 'red' }, { tag: 'rect', ns: 'http://www.w3.org/2000/svg' });
	console.log(svg);

}
async function rest() {
	let text = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" id="Dog--Streamline-Emoji" height="64" width="64">
		<path d="M59.33333333333333 15.386666666666665a9.226666666666667 9.226666666666667 0 0 0 -9.586666666666666 -2.2266666666666666 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.9333333333333331 1.9333333333333331 0 0 0 1.7333333333333334 1.44c1.92 0.13333333333333333 5.053333333333333 1.0933333333333333 3.8533333333333335 5.986666666666666a8.239999999999998 8.239999999999998 0 0 1 -4.92 6.2 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666l0.9733333333333333 4.426666666666666a1.5333333333333332 1.5333333333333332 0 0 0 0.96 1.08L10.933333333333332 28a3.84 3.84 0 0 1 2.48 3.0266666666666664l1.2533333333333332 8.213333333333333a9.493333333333332 9.493333333333332 0 0 0 1.16 3.3066666666666666l-0.9066666666666667 11.813333333333333a2.8533333333333335 2.8533333333333335 0 0 0 -2.533333333333333 2.84 1.4666666666666668 1.4666666666666668 0 0 0 1.4666666666666668 1.4666666666666668h4.946666666666666a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -0.9333333333333332l4 -9.813333333333333a18.52 18.52 0 0 0 8.92 0l4.626666666666667 -1.1466666666666665a16.2 16.2 0 0 1 5.253333333333333 -0.27999999999999997A19.159999999999997 19.159999999999997 0 0 0 44.61333333333333 49.33333333333333a6.906666666666666 6.906666666666666 0 0 1 0.9866666666666666 4.226666666666667l-0.06666666666666667 0.7999999999999999a2.8666666666666663 2.8666666666666663 0 0 0 -2.96 2.8666666666666663A1.4666666666666668 1.4666666666666668 0 0 0 44 58.666666666666664h5.333333333333333a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -1.0666666666666667l2.373333333333333 -7.88c0.88 -2.5599999999999996 -1.3333333333333333 -3.3466666666666662 -1.3333333333333333 -7.306666666666667l0.27999999999999997 -0.7599999999999999a12 12 0 0 0 -0.6399999999999999 -9.866666666666667c11.159999999999998 -0.13333333333333333 13.04 -11.786666666666665 7.986666666666666 -16.4Z" fill="#f7e5c6" stroke-width="1"></path>
		<path d="M4.1866666666666665 22.786666666666665a1.5199999999999998 1.5199999999999998 0 0 1 0.6799999999999999 -0.36L9.333333333333332 21.24l1.6533333333333333 -2.32c1.3333333333333333 -1.8 4.88 -2.786666666666666 7.093333333333334 -2.5866666666666664a6.226666666666667 6.226666666666667 0 0 1 5.6 5l0.5333333333333333 2.5999999999999996a9.053333333333333 9.053333333333333 0 0 0 0.8666666666666667 2.533333333333333 9.559999999999999 9.559999999999999 0 0 0 8.84 5.093333333333333l10.333333333333332 -0.42666666666666664a7.6933333333333325 7.6933333333333325 0 0 1 4.933333333333334 1.5199999999999998 8.186666666666666 8.186666666666666 0 0 0 4.92 -6.2 6.079999999999999 6.079999999999999 0 0 0 0 -3.5866666666666664 8.293333333333333 8.293333333333333 0 0 1 -4.92 6.186666666666666 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666Z" fill="#fff5e3" stroke-width="1"></path>
		<path d="M49.8 16.759999999999998a9.2 9.2 0 0 1 9.533333333333333 2.2399999999999998 8.36 8.36 0 0 1 2.493333333333333 4.7333333333333325 9.239999999999998 9.239999999999998 0 0 0 -12.08 -10.573333333333332 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.8666666666666665 1.8666666666666665 0 0 0 1.2799999999999998 1.3333333333333333Z" fill="#fff5e3" stroke-width="1"></path>
		<path d="M59.33333333333333 15.386666666666665a9.226666666666667 9.226666666666667 0 0 0 -9.586666666666666 -2.2266666666666666 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.9333333333333331 1.9333333333333331 0 0 0 1.7333333333333334 1.44c1.92 0.13333333333333333 5.053333333333333 1.0933333333333333 3.8533333333333335 5.986666666666666a8.239999999999998 8.239999999999998 0 0 1 -4.92 6.2 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666l0.9733333333333333 4.426666666666666a1.5333333333333332 1.5333333333333332 0 0 0 0.96 1.08L10.933333333333332 28a3.84 3.84 0 0 1 2.48 3.0266666666666664l1.2533333333333332 8.213333333333333a9.493333333333332 9.493333333333332 0 0 0 1.16 3.3066666666666666l-0.9066666666666667 11.813333333333333a2.8533333333333335 2.8533333333333335 0 0 0 -2.533333333333333 2.84 1.4666666666666668 1.4666666666666668 0 0 0 1.4666666666666668 1.4666666666666668h4.946666666666666a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -0.9333333333333332l4 -9.813333333333333a18.52 18.52 0 0 0 8.92 0l4.626666666666667 -1.1466666666666665a16.2 16.2 0 0 1 5.253333333333333 -0.27999999999999997A19.159999999999997 19.159999999999997 0 0 0 44.61333333333333 49.33333333333333a6.906666666666666 6.906666666666666 0 0 1 0.9866666666666666 4.226666666666667l-0.06666666666666667 0.7999999999999999a2.8666666666666663 2.8666666666666663 0 0 0 -2.96 2.8666666666666663A1.4666666666666668 1.4666666666666668 0 0 0 44 58.666666666666664h5.333333333333333a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -1.0666666666666667l2.373333333333333 -7.88c0.88 -2.5599999999999996 -1.3333333333333333 -3.3466666666666662 -1.3333333333333333 -7.306666666666667l0.27999999999999997 -0.7599999999999999a12 12 0 0 0 -0.6399999999999999 -9.866666666666667c11.159999999999998 -0.13333333333333333 13.04 -11.786666666666665 7.986666666666666 -16.4Z" fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="m24.093333333333334 47.919999999999995 1.6666666666666665 -4.173333333333333" fill="#ffffff" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="m42.05333333333333 39.266666666666666 -0.2533333333333333 2.6666666666666665a9.333333333333332 9.333333333333332 0 0 0 1.0933333333333333 4.533333333333333" fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="M16.799999999999997 13.893333333333333a25.946666666666665 25.946666666666665 0 0 1 1.4933333333333334 -5.213333333333333c0.4666666666666666 -0.84 3.2666666666666666 1.5733333333333333 2.986666666666667 7.453333333333333" fill="#fff5e3" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="M14.773333333333333 18.52a1.2 1.2 0 1 1 -1.1866666666666665 -1.1866666666666665 1.1866666666666665 1.1866666666666665 0 0 1 1.1866666666666665 1.1866666666666665Z" fill="#45413c" stroke-width="1"></path>
		<path d="M16.799999999999997 20.69333333333333c0 0.3333333333333333 0.5333333333333333 0.6 1.2 0.6s1.1866666666666665 -0.26666666666666666 1.1866666666666665 -0.6 -0.5333333333333333 -0.6 -1.1866666666666665 -0.6 -1.2 0.26666666666666666 -1.2 0.6Z" fill="#ffaa54" stroke-width="1"></path>
	</svg>`;
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center start 4 row wrap' });
	let svg = svgFromText(text);
	let d1 = mDom(dParent, { w: 100, h: 100, margin: 25, bg: 'green' });
	mAppend(d1, svg);
	console.log(svg.getAttribute('viewBox'), svg.getAttribute('width'), svg.getAttribute('height'));
	console.log(svg.getBoundingClientRect().width, svg.getBoundingClientRect().height, window.devicePixelRatio);

	svgFit(svg);
	console.log(svg.outerHTML);


	return;
	let sh = svgToShape(text);
	showShape(sh, dParent);
	sh = await emojiSvgToShape(text);
	showShape(sh, dParent);
	sh = svgToShapeSimple(text);
	showShape(sh, dParent);
}
async function test1_fromSvg() {
	await loadAssets();
	let text = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" id="Dog--Streamline-Emoji" height="64" width="64">
		<path d="M59.33333333333333 15.386666666666665a9.226666666666667 9.226666666666667 0 0 0 -9.586666666666666 -2.2266666666666666 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.9333333333333331 1.9333333333333331 0 0 0 1.7333333333333334 1.44c1.92 0.13333333333333333 5.053333333333333 1.0933333333333333 3.8533333333333335 5.986666666666666a8.239999999999998 8.239999999999998 0 0 1 -4.92 6.2 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666l0.9733333333333333 4.426666666666666a1.5333333333333332 1.5333333333333332 0 0 0 0.96 1.08L10.933333333333332 28a3.84 3.84 0 0 1 2.48 3.0266666666666664l1.2533333333333332 8.213333333333333a9.493333333333332 9.493333333333332 0 0 0 1.16 3.3066666666666666l-0.9066666666666667 11.813333333333333a2.8533333333333335 2.8533333333333335 0 0 0 -2.533333333333333 2.84 1.4666666666666668 1.4666666666666668 0 0 0 1.4666666666666668 1.4666666666666668h4.946666666666666a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -0.9333333333333332l4 -9.813333333333333a18.52 18.52 0 0 0 8.92 0l4.626666666666667 -1.1466666666666665a16.2 16.2 0 0 1 5.253333333333333 -0.27999999999999997A19.159999999999997 19.159999999999997 0 0 0 44.61333333333333 49.33333333333333a6.906666666666666 6.906666666666666 0 0 1 0.9866666666666666 4.226666666666667l-0.06666666666666667 0.7999999999999999a2.8666666666666663 2.8666666666666663 0 0 0 -2.96 2.8666666666666663A1.4666666666666668 1.4666666666666668 0 0 0 44 58.666666666666664h5.333333333333333a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -1.0666666666666667l2.373333333333333 -7.88c0.88 -2.5599999999999996 -1.3333333333333333 -3.3466666666666662 -1.3333333333333333 -7.306666666666667l0.27999999999999997 -0.7599999999999999a12 12 0 0 0 -0.6399999999999999 -9.866666666666667c11.159999999999998 -0.13333333333333333 13.04 -11.786666666666665 7.986666666666666 -16.4Z" fill="#f7e5c6" stroke-width="1"></path>
		<path d="M4.1866666666666665 22.786666666666665a1.5199999999999998 1.5199999999999998 0 0 1 0.6799999999999999 -0.36L9.333333333333332 21.24l1.6533333333333333 -2.32c1.3333333333333333 -1.8 4.88 -2.786666666666666 7.093333333333334 -2.5866666666666664a6.226666666666667 6.226666666666667 0 0 1 5.6 5l0.5333333333333333 2.5999999999999996a9.053333333333333 9.053333333333333 0 0 0 0.8666666666666667 2.533333333333333 9.559999999999999 9.559999999999999 0 0 0 8.84 5.093333333333333l10.333333333333332 -0.42666666666666664a7.6933333333333325 7.6933333333333325 0 0 1 4.933333333333334 1.5199999999999998 8.186666666666666 8.186666666666666 0 0 0 4.92 -6.2 6.079999999999999 6.079999999999999 0 0 0 0 -3.5866666666666664 8.293333333333333 8.293333333333333 0 0 1 -4.92 6.186666666666666 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666Z" fill="#fff5e3" stroke-width="1"></path>
		<path d="M49.8 16.759999999999998a9.2 9.2 0 0 1 9.533333333333333 2.2399999999999998 8.36 8.36 0 0 1 2.493333333333333 4.7333333333333325 9.239999999999998 9.239999999999998 0 0 0 -12.08 -10.573333333333332 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.8666666666666665 1.8666666666666665 0 0 0 1.2799999999999998 1.3333333333333333Z" fill="#fff5e3" stroke-width="1"></path>
		<path d="M59.33333333333333 15.386666666666665a9.226666666666667 9.226666666666667 0 0 0 -9.586666666666666 -2.2266666666666666 1.9066666666666665 1.9066666666666665 0 0 0 -1.2266666666666666 2.2666666666666666 1.9333333333333331 1.9333333333333331 0 0 0 1.7333333333333334 1.44c1.92 0.13333333333333333 5.053333333333333 1.0933333333333333 3.8533333333333335 5.986666666666666a8.239999999999998 8.239999999999998 0 0 1 -4.92 6.2 7.626666666666666 7.626666666666666 0 0 0 -4.933333333333334 -1.5333333333333332l-10.333333333333332 0.48a9.533333333333333 9.533333333333333 0 0 1 -8.84 -5.093333333333333 8.906666666666666 8.906666666666666 0 0 1 -0.8666666666666667 -2.533333333333333l-0.5333333333333333 -2.6666666666666665a6.213333333333333 6.213333333333333 0 0 0 -5.546666666666667 -4.973333333333333c-2.213333333333333 -0.19999999999999998 -5.8133333333333335 0.7733333333333332 -7.093333333333334 2.5866666666666664L9.333333333333332 17.626666666666665l-4.52 1.2a1.48 1.48 0 0 0 -1.16 1.7866666666666666l0.9733333333333333 4.426666666666666a1.5333333333333332 1.5333333333333332 0 0 0 0.96 1.08L10.933333333333332 28a3.84 3.84 0 0 1 2.48 3.0266666666666664l1.2533333333333332 8.213333333333333a9.493333333333332 9.493333333333332 0 0 0 1.16 3.3066666666666666l-0.9066666666666667 11.813333333333333a2.8533333333333335 2.8533333333333335 0 0 0 -2.533333333333333 2.84 1.4666666666666668 1.4666666666666668 0 0 0 1.4666666666666668 1.4666666666666668h4.946666666666666a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -0.9333333333333332l4 -9.813333333333333a18.52 18.52 0 0 0 8.92 0l4.626666666666667 -1.1466666666666665a16.2 16.2 0 0 1 5.253333333333333 -0.27999999999999997A19.159999999999997 19.159999999999997 0 0 0 44.61333333333333 49.33333333333333a6.906666666666666 6.906666666666666 0 0 1 0.9866666666666666 4.226666666666667l-0.06666666666666667 0.7999999999999999a2.8666666666666663 2.8666666666666663 0 0 0 -2.96 2.8666666666666663A1.4666666666666668 1.4666666666666668 0 0 0 44 58.666666666666664h5.333333333333333a1.4933333333333334 1.4933333333333334 0 0 0 1.3333333333333333 -1.0666666666666667l2.373333333333333 -7.88c0.88 -2.5599999999999996 -1.3333333333333333 -3.3466666666666662 -1.3333333333333333 -7.306666666666667l0.27999999999999997 -0.7599999999999999a12 12 0 0 0 -0.6399999999999999 -9.866666666666667c11.159999999999998 -0.13333333333333333 13.04 -11.786666666666665 7.986666666666666 -16.4Z" fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="m24.093333333333334 47.919999999999995 1.6666666666666665 -4.173333333333333" fill="#ffffff" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="m42.05333333333333 39.266666666666666 -0.2533333333333333 2.6666666666666665a9.333333333333332 9.333333333333332 0 0 0 1.0933333333333333 4.533333333333333" fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="M16.799999999999997 13.893333333333333a25.946666666666665 25.946666666666665 0 0 1 1.4933333333333334 -5.213333333333333c0.4666666666666666 -0.84 3.2666666666666666 1.5733333333333333 2.986666666666667 7.453333333333333" fill="#fff5e3" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
		<path d="M14.773333333333333 18.52a1.2 1.2 0 1 1 -1.1866666666666665 -1.1866666666666665 1.1866666666666665 1.1866666666666665 0 0 1 1.1866666666666665 1.1866666666666665Z" fill="#45413c" stroke-width="1"></path>
		<path d="M16.799999999999997 20.69333333333333c0 0.3333333333333333 0.5333333333333333 0.6 1.2 0.6s1.1866666666666665 -0.26666666666666666 1.1866666666666665 -0.6 -0.5333333333333333 -0.6 -1.1866666666666665 -0.6 -1.2 0.26666666666666666 -1.2 0.6Z" fill="#ffaa54" stroke-width="1"></path>
	</svg>`;
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center start 4 row wrap' });
	let svg = svgFromText(text);
	let d1 = mDom(dParent, { w: 100, h: 100, margin: 25, bg: 'green' });
	mAppend(d1, svg);
	console.log(svg.getAttribute('viewBox'), svg.getAttribute('width'), svg.getAttribute('height'));
	console.log(svg.getBoundingClientRect().width, svg.getBoundingClientRect().height, window.devicePixelRatio);

	svgFit(svg);
	console.log(svg.outerHTML);


	return;
	let sh = svgToShape(text);
	showShape(sh, dParent);
	sh = await emojiSvgToShape(text);
	showShape(sh, dParent);
	sh = svgToShapeSimple(text);
	showShape(sh, dParent);
}

async function test1_svgFillPath() {
	let div = mDom('dPage', { w: 200, h: 200 });
	let d = "M78,41 C76,37 72,36 68,39 C64,36 60,34 54,34 C50,34 46,35 43,37 C42,34 38,32 34,32 C28,32 23,36 21,41 C20,43 18,44 16,43 C14,42 12,44 11,46 C10,48 11,51 13,52 C12,54 12,56 13,58 C14,60 16,61 18,60 C19,63 21,65 24,65 C26,65 28,64 29,62 C31,65 34,67 38,67 C43,67 47,63 48,58 C51,60 55,61 59,60 C61,63 64,65 67,65 C71,65 74,62 75,58 C77,59 79,58 81,56 C83,54 84,51 83,49 C85,47 85,44 83,42 C82,40 80,40 78,41 Z";
	d =
		'M62 208 C40 192 34 160 52 138 C60 156 74 172 96 182 C150 170 205 170 250 164 ' +
		'C240 150 234 128 244 108 C252 80 292 64 322 78 C334 86 342 96 354 102 C372 108 380 132 366 146 ' +
		'C352 158 334 154 320 160 C306 168 300 188 298 212 C298 240 302 262 300 290 L302 336 ' +
		'C304 348 324 346 324 354 L266 354 C262 330 264 300 264 282 C245 292 205 292 184 284 ' +
		'C184 306 186 326 188 338 C190 350 210 348 210 356 L122 356 C118 330 116 296 102 270 ' +
		'C84 252 64 240 62 208 Z';
	svgFillElem(div, d, { fill: 'crimson', stroke: 'black', strokeWidth: 6 });                    // keeps the shape's proportions
	svgFillElem(div, d, { fill: 'crimson', stroke: 'black', strokeWidth: 6 }, { stretch: true }); // fills the whole div
}
async function test1_dogFromText() {
	let dParent = mDom('dPage', { w: 100, h: 100 });
	let svg = svgCreate(dParent);
	const d = "M78,41 C76,37 72,36 68,39 C64,36 60,34 54,34 C50,34 46,35 43,37 C42,34 38,32 34,32 C28,32 23,36 21,41 C20,43 18,44 16,43 C14,42 12,44 11,46 C10,48 11,51 13,52 C12,54 12,56 13,58 C14,60 16,61 18,60 C19,63 21,65 24,65 C26,65 28,64 29,62 C31,65 34,67 38,67 C43,67 47,63 48,58 C51,60 55,61 59,60 C61,63 64,65 67,65 C71,65 74,62 75,58 C77,59 79,58 81,56 C83,54 84,51 83,49 C85,47 85,44 83,42 C82,40 80,40 78,41 Z";
	const cloudPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	cloudPath.setAttribute('d', d);
	cloudPath.setAttribute('fill', clrHex('blue'));
	cloudPath.setAttribute('stroke', clrHex('darkblue'));
	cloudPath.setAttribute('stroke-width', '1.5');
	cloudPath.setAttribute('stroke-linejoin', 'round');

	svg.appendChild(cloudPath);
	console.log(svg.getBBox())
	const box = viewBoxFromPath(d, svg, { padding: 5 });

}
async function test1_replaceText() {
	await loadAssets();
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	sh = M.shapes.bug;
	color = clrRand();
	let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });
	let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: 'bug' });
	let d1 = mDom(d, { flex: 'none', w: 400, hmin: 400 });
	let { shapeLayer, out } = createStage(d1);
	//let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
	const o = drawClaudeX(shapeLayer, sh, 'hallo', out, { textFill: 'red', depth: 20, color });   // draws the shape once
	await mSleep(1000);
	setText(o.fitShape, 'a different text', out);                                // only the text changes
	await mSleep(1000);
	setText(o.fitShape, 'wow', out, { fontFamily: 'Georgia' });                  // with different options
	await mSleep(1000);
	setText(o.fitShape, 'schwarz jetzt', out, { fill: 'black' });                                                // remove the text	
}

async function test1_showMeeplesIn5Colors() {
	await loadAssets();
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	sh = M.shapes.bug;
	for (const key of rChoose(Meeples, 5)) {
		let sh = M.shapes[key];
		mLinebreak(dParent);
		for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
			color = clrX(color);

			let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });

			let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: key });

			let d1 = mDom(d, { flex: 'none', w: 150, hmin: 150 });

			let { shapeLayer, out } = createStage(d1);
			drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
		}
	}

}
async function test1_butterfly() {
	await loadAssets();
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	let sh = M.shapes.club_suit;
	const fly = butterflyFromTo(dParent, sh, 40, 300, 120, 80, 100);   // speed in px/second
	await fly.finished;        // resolves when it has arrived
}
async function test1_tests3() {
	let t = Date.now();
	await loadAssets();
	t = Date.now() - t; console.log(t);
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	for (const key of Meeples) {//rChoose(Meeples, 5)) {
		let sh = M.shapes[key];
		mLinebreak(dParent);
		for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
			color = clrX(color);

			let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });

			let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: key });

			let d1 = mDom(d, { flex: 'none', w: 150, hmin: 150 });

			let { shapeLayer, out } = createStage(d1);
			drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
		}
	}
}
async function test1_tests2() {
	let t = Date.now();
	await loadAssets();
	t = Date.now() - t; console.log(t);
	let dParent = mDom('dPage', { hmin: 800, m: 12, flexbox: 'center stretch 4 row wrap' });
	for (const key of rChoose(Meeples, 5)) {
		let sh = M.shapes[key];
		mLinebreak(dParent);
		for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
			color = clrX(color);

			let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });

			let label = mDom(d, { w: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', align: 'center', fg: 'white', fz: 14 }, { html: key });

			let d1 = mDom(d, { flex: 'none', w: 150, hmin: 150 });

			t = Date.now();
			let { shapeLayer, out } = createStage(d1);
			drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
			//t = Date.now() - t; console.log('draw',t);
		}
	}
}
async function test1_addMeepleToYamlFile() {
	await loadAssets();
	let mee = {
		"data": [[198, 20],
		[
			219,
			23
		],
		[
			234,
			31
		],
		[
			249,
			45
		],
		[
			259,
			62
		],
		[
			263,
			79
		],
		[
			262,
			100
		],
		[
			258,
			113
		],
		[
			251,
			125
		],
		[
			241,
			134
		],
		[
			241,
			139
		],
		[
			278,
			155
		],
		[
			305,
			174
		],
		[
			334,
			199
		],
		[
			343,
			209
		],
		[
			348,
			219
		],
		[
			347,
			229
		],
		[
			343,
			238
		],
		[
			338,
			242
		],
		[
			328,
			246
		],
		[
			319,
			246
		],
		[
			311,
			243
		],
		[
			279,
			226
		],
		[
			272,
			225
		],
		[
			261,
			225
		],
		[
			264,
			239
		],
		[
			297,
			354
		],
		[
			296,
			363
		],
		[
			292,
			371
		],
		[
			287,
			375
		],
		[
			277,
			379
		],
		[
			237,
			379
		],
		[
			203,
			315
		],
		[
			197,
			316
		],
		[
			163,
			379
		],
		[
			127,
			380
		],
		[
			113,
			375
		],
		[
			108,
			371
		],
		[
			104,
			363
		],
		[
			103,
			353
		],
		[
			136,
			239
		],
		[
			139,
			225
		],
		[
			128,
			225
		],
		[
			118,
			227
		],
		[
			93,
			242
		],
		[
			81,
			246
		],
		[
			72,
			246
		],
		[
			62,
			242
		],
		[
			55,
			235
		],
		[
			52,
			226
		],
		[
			52,
			219
		],
		[
			57,
			209
		],
		[
			87,
			180
		],
		[
			122,
			155
		],
		[
			159,
			139
		],
		[
			159,
			134
		],
		[
			146,
			120
		],
		[
			139,
			104
		],
		[
			137,
			96
		],
		[
			137,
			78
		],
		[
			139,
			67
		],
		[
			149,
			48
		],
		[
			163,
			33
		],
		[
			179,
			24
		]
		],
		"bbox": {
			"x": 52,
			"y": 20,
			"w": 296,
			"h": 360
		}
	}
	let shapes = M.shapes;
	shapes.meeple = mee;
	downloadAsYaml(shapes, 'shapes')
}
async function test1_tests1() {
	let t = Date.now();
	await loadAssets();
	t = Date.now() - t; console.log(t);
	let dParent = mDom('dPage', { m: 12, bg: 'yellow', flexbox: 'center start 4 row wrap' });
	for (const key of rChoose(Meeples, 5)) {
		let sh = M.shapes[key];
		mLinebreak(dParent);
		for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
			color = clrX(color);

			let d = mDom(dParent, { bg: 'black', flexbox: 'center center 4 column' });
			//Object.assign(d.style, { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px' });

			let label = mDom(d, { fg: 'white', fz: 14 }, { html: key });
			Object.assign(label.style, {
				width: '100px', textAlign: 'center', overflow: 'hidden',
				textOverflow: 'ellipsis', whiteSpace: 'nowrap'
			});

			let d1 = mDom(d, { w: 100, h: 100 });
			d1.style.flex = 'none';

			t = Date.now();
			let { shapeLayer, out } = createStage(d1);
			drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
			//t = Date.now() - t; console.log('draw',t);
		}
	}
}
async function test1_tests() {
	await loadAssets();
	let dParent = mDom('dPage', { m: 12, flexbox: 'center stretch 4 row wrap' });
	for (const key of rChoose(Meeples, 5)) {
		let sh = M.shapes[key];
		console.log(sh);
		mLinebreak(dParent);
		for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
			color = clrX(color);
			let d = mDom(dParent, { bg: 'black', }); //flexbox: 'center stretch 4 row wrap' });
			mDom(d, { fg: 'white', align: 'center', fz: 24, overflow: 'hidden' }, { html: key });
			let d1 = mDom(d, { w: 100, h: 100, align: 'center' });
			let { a, b, shapeLayer, out } = createStage(d1);
			let o = drawClaudeX(shapeLayer, sh, '', out, { h: 100, depth: 20, color, blend: 'overlay' });
		}
	}
}
async function test1_fromSvgTextToWoodenMeeple() {
	await loadAssets();

	let dParent = mDom('dPage', { m: 12, flexbox: 'center stretch 4 row wrap' });
	let text = getMeeple();
	let svg = svgFromText(text);
	mAppend(dParent, svg);

	let sh = await emojiSvgToShape(getMeeple());
	console.log(sh);

	for (let color of ['red', 'green', 'yellow', 'orange', 'blue', 'indigo']) {
		color = clrX(color);
		let d = mDom(dParent, { bg: 'black', fg: 'white', align: 'center', fz: 24 }, { html: 'meeple' }); //flexbox: 'center stretch 4 row wrap' });
		//mDom(d, { fg: 'white', align: 'center', mtop: 12, fz:24 }, { html: k });
		let d1 = mDom(d, { w: 100, h: 100 });
		let { a, b, shapeLayer, out } = createStage(d1);
		let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20, color, blend: 'overlay' });
	}


	return;


	//good
	let ok = 'ant bug lizard sauropod butterfly scorpion tropical_fish spider baby_chick bird dodo duck front_facing_baby_chick goose';
	ok += ' snake t_rex parrot penguin rooster swan bat buffalo cow deer horse dog llama mammoth otter poodle blowfish crab ';
	ok += 'dolphin fish lobster shark shrimp turtle spouting_whale squid whale crocodile'
	let pot = 'seal octopus orca kangaroo black_cat giraffe rabbit pig goat monkey flamingo owl camel hedgehog tiger zebra rhinoceros two_hump_camel skunk raccoon chipmunk mouse rat hippopotamus turkey elephant ewe hamster bison beetle bee cricket fly ladybug worm dove beaver'.split(' ');
	let okHeads = 'chicken bear boar cat_face cow_face horse_face unicorn'

	let face_pot = 'moose lion rabbit_face wolf';
	let nokface = 'panda '
	let okButSilh = 'oyster eagle coral mosquito ram water_buffalo snail hatching_chick peacock guide_dog service_dog sloth leopard orangutan'
	let nok = 'pig_nose polar_bear donkey mosquito spider_web black_bird microbe cockroach badger dragonfly grasshopper hornet mantis moth snail wasp'.split(' ');
	let shouldHaveNoEyes = 'feather '

	let list = ['star4', 'star5', 'star6', 'star7', 'star8', 'star9'];
	// list = rChoose(M.shapeKeys.filter(x => !x.includes('face')), 36);
	list = rChoose(M.shapeKeys.filter(x => emoKeyToFilename(x)), 36);
	// let listok = ['buffalo', 'horse', 'cow', 'pig', 'goat', 'rooster', 'turkey',];
	list = emoGetKeys('people_body'); //emoGetKeys('animals_nature',x=>startsWith(x,'animal'))
	list = ok.split(' ')
	list = M.shapeKeys.filter(x => emoKeyToFilename(x));
	//console.log(list.includes('fire')); return;
	//console.log(list)

	let sel = DA.aaa = [];
	for (const k of list) {
		//console.log(k)
		let { eyes, svg, svgText } = await detectEyesInEmoji(k);
		if (!eyes || eyes.length == 0) continue;
		//console.log('eyes', k, eyes);

		//next draw the shape emo with eyes
		let sh = M.shapes[k]; if (!sh) continue;
		//console.log(sh); 
		let d = mDom(dParent, { bg: 'red', fg: 'white', align: 'center', fz: 24 }, { html: k }); //flexbox: 'center stretch 4 row wrap' });
		//mDom(d, { fg: 'white', align: 'center', mtop: 12, fz:24 }, { html: k });
		let d1 = mDom(d, { w: 100, h: 100 });
		let { a, b, shapeLayer, out } = createStage(d1);

		let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20 });

		d.onclick = () => {
			if (sel.includes(k)) {
				arrRemove(sel, k);
				mStyle(d, { bg: 'red' });
			} else {
				sel.push(k);
				mStyle(d, { bg: 'yellow' });
			}
			console.log('list', sel);

		}

		continue;
		for (const eye of eyes) {
			mCircle(shapeLayer.parentNode, eye.cx * 400 / 128, eye.cy * 400 / 128, 10, '#ff0000');
		}
		// let d2 = mDom(d, { w: 300, h: 300, bg: 'blue' },{ html: svgText });
		// console.log(shapeLayer);
		// console.log(shapeLayer.parentNode);

	}
}
async function test1_claude7() {
	await loadAssets();

	let dParent = mDom('dPage', { m: 12, flexbox: 'center stretch 4 row wrap' });


	//good
	let ok = 'ant bug lizard sauropod butterfly scorpion tropical_fish spider baby_chick bird dodo duck front_facing_baby_chick goose';
	ok += ' snake t_rex parrot penguin rooster swan bat buffalo cow deer horse dog llama mammoth otter poodle blowfish crab ';
	ok += 'dolphin fish lobster shark shrimp turtle spouting_whale squid whale crocodile'
	let pot = 'seal octopus orca kangaroo black_cat giraffe rabbit pig goat monkey flamingo owl camel hedgehog tiger zebra rhinoceros two_hump_camel skunk raccoon chipmunk mouse rat hippopotamus turkey elephant ewe hamster bison beetle bee cricket fly ladybug worm dove beaver'.split(' ');
	let okHeads = 'chicken bear boar cat_face cow_face horse_face unicorn'

	let face_pot = 'moose lion rabbit_face wolf';
	let nokface = 'panda '
	let okButSilh = 'oyster eagle coral mosquito ram water_buffalo snail hatching_chick peacock guide_dog service_dog sloth leopard orangutan'
	let nok = 'pig_nose polar_bear donkey mosquito spider_web black_bird microbe cockroach badger dragonfly grasshopper hornet mantis moth snail wasp'.split(' ');
	let shouldHaveNoEyes = 'feather '

	let list = ['star4', 'star5', 'star6', 'star7', 'star8', 'star9'];
	// list = rChoose(M.shapeKeys.filter(x => !x.includes('face')), 36);
	list = rChoose(M.shapeKeys.filter(x => emoKeyToFilename(x)), 36);
	// let listok = ['buffalo', 'horse', 'cow', 'pig', 'goat', 'rooster', 'turkey',];
	list = emoGetKeys('people_body'); //emoGetKeys('animals_nature',x=>startsWith(x,'animal'))
	list = ok.split(' ')
	list = M.shapeKeys.filter(x => emoKeyToFilename(x));
	//console.log(list.includes('fire')); return;
	//console.log(list)

	let sel = DA.aaa = [];
	for (const k of list) {
		//console.log(k)
		let { eyes, svg, svgText } = await detectEyesInEmoji(k);
		if (!eyes || eyes.length == 0) continue;
		//console.log('eyes', k, eyes);

		//next draw the shape emo with eyes
		let sh = M.shapes[k]; if (!sh) continue;
		//console.log(sh); 
		let d = mDom(dParent, { bg: 'red', fg: 'white', align: 'center', fz: 24 }, { html: k }); //flexbox: 'center stretch 4 row wrap' });
		//mDom(d, { fg: 'white', align: 'center', mtop: 12, fz:24 }, { html: k });
		let d1 = mDom(d, { w: 100, h: 100 });
		let { a, b, shapeLayer, out } = createStage(d1);

		let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 20 });

		d.onclick = () => {
			if (sel.includes(k)) {
				arrRemove(sel, k);
				mStyle(d, { bg: 'red' });
			} else {
				sel.push(k);
				mStyle(d, { bg: 'yellow' });
			}
			console.log('list', sel);

		}

		continue;
		for (const eye of eyes) {
			mCircle(shapeLayer.parentNode, eye.cx * 400 / 128, eye.cy * 400 / 128, 10, '#ff0000');
		}
		// let d2 = mDom(d, { w: 300, h: 300, bg: 'blue' },{ html: svgText });
		// console.log(shapeLayer);
		// console.log(shapeLayer.parentNode);

	}
}
async function _test1_claude6() {


	// let x=measureElement(`<path style="fill:#2D2B33;" d="M50.2,20.77c-0.42,1.75-1.61,3.12-3.94,2.75c-2.18-0.35-3.24-2.6-2.6-4.79
	// c0.5-1.73,1.79-2.9,3.97-2.53C50.13,16.62,50.6,19.08,50.2,20.77z"/>`);
	// 	console.log(x);
	// return;

	await loadAssets();
	// console.log(M);

	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	let list = ['star4', 'star5', 'star6', 'star7', 'star8', 'star9'];
	list = rChoose(M.shapeKeys.filter(x => !x.includes('face')), 36);
	let listok = ['buffalo', 'horse', 'cow', 'pig', 'goat', 'rooster', 'turkey',];
	list = mGetAnimals(); // ['duck', 'dog', 'black_cat', 'rabbit', 'mouse', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo'];
	for (const k of list) {
		console.log(k)
		let fname = emoKeyToFilename(k);

		let svgText = await loadText(`assets/svg/${fname}`);
		// if (k=='duck') console.log('duck svgText', svgText);

		let svg = svgFromText(svgText);
		mAppend(dParent, svg);
		//svg.style.visibility = 'hidden';

		let fills = getSvgFillColors(svgText).map(x => x.startsWith('#') ? x.toLowerCase() : null).filter(x => !!x);
		let cDarkest = clrDarkest(fills);
		// console.log(k, fills, cDarkest);

		function findSvgElems(svg, tags) {
			let elems = {};
			for (const tag of tags) {
				let list = [...svg.querySelectorAll(tag)];
				elems[tag] = list;
			}
			return elems;
		}

		let elems = findSvgElems(svg, ['path', 'ellipse', 'circle']);
		//console.log('found elems:', elems);

		let list = [];
		for (const tag in elems) {
			for (const el of elems[tag]) {
				let text = el.outerHTML;
				let yes = text.toLowerCase().includes(cDarkest.toLowerCase());
				if (yes) list.push({ el, tag, text });
			}
		}
		//console.log('found darkest elems:', list);

		function measureSvgElement(el) {
			if (!el || typeof el.getBBox !== 'function') { assertion(false); return null; }

			const bbox = el.getBBox();

			return {
				x: bbox.x,
				y: bbox.y,
				width: bbox.width,
				height: bbox.height,
				cx: bbox.x + bbox.width / 2,  // Center X
				cy: bbox.y + bbox.height / 2  // Center Y
			};
		}

		//measure the size of each elem
		let eyes = [];
		for (const o of list) {
			let m = measureSvgElement(o.el);
			let { x, y, width, height, cx, cy } = m;
			if (k == 'kangaroo') console.log('kangaroo', k, m, list);

			if ((width > 5 && width < 11 && height > 5 && height < 11) || list.length <= 2) {
				addKeys(m, o);
				//this could be eyes
				eyes.push(o);
			}
		}
		console.log('eyes', k, eyes);
		//svg.remove();
	}
}
async function _test1_claude5() {
	await loadAssets();
	// console.log(M);

	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	let list = ['star4', 'star5', 'star6', 'star7', 'star8', 'star9'];
	list = rChoose(M.shapeKeys.filter(x => !x.includes('face')), 36);
	list = ['buffalo', 'horse', 'cow', 'pig', 'goat', 'rooster', 'turkey', 'duck', 'dog', 'black_cat', 'rabbit', 'mouse', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo'];
	for (const k of list) {

		let fname = emoKeyToFilename(k);
		let emojiSvg = await loadText(`assets/svg/${fname}`);
		let fills = getSvgFillColors(emojiSvg);
		let cDarkest = clrDarkest(fills);
		console.log(k, fills, cDarkest);

		let svg1 = svgFromText(emojiSvg);
		let paths = [...svg1.querySelectorAll('path')];
		let mypath = null;
		for (const p of paths) {
			let text = p.outerHTML;
			console.log('path text:', text);
			let yes = text.toLowerCase().includes(cDarkest.toLowerCase());
			if (yes) { mypath = p; console.log('found darkest path'); break; }
			//let fill = p.getAttribute('fill') || p.style.fill;
			//console.log('path fill:', clrRgbToHex(fill));
		}
		console.log('found path:', mypath);


		svg1.style.cssText = 'position:fixed; left:-10000px; top:0; visibility:hidden';
		document.body.appendChild(svg1);

		const bounds = mypath.getBBox();
		svg1.remove();
		console.log(bounds);
		const centerX = (bounds.minx + bounds.maxx) / 2;
		const centerY = (bounds.miny + bounds.maxy) / 2;
		const radius = Math.max(bounds.maxx - bounds.minx, bounds.maxy - bounds.miny) / 2;



		// console.log(k, fills, cDarkest);
		// console.log(svg)
		// //let part = svgTextFindFill(sv, cDarkest);



		// console.log('part', paths.length, paths);
		// return;


		let sh = M.shapes[k];
		//console.log(sh)
		let d = mDom(dParent, { bg: 'green' });
		mDom(d, { fg: 'white', align: 'center', mtop: 12 }, { html: k });
		let d1 = mDom(d, { w: 300, h: 300, bg: 'green' });
		let { stage, svg, shapeLayer, out } = createStage(d1);

		let d2 = mDom(d, { w: 300, h: 300, bg: 'green' }, { html: emojiSvg });

		let c = '#0c090c';
		let clist = ['#0c090c', '#2F2927'];
		let res = findSvgPartWithColor(emojiSvg, cDarkest);
		console.log(res);
		//return;

		let x = res.center.x * 400 / 128;
		let y = res.center.y * 400 / 128;
		// 	return;


		// 	let x = await detectEyes(emojiSvg);
		// 	return;
		// 	//console.log('fname', fname, k, sh, emojiSvg, x); return;


		// 	svgAppend(shapeLayer, emojiSvg);
		// 	`<path style="fill:#0C090C;" d="M28.24,35.7c0.74,1.72,0.35,3.94-1.94,4.15c-1.43,0.13-2.68-0.99-3.13-2.76
		// c-0.44-1.77,0.33-3.49,1.72-3.84C26.29,32.9,27.52,34.02,28.24,35.7z"/>`

		//let info = drawClaude(shapeLayer, sh, 'hallo das ist gut!', out);
		let o = drawClaudeX(shapeLayer, sh, '', out, { depth: 10 });          // oblique 3D
		// let info = drawClaude(shapeLayer, sh, 'hallo das ist gut!', out, { depth: 40, scale: 0.8 }); // perspective
		// let info = drawClaude(shapeLayer, sh, 'hallo das ist gut!', out);                       // flat, as before



		// console.log(o); 
		mCircle(shapeLayer.parentNode, x, y, 10, '#ff0000');
		// console.log(shapeLayer);
		// console.log(shapeLayer.parentNode);
		// 	return;

		// 	let par=shapeLayer.parentNode;
		// 	let pth=svgFromText(`<path style="fill:#0C090C;" d="M28.24,35.7c0.74,1.72,0.35,3.94-1.94,4.15c-1.43,0.13-2.68-0.99-3.13-2.76
		// c-0.44-1.77,0.33-3.49,1.72-3.84C26.29,32.9,27.52,34.02,28.24,35.7z"></path>`);
		// mAppend(par, pth);

		// 	return;


	}
}
async function _test1_claude4_PolyClips() {
	await loadAssets();

	const star = Array.from({ length: 10 }, (_, i) => {
		const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});

	// kind: 'circle' | 'points' | 'element'
	const shapes = {
		circle: { kind: 'circle', data: { r: 180, cx: 200, cy: 200 } },
		triangle: { kind: 'points', data: [[200, 20], [385, 375], [15, 375]] },
		star: { kind: 'points', data: star },
		heart: {
			kind: 'element', tag: 'path',
			attrs: { d: 'M200 360 C60 260 20 180 20 125 C20 65 65 30 115 30 C155 30 185 50 200 85 C215 50 245 30 285 30 C335 30 380 65 380 125 C380 180 340 260 200 360 Z' }
		},
		ellipse: { kind: 'element', tag: 'ellipse', attrs: { cx: 200, cy: 200, rx: 185, ry: 120 } },
		hourglass: { kind: 'element', tag: 'polygon', attrs: { points: '30,20 370,20 230,200 370,380 30,380 170,200' } },
	};
	// Add every clip preset (all aliases stay usable as keys of `shapes`)
	for (const [name, css] of Object.entries(PolyClips)) {
		const def = clipToShape(css);
		if (!def) { console.warn(`PolyClips.${name} is not valid CSS, skipped:`, css); continue; }
		def.sig = css;                       // identical clip strings share one dropdown entry
		shapes[name] = def;
	}


	//now get some paths from svg files
	let dir = '../assets/svg/';
	let n = 7;
	let res = await mGetFiles(dir.slice(2));
	//console.log(res);//return;

	let fnames = res.files; //.filter(fname => fname.startsWith('emoji_u') && fname.length <= 18); //startsWith('emoji_u'));

	// let group = M.emogroup.people_body; //objects food_drink animals_nature travel_places symbols activities special
	// //console.log(group)
	// let animals = [];
	// for(const key in group) {
	// 	animals=animals.concat(group[key]);
	// }
	// //console.log(animals);//return;

	let r = {};
	for (const fname of fnames) {
		let key = emoFilenameToKey(fname);
		//console.log('found key ', key, fname);
		if (key) r[key] = { key, fname, uni: M.emo[key].uni };
	}
	// console.log(r);
	let keys = Object.keys(r);
	keys.sort();
	// keys = keys.filter(x=>animals.includes(x));
	//console.log(keys);
	//return;

	// fnames = fnames.filter(x=>animals.some(y=>x.includes(M.emo[y].uni)));
	// console.log(fnames); return;

	// fnames = rChoose(fnames,3);
	// console.log(fnames); //return;
	let newShapes = {};
	//console.log(fnames);
	for (const k of keys) {//}.slice(0,5)) {
		const { fname } = r[k];
		let server = await getDA('staticUrl'); //console.log('server', server);
		//console.log(server);
		res = await fetch(server + 'assets/svg/' + fname);
		if (!res.ok) return null;
		let text = await res.text();
		//let txt = await loadText(`../assets/svg/${fname}}`);
		//console.log(text);
		let x = await emojiSvgToShape(text);
		//console.log(x.data);
		// let part = stringBefore(stringAfter(fname, 'emoji_u'), '.svg');
		// //the part ist '0031_20e3' but the unicode is '0031_fe0f_20e3'
		// let key = emoFilenameToKey(fname);
		// console.log('the key is',key,fname,part)
		newShapes[k] = x;
	}
	downloadAsYaml(newShapes, 'emoshapes');
	//return;

	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	// let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	for (const sh of Object.values(newShapes)) {
		console.log(sh)
		let d = mDom(dParent, { w: 300, h: 300, bg: 'green' });
		let { stage, svg, shapeLayer, out, info } = createStage(d);
		drawClaude(shapeLayer, sh, 'hallo das ist gut!', out, info);
	}
}
async function test0_loadText() {
	let dir = '../assets/svg/';
	let n = 7;
	let res = await mGetFiles(dir.slice(2));
	let files = res.files.slice(3, 5);
	console.log(files);//return;
	M = await loadStaticYaml('y/m.yaml');
	console.log(M);
	let server = await getDA('staticUrl'); //console.log('server', server);
	console.log(server);
	res = await fetch(server + 'assets/svg/emoji_u1f0cf.svg');
	if (!res.ok) return null;
	let text = await res.text();
	console.log(text);
	//return YAML.parse(text);
	//let svgText = await loadStaticText(`../assets/svg/${files[0]}}`);

}

async function test1_claude3() {
	await loadAssets();
	let dParent = mDom('dPage', { gap: 2 }); mCenterFlex(dParent);
	//let filename = '../assets/img/beach/beach1.jpg';
	let dir = '../assets/svg/';
	let n = 7;
	let res = await mGetFiles(dir.slice(2));
	console.log(res);//return;

	let fnames = res.files.slice(10, 20);
	console.log(fnames);
	for (const fname of fnames) {
		let txt = await loadText(`../assets/svg/${fname}}`);
		console.log(txt);

	}
}

async function test1_claude2() {
	const star = Array.from({ length: 10 }, (_, i) => {
		const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});

	// kind: 'circle' | 'points' | 'element'
	const shapes = {
		circle: { kind: 'circle', data: { r: 180, cx: 200, cy: 200 } },
		triangle: { kind: 'points', data: [[200, 20], [385, 375], [15, 375]] },
		star: { kind: 'points', data: star },
		heart: {
			kind: 'element', tag: 'path',
			attrs: { d: 'M200 360 C60 260 20 180 20 125 C20 65 65 30 115 30 C155 30 185 50 200 85 C215 50 245 30 285 30 C335 30 380 65 380 125 C380 180 340 260 200 360 Z' }
		},
		ellipse: { kind: 'element', tag: 'ellipse', attrs: { cx: 200, cy: 200, rx: 185, ry: 120 } },
		hourglass: { kind: 'element', tag: 'polygon', attrs: { points: '30,20 370,20 230,200 370,380 30,380 170,200' } },
	};
	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	for (const sh of Object.values(shapes)) {
		let d = mDom(dParent, { w: 300, h: 300, bg: 'green' });
		let { stage, svg, shapeLayer, out, info } = createStage(d);
		drawClaude(shapeLayer, sh, 'hallo das ist gut!', out, info);
	}

}
async function test1_claude1() {
	const star = Array.from({ length: 10 }, (_, i) => {
		const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});

	// kind: 'circle' | 'points' | 'element'
	const shapes = {
		circle: { kind: 'circle', data: { r: 180, cx: 200, cy: 200 } },
		triangle: { kind: 'points', data: [[200, 20], [385, 375], [15, 375]] },
		star: { kind: 'points', data: star },
		heart: {
			kind: 'element', tag: 'path',
			attrs: { d: 'M200 360 C60 260 20 180 20 125 C20 65 65 30 115 30 C155 30 185 50 200 85 C215 50 245 30 285 30 C335 30 380 65 380 125 C380 180 340 260 200 360 Z' }
		},
		ellipse: { kind: 'element', tag: 'ellipse', attrs: { cx: 200, cy: 200, rx: 185, ry: 120 } },
		hourglass: { kind: 'element', tag: 'polygon', attrs: { points: '30,20 370,20 230,200 370,380 30,380 170,200' } },
	};
	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	let d = mDom(dParent, { w: 300, h: 300, bg: 'green' });

	let { stage, svg, shapeLayer, out, info } = createStage(d);

	drawClaude(shapeLayer, shapes.circle, 'hallo das ist gut!', out, info);
	drawClaude(shapeLayer, shapes.hourglass, 'hallo das ist gut!', out, info);
	drawClaude(shapeLayer, shapes.heart, 'hallo das ist gut!', out, info);

}
async function test1_claude() {
	const r = fitTextInShape('Some long text to fit', { r: 100, cx: 100, cy: 100 }, {
		allowWordBreak: false,
		fontFamily: 'Georgia',
		lineHeight: 1.2,
		padding: 4,
	});
	// r.fontSize, r.lines = [{ text, x, y (baseline), width }], r.textAnchor

	applyFitToSvgText(svgTextEl, r); // optional helper that writes tspans

}

async function test1_svgBoxGem() {
	await loadAssets();
	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	let styles = { fill: '#2a9d8f', stroke: '#1d6f66', thickness: 2 };

	const sandwatch = [
		[12, 0], [88, 0],
		[56, 45], [88, 100],
		[12, 100], [44, 45]
	];

	for (const shape of [sandwatch]) { //},'circle','triangle','hex']){
		let svg = svgShape(shape, dParent, { fill: 'sienna' }, { fitUsingCircle: true });
		let d = mDom(dParent, { m: 10 });
		mAppend(d, svg);

		let res = fitTextToShape(svg, "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", {
			breakWord: false,      // Break only at word spaces
			fontFamily: 'Arial',
			fill: '#1e293b',
			padding: 6
		});
		// let res = fitTextToShape(svg, 'hallo'); // das ist aber wirklich lustig')
		// mAppend(svg, res)
		console.log(res)
	}

}
async function test1_svgBox() {
	await loadAssets();
	let dParent = mDom('dPage', { bg: 'blue', m: 12, flexbox: 'center stretch 4 row wrap' });
	let styles = { fill: '#2a9d8f', stroke: '#1d6f66', thickness: 2 };

	const sandwatch = [
		[12, 0], [88, 0],
		[56, 45], [88, 100],
		[12, 100], [44, 45]
	];

	svgShapeBox(
		sandwatch,
		'hallo das ist wirklich lustig sag ich dir',
		mDom(dParent),
		{ fill: '#f4a261', stroke: '#087f72', thickness: 2 },
		{ fontSize: 32, minFontSize: 6, padding: 2, breakWords: true, fitAlgorithm: 'flow' }
	);
	svgShapeBox(
		sandwatch,
		'hallo das ist wirklich lustig sag ich dir',
		mDom(dParent),
		{ fill: '#f4a261', stroke: '#087f72', thickness: 2 },
		{ fontSize: 32, minFontSize: 6, padding: 2, breakWords: true, fitAlgorithm: 'balanced' }
	);
	svgShapeBox(
		sandwatch,
		'hallo das ist wirklich lustig sag ich dir',
		mDom(dParent),
		{ fill: '#f4a261', stroke: '#087f72', thickness: 2 },
		{ fontSize: 32, minFontSize: 6, padding: 2, breakWords: true, fitAlgorithm: 'original' }
	);
	svgShapeBox(
		'circle',
		'hallo das ist wirklich lustig sag ich dir',
		mDom(dParent),
		{ fill: '#f4a261' },
		{ topDown: false, breakWords: false, minFontSize: 6, padding: 2 }
	);
	svgShapeBox(
		'triangle',
		'hallo das ist wirklich lustig sag ich dir',
		mDom(dParent),
		{ fill: '#f4a261' },
		{ padding: 2, fitAlgorithm: 'greedy' }
	);
	svgShapeBox(
		'triangle',
		'donaufahrt',
		mDom(dParent),
		{ fill: '#f4a261' },
		{ padding: 2, fitAlgorithm: 'balanced' }
	);
	return;
	svgShapeBox('hex', 'this is a forest', dParent, styles);
	// svgShapeBox('hex', 'FORESTCANOPY', dParent, styles, { breakWords: true });
	svgShapeBox('hex', 'FORESTCANOPY', dParent, styles, { padding: -2, breakWords: false });
	//Create a circle:
	// svgShapeBox('circle', 'GO HOME', dParent, { fill: '#f4a261' }, { textOffsetY: -3 });
	svgShapeBox('circle', 'HOME GO', dParent, { fill: '#f4a261' }, { breakWords: false });
	svgShapeBox(
		'triangle',
		'hallo das ist wirklich lustig sag ich dir',
		dParent,
		{ fill: '#f4a261' },
		{ breakWords: false, minFontSize: 6, padding: 0 }//, textOffsetY: 15}
	);
	svgShapeBox('triangle', 'hallo das ist wirklich lustig sag ich dir', dParent, { fill: '#f4a261' }, {
		fitUsingCircle: true,
		breakWords: false,
		minFontSize: 6,
	});
}
async function test1_svg() {
	await loadAssets();
	let d = mDom('dPage', { flexbox: 'center stretch 4 row wrap' });
	let boxStyles = { position: 'absolute', w100: true, top: 20, left: 0 };
	let diceStyles = { fg: 'red', w: 200 };
	showDice(2, 8, d);//, boxStyles, diceStyles);
	//showDice(4, 3, d, { bg: 'green', position: 'absolute', w100: true, top: 20, left: 0 });
}
async function test1_arrangement() {
	// await test1_packmulti();
	// let boxStyles = { bg: 'green', position: 'absolute', w100: true, top: 20, left: 0 };
	// let diceStyles = { fg: 'red' }
	// showDice(4, 3, 'dPage', boxStyles, diceStyles);

	let d = mDom('dPage', { position: 'absolute', bg: 'green', w: 100, h: 100 });
	let html =
		`<rect x="2" y="2" width="96" height="96" rx="18" ry="18" fill="url(#grad1)" stroke="#cbd5e1" stroke-width="2"" />`;

	let svg = svgCreate(d, { w: 100, h: 100 }, { viewBox: '0 0 100 100', html });
	let x = svgLinearGradient('grad1', [[0, 'red'], [.5, 'black'], [1, 'blue']]);
	svgAddDef(svg, x);
	d.appendChild(svg);

	console.log(svg);


}
async function test1_packboards() {
	await loadAssets();
	d = mDom(mDom('dPage'), { p: 4, bg: 'violet', w: 680, h: 600, flexbox: 'center stretch 4 row wrap' });
	for (const k in TessagonTypes) {
		let d0 = mDom(d);
		mDom(d0, { bfg: 'black' }, { html: k });
		let d1 = mDom(d0, { wmin: 500, flexbox: 'center stretch 4', bg: 'red', });
		let o = bTess(d1, TessagonTypes[k], 2, 3);
	}
}
async function test1_packmulti() {
	await loadAssets();
	let deck = cDeck52();
	// let d = mDom('dPage', { bg: 'red', w: 400, h: 400 });
	// let o = bTess(d, 'HexTessagon', 4, 3);
	d = mDom(mDom('dPage'), { p: 4, bg: 'violet', w: 680, h: 600, flexbox: 'center stretch 4 row wrap' });
	for (let i = 0; i < 10; i++) {
		if (coin(0)) {
			let d1 = mDom(d, { ph: 10, center: 1, flex: '1 1 auto', bfg: clrRand(), align: 'center' });
			let hand = rChoose(deck, rNumber(2, 8));
			let ui = hand.map(x => uiTypeCard52(x));
			let splay = rChoose(['diagonal', 'left', 'right', 'down', 'up']);
			cSplay(ui, d1, splay);
			//console.log(hand);
		} else {
			let tt = {
				DissectedTriangleBoard, Penta2Tessagon, SquareTri2Tessagon, BigHexTriBoardTessagon,
				DodecaBoardTessagon,
				FloretBoardTessagon,
				FloretCompleteBoardTessagon,
				DissectedCrossStarBoardTessagon,
				CrossStarBoard2,
			}
			let tessType = rChoose(Object.keys(tt));
			let d0 = mDom(d);
			mDom(d0, { bfg: 'black' }, { html: tessType });
			let d1 = mDom(d0, { flexbox: 'center stretch 4', bg: 'red', });
			let o = bTess(d1, tessType, 2, 3);
		}
	}
}
async function test1_packcards() {
	await loadAssets();
	let deck = cDeck52();

	let d = mDom('dPage', { w100: true, bg: 'blue' });
	d = mDom(d, { p: 4, bg: 'violet', w: 680, h: 600, flexbox: 'center stretch 4 row wrap' });
	for (let i = 0; i < 10; i++) {
		let hand = rChoose(deck, rNumber(2, 8));
		let ui = hand.map(x => uiTypeCard52(x));
		let d1 = mDom(d, { ph: 10, center: 1, flex: '1 1 auto', bfg: clrRand(), align: 'center' });
		cSplay(ui, d1, rChoose(['diagonal', 'left', 'right', 'down', 'up']));
		//console.log(hand);
	}
}
async function test1_styles() {
	let d = mDom('dPage', { w100: true, bg: 'blue' });
	//d=mDom(d,{w:200,h:200, grid:'4 4 4 stretch stretch'});
	d = mDom(d, { p: 4, bg: 'violet', w: 180, h: 400, flexbox: 'center stretch 4 row wrap' });
	let i = 0;
	for (const k in ColorByName) {
		let name = ColorByName[k];
		mDom(d, { ph: 10, center: 1, flex: '1 1 auto', bfg: k, align: 'center' }, { html: k });
		if (++i > 15) break;
	}
	return;
	showPalette('dPage', Object.values(ColorByName).slice(0, 20));
}
function testcat() {
	let d = mDom('dPage', { w: 140, h: 140 });
	let cat = `
			<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 200 240" width="200" height="240">
				<defs>
					<!-- Warm, softly shaded material -->
					<linearGradient id="bodyColor" x1="0" y1="0" x2="1" y2="0.2">
						<stop offset="0" stop-color="#B97845"/>
						<stop offset="0.16" stop-color="#D8A56D"/>
						<stop offset="0.48" stop-color="#E6BF8D"/>
						<stop offset="0.78" stop-color="#D8A56D"/>
						<stop offset="1" stop-color="#A96D40"/>
					</linearGradient>

					<!-- Top surface catches the light -->
					<linearGradient id="topLight" x1="0" y1="0" x2="0.7" y2="1">
						<stop offset="0" stop-color="#F0D2A4"/>
						<stop offset="1" stop-color="#D8A56D"/>
					</linearGradient>

					<!-- Subtle darker side, suggesting a carved solid piece -->
					<linearGradient id="sideShade" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stop-color="#A96D40"/>
						<stop offset="1" stop-color="#75482F"/>
					</linearGradient>

					<radialGradient id="eyeShine" cx="32%" cy="25%" r="75%">
						<stop offset="0" stop-color="#55504A"/>
						<stop offset="0.45" stop-color="#211D19"/>
						<stop offset="1" stop-color="#080807"/>
					</radialGradient>

					<filter id="softShadow" x="-30%" y="-20%"
									width="160%" height="160%">
						<feDropShadow dx="2" dy="4" stdDeviation="3"
													flood-color="#75482F" flood-opacity="0.2"/>
					</filter>
				</defs>

				<!-- Ground shadow 
				<ellipse cx="100" cy="224" rx="59" ry="7"
								fill="#75482F" opacity="0.14"/> -->

				<g filter="url(#softShadow)">
					<!-- Narrow side extrusion gives the silhouette depth -->
					<path d="
						M 38 205
						C 36 193 40 178 40 160
						C 40 145 44 132 54 121
						C 60 115 62 109 60 102
						C 53 94 52 82 53 65
						L 53 39
						L 68 23
						L 83 36
						Q 100 32 117 36
						L 132 23
						L 147 39
						L 147 65
						C 148 82 147 94 140 102
						C 138 109 140 115 146 121
						C 156 132 160 145 160 160
						C 160 178 164 193 162 205
						Q 161 213 151 214
						L 49 214
						Q 39 213 38 205 Z"
						transform="translate(5 3)"
						fill="url(#sideShade)" opacity="0.9"/>

					<!-- Main continuous cat silhouette -->
					<path d="
						M 38 205
						C 36 193 40 178 40 160
						C 40 145 44 132 54 121
						C 60 115 62 109 60 102
						C 53 94 52 82 53 65
						L 53 39
						L 68 23
						L 83 36
						Q 100 32 117 36
						L 132 23
						L 147 39
						L 147 65
						C 148 82 147 94 140 102
						C 138 109 140 115 146 121
						C 156 132 160 145 160 160
						C 160 178 164 193 162 205
						Q 161 213 151 214
						L 49 214
						Q 39 213 38 205 Z"
						fill="url(#bodyColor)"/>

					<!-- Soft light along the upper silhouette 
					<path d="
						M 57 67
						L 57 41
						L 68 29
						L 83 41
						Q 100 37 117 41
						L 132 29
						L 143 41
						L 143 67"
						fill="none" stroke="#F7DDB8"
						stroke-width="2.5" stroke-linecap="round"
						stroke-linejoin="round" opacity="0.6"/>-->

					<!-- Gentle face: simple black bead eyes -->
					<ellipse cx="82" cy="78" rx="6.2" ry="7.3"
									fill="url(#eyeShine)"/>
					<ellipse cx="118" cy="78" rx="6.2" ry="7.3"
									fill="url(#eyeShine)"/>

					<!-- Tiny eye highlights -->
					<circle cx="80" cy="75.5" r="1.5"
									fill="#FFFFFF" opacity="0.55"/>
					<circle cx="116" cy="75.5" r="1.5"
									fill="#FFFFFF" opacity="0.55"/>
				</g>
			</svg>
		`;
	let _catcat = `<svg xmlns="http://w3.org" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="15" dy="25" stdDeviation="15" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <g transform="translate(40, 20)">
    <!-- 3D Extrusion Sides (Solid Flat Color) -->
    <g fill="#A68966">
      <!-- Left body profile side thickness -->
      <path d="M 172 440 C 168 390, 190 350, 192 310 C 195 260, 215 250, 215 150 L 240 170 C 240 270, 220 280, 217 330 C 215 370, 193 410, 197 460 Z"/>
      <!-- Right body profile side thickness -->
      <path d="M 378 440 C 382 390, 360 350, 358 310 C 355 260, 335 250, 335 150 L 360 170 C 360 270, 380 280, 383 330 C 385 370, 407 410, 403 460 Z"/>
      <!-- Bottom thickness profile -->
      <path d="M 172 440 L 197 460 L 403 460 L 378 440 Z"/>
    </g>

    <!-- 3D Top Bevels (Solid Flat Color) -->
    <g fill="#D1BA9A">
      <polygon points="215,150 240,170 270,185 245,165"/>
      <polygon points="245,165 270,185 305,185 280,165"/>
      <polygon points="280,165 305,185 335,150 310,130"/>
    </g>

    <!-- Front Face Graphic with Drop Shadow Filter -->
    <g filter="url(#shadow)">
      <!-- Main Cat Body Silhouette Shape (Solid Flat Color) -->
      <path d="M 172 440 
               C 168 390, 190 350, 192 310 
               C 195 260, 215 250, 215 150 
               L 245 165 
               L 280 165 
               L 310 130 
               L 335 150 
               C 335 250, 355 260, 358 310 
               C 360 350, 382 390, 378 440 
               Z" 
            fill="#E0CBB0"/>

      <!-- Left Drilled Eye Hole -->
      <g transform="translate(250, 230)">
        <circle cx="0" cy="0" r="9" fill="#1A110B" />
        <path d="M -9 0 A 9 9 0 0 1 9 0 A 9 5 0 0 0 -9 0 Z" fill="#000000" opacity="0.4" />
      </g>

      <!-- Right Drilled Eye Hole -->
      <g transform="translate(295, 230)">
        <circle cx="0" cy="0" r="9" fill="#1A110B" />
        <path d="M -9 0 A 9 9 0 0 1 9 0 A 9 5 0 0 0 -9 0 Z" fill="#000000" opacity="0.4" />
      </g>
    </g>
  </g>
  </svg>`;
	d.innerHTML = cat;

}

async function test1_dice() {

	let d = mDom(dPage, { mtop: 250 }); //return;
	let x = await showDice(4, 7, d, { sz: 250 }); //, border:'green 25', fg: 'gold', bg: 'red', bg2: 'black' });
	console.log(x);
	// const [die1, die2] = await aniDice(4, 3, "linear", 5000);
	// console.log(die1 + die2);
}
async function test1_board() {
	let H = 5, V = 3;
	let colorPattern = 1;
	let palette = palettes.beach;// ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];

	dPage.innerHTML = '';//`<div id="tboard"></div>`;
	// mDom(dPage,{w100:true,h:200, flexbox:'row no-wrap 4 center start',justifyContent:'center'},{id:'tboard'});
	mDom(dPage, { p: 20, wv: 1, hv: 1, flexbox: 'row wrap 4 center start' }, { id: 'tboard' });


	const buildOpts = { H, V, h_cyclic: false, v_cyclic: false };
	if (colorPattern > 0) buildOpts.color_pattern = colorPattern;

	const board = buildTessellation("HexTessagon", buildOpts);
	const container = document.getElementById("tboard");
	const svg = renderHexBoard(board, container, {
		strokeWidth: "0.004",
		palette
	});

	addStreetsToTessellation(board, svg, { color: palette[4] });
	addCitiesToTessellation(board, svg, { color: palette[3], hoverColor: palette[4] });

	addLabels(board, svg, {
		labelCells: true,
		labelStreets: false,
		labelCities: false,
		showIsolatedCities: true
	});
	removeIsolatedCities(board, svg);

	console.log(board, svg);
	logBoardObjectClicks(board, svg);
	return { board, svg };
}

function test1() {

	let html = `  <div id="dTest1">
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

		let thresh = 2;
		const showIsolated = V > thresh ? false : document.getElementById('lblIsolated').checked;
		const labelOpts = {
			labelCells: V > thresh ? false : document.getElementById('lblCells').checked,
			labelStreets: V > thresh ? false : document.getElementById('lblStreets').checked,
			labelCities: V > thresh ? false : document.getElementById('lblCities').checked,
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
	let d = mDom('dPage', {}, { id: 'board' });
	showBoard(d);
}
function test0_board() {
	//let el = mBy('dTest1'); if (el) el.remove();
	let d = mDom('dPage', {}, { id: 'board' });
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
		let list = palVariety(2, ['yellow', 'red', 'green', 'indigo'], space, false);
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
