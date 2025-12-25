/**
 * Преобразует строку в slug (URL-friendly строка)
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
}

/**
 * Создает уникальный slug, добавляя суффикс если необходимо
 */
export async function createUniqueSlug(
  text: string,
  checkUnique: (slug: string) => Promise<boolean>,
  existingSlug?: string
): Promise<string> {
  let slug = createSlug(text);
  let counter = 1;
  const baseSlug = slug;

  // Если это существующая запись и slug не изменился, возвращаем его
  if (existingSlug && existingSlug === slug) {
    return slug;
  }

  // Проверяем уникальность
  while (await checkUnique(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

