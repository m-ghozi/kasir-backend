import { prisma } from '../src/lib/prisma';

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Listrik & Air', color: '#FBBF24', icon: '💡' },
  { name: 'Sewa', color: '#8B5CF6', icon: '🏠' },
  { name: 'Gaji', color: '#10B981', icon: '👤' },
  { name: 'Transport', color: '#3B82F6', icon: '🚚' },
  { name: 'Operasional', color: '#F97316', icon: '🧰' },
  { name: 'Lainnya', color: '#6B7280', icon: '📦' },
];

async function seedExpenseCategories() {
  console.log('🌱 Seeding expense categories...');

  let created = 0;
  let skipped = 0;

  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    const existing = await prisma.expenseCategory.findFirst({
      where: { name: cat.name, isDeleted: false },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.expenseCategory.create({
      data: { ...cat, isDefault: true },
    });
    created++;
  }

  console.log(`✅ Done — ${created} created, ${skipped} skipped (already exist)`);
}

seedExpenseCategories()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());