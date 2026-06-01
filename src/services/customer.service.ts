import { prisma } from '../lib/prisma';

export const customerService = {
  // Ambil semua pelanggan (yang belum dihapus)
  getAllCustomers: async (search?: string) => {
    return await prisma.customer.findMany({
      where: {
        isDeleted: false,
        ...(search
          ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Ambil satu pelanggan berdasarkan ID
  getCustomerById: async (id: number) => {
    return await prisma.customer.findFirst({
      where: { id, isDeleted: false },
    });
  },

  // Tambah pelanggan baru
  createCustomer: async (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
      },
    });
  },

  // Edit pelanggan
  updateCustomer: async (
    id: number,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    },
  ) => {
    return await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        notes: data.notes,
      },
    });
  },

  // Hapus pelanggan (Soft Delete)
  deleteCustomer: async (id: number) => {
    return await prisma.customer.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  },

  // Riwayat transaksi pelanggan
  getCustomerTransactions: async (customerId: number) => {
    return await prisma.transaction.findMany({
      where: { customerId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        receiptNumber: true,
        total: true,
        status: true,
        date: true,
        paymentMethod: { select: { name: true } },
      },
    });
  },

  // Ringkasan statistik pelanggan (total transaksi + total belanja)
  getCustomerSummary: async (customerId: number) => {
    const result = await prisma.transaction.aggregate({
      where: { customerId, status: 'completed' },
      _count: { id: true },
      _sum: { total: true },
    });

    return {
      totalTransactions: result._count.id,
      totalSpent: result._sum.total ?? 0,
    };
  },
};