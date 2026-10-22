
function clrClosest(hex, list, fDist) {
  if (!list.length) return null;

  return list.reduce((best, color) =>
    fDist(hex, color) < fDist(hex, best) ? color : best
  );
}

function clrMaxContrast(hex, list, fDist) {
  if (!list.length) return null;

  return list.reduce((best, color) =>
    fDist(hex, color) > fDist(hex, best) ? color : best
  );
}

function clrRand() {
  return "#" + Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, "0");
}










