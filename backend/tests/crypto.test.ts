import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateReferenceNumber,
  generateTrackingToken,
} from '../src/utils/crypto';

describe('Cryptographic and Security Utilities', () => {
  it('hashes passwords using PBKDF2 with salt and verifies correctly', async () => {
    const password = 'MonMotDePasseSecurise2026!';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^pbkdf2:100000:[a-f0-9]{32}:[a-f0-9]{64}$/);

    const valid = await verifyPassword(password, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword('WrongPassword!', hash);
    expect(invalid).toBe(false);
  });

  it('generates unique salts for each hash of the same password', async () => {
    const pwd = 'IdenticalPassword123';
    const hash1 = await hashPassword(pwd);
    const hash2 = await hashPassword(pwd);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(pwd, hash1)).toBe(true);
    expect(await verifyPassword(pwd, hash2)).toBe(true);
  });

  it('generates valid Algerian reference numbers in DZ-REP-XXXXXX format', () => {
    const ref = generateReferenceNumber();
    expect(ref).toMatch(/^DZ-REP-\d{6}$/);
  });

  it('generates secure 32-character hex tracking tokens', () => {
    const token = generateTrackingToken();
    expect(token).toHaveLength(32);
    expect(token).toMatch(/^[a-f0-9]{32}$/);
  });
});
