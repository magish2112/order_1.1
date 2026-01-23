/**
 * Утилиты для валидации загружаемых файлов
 */

// Разрешенные MIME-типы
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

// Разрешенные расширения файлов
export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
] as const;

/**
 * Проверяет MIME-тип файла
 */
export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase() as typeof ALLOWED_MIME_TYPES[number]);
}

/**
 * Проверяет расширение файла
 */
export function isValidExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number]);
}

/**
 * Валидирует и нормализует путь к папке (защита от path traversal)
 */
export function validateAndNormalizeFolder(folder: string, baseDir: string): string {
  const { normalize, resolve, relative } = require('path');
  
  // Нормализуем путь (убирает .. и .)
  const normalizedFolder = normalize(folder);
  
  // Разрешаем абсолютный путь
  const resolvedPath = resolve(baseDir, normalizedFolder);
  
  // Проверяем что путь находится внутри baseDir
  const relativePath = relative(baseDir, resolvedPath);
  
  if (relativePath.startsWith('..') || resolve(baseDir, relativePath) !== resolvedPath) {
    throw new Error('Недопустимый путь к папке');
  }
  
  return normalizedFolder;
}

/**
 * Проверяет размер файла
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

