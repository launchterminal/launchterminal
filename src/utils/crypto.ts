import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 32);
}

export function encrypt(plaintext: string, encryptionKey?: string): string {
  const key = encryptionKey ?? process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY is required for encryption');

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = deriveKey(key, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Format: salt:iv:tag:encrypted
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(ciphertext: string, encryptionKey?: string): string {
  const key = encryptionKey ?? process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY is required for decryption');

  const parts = ciphertext.split(':');
  if (parts.length !== 4) throw new Error('Invalid ciphertext format');

  const [saltHex, ivHex, tagHex, encrypted] = parts;
  const salt = Buffer.from(saltHex!, 'hex');
  const iv = Buffer.from(ivHex!, 'hex');
  const tag = Buffer.from(tagHex!, 'hex');
  const derivedKey = deriveKey(key, salt);

  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted!, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateApiKey(): string {
  return `sk-lt-${randomBytes(32).toString('hex')}`;
}

export function hashApiKey(apiKey: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(apiKey, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
