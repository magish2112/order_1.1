import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';

const mockUser = {
  id: '1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'ADMIN',
};

const mockLogout = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
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

describe('Header', () => {
  it('должен рендериться', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByText('Панель управления')).toBeInTheDocument();
  });

  it('должен отображать имя пользователя', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
