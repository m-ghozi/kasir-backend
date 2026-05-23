import { prisma } from '../lib/prisma';

export type PaymentCategory = 'tunai' | 'transfer' | 'qris' | 'e-wallet';

export interface CreatePaymentMethodDto {
  name: string;
  category: PaymentCategory;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  category?: PaymentCategory;
  isDefault?: boolean;
  isActive?: boolean;
}

export const paymentMethodService = {
  // GET /api/payment-methods — hanya yang aktif
  getAll: async (includeInactive = false) => {
    return prisma.paymentMethod.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  },

  // GET /api/payment-methods/:id
  getById: async (id: number) => {
    return prisma.paymentMethod.findUnique({ where: { id } });
  },

  // POST /api/payment-methods
  create: async (data: CreatePaymentMethodDto) => {
    // Jika isDefault = true, reset default lama terlebih dahulu
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.paymentMethod.create({
      data: {
        name: data.name,
        category: data.category,
        isDefault: data.isDefault ?? false,
      },
    });
  },

  // PUT /api/payment-methods/:id
  update: async (id: number, data: UpdatePaymentMethodDto) => {
    // Jika mengubah menjadi default, reset yang lain dulu
    if (data.isDefault === true) {
      await prisma.paymentMethod.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  // DELETE /api/payment-methods/:id — soft delete via isActive = false
  deactivate: async (id: number) => {
    // Pastikan metode default tidak bisa di-nonaktifkan
    const pm = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new Error('Payment method tidak ditemukan');
    if (pm.isDefault) throw new Error('Metode pembayaran default tidak dapat dinonaktifkan');

    return prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false },
    });
  },

  // DELETE /api/payment-methods/:id/hard — hapus permanen (hanya jika belum dipakai)
  hardDelete: async (id: number) => {
    const txCount = await prisma.transaction.count({ where: { paymentMethodId: id } });
    if (txCount > 0) {
      throw new Error(
        `Tidak dapat menghapus: metode ini digunakan oleh ${txCount} transaksi. Gunakan nonaktifkan.`
      );
    }

    return prisma.paymentMethod.delete({ where: { id } });
  },

  // POST /api/payment-methods/:id/set-default
  setDefault: async (id: number) => {
    await prisma.paymentMethod.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    return prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  },
};