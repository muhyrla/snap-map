type HeaderProps = { username: string; balance: string; onSettings?: () => void };
export function Header({ username, balance, onSettings }: HeaderProps) {
  return (
    <section className="profile">
      <div className="avatar">👤</div>
      <div className="user">
        <div className="name">{username}</div>
        <div className="small">{balance}</div>
      </div>
      {/* Gear button intentionally has no action (no-op). Keep as non-focusable to avoid interaction. */}
      <button
        className="gear"
        aria-label="settings"
        onClick={() => { /* no-op */ }}
        tabIndex={-1}
        aria-hidden={true}
        type="button"
      >
        ⚙️
      </button>
    </section>
  );
}