/**
 * Утилита для санитизации HTML контента (защита от XSS)
 * Использует простую реализацию без внешних зависимостей
 */

/**
 * Разрешенные HTML теги
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'code', 'pre',
  'div', 'span',
] as const;

/**
 * Разрешенные атрибуты для тегов
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  div: ['class'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};

/**
 * Санитизирует HTML контент, удаляя потенциально опасные элементы
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Простая реализация через регулярные выражения
  // Для production рекомендуется использовать библиотеку типа DOMPurify
  
  // Удаляем script теги и их содержимое
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Удаляем event handlers (onclick, onerror и т.д.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Удаляем javascript: протоколы
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Удаляем iframe, embed, object
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  
  // Удаляем style теги
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Удаляем опасные атрибуты style
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
  
  return sanitized;
}

/**
 * Валидирует URL (для href и src атрибутов)
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Разрешаем относительные URL и абсолютные http/https
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

