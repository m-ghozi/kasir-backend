import { prisma } from '../lib/prisma';

export const stockService = {
  // === STOCK IN (Stok Masuk) ===
  getAllStockIn: async () => {
    return await prisma.stockIn.findMany({
      orderBy: { date: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        supplier: { select: { name: true } },
        createdBy: { select: { name: true } }
      }
    });
  },

  createStockIn: async (data: any, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Catat riwayat Stock In
      const stockIn = await tx.stockIn.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId || null,
          quantity: data.quantity,
          buyPrice: data.buyPrice,
          totalPrice: data.quantity * data.buyPrice, // Hitung total otomatis
          notes: data.notes,
          createdById: userId,
        }
      });

      // 2. Tambahkan stok produk & Update HPP (opsional, jika harga beli berubah)
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            increment: data.quantity // Otomatis menambah stok lama dengan yang baru
          }
        }
      });

      return stockIn;
    });
  },

  // === STOCK OUT (Stok Keluar) ===
  getAllStockOut: async () => {
    return await prisma.stockOut.findMany({
      orderBy: { date: 'desc' },
      include: {
        product: { select: { name: true, sku: true, stock: true } },
        createdBy: { select: { name: true } }
      }
    });
  },

  createStockOut: async (data: any, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Cek apakah stok cukup untuk dikeluarkan
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product || product.stock < data.quantity) {
        throw new Error(`Stok tidak mencukupi! Stok saat ini hanya ${product?.stock || 0}`);
      }

      // 2. Catat riwayat Stock Out
      const stockOut = await tx.stockOut.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          reason: data.reason, // 'rusak', 'kadaluarsa', 'hilang'
          notes: data.notes,
          createdById: userId,
        }
      });

      // 3. Kurangi stok produk
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            decrement: data.quantity // Otomatis mengurangi stok
          }
        }
      });

      return stockOut;
    });
  }
};