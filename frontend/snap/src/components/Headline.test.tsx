import React from 'react';
import { render, screen } from '@testing-library/react';
import { Headline } from './Headline';

describe('Headline', () => {
  test('отображает title', () => {
    render(<Headline title="Заголовок" />);
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
  });

  test('отображает subtitle если передан', () => {
    render(<Headline title="Заголовок" subtitle="Подзаголовок" />);
    expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
  });

  test('title рендерится в теге h1', () => {
    render(<Headline title="Главный заголовок" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Главный заголовок');
  });

  test('не отображает .subtitle если subtitle не передан', () => {
    const { container } = render(<Headline title="Заголовок" />);
    expect(container.querySelector('.subtitle')).not.toBeInTheDocument();
  });
});
