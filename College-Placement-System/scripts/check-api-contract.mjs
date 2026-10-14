// Verifies that every API call made by the frontend matches a route defined in the backend.
// Usage (from project root): node scripts/check-api-contract.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const app = readFileSync('backend/src/app.js', 'utf8');
const imports = Object.fromEntries([...app.matchAll(/import (\w+) from '\.\/routes\/(\w+)\.js'/g)].map((m) => [m[1], m[2]]));
const backend = [];
for (const m of app.matchAll(/app\.use\('(\/api\/[^']+)',\s*(\w+)\)/g)) {
  const src = readFileSync(`backend/src/routes/${imports[m[2]]}.js`, 'utf8');
  for (const r of src.matchAll(/router\.(get|post|put|patch|delete)\('([^']*)'/g)) {
    const path = (m[1] + (r[2] === '/' ? '' : r[2])).replace(/^\/api/, '');
    backend.push({ method: r[1], segs: path.split('/').filter(Boolean) });
  }
}
const front = [];
for (const f of walk('frontend/src').filter((f) => /\.jsx?$/.test(f))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:api|download)\??\.?(get|post|put|patch|delete)?\(\s*([`'"])((?:\/|\$\{)[^`'"]*?)\2/g)) {
    const method = m[1] || 'get';
    const path = m[3].split('?')[0].replace(/\$\{[^}]*\}/g, ':p');
    front.push({ method, path, file: f });
  }
  for (const m of src.matchAll(/download\(\s*([`'"])([^`'"]+)\1/g)) front.push({ method: 'get', path: m[2].split('?')[0].replace(/\$\{[^}]*\}/g, ':p'), file: f });
}
const match = (b, segs) => b.segs.length === segs.length && b.segs.every((s, i) => s.startsWith(':') || segs[i].startsWith(':') || s === segs[i]);
let bad = 0, n = 0; const seen = new Set();
for (const c of front) {
  const key = c.method + c.path; if (seen.has(key)) continue; seen.add(key); n++;
  if (!backend.some((b) => b.method === c.method && match(b, c.path.split('/').filter(Boolean)))) { bad++; console.error(`NO BACKEND ROUTE: ${c.method.toUpperCase()} ${c.path}  (${c.file})`); }
}
console.log(`${backend.length} backend routes, ${n} distinct frontend calls checked, ${bad} mismatches`);
process.exit(bad ? 1 : 0);
