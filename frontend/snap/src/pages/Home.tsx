import { Header } from '../components/Header';
import { Post } from '../components/Post';
import '../styles/style.scss';

const FEED_MOCK = [
  {
    id: '1',
    username: 'Пользователь',
    tag: 'Синий цветок',
    text: 'Описание пызыщдадывазд выывадываывыждадывадывыжыж адлыыжвал',
    imageUrl: '/posti/post1.jpeg',
  },
  {
    id: '2',
    username: 'Пользователь',
    tag: 'Красный цветок',
    text: 'Ещё один тестовый пост для ленты.',
    imageUrl: '/posti/post2.jpeg',
  },
];

export default function Home() {
  return (
    <main className="screen">
      <div className="screen-header-block">
        <Header />
        <div className="headline-container">
          <div className="counters">
              <div className="counter-item">
                  <div className="counter-text">Заданий выполнено</div>
                  <div className="counter-value">52</div>
              </div>
              <div className="counter-item">
                  <div className="counter-text">Daily счётчик</div>
                  <div className="counter-value">17</div>
              </div>
          </div>
        </div>
      </div>

      <div className="feed">
        {FEED_MOCK.map(post => (
          <Post
            key={post.id}
            username={post.username}
            text={post.text}
            imageUrl={post.imageUrl}
            tag={post.tag}
          />
        ))}
      </div>
    </main>
  );
}
