import axios, { AxiosInstance, AxiosError } from 'axios';
import { authStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена
    this.client.interceptors.request.use(
      (config) => {
        const token = authStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor для обработки ошибок и refresh токена
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = authStore.getState().refreshToken;
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              authStore.getState().setTokens(accessToken, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            authStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  // Для загрузки файлов
  upload(url: string, formData: FormData, onProgress?: (progress: number) => void) {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const api = new ApiClient();

// Типизированные методы API
export const apiMethods = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      api.post('/admin/auth/login', { email, password }),
    logout: () => api.post('/admin/auth/logout'),
    me: () => api.get('/admin/auth/me'),
    refresh: (refreshToken: string) =>
      api.post('/admin/auth/refresh', { refreshToken }),
  },

  // Dashboard
  stats: {
    getDashboard: () => api.get('/admin/stats/dashboard'),
    getHomepage: () => api.get('/stats/homepage'),
    getViews: () => api.get('/admin/stats/views'),
  },

  // Services
  services: {
    list: (params?: any) => api.get('/admin/services', { params }),
    get: (id: string) => api.get(`/admin/services/${id}`),
    create: (data: any) => api.post('/admin/services', data),
    update: (id: string, data: any) => api.put(`/admin/services/${id}`, data),
    delete: (id: string) => api.delete(`/admin/services/${id}`),
  },

  categories: {
    list: (params?: any) => api.get('/admin/categories', { params }),
    get: (id: string) => api.get(`/admin/categories/${id}`),
    create: (data: any) => api.post('/admin/categories', data),
    update: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
    delete: (id: string) => api.delete(`/admin/categories/${id}`),
  },

  // Projects
  projects: {
    list: (params?: any) => api.get('/admin/projects', { params }),
    get: (id: string) => api.get(`/admin/projects/${id}`),
    create: (data: any) => api.post('/admin/projects', data),
    update: (id: string, data: any) => api.put(`/admin/projects/${id}`, data),
    delete: (id: string) => api.delete(`/admin/projects/${id}`),
  },

  // Articles
  articles: {
    list: (params?: any) => api.get('/admin/articles', { params }),
    get: (id: string) => api.get(`/admin/articles/${id}`),
    create: (data: any) => api.post('/admin/articles', data),
    update: (id: string, data: any) => api.put(`/admin/articles/${id}`, data),
    delete: (id: string) => api.delete(`/admin/articles/${id}`),
    publish: (id: string) => api.patch(`/admin/articles/${id}/publish`),
  },

  // Requests
  requests: {
    list: (params?: any) => api.get('/admin/requests', { params }),
    get: (id: string) => api.get(`/admin/requests/${id}`),
    updateStatus: (id: string, status: string, notes?: string) =>
      api.patch(`/admin/requests/${id}/status`, { status, notes }),
    assign: (id: string, handledById: string) =>
      api.patch(`/admin/requests/${id}/assign`, { handledById }),
    stats: (params?: any) => api.get('/admin/stats/requests', { params }),
  },

  // Employees
  employees: {
    list: (params?: any) => api.get('/admin/employees', { params }),
    get: (id: string) => api.get(`/admin/employees/${id}`),
    create: (data: any) => api.post('/admin/employees', data),
    update: (id: string, data: any) => api.put(`/admin/employees/${id}`, data),
    delete: (id: string) => api.delete(`/admin/employees/${id}`),
  },

  // Reviews
  reviews: {
    list: (params?: any) => api.get('/admin/reviews', { params }),
    get: (id: string) => api.get(`/admin/reviews/${id}`),
    create: (data: any) => api.post('/admin/reviews', data),
    update: (id: string, data: any) => api.put(`/admin/reviews/${id}`, data),
    delete: (id: string) => api.delete(`/admin/reviews/${id}`),
    approve: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
  },

  // Vacancies
  vacancies: {
    list: (params?: any) => api.get('/admin/vacancies', { params }),
    get: (id: string) => api.get(`/admin/vacancies/${id}`),
    create: (data: any) => api.post('/admin/vacancies', data),
    update: (id: string, data: any) => api.put(`/admin/vacancies/${id}`, data),
    delete: (id: string) => api.delete(`/admin/vacancies/${id}`),
  },

  // FAQ
  faqs: {
    list: (params?: any) => api.get('/admin/faqs', { params }),
    get: (id: string) => api.get(`/admin/faqs/${id}`),
    create: (data: any) => api.post('/admin/faqs', data),
    update: (id: string, data: any) => api.put(`/admin/faqs/${id}`, data),
    delete: (id: string) => api.delete(`/admin/faqs/${id}`),
  },

  // Media
  media: {
    list: (params?: any) => api.get('/admin/media', { params }),
    upload: (file: File, folder?: string, onProgress?: (progress: number) => void) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }
      return api.upload('/admin/media/upload', formData, onProgress);
    },
    delete: (id: string) => api.delete(`/admin/media/${id}`),
  },

  // Settings
  settings: {
    list: (params?: any) => api.get('/admin/settings', { params }),
    update: (settings: any[]) => api.put('/admin/settings', settings),
  },

  // Calculator
  calculator: {
    getConfig: () => api.get('/admin/calculator/config'),
    updateConfig: (data: any) => api.put('/admin/calculator/config', data),
  },
};

