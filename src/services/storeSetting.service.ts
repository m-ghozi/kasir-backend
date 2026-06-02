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
          themeColor: null,
          logo: null,
        },  
      });
    }
    return settings;
  },

  updateSettings: async (data: any) => {
    const payload: Record<string, any> = {
      storeName: data.name,
      address: data.address,
      phone: data.phone,
      receiptFooter: data.footerReceipt,
    };

    // Hanya update jika field dikirim (tidak undefined)
    if (data.themeColor !== undefined) payload.themeColor = data.themeColor;
    if (data.logo !== undefined) payload.logo = data.logo;
    if (data.onboardingDone !== undefined) payload.onboardingDone = data.onboardingDone;

    return await prisma.storeSetting.upsert({
      where: { id: 1 },
      update: payload,
      create: {
        id: 1,
        storeName: data.name ?? 'Toko Kasir',
        address: data.address ?? null,
        phone: data.phone ?? null,
        receiptFooter: data.footerReceipt ?? null,
        themeColor: data.themeColor ?? null,
        logo: data.logo ?? null,
        onboardingDone: data.onboardingDone ?? false,
      },
    });
  },
};