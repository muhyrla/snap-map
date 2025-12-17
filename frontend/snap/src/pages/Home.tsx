import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Post } from '../components/Post';
import { getFeed, FeedPost } from '../services/feedService';
import '../styles/style.scss';

export default function Home() {
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    getFeed().then(setPosts);
  }, []);

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
        {posts.map(post => (
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
