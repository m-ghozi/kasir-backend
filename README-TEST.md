# Panduan Testing — Kasir Backend

Dokumen ini menjelaskan setup, struktur, dan cara menjalankan test untuk project ini.

## Ringkasan

| | |
|---|---|
| **Runner** | [Vitest](https://vitest.dev) 4 |
| **HTTP test** | [supertest](https://github.com/ladjs/supertest) (integration) |
| **Jenis test** | Unit (mock Prisma, tanpa DB) + Integration (DB nyata) |
| **DB integration** | MySQL 8.4 via Docker, database **terpisah** `kasir_test` |
| **Total test** | 19 (15 unit + 4 integration) |

Dua lapis test:

1. **Unit** — Prisma di-mock, **tidak butuh database**. Cepat, bisa jalan di CI/mana saja.
   Fokus ke logika bisnis berisiko: kalkulasi finansial transaksi & validasi stok.
2. **Integration** — request HTTP sungguhan lewat supertest ke Express app, hit database
   `kasir_test` di container Docker. Memverifikasi alur end-to-end (mis. login).

> **Penting:** integration test melakukan seed & delete data. Karena itu test memakai
> database **`kasir_test`** yang terpisah dari `kasir_db` (data development). Data dev
> tidak akan pernah tersentuh oleh test.

---

## Struktur File Test

```
kasir-backend/
├── vitest.config.ts                       # Konfigurasi Vitest
├── .env.test                              # Env khusus test → menunjuk DB kasir_test
├── test/
│   ├── setup.ts                           # Load .env.test & set NODE_ENV=test (jalan sebelum semua test)
│   ├── unit/
│   │   ├── auth.test.ts                    # hashPin (SHA-256) & generateToken (JWT)
│   │   ├── transaction.service.test.ts     # Kalkulasi diskon/profit/kembalian + validasi stok & bayar
│   │   └── stock.service.test.ts           # Validasi stok keluar (createStockOut)
│   └── integration/
│       └── auth.routes.test.ts             # POST /api/auth/login lewat supertest
```

---

## Prasyarat

1. **Dependency test** sudah terpasang (`vitest`, `supertest`, `@types/supertest`):

   ```bash
   npm install
   ```

2. **Container MySQL berjalan** (untuk integration test). Cek:

   ```bash
   docker ps   # harus ada container "mysql-dev" di port 3306
   ```

---

## Setup Database Test (sekali saja)

Integration test butuh database `kasir_test` dengan skema Prisma. Buat sekali di awal
(atau ulangi setiap kali `schema.prisma` berubah):

```bash
# 1. Buat database kosong di container yang sama
docker exec mysql-dev mysql -uroot -proot123 -e "CREATE DATABASE IF NOT EXISTS kasir_test"

# 2. Terapkan skema Prisma ke kasir_test
npm run test:db:push
```

`test:db:push` menjalankan `prisma db push` dengan `DATABASE_URL` di-override ke `kasir_test`,
jadi `kasir_db` tidak tersentuh.

---

## Menjalankan Test

| Perintah | Yang dijalankan | Butuh DB? |
|----------|-----------------|-----------|
| `npm run test:unit` | Hanya unit test | ❌ Tidak |
| `npm run test:int`  | Hanya integration test | ✅ Ya (`kasir_test`) |
| `npm test`          | Semua test | ✅ Ya |
| `npm run test:watch`| Mode watch (re-run saat file berubah) | tergantung file |

Contoh output sukses:

```
 Test Files  4 passed (4)
      Tests  19 passed (19)
```

---

## Cakupan Test

### Unit — `test/unit/auth.test.ts`
- `hashPin()` menghasilkan SHA-256 hex yang deterministik & konsisten.
- PIN berbeda → hash berbeda.
- `generateToken()` menghasilkan JWT yang bisa di-`verify` dan membawa `userId`, `role`, `permissions`.

### Unit — `test/unit/transaction.service.test.ts`
Menguji `transactionService.createTransaction` dengan `prisma.$transaction` di-mock
(callback dijalankan dengan objek `tx` palsu). Kasus:

- **Validasi**: keranjang kosong, produk tidak ditemukan, stok kurang (status `completed`),
  diskon persentase > 100, diskon nominal melebihi total, pembayaran kurang dari total.
- **Kalkulasi (happy path)**: `subtotal`, `total`, `profit`, `change` dihitung benar di server,
  dan stok di-`decrement` sesuai quantity.
- **Diskon persentase per item**: `totalPrice` & `profit` benar.
- **Hold bill (`status: 'open'`)**: tidak memvalidasi stok, tidak memotong stok, `change = 0`.

### Unit — `test/unit/stock.service.test.ts`
Menguji `stockService.createStockOut`:
- Stok kurang / produk tidak ada → throw, stok **tidak** dipotong.
- Stok cukup → record stok keluar dibuat & stok di-`decrement`.

### Integration — `test/integration/auth.routes.test.ts`
Lewat supertest ke Express app (`POST /api/auth/login`):
- PIN benar → `200` + token JWT.
- PIN salah → `401`.
- User nonaktif → `401`.
- Field kosong → `400`.

`beforeAll` menyemai user uji, `afterAll` membersihkannya & `prisma.$disconnect()`.

---

## Cara Kerja Internal

### Mocking Prisma (unit test)
Service meng-import `prisma` dari `src/lib/prisma`. Unit test menggantinya dengan `vi.mock`:

```ts
vi.mock('../../src/lib/prisma', () => ({
  prisma: { $transaction: (cb) => cb(txMock) },
}));
```

`prisma.$transaction(cb)` di-mock supaya **menjalankan callback** dengan `tx` palsu —
sehingga seluruh logika di dalam transaksi (kalkulasi & validasi) ikut teruji, tanpa DB nyata.

### Pengalihan DB (integration test)
- `vitest.config.ts` menetapkan `test/setup.ts` sebagai `setupFiles` (jalan sebelum test).
- `test/setup.ts` memuat `.env.test` dengan `override: true` dan menyetel `NODE_ENV=test`
  **sebelum** modul mana pun yang meng-import Prisma ter-load.
- `src/lib/prisma.ts` membangun koneksi dari env `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`,
  sehingga koneksi otomatis menunjuk ke `kasir_test`.
- `src/index.ts` hanya memanggil `app.listen()` jika `NODE_ENV !== 'test'`, jadi supertest
  bisa me-mount `app` tanpa membuka port.

### `.env.test`
```env
DATABASE_URL="mysql://root:root123@localhost:3306/kasir_test"
JWT_SECRET="test_secret_kasir"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=kasir_test
```

---

## Troubleshooting

| Gejala | Penyebab & Solusi |
|--------|-------------------|
| Integration test gagal konek DB | Container `mysql-dev` tidak jalan → `docker ps`. Atau `kasir_test` belum dibuat → ulangi **Setup Database Test**. |
| `Table 'kasir_test.User' doesn't exist` | Skema belum di-push → `npm run test:db:push`. |
| Unit test gagal padahal logika benar | Lupa `vi.clearAllMocks()` di `beforeEach`, atau mock `findMany`/`findUnique` tidak diset untuk kasus tersebut. |
| Test integration mengubah data dev | Tidak akan terjadi — test memakai `kasir_test`, bukan `kasir_db`. Pastikan `.env.test` benar. |

---

## Menambah Test Baru

- **Unit service**: tiru pola `transaction.service.test.ts` — mock `src/lib/prisma`, isi `tx`
  sesuai method yang dipakai service, panggil fungsi service, assert hasil & pemanggilan mock.
- **Integration route**: tiru `auth.routes.test.ts` — `request(app).post(...)`, seed data di
  `beforeAll`, bersihkan di `afterAll`.

> Belum dicakup (sengaja, tambah saat perlu): test CRUD untuk 16 controller lain dan
> coverage/CI pipeline. Pola untuk menambahnya sudah tersedia di atas.
