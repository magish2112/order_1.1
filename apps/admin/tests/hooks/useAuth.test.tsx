import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authStore } from '@/store/authStore';

// Мокируем API
vi.mock('@/lib/api', () => {
  const mockMe = vi.fn();
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  
  return {
    apiMethods: {
      auth: {
        me: mockMe,
        login: mockLogin,
        logout: mockLogout,
      },
    },
    __mockMethods: { mockMe, mockLogin, mockLogout },
  };
});

// Мокируем react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.getState().logout();
  });

  it('должен возвращать начальное состояние для неаутентифицированного пользователя', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('должен загружать данные пользователя при аутентификации', async () => {
    const { apiMethods } = await import('@/lib/api');
    const userData = {
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    };

    (apiMethods.auth.me as any).mockResolvedValueOnce({
      data: { data: userData },
    });

    authStore.getState().setTokens('token', 'refresh');
    authStore.getState().setUser(userData);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
    });
  });

  it('должен выполнять login', async () => {
    const loginData = {
      user: {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    };

    mockLogin.mockResolvedValueOnce({
      data: { data: loginData },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.login({ email: 'test@test.com', password: 'password' });

    await waitFor(() => {
      const { apiMethods } = require('@/lib/api');
      expect(apiMethods.auth.login).toHaveBeenCalledWith('test@test.com', 'password');
    });
  });

  it('должен выполнять logout', async () => {
    mockLogout.mockResolvedValueOnce({});

    authStore.getState().setUser({
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
    authStore.getState().setTokens('token', 'refresh');

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.logout();

    await waitFor(() => {
      const { apiMethods } = require('@/lib/api');
      expect(apiMethods.auth.logout).toHaveBeenCalled();
    });
  });
});
