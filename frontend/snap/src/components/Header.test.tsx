import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  test('отображает переданные username и balance', () => {
    render(<Header username="Алексей" balance="1000" />);
    expect(screen.getByText('Алексей')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  test('кнопка settings имеет aria-label="settings"', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: 'settings' })).toBeInTheDocument();
  });

  test('кнопка notifications имеет aria-label="notifications"', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: 'notifications' })).toBeInTheDocument();
  });

  test('вызывает onSettings при клике на кнопку настроек', () => {
    const onSettings = jest.fn();
    render(<Header onSettings={onSettings} />);
    fireEvent.click(screen.getByRole('button', { name: 'settings' }));
    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  test('отображает логотип с alt="SnapMap logo"', () => {
    render(<Header />);
    expect(screen.getByAltText('SnapMap logo')).toBeInTheDocument();
  });

  test('использует username по умолчанию "Пользователь" если prop не передан', () => {
    render(<Header />);
    expect(screen.getByText('Пользователь')).toBeInTheDocument();
  });

  test('использует balance по умолчанию "стопитсот денег" если prop не передан', () => {
    render(<Header />);
    expect(screen.getByText('стопитсот денег')).toBeInTheDocument();
  });

  test('не бросает ошибку при клике на настройки без обработчика onSettings', () => {
    render(<Header />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'settings' }));
    }).not.toThrow();
  });
});
