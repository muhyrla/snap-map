import React from 'react';
import '../styles/_tabbar.scss';

type LegacyScreen = 'home' | 'quests';
type ActiveScreen = 'home' | 'quests' | 'shop';

interface TabbarProps {
  // old API
  screen?: LegacyScreen;
  setScreen?: (screen: LegacyScreen) => void;
  // new API used in pages
  active?: ActiveScreen;
  onHome?: () => void;
}

export const Tabbar: React.FC<TabbarProps> = ({ screen, setScreen, active, onHome }) => {
  const current = active ?? screen ?? 'home';

  const goHome = () => {
    if (onHome) return onHome();
    if (setScreen) return setScreen('home');
  };

  const goQuests = () => {
    if (setScreen) return setScreen('quests');
  };

  return (
    <div className="tabbar">
      <div className="tabbar-inner">
        <img
          src="/icons/fluent_home-24-filled.svg"
          alt="Home"
          className={`tab-icon ${current === 'home' ? 'active' : ''}`}
          onClick={goHome}
        />
        <img
          src="/icons/Vector.svg"
          alt="Leaderboard"
          className="tab-icon"
        />
        <div className="camera-icon-wrapper">
          <img
            src="/icons/Frame 46-1.svg"
            alt="Camera"
            className="camera-icon"
          />
        </div>
        <img
          src="/icons/streamline-flex_multiple-stars-solid.svg"
          alt="Stars"
          className={`tab-icon ${current === 'quests' ? 'active' : ''}`}
          onClick={goQuests}
        />
        <img
          src="/icons/solar_shop-bold.svg"
          alt="Shop"
          className={`tab-icon ${current === 'shop' ? 'active' : ''}`}
        />
      </div>
    </div>
  );
};

export default Tabbar;
