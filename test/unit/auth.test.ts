import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { hashPin, generateToken } from '../../src/utils/auth';

describe('hashPin', () => {
  it('menghasilkan SHA-256 hex yang deterministik', () => {
    const expected = crypto.createHash('sha256').update('123456').digest('hex');
    expect(hashPin('123456')).toBe(expected);
    expect(hashPin('123456')).toBe(hashPin('123456')); // stabil
  });

  it('PIN berbeda → hash berbeda', () => {
    expect(hashPin('123456')).not.toBe(hashPin('654321'));
  });
});

describe('generateToken', () => {
  it('token bisa di-verify & membawa payload yang benar', () => {
    process.env.JWT_SECRET = 'test_secret_kasir';
    const token = generateToken(7, 'owner', ['sales']);
    const decoded = jwt.verify(token, 'test_secret_kasir') as any;
    expect(decoded.userId).toBe(7);
    expect(decoded.role).toBe('owner');
    expect(decoded.permissions).toEqual(['sales']);
  });
});
