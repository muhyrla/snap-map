interface HeaderProps {
  username?: string;
  balance?: string;
  onSettings?: () => void;
}

export function Header({ username, balance, onSettings }: HeaderProps = {}) {
  const displayUsername = username || 'Пользователь';
  const displayBalance = balance || 'стопитсот денег';

  return (
    <header className="header">
      <div className="header__row">
        <img src="/icons/SnapMap.svg" alt="SnapMap logo" className="header__logo" />
        <div className="header__actions">
          <button className="header__btn" aria-label="notifications">
            <img src="/icons/notifications.svg" alt="" />
          </button>
          <button className="header__btn" aria-label="settings" onClick={onSettings}>
            <img src="/icons/settings.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="header__row">
        <div className="user-info">
          <div className="avatar" aria-hidden="true">
            <span className="avatar__icon">👤</span>
          </div>
          <div className="username">{displayUsername}</div>
        </div>
        <button className="money-button">{displayBalance}</button>
      </div>
    </header>
  );
}
