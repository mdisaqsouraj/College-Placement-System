// Syntax-checks every backend source file without needing a database.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '../src');
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith('.js') ? [join(d, f)] : []));
let bad = 0;
for (const f of walk(root)) { try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad++; console.error('SYNTAX ERROR', f, e.stderr?.toString()); } }
console.log(bad ? `${bad} file(s) failed` : 'All backend files pass syntax check'); process.exit(bad ? 1 : 0);
