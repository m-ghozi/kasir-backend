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

  // 3. Buat Transaksi Baru (Proses Kasir Berjalan / Hold Bill)
  createTransaction: async (data: any, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      // Set default status ke completed jika tidak dikirim dari frontend
      const txStatus = data.status || 'completed';

      // A. Simpan Header Transaksi
      const transaction = await tx.transaction.create({
        data: {
          receiptNumber: data.receiptNumber,
          subtotal: data.subtotal,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          total: data.total,
          paymentMethod: data.paymentMethod || null, // Bisa null jika status open
          paymentAmount: data.paymentAmount || 0,
          change: data.change || 0,
          profit: data.profit,
          status: txStatus, // Simpan status transaksi
          createdById: userId,
        }
      });

      // B. Loop setiap barang yang dibeli
      for (const item of data.items) {
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

        // C. Kurangi Stok Produk HANYA JIKA status completed
        if (txStatus === 'completed') {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      return transaction;
    });
  },

  // 4. Lunasi Hold Bill (Ubah open jadi completed)
  payOpenBill: async (id: number, paymentData: any) => {
    return await prisma.$transaction(async (tx) => {
      // A. Ambil transaksi beserta itemnya
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!transaction) throw new Error('Transaksi tidak ditemukan');
      if (transaction.status === 'completed') throw new Error('Transaksi ini sudah lunas');

      // B. Update status dan data pembayaran
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: 'completed',
          paymentMethod: paymentData.paymentMethod,
          paymentAmount: paymentData.paymentAmount,
          change: paymentData.change,
        }
      });

      // C. Potong stok sekarang karena sudah dilunasi
      for (const item of transaction.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return updatedTransaction;
    });
  }
};