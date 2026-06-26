import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/lib/prisma';
import { hashPin } from '../../src/utils/auth';

// Integration: hit DB kasir_test nyata (lihat .env.test). Bukan kasir_db.
describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { username: { in: ['kasir_test', 'nonaktif_test'] } } });
    await prisma.user.create({
      data: { username: 'kasir_test', name: 'Kasir Test', pinHash: hashPin('123456'), role: 'staff', isActive: true },
    });
    await prisma.user.create({
      data: { username: 'nonaktif_test', name: 'Nonaktif', pinHash: hashPin('123456'), role: 'staff', isActive: false },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: { in: ['kasir_test', 'nonaktif_test'] } } });
    await prisma.$disconnect();
  });

  it('PIN benar → 200 + token', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'kasir_test', pin: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.username).toBe('kasir_test');
  });

  it('PIN salah → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'kasir_test', pin: '000000' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('user nonaktif → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nonaktif_test', pin: '123456' });
    expect(res.status).toBe(401);
  });

  it('field kosong → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'kasir_test' });
    expect(res.status).toBe(400);
  });
});
