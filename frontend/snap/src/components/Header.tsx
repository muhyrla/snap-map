export function Header() {
  return (
    <header className="header">
      <div className="header__row">
        <img src="/icons/SnapMap.svg" alt="SnapMap logo" className="header__logo" />
        <div className="header__actions">
          <button className="header__btn" aria-label="notifications">
            <img src="/icons/notifications.svg" alt="" />
          </button>
          <button className="header__btn" aria-label="settings">
            <img src="/icons/settings.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="header__row">
        <div className="user-info">
          <div className="avatar" aria-hidden="true">
            <span className="avatar__icon">👤</span>
          </div>
          <div className="username">Пользователь</div>
        </div>
        <button className="money-button">стопитсот денег</button>
      </div>
    </header>
  );
}
