

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


function justDark(hex, space = "oklch") {
  hex = clrHex(hex);

  const white = "#ffffff";
  const black = "#000000";
  const prefersWhite = color => clrContrast(color, white) > clrContrast(color, black);

  if (prefersWhite(hex)) return hex;

  let low = 0;
  let high = 1;

  // Find the smallest mix toward black that makes white slightly higher contrast.
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const color = clrMixMany(hex, black, [mid], space)[0];

    if (prefersWhite(color)) high = mid;
    else low = mid;
  }

  return clrMixMany(hex, black, [high], space)[0];
}
function justDark(hex, space = "oklch") {
  hex = clrHex(hex);

  const prefersWhite = color =>
    clrText(color)?.toLowerCase() === "#ffffff";

  if (prefersWhite(hex)) return hex;

  let low = 0;
  let high = 1;

  // Find the least darkening that makes clrText choose white.
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const color = clrMixMany(hex, "#000000", [mid], space)[0];

    if (prefersWhite(color)) high = mid;
    else low = mid;
  }

  return clrMixMany(hex, "#000000", [high], space)[0];
}
function rColor(h = [0, 360], s = 100, l = 50) {
  const hue = isList(h) ? rChoose(range(...h)) : h;
  const sat = isList(s) ? rChoose(range(...s)) : s;
  const li = isList(l) ? rChoose(range(...l)) : l;
  console.log(hue, sat, li);
  return clrHslToHex(hue, sat, li);
}
function clrRandom() { return rChoose(Object.keys(ColorByHex)); }

function sortColors(hexlist, fDistance) {
  if (hexlist.length < 2) return [...hexlist];

  const remaining = hexlist.slice(1);
  const sorted = [hexlist[0]];

  while (remaining.length) {
    const current = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let nearestDistance = fDistance(current, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const distance = fDistance(current, remaining[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    sorted.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return sorted;
}

function clrDistance(hex1, hex2) {
  const lab1 = clrRgbToLab(...clrHexToRgb(hex1));
  const lab2 = clrRgbToLab(...clrHexToRgb(hex2));

  return Math.hypot(
    lab1[0] - lab2[0],
    lab1[1] - lab2[1],
    lab1[2] - lab2[2]
  );
}
function clrDistanceRgb(hex1, hex2) {
  const a = clrHexToRgb(hex1);
  const b = clrHexToRgb(hex2);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function clrDistanceLab(hex1, hex2) {
  return clrDistance3(
    clrRgbToLab(...clrHexToRgb(hex1)),
    clrRgbToLab(...clrHexToRgb(hex2))
  );
}

function clrDistanceOklab(hex1, hex2) {
  return clrDistance3(
    clrRgbToOklab(...clrHexToRgb(hex1)),
    clrRgbToOklab(...clrHexToRgb(hex2))
  );
}

function clrDistance3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function clrDistanceHsl(hex1, hex2) {
  const [h1, s1, l1] = clrRgbToHsl(...clrHexToRgb(hex1));
  const [h2, s2, l2] = clrRgbToHsl(...clrHexToRgb(hex2));

  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
  const ds = Math.abs(s1 - s2) / 100;
  const dl = Math.abs(l1 - l2) / 100;

  return Math.hypot(dh, ds, dl);
}
function clrDistanceCiede2000(hex1, hex2) {
  const [L1, a1, b1] = clrRgbToLab(...clrHexToRgb(hex1));
  const [L2, a2, b2] = clrRgbToLab(...clrHexToRgb(hex2));

  const rad = deg => deg * Math.PI / 180;
  const deg = rad => (rad * 180 / Math.PI + 360) % 360;
  const meanHue = (h1, h2, c1, c2) => {
    if (!c1 || !c2) return h1 + h2;
    if (Math.abs(h1 - h2) <= 180) return (h1 + h2) / 2;
    return h1 + h2 < 360
      ? (h1 + h2 + 360) / 2
      : (h1 + h2 - 360) / 2;
  };

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));

  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp1 = deg(Math.atan2(b1, ap1));
  const hp2 = deg(Math.atan2(b2, ap2));

  const dL = L2 - L1;
  const dC = Cp2 - Cp1;

  let dh = 0;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp2 - hp1) <= 180) dh = hp2 - hp1;
    else if (hp2 - hp1 > 180) dh = hp2 - hp1 - 360;
    else dh = hp2 - hp1 + 360;
  }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(rad(dh / 2));

  const Lbar = (L1 + L2) / 2;
  const Cpbar = (Cp1 + Cp2) / 2;
  const hpbar = meanHue(hp1, hp2, Cp1, Cp2);

  const T =
    1
    - 0.17 * Math.cos(rad(hpbar - 30))
    + 0.24 * Math.cos(rad(2 * hpbar))
    + 0.32 * Math.cos(rad(3 * hpbar + 6))
    - 0.20 * Math.cos(rad(4 * hpbar - 63));

  const SL = 1 + 0.015 * (Lbar - 50) ** 2
    / Math.sqrt(20 + (Lbar - 50) ** 2);
  const SC = 1 + 0.045 * Cpbar;
  const SH = 1 + 0.015 * Cpbar * T;

  //const deltaTheta = 30 * Math.exp(-((hpbar - 275) / 25) ** 2);
  const deltaTheta = 30 * Math.exp(-(((hpbar - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cpbar ** 7 / (Cpbar ** 7 + 25 ** 7));
  const RT = -RC * Math.sin(rad(2 * deltaTheta));

  const l = dL / SL;
  const c = dC / SC;
  const h = dH / SH;

  return Math.sqrt(l * l + c * c + h * h + RT * c * h);
}

function clrTrans(c, alpha) {
  let hex = clrHex(c);
  if (alpha == 1) return hex;
  const opacity = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
  return `${hex}${opacity}`;
}
function clrContrast(hex1, hex2) {
  let a = clrLuminance(hex1), b = clrLuminance(hex2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function clrContrastRatio(hex1, hex2) {
  // 1. WCAG contrast ratio: best for readable text/background pairs.
  const luminance = hex => {
    const [r, g, b] = clrHexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const [a, b] = [luminance(hex1), luminance(hex2)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
function clrLightnessContrast(hex1, hex2) {
  // 2. Lightness contrast in LAB: chooses the color with the biggest
  // perceptual lightness difference.
  const L1 = clrRgbToLab(...clrHexToRgb(hex1))[0];
  const L2 = clrRgbToLab(...clrHexToRgb(hex2))[0];
  return Math.abs(L1 - L2);
}
function clrHueContrast(hex1, hex2) {
  // 3. Complementary contrast: prefers colors opposite in hue,
  // while also rewarding saturation.
  const [h1, s1] = clrRgbToHsl(...clrHexToRgb(hex1));
  const [h2, s2] = clrRgbToHsl(...clrHexToRgb(hex2));
  const hueGap = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  return (hueGap / 180) * (s1 / 100) * (s2 / 100);
}
function clrBestBy(hex, list, scoreFn) {
  if (!list.length) return null;

  return list.reduce((best, color) =>
    scoreFn(hex, color) > scoreFn(hex, best) ? color : best
  );
}
function clrDarker(c, percent = 10) {
  /* Returns a new darker HEX string adjusted by the given percentage */
  let hex = clrHex(c);
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  let factor = 1 - percent / 100;
  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function clrLighter(c, percent = 10) {
  /* Returns a new lighter HEX string adjusted by the given percentage */
  let hex = clrHex(c);
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  let factor = percent / 100;
  r = Math.min(255, Math.floor(r + (255 - r) * factor));
  g = Math.min(255, Math.floor(g + (255 - g) * factor));
  b = Math.min(255, Math.floor(b + (255 - b) * factor));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function clrDetect(hex, dict) {
  console.assert(hex.startsWith('#'), 'no hex', hex);
  if (nundef(dict)) dict = ColorByHex;
  if (nundef(CLR_LAB.lab)) {
    let keys = CLR_LAB.keys = Object.keys(dict), n = keys.length;
    CLR_LAB.lab = new Float64Array(n * 3);
    keys.forEach((k, i) => CLR_LAB.lab.set(clrRgbToLab(...clrHexToRgb(k)), i * 3));
  }
  let [L, A, B] = clrRgbToLab(...clrHexToRgb(hex)), bd = Infinity, bi = 0, n = CLR_LAB.keys.length, lab = CLR_LAB.lab;
  for (let i = 0, j = 0; i < n; i++, j += 3) {
    let d = (L - lab[j]) ** 2 + (A - lab[j + 1]) ** 2 + (B - lab[j + 2]) ** 2;
    if (d < bd) { bd = d; bi = i; }
  }
  //console.log(CLR_LAB.keys[bi],bi,ColorByHex[CLR_LAB.keys[bi]]);
  return CLR_LAB.keys[bi];   // the hex, not the name
}
function clrHex(c) {
  if (!c) return '#000000';
  let str = c.trim().toLowerCase();
  if (str[0] == '#') {
    return str.length == 7 ? str : str.length == 9 ? str.slice(0, 7) : ('#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]);
  }
  else if (ColorByName[str]) return ColorByName[str];
  console.assert(false, 'no color for', str);
}
function clrHue(hex) { return clrRgbToHsl(...clrHexToRgb(hex))[0]; }

function clrLightness(hex) { return clrRgbToLab(...clrHexToRgb(hex))[0]; }

function clrLuminance(hex) {
  let [r, g, b] = clrHexToRgb(hex).map(v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function clrFromLin(v) { return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); }

function clrRgbToOklab(r, g, b) {
  let R = CLR_LIN[Math.round(r)], G = CLR_LIN[Math.round(g)], B = CLR_LIN[Math.round(b)];
  let l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  let m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  let s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
  1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
  0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function clrOklabToLin(L, a, b) {   // linear sRGB 0..1, may fall outside that range
  let l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  let m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  let s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
  -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
  -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
function clrOklabToRgb(L, a, b) { return clrOklabToLin(L, a, b).map(clrFromLin); }

function clrToPolar([L, a, b]) { return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360]; }

function clrFromPolar([L, C, H]) { let r = H * Math.PI / 180; return [L, C * Math.cos(r), C * Math.sin(r)]; }

function clrHexToHsl(hex) {
  let v = CLR_HSL_CACHE.get(hex);
  if (!v) {
    if (CLR_HSL_CACHE.size >= 10000) CLR_HSL_CACHE.clear();   // keep memory bounded
    v = clrRgbToHsl(...clrHexToRgb(hex));
    //console.log('hallo!!!', v)
    CLR_HSL_CACHE.set(hex, v);
  }
  return v.slice();                                          // copy, so callers can't corrupt the cache
}
function clrHexToRgb(hex) {
  let h = hex[0] == '#' ? hex.slice(1) : hex;
  if (h.length == 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  let n = parseInt(h, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function clrHslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;//console.log(s,l)
  return clrRgbToHex(...clrHslToRgb(h, clrClamp(s, 0, 100), clrClamp(l, 0, 100)));
}
function clrHslToRgb(h, s, l) {
  s /= 100; l /= 100;
  let k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  let f = n => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function clrLabToRgb(L, a, b) {
  let fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  let inv = t => t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27);
  let x = inv(fx) * 0.95047, y = inv(fy), z = inv(fz) * 1.08883;
  let gam = v => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  return [gam(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
  gam(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
  gam(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)];
}
function clrRgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => clrClamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function clrRgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2, h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx == r ? ((g - b) / d) % 6 : mx == g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, s * 100, l * 100];
}
function clrRgbToLab(r, g, b) {
  let lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  let R = lin(r), G = lin(g), B = lin(b);
  let x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  let y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
  let z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883;
  let f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  let fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function clrShiftRgb(hex, i, d) {
  let c = clrHexToRgb(hex); c[i] += d;
  return clrRgbToHex(...c);
}
function clrShiftHsl(hex, i, d) {
  let c = clrRgbToHsl(...clrHexToRgb(hex)); c[i] += d;
  c[0] = ((c[0] % 360) + 360) % 360; c[1] = clrClamp(c[1], 0, 100); c[2] = clrClamp(c[2], 0, 100);
  return clrRgbToHex(...clrHslToRgb(...c));
}
function clrShiftLab(hex, i, d) {
  let c = clrRgbToLab(...clrHexToRgb(hex)); c[i] += d; c[0] = clrClamp(c[0], 0, 100);
  return clrRgbToHex(...clrLabToRgb(...c));
}
function clrClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function clrShiftR(hex, d) { return clrShiftRgb(hex, 0, d); }
function clrShiftG(hex, d) { return clrShiftRgb(hex, 1, d); }
function clrShiftB(hex, d) { return clrShiftRgb(hex, 2, d); }
function clrShiftH(hex, d) { return clrShiftHsl(hex, 0, d); }
function clrShiftS(hex, d) { return clrShiftHsl(hex, 1, d); }
function clrShiftL(hex, d) { return clrShiftHsl(hex, 2, d); }
function clrShiftLabL(hex, d) { return clrShiftLab(hex, 0, d); }
function clrShiftLabA(hex, d) { return clrShiftLab(hex, 1, d); }
function clrShiftLabB(hex, d) { return clrShiftLab(hex, 2, d); }

function clrMix(hex1, hex2, t = 0.5, space = 'lab') { return clrMixMany(hex1, hex2, [t], space)[0]; }
function clrMixMany(hex1, hex2, ts, space = 'lab') {
  let sp = CLR_SPACES[space];
  if (!sp) throw new Error('clrMix: unknown space ' + space);
  let c1 = clrHexToRgb(hex1), c2 = clrHexToRgb(hex2), a = sp.to(c1), b = sp.to(c2), h = sp.hue, dh = 0;
  if (h !== undefined) {
    if (a[sp.chroma] < sp.eps) a[h] = b[h]; else if (b[sp.chroma] < sp.eps) b[h] = a[h];   // gray has no hue
    dh = ((b[h] - a[h] + 540) % 360) - 180;                                                 // shortest way round
  }
  return ts.map(t => {
    t = clrClamp(t, 0, 1);
    if (t == 0) return clrRgbToHex(...c1);
    if (t == 1) return clrRgbToHex(...c2);
    let m = a.map((v, i) => v + (b[i] - v) * t);
    if (h !== undefined) m[h] = ((a[h] + dh * t) % 360 + 360) % 360;
    return clrRgbToHex(...sp.from(m));
  });
}
function clrName(c) {
  let hex = clrHex(c);
  return ColorByHex[clrDetect(hex)];
}
function clrPrimary(c) {
  let hex = clrHex(c);
  let hsl = clrRgbToHsl(...clrHexToRgb(hex));
  return clrHslToHex(hsl[0], 100, 50);
}
function clrReplace(text, func) {
  return text.replace(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi, func);
}
function clrReplaceCycle(text, list, perOccurrence = false) {
  if (!list.length) return text;
  let map = new Map(), i = 0;
  return clrReplace(text, h => {
    let key = h.toLowerCase();
    if (perOccurrence || !map.has(key)) map.set(key, list[i++ % list.length]);
    return map.get(key);
  });
}
function clrText(c, list = ['#ffffff', '#000000'], minContrast = 1.8) {
  //favors white. set minContrast to 3 for more black
  let hex = clrHex(c)
  let best = null, bl = -1, fallback = null, fc = -1;
  for (let c of list) {
    let k = clrContrast(hex, c), l = clrLuminance(c);
    if (k >= minContrast && l > bl) { bl = l; best = c; }   // readable: keep the lightest
    if (k > fc) { fc = k; fallback = c; }                   // otherwise: highest contrast
  }
  return best ?? fallback;
}
function clrWarmer(hex, amt = 0.08) {
  let [r, g, b] = clrHexToRgb(hex);
  return clrRgbToHex(r * (1 + amt), g, b * (1 - amt));
}

function palMix(hex1, hex2, n = 5, space = 'lab', ignoreExtremes = false) {
  [hex1, hex2] = [clrHex(hex1), clrHex(hex2)];
  if (ignoreExtremes) { n += 2; }
  if (n < 1) return [];
  let res = clrMixMany(hex1, hex2, Array.from({ length: n }, (_, i) => n > 1 ? i / (n - 1) : 0), space);
  if (ignoreExtremes) { res = res.slice(1, res.length - 1); }
  return res;
}
function palShade(hex, n = 5, space = 'hsl') {
  // hsl | lch | oklch
  hex = clrHex(hex);
  let sp = CLR_SPACES[space], li = { hsl: 2, lch: 0, oklch: 0 }[space], top = space == 'oklch' ? 1 : 100;
  if (!sp || li === undefined) throw new Error('palShade: space must be hsl, lch or oklch');
  if (n < 2) return n == 1 ? [clrRgbToHex(...clrHexToRgb(hex))] : [];
  let c = sp.to(clrHexToRgb(hex)), ci = sp.chroma, C0 = c[ci];
  if (space == 'hsl') c[ci] = Math.min(c[ci], 100);          // float noise can give 100.00000000000001
  let fits = v => sp.from(v).every(x => x >= -0.005 && x <= 255.005);
  return Array.from({ length: n }, (_, i) => {
    let v = c.slice(); v[li] = top * (1 - i / (n - 1));
    if (space != 'hsl' && !fits(v)) {       // too colorful for this lightness: shrink chroma until it fits
      let lo = 0, hi = C0;
      for (let k = 0; k < 14; k++) { v[ci] = (lo + hi) / 2; if (fits(v)) lo = v[ci]; else hi = v[ci]; }
      v[ci] = lo;
    }
    return clrRgbToHex(...sp.from(v));
  });
}
function palFromText(text) {
  let matches = text.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi) || [];
  return [...new Set(matches.map(h => h.toLowerCase()))];
}
function palPrepCanvas(img, maxPixels = 100) {
  // 1. Downscale for fast buffer extraction
  let w = img.naturalWidth || img.width || 100;
  let h = img.naturalHeight || img.height || 100;

  let cvs = document.createElement('canvas');
  cvs.width = maxPixels;
  cvs.height = Math.max(1, Math.round((h * maxPixels) / w));

  let ctx = cvs.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
  let d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;

  return { cvs, ctx, d };
}
function palClaude(img, n = 5, minDist = 10, bits = 4, maxPixels = 100) {
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);

  let s = 8 - bits, bins = new Map();
  for (let i = 0; i < d.length; i += 4) {                 // 1. count pixels per coarse bucket
    if (d[i + 3] < 128) continue;                         //    (skip transparent ones)
    let key = ((d[i] >> s) << (2 * bits)) | ((d[i + 1] >> s) << bits) | (d[i + 2] >> s);
    let b = bins.get(key);
    if (!b) bins.set(key, b = [0, 0, 0, 0]);
    b[0]++; b[1] += d[i]; b[2] += d[i + 1]; b[3] += d[i + 2];
  }
  let clusters = [];                                      // 2. merge buckets that look alike, biggest first
  for (let b of [...bins.values()].sort((a, c) => c[0] - a[0])) {
    let lab = clrRgbToLab(b[1] / b[0], b[2] / b[0], b[3] / b[0]);
    let c = clusters.find(c => (c.lab[0] - lab[0]) ** 2 + (c.lab[1] - lab[1]) ** 2 + (c.lab[2] - lab[2]) ** 2 < minDist ** 2);
    if (c) { c.n += b[0]; c.r += b[1]; c.g += b[2]; c.b += b[3]; }
    else clusters.push({ lab, n: b[0], r: b[1], g: b[2], b: b[3] });
  }
  return clusters.sort((a, c) => c.n - a.n).slice(0, n)   // 3. most frequent first, as average color
    .map(c => clrRgbToHex(c.r / c.n, c.g / c.n, c.b / c.n));
}
function palGemini(img, count = 5, tolerance = 16, maxPixels = 100) {
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);
  let imgData = d;
  let counts = {};

  for (let i = 0; i < imgData.length; i += 4) {
    let a = imgData[i + 3];
    if (a < 128) continue; // Skip transparent/semi-transparent pixels

    // Quantize RGB values by tolerance step to group similar shades
    let r = Math.round(imgData[i] / tolerance) * tolerance;
    let g = Math.round(imgData[i + 1] / tolerance) * tolerance;
    let b = Math.round(imgData[i + 2] / tolerance) * tolerance;

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    counts[hex] = (counts[hex] || 0) + 1;
  }

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, count);
}
function palMostDifferent(img, count = 5, acceptedMax = 2500, maxPixels = 100) {
  // /* Extracts n distinct colors using CIELAB max-min distance with an early-exit acceptedMax threshold */
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);
  let bins = new Map();

  // 2. Aggregate pixels into 4-bit truncated buckets
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // Skip transparent pixels
    let r = d[i] & 0xf0;
    let g = d[i + 1] & 0xf0;
    let b = d[i + 2] & 0xf0;
    let key = (r << 16) | (g << 8) | b;

    let bData = bins.get(key);
    if (!bData) {
      bins.set(key, { b: key, lab: clrRgbToLab(r, g, b), n: 1, r: r, g: g });
    } else {
      bData.n++;
    }
  }

  let candidates = [...bins.values()];
  if (candidates.length <= count) {
    return candidates.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
  }

  // 3. Anchor with the most frequent color
  candidates.sort((a, b) => b.n - a.n);
  let selected = [candidates[0]];
  candidates.shift();

  // 4. Distance sampling loop with acceptedMax early exit
  while (selected.length < count && candidates.length > 0) {
    let maxMinDist = -1;
    let bestIdx = -1;

    for (let i = 0; i < candidates.length; i++) {
      let cand = candidates[i];
      let minDist = Infinity;

      for (let s of selected) {
        let dist = (cand.lab[0] - s.lab[0]) ** 2 +
          (cand.lab[1] - s.lab[1]) ** 2 +
          (cand.lab[2] - s.lab[2]) ** 2;
        if (dist < minDist) minDist = dist;
      }

      // Early exit if distance threshold is satisfied
      if (minDist >= acceptedMax) {
        bestIdx = i;
        break;
      }

      // Track current best candidate if threshold is not reached yet
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      selected.push(candidates[bestIdx]);
      candidates.splice(bestIdx, 1);
    } else {
      break;
    }
  }

  return selected.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
}
function palVariety(n, anchors = ["#ff0000", "#ffff00", "#00ffff", "#0000ff", "#ff00ff",], space = 'lab', includeAnchors = true) {
  let len = anchors.length;
  // let betweenEach = Math.ceil(n / (len-1));console.log(betweenEach);
  let res = includeAnchors ? [anchors[0]] : [];
  for (let i = 0; i < len - 1; i++) {
    let a = anchors[i];
    let b = anchors[i + 1];
    res = res.concat(palMix(a, b, n, space, true));
    if (includeAnchors) res.push(b);

  }
  return res;
}








