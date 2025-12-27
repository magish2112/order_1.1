const bcrypt = require('bcryptjs');
const fs = require('fs');

// Простой скрипт для создания администратора
async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('🔐 Данные для входа в админ панель:');
  console.log('📧 Email: admin@example.com');
  console.log('🔑 Пароль: admin123');
  console.log('🔒 Хеш пароля:', hashedPassword);
  
  // Сохраняем данные в файл
  const adminData = {
    email: 'admin@example.com',
    password: 'admin123',
    passwordHash: hashedPassword,
    firstName: 'Администратор',
    lastName: 'Системы',
    role: 'SUPER_ADMIN'
  };
  
  fs.writeFileSync('./admin-credentials.json', JSON.stringify(adminData, null, 2));
  console.log('✅ Данные администратора сохранены в admin-credentials.json');
}

createAdmin().catch(console.error);
