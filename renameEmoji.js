#!/usr/bin/env node
/**
 * renameEmoji.js - rename emoji_u<hex>.svg files to <emoji name>.svg
 *
 *   node renameEmoji.js <svgFolder> [mapFile] [--apply] [--aliases]
 *   node renameEmoji.js <svgFolder> --undo
 *
 *   svgFolder  folder with files like emoji_u1f947.svg or emoji_u1f468_200d_1f469.svg
 *   mapFile    diemo.yaml or diemo.json (default: diemo.yaml next to this script, then in
 *              the current folder). Every entry's key is the emoji name, its `uni` field
 *              the unicode, e.g.   1st_place_medal: { uni: 1f947, ... }
 *   --apply    really rename. Without it nothing is changed (dry run: it only prints)
 *   --aliases  some emoji have several names (buffalo / ox ...). The first name is used
 *              for the rename; with --aliases the other names get a copy of the file
 *   --undo     reverse the last --apply, using rename-log.json in the svg folder
 *
 * No packages needed. The variation selector (fe0f) is ignored when matching, so
 * emoji_u2708.svg matches the entry with uni 2708_fe0f.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const pos = args.filter(a => !a.startsWith('--'));
const dir = pos[0];
const APPLY = flags.has('--apply'), ALIASES = flags.has('--aliases'), UNDO = flags.has('--undo');

if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.log('usage: node renameEmoji.js <svgFolder> [diemo.yaml|diemo.json] [--apply] [--aliases]\n' +
              '       node renameEmoji.js <svgFolder> --undo');
  process.exit(1);
}
const LOG = path.join(dir, 'rename-log.json');

// ---------------------------------------------------------------- undo
if (UNDO) {
  if (!fs.existsSync(LOG)) { console.log('no rename-log.json in', dir); process.exit(1); }
  const log = JSON.parse(fs.readFileSync(LOG, 'utf8'));
  let n = 0;
  for (const { from, to, copy } of log.reverse()) {
    const dst = path.join(dir, to), src = path.join(dir, from);
    if (!fs.existsSync(dst)) continue;
    if (copy) fs.unlinkSync(dst);                       // a copy: just delete it
    else if (!fs.existsSync(src)) fs.renameSync(dst, src);
    else continue;
    n++;
  }
  fs.unlinkSync(LOG);
  console.log(`undone: ${n} files`);
  process.exit(0);
}

// ---------------------------------------------------------------- helpers
// "1f468_200d_1f469", "1F468-200D-1F469", "00a9", "2708_fe0f"  ->  "1f468_200d_1f469", "a9", "2708"
const norm = u => String(u).toLowerCase().split(/[-_ ]+/)
  .filter(h => h && h !== 'fe0f')
  .map(h => parseInt(h, 16).toString(16)).join('_');

const isHexUni = u => typeof u === 'string' && /^[0-9a-f]+([-_ ][0-9a-f]+)*$/i.test(u);   // skips bad entries (e.g. uni: child)
const safeName = s => s.replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_').trim();

function loadEntries(file) {                            // -> [[name, uni], ...]
  const text = fs.readFileSync(file, 'utf8');           // explicit utf8 (emoji and accents)
  const entries = [];
  if (file.toLowerCase().endsWith('.json')) {
    for (const [k, v] of Object.entries(JSON.parse(text))) if (v && isHexUni(v.uni)) entries.push([k, v.uni]);
  } else {                                              // minimal scan, enough for this file's layout
    let key = null, m;
    for (const line of text.split(/\r?\n/)) {
      if ((m = line.match(/^([^\s#][^:]*):\s*$/))) key = m[1].trim().replace(/^['"]|['"]$/g, '');
      else if (key && (m = line.match(/^\s+uni:\s*['"]?([0-9a-fA-F_\- ]+?)['"]?\s*$/))) { entries.push([key, m[1]]); key = null; }
    }
  }
  return entries;
}

// ---------------------------------------------------------------- main
let mapFile = pos[1];
if (!mapFile) mapFile = [path.join(__dirname, 'diemo.yaml'), 'diemo.yaml', path.join(__dirname, 'diemo.json'), 'diemo.json']
  .find(f => fs.existsSync(f));
if (!mapFile || !fs.existsSync(mapFile)) { console.log('map file not found: pass diemo.yaml or diemo.json as 2nd argument'); process.exit(1); }

const byUni = new Map();                                // normalized unicode -> [names]
for (const [name, uni] of loadEntries(mapFile)) {
  const n = norm(uni);
  if (!byUni.has(n)) byUni.set(n, []);
  byUni.get(n).push(name);
}
console.log(`map: ${mapFile} (${byUni.size} different emoji)`);

const files = fs.readdirSync(dir).filter(f => /^emoji_u[0-9a-f_]+\.svg$/i.test(f)).sort();
const taken = new Set(fs.readdirSync(dir).map(f => f.toLowerCase()));   // case-insensitive file systems
const plan = [], unmatched = [], skipped = [];

for (const f of files) {
  const names = byUni.get(norm(f.slice(7, -4)));        // strip "emoji_u" and ".svg"
  if (!names) { unmatched.push(f); continue; }
  names.forEach((name, i) => {
    if (i > 0 && !ALIASES) return;
    const to = safeName(name) + '.svg';
    if (taken.has(to.toLowerCase())) { skipped.push(`${f} -> ${to} (already exists)`); return; }
    taken.add(to.toLowerCase());
    plan.push({ from: f, to, copy: i > 0 });
  });
}

const show = (arr, n = 15) => { arr.slice(0, n).forEach(x => console.log('  ' + x)); if (arr.length > n) console.log(`  ... and ${arr.length - n} more`); };
console.log(`\n${files.length} emoji svg files found`);
console.log(`${plan.length} ${APPLY ? 'to do now' : 'would be renamed/copied (dry run)'}:`);
show(plan.map(p => `${p.from} ${p.copy ? 'copy to' : '->'} ${p.to}`));
if (unmatched.length) { console.log(`\n${unmatched.length} files have no entry in the map (left unchanged):`); show(unmatched); }
if (skipped.length) { console.log(`\n${skipped.length} skipped because the target name is already taken:`); show(skipped); }

if (!APPLY) { console.log('\nNothing changed. Run again with --apply to do it.'); process.exit(0); }

const done = [];
// copies first: they read the original file, which the rename would move away
for (const p of [...plan.filter(x => x.copy), ...plan.filter(x => !x.copy)]) {
  const src = path.join(dir, p.from), dst = path.join(dir, p.to);
  if (p.copy) fs.copyFileSync(src, dst); else fs.renameSync(src, dst);
  done.push(p);
}
fs.writeFileSync(LOG, JSON.stringify(done, null, 1));
console.log(`\ndone: ${done.length} files. Undo with: node renameEmoji.js "${dir}" --undo`);
