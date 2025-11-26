import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header component', () => {
  test('отображает имя пользователя и баланс', () => {
    render(<Header username="Иван" balance="10.000$" />);

    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('10.000$')).toBeInTheDocument();
  });

  test('имеет кнопку настроек с aria-label', () => {
    render(<Header username="Пользователь" balance="0$" />);

    const settingsButton = screen.getByLabelText('settings');
    expect(settingsButton).toBeInTheDocument();
  });
});


