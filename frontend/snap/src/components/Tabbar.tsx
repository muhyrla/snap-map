import React from 'react';
import '../styles/_tabbar.scss';

interface TabbarProps {
  screen: 'home' | 'quests';
  setScreen: (screen: 'home' | 'quests') => void;
}

const Tabbar: React.FC<TabbarProps> = ({ screen, setScreen }) => {
  return (
    <div className="tabbar">
      <div className="tabbar-inner">
        <img
          src="/icons/fluent_home-24-filled.svg"
          alt="Home"
          className={`tab-icon ${screen === 'home' ? 'active' : ''}`}
          onClick={() => setScreen('home')}
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
          className={`tab-icon ${screen === 'quests' ? 'active' : ''}`}
          onClick={() => setScreen('quests')}
        />
        <img
          src="/icons/solar_shop-bold.svg"
          alt="Shop"
          className="tab-icon"
        />
      </div>
    </div>
  );
};

export default Tabbar;
