
// Extract type reference markdown into the DATA table used by client.js.
// Usage: node scripts/build-types.mjs [referencesDir]
// Rewrites src/types.final.json (full text, no truncation) and prints stats.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const refsDir = process.argv[2] || join(root, 'skill/references');
const finalPath = join(root, 'src/types.final.json');
const prev = existsSync(finalPath) ? JSON.parse(readFileSync(finalPath, 'utf8')) : [];
const prevBySlug = new Map(prev.map((t) => [t.slug, t]));

function clean(s) {
  let x = s;
  x = x.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');          // images
  x = x.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');          // links
  x = x.replace(/\*\*([^*]+)\*\*/g, '$1');                // bold
  x = x.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2');  // italics
  x = x.replace(/\x60([^\x60]*)\x60/g, '$1');             // inline code
  x = x.replace(/<br\s*\/?>/gi, ' ');
  x = x.replace(/\s+/g, ' ').trim();
  return x;
}

function parse(md) {
  const lines = md.split(/\r?\n/);
  let title = '';
  let bestFor = '';
  let lead = '';
  const sections = [];
  const intro = [];
  let cur = null;
  let skip = false;
  let fence = false;
  let para = [];
  const flushPara = () => {
    if (para.length && !skip) {
      const text = clean(para.join(' '));
      if (text) (cur ? cur.items : intro).push(text);
    }
    para = [];
  };

  for (let raw of lines) {
    const line = raw.replace(/\t/g, '    ');
    if (/^\x60\x60\x60/.test(line.trim())) { fence = !fence; continue; }
    if (fence) continue;

    const h1 = /^#\s+(.*)$/.exec(line);
    if (h1) { title = clean(h1[1]); continue; }

    // only the document header, not variant subsections below, defines bestFor/lead
    if (!sections.length) {
      const best = /^\*\*Best for:\*\*\s*(.*)$/.exec(line);
      if (best) { bestFor = clean(best[1]); continue; }
      const not = /^\*\*Not this type:\*\*\s*(.*)$/.exec(line);
      if (not) { lead = 'Not this type: ' + clean(not[1]); continue; }
    }

    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) {
      flushPara();
      const h = clean(h2[1]);
      skip = /examples?$/i.test(h);
      cur = skip ? null : { h, items: [] };
      if (cur) sections.push(cur);
      continue;
    }
    if (/^#{3,}\s+/.test(line)) {
      // variant deep-dives (### …) duplicate their own type pages — skip
      flushPara();
      cur = null;
      skip = true;
      continue;
    }

    if (skip) continue;
    if (/^\s*\|/.test(line)) {
      // markdown table row — flatten cells into one line
      const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => clean(c)).filter(Boolean);
      if (cells.length && !cells.every((c) => /^:?-{2,}:?$/.test(c))) {
        flushPara();
        if (cur) cur.items.push(cells.join(' · '));
      }
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushPara(); continue; }

    const bullet = /^(\s*)[-*+]\s+(.*)$/.exec(line);
    if (bullet && bullet[2].trim()) {
      flushPara();
      const text = clean(bullet[2]);
      if (text) (cur ? cur.items : intro).push(text);
      continue;
    }
    const num = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (num) {
      flushPara();
      const text = clean(num[1]);
      if (text) (cur ? cur.items : intro).push(text);
      continue;
    }
    if (!line.trim()) { flushPara(); continue; }
    para.push(line.trim());
  }
  flushPara();

  if (!lead && intro.length) lead = intro.join(' ');
  const isCode = (s) => /^[a-z_][a-z0-9_]*\s*[:=]/.test(s) || /^[{}\[\]]/.test(s) || /^(---|\.\.\.)$/.test(s);
  const out = sections
    .map((s) => ({ h: s.h, items: s.items.filter((x) => x && !isCode(x)).slice(0, 18) }))
    .filter((s) => s.items.length > 0)
    .slice(0, 9);
  return { title, bestFor, lead, sections: out };
}

const files = readdirSync(refsDir).filter((f) => /^type-.*\.md$/.test(f)).sort();
const types = [];
for (const f of files) {
  const slug = f.replace(/^type-/, '').replace(/\.md$/, '');
  const md = readFileSync(join(refsDir, f), 'utf8');
  const p = parse(md);
  const old = prevBySlug.get(slug) || {};
  types.push({
    slug,
    title: p.title || old.title || slug,
    bestFor: p.bestFor || old.bestFor || '',
    lead: p.lead || '',
    zh: old.zh || '',
    example: old.example || ('example-' + slug + '.html'),
    sections: p.sections,
  });
}
writeFileSync(finalPath, JSON.stringify(types, null, 1) + '\n');

const chars = types.reduce((n, t) => n + JSON.stringify(t).length, 0);
const items = types.reduce((n, t) => n + t.sections.reduce((m, s) => m + s.items.length, 0), 0);
const maxItem = Math.max(...types.flatMap((t) => t.sections.flatMap((s) => s.items.map((i) => i.length))));
const maxSec = Math.max(...types.map((t) => t.sections.length));
console.log('types=' + types.length, 'items=' + items, 'chars=' + chars, 'maxItem=' + maxItem, 'maxSections=' + maxSec);
console.log('missing lead=' + types.filter((t) => !t.lead).length, 'no zh=' + types.filter((t) => !t.zh).length);
const sample = types.find((t) => t.slug === 'dependency');
console.log(JSON.stringify(sample.sections.map((s) => [s.h, s.items.length]), null, 0));
console.log('last dependency item:', sample.sections[sample.sections.length - 1].items.slice(-1)[0].slice(-120));
