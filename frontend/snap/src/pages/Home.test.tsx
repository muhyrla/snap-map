import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './Home';

describe('Home', () => {
  test('(+) отображает элемент .header', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('.header')).toBeInTheDocument();
  });

  test('(+) отображает блок .feed', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('.feed')).toBeInTheDocument();
  });

  test('(+) после загрузки показывает посты', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getAllByText('Пользователь').length).toBeGreaterThan(0);
    });
  });

  test('(+) отображает текст "Заданий выполнено"', () => {
    render(<Home />);
    expect(screen.getByText('Заданий выполнено')).toBeInTheDocument();
  });

  test('(+) отображает текст "Daily счётчик"', () => {
    render(<Home />);
    expect(screen.getByText('Daily счётчик')).toBeInTheDocument();
  });

  test('(-) .feed существует, но изначально не содержит постов', () => {
    const { container } = render(<Home />);
    const feed = container.querySelector('.feed');
    expect(feed).toBeInTheDocument();
    // Promise.resolve не разрешается синхронно внутри act() — посты ещё не загружены
    expect(feed!.querySelectorAll('.post')).toHaveLength(0);
  });
});
