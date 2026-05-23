import { prisma } from '../src/lib/prisma';
import crypto from 'crypto';

const hashPin = (pin: string) => crypto.createHash('sha256').update(pin).digest('hex');

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // --- User Owner default ---
  const owner = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Pemilik Toko',
      pinHash: hashPin('123456'),
      role: 'owner',
      permissions: ['ALL'],
      isActive: true,
    },
  });

  // --- Payment Methods default ---
  const paymentMethods = [
    { name: 'Tunai',         category: 'tunai',    isDefault: true  },
    { name: 'Transfer Bank', category: 'transfer', isDefault: false },
    { name: 'QRIS',          category: 'qris',     isDefault: false },
    { name: 'E-Wallet',      category: 'e-wallet', isDefault: false },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: {},
      create: pm,
    });
  }

  console.log('✅ Seeding selesai!');
  console.log(`👤 Username : ${owner.username}`);
  console.log(`🔑 PIN      : 123456`);
  console.log(`💳 Payment methods: ${paymentMethods.map(p => p.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });