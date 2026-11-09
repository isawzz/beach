

function geoStar(n) {
	const points = n * 2;
	const angleStep = Math.PI / n;

	return Array.from({ length: points }, (_, i) => {
		const a = -Math.PI / 2 + i * angleStep;
		const r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});
}