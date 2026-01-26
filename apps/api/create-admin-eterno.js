/**
 * Скрипт для создания администратора с email admineterno@yandex.ru
 * Использование: node create-admin-eterno.js [пароль]
 *   Пароль: 1) первый аргумент, 2) ADMIN_INITIAL_PASSWORD, 3) ADMIN_PASSWORD, 4) дефолт (только dev)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD = process.argv[2] || process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'Adm!n3t3rn0#2024$Secure';

async function createAdminEterno() {
  try {
    const hasPassword = !!process.argv[2] || !!process.env.ADMIN_INITIAL_PASSWORD || !!process.env.ADMIN_PASSWORD;
    if (process.env.NODE_ENV === 'production' && !hasPassword) {
      console.error('❌ В production задайте ADMIN_INITIAL_PASSWORD (или ADMIN_PASSWORD) в .env');
      console.error('   Пример: ADMIN_INITIAL_PASSWORD="ваш_надёжный_пароль" node create-admin-eterno.js\n');
      process.exit(1);
    }
    console.log('🔧 Создание администратора...\n');

    // Проверяем подключение к базе данных
    try {
      await prisma.$connect();
      console.log('✅ Подключение к базе данных установлено\n');
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error.message);
      console.log('\n💡 Убедитесь, что:');
      console.log('   1. База данных создана и настроена');
      console.log('   2. Миграции Prisma применены (npm run prisma:migrate)');
      console.log('   3. Переменные окружения настроены правильно\n');
      process.exit(1);
    }

    if (PASSWORD.length < 12) {
      console.warn('⚠️  Пароль короче 12 символов — рекомендуется использовать надёжный пароль (буквы, цифры, символы).');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    console.log('📧 Email: admineterno@yandex.ru');
    console.log('🔑 Пароль:', PASSWORD);
    console.log('🔒 Хеш пароля:', hashedPassword);
    console.log('');

    // Проверяем, существует ли уже пользователь с таким email
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: {
          email: 'admineterno@yandex.ru',
        },
      });
    } catch (error) {
      if (error.code === 'P2021') {
        console.error('❌ Таблица users не существует в базе данных!');
        console.log('\n💡 Выполните миграции:');
        console.log('   npm run prisma:migrate\n');
        process.exit(1);
      }
      throw error;
    }

    if (existingUser) {
      console.log('⚠️  Пользователь с таким email уже существует. Обновляем...');
      
      // Обновляем существующего пользователя
      const updatedAdmin = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: hashedPassword,
          firstName: 'Администратор',
          lastName: 'Eterno',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Администратор обновлен успешно!');
      console.log('📋 ID:', updatedAdmin.id);
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Имя:', updatedAdmin.firstName, updatedAdmin.lastName);
      console.log('🔐 Роль:', updatedAdmin.role);
    } else {
      // Создаем нового администратора
      const admin = await prisma.user.create({
        data: {
          email: 'admineterno@yandex.ru',
          passwordHash: hashedPassword,
          firstName: 'Администратор',
          lastName: 'Eterno',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Администратор создан успешно!');
      console.log('📋 ID:', admin.id);
      console.log('📧 Email:', admin.email);
      console.log('👤 Имя:', admin.firstName, admin.lastName);
      console.log('🔐 Роль:', admin.role);
    }

    console.log('');
    
    // Проверяем пароль
    const testUser = await prisma.user.findUnique({
      where: { email: 'admineterno@yandex.ru' },
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare(PASSWORD, testUser.passwordHash);
      console.log('✅ Проверка пароля:', isValid ? 'ПАРОЛЬ КОРРЕКТЕН ✓' : 'ОШИБКА! ✗');
    }

    console.log('');
    console.log('🎉 Готово! Теперь можно войти в админ-панель.');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 ДАННЫЕ ДЛЯ ВХОДА:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 Email:    admineterno@yandex.ru');
    console.log('🔑 Пароль:   ' + PASSWORD);
    console.log('🔐 Роль:     SUPER_ADMIN');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminEterno();
