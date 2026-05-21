# Kasir Backend API

Backend REST API untuk aplikasi kasir (Point of Sale) berbasis **Node.js**, **Express**, **Prisma ORM**, dan **MariaDB**.

---

## Tech Stack

- **Runtime:** Node.js (≥ 20.19)
- **Framework:** Express 5
- **ORM:** Prisma 7 dengan adapter MariaDB
- **Database:** MariaDB / MySQL
- **Bahasa:** TypeScript 6
- **Auth:** JSON Web Token (JWT)
- **Dev Tools:** tsx (hot reload), dotenv

---

## Struktur Proyek

```
kasir-backend/
├── prisma/
│   ├── schema.prisma       # Definisi skema database
│   └── seed.ts             # Seeder user default
├── src/
│   ├── controllers/        # Handler request per fitur
│   ├── middlewares/        # Middleware autentikasi JWT
│   ├── routes/             # Definisi rute API
│   ├── services/           # Logika bisnis & query database
│   ├── utils/              # Helper (hash PIN, generate token)
│   ├── lib/
│   │   └── prisma.ts       # Instance Prisma client
│   └── index.ts            # Entry point server
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Persiapan & Instalasi

### 1. Clone & Install Dependency

```bash
git clone <repo-url>
cd kasir-backend
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root proyek:

```env
PORT=5000

JWT_SECRET="kasir_super_rahasia_2026"

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootdb
DB_NAME=kasir_db
```

> Sesuaikan `DATABASE_URL` dengan kredensial MariaDB/MySQL Anda.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Jalankan Migrasi Database

```bash
npm run prisma:migrate
```

### 5. Seed Data Awal (User Default)

```bash
npm run prisma:seed
```

Perintah ini akan membuat user owner default:

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| PIN      | `123456`        |
| Role     | `owner`         |

---

## Menjalankan Aplikasi

**Mode Development** (dengan hot reload):
```bash
npm run dev
```

**Build & Production:**
```bash
npm run build
npm start
```

Server berjalan di `http://localhost:5000` (atau sesuai `PORT` di `.env`).

---

## Dokumentasi API

Semua endpoint (kecuali login) memerlukan header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint          | Deskripsi         | Auth |
|--------|-------------------|-------------------|------|
| POST   | `/api/auth/login` | Login dengan PIN  | ❌   |

**Body login:**
```json
{
  "username": "admin",
  "pin": "123456"
}
```

---

### Produk

| Method | Endpoint            | Deskripsi             |
|--------|---------------------|-----------------------|
| GET    | `/api/products`     | Ambil semua produk    |
| GET    | `/api/products/:id` | Detail produk         |
| POST   | `/api/products`     | Tambah produk baru    |
| PUT    | `/api/products/:id` | Edit produk           |
| DELETE | `/api/products/:id` | Hapus produk (soft)   |

---

### Kategori

| Method | Endpoint               | Deskripsi              |
|--------|------------------------|------------------------|
| GET    | `/api/categories`      | Ambil semua kategori   |
| GET    | `/api/categories/:id`  | Detail kategori        |
| POST   | `/api/categories`      | Tambah kategori baru   |
| PUT    | `/api/categories/:id`  | Edit kategori          |
| DELETE | `/api/categories/:id`  | Hapus kategori (soft)  |

---

### Transaksi

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/transactions`         | Ambil semua transaksi            |
| GET    | `/api/transactions/:id`     | Detail transaksi                 |
| POST   | `/api/transactions`         | Buat transaksi baru / hold bill  |
| PUT    | `/api/transactions/:id/pay` | Lunasi hold bill                 |

**Contoh body buat transaksi:**
```json
{
  "receiptNumber": "TRX-20260521-001",
  "subtotal": 50000,
  "discountType": null,
  "discountValue": 0,
  "discountAmount": 0,
  "total": 50000,
  "paymentMethod": "tunai",
  "paymentAmount": 60000,
  "change": 10000,
  "profit": 15000,
  "status": "completed",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 25000,
      "hpp": 17500,
      "totalPrice": 50000,
      "profit": 15000
    }
  ]
}
```

---

### Stok

| Method | Endpoint           | Deskripsi                   |
|--------|--------------------|-----------------------------|
| GET    | `/api/stocks/in`   | Riwayat stok masuk          |
| POST   | `/api/stocks/in`   | Catat stok masuk            |
| GET    | `/api/stocks/out`  | Riwayat stok keluar         |
| POST   | `/api/stocks/out`  | Catat stok keluar / susut   |

---

### Supplier

| Method | Endpoint               | Deskripsi              |
|--------|------------------------|------------------------|
| GET    | `/api/suppliers`       | Ambil semua supplier   |
| GET    | `/api/suppliers/:id`   | Detail supplier        |
| POST   | `/api/suppliers`       | Tambah supplier baru   |
| PUT    | `/api/suppliers/:id`   | Edit supplier          |
| DELETE | `/api/suppliers/:id`   | Hapus supplier (soft)  |

---

### Pengguna *(Owner only)*

| Method | Endpoint           | Deskripsi                    |
|--------|--------------------|------------------------------|
| GET    | `/api/users`       | Ambil semua akun kasir       |
| GET    | `/api/users/:id`   | Detail akun                  |
| POST   | `/api/users`       | Buat akun kasir baru         |
| PUT    | `/api/users/:id`   | Edit akun (nama, PIN, role)  |
| DELETE | `/api/users/:id`   | Nonaktifkan akun (soft)      |

---

### Dashboard

| Method | Endpoint          | Deskripsi                                               |
|--------|-------------------|---------------------------------------------------------|
| GET    | `/api/dashboard`  | Ringkasan hari ini, stok menipis, transaksi terakhir    |

---

### Laporan

| Method | Endpoint                      | Deskripsi                          |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/reports?period=7`       | Laporan 7 hari terakhir            |
| GET    | `/api/reports?period=30`      | Laporan 30 hari terakhir           |

Parameter `period` hanya menerima nilai `7` atau `30`.

---

## Skema Database

Entitas utama dalam database:

- **User** — akun kasir dan owner
- **Category** — kategori produk
- **Product** — data barang dagangan
- **Supplier** — data pemasok
- **StockIn** — riwayat stok masuk
- **StockOut** — riwayat stok keluar / susut
- **Transaction** — header transaksi penjualan
- **TransactionItem** — detail barang per transaksi
- **StoreSetting** — pengaturan nama toko, alamat, footer struk

---

## Catatan Keamanan

- PIN pengguna di-hash menggunakan **SHA-256** sebelum disimpan ke database.
- Token JWT berlaku selama **12 jam**.
- Manajemen pengguna hanya dapat dilakukan oleh akun dengan role `owner`.
- Semua penghapusan data menggunakan **soft delete** (field `isDeleted`) agar riwayat transaksi tetap terjaga.

---

## License

ISC