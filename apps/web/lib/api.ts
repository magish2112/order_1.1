// Получаем API URL из переменных окружения
// В production NEXT_PUBLIC_API_URL и API_URL должны быть установлены
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL
    // Никогда не возвращаем localhost — в браузере он недоступен
    if (url && !url.includes('localhost')) return url
    return process.env.NEXT_PUBLIC_SITE_URL || ''
  }
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
}

const API_URL = getApiBaseUrl()

export const apiConfig = {
  baseUrl: API_URL,
  version: 'v1',
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function getApiUrl(endpoint: string): string {
  const base = apiConfig.baseUrl
  const path = `/api/${apiConfig.version}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}

/** Базовый URL API для server-side fetch (не использует localhost) */
export function getServerApiBase(): string {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
  return url.includes('localhost') ? '' : url
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint)
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = response.statusText
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Если не удалось распарсить JSON, используем statusText
      }
      
      throw new ApiError(
        errorMessage || `HTTP error! status: ${response.status}`,
        response.status
      )
    }

    return response.json()
  } catch (error) {
    // Обработка сетевых ошибок
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        'Нет подключения к серверу. Проверьте интернет-соединение.',
        0,
        error
      )
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Неизвестная ошибка',
      undefined,
      error
    )
  }
}

/**
 * Retry логика с exponential backoff
 */
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Не повторяем для клиентских ошибок (4xx)
      if (error instanceof ApiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Если это последняя попытка, выбрасываем ошибку
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff: delay * 2^attempt
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    retryRequest(() => apiRequest<T>(endpoint, { ...options, method: 'GET' })),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    retryRequest(() => apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    retryRequest(() => apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    retryRequest(() => apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })),
  
  delete: <T>(endpoint: string, options?: RequestInit) =>
    retryRequest(() => apiRequest<T>(endpoint, { ...options, method: 'DELETE' })),
}

