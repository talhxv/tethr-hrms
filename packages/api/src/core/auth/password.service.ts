import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { Injectable } from '@nestjs/common';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SCHEME = 'scrypt';

// Password hashing with Node's built-in scrypt — no third-party crypto
// dependency. Stored format: `scrypt$<salt-hex>$<hash-hex>`. Verification is
// constant-time to avoid leaking timing information.
@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return `${SCHEME}$${salt}$${derived.toString('hex')}`;
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const [scheme, salt, hash] = stored.split('$');
    if (scheme !== SCHEME || !salt || !hash) {
      return false;
    }
    const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    const expected = Buffer.from(hash, 'hex');
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  }
}
