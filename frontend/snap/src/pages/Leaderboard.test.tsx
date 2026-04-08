import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Leaderboard from './Leaderboard';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, firstName: 'Иван', username: 'ivan' },
    logout: jest.fn(),
  }),
}));

(global as any).confirm = jest.fn(() => false);

describe('Leaderboard', () => {
  test('(+) сразу после render показывает "Загрузка..."', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  test('(+) после загрузки отображается имя лидера "Ник"', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Ник')).toBeInTheDocument();
    });
  });

  test('(+) после загрузки отображается currentUser "ты"', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('ты')).toBeInTheDocument();
    });
  });

  test('(+) отображаются кнопки "Глобальный" и "Местный"', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Глобальный')).toBeInTheDocument();
      expect(screen.getByText('Местный')).toBeInTheDocument();
    });
  });

  test('(+) кнопка "Глобальный" имеет класс active по умолчанию', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Глобальный').className).toMatch(/active/);
    });
  });

  test('(+) клик на "Местный" делает его активным', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Глобальный')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Местный'));
    await waitFor(() => {
      expect(screen.getByText('Местный').className).toMatch(/active/);
    });
  });

  test('(-) текущий пользователь с rank=100 отображается как "100+"', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('100+')).toBeInTheDocument();
    });
  });

  test('(-) список лидеров не виден до загрузки', () => {
    render(<Leaderboard />);
    expect(screen.queryByText('Ник')).toBeNull();
  });
});
