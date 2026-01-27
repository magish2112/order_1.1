// Скрипт для исправления настроек
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🔧 Обновление настроек...\n');

  // Обновляем логотип
  await prisma.setting.upsert({
    where: { key: 'logo' },
    update: { value: '/uploads/logos/logo.svg' },
    create: { key: 'logo', value: '/uploads/logos/logo.svg' }
  });
  
  console.log('✅ Логотип обновлен: /uploads/logos/logo.svg');

  // Проверяем результат
  const settings = await prisma.setting.findMany();
  console.log('\n📋 Текущие настройки:');
  settings.forEach(s => {
    console.log(`  ${s.key}: ${s.value}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
