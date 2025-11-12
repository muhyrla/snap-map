import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Типы для данных пользователя
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
  isAuthenticated: boolean;
  isLoading: boolean;
  initDataRaw: string | null;
  login: (userData: User, initData?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Функция для парсинга initData из Telegram
const parseInitData = (initDataRaw: string): User | null => {
  try {
    const params = new URLSearchParams(initDataRaw);
    const userParam = params.get('user');
    
    if (!userParam) {
      return null;
    }

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
  } catch (error) {
    console.error('Error parsing initData:', error);
    return null;
  }
};

// Фейковые данные для демонстрации
const getMockUser = (): User => {
  return {
    id: 123456789,
    firstName: 'Иван',
    lastName: 'Иванов',
    username: 'ivan_user',
    photoUrl: '',
    authDate: Math.floor(Date.now() / 1000),
    hash: 'mock_hash_' + Math.random().toString(36).substring(7),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Пытаемся использовать реальный Telegram SDK
        let telegramInitData: string | null = null;
        
        try {
          // Динамический импорт, чтобы не ломать сборку, если пакет не установлен
          // use eval to avoid static analysis of the import string
          // @ts-ignore
          // eslint-disable-next-line no-eval
          const { retrieveLaunchParams } = await (0, eval)('import')('@telegram-apps/sdk');
          const launchParams = retrieveLaunchParams();
          const rawData = launchParams?.initDataRaw;
          
          // Проверяем, что rawData это строка
          if (rawData && typeof rawData === 'string') {
            telegramInitData = rawData;
            setInitDataRaw(telegramInitData);
          }
        } catch (error) {
          // Если пакет не установлен или ошибка, используем фейковые данные
          console.log('Telegram SDK не доступен, используем демо-режим');
        }

        // Если есть данные от Telegram, парсим их
        if (telegramInitData) {
          const parsedUser = parseInitData(telegramInitData);
          if (parsedUser) {
            setUser(parsedUser);
            // Сохраняем в localStorage для сохранения сессии
            localStorage.setItem('user', JSON.stringify(parsedUser));
            localStorage.setItem('initDataRaw', telegramInitData);
            setIsLoading(false);
            return;
          }
        }

        // Проверяем localStorage на наличие сохраненной сессии
        const savedUser = localStorage.getItem('user');
        const savedInitData = localStorage.getItem('initDataRaw');
        
        if (savedUser && savedInitData) {
          setUser(JSON.parse(savedUser));
          setInitDataRaw(savedInitData);
          setIsLoading(false);
          return;
        }

        // Демо-режим: автоматически авторизуем с фейковыми данными (автологин)
        // Это скрывает страницу авторизации и регистрирует пользователя в системе автоматически.
        const mockUser = getMockUser();
        const mockInitData = `user=${encodeURIComponent(JSON.stringify({
          id: mockUser.id,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          username: mockUser.username,
        }))}&auth_date=${mockUser.authDate}&hash=${mockUser.hash}`;
        setUser(mockUser);
        setInitDataRaw(mockInitData);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('initDataRaw', mockInitData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, initData?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (initData) {
      setInitDataRaw(initData);
      localStorage.setItem('initDataRaw', initData);
    } else if (initDataRaw) {
      localStorage.setItem('initDataRaw', initDataRaw);
    }
  };

  const logout = () => {
    setUser(null);
    setInitDataRaw(null);
    localStorage.removeItem('user');
    localStorage.removeItem('initDataRaw');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    initDataRaw,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

