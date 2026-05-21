import { prisma } from '../lib/prisma';

export const supplierService = {
  // Ambil semua supplier yang belum dihapus
  getAllSuppliers: async () => {
    return await prisma.supplier.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Ambil satu supplier berdasarkan ID
  getSupplierById: async (id: number) => {
    return await prisma.supplier.findFirst({
      where: { id, isDeleted: false }
    });
  },

  // Tambah supplier baru
  createSupplier: async (data: { name: string; phone?: string; address?: string; notes?: string }) => {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
      }
    });
  },

  // Update data supplier
  updateSupplier: async (id: number, data: { name?: string; phone?: string; address?: string; notes?: string }) => {
    return await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
      }
    });
  },

  // Hapus supplier (Soft Delete)
  deleteSupplier: async (id: number) => {
    return await prisma.supplier.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
};