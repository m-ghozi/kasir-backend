import { prisma } from '../lib/prisma';

export const transactionService = {
  // 1. Ambil semua riwayat transaksi (Untuk Laporan)
  getAllTransactions: async () => {
    return await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { name: true, username: true } }, // Info Kasir
        items: {
          include: { product: { select: { name: true, sku: true } } } // Info Barang
        }
      }
    });
  },

  // 2. Ambil detail 1 transaksi (Untuk Cetak Struk Ulang)
  getTransactionById: async (id: number) => {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        items: { include: { product: true } }
      }
    });
  },

  // 3. Buat Transaksi Baru (Proses Kasir Berjalan)
  createTransaction: async (data: any, userId: number) => {
    // Menggunakan prisma.$transaction untuk memastikan semua operasi sukses atau gagal bersamaan
    return await prisma.$transaction(async (tx) => {

      // A. Simpan Header Transaksi
      const transaction = await tx.transaction.create({
        data: {
          receiptNumber: data.receiptNumber,
          subtotal: data.subtotal,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          total: data.total,
          paymentMethod: data.paymentMethod,
          paymentAmount: data.paymentAmount,
          change: data.change,
          profit: data.profit,
          createdById: userId, // Diambil dari token JWT kasir yang sedang login
        }
      });

      // B. Loop setiap barang yang dibeli
      for (const item of data.items) {

        // Simpan Detail Barang (TransactionItem)
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            hpp: item.hpp,
            totalPrice: item.totalPrice,
            profit: item.profit,
          }
        });

        // C. Kurangi Stok Produk di database
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity // Otomatis mengurangi stok yang ada
            }
          }
        });
      }

      return transaction;
    });
  }
};