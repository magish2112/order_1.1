# Dockerfile для Web (Next.js)
FROM node:20-alpine AS base

# Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Обязательно передать при сборке для production (иначе localhost в браузере!)
ARG NEXT_PUBLIC_API_URL=
ARG NEXT_PUBLIC_SITE_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Собираем приложение
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаем пользователя без root прав
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из standalone сборки
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Копируем public директорию
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

