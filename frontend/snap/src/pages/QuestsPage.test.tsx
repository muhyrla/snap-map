import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestsPage from './QuestsPage';

describe('QuestsPage', () => {
  test('(+) по умолчанию активна вкладка Daily', () => {
    render(<QuestsPage />);
    const dailyBtn = screen.getByRole('button', { name: /daily/i });
    expect(dailyBtn.className).toMatch(/tab--active/);
  });

  test('(+) после загрузки отображаются daily-квесты', async () => {
    render(<QuestsPage />);
    await waitFor(() => {
      expect(screen.getByText(/свиристели/i)).toBeInTheDocument();
    });
  });

  test('(+) клик на Weekly → Weekly активен, отображаются weekly-квесты', async () => {
    render(<QuestsPage />);
    const weeklyBtn = screen.getByRole('button', { name: /weekly/i });
    fireEvent.click(weeklyBtn);
    expect(weeklyBtn.className).toMatch(/tab--active/);
    await waitFor(() => {
      expect(screen.getByText(/яркий алый цветок/i)).toBeInTheDocument();
    });
  });

  test('(+) клик на Special → отображаются special-квесты', async () => {
    render(<QuestsPage />);
    fireEvent.click(screen.getByRole('button', { name: /special/i }));
    await waitFor(() => {
      expect(screen.getByText(/скурагов гег/i)).toBeInTheDocument();
    });
  });

  test('(+) блок .timerbar присутствует в DOM', () => {
    const { container } = render(<QuestsPage />);
    expect(container.querySelector('.timerbar')).toBeInTheDocument();
  });

  test('(-) при активной Daily-вкладке special-квесты не видны', async () => {
    render(<QuestsPage />);
    await waitFor(() => {
      expect(screen.getByText(/свиристели/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/скурагов гег/i)).toBeNull();
  });

  test('(-) при переключении на Weekly daily-квест "знак пешеходного" не отображается', async () => {
    render(<QuestsPage />);
    fireEvent.click(screen.getByRole('button', { name: /weekly/i }));
    await waitFor(() => {
      expect(screen.getByText(/яркий алый цветок/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/знак пешеходного/i)).toBeNull();
  });
});
