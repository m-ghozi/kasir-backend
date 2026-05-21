import { prisma } from '../lib/prisma';

export const dashboardService = {
  getSummary: async () => {
    // Menentukan batas waktu "Hari Ini" (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Ambil Transaksi Hari Ini yang statusnya 'completed' (bukan 'open')
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        date: { gte: today },
        status: 'completed', // Filter yang setara dengan status !== 'open' di frontend
      },
      include: {
        createdBy: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    // Perhitungan ringkasan hari ini untuk kartu statistik
    const todayRevenue = todayTransactions.reduce((acc, tx) => acc + Number(tx.total), 0);
    const todayProfit = todayTransactions.reduce((acc, tx) => acc + Number(tx.profit), 0);

    // 2. Hitung jumlah tagihan/pesanan yang masih menggantung (status 'open')
    const openBillsCount = await prisma.transaction.count({
      where: { status: 'open' }
    });

    // 3. Hitung total jenis produk aktif yang dimiliki toko
    const productsCount = await prisma.product.count({
      where: { isDeleted: false }
    });

    // 4. Cari Produk yang stoknya menipis (stok < 10) beserta nama Unitnya
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lt: 10 },
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        unit: true // Penting karena frontend merender {product.unit}
      },
      orderBy: { stock: 'asc' }
    });

    // 5. Ambil 5 Transaksi Terakhir secara global untuk riwayat cepat
    const recentTransactions = await prisma.transaction.findMany({
      where: { status: 'completed' },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        createdBy: { select: { name: true } }
      }
    });

    // Output struktur data disesuaikan dengan kebutuhan rendering komponen Dashboard
    return {
      todayTransactions,
      stats: {
        todayRevenue,
        todayProfit,
        todaySalesCount: todayTransactions.length,
        openBillsCount,
        productsCount
      },
      lowStockProducts,
      recentTransactions
    };
  }
};