# ✅ Production Deployment Checklist

**Проект:** Eterno Construction Website  
**Дата:** 2026-01-26  
**Окружение:** Production

---

## 📋 Pre-Deployment (Перед деплоем)

### 1. Environment Configuration

- [ ] **Скопировать .env.production в .env**
  ```bash
  cp .env.production .env
  ```

- [ ] **Заполнить все обязательные переменные:**
  - [ ] `POSTGRES_PASSWORD` - надежный пароль (минимум 20 символов)
  - [ ] `JWT_SECRET` - уникальный секрет (минимум 32 символа)
  - [ ] `JWT_REFRESH_SECRET` - другой уникальный секрет (минимум 32 символа)
  - [ ] `CORS_ORIGIN` - конкретные домены (НЕ `*`)
  - [ ] `NEXT_PUBLIC_API_URL` - публичный URL API
  - [ ] `ADMIN_URL` - URL админки
  - [ ] `NEXT_PUBLIC_SITE_URL` - URL сайта
  - [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - настройки почты

- [ ] **Генерация секретов:**
  ```bash
  # Генерация надежных секретов
  openssl rand -base64 32  # для JWT_SECRET
  openssl rand -base64 32  # для JWT_REFRESH_SECRET
  openssl rand -base64 24  # для POSTGRES_PASSWORD
  ```

### 2. Security Audit

- [ ] **Проверить, что нет hardcoded секретов в коде**
  ```bash
  grep -r "password.*123\|secret.*test\|admin.*example" apps/ --exclude-dir=node_modules --exclude-dir=tests
  ```

- [ ] **Проверить CORS настройки**
  - [ ] CORS_ORIGIN содержит ТОЛЬКО production домены
  - [ ] Нет `*` в production

- [ ] **Проверить что порты БД закрыты**
  - [ ] PostgreSQL порт закрыт в docker-compose.production.yml
  - [ ] Redis порт закрыт в docker-compose.production.yml

- [ ] **Удалить или закомментировать DEV переменные**
  - [ ] `DEV_ADMIN_EMAIL` пустой
  - [ ] `DEV_ADMIN_PASSWORD` пустой

### 3. Code Audit

- [ ] **Удалить тестовые страницы**
  - [ ] `/test-animated-buttons` удален или закрыт
  - [ ] `/color-palette` удален или закрыт

- [ ] **Проверить seed.ts**
  - [ ] Убедиться что дефолтный пароль `admin123` НЕ используется
  - [ ] Изменить email с `admin@example.com` на реальный

- [ ] **Проверить example.com ссылки**
  ```bash
  grep -r "example\.com" apps/web/ --exclude-dir=node_modules
  ```
  - [ ] Заменить все `example.com` на реальный домен

### 4. Database

- [ ] **Обновить Prisma схему (если нужно)**
  ```bash
  cd apps/api
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **Подготовить seed данные для production**
  - [ ] Проверить `prisma/seed.ts`
  - [ ] Убедиться что используются безопасные пароли

### 5. Assets

- [ ] **Оптимизировать изображения**
  - [ ] Все изображения в WebP
  - [ ] Есть 3 размера (thumbnail, medium, large)

- [ ] **Проверить логотип**
  - [ ] Логотип минифицирован
  - [ ] Есть в `public/logo.svg`

---

## 🚀 Deployment (Деплой)

### 1. Server Setup

- [ ] **Подготовить сервер**
  - [ ] Ubuntu 22.04 LTS (или аналог)
  - [ ] Минимум 2 CPU, 4 GB RAM
  - [ ] 50+ GB дискового пространства
  - [ ] Docker и Docker Compose установлены

- [ ] **Настроить файрволл**
  ```bash
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw enable
  ```

- [ ] **Создать пользователя для приложения**
  ```bash
  adduser eterno
  usermod -aG docker eterno
  su - eterno
  ```

### 2. Code Deployment

- [ ] **Склонировать репозиторий**
  ```bash
  git clone <your-repo> /home/eterno/app
  cd /home/eterno/app
  ```

- [ ] **Скопировать .env файл**
  ```bash
  cp .env.production .env
  nano .env  # Заполнить все переменные
  ```

### 3. SSL Certificates

- [ ] **Установить Certbot**
  ```bash
  sudo apt install certbot
  ```

- [ ] **Получить SSL сертификаты**
  ```bash
  sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com
  ```

- [ ] **Обновить nginx.conf для SSL**
  - [ ] Добавить `listen 443 ssl http2;`
  - [ ] Указать пути к сертификатам
  - [ ] Настроить редирект HTTP → HTTPS

### 4. Run Deployment Script

- [ ] **Сделать скрипт исполняемым**
  ```bash
  chmod +x scripts/deploy-production.sh
  ```

- [ ] **Запустить деплой**
  ```bash
  ./scripts/deploy-production.sh
  ```

- [ ] **Проверить логи**
  ```bash
  docker compose logs -f
  ```

---

## 🔍 Post-Deployment (После деплоя)

### 1. Health Checks

- [ ] **API Health**
  ```bash
  curl https://yourdomain.com/health
  # Ожидается: {"status": "ok"}
  ```

- [ ] **Web доступен**
  ```bash
  curl -I https://yourdomain.com/
  # Ожидается: 200 OK
  ```

- [ ] **Admin доступен**
  ```bash
  curl -I https://admin.yourdomain.com/
  # Ожидается: 200 OK
  ```

### 2. Database Setup

- [ ] **Запустить миграции**
  ```bash
  docker compose exec api npx prisma migrate deploy
  ```

- [ ] **Seed начальных данных (если нужно)**
  ```bash
  docker compose exec api npx prisma db seed
  ```

- [ ] **Создать первого админа**
  ```bash
  docker compose exec api node create-admin-eterno.js
  ```

### 3. Image Optimization

- [ ] **Мигрировать старые изображения (если есть)**
  ```bash
  docker compose exec api npx tsx scripts/migrate-images-to-optimized.ts
  ```

### 4. Performance Testing

- [ ] **Lighthouse Audit**
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

- [ ] **Load Testing**
  ```bash
  npm install -g autocannon
  autocannon -c 100 -d 10 https://yourdomain.com
  # Ожидается: 500+ req/sec
  ```

- [ ] **Bundle Size Check**
  - [ ] First Load JS < 120 KB
  - [ ] Total Page < 2 MB

### 5. Security Testing

- [ ] **SSL Labs Test**
  - [ ] Посетить https://www.ssllabs.com/ssltest/
  - [ ] Оценка A или A+

- [ ] **Security Headers Check**
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block

- [ ] **CORS Validation**
  ```bash
  curl -H "Origin: https://malicious.com" https://yourdomain.com/api/v1/projects
  # Должен вернуть ошибку CORS
  ```

### 6. Functionality Testing

- [ ] **Авторизация работает**
  - [ ] Можно войти в админку
  - [ ] JWT токены генерируются
  - [ ] Refresh токены работают

- [ ] **Загрузка файлов**
  - [ ] Можно загрузить изображение проекта
  - [ ] Генерируются 3 размера
  - [ ] Изображения доступны через /uploads/

- [ ] **Email уведомления**
  - [ ] SMTP настроен
  - [ ] Приходят уведомления о заявках

- [ ] **Формы работают**
  - [ ] Форма обратной связи
  - [ ] Калькулятор
  - [ ] Заявка на консультацию

---

## 📊 Monitoring Setup

### 1. Logs

- [ ] **Настроить централизованные логи**
  - [ ] Logrotate настроен
  - [ ] Максимум 10MB на файл
  - [ ] Хранить 7 дней

### 2. Backups

- [ ] **Настроить автоматические бэкапы**
  - [ ] Cron job для бэкапа БД (ежедневно)
  - [ ] Бэкап uploads (еженедельно)
  - [ ] Хранить 30 дней

- [ ] **Проверить восстановление из бэкапа**
  ```bash
  # Test restore
  docker compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE test_restore;"
  docker compose exec -T postgres psql -U postgres -d test_restore < backups/latest/database.sql
  ```

### 3. Monitoring (опционально)

- [ ] **Uptime Monitoring**
  - [ ] UptimeRobot / Pingdom настроен
  - [ ] Проверка каждые 5 минут
  - [ ] Email уведомления при падении

- [ ] **Performance Monitoring**
  - [ ] Google Analytics установлен
  - [ ] Web Vitals мониторинг

---

## 🔒 Security Hardening

### 1. Server Security

- [ ] **SSH настроен безопасно**
  - [ ] Отключен root login
  - [ ] Только SSH keys (no password)
  - [ ] Изменен дефолтный порт (опционально)

- [ ] **Fail2ban установлен**
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  ```

- [ ] **Automatic Updates**
  ```bash
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure -plow unattended-upgrades
  ```

### 2. Application Security

- [ ] **Rate Limiting активен**
  - [ ] Проверить в Nginx конфиге
  - [ ] Проверить в API (Fastify)

- [ ] **HTTPS Enforcement**
  - [ ] Все HTTP редиректит на HTTPS
  - [ ] HSTS header активен

- [ ] **Database Security**
  - [ ] PostgreSQL доступен только внутри Docker сети
  - [ ] Используется надежный пароль
  - [ ] Регулярные бэкапы

---

## 📝 Documentation

- [ ] **Обновить README.md**
  - [ ] Production URLs
  - [ ] Deployment instructions
  - [ ] Maintenance procedures

- [ ] **Создать Runbook**
  - [ ] Как перезапустить сервисы
  - [ ] Как проверить логи
  - [ ] Как сделать rollback

- [ ] **Документировать credentials**
  - [ ] Хранить в Password Manager
  - [ ] Поделиться с командой (безопасно)

---

## ✅ Final Checks

- [ ] **Все environment переменные заполнены**
- [ ] **SSL сертификаты настроены**
- [ ] **Бэкапы работают**
- [ ] **Мониторинг настроен**
- [ ] **Performance метрики в норме**
- [ ] **Security audit пройден**
- [ ] **Все функции протестированы**
- [ ] **Документация обновлена**

---

## 🎉 Launch!

- [ ] **Объявить о запуске**
- [ ] **Мониторить первые 24 часа**
- [ ] **Собрать feedback**
- [ ] **Запланировать ретроспективу**

---

## 📞 Emergency Contacts

**В случае критических проблем:**

1. **Rollback:**
   ```bash
   docker compose down
   # Восстановить из бэкапа
   docker compose up -d
   ```

2. **Check Logs:**
   ```bash
   docker compose logs -f api
   docker compose logs -f nginx
   ```

3. **Support:**
   - DevOps: [контакт]
   - Backend: [контакт]
   - Frontend: [контакт]

---

**Статус деплоя:** [ ] НЕ НАЧАТ | [ ] В ПРОЦЕССЕ | [ ] ЗАВЕРШЕН | [ ] ПРОБЛЕМЫ

**Дата деплоя:** __________  
**Кто деплоил:** __________  
**Версия:** __________
