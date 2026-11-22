
// Inline src/types.final.json into client.js as the DATA table.
// Usage: node scripts/embed-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const clientPath = join(root, 'client.js');
const types = JSON.parse(readFileSync(join(root, 'src/types.final.json'), 'utf8'));

let src = readFileSync(clientPath, 'utf8');
const key = 'var DATA = ';
const at = src.indexOf(key);
if (at < 0) throw new Error('DATA marker not found in client.js');
const start = at + key.length;

let depth = 0, inStr = false, esc = false, end = -1;
for (let j = start; j < src.length; j++) {
  const c = src[j];
  if (inStr) {
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') { inStr = true; continue; }
  if (c === '[' || c === '{') depth++;
  else if (c === ']' || c === '}') { depth--; if (depth === 0) { end = j + 1; break; } }
}
if (end < 0) throw new Error('unbalanced DATA block');

src = src.slice(0, start) + JSON.stringify(types) + src.slice(end);
writeFileSync(clientPath, src);
console.log('embedded ' + types.length + ' types, client.js=' + src.length + ' bytes');
