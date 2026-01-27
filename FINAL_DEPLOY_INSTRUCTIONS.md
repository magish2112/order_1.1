# 🚀 Финальная инструкция по деплою

**Сервер:** 46.17.102.76  
**Пользователь:** magish  
**Пароль:** 9Oecwton!1

---

## ✅ Что готово

1. ✅ Код оптимизирован и закоммичен
2. ✅ .env файл с секретами создан
3. ✅ Minimal docker-compose готов (для сервера с 2GB RAM)
4. ✅ Файлы скопированы на сервер в `/home/magish/eterno`
5. ✅ PostgreSQL и Redis запущены
6. ✅ API образ собран

---

## 🔧 Текущий статус на сервере

**Запущено:**
- ✅ PostgreSQL (order_postgres)
- ✅ Redis (order_redis)  
- ⚠️ API (order_api) - перезапускается (ошибка)

**Проблема:** API падает при запуске (код 255)

---

## 📝 Следующие шаги (выполнить вручную)

### Подключитесь к серверу:

```bash
ssh magish@46.17.102.76
# Пароль: 9Oecwton!1
```

### На сервере выполните:

```bash
cd ~/eterno

# 1. Проверьте логи API чтобы найти ошибку
docker logs order_api

# 2. Проверьте .env файл
cat .env | grep -E "DATABASE_URL|JWT_SECRET"

# 3. Проверьте что PostgreSQL работает
docker compose -f docker-compose.minimal.yml exec postgres psql -U eterno_user -d eterno_production -c "SELECT 1"

# 4. Перезапустите API с логами
docker compose -f docker-compose.minimal.yml up api

# После того как увидите ошибку - нажмите Ctrl+C

# 5. Исправьте проблему и запустите заново
docker compose -f docker-compose.minimal.yml up -d

# 6. Когда API запустится - применим миграции
docker compose -f docker-compose.minimal.yml exec api npx prisma migrate deploy

# 7. Создадим админа
docker compose -f docker-compose.minimal.yml exec api node create-admin-eterno.js

# 8. Проверим работу
curl http://localhost/health
docker compose -f docker-compose.minimal.yml ps
```

---

## 🔍 Возможные причины ошибки API

### 1. База данных не готова
```bash
# Проверка
docker compose exec postgres pg_isready
```

### 2. Неправильный DATABASE_URL
```bash
# Проверка
docker compose exec api env | grep DATABASE_URL
```

### 3. Prisma схема не сгенерирована
```bash
# Исправление
docker compose exec api npx prisma generate
docker compose restart api
```

### 4. Порт уже занят
```bash
# Проверка
docker ps | grep 4000
netstat -tulpn | grep 4000
```

---

## 📊 После успешного запуска

### Проверка:

```bash
# Health check
curl http://46.17.102.76/health
# Должно вернуть: {"status":"ok"}

# API доступен извне
curl http://46.17.102.76/api/v1/settings/public

# Статус контейнеров
docker compose ps
# Все должны быть Up (healthy)
```

### Создание первого админа:

```bash
docker compose exec api node create-admin-eterno.js

# Введите:
# Email: admin@eterno.ru
# Имя: Admin
# Фамилия: Eterno  
# Пароль: (ваш надежный пароль)
```

---

## 🎯 Сайт будет доступен

- **API:** http://46.17.102.76/
- **Health:** http://46.17.102.76/health  
- **Swagger:** http://46.17.102.76/api/docs (если не production)

---

## 📝 Полезные команды

```bash
# Логи
docker compose logs -f api
docker compose logs api | tail -100

# Перезапуск
docker compose restart api

# Остановить все
docker compose down

# Статус
docker compose ps

# Войти в контейнер
docker compose exec api sh

# Проверка БД
docker compose exec postgres psql -U eterno_user -d eterno_production

# Очистка
docker system prune -f
```

---

## 🔒 Секреты (сохраните!)

```
JWT_SECRET=qozH/xlNXnc8JXUP7B+HXt1W5WnSjBzX4s3+SpsHtA4=
JWT_REFRESH_SECRET=bJBF3Iy0wgHGGprJ0QqsLVdOBbUFb3NtoE4GO7a4Cg0=
POSTGRES_PASSWORD=z10bZTLLrvhFRH1AOvDZ9pTtE8KrDTZP
```

---

## ⚠️ Важно

**Для production с доменом:**

1. Обновите .env на сервере:
   ```bash
   nano ~/eterno/.env
   # Замените 46.17.102.76 на ваш домен
   ```

2. Получите SSL сертификаты:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. Обновите nginx.conf для HTTPS

---

**Следующий шаг:** Подключитесь к серверу и проверьте логи API! 🔍
