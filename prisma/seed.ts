import { prisma } from '../src/lib/prisma';
import crypto from 'crypto';

const hashPin = (pin: string) => crypto.createHash('sha256').update(pin).digest('hex');

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // Membuat user Owner default
  const owner = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Pemilik Toko',
      pinHash: hashPin('123456'),
      role: 'owner',
      permissions: ["ALL"],
      isActive: true,
    },
  });

  console.log('✅ Seeding selesai! User default:');
  console.log(`👤 Username: ${owner.username}`);
  console.log(`🔑 PIN     : 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });