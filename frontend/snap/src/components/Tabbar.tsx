type TabbarProps = {
    active?: 'home' | 'quests' | 'help' | 'shop';
    onHome?: () => void; onQuests?: () => void; onHelp?: () => void; onShop?: () => void;
  };
  export function Tabbar({ active = 'home', onHome, onQuests, onHelp, onShop }: TabbarProps) {
    return (
      <nav className="tabbar">
        <button className={`tabbar__btn ${active==='home'?'tabbar__btn--active':''}`} onClick={onHome}/>
        <button className={`tabbar__btn ${active==='quests'?'tabbar__btn--active':''}`} onClick={onQuests}/>
        <button className={`tabbar__btn ${active==='help'?'tabbar__btn--active':''}`} onClick={onHelp}/>
        <button className={`tabbar__btn ${active==='shop'?'tabbar__btn--active':''}`} onClick={onShop}/>
      </nav>
    );
  }