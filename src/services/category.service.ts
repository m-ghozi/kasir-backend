import { prisma } from '../lib/prisma';

export const categoryService = {
    // Ambil semua kategori (yang belum dihapus)
    getAllCategories: async () => {
        return await prisma.category.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' }
        });
    },

    // Ambil satu kategori berdasarkan ID
    getCategoryById: async (id: number) => {
        return await prisma.category.findFirst({
            where: { id, isDeleted: false }
        });
    },

    // Tambah kategori baru
    createCategory: async (data: { name: string; color: string; icon: string }) => {
        return await prisma.category.create({
            data: {
                name: data.name,
                color: data.color,
                icon: data.icon,
            }
        });
    },

    // Edit kategori
    updateCategory: async (id: number, data: { name?: string; color?: string; icon?: string }) => {
        return await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                color: data.color,
                icon: data.icon,
            }
        });
    },

    // Hapus kategori (Soft Delete)
    deleteCategory: async (id: number) => {
        return await prisma.category.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
    }
};