import { prisma } from '../lib/prisma';

export const productService = {
  getAllProducts: async () => {
    return await prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  getProductById: async (id: number) => {
    return await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: { category: true }
    });
  },

  createProduct: async (data: any) => {
    return await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        hpp: data.hpp,
        stock: data.stock || 0,
        unit: data.unit,
        description: data.description,
        barcode: data.barcode,
        photo: data.photo,
      }
    });
  },

  updateProduct: async (id: number, data: any) => {
    return await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        hpp: data.hpp,
        stock: data.stock,
        unit: data.unit,
        description: data.description,
        barcode: data.barcode,
        photo: data.photo,
      }
    });
  },

  deleteProduct: async (id: number) => {
    return await prisma.product.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }
};