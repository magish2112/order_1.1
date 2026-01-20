import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Мокируем API
vi.mock('@/lib/api', () => {
  const mockGetDashboard = vi.fn();
  return {
    apiMethods: {
      stats: {
        getDashboard: mockGetDashboard,
      },
    },
    __mockGetDashboard: mockGetDashboard,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен показывать загрузку', async () => {
    const { __mockGetDashboard } = await import('@/lib/api');
    (__mockGetDashboard as any).mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />, { wrapper: createWrapper() });
    // Проверяем наличие Spin компонента (загрузка)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('должен отображать статистику', async () => {
    const mockStats = {
      requests: {
        total: 10,
        new: 5,
        inProgress: 3,
        contacted: 2,
      },
      projects: {
        total: 20,
        active: 15,
        featured: 5,
      },
      articles: {
        total: 30,
        published: 25,
        drafts: 5,
      },
      employees: {
        total: 8,
        active: 7,
      },
      recentRequests: [],
    };

    const { __mockGetDashboard } = await import('@/lib/api');
    (__mockGetDashboard as any).mockResolvedValueOnce({
      data: { data: mockStats },
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Всего заявок
    });
  });
});
