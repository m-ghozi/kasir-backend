import { prisma } from '../lib/prisma';
import { startOfDay, startOfMonth, subDays } from 'date-fns';

type RangePreset = 'today' | '7' | '30' | 'month' | 'all';

function resolveRangeStart(range: RangePreset): Date | null {
  const now = new Date();
  switch (range) {
    case 'today': return startOfDay(now);
    case '7': return startOfDay(subDays(now, 6));
    case '30': return startOfDay(subDays(now, 29));
    case 'month': return startOfMonth(now);
    case 'all': return null;
  }
}

export const expenseService = {
  // Ambil semua pengeluaran dengan filter opsional
  getAll: async (params: {
    range?: RangePreset;
    categoryId?: number;
    paymentMethodId?: number;
  }) => {
    const { range = 'all', categoryId, paymentMethodId } = params;
    const rangeStart = resolveRangeStart(range);

    return await prisma.expense.findMany({
      where: {
        isDeleted: false,
        ...(rangeStart && { date: { gte: rangeStart } }),
        ...(categoryId && { categoryId }),
        ...(paymentMethodId && { paymentMethodId }),
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
        paymentMethod: {
          select: { id: true, name: true, category: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  // Ringkasan: total & jumlah per kategori untuk range tertentu
  getSummary: async (params: { range?: RangePreset; categoryId?: number }) => {
    const { range = 'all', categoryId } = params;
    const rangeStart = resolveRangeStart(range);

    const where = {
      isDeleted: false,
      ...(rangeStart && { date: { gte: rangeStart } }),
      ...(categoryId && { categoryId }),
    };

    const [aggregate, byCategory] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    // Ambil data kategori untuk enrichment
    const categoryIds = byCategory.map((b) => b.categoryId);
    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    return {
      totalAmount: aggregate._sum.amount ?? 0,
      totalCount: aggregate._count.id,
      byCategory: byCategory.map((b) => ({
        category: catMap.get(b.categoryId) ?? null,
        totalAmount: b._sum.amount ?? 0,
        count: b._count.id,
      })),
    };
  },

  getById: async (id: number) => {
    return await prisma.expense.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        paymentMethod: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  },

  create: async (
    data: {
      title: string;
      categoryId: number;
      amount: number;
      paymentMethodId?: number;
      date: string; // ISO date string "YYYY-MM-DD"
      notes?: string;
    },
    createdById: number,
  ) => {
    // Validasi kategori ada
    const cat = await prisma.expenseCategory.findFirst({
      where: { id: data.categoryId, isDeleted: false },
    });
    if (!cat) throw new Error('Kategori tidak ditemukan');

    return await prisma.expense.create({
      data: {
        title: data.title.trim(),
        categoryId: data.categoryId,
        amount: data.amount,
        paymentMethodId: data.paymentMethodId ?? null,
        date: new Date(`${data.date}T00:00:00`),
        notes: data.notes?.trim() || null,
        createdById,
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        paymentMethod: { select: { id: true, name: true, category: true } },
      },
    });
  },

  update: async (
    id: number,
    data: {
      title?: string;
      categoryId?: number;
      amount?: number;
      paymentMethodId?: number | null;
      date?: string;
      notes?: string | null;
    },
  ) => {
    if (data.categoryId) {
      const cat = await prisma.expenseCategory.findFirst({
        where: { id: data.categoryId, isDeleted: false },
      });
      if (!cat) throw new Error('Kategori tidak ditemukan');
    }

    return await prisma.expense.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.paymentMethodId !== undefined && { paymentMethodId: data.paymentMethodId }),
        ...(data.date && { date: new Date(`${data.date}T00:00:00`) }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        paymentMethod: { select: { id: true, name: true, category: true } },
      },
    });
  },

  // Soft delete
  delete: async (id: number) => {
    return await prisma.expense.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  },
};
