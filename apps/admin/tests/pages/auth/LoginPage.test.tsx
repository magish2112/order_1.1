import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { authStore } from '@/store/authStore';

// Мокируем useAuth
const mockLogin = vi.fn();
const mockIsLoggingIn = false;
const mockLoginError = null;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoggingIn: mockIsLoggingIn,
    loginError: mockLoginError,
  }),
}));

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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.getState().logout();
  });

  it('должен рендериться', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Админ-панель')).toBeInTheDocument();
    expect(screen.getByText('Войдите в систему')).toBeInTheDocument();
  });

  it('должен отображать поля формы', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('должен валидировать форму', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /войти/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Введите email')).toBeInTheDocument();
    });
  });

  it('должен вызывать login при отправке формы', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitButton = screen.getByRole('button', { name: /войти/i });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });
});
