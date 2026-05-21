readme_content = """# Kasir Backend API

Repository ini berisi kode backend untuk aplikasi **Sistem Kasir / Point of Sale (POS)** berbasis REST API. Dibangun menggunakan **Node.js**, **Express.js**, **TypeScript**, dan **Prisma ORM** dengan database **MySQL**.

Backend ini dirancang modular untuk memisahkan logika rute (*routes*), pengontrol (*controllers*), dan layanan (*services*) guna mempermudah pemeliharaan dan pengembangan skala besar.

---

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi:** Menggunakan JSON Web Token (JWT) untuk mengamankan endpoint dan mengidentifikasi kasir/user yang sedang aktif.
- **Manajemen Produk & Kategori:** CRUD Produk (mendukung pencarian SKU/Barcode) dan Kategori Produk.
- **Manajemen Stok & Supplier:** Pencatatan stok masuk/keluar serta manajemen data supplier terintegrasi.
- **Transaksi POS Avanzado (Hold Bill Support):**
  - **Checkout Langsung (Lunas):** Mengurangi stok produk secara otomatis (`status: COMPLETED`).
  - **Simpan Bill (Hold Bill):** Menyimpan tagihan menggantung (`status: OPEN`) tanpa memotong stok terlebih dahulu.
  - **Pelunasan Tagihan:** Endpoint khusus untuk melunasi *Hold Bill* yang kemudian memicu pemotongan stok secara *real-time*.
- **Dashboard Analytics:** Ringkasan performa penjualan, total profit, produk terlaris, dan statistik harian/bulanan.
- **Sistem Pelaporan (Modular Reporting):** Ekspor rekap presensi, transaksi, dan inventaris ke dalam format `.xlsx` secara dinamis menggunakan **ExcelJS**.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** MySQL
- **Libraries Utama:** `jsonwebtoken`, `bcrypt`, `exceljs`, `dotenv`, `cors`

---

## 📂 Struktur Folder Project