'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Получаем текущего пользователя с сервера (токен читается на сервере из httpOnly cookie)
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
        if (!response.ok) {
          throw new Error('Не удалось получить пользователя');
        }
        const data = await response.json();
        if (data.user) {
          setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (e) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    loadUser();
  }, []);

  const login = (user: User) => {
    // Сервер уже установил httpOnly cookie на /api/auth/login, просто обновим состояние
    setAuthState({ user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = (updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
}
