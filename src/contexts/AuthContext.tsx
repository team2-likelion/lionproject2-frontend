/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { UserInfo } from '../api/auth';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string, role: 'MENTEE' | 'MENTOR') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      if (authApi.hasToken()) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch {
          // 토큰이 유효하지 않으면 삭제
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    if (!response.success) {
      throw new Error(response.message);
    }

    // 로그인 성공 후 사용자 정보 조회
    const userResponse = await authApi.getMe();
    if (userResponse.success && userResponse.data) {
      setUser(userResponse.data);
    }
  };

  const signup = async (
    email: string,
    password: string,
    nickname: string,
    role: 'MENTEE' | 'MENTOR'
  ) => {
    const response = await authApi.signup({ email, password, nickname, role });

    if (!response.success) {
      throw new Error(response.message);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (authApi.hasToken()) {
      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}