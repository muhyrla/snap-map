type HeaderProps = { username: string; balance: string; onSettings?: () => void };
export function Header({ username, balance, onSettings }: HeaderProps) {
  return (
    <section className="profile">
      <div className="avatar">👤</div>
      <div className="user">
        <div className="name">{username}</div>
        <div className="small">{balance}</div>
      </div>
      <button className="gear" aria-label="settings" onClick={onSettings}>⚙️</button>
    </section>
  );
}