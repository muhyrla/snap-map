type ShopItemProps = {
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  onBuy?: () => void;
};

export function ShopItem({ title, description, price, imageUrl, onBuy }: ShopItemProps) {
  return (
    <section className="shop-item">
      <div className="shop-item__content">
        <div className="shop-item__image">
          {imageUrl ? (
            <img src={imageUrl} alt={title} />
          ) : (
            <div className="shop-item__placeholder" />
          )}
        </div>
        <div className="shop-item__info">
          <h3 className="shop-item__title">{title}</h3>
          <p className="shop-item__description">{description}</p>
          <div className="shop-item__price-tag">{price}</div>
        </div>
      </div>
    </section>
  );
}

