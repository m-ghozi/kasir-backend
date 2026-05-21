import { prisma } from '../lib/prisma';

export const reportService = {
  getReportData: async (days: number) => {
    // 1. Hitung tanggal batas awal (misal: 7 atau 30 hari yang lalu)
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    sinceDate.setHours(0, 0, 0, 0);

    // 2. Ambil semua transaksi sukses dalam rentang waktu tersebut beserta itemnya
    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: sinceDate },
        status: 'completed'
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // 3. Hitung Ringkasan Total (Summary Stats)
    const totalRevenue = transactions.reduce((acc, tx) => acc + Number(tx.total), 0);
    const totalProfit = transactions.reduce((acc, tx) => acc + Number(tx.profit), 0);
    const totalSalesCount = transactions.length;

    // 4. Olah Data untuk Grafik Harian (Chart Data)
    const chartMap = new Map<string, { date: string; revenue: number; transactions: number }>();

    // Inisialisasi map dengan tanggal kosong agar chart tidak bolong jika ada hari tanpa penjualan
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
      chartMap.set(dateString, { date: dateString, revenue: 0, transactions: 0 });
    }

    // Isi data grafik dari transaksi riil
    transactions.forEach((tx) => {
      const dateString = new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
      if (chartMap.has(dateString)) {
        const current = chartMap.get(dateString)!;
        current.revenue += Number(tx.total);
        current.transactions += 1;
      }
    });

    const chartData = Array.from(chartMap.values());

    // 5. Olah Data Produk Terlaris (Top Products)
    const productMap = new Map<number, { name: string; revenue: number; profit: number; quantity: number }>();

    transactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const productId = item.productId;
        const productName = item.product?.name || 'Produk Dihapus';

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            name: productName,
            revenue: 0,
            profit: 0,
            quantity: 0
          });
        }

        const currentProduct = productMap.get(productId)!;
        currentProduct.revenue += Number(item.totalPrice);
        currentProduct.profit += Number(item.profit);
        currentProduct.quantity += item.quantity;
      });
    });

    // Urutkan berdasarkan pendapatan terbesar dan ambil 10 besar
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      stats: {
        totalRevenue,
        totalProfit,
        totalSalesCount
      },
      chartData,
      topProducts
    };
  }
};