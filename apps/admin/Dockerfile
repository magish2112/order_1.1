# Dockerfile для Admin (React + Vite)
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

# URL API для браузера (встраивается в сборку; для production: https://eternostroy.ru/api/v1)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Ссылка «На сайт» в шапке панели
ARG VITE_SITE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

# Увеличиваем лимит памяти Node.js для сборки Vite (rendering chunks требует много RAM)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Собираем приложение
RUN npm run build

# Production образ с nginx
FROM nginx:alpine AS runner

# Копируем собранные файлы в /panel для доступа по https://site/panel
COPY --from=builder /app/dist /usr/share/nginx/html/panel

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

