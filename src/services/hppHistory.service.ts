import { prisma } from '../lib/prisma';

export const hppHistoryService = {
  /**
   * Recalculate HPP using Weighted Average method and record history.
   * Formula: HPP Baru = (Stok Lama × HPP Lama + Qty Masuk × Harga Beli) / (Stok Lama + Qty Masuk)
   *
   * NOTE: Pastikan stok produk sudah di-increment SEBELUM memanggil fungsi ini,
   * karena fungsi ini membaca stok SETELAH penambahan untuk konsistensi data.
   * Oleh karena itu, oldStock dihitung dari: currentStock - incomingQty.
   */
  recalculateHpp: async (
    productId: number,
    incomingQty: number,
    buyPrice: number,
    createdBy?: number
  ) => {
    if (incomingQty <= 0) throw new Error('Qty masuk harus lebih dari 0');
    if (buyPrice < 0) throw new Error('Harga beli tidak boleh negatif');

    // Ambil data produk terbaru (stok sudah terupdate)
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
    });

    if (!product) throw new Error('Produk tidak ditemukan');

    // Stok sebelum stock in (karena stok sudah di-increment sebelumnya)
    const currentStock = product.stock ?? 0;
    const oldStock = currentStock - incomingQty;
    const oldHpp = Number(product.hpp) || 0;

    // Weighted Average Formula
    const newHpp =
      oldStock <= 0
        ? buyPrice // Stok kosong sebelumnya → HPP = harga beli langsung
        : (oldStock * oldHpp + incomingQty * buyPrice) / (oldStock + incomingQty);

    // Update HPP produk + catat history dalam satu transaksi atomik
    const [updatedProduct, history] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { hpp: parseFloat(newHpp.toFixed(2)) },
      }),
      prisma.hppHistory.create({
        data: {
          productId,
          oldHpp: parseFloat(oldHpp.toFixed(2)),
          newHpp: parseFloat(newHpp.toFixed(2)),
          oldStock,
          incomingQty,
          buyPrice,
          source: 'stock_in',
          date: new Date(),
          ...(createdBy ? { createdBy } : {}),
        },
      }),
    ]);

    return {
      oldHpp,
      newHpp: updatedProduct.hpp,
      oldStock,
      newStock: currentStock,
      history,
    };
  },

  /**
   * Update HPP secara manual (dari halaman edit produk)
   */
  updateHppManual: async (
    productId: number,
    newHpp: number,
    createdBy?: number
  ) => {
    if (newHpp < 0) throw new Error('HPP tidak boleh negatif');

    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
    });

    if (!product) throw new Error('Produk tidak ditemukan');

    const oldHpp = product.hpp ?? 0;

    const [updatedProduct, history] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { hpp: parseFloat(newHpp.toFixed(2)) },
      }),
      prisma.hppHistory.create({
        data: {
          productId,
          oldHpp: parseFloat(oldHpp.toFixed(2)),
          newHpp: parseFloat(newHpp.toFixed(2)),
          oldStock: product.stock ?? 0,
          incomingQty: 0,
          buyPrice: newHpp,
          source: 'manual',
          date: new Date(),
          ...(createdBy ? { createdBy } : {}),
        },
      }),
    ]);

    return {
      oldHpp,
      newHpp: updatedProduct.hpp,
      history,
    };
  },

  /**
   * Ambil riwayat HPP suatu produk
   */
  getHppHistory: async (productId: number, limit = 50) => {
    return await prisma.hppHistory.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    });
  },

  /**
   * Ambil semua riwayat HPP (untuk laporan / audit)
   */
  getAllHppHistory: async (filters?: {
    productId?: number;
    source?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }) => {
    return await prisma.hppHistory.findMany({
      where: {
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...(filters?.source ? { source: filters.source } : {}),
        ...(filters?.from || filters?.to
          ? {
            date: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
          : {}),
      },
      orderBy: { date: 'desc' },
      take: filters?.limit ?? 100,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    });
  },
};