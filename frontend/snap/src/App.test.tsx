import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('./contexts/AuthContext', () => {
  const React = require('react');
  const mockUser = {
    id: 1,
    firstName: 'Иван',
    lastName: 'Иванов',
    username: 'ivan_user',
    photoUrl: '',
    authDate: 0,
    hash: 'hash',
  };

  const mockContextValue = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    initDataRaw: 'init',
    login: jest.fn(),
    logout: jest.fn(),
  };

  return {
    __esModule: true,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useAuth: () => mockContextValue,
  };
});

describe('App routing with mocked AuthContext', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('отображает домашний экран и кнопку перехода на Leaderboard', () => {
    render(<App />);

    expect(
      screen.getByRole('button', { name: /Открыть Leaderboard/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/some big text here/i)).toBeInTheDocument();
  });

  test('открывает Leaderboard по ручному переходу на /leaderboard', () => {
    window.history.pushState({}, '', '/leaderboard');

    render(<App />);

    expect(
      screen.getByText(/Двигайся к цели/i)
    ).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /назад/i });
    fireEvent.click(backButton);

    expect(screen.getByText(/some big text here/i)).toBeInTheDocument();
  });
});

