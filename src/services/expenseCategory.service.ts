import { prisma } from '../lib/prisma';

export const expenseCategoryService = {
  getAll: async () => {
    return await prisma.expenseCategory.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  },

  getById: async (id: number) => {
    return await prisma.expenseCategory.findFirst({
      where: { id, isDeleted: false },
    });
  },

  create: async (data: { name: string; color: string; icon: string }) => {
    return await prisma.expenseCategory.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        isDefault: false,
      },
    });
  },

  update: async (id: number, data: { name?: string; color?: string; icon?: string }) => {
    return await prisma.expenseCategory.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
      },
    });
  },

  // Soft delete — tolak jika ada expense aktif yang memakai kategori ini
  delete: async (id: number) => {
    const activeCount = await prisma.expense.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (activeCount > 0) {
      throw new Error(
        `Kategori tidak bisa dihapus karena masih dipakai oleh ${activeCount} pengeluaran`,
      );
    }

    return await prisma.expenseCategory.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  },
};
