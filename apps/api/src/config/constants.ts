import env from './env'

/**
 * Константы приложения
 * Централизованное хранение всех URL и настроек
 */

// API URLs
export const API = {
  PORT: env.PORT,
  HOST: env.HOST,
  BASE_URL: process.env.API_BASE_URL || `http://${env.HOST}:${env.PORT}`,
  PUBLIC_URL: process.env.API_PUBLIC_URL || env.ADMIN_URL || `http://${env.HOST}:${env.PORT}`,
} as const

// Frontend URLs
export const FRONTEND = {
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',
  ADMIN_URL: env.ADMIN_URL || 'http://localhost:3001',
} as const

// CORS настройки
export const CORS_ORIGINS = env.CORS_ORIGIN.split(',').map(origin => origin.trim())

// Upload настройки  
export const UPLOAD = {
  DIR: env.UPLOAD_DIR,
  PUBLIC_URL: env.PUBLIC_UPLOAD_URL,
  MAX_FILE_SIZE: env.MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB: Math.round(env.MAX_FILE_SIZE / 1024 / 1024),
} as const

// Swagger настройки
export const SWAGGER = {
  ENABLED: env.NODE_ENV !== 'production',
  HOST: process.env.SWAGGER_HOST || `${env.HOST}:${env.PORT}`,
  SCHEME: process.env.SWAGGER_SCHEME || (env.NODE_ENV === 'production' ? 'https' : 'http'),
} as const

// Безопасность
export const SECURITY = {
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: '1 minute',
  JWT_ACCESS_EXPIRY: env.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY: env.JWT_REFRESH_EXPIRY,
} as const

// Кеширование
export const CACHE = {
  REDIS_ENABLED: !!env.REDIS_URL,
  DEFAULT_TTL: 60 * 5, // 5 минут
  SETTINGS_TTL: 60 * 60, // 1 час
  MEDIA_TTL: 60 * 60 * 24, // 1 день
} as const

export default {
  API,
  FRONTEND,
  CORS_ORIGINS,
  UPLOAD,
  SWAGGER,
  SECURITY,
  CACHE,
}
