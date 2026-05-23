import { prisma } from '../lib/prisma';

export const paymentMethodService = {
  getAll: async (includeInactive = false) => {
    return await prisma.paymentMethod.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  },

  getById: async (id: number) => {
    return await prisma.paymentMethod.findUnique({ where: { id } });
  },

  create: async (data: any) => {
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return await prisma.paymentMethod.create({
      data: {
        name: data.name,
        category: data.category,
        isDefault: data.isDefault ?? false,
      },
    });
  },

  update: async (id: number, data: any) => {
    if (data.isDefault === true) {
      await prisma.paymentMethod.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return await prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  deactivate: async (id: number) => {
    const pm = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new Error('Payment method tidak ditemukan');
    if (pm.isDefault) throw new Error('Metode pembayaran default tidak dapat dinonaktifkan');
    return await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false },
    });
  },

  delete: async (id: number) => {
    const txCount = await prisma.transaction.count({ where: { paymentMethodId: id } });
    if (txCount > 0) {
      throw new Error(
        `Tidak dapat menghapus: metode ini digunakan oleh ${txCount} transaksi. Gunakan nonaktifkan.`
      );
    }
    return await prisma.paymentMethod.delete({ where: { id } });
  },

  setDefault: async (id: number) => {
    await prisma.paymentMethod.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
    return await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  },
};