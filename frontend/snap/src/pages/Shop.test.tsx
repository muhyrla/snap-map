import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Shop from './Shop';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, firstName: 'Иван', username: 'ivan' },
    logout: jest.fn(),
  }),
}));

(global as any).alert = jest.fn();
(global as any).confirm = jest.fn(() => true);

describe('Shop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('(+) сразу после render показывает "Загрузка..."', () => {
    render(<Shop />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  test('(+) после загрузки отображаются товары', async () => {
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i).length).toBeGreaterThan(0);
    });
  });

  test('(+) отображается ровно 4 товара', async () => {
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i)).toHaveLength(4);
    });
  });

  test('(+) клик на shop-item вызывает alert', async () => {
    const { container } = render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i).length).toBeGreaterThan(0);
    });
    const firstItem = container.querySelectorAll('.shop-item')[0] as HTMLElement;
    fireEvent.click(firstItem);
    await waitFor(() => {
      expect((global as any).alert).toHaveBeenCalled();
    });
  });

  test('(-) во время загрузки товары не отображаются', () => {
    render(<Shop />);
    expect(screen.queryByText(/стим ключ ура/i)).toBeNull();
  });
});
