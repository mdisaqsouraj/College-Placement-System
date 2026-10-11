import crypto from 'node:crypto';

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// CSV cell with spreadsheet-formula-injection protection
export function csvCell(v) {
  let s = v == null ? '' : String(v);
  if (typeof v !== 'number' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
export const toCsv = (header, rows) => '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const hashStr = (s) => { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; };
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export function seededPick(items, n, seed) {
  const rnd = mulberry32(hashStr(seed)); const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

const IST = 5.5 * 3600 * 1000; // India Standard Time offset
export const istDayKey = (d = new Date()) => new Date(d.getTime() + IST).toISOString().slice(0, 10);
export const istYesterdayKey = (d = new Date()) => istDayKey(new Date(d.getTime() - 86400000));
export const isWeekendIST = (d) => { const x = new Date(d.getTime() + IST).getUTCDay(); return x === 0 || x === 6; };


// ---- AI question helpers (pure, unit-testable) ----
export const normText = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function parseJsonArray(text) {
  const a = text.indexOf('['), b = text.lastIndexOf(']');
  if (a < 0 || b <= a) throw new Error('No JSON array found in AI reply');
  return JSON.parse(text.slice(a, b + 1));
}

// Returns a safe question object or null if the AI output is malformed.
export function cleanQuestion(q, category, difficulty) {
  if (!q || typeof q.text !== 'string' || !Array.isArray(q.options)) return null;
  const options = q.options.map((o) => String(o).trim());
  const ci = Number(q.correctIndex);
  if (q.text.trim().length < 10 || q.text.length > 800) return null;
  if (options.length !== 4 || options.some((o) => !o || o.length > 200)) return null;
  if (new Set(options.map(normText)).size !== 4) return null;
  if (!Number.isInteger(ci) || ci < 0 || ci > 3) return null;
  return { category, difficulty, topic: String(q.topic || 'General').slice(0, 60), text: q.text.trim(), options, correctIndex: ci, explanation: String(q.explanation || '').slice(0, 600) };
}

// Spreads `count` questions across (category x difficulty) combinations.
export function planSlots(categories, difficulties, count) {
  const combos = shuffle(categories.flatMap((c) => difficulties.map((d) => [c, d])));
  const need = new Map();
  for (let i = 0; i < count; i++) { const k = combos[i % combos.length].join('|'); need.set(k, (need.get(k) || 0) + 1); }
  return [...need].map(([k, n]) => { const [category, difficulty] = k.split('|'); return { category, difficulty, n }; });
}