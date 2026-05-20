import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router();

// Endpoint GET /api/products
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true } // Joins data kategori langsung
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Endpoint POST /api/products
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      sku,
      categoryId,
      price,
      hpp,
      stock,
      unit,
      description,
      photo,
      barcode
    } = req.body;

    // 1. Validasi field wajib
    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
      return;
    }
    if (!sku || typeof sku !== 'string' || sku.trim() === '') {
      res.status(400).json({ success: false, message: 'SKU produk wajib diisi' });
      return;
    }
    if (categoryId === undefined || categoryId === null || typeof categoryId !== 'number') {
      res.status(400).json({ success: false, message: 'ID Kategori wajib berupa angka' });
      return;
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ success: false, message: 'Harga jual wajib diisi dan bernilai non-negatif' });
      return;
    }
    if (hpp === undefined || hpp === null || isNaN(Number(hpp)) || Number(hpp) < 0) {
      res.status(400).json({ success: false, message: 'HPP wajib diisi dan bernilai non-negatif' });
      return;
    }
    if (!unit || typeof unit !== 'string' || unit.trim() === '') {
      res.status(400).json({ success: false, message: 'Satuan produk (unit) wajib diisi' });
      return;
    }

    // 2. Cek apakah Kategori ada
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!categoryExists) {
      res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
      return;
    }

    // 3. Cek keunikan SKU
    const skuExists = await prisma.product.findUnique({
      where: { sku: sku.trim() }
    });
    if (skuExists) {
      res.status(400).json({ success: false, message: 'SKU sudah digunakan oleh produk lain' });
      return;
    }

    // 4. Buat produk baru
    const finalStock = typeof stock === 'number' && stock >= 0 ? stock : 0;

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        categoryId,
        price: Number(price),
        hpp: Number(hpp),
        stock: finalStock,
        unit: unit.trim(),
        description: description ? description.trim() : null,
        photo: photo ? photo.trim() : null,
        barcode: barcode ? barcode.trim() : null,
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: newProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

export default router;