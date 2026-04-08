type PostProps = { username: string; text?: string; imageUrl?: string; tag?: string };
export function Post({ username, text, imageUrl, tag }: PostProps) {
  return (
    <section className="post">
      <div className="post__header">
        <div className="row gap10">
          <div className="avatar">👤</div>
          <div className="name">{username}</div>
        </div>
        {tag && <button className="post__tag">{tag}</button>}
      </div>
      {text && <p className="small mt8">{text}</p>}
      {imageUrl && (
        <div className="photo mt8">
          <img src={imageUrl} alt="" />
        </div>
      )}
    </section>
  );
}