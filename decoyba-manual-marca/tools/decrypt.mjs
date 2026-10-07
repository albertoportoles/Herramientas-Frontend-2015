// Restores the original files from vault/ into src/ (to edit them and re-encrypt).
//
//   MANUAL_PASSWORD="..." node tools/decrypt.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveKey, decryptBytes, getPassword } from './vault-crypto.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const vaultDir = join(root, 'vault');

const config = JSON.parse(await readFile(join(vaultDir, 'config.json'), 'utf8'));
const key = await deriveKey(getPassword(), Buffer.from(config.salt, 'base64'), config.iterations);

let manifest;
try {
  manifest = JSON.parse(new TextDecoder().decode(await decryptBytes(key, await readFile(join(vaultDir, 'manifest.bin')))));
} catch {
  console.error('Contraseña incorrecta.');
  process.exit(1);
}

for (const [path, { id }] of Object.entries(manifest.files)) {
  const out = join(srcDir, path);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, await decryptBytes(key, await readFile(join(vaultDir, 'f', id + '.bin'))));
}
console.log(`Descifrados ${Object.keys(manifest.files).length} archivos en src/`);
