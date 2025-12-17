import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Post } from '../components/Post';
<<<<<<< Updated upstream
=======
import { getFeed, FeedPost } from '../services/feedService';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    getFeed().then(setPosts);
  }, []);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        {FEED_MOCK.map(post => (
=======
        {posts.map(post => (
>>>>>>> Stashed changes
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
