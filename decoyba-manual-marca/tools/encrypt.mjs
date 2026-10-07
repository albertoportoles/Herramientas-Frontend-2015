// Encrypts every file in src/ into vault/ with the password in MANUAL_PASSWORD.
// File names are replaced with random ids; the path → id map lives in the
// encrypted manifest, so nothing in vault/ reveals the content.
//
//   MANUAL_PASSWORD="..." node tools/encrypt.mjs
import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveKey, encryptBytes, randomBytes, getPassword, ITERATIONS } from './vault-crypto.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const vaultDir = join(root, 'vault');

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.otf': 'font/otf', '.ttf': 'font/ttf',
};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (!e.name.startsWith('.')) out.push(p);
  }
  return out;
}

const hex = bytes => Buffer.from(bytes).toString('hex');

const password = getPassword();
const salt = randomBytes(16);
const key = await deriveKey(password, salt);

await rm(vaultDir, { recursive: true, force: true });
await mkdir(join(vaultDir, 'f'), { recursive: true });

const files = {};
for (const abs of (await walk(srcDir)).sort()) {
  const path = relative(srcDir, abs).split('\\').join('/');
  const id = hex(randomBytes(12));
  const bytes = await readFile(abs);
  await writeFile(join(vaultDir, 'f', id + '.bin'), await encryptBytes(key, bytes));
  files[path] = { id, type: TYPES[extname(path).toLowerCase()] || 'application/octet-stream', size: bytes.length };
}

const manifest = new TextEncoder().encode(JSON.stringify({ v: 1, files }));
await writeFile(join(vaultDir, 'manifest.bin'), await encryptBytes(key, manifest));
await writeFile(join(vaultDir, 'config.json'), JSON.stringify({
  v: 1, kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: Buffer.from(salt).toString('base64'),
}, null, 2) + '\n');

console.log(`Cifrados ${Object.keys(files).length} archivos en vault/`);
