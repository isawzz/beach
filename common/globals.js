var DA = {};
var M = {};
var TO = {};
var UI = {};

var PolyClips = {
	hex: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
	sq: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
	tri: 'polygon(50% 0%, 100% 100%, 0% 100%)',
};

const STYLES = {
	align: 'text-align',
	bg: 'background-color',
	border: 'border',
	box: 'box-sizing',
	dir: 'flex-direction',
	family: 'font-family',
	fg: 'color',
	fz: 'font-size',
	gridCols: 'grid-template-columns',
	gridRows: 'grid-template-rows',
	h: 'height',
	hmax: 'max-height',
	hmin: 'min-height',
	m: 'margin',
	mabottom: 'margin-bottom',
	maleft: 'margin-left',
	maright: 'margin-right',
	matop: 'margin-top',
	pabottom: 'padding-bottom',
	paleft: 'padding-left',
	paright: 'padding-right',
	patop: 'padding-top',
	rounding: 'border-radius',
	w: 'width',
	wmax: 'max-width',
	wmin: 'min-width',
	weight: 'font-weight',
	z: 'z-index',
};

const NO_UNIT_STYLES = ['opa', 'flex', 'grow', 'shrink', 'grid', 'z', 'weight', 'order', 'index'];
