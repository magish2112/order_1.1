import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiUrl, apiRequest, api } from '@/lib/api';

// Мокируем fetch
global.fetch = vi.fn() as any;

describe('API utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Используем дефолтное значение из кода
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
  });

  describe('getApiUrl', () => {
    it('должен создавать правильный URL с начальным слешем', () => {
      expect(getApiUrl('/services')).toBe('http://localhost:4001/api/v1/services');
    });

    it('должен создавать правильный URL без начального слеша', () => {
      expect(getApiUrl('services')).toBe('http://localhost:4001/api/v1/services');
    });
  });

  describe('apiRequest', () => {
    it('должен выполнять GET запрос', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiRequest('/test');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4001/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('должен обрабатывать ошибки', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not found' }),
      });

      await expect(apiRequest('/test')).rejects.toThrow();
    });
  });

  describe('api object', () => {
    it('должен выполнять GET запрос', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.get('/test');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен выполнять POST запрос', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { data: mockData };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.post('/test', mockData);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
        })
      );
    });

    it('должен выполнять PUT запрос', async () => {
      const mockData = { name: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      await api.put('/test', mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('должен выполнять DELETE запрос', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.delete('/test');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

