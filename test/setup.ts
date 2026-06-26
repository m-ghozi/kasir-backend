// Jalan sebelum semua test (vitest setupFiles). Wajib men-set env DB SEBELUM
// modul apa pun yang meng-import prisma ter-load, supaya adapter menunjuk ke kasir_test.
import dotenv from 'dotenv';

// override:true → paksa nilai .env.test menimpa .env yang sudah ada.
dotenv.config({ path: '.env.test', override: true });

process.env.NODE_ENV = 'test';
