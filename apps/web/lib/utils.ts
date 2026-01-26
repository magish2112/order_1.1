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
 * - Если URL относительный (начинается с /), добавляет базовый URL API
 * - Если URL пустой или null, возвращает null
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null
  }

  // Если URL уже абсолютный, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Если URL относительный, добавляем базовый URL API
  const apiUrl = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL // Client-side
    : (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL) // Server-side
  
  if (!apiUrl) {
    console.warn('⚠️  API URL not configured. Set NEXT_PUBLIC_API_URL in .env')
    return imageUrl // Возвращаем как есть, без базового URL
  }
  
  // Убираем начальный слеш если он есть, чтобы избежать двойных слешей
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  
  return `${apiUrl}${cleanUrl}`
}

