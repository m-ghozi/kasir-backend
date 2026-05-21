import { prisma } from '../lib/prisma';

export const storeSettingService = {
  // Ambil pengaturan toko (ID dikunci = 1)
  getSettings: async () => {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: 1 },
    });

    // Jalur aman: Jika data pertama belum ada di database, buatkan default-nya
    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          id: 1,
          storeName: 'Toko Kasir',
          address: 'Alamat Toko Belum Diatur',
          phone: '-',
          receiptFooter: 'Terima Kasih Atas Kunjungan Anda',
        },
      });
    }
    return settings;
  },

  // Perbarui data pengaturan toko
  updateSettings: async (data: any) => {
    return await prisma.storeSetting.upsert({
      where: { id: 1 },
      update: {
        storeName: data.name,
        address: data.address,
        phone: data.phone,
        receiptFooter: data.footerReceipt,
      },
      create: {
        id: 1,
        storeName: data.name,
        address: data.address,
        phone: data.phone,
        receiptFooter: data.footerReceipt,
      },
    });
  },
};