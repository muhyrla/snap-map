type PostProps = { username: string; text?: string; imageUrl?: string };
export function Post({ username, text, imageUrl }: PostProps) {
  return (
    <section className="post section">
      <div className="row gap10">
        <div className="avatar">👤</div>
        <div className="name">{username}</div>
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