import React from 'react';
import { render, screen } from '@testing-library/react';
import { Post } from './Post';

describe('Post', () => {
  test('отображает username', () => {
    render(<Post username="Мария" />);
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });

  test('отображает text если передан', () => {
    render(<Post username="Иван" text="Привет, мир!" />);
    expect(screen.getByText('Привет, мир!')).toBeInTheDocument();
  });

  test('отображает img с src=imageUrl если imageUrl передан', () => {
    const { container } = render(
      <Post username="Иван" imageUrl="/images/photo.jpg" />
    );
    const img = container.querySelector('.photo.mt8 img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/images/photo.jpg');
  });

  test('отображает тег если tag передан', () => {
    render(<Post username="Иван" tag="#природа" />);
    expect(screen.getByText('#природа')).toBeInTheDocument();
  });

  test('не рендерит .small.mt8 если text не передан', () => {
    const { container } = render(<Post username="Иван" />);
    expect(container.querySelector('.small.mt8')).not.toBeInTheDocument();
  });

  test('не рендерит .photo если imageUrl не передан', () => {
    const { container } = render(<Post username="Иван" />);
    expect(container.querySelector('.photo')).not.toBeInTheDocument();
  });

  test('не рендерит .post__tag если tag не передан', () => {
    const { container } = render(<Post username="Иван" />);
    expect(container.querySelector('.post__tag')).not.toBeInTheDocument();
  });
});
