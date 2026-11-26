import {existsSync} from 'node:fs';

// A clone contains noodo-admin/ beside dist/. The original workstation keeps
// noodo-admin/ beside noodo-design-system/. Both consume the same DS sources.
const candidates = [
 new URL('../../dist/', import.meta.url),
 new URL('../../noodo-design-system/dist/', import.meta.url),
];
export const designSystemDirectory = candidates.find(directory =>
 existsSync(new URL('music-data.js', directory)) &&
 existsSync(new URL('content.js', directory))
);
if (!designSystemDirectory) {
 throw new Error('No se encuentra el sistema de diseño. Clona el repositorio completo y conserva dist/ junto a noodo-admin/.');
}
