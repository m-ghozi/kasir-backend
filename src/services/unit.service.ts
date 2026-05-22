import { prisma } from '../lib/prisma';

export const unitService = {
  // Ambil semua unit (yang belum dihapus)
  getAllUnits: async () => {
    return await prisma.unit.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Ambil satu unit berdasarkan ID
  getUnitById: async (id: number) => {
    return await prisma.unit.findFirst({
      where: { id, isDeleted: false }
    });
  },

  // Tambah unit baru
  createUnit: async (data: { name: string; isDefault?: boolean }) => {
    // Jika unit baru dijadikan default, reset unit default sebelumnya
    if (data.isDefault) {
      await prisma.unit.updateMany({
        where: { isDefault: true, isDeleted: false },
        data: { isDefault: false }
      });
    }

    return await prisma.unit.create({
      data: {
        name: data.name,
        isDefault: data.isDefault ?? false
      }
    });
  },

  // Edit unit
  updateUnit: async (id: number, data: { name?: string; isDefault?: boolean }) => {
    // Jika unit ini dijadikan default, reset unit default sebelumnya
    if (data.isDefault) {
      await prisma.unit.updateMany({
        where: { isDefault: true, isDeleted: false, NOT: { id } },
        data: { isDefault: false }
      });
    }

    return await prisma.unit.update({
      where: { id },
      data: {
        name: data.name,
        isDefault: data.isDefault
      }
    });
  },

  // Hapus unit (Soft Delete)
  deleteUnit: async (id: number) => {
    return await prisma.unit.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
};