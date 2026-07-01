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

// Мок разрешён только для локальной разработки: включается флагом
// REACT_APP_ALLOW_MOCK_AUTH=1 (в прод-сборке НЕ задаётся).
const MOCK_AUTH_ALLOWED = process.env.REACT_APP_ALLOW_MOCK_AUTH === '1';

// initData, у которого hash=mock_hash — это наш мок; настоящий Telegram
// такого не пришлёт. Нужно, чтобы залипший в localStorage мок не подменял
// реальные данные из Telegram.
const isMockInitData = (raw: string | null): boolean =>
  !!raw && /(?:^|&)hash=mock_hash(?:&|$)/.test(raw);

/**
 * Достаём настоящую initData из Telegram. Порядок:
 *   1) window.Telegram.WebApp.initData (классический webview-скрипт);
 *   2) tgWebAppData из URL-хэша — сюда Telegram кладёт launch-параметры;
 *   3) @telegram-apps/sdk retrieveLaunchParams() как запасной вариант.
 */
const getTelegramInitData = async (): Promise<string | null> => {
  // 1. Классический объект (если подключён telegram-web-app.js)
  const fromWebApp = (window as any)?.Telegram?.WebApp?.initData;
  if (typeof fromWebApp === 'string' && fromWebApp.length > 0) return fromWebApp;

  // 2. URL-хэш: #tgWebAppData=...
  try {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fromHash = new URLSearchParams(hash).get('tgWebAppData');
    if (fromHash && fromHash.length > 0) return fromHash;
  } catch {}

  // 3. SDK
  try {
    const sdkModuleName = '@telegram-apps/sdk';
    const { retrieveLaunchParams } = (await import(/* @vite-ignore */ sdkModuleName)) as any;
    const lp = retrieveLaunchParams();
    if (lp?.initDataRaw && typeof lp.initDataRaw === 'string') return lp.initDataRaw;
  } catch {}

  return null;
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
        // 1. Настоящая initData из Telegram (главный источник).
        let rawData: string | null = await getTelegramInitData();

        // 2. Fallback на localStorage — но НИКОГДА не подставляем залипший мок:
        //    он не должен переопределять реальные данные Telegram.
        if (!rawData) {
          const cached = localStorage.getItem('initDataRaw');
          if (cached && !isMockInitData(cached)) {
            rawData = cached;
          }
        }

        // 3. Мок — только для локальной разработки (по флагу), в проде отключён.
        if (!rawData) {
          if (MOCK_AUTH_ALLOWED) {
            const mock = getMockInitData();
            rawData = mock.initData;
            setUser(mock.user);
          } else {
            // Открыто вне Telegram и без валидной initData — не авторизуемся.
            setIsLoading(false);
            return;
          }
        } else {
          const parsed = parseInitData(rawData);
          if (parsed) setUser(parsed);
        }

        setInitDataRaw(rawData);
        // Кэшируем только настоящую initData, мок в localStorage не пишем.
        if (!isMockInitData(rawData)) {
          localStorage.setItem('initDataRaw', rawData);
        }

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
