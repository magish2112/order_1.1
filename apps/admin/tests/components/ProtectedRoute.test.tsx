import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Мокируем authStore
vi.mock('@/store/authStore', () => ({
  authStore: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@test.com' },
  }),
}));

describe('ProtectedRoute', () => {
  it('должен рендерить children для аутентифицированного пользователя', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

