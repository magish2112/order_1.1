import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокируем axios - все должно быть внутри функции
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  
  const mockInstance = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };
  
  // Сохраняем ссылки на моки для использования в тестах
  (globalThis as any).__mockAxiosInstance = mockInstance;
  (globalThis as any).__mockAxiosMethods = { mockGet, mockPost, mockPut, mockDelete };
  
  return {
    default: {
      create: () => mockInstance,
    },
  };
});

vi.mock('@/store/authStore', () => ({
  authStore: {
    getState: () => ({
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      setTokens: vi.fn(),
      logout: vi.fn(),
    }),
  },
}));

// Импортируем api после моков
import { api } from '@/lib/api';

describe('API Client', () => {
  let mockInstance: any;
  let mockMethods: any;

  beforeEach(() => {
    mockInstance = (globalThis as any).__mockAxiosInstance;
    mockMethods = (globalThis as any).__mockAxiosMethods;
    vi.clearAllMocks();
  });

  it('должен выполнять GET запрос', async () => {
    const mockData = { data: { success: true } };
    mockMethods.mockGet.mockResolvedValueOnce(mockData);

    const result = await api.get('/test');
    expect(result).toEqual(mockData);
    expect(mockMethods.mockGet).toHaveBeenCalled();
  });

  it('должен выполнять POST запрос', async () => {
    const mockData = { data: { success: true } };
    const payload = { name: 'test' };
    mockMethods.mockPost.mockResolvedValueOnce(mockData);

    const result = await api.post('/test', payload);
    expect(result).toEqual(mockData);
    expect(mockMethods.mockPost).toHaveBeenCalled();
  });

  it('должен выполнять PUT запрос', async () => {
    const mockData = { data: { success: true } };
    const payload = { name: 'test' };
    mockMethods.mockPut.mockResolvedValueOnce(mockData);

    const result = await api.put('/test', payload);
    expect(result).toEqual(mockData);
    expect(mockMethods.mockPut).toHaveBeenCalled();
  });

  it('должен выполнять DELETE запрос', async () => {
    const mockData = { data: { success: true } };
    mockMethods.mockDelete.mockResolvedValueOnce(mockData);

    const result = await api.delete('/test');
    expect(result).toEqual(mockData);
    expect(mockMethods.mockDelete).toHaveBeenCalled();
  });
});
