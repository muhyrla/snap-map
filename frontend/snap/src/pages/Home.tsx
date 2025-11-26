import { Header } from '../components/Header';
import { Headline } from '../components/Headline';
import { Post } from '../components/Post';
import Tabbar from '../components/Tabbar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/style.scss';

export default function Home() {
  const { user, logout } = useAuth();
  
  const displayName = user 
    ? (user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Пользователь')
    : 'Пользователь';

  const handleSettings = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      logout();
    }
  };

  return (
    <main className="screen">
      <Header username={displayName} balance="10.000$" onSettings={handleSettings} />

      <Headline
        title="some big text here"
        subtitle="some small text here some small text here some small text here"
      />

      <section className="row gap10 mt10">
        <div className="card stat">
          <div className="small">заданий<br/>выполнено:</div>
          <div className="stat__value">70</div>
        </div>
        <div className="card stat">
          <div className="small">Daily<br/>счётчик:</div>
          <div className="stat__value">2</div>
        </div>
      </section>

      <div className="hr" />

      <Post
        username={displayName}
        text="сфоткал манула нейросеть ебанулась"
        imageUrl="https://images.unsplash.com/photo-1581888227599-779811939232?q=80&w=1080&auto=format&fit=crop"
      />
      <Post username="USERNAME" />
      <Post username={displayName} />

      <Tabbar active="home" />
    </main>
  );
}
