import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import PBKDF2 from 'crypto-js/pbkdf2';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';

const PASSPHRASE = process.env.ENCRYPTION_PASSPHRASE || 'default_passphrase';
const KEY_SIZE = 256 / 32; // AES-256 => 32 bytes
const ITERATIONS = 1000; // PBKDF2 iterations

// Encrypt a string securely using AES with IV and PBKDF2
export function encryptString(plainText: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte salt
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte IV

  const key = PBKDF2(PASSPHRASE, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const encrypted = AES.encrypt(plainText, key, { iv });

  // Combine salt + iv + ciphertext for transport
  const result = salt.toString() + iv.toString() + encrypted.toString();
  return result;
}

// Decrypt a string securely using AES with IV and PBKDF2
export function decryptString(cipherText: string): string {
  const saltHex = cipherText.slice(0, 32); // first 16 bytes (salt)
  const ivHex = cipherText.slice(32, 64); // next 16 bytes (iv)
  const encryptedHex = cipherText.slice(64); // rest is ciphertext

  const salt = Hex.parse(saltHex);
  const iv = Hex.parse(ivHex);
  const encrypted = encryptedHex;

  const key = PBKDF2(PASSPHRASE, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const decrypted = AES.decrypt(encrypted, key, { iv });
  return decrypted.toString(Utf8);
}
