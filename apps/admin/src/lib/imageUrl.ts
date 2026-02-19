/**
 * Формирует полный URL для изображения из относительного пути
 * Использует публичный URL сайта, а не API URL
 */
export function getImageUrl(relativeUrl: string): string {
  // Если URL уже полный (начинается с http), возвращаем как есть
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }

  // Получаем базовый URL сайта
  const siteUrl = import.meta.env.VITE_SITE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '');

  // Если относительный URL начинается с /, используем его как есть
  // Иначе добавляем / перед ним
  const normalizedUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;

  return `${siteUrl}${normalizedUrl}`;
}
