/**
 * Утилиты для работы с JSON полями в SQLite
 * В SQLite массивы и JSON объекты хранятся как строки
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
 * Сериализует массив в JSON строку для SQLite
 */
export function stringifyJsonArray<T = any>(value: T[] | null | undefined): string {
  if (!value || !Array.isArray(value)) return JSON.stringify([]);
  return JSON.stringify(value);
}

/**
 * Сериализует объект в JSON строку для SQLite
 */
export function stringifyJsonObject<T = any>(value: T | null | undefined): string {
  if (!value || typeof value !== 'object') return JSON.stringify({});
  return JSON.stringify(value);
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
