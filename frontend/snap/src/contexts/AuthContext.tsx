import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe, patchMe, MeResponse } from '../services/authService';

export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

interface AuthContextType {
  user: User | null;
  backendUser: MeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboarded: boolean;
  initDataRaw: string | null;
  completeOnboarding: (city: string) => Promise<void>;
  login: (userData: User, initData?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const parseInitData = (initDataRaw: string): User | null => {
  try {
    const params = new URLSearchParams(initDataRaw);
    const userParam = params.get('user');
    if (!userParam) return null;
    const userData = JSON.parse(decodeURIComponent(userParam));
    return {
      id: userData.id,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      photoUrl: userData.photo_url || '',
      authDate: parseInt(params.get('auth_date') || '0', 10),
      hash: params.get('hash') || '',
    };
  } catch {
    return null;
  }
};

const getMockInitData = (): { user: User; initData: string } => {
  const mockId = 123456789;
  const user: User = {
    id: mockId,
    firstName: 'Иван',
    lastName: 'Иванов',
    username: 'ivan_user',
    photoUrl: '',
    authDate: Math.floor(Date.now() / 1000),
    hash: 'mock_hash',
  };
  const initData = `user=${encodeURIComponent(JSON.stringify({
    id: mockId,
    first_name: user.firstName,
    last_name: user.lastName,
    username: user.username,
  }))}&auth_date=${user.authDate}&hash=${user.hash}`;
  return { user, initData };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<MeResponse | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        let rawData: string | null = null;

        // 1. Пробуем Telegram SDK
        try {
          const sdkModuleName = '@telegram-apps/sdk';
          const { retrieveLaunchParams } = await import(/* @vite-ignore */ sdkModuleName) as any;
          const lp = retrieveLaunchParams();
          if (lp?.initDataRaw && typeof lp.initDataRaw === 'string') {
            rawData = lp.initDataRaw;
          }
        } catch {}

        // 2. Fallback на localStorage
        if (!rawData) {
          rawData = localStorage.getItem('initDataRaw');
        }

        // 3. Fallback на моковые данные для локальной разработки
        if (!rawData) {
          const mock = getMockInitData();
          rawData = mock.initData;
          setUser(mock.user);
        } else {
          const parsed = parseInitData(rawData);
          if (parsed) setUser(parsed);
        }

        setInitDataRaw(rawData);
        localStorage.setItem('initDataRaw', rawData);

        // 4. Запрашиваем бэкенд — если недоступен, смотрим localStorage
        try {
          const me = await getMe(rawData);
          setBackendUser(me);
          setOnboarded(me.onboarded);
        } catch {
          setOnboarded(localStorage.getItem('snapmap_onboarded') === '1');
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const completeOnboarding = async (city: string) => {
    if (!initDataRaw) return;
    try {
      const result = await patchMe(initDataRaw, city);
      setBackendUser(prev => prev ? { ...prev, city: result.city, onboarded: true } : null);
    } catch {
      // бэкенд недоступен — сохраняем локально
    }
    setOnboarded(true);
    localStorage.setItem('snapmap_onboarded', '1');
  };

  const login = (userData: User, initData?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (initData) {
      setInitDataRaw(initData);
      localStorage.setItem('initDataRaw', initData);
    }
  };

  const logout = () => {
    setUser(null);
    setBackendUser(null);
    setOnboarded(false);
    setInitDataRaw(null);
    localStorage.removeItem('user');
    localStorage.removeItem('initDataRaw');
    localStorage.removeItem('snapmap_onboarded');
  };

  return (
    <AuthContext.Provider value={{
      user,
      backendUser,
      isAuthenticated: !!user,
      isLoading,
      onboarded,
      initDataRaw,
      completeOnboarding,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
