import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestsPage from './QuestsPage';

describe('QuestsPage', () => {
  test('по умолчанию активен DAILY и отображаются daily-квесты', () => {
    render(<QuestsPage />);

    const dailyTab = screen.getByRole('button', { name: /DAILY/i });
    expect(dailyTab.className).toMatch(/tab--active/);

    expect(screen.getByText(/свиристели/i)).toBeInTheDocument();
  });

  test('переключение вкладок меняет список квестов', () => {
    render(<QuestsPage />);

    const weeklyTab = screen.getByRole('button', { name: /WEEKLY/i });
    fireEvent.click(weeklyTab);

    expect(weeklyTab.className).toMatch(/tab--active/);
    expect(screen.getByText(/яркий алый цветок/i)).toBeInTheDocument();

    const specialTab = screen.getByRole('button', { name: /SPECIAL/i });
    fireEvent.click(specialTab);

    expect(specialTab.className).toMatch(/tab--active/);
    expect(screen.getByText(/скурагов гег/i)).toBeInTheDocument();
  });

  test('отображается таймер обновления заданий', () => {
    render(<QuestsPage />);

    expect(
      screen.getByText(/задания обновятся через/i)
    ).toBeInTheDocument();
  });
});


