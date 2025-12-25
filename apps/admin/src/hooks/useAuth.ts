import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authStore } from '../store/authStore';
import { apiMethods } from '../lib/api';
import { User } from '../lib/types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout: logoutStore } = authStore();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiMethods.auth.me();
      return response.data.data as User;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      authStore.getState().setUser(userData);
    }
  }, [userData]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiMethods.auth.login(email, password);
      return response.data.data;
    },
    onSuccess: (data) => {
      authStore.getState().setUser(data.user);
      authStore.getState().setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiMethods.auth.logout();
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      navigate('/login');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user: user || userData,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}

