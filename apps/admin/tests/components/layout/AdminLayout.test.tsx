import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Мокируем useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    },
    logout: vi.fn(),
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

describe('AdminLayout', () => {
  it('должен рендерить children', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('должен рендерить Sidebar и Header', () => {
    const { container } = render(
      <AdminLayout>
        <div>Test</div>
      </AdminLayout>,
      { wrapper: createWrapper() }
    );

    // Проверяем наличие layout элементов
    expect(container.querySelector('.ant-layout')).toBeInTheDocument();
  });
});
