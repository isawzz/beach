
function sortColorsAsGradient(colors) {
  const toOklab = hex => clrRgbToOklab(...clrHexToRgb(hex));

  return [...colors]
    .map(hex => {
      const [L, a, b] = toOklab(hex);
      return { hex, L, hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
    })
    .sort((x, y) => x.hue - y.hue || x.L - y.L)
    .map(color => color.hex);
}
function sortColorsByLabDistance(colors) {
  if (colors.length < 2) return [...colors];

  const lab = colors.map(hex => clrRgbToLab(...clrHexToRgb(hex)));
  const distance = (a, b) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  const remaining = new Set(colors.map((_, i) => i));
  const sorted = [];
  let current = 0; // Start with the first input color

  while (remaining.size) {
    sorted.push(colors[current]);
    remaining.delete(current);

    if (!remaining.size) break;

    let nearest = -1;
    let minDistance = Infinity;

    for (const i of remaining) {
      const d = distance(lab[current], lab[i]);
      if (d < minDistance) {
        minDistance = d;
        nearest = i;
      }
    }

    current = nearest;
  }

  return sorted;
}
function findDuplicateValuesInDict(dict) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of Object.values(dict)) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }

  return [...duplicates];
}
function createBgaLayout(dParent) {
  dParent.innerHTML = '';

  // Root Shell: Full height, flex column to isolate top prompt bar
  const root = mDom(dParent, {
    w: '100%',
    h: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bg: '#202020'
  });

  // 1. TOP PROMPT BAR (Always visible at the top)
  const promptBar = mDom(root, {
    minH: 48,
    bg: 'red',
    fg: '#ffffff',
    display: 'flex',
    align: 'center',
    justify: 'center',
    gap: 12,
    p: [6, 16],
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  });

  // Workspace Container: Split horizontally into Main Table Area + Sidebar
  const workspace = mDom(root, {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden'
  });

  // 2. MAIN COLUMN (Main board, Active Player, Opponents - Scrollable)
  const mainCol = mDom(workspace, {
    flex: 1,
    overflowY: 'auto',
    p: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  });

  // 2a. Main Table / Shared Area
  const mainTable = mDom(mainCol, {
    bg: '#2d5a3f',
    r: 8,
    p: 16,
    minH: 300,
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
  });

  // 2b. Active Player Area (My Hand / My Board)
  const myArea = mDom(mainCol, {
    bg: '#1e2836',
    r: 8,
    p: 16,
    border: '2px solid #3b82f6'
  });

  // 2c. Opponents Container (Scrollable section below active player)
  const opponentsArea = mDom(mainCol, {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  });

  // 3. RIGHT SIDEBAR (Stats & Game History Log)
  const sidebar = mDom(workspace, {
    w: 280,
    minW: 240,
    bg: '#181818',
    borderLeft: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  });

  // 3a. Stats Panel (Top half of sidebar)
  const statsPanel = mDom(sidebar, {
    flex: '0 0 auto',
    maxH: '40%',
    p: 12,
    overflowY: 'auto',
    borderBottom: '1px solid #333'
  });

  // 3b. History / Log Panel (Bottom half of sidebar)
  const historyLog = mDom(sidebar, {
    flex: 1,
    p: 12,
    overflowY: 'auto',
    fg: '#cccccc',
    fontSize: 13
  });

  return {
    root,
    promptBar,
    mainTable,
    myArea,
    opponentsArea,
    statsPanel,
    historyLog
  };
}
function showPalette(d, colors, approximate=false) {
  let i=0;
  for (var c of colors) {
    c = clrHex(c);
    let name = approximate?clrName(c):ColorByHex[c]??'';
    // let bg=c;
    // let fg=clrText(c); console.log(fg);
    // let fw=fg=='#000000'?'700':'400';
    // let dmini = mDom(d, { fw, bg, fg, wmin: 40, hmin: 40, padding: 2 }, { html: name + ' ' + c + ` (${i++})` });
    let dmini = mDom(d, { bf:c, wmin: 40, hmin: 40, padding: 2 }, { html: name + ' ' + c + ` (${i++})` });
  }
}
