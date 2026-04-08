import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Quest } from './Quests';

describe('Quest', () => {
  test('отображает title и "+N snapcoin"', () => {
    render(<Quest title="Сделай фото" points={50} difficulty="daily" />);
    expect(screen.getByText('Сделай фото')).toBeInTheDocument();
    expect(screen.getByText('+50 snapcoin')).toBeInTheDocument();
  });

  test('кнопка имеет класс quest--daily для difficulty="daily"', () => {
    render(<Quest title="Задание" points={10} difficulty="daily" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/quest--daily/);
  });

  test('кнопка имеет класс quest--weekly для difficulty="weekly"', () => {
    render(<Quest title="Задание" points={10} difficulty="weekly" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/quest--weekly/);
  });

  test('кнопка имеет класс quest--special для difficulty="special"', () => {
    render(<Quest title="Задание" points={10} difficulty="special" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/quest--special/);
  });

  test('вызывает onClick при клике', () => {
    const onClick = jest.fn();
    render(<Quest title="Задание" points={10} difficulty="daily" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('не бросает ошибку при клике без обработчика onClick', () => {
    render(<Quest title="Задание" points={10} difficulty="daily" />);
    expect(() => {
      fireEvent.click(screen.getByRole('button'));
    }).not.toThrow();
  });
});
