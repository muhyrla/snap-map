import React from 'react';
import { useEffect, useState } from 'react';
import { Headline } from '../components/Headline';
import { useAuth } from '../contexts/AuthContext';
import '../styles/style.scss';
import '../styles/authorize.css';

export default function Authorize() {
  const { login, initDataRaw, isLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // helper to import modules at runtime without triggering TS to resolve their types
  const dynamicImport = async (name: string) => {
    // use eval to avoid static analysis of the import string
    // @ts-ignore
    // eslint-disable-next-line no-eval
    return await (0, eval)('import')(name);
  };

  // Проверяем, доступен ли Telegram SDK
  useEffect(() => {
    const checkTelegramSDK = async () => {
      try {
  const { retrieveLaunchParams } = await dynamicImport('@telegram-apps/sdk');
        const launchParams = retrieveLaunchParams();
        const rawData = launchParams?.initDataRaw;

        if (rawData && typeof rawData === 'string') {
          // Если есть initData от Telegram — парсим и входим автоматически
          try {
            const params = new URLSearchParams(rawData);
            const userParam = params.get('user');
            if (userParam) {
              const userData = JSON.parse(decodeURIComponent(userParam));
              const user = {
                id: userData.id,
                firstName: userData.first_name || 'Пользователь',
                lastName: userData.last_name || '',
                username: userData.username || '',
                photoUrl: userData.photo_url || '',
                authDate: parseInt(params.get('auth_date') || '0', 10),
                hash: params.get('hash') || '',
              };
              setDemoMode(false);
              // Выполняем вход через контекст
              login(user, rawData);
              return;
            }
          } catch (err) {
            // Если парсинг не удался — продолжим в демо-режиме
            console.warn('Не удалось распарсить initData от Telegram:', err);
          }
        }

        // Если SDK недоступен или нет данных — показываем демо-режим (пользователь может нажать кнопку)
        setDemoMode(true);
      } catch (error) {
        setDemoMode(true);
      }
    };
    checkTelegramSDK();
  }, [login]);

  // Ручная/демо авторизация через Telegram (используется если автоматический вход невозможен)
  const handleTelegramAuth = async () => {
    setIsProcessing(true);
    try {
      // Пытаемся использовать реальный Telegram SDK
      try {
  const { retrieveLaunchParams } = await dynamicImport('@telegram-apps/sdk');
        const launchParams = retrieveLaunchParams();
        const rawData = launchParams?.initDataRaw;

        // Проверяем, что rawData это строка
        if (rawData && typeof rawData === 'string') {
          // Парсим данные из Telegram
          const params = new URLSearchParams(rawData);
          const userParam = params.get('user');

          if (userParam) {
            const userData = JSON.parse(decodeURIComponent(userParam));
            const user = {
              id: userData.id,
              firstName: userData.first_name || 'Пользователь',
              lastName: userData.last_name || '',
              username: userData.username || '',
              photoUrl: userData.photo_url || '',
              authDate: parseInt(params.get('auth_date') || '0', 10),
              hash: params.get('hash') || '',
            };
            login(user, rawData);
            return;
          }
        }
      } catch (error) {
        console.log('Telegram SDK не доступен, используем демо-режим');
      }

      // Демо-режим: авторизация с фейковыми данными
      const mockUser = {
        id: Math.floor(Math.random() * 1000000) + 100000,
        firstName: 'Иван',
        lastName: 'Иванов',
        username: 'ivan_telegram',
        photoUrl: '',
        authDate: Math.floor(Date.now() / 1000),
        hash: 'mock_telegram_hash_' + Math.random().toString(36).substring(7),
      };

      // Создаем mock initData для демонстрации
      const mockInitData = `user=${encodeURIComponent(JSON.stringify({
        id: mockUser.id,
        first_name: mockUser.firstName,
        last_name: mockUser.lastName,
        username: mockUser.username,
      }))}&auth_date=${mockUser.authDate}&hash=${mockUser.hash}`;

      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 800));

      login(mockUser, mockInitData);
    } catch (error) {
      console.error('Ошибка авторизации через Telegram:', error);
      alert('Произошла ошибка при авторизации. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  

  // Ручная/демо авторизация через Telegram (используется если автоматический вход невозможен)

  if (isLoading) {
    return (
      <main className="screen authorize-screen">
        <div className="authorize-container">
          <div className="authorize-loading">
            <p>Загрузка...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="screen authorize-screen">
      <div className="authorize-container">
        <Headline
          title="Добро пожаловать"
          subtitle="Войдите, чтобы продолжить"
        />

        <div className="authorize-description">
          <p>Выберите способ входа в систему</p>
          {demoMode && (
            <p className="small" style={{ marginTop: '8px', color: '#999' }}>
              Демо-режим: используются тестовые данные
            </p>
          )}
          {initDataRaw && !demoMode && (
            <p className="small" style={{ marginTop: '8px', color: '#25d366' }}>
              ✓ Данные Telegram получены
            </p>
          )}
        </div>

        <div className="authorize-buttons">
          <button 
            className="authorize-btn authorize-btn--telegram"
            onClick={handleTelegramAuth}
            disabled={isProcessing}
          >
            <span className="authorize-btn__icon">📱</span>
            <span className="authorize-btn__text">
              {isProcessing ? 'Авторизация...' : 'Войти через Telegram'}
            </span>
          </button>
        </div>

        {initDataRaw && (
          <div className="authorize-debug" style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Debug info:</p>
            <p style={{ margin: '0', wordBreak: 'break-all', color: '#666' }}>
              initDataRaw: {initDataRaw.substring(0, 100)}...
            </p>
          </div>
        )}

        <div className="authorize-footer">
          <p className="small">Продолжая, вы соглашаетесь с условиями использования</p>
        </div>
      </div>
    </main>
  );
}

// Ensure this file is treated as a module under --isolatedModules
export {};
