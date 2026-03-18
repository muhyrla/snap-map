type ShopItemProps = {
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  onBuy?: () => void;
};

export function ShopItem({ title, description, price, imageUrl, onBuy }: ShopItemProps) {
  return (
    <section className="shop-item" onClick={onBuy}>
      <div className="shop-item__image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="shop-item__placeholder" />
        )}
        <div className="shop-item__badge">-50%</div>
      </div>
      <div className="shop-item__info">
        <h3 className="shop-item__title">{title}</h3>
        <p className="shop-item__price-tag">{price} snapcoin</p>
      </div>
    </section>
  );
}

