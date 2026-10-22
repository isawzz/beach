
async function sampleSvgText(key) {
	if (!M.emo) await loadAssets();
	let o = M.emo[key] || M.emo.ambulance;
	let part = stringBefore(o.uni, '_');
	return await loadText(`assets/svg/emoji_u${part}.svg`);
}

