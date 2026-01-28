// Проверка структуры данных
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== КАТЕГОРИИ УСЛУГ ===');
  const categories = await prisma.serviceCategory.findMany({
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          children: true,
          services: true
        }
      }
    }
  });
  console.log(JSON.stringify(categories, null, 2));

  console.log('\n=== УСЛУГИ ===');
  const services = await prisma.service.findMany({
    include: {
      category: true
    },
    take: 5
  });
  console.log(JSON.stringify(services, null, 2));

  console.log('\n=== ПРОЕКТЫ ===');
  const projects = await prisma.project.findMany({
    take: 3
  });
  console.log(JSON.stringify(projects, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
