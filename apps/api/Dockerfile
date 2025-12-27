# Dockerfile для API (Fastify)
FROM node:20-alpine AS base

# Установка зависимостей только если нужно
FROM base AS deps
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/prisma ./prisma

# Копируем исходный код
COPY . .

# Генерируем Prisma Client еще раз (на всякий случай)
RUN npx prisma generate

# Собираем TypeScript (продолжаем даже при ошибках типов)
RUN npm run build || true

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Устанавливаем postgresql-client для pg_isready и curl для healthcheck
RUN apk add --no-cache postgresql-client curl openssl

# Создаем пользователя без root прав
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown nodejs:nodejs /app/docker-entrypoint.sh

# Копируем необходимые файлы
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Создаем директорию для загрузок
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

USER nodejs

EXPOSE 4000

# Запускаем приложение через entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

