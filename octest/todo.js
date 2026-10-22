
//#region colors GOOD
function clrClosest(hex, hexlist) {
  let [L, A, B] = clrRgbToLab(...clrHexToRgb(hex)), best = null, bd = Infinity;
  for (let h of hexlist) {
    let [l, a, b] = clrRgbToLab(...clrHexToRgb(h));
    let d = (L - l) ** 2 + (A - a) ** 2 + (B - b) ** 2;
    if (d < bd) { bd = d; best = h; }
  }
  return best;
}
function clrContrasting(colStr, darkColor = '#000000', lightColor = '#ffffff') {
  /* Returns ideal text color (darkColor or lightColor) for high contrast against colStr background */
  let hex = clrHex(colStr);
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? darkColor : lightColor;
}

//#endregion

//#region colors rest
function clrBuildGrid(dict, bits = 6) {
  let keys = Object.keys(dict), names = keys.map(k => dict[k]);
  let labs = keys.map(k => clrRgbToLab(...clrHexToRgb(k)));
  let s = 8 - bits, n = 1 << bits, half = (1 << s) / 2, grid = new Array(n ** 3);
  for (let r = 0; r < n; r++)
    for (let g = 0; g < n; g++)
      for (let b = 0; b < n; b++) {
        let [L, A, B] = clrRgbToLab((r << s) + half, (g << s) + half, (b << s) + half), bd = Infinity, bi = 0;
        for (let i = 0; i < labs.length; i++) {
          let c = labs[i], d = (L - c[0]) ** 2 + (A - c[1]) ** 2 + (B - c[2]) ** 2;
          if (d < bd) { bd = d; bi = i; }
        }
        grid[(r * n + g) * n + b] = names[bi];
      }
  return grid;
}
function clrBuildGridRgb(dict, bits = 6) {
  let keys = Object.keys(dict), rgb = keys.map(clrHexToRgb), names = keys.map(k => dict[k]);
  let s = 8 - bits, n = 1 << bits, half = (1 << s) / 2, grid = new Array(n ** 3);
  for (let r = 0; r < n; r++)
    for (let g = 0; g < n; g++)
      for (let b = 0; b < n; b++) {
        let R = (r << s) + half, G = (g << s) + half, B = (b << s) + half, bd = Infinity, bi = 0;
        for (let i = 0; i < rgb.length; i++) {
          let c = rgb[i], d = (R - c[0]) ** 2 + (G - c[1]) ** 2 + (B - c[2]) ** 2;
          if (d < bd) { bd = d; bi = i; }
        }
        grid[(r * n + g) * n + b] = names[bi];
      }
  return grid;
}
function clrClosestFast(hex, grid, bits = 6) {
  //console.log('in', hex);
  let name = clrClosestNameFast(hex, grid, bits);
  //console.log('out', colorByName[name]);
  console.assert(name)
  return ColorByName[name];
}
function clrClosestName(hex, dict) {
  let [r, g, b] = clrHexToRgb(hex), best = null, bestDist = Infinity;
  for (let key in dict) {
    let [r2, g2, b2] = clrHexToRgb(key);
    let d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bestDist) { bestDist = d; best = dict[key]; }
  }
  return best;
}
function clrClosestNameFast(hex, grid, bits = 6) {
  let [r, g, b] = clrHexToRgb(hex), s = 8 - bits, n = 1 << bits;
  return grid[(((r >> s) * n + (g >> s)) * n + (b >> s)) % grid.length];
}
function _clrText(hex, list = ['#ffffff', '#000000']) {
  let best = null, bc = -1;
  for (let c of list) {
    let k = clrContrast(hex, c);
    if (k > bc) { bc = k; best = c; }
  }
  return best;
}



function clrName(colStr) {
  /* Lookup function returning exact or closest color name string from dictionary */
  let hex = clrHex(colStr).toLowerCase().replace('#', '');
  if (typeof dicolor !== 'undefined' && dicolor.webcolors) {
    for (let key in dicolor.webcolors) {
      if (dicolor.webcolors[key].toLowerCase().replace('#', '') === hex) {
        return key;
      }
    }
  }
  return hex;
}

function makeColorFinder(dict) {
  let keys = Object.keys(dict), n = keys.length, lab = new Float64Array(n * 3);
  keys.forEach((k, i) => lab.set(clrRgbToLab(...clrHexToRgb(k)), i * 3));
  return hex => {
    let [L, A, B] = clrRgbToLab(...clrHexToRgb(hex)), bd = Infinity, bi = 0;
    for (let i = 0, j = 0; i < n; i++, j += 3) {
      let d = (L - lab[j]) ** 2 + (A - lab[j + 1]) ** 2 + (B - lab[j + 2]) ** 2;
      if (d < bd) { bd = d; bi = i; }
    }
    return keys[bi];   // the hex, not the name
  };
}

function getSvgFillColors(text) {
  let colors = new Set();
  // fill="#abc" attributes, and fill:#abc inside style="" or <style> blocks
  for (let m of text.matchAll(/fill\s*[=:]\s*["']?\s*([^"';}\s>]+)/gi)) {
    colors.add(m[1].toLowerCase());
  }
  colors.delete('none');
  return [...colors];
}
//#endregion





