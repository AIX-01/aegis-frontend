'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAccessToken } from '@/lib/axios';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 앱 로드 시 refresh token으로 access token 재발급 시도
    const initAuth = async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const currentUser = await authApi.me();
        setUser(currentUser);
      } catch {
        // refresh 실패 시 로그인 필요
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: loggedInUser } = await authApi.login({ email, password });
      setUser(loggedInUser);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: err.response?.data?.error || '로그인에 실패했습니다.'
      };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.signup({ email, password, name });
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: err.response?.data?.error || '회원가입에 실패했습니다.'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 에러 무시
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push('/auth');
    }
  }, [router]);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
    isAdmin: user?.role === 'admin',
  }), [user, isLoading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
