/**
 * Скрипт для пересоздания администратора
 * Использование: node fix-admin.js
 */

const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log('🔧 Начало пересоздания администратора...\n');

    // Хешируем пароль
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📧 Email: admin@example.com');
    console.log('🔑 Пароль: admin123');
    console.log('🔒 Хеш пароля:', hashedPassword);
    console.log('');

    // Удаляем существующего администратора (если есть)
    await prisma.user.deleteMany({
      where: {
        email: 'admin@example.com',
      },
    });

    console.log('✅ Старый администратор удален (если существовал)');

    // Создаем нового администратора
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        firstName: 'Администратор',
        lastName: 'Системы',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Администратор создан успешно!');
    console.log('📋 ID:', admin.id);
    console.log('📧 Email:', admin.email);
    console.log('👤 Имя:', admin.firstName, admin.lastName);
    console.log('🔐 Роль:', admin.role);
    console.log('');

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    console.log('✅ Проверка пароля:', isValid ? 'ПАРОЛЬ КОРРЕКТЕН' : 'ОШИБКА!');

    // Также создаем менеджера
    await prisma.user.deleteMany({
      where: {
        email: 'manager@example.com',
      },
    });

    const manager = await prisma.user.create({
      data: {
        email: 'manager@example.com',
        passwordHash: hashedPassword,
        firstName: 'Менеджер',
        lastName: 'Тестовый',
        role: UserRole.MANAGER,
        isActive: true,
      },
    });

    console.log('');
    console.log('✅ Менеджер также создан:');
    console.log('📧 Email: manager@example.com');
    console.log('🔑 Пароль: admin123');
    console.log('');

    console.log('🎉 Готово! Теперь можно войти в админ-панель.');
    console.log('');
    console.log('🌐 Адрес: http://localhost:3001');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Пароль: admin123');

  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();

