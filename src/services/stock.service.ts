import { prisma } from '../lib/prisma';
import { startOfDay, subDays } from 'date-fns';
import { hppHistoryService } from './hppHistory.service';

// ── Helper ────────────────────────────────────────────────────────────────────

function parsePeriod(period?: string): Date {
  const days = Number(period);
  if (!isNaN(days) && days > 0) return startOfDay(subDays(new Date(), days));
  const parsed = period ? new Date(period) : null;
  return parsed && !isNaN(parsed.getTime()) ? parsed : startOfDay(subDays(new Date(), 7));
}

export const stockService = {
  // === STOCK IN ===

  getAllStockIn: async (from?: Date) => {
    return await prisma.stockIn.findMany({
      where: from ? { date: { gte: from } } : undefined,
      orderBy: { date: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        supplier: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });
  },

  createStockIn: async (data: any, userId: number) => {
    const stockIn = await prisma.$transaction(async (tx) => {
      const record = await tx.stockIn.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId || null,
          quantity: data.quantity,
          buyPrice: data.buyPrice,
          totalPrice: data.quantity * data.buyPrice,
          notes: data.notes,
          createdById: userId,
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { stock: { increment: data.quantity } },
      });

      return record;
    });

    await hppHistoryService.recalculateHpp(
      data.productId,
      data.quantity,
      data.buyPrice,
      userId
    );

    return stockIn;
  },

  // === STOCK OUT ===

  getAllStockOut: async (from?: Date) => {
    return await prisma.stockOut.findMany({
      where: from ? { date: { gte: from } } : undefined,
      orderBy: { date: 'desc' },
      include: {
        product: { select: { name: true, sku: true, stock: true } },
        createdBy: { select: { name: true } },
      },
    });
  },

  createStockOut: async (data: any, userId: number) => {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product || product.stock < data.quantity) {
        throw new Error(`Stok tidak mencukupi! Stok saat ini hanya ${product?.stock || 0}`);
      }

      const stockOut = await tx.stockOut.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
          createdById: userId,
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { stock: { decrement: data.quantity } },
      });

      return stockOut;
    });
  },

  // === STOCK REPORT ===

  getReport: async (period?: string) => {
    const from = parsePeriod(period);

    const [
      stockInAgg,
      stockInValue,
      stockOutAgg,
      stockOutByReason,
      chartStockIn,
      chartStockOut,
      lowStock,
      outOfStock,
      totalCurrentStock,
    ] = await Promise.all([
      prisma.stockIn.aggregate({
        where: { date: { gte: from } },
        _sum: { quantity: true },
      }),
      prisma.stockIn.aggregate({
        where: { date: { gte: from } },
        _sum: { totalPrice: true, quantity: true },
      }),
      prisma.stockOut.aggregate({
        where: { date: { gte: from } },
        _sum: { quantity: true },
      }),
      prisma.stockOut.groupBy({
        by: ['reason'],
        where: { date: { gte: from } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
      }),
      prisma.stockIn.groupBy({
        by: ['date'],
        where: { date: { gte: from } },
        _sum: { quantity: true },
        orderBy: { date: 'asc' },
      }),
      prisma.stockOut.groupBy({
        by: ['date'],
        where: { date: { gte: from } },
        _sum: { quantity: true },
        orderBy: { date: 'asc' },
      }),
      prisma.product.findMany({
        where: { isDeleted: false, stock: { gt: 0, lte: 5 } },
        select: { id: true, name: true, stock: true, unit: true },
        orderBy: { stock: 'asc' },
      }),
      prisma.product.findMany({
        where: { isDeleted: false, stock: 0 },
        select: { id: true, name: true, stock: true, unit: true },
      }),
      prisma.product.aggregate({
        where: { isDeleted: false },
        _sum: { stock: true },
      }),
    ]);

    return {
      summary: {
        totalStockIn: stockInAgg._sum.quantity ?? 0,
        totalStockOut: stockOutAgg._sum.quantity ?? 0,
        totalStockInValue: stockInValue._sum.totalPrice ?? 0,
        avgBuyPrice:
          (stockInValue._sum.quantity ?? 0) > 0
            ? Number(Math.round(Number(stockInValue._sum.totalPrice ?? 0) / Number(stockInValue._sum.quantity ?? 0)))
            : 0,
        currentStock: totalCurrentStock._sum.stock ?? 0,
      },
      stockOutByReason: stockOutByReason.map(r => ({
        reason: r.reason,
        quantity: r._sum.quantity ?? 0,
      })),
      chart: {
        stockIn: chartStockIn.map(r => ({
          date: r.date,
          quantity: r._sum.quantity ?? 0,
        })),
        stockOut: chartStockOut.map(r => ({
          date: r.date,
          quantity: r._sum.quantity ?? 0,
        })),
      },
      alerts: {
        lowStock,
        outOfStock,
      },
    };
  },
};