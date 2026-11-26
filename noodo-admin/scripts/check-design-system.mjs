import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { designSystemDirectory as directory } from './design-system-path.mjs';
const lock = JSON.parse(readFileSync(new URL('../design-system.lock.json', import.meta.url), 'utf8'));
const versions = readdirSync(directory).filter(f => /^noodo-design-system-v\d+\.\d+\.json$/.test(f)).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}));
const latest = versions.at(-1);
if(latest !== lock.specification) throw new Error(`Existe un nuevo sistema de diseño: ${latest}. Revisarlo y actualizar importación y design-system.lock.json antes de desarrollar.`);
for(const name of [lock.specification, lock.tokens]) {
 const raw = readFileSync(new URL(name, directory), 'utf8');
 const content = name.endsWith('.json') ? JSON.stringify(JSON.parse(raw), (key, value) => key === 'exportedAt' ? undefined : value) : raw;
 const digest = createHash('sha256').update(content).digest('hex');
 if(digest !== lock.sha256[name]) throw new Error(`${name} cambió. Revisa los cambios gráficos antes de actualizar su huella en design-system.lock.json.`);
}
console.log(`Diseño verificado: ${lock.specification} · tokens compartidos, sin copia local.`);
