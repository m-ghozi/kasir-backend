import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Fungsi untuk mengubah PIN (misal "123456") menjadi SHA-256 Hex
export const hashPin = (pin: string): string => {
  return crypto.createHash('sha256').update(pin).digest('hex');
};

// Fungsi untuk membuat Token JWT yang berlaku selama 1 hari
export const generateToken = (userId: number, role: string, permissions: any): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign({ userId, role, permissions }, secret, { expiresIn: '1d' });
};