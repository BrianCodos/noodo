import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { designSystemDirectory } from './scripts/design-system-path.mjs';
const lock = JSON.parse(readFileSync(new URL('./design-system.lock.json', import.meta.url), 'utf8'));
export default defineConfig({
 plugins: [react()],
 resolve: { alias: { '@noodo/tokens': fileURLToPath(new URL(lock.tokens, designSystemDirectory)) } },
 server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(designSystemDirectory)] } },
});
