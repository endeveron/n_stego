import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { twMerge } from 'tailwind-merge';

const alphanumCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a cryptographically secure random code of a specified length using alphanumeric characters.
 * @param [length=8] - The code length. Default is 8 characters.
 * @returns A randomly generated code.
 */
export function generateCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % alphanumCharset.length;
    code += alphanumCharset[index];
  }
  return code;
}
