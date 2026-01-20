import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Константы для ролей (вместо enum для SQLite)
const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EDITOR: 'EDITOR',
} as const;

// Константы для статусов заявок
const RequestStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CONTACTED: 'CONTACTED',
  CONVERTED: 'CONVERTED',
  REJECTED: 'REJECTED',
  SPAM: 'SPAM',
} as const;

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создание администратора
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Создан пользователь:', admin.email);

  // Создание менеджера
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      passwordHash: hashedPassword,
      firstName: 'Менеджер',
      lastName: 'Тестовый',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  console.log('✅ Создан пользователь:', manager.email);

  // Создание категории услуг
  const repairCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'remont-kvartir' },
    update: {},
    create: {
      slug: 'remont-kvartir',
      name: 'Ремонт квартир',
      description: 'Комплексный ремонт квартир любой сложности',
      shortDescription: 'Ремонт квартир под ключ',
      order: 1,
      isActive: true,
      metaTitle: 'Ремонт квартир в Москве',
      metaDescription: 'Профессиональный ремонт квартир в Москве',
    },
  });

  console.log('✅ Создана категория:', repairCategory.name);

  // Создание услуги
  const service = await prisma.service.upsert({
    where: { slug: 'remont-studii' },
    update: {},
    create: {
      slug: 'remont-studii',
      name: 'Ремонт студии',
      description: 'Ремонт однокомнатных студий',
      shortDescription: 'Ремонт студий под ключ',
      categoryId: repairCategory.id,
      priceFrom: 15000,
      priceTo: 25000,
      priceUnit: 'за м²',
      duration: 'от 30 дней',
      order: 1,
      isActive: true,
      isFeatured: true,
    },
  });

  console.log('✅ Создана услуга:', service.name);

  // Создание проекта
  const project = await prisma.project.create({
    data: {
      slug: 'remont-studii-moskva-siti',
      title: 'Ремонт студии в Москва Сити',
      description: 'Современный ремонт студии в центре Москвы',
      content: 'Полный описание проекта...',
      area: 45.5,
      rooms: 1,
      duration: 45,
      price: 1200000,
      location: 'Москва Сити',
      style: 'современный',
      propertyType: 'квартира',
      repairType: 'дизайнерский',
      completedAt: new Date(),
      categoryId: repairCategory.id,
      isActive: true,
      isFeatured: true,
      createdById: admin.id,
    },
  });

  console.log('✅ Создан проект:', project.title);

  // Создание FAQ
  const faq = await prisma.faq.create({
    data: {
      question: 'Сколько времени занимает ремонт?',
      answer: 'Время ремонта зависит от типа и площади помещения. Косметический ремонт занимает 2-3 недели, капитальный - от 2 до 4 месяцев.',
      category: 'общие',
      order: 1,
      isActive: true,
    },
  });

  console.log('✅ Создан FAQ:', faq.question);

  // Создание сотрудника
  const employee = await prisma.employee.create({
    data: {
      firstName: 'Иван',
      lastName: 'Иванов',
      position: 'Главный прораб',
      department: 'Прорабы',
      bio: 'Опыт работы более 10 лет',
      order: 1,
      isActive: true,
    },
  });

  console.log('✅ Создан сотрудник:', `${employee.firstName} ${employee.lastName}`);

  // Создание отзыва
  const review = await prisma.review.create({
    data: {
      authorName: 'Мария Петрова',
      content: 'Отличный ремонт! Все выполнено качественно и в срок.',
      rating: 5,
      projectId: project.id,
      source: 'internal',
      isApproved: true,
    },
  });

  console.log('✅ Создан отзыв от:', review.authorName);

  // Создание настройки калькулятора
  const calculatorConfig = await prisma.calculatorConfig.create({
    data: {
      name: 'Основная конфигурация',
      basePriceCosmetic: 5000,
      basePriceCapital: 8000,
      basePriceDesign: 12000,
      basePriceElite: 18000,
      coefficients: JSON.stringify({
        newBuilding: 0.9,
        secondary: 1.0,
        house: 1.2,
      }),
      isActive: true,
    },
  });

  console.log('✅ Создана конфигурация калькулятора');

  // Создание настроек сайта
  const settings = [
    // Контакты
    { key: 'phone', value: '+7 (495) 123-45-67', type: 'string', group: 'contacts' },
    { key: 'email', value: 'info@example.com', type: 'string', group: 'contacts' },
    { key: 'address', value: 'г. Москва, ул. Примерная, д. 1', type: 'string', group: 'contacts' },
    { key: 'workHours', value: 'Пн-Пт: 9:00 - 18:00, Сб-Вс: 10:00 - 16:00', type: 'string', group: 'contacts' },
    
    // Социальные сети
    { key: 'telegram', value: 'https://t.me/yourcompany', type: 'string', group: 'social' },
    { key: 'whatsapp', value: 'https://wa.me/74951234567', type: 'string', group: 'social' },
    { key: 'vk', value: 'https://vk.com/yourcompany', type: 'string', group: 'social' },
    { key: 'youtube', value: 'https://youtube.com/@yourcompany', type: 'string', group: 'social' },
    
    // Дизайн
    { key: 'logo', value: '/logo.svg', type: 'string', group: 'design' },
    
    // SEO
    { key: 'defaultMetaTitle', value: 'Ремонтно-строительная компания | Профессиональный ремонт и дизайн', type: 'string', group: 'seo' },
    { key: 'defaultMetaDescription', value: 'Профессиональный ремонт квартир, домов и офисов. Дизайн интерьеров. Гарантия качества. Выполнено более 500+ проектов.', type: 'string', group: 'seo' },
    { key: 'defaultMetaKeywords', value: 'ремонт квартир, дизайн интерьера, ремонт офисов, капитальный ремонт, евроремонт', type: 'string', group: 'seo' },
    
    // Калькулятор (дублирование для быстрого доступа через settings)
    { key: 'basePriceCosmetic', value: '5000', type: 'number', group: 'calculator' },
    { key: 'basePriceCapital', value: '8000', type: 'number', group: 'calculator' },
    { key: 'basePriceDesign', value: '12000', type: 'number', group: 'calculator' },
    { key: 'basePriceElite', value: '18000', type: 'number', group: 'calculator' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Созданы настройки сайта (19 настроек)');

  console.log('🎉 Заполнение базы данных завершено!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

