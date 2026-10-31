// Copia in dist/ solo i file del gioco: è la cartella che finisce dentro le app Android e iOS.
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const item of ['index.html', 'css', 'js', 'fonts', 'icons', 'manifest.webmanifest']) {
  cpSync(join(root, item), join(out, item), { recursive: true });
}
// Nell'app non serve il service worker: togliamo il collegamento al manifest web.
const html = readFileSync(join(out, 'index.html'), 'utf8').replace(/\s*<link rel="manifest"[^>]*>/, '');
writeFileSync(join(out, 'index.html'), html);
console.log('dist/ pronta');
