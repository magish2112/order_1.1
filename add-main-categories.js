// Скрипт для добавления основных категорий услуг
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🔧 Добавление главных категорий...\n');

  // Главные категории для меню
  const mainCategories = [
    {
      slug: 'remont',
      name: 'Ремонт',
      description: 'Все виды ремонтных работ',
      shortDescription: 'Профессиональный ремонт под ключ',
      order: 1
    },
    {
      slug: 'dizajn',
      name: 'Дизайн',
      description: 'Дизайн интерьеров и 3D визуализация',
      shortDescription: 'Современные дизайнерские решения',
      order: 2
    },
    {
      slug: 'uslugi',
      name: 'Услуги',
      description: 'Дополнительные строительные услуги',
      shortDescription: 'Широкий спектр строительных услуг',
      order: 3
    }
  ];

  for (const cat of mainCategories) {
    try {
      const category = await prisma.serviceCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat
      });
      console.log(`✅ Категория создана/обновлена: ${category.name} (/${category.slug})`);
    } catch (error) {
      console.log(`❌ Ошибка для ${cat.name}:`, error.message);
    }
  }

  // Добавляем несколько проектов без конфликтов
  const projects = [
    {
      slug: 'kvartira-loft-40m',
      title: 'Квартира в стиле Лофт 40м²',
      description: 'Современная квартира с открытой планировкой',
      area: 40,
      rooms: 1,
      duration: 30,
      price: 1000000,
      location: 'г. Магас',
      completedAt: new Date('2025-12-01'),
      style: 'лофт',
      propertyType: 'квартира',
      isFeatured: true,
      isPublished: true
    },
    {
      slug: 'ofis-sovremennyj-60m',
      title: 'Современный офис 60м²',
      description: 'Ремонт офисного помещения в современном стиле',
      area: 60,
      rooms: 3,
      duration: 45,
      price: 1500000,
      location: 'г. Магас',
      completedAt: new Date('2025-11-15'),
      style: 'современный',
      propertyType: 'офис',
      isFeatured: true,
      isPublished: true
    }
  ];

  for (const proj of projects) {
    try {
      const project = await prisma.project.upsert({
        where: { slug: proj.slug },
        update: {},
        create: proj
      });
      console.log(`✅ Проект создан: ${project.title}`);
    } catch (error) {
      console.log(`⚠️  Проект ${proj.title} уже существует`);
    }
  }

  const counts = {
    categories: await prisma.serviceCategory.count(),
    services: await prisma.service.count(),
    projects: await prisma.project.count()
  };

  console.log('\n📊 Итого в базе:');
  console.log(`  Категорий: ${counts.categories}`);
  console.log(`  Услуг: ${counts.services}`);
  console.log(`  Проектов: ${counts.projects}`);

  await prisma.$disconnect();
}

main().catch(console.error);
