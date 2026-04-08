import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabbar from './Tabbar';

describe('Tabbar', () => {
  test('рендерится без ошибок', () => {
    const { container } = render(<Tabbar screen="home" />);
    expect(container.querySelector('.tabbar')).toBeInTheDocument();
  });

  test('иконка Home имеет класс active когда screen="home"', () => {
    render(<Tabbar screen="home" />);
    const homeIcon = screen.getByAltText('Home');
    expect(homeIcon.className).toMatch(/active/);
  });

  test('иконка Leaderboard имеет класс active когда screen="leaderboard"', () => {
    render(<Tabbar screen="leaderboard" />);
    const leaderboardIcon = screen.getByAltText('Leaderboard');
    expect(leaderboardIcon.className).toMatch(/active/);
  });

  test('иконка Stars имеет класс active когда screen="quests"', () => {
    render(<Tabbar screen="quests" />);
    const starsIcon = screen.getByAltText('Stars');
    expect(starsIcon.className).toMatch(/active/);
  });

  test('иконка Shop имеет класс active когда screen="shop"', () => {
    render(<Tabbar screen="shop" />);
    const shopIcon = screen.getByAltText('Shop');
    expect(shopIcon.className).toMatch(/active/);
  });

  test('вызывает setScreen("home") при клике на Home', () => {
    const setScreen = jest.fn();
    render(<Tabbar screen="quests" setScreen={setScreen} />);
    fireEvent.click(screen.getByAltText('Home'));
    expect(setScreen).toHaveBeenCalledWith('home');
  });

  test('вызывает setScreen("quests") при клике на Stars', () => {
    const setScreen = jest.fn();
    render(<Tabbar screen="home" setScreen={setScreen} />);
    fireEvent.click(screen.getByAltText('Stars'));
    expect(setScreen).toHaveBeenCalledWith('quests');
  });

  test('вызывает setScreen("shop") при клике на Shop', () => {
    const setScreen = jest.fn();
    render(<Tabbar screen="home" setScreen={setScreen} />);
    fireEvent.click(screen.getByAltText('Shop'));
    expect(setScreen).toHaveBeenCalledWith('shop');
  });

  test('поддерживает проп active как альтернативу screen', () => {
    render(<Tabbar active="shop" />);
    const shopIcon = screen.getByAltText('Shop');
    expect(shopIcon.className).toMatch(/active/);
  });

  test('вызывает onHome при клике на Home если setScreen не передан', () => {
    const onHome = jest.fn();
    render(<Tabbar onHome={onHome} />);
    fireEvent.click(screen.getByAltText('Home'));
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  test('иконка Home НЕ имеет класс active когда screen="quests"', () => {
    render(<Tabbar screen="quests" />);
    const homeIcon = screen.getByAltText('Home');
    expect(homeIcon.className).not.toMatch(/active/);
  });

  test('рендерится без ошибок если ни один проп не передан', () => {
    expect(() => render(<Tabbar />)).not.toThrow();
  });
});
