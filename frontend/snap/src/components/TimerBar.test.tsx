import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimerBar } from './TimerBar';

describe('TimerBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('рендерится для difficulty="daily"', () => {
    const { container } = render(<TimerBar difficulty="daily" />);
    expect(container.querySelector('.timerbar')).toBeInTheDocument();
  });

  test('рендерится для difficulty="weekly"', () => {
    const { container } = render(<TimerBar difficulty="weekly" />);
    expect(container.querySelector('.timerbar')).toBeInTheDocument();
  });

  test('рендерится для difficulty="special"', () => {
    const { container } = render(<TimerBar difficulty="special" />);
    expect(container.querySelector('.timerbar')).toBeInTheDocument();
  });

  test('в .timer отображается строка формата "Xд Xч Xм" (regex /\\d+д \\d+ч \\d+м/)', () => {
    render(<TimerBar difficulty="daily" />);
    const timer = screen.getByText(/\d+д \d+ч \d+м/);
    expect(timer).toBeInTheDocument();
  });
});
