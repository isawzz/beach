

function geoStar(n) {
	/**
	 * Generates an array of [x, y] coordinates forming an n-pointed star.
	 * 
	 * @param {number} n - The number of outer spikes/points on the star.
	 * @returns {Array<[number, number]>} Array of [x, y] vertex coordinate pairs.
	 */
	const points = n * 2;
	const angleStep = Math.PI / n;

	return Array.from({ length: points }, (_, i) => {
		const a = -Math.PI / 2 + i * angleStep;
		const r = i % 2 ? 90 : 190;
		return [200 + r * Math.cos(a), 205 + r * Math.sin(a)];
	});
}