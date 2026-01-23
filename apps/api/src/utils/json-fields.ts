/**
 * Утилиты для работы с JSON полями
 * Поддерживает как SQLite (строки), так и PostgreSQL (нативный Json тип)
 */

/**
 * Парсит JSON строку в массив, возвращает пустой массив при ошибке
 */
export function parseJsonArray<T = any>(value: string | null | undefined): T[] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  // Если уже массив (PostgreSQL)
  return Array.isArray(value) ? value : [];
}

/**
 * Парсит JSON строку в объект, возвращает пустой объект при ошибке
 */
export function parseJsonObject<T = any>(value: string | null | undefined): T {
  if (!value) return {} as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null ? parsed : {} as T;
    } catch {
      return {} as T;
    }
  }
  // Если уже объект (PostgreSQL)
  return typeof value === 'object' && value !== null ? value : {} as T;
}

/**
 * Сериализует массив в JSON строку (для SQLite) или возвращает как есть (для PostgreSQL)
 */
export function stringifyJsonArray<T = any>(value: T[] | null | undefined): string | T[] {
  if (!value || !Array.isArray(value)) {
    // Проверяем, используется ли PostgreSQL (по DATABASE_URL)
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
    return isPostgres ? [] : JSON.stringify([]);
  }
  // Для PostgreSQL возвращаем массив как есть, для SQLite - строку
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
  return isPostgres ? value : JSON.stringify(value);
}

/**
 * Сериализует объект в JSON строку (для SQLite) или возвращает как есть (для PostgreSQL)
 */
export function stringifyJsonObject<T = any>(value: T | null | undefined): string | T {
  if (!value || typeof value !== 'object') {
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
    return isPostgres ? ({} as T) : JSON.stringify({});
  }
  // Для PostgreSQL возвращаем объект как есть, для SQLite - строку
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
  return isPostgres ? value : JSON.stringify(value);
}

/**
 * Преобразует проект из БД, парсируя JSON поля
 */
export function transformProject(project: any) {
  if (!project) return null;
  
  return {
    ...project,
    beforeImages: parseJsonArray(project.beforeImages),
    afterImages: parseJsonArray(project.afterImages),
    designImages: parseJsonArray(project.designImages),
    serviceIds: parseJsonArray(project.serviceIds),
  };
}

/**
 * Преобразует услугу из БД, парсируя JSON поля
 */
export function transformService(service: any) {
  if (!service) return null;
  
  return {
    ...service,
    gallery: parseJsonArray(service.gallery),
    features: parseJsonObject(service.features),
  };
}

/**
 * Преобразует вакансию из БД, парсируя JSON поля
 */
export function transformVacancy(vacancy: any) {
  if (!vacancy) return null;
  
  return {
    ...vacancy,
    requirements: parseJsonArray(vacancy.requirements),
    responsibilities: parseJsonArray(vacancy.responsibilities),
    conditions: parseJsonArray(vacancy.conditions),
  };
}

/**
 * Преобразует конфигурацию калькулятора из БД, парсируя JSON поля
 */
export function transformCalculatorConfig(config: any) {
  if (!config) return null;
  
  return {
    ...config,
    coefficients: parseJsonObject(config.coefficients),
  };
}
