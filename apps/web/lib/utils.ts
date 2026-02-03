import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Нормализует URL изображения:
 * - Если URL уже абсолютный (начинается с http/https), возвращает как есть
 * - Если URL относительный, добавляет базовый URL (SITE_URL или API_URL)
 * - Никогда не использует localhost в production — для пустых настроек возвращает относительный путь
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

  // Базовый URL: приоритет SITE_URL (логотип, статика), затем API (uploads)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window === 'undefined' ? process.env.API_URL : undefined)

  // Никогда не используем localhost в production — возвращаем относительный путь
  if (!base || base.includes('localhost')) {
    return cleanUrl // Браузер использует текущий origin
  }

  return `${base.replace(/\/$/, '')}${cleanUrl}`
}

