import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    authStore.getState().logout();
  });

  it('должен иметь начальное состояние', () => {
    const state = authStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('должен устанавливать пользователя', () => {
    const user = {
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    };

    authStore.getState().setUser(user);
    const state = authStore.getState();

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('должен устанавливать токены', () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    authStore.getState().setTokens(accessToken, refreshToken);
    const state = authStore.getState();

    expect(state.accessToken).toBe(accessToken);
    expect(state.refreshToken).toBe(refreshToken);
  });

  it('должен выполнять logout', () => {
    // Устанавливаем данные
    authStore.getState().setUser({
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
    authStore.getState().setTokens('access-token', 'refresh-token');

    // Выполняем logout
    authStore.getState().logout();
    const state = authStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
