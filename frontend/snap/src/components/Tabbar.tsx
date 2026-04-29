import React from 'react';
import '../styles/_tabbar.scss';

type ScreenType = 'home' | 'quests' | 'leaderboard' | 'shop';

interface TabbarProps {
  screen?: ScreenType;
  setScreen?: (screen: ScreenType) => void;
  active?: ScreenType;
  onHome?: () => void;
}

const Tabbar: React.FC<TabbarProps> = ({ screen, setScreen, active, onHome }) => {
  // Поддержка обоих вариантов использования
  const currentScreen = screen ?? active;

  const handleHomeClick = () => {
    if (setScreen) {
      setScreen('home');
    } else if (onHome) {
      onHome();
    }
  };

  const handleQuestsClick = () => {
    if (setScreen) {
      setScreen('quests');
    }
  };

  const handleLeaderboardClick = () => {
    if (setScreen) {
      setScreen('leaderboard');
    }
  };

  const handleShopClick = () => {
    if (setScreen) {
      setScreen('shop');
    }
  };

  return (
    <div className="tabbar">
      <div className="tabbar-inner">
        <img
          src="/icons/fluent_home-24-filled.svg"
          alt="Home"
          className={`tab-icon ${currentScreen === 'home' ? 'active' : ''}`}
          onClick={handleHomeClick}
        />
        <img
          src="/icons/Vector.svg"
          alt="Leaderboard"
          className={`tab-icon ${currentScreen === 'leaderboard' ? 'active' : ''}`}
          onClick={handleLeaderboardClick}
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
          className={`tab-icon ${currentScreen === 'quests' ? 'active' : ''}`}
          onClick={handleQuestsClick}
        />
        <img
          src="/icons/solar_shop-bold.svg"
          alt="Shop"
          className={`tab-icon ${currentScreen === 'shop' ? 'active' : ''}`}
          onClick={handleShopClick}
        />
      </div>
    </div>
  );
};

export default Tabbar;
