// Shared crypto helpers for encrypt.mjs / decrypt.mjs.
// Must match the algorithm used by the loader in ../index.html.
import { webcrypto as crypto } from 'node:crypto';

export const ITERATIONS = 600000;
export const IV_BYTES = 12;

export async function deriveKey(password, salt, iterations = ITERATIONS) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Output layout: 12-byte IV followed by AES-GCM ciphertext (+16-byte tag).
export async function encryptBytes(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  const out = new Uint8Array(IV_BYTES + ct.length);
  out.set(iv, 0);
  out.set(ct, IV_BYTES);
  return out;
}

export async function decryptBytes(key, bytes) {
  const iv = bytes.subarray(0, IV_BYTES);
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, bytes.subarray(IV_BYTES)));
}

export const randomBytes = n => crypto.getRandomValues(new Uint8Array(n));

export function getPassword() {
  const pw = process.env.MANUAL_PASSWORD;
  if (!pw) {
    console.error('Falta la contraseña: ejecuta con MANUAL_PASSWORD="..." en el entorno.');
    process.exit(1);
  }
  return pw;
}
